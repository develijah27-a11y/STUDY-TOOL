-- ==============================================================================
-- 20261106000001_initial_schema.sql
-- Core Academic Taxonomy, User Profiles, Documents, and Collections
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. INSTITUTIONS
CREATE TABLE IF NOT EXISTS institutions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    short_code TEXT NOT NULL UNIQUE, -- e.g. MAK, KYU, MUST, UCU, MUBS
    location TEXT NOT NULL,
    logo_url TEXT,
    is_verified BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. PROGRAMMES
CREATE TABLE IF NOT EXISTS programmes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
    code TEXT NOT NULL, -- e.g. BSSE, BIT, LLB
    name TEXT NOT NULL, -- e.g. Bachelor of Science in Software Engineering
    degree_level TEXT NOT NULL CHECK (degree_level IN ('certificate', 'diploma', 'bachelors', 'postgraduate', 'masters')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(institution_id, code)
);

-- 3. COURSES (COURSE UNITS)
CREATE TABLE IF NOT EXISTS courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    programme_id UUID NOT NULL REFERENCES programmes(id) ON DELETE CASCADE,
    institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
    code TEXT NOT NULL, -- e.g. CSC 2101
    name TEXT NOT NULL, -- e.g. Data Structures and Algorithms
    year INT NOT NULL CHECK (year BETWEEN 1 AND 7),
    semester INT NOT NULL CHECK (semester IN (1, 2, 3)),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(institution_id, code)
);

-- 4. USER PROFILES
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

-- 5. USER ROLES
CREATE TABLE IF NOT EXISTS user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('student', 'lecturer', 'admin', 'co_admin')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, role)
);

-- 6. LECTURER PROFILES & VERIFICATION
CREATE TABLE IF NOT EXISTS lecturer_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE RESTRICT,
    department TEXT NOT NULL,
    teaching_role TEXT NOT NULL,
    institutional_email TEXT,
    verification_evidence_url TEXT, -- Private storage reference
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

-- 7. DOCUMENTS
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lecturer_id UUID NOT NULL REFERENCES lecturer_profiles(id) ON DELETE RESTRICT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE RESTRICT,
    programme_id UUID REFERENCES programmes(id) ON DELETE SET NULL,
    course_unit_id UUID NOT NULL REFERENCES courses(id) ON DELETE RESTRICT,
    document_type TEXT NOT NULL CHECK (document_type IN ('lecture_notes', 'study_guide', 'past_paper_solution', 'lab_manual', 'assignment_guide', 'curriculum_summary', 'textbook_supplement')),
    price_ugx INT NOT NULL CHECK (price_ugx >= 0), -- Integer UGX
    page_count INT NOT NULL CHECK (page_count > 0),
    file_size_bytes BIGINT NOT NULL CHECK (file_size_bytes > 0),
    current_version INT NOT NULL DEFAULT 1,
    status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'under_review', 'published', 'unpublished', 'archived', 'flagged', 'takedown')),
    topics TEXT[] DEFAULT '{}',
    allowed_preview_pages INT[] DEFAULT '{}', -- Server validated preview pages (e.g. [1, 2, 3])
    storage_key TEXT NOT NULL,
    checksum_sha256 TEXT NOT NULL,
    views_count INT DEFAULT 0,
    sales_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. DOCUMENT VERSIONS
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

-- 9. COLLECTIONS
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

-- 10. COLLECTION DOCUMENTS
CREATE TABLE IF NOT EXISTS collection_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    collection_id UUID NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    position INT DEFAULT 0,
    added_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(collection_id, document_id)
);

-- 11. READING PROGRESS
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

-- 12. BOOKMARKS
CREATE TABLE IF NOT EXISTS bookmarks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    page_number INT NOT NULL,
    title TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. PERSONAL NOTES
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

-- Indexes for lightning fast searching and discovery
CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status);
CREATE INDEX IF NOT EXISTS idx_documents_institution ON documents(institution_id);
CREATE INDEX IF NOT EXISTS idx_documents_course ON documents(course_unit_id);
CREATE INDEX IF NOT EXISTS idx_documents_price ON documents(price_ugx);
CREATE INDEX IF NOT EXISTS idx_documents_lecturer ON documents(lecturer_id);

