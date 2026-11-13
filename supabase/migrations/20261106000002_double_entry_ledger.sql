-- ==============================================================================
-- 20261106000002_double_entry_ledger.sql
-- Financial Core: Immutable Double-Entry Ledger, Wallets, Orders, Entitlements & Payouts
-- ==============================================================================

-- 1. LEDGER ACCOUNTS (Chart of Accounts)
CREATE TABLE IF NOT EXISTS ledger_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT NOT NULL UNIQUE, -- e.g. '1010-CLEARING-MTN', '1020-CLEARING-AIRTEL', '2010-STUDENT-WALLETS', '2020-LECTURER-PAYABLES', '4010-COMMISSION-REVENUE'
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('asset', 'liability', 'equity', 'revenue', 'expense')),
    currency TEXT NOT NULL DEFAULT 'UGX',
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. WALLET ACCOUNTS (Student & Lecturer projection with spendable & reserved balances)
CREATE TABLE IF NOT EXISTS wallet_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    wallet_type TEXT NOT NULL CHECK (wallet_type IN ('student', 'lecturer')),
    currency TEXT NOT NULL DEFAULT 'UGX',
    ledger_account_id UUID REFERENCES ledger_accounts(id),
    spendable_balance_ugx BIGINT NOT NULL DEFAULT 0 CHECK (spendable_balance_ugx >= 0),
    reserved_balance_ugx BIGINT NOT NULL DEFAULT 0 CHECK (reserved_balance_ugx >= 0),
    pin_hash TEXT, -- Salted hash for transaction authentication
    pin_attempts INT DEFAULT 0,
    is_locked BOOLEAN DEFAULT FALSE,
    locked_until TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. LEDGER TRANSACTIONS (Transaction Header)
CREATE TABLE IF NOT EXISTS ledger_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reference TEXT NOT NULL UNIQUE, -- Idempotency key (e.g. TX-PUR-20261106-XYZ)
    type TEXT NOT NULL CHECK (type IN ('deposit', 'purchase', 'lecturer_payout', 'student_withdrawal', 'refund', 'fee_adjustment')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'posted', 'failed', 'reversed')),
    description TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    posted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. LEDGER ENTRIES (Double-entry line items: Debits and Credits)
CREATE TABLE IF NOT EXISTS ledger_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_id UUID NOT NULL REFERENCES ledger_transactions(id) ON DELETE RESTRICT,
    account_id UUID NOT NULL REFERENCES ledger_accounts(id) ON DELETE RESTRICT,
    debit_ugx BIGINT NOT NULL DEFAULT 0 CHECK (debit_ugx >= 0),
    credit_ugx BIGINT NOT NULL DEFAULT 0 CHECK (credit_ugx >= 0),
    entry_sequence INT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    -- Either debit or credit must be positive, not both 0 and not both positive
    CONSTRAINT chk_debit_credit_valid CHECK (
        (debit_ugx > 0 AND credit_ugx = 0) OR
        (credit_ugx > 0 AND debit_ugx = 0)
    ),
    UNIQUE(transaction_id, entry_sequence)
);

-- 5. DEPOSIT ATTEMPTS (Mobile Money Inflows)
CREATE TABLE IF NOT EXISTS deposit_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    reference TEXT NOT NULL UNIQUE,
    phone_number TEXT NOT NULL,
    provider TEXT NOT NULL CHECK (provider IN ('MTN', 'AIRTEL')),
    amount_ugx BIGINT NOT NULL CHECK (amount_ugx > 0),
    status TEXT NOT NULL DEFAULT 'initiated' CHECK (status IN ('initiated', 'pending_authorization', 'completed', 'failed', 'expired')),
    provider_transaction_id TEXT,
    failure_reason TEXT,
    ledger_transaction_id UUID REFERENCES ledger_transactions(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- 6. ORDERS (Document Purchases)
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number TEXT NOT NULL UNIQUE,
    student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE RESTRICT,
    document_version INT NOT NULL,
    gross_amount_ugx BIGINT NOT NULL CHECK (gross_amount_ugx >= 0),
    platform_fee_ugx BIGINT NOT NULL CHECK (platform_fee_ugx >= 0),
    platform_fee_percent INT NOT NULL CHECK (platform_fee_percent BETWEEN 0 AND 100),
    lecturer_earnings_ugx BIGINT NOT NULL CHECK (lecturer_earnings_ugx >= 0),
    status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'refunded', 'failed')),
    ledger_transaction_id UUID NOT NULL REFERENCES ledger_transactions(id) ON DELETE RESTRICT,
    receipt_reference TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    -- Integrity check: gross must equal platform_fee + lecturer_earnings
    CONSTRAINT chk_order_split CHECK (gross_amount_ugx = platform_fee_ugx + lecturer_earnings_ugx)
);

