-- CLEAN SQL FOR ITEMS SCHEMA
-- This script contains ONLY SQL statements. Run this in your Supabase SQL Editor.

-- 1. Create standardized 'items' table
CREATE TABLE IF NOT EXISTS public.items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    price NUMERIC NOT NULL CHECK (price >= 0),
    images TEXT[] DEFAULT '{}',
    category TEXT,
    condition TEXT,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. Enable RLS
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;

-- 3. Policies for 'items'
DROP POLICY IF EXISTS "Anyone can view items" ON public.items;
CREATE POLICY "Anyone can view items" ON public.items FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can create items" ON public.items;
CREATE POLICY "Users can create items" ON public.items FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Owners can update" ON public.items;
CREATE POLICY "Owners can update" ON public.items FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Owners can delete" ON public.items;
CREATE POLICY "Owners can delete" ON public.items FOR DELETE USING (auth.uid() = user_id);

-- 4. REFRESH SCHEMA CACHE
NOTIFY pgrst, 'reload schema';
