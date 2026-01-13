-- ============================================================================
-- FINAL VERIFICATION & CLEANUP
-- ============================================================================
-- The constraint already exists, so let's just verify everything is set up
-- ============================================================================

-- ============================================================================
-- 1. Check if all users have public_user_id
-- ============================================================================
SELECT 
    COUNT(*) as total_users,
    COUNT(public_user_id) as users_with_id,
    COUNT(*) - COUNT(public_user_id) as missing_ids
FROM public.profiles;

-- Expected: missing_ids = 0

-- ============================================================================
-- 2. Check if trigger exists and is enabled
-- ============================================================================
SELECT 
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers
WHERE trigger_name = 'trigger_assign_public_user_id'
AND event_object_table = 'profiles';

-- Expected: Should show BEFORE INSERT trigger

-- ============================================================================
-- 3. Check constraints
-- ============================================================================
SELECT
    conname as constraint_name,
    CASE contype
        WHEN 'c' THEN 'CHECK'
        WHEN 'f' THEN 'FOREIGN KEY'
        WHEN 'p' THEN 'PRIMARY KEY'
        WHEN 'u' THEN 'UNIQUE'
        ELSE contype::text
    END as constraint_type
FROM pg_constraint
WHERE conrelid = 'public.profiles'::regclass
AND conname LIKE '%public_user_id%';

-- Expected: Should show UNIQUE and CHECK constraints

-- ============================================================================
-- 4. Test ID generation function
-- ============================================================================
SELECT generate_public_user_id() as test_id;

-- Expected: Should return a 6-digit number (100000-999999)

-- ============================================================================
-- 5. Check column definition
-- ============================================================================
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'profiles'
AND column_name = 'public_user_id';

-- Expected: is_nullable should be 'NO' (NOT NULL)

-- ============================================================================
-- ✅ IF ALL CHECKS PASS, TRY SIGNING UP A NEW USER
-- ============================================================================
-- The signup should now work!
-- New users will automatically get a 6-digit public_user_id

-- ============================================================================
-- 🔧 IF SIGNUP STILL FAILS, RUN THIS:
-- ============================================================================
-- This drops and recreates the constraint with IF NOT EXISTS logic

-- Drop existing constraint
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS public_user_id_unique;

-- Recreate it
ALTER TABLE public.profiles
ADD CONSTRAINT public_user_id_unique UNIQUE (public_user_id);

-- Drop and recreate CHECK constraint
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS public_user_id_range;

ALTER TABLE public.profiles
ADD CONSTRAINT public_user_id_range 
CHECK (public_user_id >= 100000 AND public_user_id <= 999999);

-- ============================================================================
-- 🎯 FINAL TEST
-- ============================================================================
-- Now try signing up a new user through your app
-- It should work without errors!
-- ============================================================================
