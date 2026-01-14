-- 1. Create storage bucket for free resources
INSERT INTO storage.buckets (id, name, public) 
VALUES ('free-resources', 'free-resources', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Storage Policies for free-resources
-- Allow public access to view/download
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access" 
ON storage.objects FOR SELECT 
USING ( bucket_id = 'free-resources' );

-- Allow authenticated users to upload
DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
CREATE POLICY "Authenticated users can upload" 
ON storage.objects FOR INSERT 
WITH CHECK (
    auth.role() = 'authenticated' AND 
    bucket_id = 'free-resources'
);

-- Allow users to manage their own uploads
DROP POLICY IF EXISTS "Users can manage own uploads" ON storage.objects;
CREATE POLICY "Users can manage own uploads" 
ON storage.objects FOR ALL 
USING (
    bucket_id = 'free-resources' AND
    auth.uid()::text = (storage.foldername(name))[2]
);

-- 3. Update free_resources table schema
DO $$ 
BEGIN
    -- Add file_type column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='free_resources' AND column_name='file_type') THEN
        ALTER TABLE public.free_resources ADD COLUMN file_type TEXT DEFAULT 'PDF';
    END IF;

    -- Update the CHECK constraint for 'type' to include new UI options
    ALTER TABLE public.free_resources DROP CONSTRAINT IF EXISTS free_resources_type_check;
    ALTER TABLE public.free_resources ADD CONSTRAINT free_resources_type_check 
        CHECK (type IN ('exam', 'textbook', 'notes', 'slides', 'info'));
END $$;

-- 4. Enable RLS and add policies for free_resources table
ALTER TABLE public.free_resources ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view resources" ON public.free_resources;
CREATE POLICY "Anyone can view resources" ON public.free_resources
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can upload resources" ON public.free_resources;
CREATE POLICY "Authenticated users can upload resources" ON public.free_resources
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Refresh schema cache
NOTIFY pgrst, 'reload schema';
