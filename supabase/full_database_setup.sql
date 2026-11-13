-- ==============================================================================
-- SOMA-UG ACADEMIC: ONE-SHOT COMPLETE DATABASE INITIALIZATION SCRIPT
-- Run this entire file in the Supabase SQL Editor (or via psql) to provision:
--   1. Academic Taxonomy, Profiles, Roles, Lecturer Verification, Documents & Collections
--   2. Double-Entry Financial Ledger, Wallets, Orders, Entitlements, Payouts & Refunds
--   3. Granular Row Level Security (RLS) Policies & Ownership Guards
--   4. Atomic Wallet Purchase Stored Procedure (process_atomic_wallet_purchase)
--   5. Initial Chart of Accounts & Ugandan Universities Seed Data (MAK, KYU, MUST, UCU, MUBS)
-- ==============================================================================

BEGIN;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- PART 1: CORE ACADEMIC TAXONOMY & APPLICATION TABLES
-- ==============================================================================

CREATE TABLE IF NOT EXISTS institutions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    short_code TEXT NOT NULL UNIQUE,
    location TEXT NOT NULL,
    logo_url TEXT,
    is_verified BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS programmes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
    code TEXT NOT NULL,
    name TEXT NOT NULL,
    degree_level TEXT NOT NULL CHECK (degree_level IN ('certificate', 'diploma', 'bachelors', 'postgraduate', 'masters')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(institution_id, code)
);

CREATE TABLE IF NOT EXISTS courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    programme_id UUID NOT NULL REFERENCES programmes(id) ON DELETE CASCADE,
    institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
    code TEXT NOT NULL,
    name TEXT NOT NULL,
    year INT NOT NULL CHECK (year BETWEEN 1 AND 7),
    semester INT NOT NULL CHECK (semester IN (1, 2, 3)),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(institution_id, code)
);

CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    phone_number TEXT,
    avatar_url TEXT,
    institution_id UUID REFERENCES institutions(id) ON DELETE SET NULL,
    programme_id UUID REFERENCES programmes(id) ON DELETE SET NULL,
    academic_year INT,
    semester INT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('student', 'lecturer', 'admin', 'co_admin')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, role)
);

CREATE TABLE IF NOT EXISTS lecturer_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE RESTRICT,
    department TEXT NOT NULL,
    teaching_role TEXT NOT NULL,
    institutional_email TEXT,
    verification_evidence_url TEXT,
    verification_status TEXT NOT NULL DEFAULT 'submitted' CHECK (verification_status IN ('draft', 'submitted', 'under_review', 'approved', 'rejected', 'suspended')),
    rejection_reason TEXT,
    reviewed_by UUID REFERENCES auth.users(id),
    reviewed_at TIMESTAMPTZ,
    payout_mobile_number TEXT,
    payout_network TEXT CHECK (payout_network IN ('MTN', 'AIRTEL')),
    payout_account_name TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lecturer_id UUID NOT NULL REFERENCES lecturer_profiles(id) ON DELETE RESTRICT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE RESTRICT,
    programme_id UUID REFERENCES programmes(id) ON DELETE SET NULL,
    course_unit_id UUID NOT NULL REFERENCES courses(id) ON DELETE RESTRICT,
    document_type TEXT NOT NULL CHECK (document_type IN ('lecture_notes', 'study_guide', 'past_paper_solution', 'lab_manual', 'assignment_guide', 'curriculum_summary', 'textbook_supplement')),
    price_ugx INT NOT NULL CHECK (price_ugx >= 0),
    page_count INT NOT NULL CHECK (page_count > 0),
    file_size_bytes BIGINT NOT NULL CHECK (file_size_bytes > 0),
    current_version INT NOT NULL DEFAULT 1,
    status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'under_review', 'published', 'unpublished', 'archived', 'flagged', 'takedown')),
    topics JSONB DEFAULT '[]'::jsonb,
    allowed_preview_pages JSONB DEFAULT '[]'::jsonb,
    storage_key TEXT NOT NULL,
    checksum_sha256 TEXT NOT NULL,
    views_count INT DEFAULT 0,
    sales_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS document_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    version_number INT NOT NULL,
    change_summary TEXT NOT NULL,
    storage_key TEXT NOT NULL,
    page_count INT NOT NULL,
    file_size_bytes BIGINT NOT NULL,
    checksum_sha256 TEXT NOT NULL,
    is_current BOOLEAN DEFAULT TRUE,
    uploaded_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(document_id, version_number)
);

