-- ============================================================================
-- VERIFICATION SCRIPT: Public User ID System
-- ============================================================================
-- Run these queries to verify the public_user_id system is working correctly
-- ============================================================================

-- ============================================================================
-- 1. CHECK ALL USERS HAVE PUBLIC IDs
-- ============================================================================
-- Expected: total_users should equal users_with_id

SELECT 
    COUNT(*) as total_users, 
    COUNT(public_user_id) as users_with_id,
    COUNT(*) - COUNT(public_user_id) as missing_ids
FROM public.profiles;

-- ============================================================================
-- 2. CHECK FOR DUPLICATE IDs
-- ============================================================================
-- Expected: 0 rows (no duplicates)

SELECT 
    public_user_id, 
    COUNT(*) as count
FROM public.profiles 
GROUP BY public_user_id 
HAVING COUNT(*) > 1;

-- ============================================================================
-- 3. CHECK ID RANGE VALIDITY
-- ============================================================================
-- Expected: 0 rows (all IDs should be 6 digits: 100000-999999)

SELECT 
    username,
    public_user_id,
    CASE 
        WHEN public_user_id < 100000 THEN 'Too small'
        WHEN public_user_id > 999999 THEN 'Too large'
        ELSE 'Valid'
    END as status
FROM public.profiles 
WHERE public_user_id < 100000 OR public_user_id > 999999;

-- ============================================================================
-- 4. VIEW SAMPLE USERS WITH IDs
-- ============================================================================
-- Shows recent users and their assigned IDs

SELECT 
    username, 
    public_user_id,
    email,
    created_at
FROM public.profiles 
ORDER BY created_at DESC 
LIMIT 10;

-- ============================================================================
-- 5. CHECK MARKET LISTINGS LINKAGE
-- ============================================================================
-- Verify listings are linked to seller's public ID

SELECT 
    ml.id,
    ml.title,
    ml.seller_id,
    ml.seller_public_id,
    p.username,
    p.public_user_id,
    CASE 
        WHEN ml.seller_public_id = p.public_user_id THEN 'Linked ✓'
        WHEN ml.seller_public_id IS NULL THEN 'Missing'
        ELSE 'Mismatch ✗'
    END as link_status
FROM public.market_listings ml
LEFT JOIN public.profiles p ON ml.seller_id = p.id
ORDER BY ml.created_at DESC
LIMIT 10;

-- ============================================================================
-- 6. CHECK LISTINGS WITHOUT PUBLIC IDs
-- ============================================================================
-- Expected: 0 rows after migration (all listings should have seller_public_id)

SELECT 
    COUNT(*) as listings_without_public_id
FROM public.market_listings
WHERE seller_public_id IS NULL;

-- ============================================================================
-- 7. TEST ID GENERATION FUNCTION
-- ============================================================================
-- Generate a test ID to verify function works

SELECT generate_public_user_id() as test_generated_id;

-- ============================================================================
-- 8. CHECK RLS POLICIES
-- ============================================================================
-- Verify policies exist for profiles table

SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies
WHERE tablename = 'profiles'
ORDER BY policyname;

-- ============================================================================
-- 9. CHECK CONSTRAINTS
-- ============================================================================
-- Verify all constraints are in place

SELECT
    conname as constraint_name,
    contype as constraint_type,
    CASE contype
        WHEN 'c' THEN 'CHECK'
        WHEN 'f' THEN 'FOREIGN KEY'
        WHEN 'p' THEN 'PRIMARY KEY'
        WHEN 'u' THEN 'UNIQUE'
        ELSE contype::text
    END as type_description
FROM pg_constraint
WHERE conrelid = 'public.profiles'::regclass
AND conname LIKE '%public_user_id%';

-- ============================================================================
-- 10. CHECK INDEX
-- ============================================================================
-- Verify index exists for fast lookups

SELECT
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename = 'profiles'
AND indexname LIKE '%public_user_id%';

-- ============================================================================
-- 11. DISTRIBUTION ANALYSIS
-- ============================================================================
-- Check distribution of IDs (should be random)

SELECT 
    FLOOR(public_user_id / 100000) * 100000 as range_start,
    COUNT(*) as count_in_range
FROM public.profiles
GROUP BY FLOOR(public_user_id / 100000)
ORDER BY range_start;

-- ============================================================================
-- 12. TRIGGER VERIFICATION
-- ============================================================================
-- Check that trigger exists and is enabled

SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement,
    action_timing
FROM information_schema.triggers
WHERE trigger_name = 'trigger_assign_public_user_id';

-- ============================================================================
-- SUCCESS CRITERIA
-- ============================================================================
-- ✅ Query 1: missing_ids = 0
-- ✅ Query 2: 0 rows returned
-- ✅ Query 3: 0 rows returned
-- ✅ Query 4: Shows users with 6-digit IDs
-- ✅ Query 5: All show "Linked ✓"
-- ✅ Query 6: listings_without_public_id = 0
-- ✅ Query 7: Returns a 6-digit number
-- ✅ Query 8: Shows RLS policies
-- ✅ Query 9: Shows constraints
-- ✅ Query 10: Shows index
-- ✅ Query 11: Shows random distribution
-- ✅ Query 12: Shows trigger exists
-- ============================================================================