-- 7. ENTITLEMENTS (Verified Access Rights)
CREATE TABLE IF NOT EXISTS entitlements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE RESTRICT,
    document_version INT NOT NULL,
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE RESTRICT,
    granted_at TIMESTAMPTZ DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE,
    revocation_reason TEXT,
    UNIQUE(student_id, document_id)
);

-- 8. LECTURER EARNINGS (Aggregated & Traceable sales items)
CREATE TABLE IF NOT EXISTS lecturer_earnings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lecturer_id UUID NOT NULL REFERENCES lecturer_profiles(id) ON DELETE RESTRICT,
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE RESTRICT,
    gross_amount_ugx BIGINT NOT NULL,
    net_earnings_ugx BIGINT NOT NULL,
    platform_fee_ugx BIGINT NOT NULL,
    status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'reserved_for_payout', 'paid_out', 'reversed')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. PAYOUT BATCHES & ITEMS (Consolidated Weekly Disbursements)
CREATE TABLE IF NOT EXISTS payout_batches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    batch_reference TEXT NOT NULL UNIQUE,
    scheduled_date DATE NOT NULL,
    total_amount_ugx BIGINT NOT NULL DEFAULT 0,
    total_lecturers INT NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'processing', 'completed', 'partially_failed', 'reconciled')),
    executed_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS payout_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    batch_id UUID REFERENCES payout_batches(id) ON DELETE SET NULL,
    lecturer_id UUID NOT NULL REFERENCES lecturer_profiles(id) ON DELETE RESTRICT,
    payout_reference TEXT NOT NULL UNIQUE,
    destination_phone TEXT NOT NULL,
    destination_network TEXT NOT NULL CHECK (destination_network IN ('MTN', 'AIRTEL')),
    amount_ugx BIGINT NOT NULL CHECK (amount_ugx > 0),
    fee_ugx BIGINT NOT NULL DEFAULT 0,
    net_payout_ugx BIGINT NOT NULL CHECK (net_payout_ugx > 0),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'paid', 'failed', 'reversed')),
    provider_transaction_id TEXT,
    failure_reason TEXT,
    ledger_transaction_id UUID REFERENCES ledger_transactions(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    paid_at TIMESTAMPTZ
);

-- 10. REFUNDS
CREATE TABLE IF NOT EXISTS refunds (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE RESTRICT,
    student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
    lecturer_id UUID NOT NULL REFERENCES lecturer_profiles(id) ON DELETE RESTRICT,
    amount_ugx BIGINT NOT NULL CHECK (amount_ugx > 0),
    reason TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'requested' CHECK (status IN ('requested', 'approved', 'completed', 'rejected')),
    reviewed_by UUID REFERENCES auth.users(id),
    compensating_transaction_id UUID REFERENCES ledger_transactions(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ
);

-- 11. PROVIDER WEBHOOK EVENTS (Audit & Replay Protection)
CREATE TABLE IF NOT EXISTS provider_webhook_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider TEXT NOT NULL CHECK (provider IN ('MTN', 'AIRTEL')),
    event_id TEXT NOT NULL,
    payload JSONB NOT NULL,
    signature TEXT,
    processed BOOLEAN DEFAULT FALSE,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(provider, event_id)
);

-- 12. PLATFORM SETTINGS
CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by UUID REFERENCES auth.users(id)
);

-- 13. ADMIN AUDIT LOGS
CREATE TABLE IF NOT EXISTS admin_audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
    action TEXT NOT NULL,
    target_type TEXT NOT NULL,
    target_id TEXT NOT NULL,
    changes JSONB,
    ip_address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Performance & Uniqueness Indexes
CREATE INDEX IF NOT EXISTS idx_ledger_entries_tx ON ledger_entries(transaction_id);
CREATE INDEX IF NOT EXISTS idx_orders_student ON orders(student_id);
CREATE INDEX IF NOT EXISTS idx_orders_document ON orders(document_id);
CREATE INDEX IF NOT EXISTS idx_entitlements_lookup ON entitlements(student_id, document_id);
CREATE INDEX IF NOT EXISTS idx_payout_items_lecturer ON payout_items(lecturer_id);