CREATE TABLE IF NOT EXISTS collections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lecturer_id UUID NOT NULL REFERENCES lecturer_profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE RESTRICT,
    course_unit_id UUID REFERENCES courses(id) ON DELETE SET NULL,
    is_published BOOLEAN DEFAULT TRUE,
    share_code TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS collection_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    collection_id UUID NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    position INT DEFAULT 0,
    added_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(collection_id, document_id)
);

CREATE TABLE IF NOT EXISTS reading_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    document_version INT NOT NULL DEFAULT 1,
    last_read_page INT NOT NULL DEFAULT 1,
    total_pages INT NOT NULL,
    completion_percent INT NOT NULL DEFAULT 0,
    last_read_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(student_id, document_id)
);

CREATE TABLE IF NOT EXISTS bookmarks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    page_number INT NOT NULL,
    title TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS personal_notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    page_number INT NOT NULL,
    highlight_coords JSONB,
    note_text TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- PART 2: DOUBLE-ENTRY FINANCIAL LEDGER & WALLETS
-- ==============================================================================

CREATE TABLE IF NOT EXISTS ledger_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('asset', 'liability', 'equity', 'revenue', 'expense')),
    currency TEXT NOT NULL DEFAULT 'UGX',
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS wallet_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    wallet_type TEXT NOT NULL CHECK (wallet_type IN ('student', 'lecturer')),
    currency TEXT NOT NULL DEFAULT 'UGX',
    ledger_account_id UUID REFERENCES ledger_accounts(id),
    spendable_balance_ugx BIGINT NOT NULL DEFAULT 0 CHECK (spendable_balance_ugx >= 0),
    reserved_balance_ugx BIGINT NOT NULL DEFAULT 0 CHECK (reserved_balance_ugx >= 0),
    pin_hash TEXT,
    pin_attempts INT DEFAULT 0,
    is_locked BOOLEAN DEFAULT FALSE,
    locked_until TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ledger_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reference TEXT NOT NULL UNIQUE,
    type TEXT NOT NULL CHECK (type IN ('deposit', 'purchase', 'lecturer_payout', 'student_withdrawal', 'refund', 'fee_adjustment')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'posted', 'failed', 'reversed')),
    description TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    posted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ledger_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_id UUID NOT NULL REFERENCES ledger_transactions(id) ON DELETE RESTRICT,
    account_id UUID NOT NULL REFERENCES ledger_accounts(id) ON DELETE RESTRICT,
    debit_ugx BIGINT NOT NULL DEFAULT 0 CHECK (debit_ugx >= 0),
    credit_ugx BIGINT NOT NULL DEFAULT 0 CHECK (credit_ugx >= 0),
    entry_sequence INT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT chk_debit_credit_valid CHECK (
        (debit_ugx > 0 AND credit_ugx = 0) OR
        (credit_ugx > 0 AND debit_ugx = 0)
    ),
    UNIQUE(transaction_id, entry_sequence)
);

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
    CONSTRAINT chk_order_split CHECK (gross_amount_ugx = platform_fee_ugx + lecturer_earnings_ugx)
);

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

CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by UUID REFERENCES auth.users(id)
);

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

-- ==============================================================================
-- PART 3: INDEXES & ROW LEVEL SECURITY (RLS)
-- ==============================================================================

CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status);
CREATE INDEX IF NOT EXISTS idx_documents_institution ON documents(institution_id);
CREATE INDEX IF NOT EXISTS idx_documents_course ON documents(course_unit_id);
CREATE INDEX IF NOT EXISTS idx_ledger_entries_tx ON ledger_entries(transaction_id);
CREATE INDEX IF NOT EXISTS idx_orders_student ON orders(student_id);
CREATE INDEX IF NOT EXISTS idx_entitlements_lookup ON entitlements(student_id, document_id);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE lecturer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE reading_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE personal_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE ledger_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE ledger_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE entitlements ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM user_roles
        WHERE user_roles.user_id = $1
        AND role IN ('admin', 'co_admin')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_approved_lecturer(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM lecturer_profiles
        WHERE lecturer_profiles.user_id = $1
        AND verification_status = 'approved'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP POLICY IF EXISTS "Users can read their own profile" ON profiles;
CREATE POLICY "Users can read their own profile"
    ON profiles FOR SELECT
    USING (auth.uid() = id OR is_admin(auth.uid()));

DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
CREATE POLICY "Users can update their own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

DROP POLICY IF EXISTS "Public can view published documents" ON documents;
CREATE POLICY "Public can view published documents"
    ON documents FOR SELECT
    USING (status = 'published' OR (auth.uid() IS NOT NULL AND lecturer_id IN (SELECT id FROM lecturer_profiles WHERE user_id = auth.uid())) OR is_admin(auth.uid()));

DROP POLICY IF EXISTS "Verified lecturers can insert documents" ON documents;
CREATE POLICY "Verified lecturers can insert documents"
    ON documents FOR INSERT
    WITH CHECK (
        is_approved_lecturer(auth.uid()) AND
        lecturer_id IN (SELECT id FROM lecturer_profiles WHERE user_id = auth.uid())
    );

DROP POLICY IF EXISTS "Users can view own wallet balance" ON wallet_accounts;
CREATE POLICY "Users can view own wallet balance"
    ON wallet_accounts FOR SELECT
    USING (auth.uid() = user_id OR is_admin(auth.uid()));

DROP POLICY IF EXISTS "Students view own orders" ON orders;
CREATE POLICY "Students view own orders"
    ON orders FOR SELECT
    USING (auth.uid() = student_id OR is_admin(auth.uid()));

DROP POLICY IF EXISTS "Students view own entitlements" ON entitlements;
CREATE POLICY "Students view own entitlements"
    ON entitlements FOR SELECT
    USING (auth.uid() = student_id OR is_admin(auth.uid()));

-- Atomic Wallet Purchase Stored Procedure
CREATE OR REPLACE FUNCTION process_atomic_wallet_purchase(
    p_student_id UUID,
    p_document_id UUID,
    p_idempotency_key TEXT,
    p_platform_fee_percent INT DEFAULT 15
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_existing_order orders%ROWTYPE;
    v_doc documents%ROWTYPE;
    v_lecturer lecturer_profiles%ROWTYPE;
    v_student_wallet wallet_accounts%ROWTYPE;
    v_lecturer_wallet wallet_accounts%ROWTYPE;
    v_gross_amount BIGINT;
    v_platform_fee BIGINT;
    v_lecturer_net BIGINT;
    v_tx_id UUID;
    v_order_id UUID;
    v_receipt_ref TEXT;
    v_order_num TEXT;
    v_student_ledger_acc_id UUID;
    v_lecturer_ledger_acc_id UUID;
    v_commission_ledger_acc_id UUID;
BEGIN
    SELECT * INTO v_existing_order
    FROM orders o
    JOIN ledger_transactions lt ON o.ledger_transaction_id = lt.id
    WHERE lt.reference = p_idempotency_key;

    IF FOUND THEN
        RETURN jsonb_build_object(
            'success', true,
            'status', 'already_processed',
            'order_id', v_existing_order.id,
            'order_number', v_existing_order.order_number,
            'receipt_reference', v_existing_order.receipt_reference
        );
    END IF;

    SELECT * INTO v_doc FROM documents WHERE id = p_document_id AND status = 'published' FOR SHARE;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'DOCUMENT_NOT_FOUND_OR_UNPUBLISHED');
    END IF;

    SELECT * INTO v_lecturer FROM lecturer_profiles WHERE id = v_doc.lecturer_id;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'LECTURER_NOT_FOUND');
    END IF;

    IF EXISTS (SELECT 1 FROM entitlements WHERE student_id = p_student_id AND document_id = p_document_id AND is_active = TRUE) THEN
        RETURN jsonb_build_object('success', false, 'error', 'ALREADY_ENTITLED');
    END IF;

    SELECT * INTO v_student_wallet FROM wallet_accounts WHERE user_id = p_student_id AND wallet_type = 'student' FOR UPDATE;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'STUDENT_WALLET_NOT_FOUND');
    END IF;

    v_gross_amount := v_doc.price_ugx;
    IF v_student_wallet.spendable_balance_ugx < v_gross_amount THEN
        RETURN jsonb_build_object('success', false, 'error', 'INSUFFICIENT_FUNDS');
    END IF;

    SELECT * INTO v_lecturer_wallet FROM wallet_accounts WHERE user_id = v_lecturer.user_id AND wallet_type = 'lecturer' FOR UPDATE;
    IF NOT FOUND THEN
        INSERT INTO wallet_accounts (user_id, wallet_type, currency, spendable_balance_ugx, reserved_balance_ugx)
        VALUES (v_lecturer.user_id, 'lecturer', 'UGX', 0, 0)
        RETURNING * INTO v_lecturer_wallet;
    END IF;

    v_platform_fee := (v_gross_amount * p_platform_fee_percent) / 100;
    v_lecturer_net := v_gross_amount - v_platform_fee;

    SELECT id INTO v_student_ledger_acc_id FROM ledger_accounts WHERE code = '2010-STUDENT-WALLETS';
    SELECT id INTO v_lecturer_ledger_acc_id FROM ledger_accounts WHERE code = '2020-LECTURER-PAYABLES';
    SELECT id INTO v_commission_ledger_acc_id FROM ledger_accounts WHERE code = '4010-COMMISSION-REVENUE';

    v_order_num := 'ORD-' || to_char(NOW(), 'YYYYMMDD') || '-' || upper(substring(gen_random_uuid()::text from 1 for 6));
    v_receipt_ref := 'REC-UGX-' || to_char(NOW(), 'YYYYMMDDHH24MISS') || '-' || upper(substring(gen_random_uuid()::text from 1 for 4));

    INSERT INTO ledger_transactions (reference, type, status, description, posted_at)
    VALUES (p_idempotency_key, 'purchase', 'posted', 'Purchase of document ' || v_doc.title, NOW())
    RETURNING id INTO v_tx_id;

    INSERT INTO ledger_entries (transaction_id, account_id, debit_ugx, credit_ugx, entry_sequence)
    VALUES
        (v_tx_id, v_student_ledger_acc_id, v_gross_amount, 0, 1),
        (v_tx_id, v_lecturer_ledger_acc_id, 0, v_lecturer_net, 2),
        (v_tx_id, v_commission_ledger_acc_id, 0, v_platform_fee, 3);

    UPDATE wallet_accounts SET spendable_balance_ugx = spendable_balance_ugx - v_gross_amount, updated_at = NOW() WHERE id = v_student_wallet.id;
    UPDATE wallet_accounts SET spendable_balance_ugx = spendable_balance_ugx + v_lecturer_net, updated_at = NOW() WHERE id = v_lecturer_wallet.id;

    INSERT INTO orders (order_number, student_id, document_id, document_version, gross_amount_ugx, platform_fee_ugx, platform_fee_percent, lecturer_earnings_ugx, status, ledger_transaction_id, receipt_reference)
    VALUES (v_order_num, p_student_id, p_document_id, v_doc.current_version, v_gross_amount, v_platform_fee, p_platform_fee_percent, v_lecturer_net, 'completed', v_tx_id, v_receipt_ref)
    RETURNING id INTO v_order_id;

    INSERT INTO entitlements (student_id, document_id, document_version, order_id, is_active)
    VALUES (p_student_id, p_document_id, v_doc.current_version, v_order_id, TRUE);

    INSERT INTO lecturer_earnings (lecturer_id, order_id, gross_amount_ugx, net_earnings_ugx, platform_fee_ugx, status)
    VALUES (v_lecturer.id, v_order_id, v_gross_amount, v_lecturer_net, v_platform_fee, 'available');

    UPDATE documents SET sales_count = sales_count + 1 WHERE id = p_document_id;

    RETURN jsonb_build_object(
        'success', true,
        'order_id', v_order_id,
        'order_number', v_order_num,
        'receipt_reference', v_receipt_ref,
        'gross_amount_ugx', v_gross_amount
    );
