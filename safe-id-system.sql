-- ============================================================================
-- SAFE RE-IMPLEMENTATION: Immutable 6-Digit Public User ID
-- ============================================================================
-- This script adds the public_user_id column in a way that is NON-BLOCKING.
-- Even if the trigger fails, signups will still work.
-- ============================================================================

-- Step 1: Add the column as NULLABLE (This ensures signup never fails)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS public_user_id INTEGER;

-- Step 2: Create the collision-safe generation function
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
        
        -- Prevent infinite loop
        attempt := attempt + 1;
        IF attempt >= max_attempts THEN
            RAISE EXCEPTION 'Could not generate unique public_user_id';
        END IF;
    END LOOP;
END;
$$;

-- Step 3: Create the assignment trigger function
CREATE OR REPLACE FUNCTION assign_public_user_id()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Only assign if not already set
    IF NEW.public_user_id IS NULL THEN
        NEW.public_user_id := generate_public_user_id();
    END IF;
    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    -- CRITICAL: If generation fails, we DO NOT RAISE EXCEPTION.
    -- We allow the insert to proceed with a NULL ID to avoid blocking signup.
    -- We can backfill it later.
    RETURN NEW;
END;
$$;

-- Step 4: Create/Replace the trigger
DROP TRIGGER IF EXISTS trigger_assign_public_user_id ON public.profiles;

CREATE TRIGGER trigger_assign_public_user_id
BEFORE INSERT ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION assign_public_user_id();

-- Step 5: Add seller_public_id to market_listings (Nullable)
ALTER TABLE public.market_listings ADD COLUMN IF NOT EXISTS seller_public_id INTEGER;

-- Step 6: Add constraints (without NOT NULL)
-- Unique constraint
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS public_user_id_unique;
ALTER TABLE public.profiles ADD CONSTRAINT public_user_id_unique UNIQUE (public_user_id);

-- Range constraint
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS public_user_id_range;
ALTER TABLE public.profiles ADD CONSTRAINT public_user_id_range 
CHECK (public_user_id >= 100000 AND public_user_id <= 999999);

-- Step 7: Backfill existing users (who don't have an ID yet)
UPDATE public.profiles
SET public_user_id = generate_public_user_id()
WHERE public_user_id IS NULL;

-- Step 8: Backfill existing listings
UPDATE public.market_listings ml
SET seller_public_id = p.public_user_id
FROM public.profiles p
WHERE ml.seller_id = p.id
AND ml.seller_public_id IS NULL;

-- ============================================================================
-- ✅ MIGRATION COMPLETE
-- ============================================================================
-- Verification query:
-- SELECT id, username, public_user_id FROM public.profiles;
-- ============================================================================
