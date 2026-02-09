
-- FORCE FIX: Drop conflicting constraints and apply new role rules
-- Run this if you encounter "users_role_check" or other constraint errors.

-- 1. Drop the specific conflicting constraint mentioned in the error
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS users_role_check;

-- 2. Drop our new constraint if it was partially applied
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS check_role_valid;

-- 3. Now verify and clean the data
UPDATE profiles 
SET role = 'user' 
WHERE role IS NULL OR role NOT IN ('user', 'seller');

-- 4. Re-apply the desired constraint
ALTER TABLE profiles 
ADD CONSTRAINT check_role_valid CHECK (role IN ('user', 'seller'));

-- 5. Ensure the default is set correctly
ALTER TABLE profiles 
ALTER COLUMN role SET DEFAULT 'user';
