-- =====================================================
-- CRITICAL SECURITY FIX: Public Landing Page Privacy
-- =====================================================
-- This migration restricts profile visibility to authenticated users only
-- Prevents data leakage of usernames, IDs, and avatars to public visitors

-- Step 1: Drop existing permissive policies
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Anyone can view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

-- Step 2: Create new restrictive policy for authenticated users
CREATE POLICY "Authenticated users can view all profiles" 
ON public.profiles
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Step 3: Ensure users can always view their own profile (redundant but explicit)
CREATE POLICY "Users can view own profile" 
ON public.profiles
FOR SELECT 
USING (auth.uid() = id);

-- Step 4: Verify RLS is enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================
-- Run these to confirm the policies are working:

-- 1. Check active policies on profiles table
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
-- FROM pg_policies 
-- WHERE tablename = 'profiles';

-- 2. Test unauthenticated access (should return 0 rows)
-- SET ROLE anon;
-- SELECT * FROM public.profiles LIMIT 1;
-- RESET ROLE;

-- 3. Test authenticated access (should return rows)
-- This requires actual auth session, test via Supabase client

-- =====================================================
-- ROLLBACK (if needed)
-- =====================================================
-- To revert to public access (NOT RECOMMENDED):
-- DROP POLICY IF EXISTS "Authenticated users can view all profiles" ON public.profiles;
-- DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
-- CREATE POLICY "Public profiles viewable" ON public.profiles FOR SELECT USING (true);
