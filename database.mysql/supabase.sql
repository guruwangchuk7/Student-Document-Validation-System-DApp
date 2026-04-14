-- ############################################################
-- 1. SETUP & EXTENSIONS
-- ############################################################
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ############################################################
-- 2. TABLES CREATION
-- ############################################################

-- Students Table
CREATE TABLE IF NOT EXISTS public.students (
    student_identifier TEXT PRIMARY KEY,               -- e.g., Aadhaar, CID, or Roll Number
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,                            -- Bcrypt hashed password
    gender VARCHAR(50),
    date_of_birth DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Admin/University Table
CREATE TABLE IF NOT EXISTS public.admins (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,                       -- Bcrypt hashed password
    university_name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Certificates Table
CREATE TABLE IF NOT EXISTS public.certificates (
    certificate_id TEXT PRIMARY KEY,                   -- e.g., cert-12345
    student_identifier TEXT NOT NULL,
    degree_name TEXT NOT NULL,
    university_name TEXT NOT NULL,
    graduation_date DATE,
    ipfs_cid TEXT NOT NULL,                            -- Link to storage
    certificate_hash TEXT NOT NULL,                    -- On-chain anchor hash
    gender VARCHAR(50),
    date_of_birth DATE,
    issue_date TIMESTAMPTZ DEFAULT NOW(),

    -- Foreign Key: Prevent orphaned certificates
    CONSTRAINT fk_student 
        FOREIGN KEY (student_identifier) 
        REFERENCES public.students(student_identifier) 
        ON DELETE CASCADE
);

-- ############################################################
-- 3. INDEXES (Performance Optimization)
-- ############################################################
-- Speed up searching for a specific student's certificates
CREATE INDEX IF NOT EXISTS idx_certificates_student_id ON public.certificates(student_identifier);
-- Speed up verification lookups via hash
CREATE INDEX IF NOT EXISTS idx_certificates_hash ON public.certificates(certificate_hash);

-- ############################################################
-- 4. SECURITY (Row Level Security - RLS)
-- ############################################################
-- Enable RLS on all tables
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

-- POLICY: Allow public viewing of certificates for verification purposes
CREATE POLICY "Enable public access for verification" 
ON public.certificates FOR SELECT 
USING (true);

-- POLICY: Allow students to view only their own records (if using local ID)
-- Note: This is a basic policy. If using Supabase Auth, this would be: 
-- USING (auth.uid() = id)
CREATE POLICY "Students can view their own profiles" 
ON public.students FOR SELECT 
USING (true); -- Set to true for initial migration, tighten later

-- ############################################################
-- 5. SEED DATA (Optional: Initial Test Records)
-- ############################################################
-- Add a dummy Admin
INSERT INTO public.admins (email, password_hash, university_name)
VALUES ('admin@university.edu', '$2b$10$7Z2P6f8f5v4q3w2e1r0t9y8u7i6o5p4a3s2d1f', 'Global Blockchain Institute')
ON CONFLICT (email) DO NOTHING;

-- Add a dummy Student
INSERT INTO public.students (student_identifier, full_name, email, password)
VALUES ('STD-777', 'Sonam Wangmo', 'sonam@example.com', '$2b$10$7Z2P6f8f5v4q3w2e1r0t9y8u7i6o5p4a3s2d1f')
ON CONFLICT (student_identifier) DO NOTHING;
