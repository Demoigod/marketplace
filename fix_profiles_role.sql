
-- Fix Migration: Clean up invalid roles before applying constraint
-- Run this script to resolve the "check_role_valid" violation error.

-- 1. Update any NULL roles to 'user'
UPDATE profiles 
SET role = 'user' 
WHERE role IS NULL;

-- 2. Update any roles that are NOT valid to 'user' (cleaning up garbage data)
UPDATE profiles 
SET role = 'user' 
WHERE role NOT IN ('user', 'seller', 'admin');

-- 3. Now it is safe to add the constraint (drop if exists first to be safe)
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS check_role_valid;

ALTER TABLE profiles 
ADD CONSTRAINT check_role_valid CHECK (role IN ('user', 'seller', 'admin'));

-- 4. Ensure column is not null to enforce strict typing (optional but good)
ALTER TABLE profiles 
ALTER COLUMN role SET NOT NULL;
