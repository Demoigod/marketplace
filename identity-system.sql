-- PRODUCTION-READY IDENTITY SYSTEM
-- This script migrates the existing schema to a professional, immutable identity system

-- 1. Create Profiles Table (if not exists, or rename)
-- If public.users exists, let's rename it to profiles to match requirements
-- If it doesn't exist, we create it.
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'users') THEN
        ALTER TABLE public.users RENAME TO profiles;
    ELSE
        CREATE TABLE IF NOT EXISTS public.profiles (
            id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
            username TEXT,
            full_name TEXT,
            avatar_url TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
        );
    END IF;
END $$;

-- 2. Rename items to market_listings
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'items') THEN
        ALTER TABLE public.items RENAME TO market_listings;
        -- Rename column if it exists
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='market_listings' AND column_name='user_id') THEN
            ALTER TABLE public.market_listings RENAME COLUMN user_id TO seller_id;
        END IF;
    ELSE
        CREATE TABLE IF NOT EXISTS public.market_listings (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            seller_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
            title TEXT NOT NULL,
            description TEXT NOT NULL,
            price NUMERIC NOT NULL CHECK (price >= 0),
            images TEXT[] DEFAULT '{}',
            status TEXT DEFAULT 'active',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
        );
    END IF;
END $$;

-- 3. Update Saved Items (Foreign Key)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'saved_items') THEN
        ALTER TABLE public.saved_items RENAME COLUMN user_id TO profile_id;
        -- Update foreign key to profiles
        ALTER TABLE public.saved_items DROP CONSTRAINT IF EXISTS saved_items_user_id_fkey;
        ALTER TABLE public.saved_items ADD CONSTRAINT saved_items_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.profiles(id);
    END IF;
END $$;

-- 4. Set up Trigger for Profile Creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, username, full_name)
    VALUES (
        new.id,
        COALESCE(new.raw_user_meta_data->>'username', new.raw_user_meta_data->>'name', 'User_' || substr(new.id::text, 1, 8)),
        new.raw_user_meta_data->>'name'
    );
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_listings ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Market Listings Policies
DROP POLICY IF EXISTS "Anyone can view listings" ON public.market_listings;
CREATE POLICY "Anyone can view listings" ON public.market_listings
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert their own listings" ON public.market_listings;
CREATE POLICY "Users can insert their own listings" ON public.market_listings
    FOR INSERT WITH CHECK (auth.uid() = seller_id);

DROP POLICY IF EXISTS "Users can update their own listings" ON public.market_listings;
CREATE POLICY "Users can update their own listings" ON public.market_listings
    FOR UPDATE USING (auth.uid() = seller_id);

DROP POLICY IF EXISTS "Users can delete their own listings" ON public.market_listings;
CREATE POLICY "Users can delete their own listings" ON public.market_listings
    FOR DELETE USING (auth.uid() = seller_id);

-- 6. Ensure real-time is enabled for new name
ALTER PUBLICATION supabase_realtime ADD TABLE public.market_listings;

-- 7. Notify reload
NOTIFY pgrst, 'reload schema';