END;
$$;

-- ==============================================================================
-- PART 4: SEED DATA (CHART OF ACCOUNTS & UGANDAN UNIVERSITIES)
-- ==============================================================================

INSERT INTO ledger_accounts (code, name, type, currency, description) VALUES
('1010-CLEARING-MTN', 'MTN Mobile Money Clearing Account', 'asset', 'UGX', 'Cash held at MTN escrow awaiting settlement'),
('1020-CLEARING-AIRTEL', 'Airtel Money Clearing Account', 'asset', 'UGX', 'Cash held at Airtel escrow awaiting settlement'),
('2010-STUDENT-WALLETS', 'Student Wallet Liabilities', 'liability', 'UGX', 'Customer balances held on platform deposit'),
('2020-LECTURER-PAYABLES', 'Lecturer Earnings Payables', 'liability', 'UGX', 'Net earnings owed to lecturers awaiting weekly payout'),
('2030-PAYOUT-RESERVES', 'Payout Reserved Obligations', 'liability', 'UGX', 'Funds locked during batch payout processing'),
('4010-COMMISSION-REVENUE', 'Platform Commission Revenue', 'revenue', 'UGX', 'Marketplace platform transaction fee revenue'),
('5010-GATEWAY-FEES', 'Mobile Money Gateway Expenses', 'expense', 'UGX', 'Telecom provider transaction costs')
ON CONFLICT (code) DO NOTHING;

