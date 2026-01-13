-- ============================================================================
-- IMMUTABLE 6-DIGIT PUBLIC USER ID SYSTEM
-- ============================================================================
-- Purpose: Add a unique, immutable, publicly-visible 6-digit ID to each user
-- This ID is separate from the internal UUID and provides a user-friendly
-- identifier for display in the UI (e.g., Messages, profiles)
-- ============================================================================

-- ============================================================================
-- STEP 1: Add public_user_id Column to profiles Table
-- ============================================================================

-- Add the column as NULLABLE initially to allow existing users and new signups
-- We'll make it NOT NULL after backfilling
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS public_user_id INTEGER;

-- ============================================================================
-- STEP 2: Create ID Generation Function
-- ============================================================================
-- This function generates a random 6-digit number and ensures uniqueness
-- by checking for collisions. It will retry up to 100 times before failing.

CREATE OR REPLACE FUNCTION generate_public_user_id()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    new_id INTEGER;
    max_attempts INTEGER := 100;
    attempt INTEGER := 0;
BEGIN
    LOOP
        -- Generate random 6-digit number (100000-999999)
        new_id := floor(random() * 900000 + 100000)::INTEGER;
        
        -- Check if ID already exists
        IF NOT EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE public_user_id = new_id
        ) THEN
            RETURN new_id;
        END IF;
        
        -- Prevent infinite loop in case of high collision rate
        attempt := attempt + 1;
        IF attempt >= max_attempts THEN
            RAISE EXCEPTION 'Could not generate unique public_user_id after % attempts', max_attempts;
        END IF;
    END LOOP;
END;
$$;

-- ============================================================================
-- STEP 3: Create Trigger Function to Auto-Assign IDs
-- ============================================================================
-- This trigger automatically assigns a public_user_id when a new profile
-- is created, ensuring every user gets an ID without frontend intervention.

CREATE OR REPLACE FUNCTION assign_public_user_id()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Only assign if not already set (allows manual override if needed)
    IF NEW.public_user_id IS NULL THEN
        NEW.public_user_id := generate_public_user_id();
    END IF;
    RETURN NEW;
END;
$$;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS trigger_assign_public_user_id ON public.profiles;

-- Create trigger that fires before insert
CREATE TRIGGER trigger_assign_public_user_id
BEFORE INSERT ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION assign_public_user_id();

-- ============================================================================
-- STEP 4: Backfill Existing Users
-- ============================================================================
-- Generate IDs for users who were created before this migration

UPDATE public.profiles
SET public_user_id = generate_public_user_id()
WHERE public_user_id IS NULL;

-- ============================================================================
-- STEP 5: Add Constraints
-- ============================================================================
-- Now that all users have IDs, enforce NOT NULL and UNIQUE constraints

-- Make column NOT NULL
ALTER TABLE public.profiles
ALTER COLUMN public_user_id SET NOT NULL;

-- Add UNIQUE constraint
ALTER TABLE public.profiles
ADD CONSTRAINT public_user_id_unique UNIQUE (public_user_id);

-- Add CHECK constraint to ensure 6-digit range
ALTER TABLE public.profiles
ADD CONSTRAINT public_user_id_range 
CHECK (public_user_id >= 100000 AND public_user_id <= 999999);

-- Create index for fast lookups
CREATE INDEX IF NOT EXISTS idx_profiles_public_user_id 
ON public.profiles(public_user_id);

-- ============================================================================
-- STEP 6: Update market_listings Table
-- ============================================================================
-- Add seller_public_id to link listings to the seller's public ID

ALTER TABLE public.market_listings
ADD COLUMN IF NOT EXISTS seller_public_id INTEGER;

-- Backfill existing listings with seller's public ID
UPDATE public.market_listings ml
SET seller_public_id = p.public_user_id
FROM public.profiles p
WHERE ml.seller_id = p.id
AND ml.seller_public_id IS NULL;

-- Add foreign key constraint (optional, for referential integrity)
ALTER TABLE public.market_listings
ADD CONSTRAINT fk_seller_public_id
FOREIGN KEY (seller_public_id) 
REFERENCES public.profiles(public_user_id)
ON DELETE SET NULL;

-- ============================================================================
-- STEP 7: Row Level Security Policies
-- ============================================================================
-- Prevent users from modifying their public_user_id

-- First, drop the existing update policy
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- Recreate with protection for public_user_id
-- Users can update their profile BUT cannot change their public_user_id
CREATE POLICY "Users can update own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (
    auth.uid() = id 
    AND public_user_id = (
        SELECT public_user_id 
        FROM public.profiles 
        WHERE id = auth.uid()
    )
);

-- Allow everyone to read public_user_id (it's public information)
-- This policy should already exist from previous migrations, but we ensure it
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

CREATE POLICY "Profiles are viewable by everyone"
ON public.profiles
FOR SELECT
USING (true);

-- ============================================================================
-- STEP 8: Grant Necessary Permissions
-- ============================================================================

-- Grant execute permission on the generation function to authenticated users
GRANT EXECUTE ON FUNCTION generate_public_user_id() TO authenticated;
GRANT EXECUTE ON FUNCTION assign_public_user_id() TO authenticated;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================
-- Run these queries to verify the migration succeeded:

-- 1. Check that all users have public_user_ids
-- SELECT COUNT(*) as total_users, 
--        COUNT(public_user_id) as users_with_id 
-- FROM public.profiles;

-- 2. Check for any duplicate IDs (should return 0 rows)
-- SELECT public_user_id, COUNT(*) 
-- FROM public.profiles 
-- GROUP BY public_user_id 
-- HAVING COUNT(*) > 1;

-- 3. Check that all IDs are in valid range
-- SELECT COUNT(*) 
-- FROM public.profiles 
-- WHERE public_user_id < 100000 OR public_user_id > 999999;

-- 4. View sample users with their IDs
-- SELECT username, public_user_id, created_at 
-- FROM public.profiles 
-- ORDER BY created_at DESC 
-- LIMIT 10;

-- ============================================================================
-- ROLLBACK (if needed)
-- ============================================================================
-- Uncomment and run these commands to rollback this migration:

-- DROP TRIGGER IF EXISTS trigger_assign_public_user_id ON public.profiles;
-- DROP FUNCTION IF EXISTS assign_public_user_id();
-- DROP FUNCTION IF EXISTS generate_public_user_id();
-- ALTER TABLE public.market_listings DROP CONSTRAINT IF EXISTS fk_seller_public_id;
-- ALTER TABLE public.market_listings DROP COLUMN IF EXISTS seller_public_id;
-- ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS public_user_id_range;
-- ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS public_user_id_unique;
-- DROP INDEX IF EXISTS idx_profiles_public_user_id;
-- ALTER TABLE public.profiles DROP COLUMN IF EXISTS public_user_id;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
