-- ==============================================================================
-- supabase/seed.sql
-- Seed Data for Uganda Academic Document Marketplace
-- Institutions: Makerere (MAK), Kyambogo (KYU), MUST, UCU, MUBS
-- Chart of Accounts, Sample Courses, Verified Lecturers, and Documents
-- ==============================================================================

-- 1. Chart of Accounts (Double-Entry Core)
INSERT INTO ledger_accounts (code, name, type, currency, description) VALUES
('1010-CLEARING-MTN', 'MTN Mobile Money Clearing Account', 'asset', 'UGX', 'Cash held at MTN escrow/wallet awaiting settlement'),
('1020-CLEARING-AIRTEL', 'Airtel Money Clearing Account', 'asset', 'UGX', 'Cash held at Airtel escrow/wallet awaiting settlement'),
('2010-STUDENT-WALLETS', 'Student Wallet Liabilities', 'liability', 'UGX', 'Customer balances held on platform deposit'),
('2020-LECTURER-PAYABLES', 'Lecturer Earnings Payables', 'liability', 'UGX', 'Net earnings owed to lecturers awaiting weekly payout'),
('2030-PAYOUT-RESERVES', 'Payout Reserved Obligations', 'liability', 'UGX', 'Funds locked during batch payout processing'),
('4010-COMMISSION-REVENUE', 'Platform Commission Revenue', 'revenue', 'UGX', 'Marketplace platform transaction fee revenue'),
('5010-GATEWAY-FEES', 'Mobile Money Gateway Expenses', 'expense', 'UGX', 'Telecom provider transaction costs')
ON CONFLICT (code) DO NOTHING;

-- 2. Institutions
INSERT INTO institutions (id, name, short_code, location, is_verified) VALUES
('11111111-1111-1111-1111-111111111111', 'Makerere University', 'MAK', 'Makerere Hill, Kampala', true),
('22222222-2222-2222-2222-222222222222', 'Kyambogo University', 'KYU', 'Banda, Kampala', true),
('33333333-3333-3333-3333-333333333333', 'Mbarara University of Science and Technology', 'MUST', 'Mbarara City', true),
('44444444-4444-4444-4444-444444444444', 'Uganda Christian University', 'UCU', 'Mukono', true),
('55555555-5555-5555-5555-555555555555', 'Makerere University Business School', 'MUBS', 'Nakawa, Kampala', true)
ON CONFLICT (short_code) DO NOTHING;

-- 3. Programmes
INSERT INTO programmes (id, institution_id, code, name, degree_level) VALUES
('aaaa1111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'BSSE', 'Bachelor of Science in Software Engineering', 'bachelors'),
('aaaa2222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'BCS', 'Bachelor of Computer Science', 'bachelors'),
('aaaa3333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'LLB', 'Bachelor of Laws', 'bachelors'),
('aaaa4444-4444-4444-4444-444444444444', '55555555-5555-5555-5555-555555555555', 'BBA', 'Bachelor of Business Administration', 'bachelors'),
('aaaa5555-5555-5555-5555-555555555555', '22222222-2222-2222-2222-222222222222', 'BENG', 'Bachelor of Engineering in Civil & Building', 'bachelors')
ON CONFLICT DO NOTHING;

-- 4. Courses (Course Units)
INSERT INTO courses (id, programme_id, institution_id, code, name, year, semester) VALUES
('c0001111-1111-1111-1111-111111111111', 'aaaa1111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'CSC 2101', 'Data Structures and Algorithms', 2, 1),
('c0002222-2222-2222-2222-222222222222', 'aaaa1111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'BSSE 1204', 'Object-Oriented Programming with Java', 1, 2),
('c0003333-3333-3333-3333-333333333333', 'aaaa3333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'LAW 2105', 'Constitutional Law of Uganda', 2, 1),
('c0004444-4444-4444-4444-444444444444', 'aaaa4444-4444-4444-4444-444444444444', '55555555-5555-5555-5555-555555555555', 'ACC 1102', 'Principles of Financial Accounting', 1, 1),
('c0005555-5555-5555-5555-555555555555', 'aaaa2222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'MTH 1101', 'Calculus I for Computing Sciences', 1, 1)
ON CONFLICT DO NOTHING;

-- 5. Platform Initial Settings
INSERT INTO settings (key, value, description) VALUES
('commission_policy', '{"platform_percent": 15, "lecturer_percent": 85, "min_price_ugx": 500, "max_price_ugx": 100000}', 'Commission policy settings'),
('payout_schedule', '{"frequency": "weekly", "payout_day": "Friday", "min_payout_ugx": 10000}', 'Lecturer consolidated payout configuration'),
('preview_policy', '{"max_preview_percentage": 20, "short_doc_pages": 5, "default_max_pages": 5}', 'PDF document preview security limits')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

