-- ==============================================================================
-- 20261106000004_atomic_purchase_function.sql
-- Atomic Document Purchase Stored Procedure with Double-Entry Ledger Posting
-- ==============================================================================

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
    -- 1. Idempotency Check: Check if an order already exists with this idempotency transaction reference
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
            'receipt_reference', v_existing_order.receipt_reference,
            'message', 'Transaction already completed previously'
        );
    END IF;

    -- 2. Verify Document exists, is published, and lock document record for consistent pricing
    SELECT * INTO v_doc
    FROM documents
    WHERE id = p_document_id AND status = 'published'
    FOR SHARE;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'DOCUMENT_NOT_FOUND_OR_UNPUBLISHED');
    END IF;

    -- 3. Verify Lecturer exists
    SELECT * INTO v_lecturer
    FROM lecturer_profiles
    WHERE id = v_doc.lecturer_id;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'LECTURER_NOT_FOUND');
    END IF;

    -- 4. Check if student already holds active entitlement
    IF EXISTS (SELECT 1 FROM entitlements WHERE student_id = p_student_id AND document_id = p_document_id AND is_active = TRUE) THEN
        RETURN jsonb_build_object('success', false, 'error', 'ALREADY_ENTITLED');
    END IF;

    -- 5. Lock Student Wallet FOR UPDATE to prevent race conditions & overspending
    SELECT * INTO v_student_wallet
    FROM wallet_accounts
    WHERE user_id = p_student_id AND wallet_type = 'student'
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'STUDENT_WALLET_NOT_FOUND');
    END IF;

    IF v_student_wallet.is_locked THEN
        RETURN jsonb_build_object('success', false, 'error', 'WALLET_LOCKED');
    END IF;

    v_gross_amount := v_doc.price_ugx;

    -- 6. Check Insufficient Funds
    IF v_student_wallet.spendable_balance_ugx < v_gross_amount THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'INSUFFICIENT_FUNDS',
            'required_ugx', v_gross_amount,
            'available_ugx', v_student_wallet.spendable_balance_ugx
        );
    END IF;

    -- 7. Ensure Lecturer Wallet exists and lock FOR UPDATE
    SELECT * INTO v_lecturer_wallet
    FROM wallet_accounts
    WHERE user_id = v_lecturer.user_id AND wallet_type = 'lecturer'
    FOR UPDATE;

    IF NOT FOUND THEN
        INSERT INTO wallet_accounts (user_id, wallet_type, currency, spendable_balance_ugx, reserved_balance_ugx)
        VALUES (v_lecturer.user_id, 'lecturer', 'UGX', 0, 0)
        RETURNING * INTO v_lecturer_wallet;
    END IF;

    -- 8. Calculate Financial Split (Exact integer arithmetic in UGX)
    v_platform_fee := (v_gross_amount * p_platform_fee_percent) / 100;
    v_lecturer_net := v_gross_amount - v_platform_fee;

    -- 9. Fetch Chart of Accounts IDs
    SELECT id INTO v_student_ledger_acc_id FROM ledger_accounts WHERE code = '2010-STUDENT-WALLETS';
    SELECT id INTO v_lecturer_ledger_acc_id FROM ledger_accounts WHERE code = '2020-LECTURER-PAYABLES';
    SELECT id INTO v_commission_ledger_acc_id FROM ledger_accounts WHERE code = '4010-COMMISSION-REVENUE';

    -- Generate Unique References
    v_order_num := 'ORD-' || to_char(NOW(), 'YYYYMMDD') || '-' || upper(substring(gen_random_uuid()::text from 1 for 6));
    v_receipt_ref := 'REC-UGX-' || to_char(NOW(), 'YYYYMMDDHH24MISS') || '-' || upper(substring(gen_random_uuid()::text from 1 for 4));

    -- 10. Insert Ledger Transaction Header
    INSERT INTO ledger_transactions (reference, type, status, description, metadata, posted_at)
    VALUES (
        p_idempotency_key,
        'purchase',
        'posted',
        'Purchase of document ' || v_doc.title || ' by student ' || p_student_id,
        jsonb_build_object('document_id', p_document_id, 'student_id', p_student_id, 'order_number', v_order_num),
        NOW()
    )
    RETURNING id INTO v_tx_id;

    -- 11. Post Balanced Double-Entry Ledger Entries
    -- Debit Student Liability Account (reduces student wallet liability by gross amount)
    INSERT INTO ledger_entries (transaction_id, account_id, debit_ugx, credit_ugx, entry_sequence)
    VALUES (v_tx_id, v_student_ledger_acc_id, v_gross_amount, 0, 1);

    -- Credit Lecturer Payable Account (increases lecturer balance by net earnings)
    INSERT INTO ledger_entries (transaction_id, account_id, debit_ugx, credit_ugx, entry_sequence)
    VALUES (v_tx_id, v_lecturer_ledger_acc_id, 0, v_lecturer_net, 2);

    -- Credit Platform Commission Revenue (increases platform earnings by commission)
    INSERT INTO ledger_entries (transaction_id, account_id, debit_ugx, credit_ugx, entry_sequence)
    VALUES (v_tx_id, v_commission_ledger_acc_id, 0, v_platform_fee, 3);

    -- 12. Update Wallet Account Balances (Transactional Projections)
    UPDATE wallet_accounts
    SET spendable_balance_ugx = spendable_balance_ugx - v_gross_amount,
        updated_at = NOW()
    WHERE id = v_student_wallet.id;

    UPDATE wallet_accounts
    SET spendable_balance_ugx = spendable_balance_ugx + v_lecturer_net,
        updated_at = NOW()
    WHERE id = v_lecturer_wallet.id;

    -- 13. Create Order
    INSERT INTO orders (
        order_number, student_id, document_id, document_version,
        gross_amount_ugx, platform_fee_ugx, platform_fee_percent, lecturer_earnings_ugx,
        status, ledger_transaction_id, receipt_reference
    )
    VALUES (
        v_order_num, p_student_id, p_document_id, v_doc.current_version,
        v_gross_amount, v_platform_fee, p_platform_fee_percent, v_lecturer_net,
        'completed', v_tx_id, v_receipt_ref
    )
    RETURNING id INTO v_order_id;

    -- 14. Create Entitlement
    INSERT INTO entitlements (student_id, document_id, document_version, order_id, is_active)
    VALUES (p_student_id, p_document_id, v_doc.current_version, v_order_id, TRUE);

    -- 15. Record Lecturer Earning Record
    INSERT INTO lecturer_earnings (lecturer_id, order_id, gross_amount_ugx, net_earnings_ugx, platform_fee_ugx, status)
    VALUES (v_lecturer.id, v_order_id, v_gross_amount, v_lecturer_net, v_platform_fee, 'available');

    -- 16. Increment document sales count
    UPDATE documents SET sales_count = sales_count + 1 WHERE id = p_document_id;

    -- Commit is handled automatically at end of function block in PostgreSQL
    RETURN jsonb_build_object(
        'success', true,
        'order_id', v_order_id,
        'order_number', v_order_num,
        'receipt_reference', v_receipt_ref,
        'gross_amount_ugx', v_gross_amount,
        'lecturer_net_ugx', v_lecturer_net,
        'platform_fee_ugx', v_platform_fee,
        'new_student_balance_ugx', (v_student_wallet.spendable_balance_ugx - v_gross_amount)
    );
END;
$$;

