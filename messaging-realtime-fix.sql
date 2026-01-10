-- REAL-TIME & LOADING FIX for MESSAGING
-- Run this in your Supabase SQL Editor

-- 1. Enable Realtime for Messaging Tables
-- This is NECESSARY for the seller/buyer to see messages instantly
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND schemaname = 'public' 
        AND tablename = 'messages'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND schemaname = 'public' 
        AND tablename = 'conversations'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;
    END IF;
END $$;

-- 2. Ensure User Profiles are viewable (needed for partner names in chat)
-- If this policy already exists, this will just be a safety check
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'users' AND policyname = 'Public profiles are viewable by everyone'
    ) THEN
        CREATE POLICY "Public profiles are viewable by everyone" 
        ON public.users FOR SELECT USING (true);
    END IF;
END $$;

-- 3. Reload Schema Cache
NOTIFY pgrst, 'reload schema';
