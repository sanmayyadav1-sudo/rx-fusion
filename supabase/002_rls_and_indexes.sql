-- RxFusion Enterprise Database Performance & Security Migration (Ultra-Safe)

DO $$ 
BEGIN
    -- 1. NOTES Table Indexes & RLS
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'notes') THEN
        ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "Public Read Access Notes" ON public.notes;
        CREATE POLICY "Public Read Access Notes" ON public.notes FOR SELECT USING (true);

        IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'notes' AND column_name = 'course') AND
           EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'notes' AND column_name = 'semester') THEN
            CREATE INDEX IF NOT EXISTS idx_notes_course_semester ON public.notes(course, semester);
        END IF;

        IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'notes' AND column_name = 'subject_id') THEN
            CREATE INDEX IF NOT EXISTS idx_notes_subject_id ON public.notes(subject_id);
        END IF;

        IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'notes' AND column_name = 'category_id') THEN
            CREATE INDEX IF NOT EXISTS idx_notes_category_id ON public.notes(category_id);
        END IF;

        IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'notes' AND column_name = 'created_at') THEN
            CREATE INDEX IF NOT EXISTS idx_notes_created_at ON public.notes(created_at DESC);
        END IF;
    END IF;

    -- 2. DRUGS Table Indexes & RLS
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'drugs') THEN
        ALTER TABLE public.drugs ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "Public Read Access Drugs" ON public.drugs;
        CREATE POLICY "Public Read Access Drugs" ON public.drugs FOR SELECT USING (true);

        IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'drugs' AND column_name = 'name') THEN
            CREATE INDEX IF NOT EXISTS idx_drugs_name ON public.drugs(name);
        END IF;

        IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'drugs' AND column_name = 'category') THEN
            CREATE INDEX IF NOT EXISTS idx_drugs_category ON public.drugs(category);
        END IF;
    END IF;

    -- 3. RESOURCES Table Indexes & RLS
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'resources') THEN
        ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "Public Read Access Resources" ON public.resources;
        CREATE POLICY "Public Read Access Resources" ON public.resources FOR SELECT USING (true);

        IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'resources' AND column_name = 'category_id') THEN
            CREATE INDEX IF NOT EXISTS idx_resources_category_id ON public.resources(category_id);
        END IF;
    END IF;

    -- 4. STUDENT_PROFILES Table & RLS
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'student_profiles') THEN
        ALTER TABLE public.student_profiles ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "Student Profile Self Access" ON public.student_profiles;
        CREATE POLICY "Student Profile Self Access" ON public.student_profiles FOR ALL USING (auth.uid() = id);
    END IF;

    -- 5. STUDENT_ACTIVITY Table & RLS
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'student_activity') THEN
        ALTER TABLE public.student_activity ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "Student Activity Self Access" ON public.student_activity;
        CREATE POLICY "Student Activity Self Access" ON public.student_activity FOR ALL USING (auth.uid() = student_id);

        IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'student_activity' AND column_name = 'student_id') THEN
            CREATE INDEX IF NOT EXISTS idx_student_activity_student_id ON public.student_activity(student_id);
        END IF;
    END IF;

    -- 6. STUDENT_BOOKMARKS Table & RLS
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'student_bookmarks') THEN
        ALTER TABLE public.student_bookmarks ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "Student Bookmarks Self Access" ON public.student_bookmarks;
        CREATE POLICY "Student Bookmarks Self Access" ON public.student_bookmarks FOR ALL USING (auth.uid() = student_id);

        IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'student_bookmarks' AND column_name = 'student_id') THEN
            CREATE INDEX IF NOT EXISTS idx_student_bookmarks_student_id ON public.student_bookmarks(student_id);
        END IF;
    END IF;
END $$;

-- 7. Storage Bucket Configuration (Notes Bucket)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('notes', 'notes', true) 
ON CONFLICT (id) DO UPDATE SET public = true;
