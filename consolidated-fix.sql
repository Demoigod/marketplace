-- MASTER SCHEMA FIX & CONSOLIDATION
-- This script ensures the 'items' table exists and is fully configured.

-- 1. Create standardized 'items' table if it doesn't exist
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

-- 2. Migrate existing data from legacy table if it exists
DO $$ 
BEGIN 
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'marketplace_items') THEN
        INSERT INTO public.items (id, user_id, title, description, price, category, condition, status, created_at)
        SELECT id, seller_id, title, description, price, category, condition, status, created_at
        FROM public.marketplace_items
        ON CONFLICT (id) DO NOTHING;
    END IF;
END $$;

-- 3. Standardize 'saved_items'
ALTER TABLE IF EXISTS public.saved_items ENABLE ROW LEVEL SECURITY;

-- 4. Enable RLS
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;

-- 5. Policies for 'items'
DROP POLICY IF EXISTS "Anyone can view items" ON public.items;
CREATE POLICY "Anyone can view items" ON public.items FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can only create items for themselves" ON public.items;
CREATE POLICY "Users can only create items for themselves" ON public.items FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Owners can update their own items" ON public.items;
CREATE POLICY "Owners can update their own items" ON public.items FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Owners can delete their own items" ON public.items;
CREATE POLICY "Owners can delete their own items" ON public.items FOR DELETE USING (auth.uid() = user_id);

-- 6. Policies for 'saved_items'
DROP POLICY IF EXISTS "Users can manage own saved items" ON public.saved_items;
CREATE POLICY "Users can manage own saved items" ON public.saved_items FOR ALL USING (auth.uid() = user_id);

-- 7. REFRESH SCHEMA CACHE
-- This is critical for resolving PostgREST errors immediately
NOTIFY pgrst, 'reload schema';
