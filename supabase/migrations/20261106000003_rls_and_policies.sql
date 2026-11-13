-- ==============================================================================
-- 20261106000003_rls_and_policies.sql
-- Row Level Security (RLS) & Granular Permission Boundaries
-- ==============================================================================

-- Enable RLS on all sensitive tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE lecturer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE reading_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE personal_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE ledger_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE ledger_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ledger_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE deposit_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE entitlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE lecturer_earnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE payout_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE payout_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE refunds ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper function: Is caller an active Administrator?
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

-- Helper function: Is caller an approved Lecturer?
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

-- 1. PROFILES POLICIES
CREATE POLICY "Users can read their own profile"
    ON profiles FOR SELECT
    USING (auth.uid() = id OR is_admin(auth.uid()));

CREATE POLICY "Users can update their own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

-- 2. USER ROLES POLICIES (Read-only for self, Admin can manage)
CREATE POLICY "Users can read their own role"
    ON user_roles FOR SELECT
    USING (auth.uid() = user_id OR is_admin(auth.uid()));

-- 3. LECTURER PROFILES
CREATE POLICY "Public can view approved lecturer public card"
    ON lecturer_profiles FOR SELECT
    USING (verification_status = 'approved' OR auth.uid() = user_id OR is_admin(auth.uid()));

CREATE POLICY "Lecturer can manage own application draft"
    ON lecturer_profiles FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Lecturer can update own profile details"
    ON lecturer_profiles FOR UPDATE
    USING (auth.uid() = user_id OR is_admin(auth.uid()));

-- 4. DOCUMENTS POLICIES
-- Anyone can view published documents metadata
CREATE POLICY "Public can view published documents"
    ON documents FOR SELECT
    USING (status = 'published' OR (auth.uid() IS NOT NULL AND lecturer_id IN (SELECT id FROM lecturer_profiles WHERE user_id = auth.uid())) OR is_admin(auth.uid()));

-- Only verified lecturers can insert documents
CREATE POLICY "Verified lecturers can insert documents"
    ON documents FOR INSERT
    WITH CHECK (
        is_approved_lecturer(auth.uid()) AND
        lecturer_id IN (SELECT id FROM lecturer_profiles WHERE user_id = auth.uid())
    );

-- Only owner lecturer can update their document
CREATE POLICY "Lecturer owner can update document"
    ON documents FOR UPDATE
    USING (
        lecturer_id IN (SELECT id FROM lecturer_profiles WHERE user_id = auth.uid()) OR is_admin(auth.uid())
    );

-- 5. COLLECTIONS POLICIES
CREATE POLICY "Public can view published collections"
    ON collections FOR SELECT
    USING (is_published = TRUE OR lecturer_id IN (SELECT id FROM lecturer_profiles WHERE user_id = auth.uid()) OR is_admin(auth.uid()));

CREATE POLICY "Approved lecturers can insert collections"
    ON collections FOR INSERT
    WITH CHECK (
        is_approved_lecturer(auth.uid()) AND
        lecturer_id IN (SELECT id FROM lecturer_profiles WHERE user_id = auth.uid())
    );

CREATE POLICY "Lecturer owner can update own collections"
    ON collections FOR UPDATE
    USING (
        lecturer_id IN (SELECT id FROM lecturer_profiles WHERE user_id = auth.uid()) OR is_admin(auth.uid())
    );

-- 6. READING PROGRESS, BOOKMARKS, NOTES (Strict Student Privacy)
CREATE POLICY "Students can only access own reading progress"
    ON reading_progress FOR ALL
    USING (auth.uid() = student_id);

CREATE POLICY "Students can only access own bookmarks"
    ON bookmarks FOR ALL
    USING (auth.uid() = student_id);

CREATE POLICY "Students can only access own personal notes"
    ON personal_notes FOR ALL
    USING (auth.uid() = student_id);

-- 7. WALLET & FINANCIAL POLICIES
-- Students & Lecturers can view their own wallet account
CREATE POLICY "Users can view own wallet balance"
    ON wallet_accounts FOR SELECT
    USING (auth.uid() = user_id OR is_admin(auth.uid()));

-- No direct client mutations to wallet accounts (trusted server-side only)
CREATE POLICY "No client mutations on wallet_accounts"
    ON wallet_accounts FOR ALL
    USING (FALSE);

-- Orders: Student can view their own orders; Admin can view all
CREATE POLICY "Students view own orders"
    ON orders FOR SELECT
    USING (auth.uid() = student_id OR is_admin(auth.uid()));

-- Entitlements: Student can view own active entitlements
CREATE POLICY "Students view own entitlements"
    ON entitlements FOR SELECT
    USING (auth.uid() = student_id OR is_admin(auth.uid()));

-- Lecturer Earnings: Only the lecturer owner can view their earnings
CREATE POLICY "Lecturers view own earnings"
    ON lecturer_earnings FOR SELECT
    USING (
        lecturer_id IN (SELECT id FROM lecturer_profiles WHERE user_id = auth.uid()) OR is_admin(auth.uid())
    );

-- Payout Items: Lecturers view own payout history
CREATE POLICY "Lecturers view own payout items"
    ON payout_items FOR SELECT
    USING (
        lecturer_id IN (SELECT id FROM lecturer_profiles WHERE user_id = auth.uid()) OR is_admin(auth.uid())
    );

-- Ledger Entries & Transactions are strictly Server-Side / Admin Audit
CREATE POLICY "Ledger entries viewable only by admins"
    ON ledger_entries FOR SELECT
    USING (is_admin(auth.uid()));

CREATE POLICY "Ledger transactions viewable only by admins"
    ON ledger_transactions FOR SELECT
    USING (is_admin(auth.uid()));