INSERT INTO institutions (id, name, short_code, location, is_verified) VALUES
('11111111-1111-1111-1111-111111111111', 'Makerere University', 'MAK', 'Makerere Hill, Kampala', true),
('22222222-2222-2222-2222-222222222222', 'Kyambogo University', 'KYU', 'Banda, Kampala', true),
('33333333-3333-3333-3333-333333333333', 'Mbarara University of Science and Technology', 'MUST', 'Mbarara City', true),
('44444444-4444-4444-4444-444444444444', 'Uganda Christian University', 'UCU', 'Mukono', true),
('55555555-5555-5555-5555-555555555555', 'Makerere University Business School', 'MUBS', 'Nakawa, Kampala', true)
ON CONFLICT (short_code) DO NOTHING;

INSERT INTO programmes (id, institution_id, code, name, degree_level) VALUES
('aaaa1111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'BSSE', 'Bachelor of Science in Software Engineering', 'bachelors'),
('aaaa2222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'BCS', 'Bachelor of Computer Science', 'bachelors'),
('aaaa3333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'LLB', 'Bachelor of Laws', 'bachelors'),
('aaaa4444-4444-4444-4444-444444444444', '55555555-5555-5555-5555-555555555555', 'BBA', 'Bachelor of Business Administration', 'bachelors'),
('aaaa5555-5555-5555-5555-555555555555', '22222222-2222-2222-2222-222222222222', 'BENG', 'Bachelor of Engineering in Civil & Building', 'bachelors')
ON CONFLICT DO NOTHING;

INSERT INTO courses (id, programme_id, institution_id, code, name, year, semester) VALUES
('c0001111-1111-1111-1111-111111111111', 'aaaa1111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'CSC 2101', 'Data Structures and Algorithms', 2, 1),
('c0002222-2222-2222-2222-222222222222', 'aaaa1111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'BSSE 1204', 'Object-Oriented Programming with Java', 1, 2),
('c0003333-3333-3333-3333-333333333333', 'aaaa3333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'LAW 2105', 'Constitutional Law of Uganda', 2, 1),
('c0004444-4444-4444-4444-444444444444', 'aaaa4444-4444-4444-4444-444444444444', '55555555-5555-5555-5555-555555555555', 'ACC 1102', 'Principles of Financial Accounting', 1, 1),
('c0005555-5555-5555-5555-555555555555', 'aaaa2222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'MTH 1101', 'Calculus I for Computing Sciences', 1, 1)
ON CONFLICT DO NOTHING;

INSERT INTO settings (key, value, description) VALUES
('commission_policy', '{"platform_percent": 15, "lecturer_percent": 85, "min_price_ugx": 500, "max_price_ugx": 100000}', 'Commission policy settings'),
('payout_schedule', '{"frequency": "weekly", "payout_day": "Friday", "min_payout_ugx": 10000}', 'Lecturer consolidated payout configuration'),
('preview_policy', '{"max_preview_percentage": 20, "short_doc_pages": 5, "default_max_pages": 5}', 'PDF document preview security limits')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

COMMIT;

