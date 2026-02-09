
-- Migration: Add role column to profiles table
-- Author: Antigravity
-- Date: 2026-02-09

-- 1. Add role column with default 'user'
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS role text DEFAULT 'user';

-- 2. Add check constraint to ensure only valid roles
ALTER TABLE profiles 
ADD CONSTRAINT check_role_valid CHECK (role IN ('user', 'seller', 'admin'));

-- 3. Update existing users to have 'user' role if null
UPDATE profiles 
SET role = 'user' 
WHERE role IS NULL;

-- 4. Create a policy to allow users to read their own role (if RLS is on)
-- Note: Existing select policy likely covers this if it selects usually *
-- But let's check permissions.

-- 5. (Optional) Create function to handle seller upgrade securely if needed
-- For now, we update via client if RLS allows update on own profile.
