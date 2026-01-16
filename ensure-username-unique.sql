-- 1. Identify and fix duplicate usernames just in case
DO $$ 
DECLARE 
    r RECORD;
BEGIN 
    FOR r IN 
        SELECT id, username 
        FROM public.profiles 
        WHERE username IN (
            SELECT username 
            FROM public.profiles 
            GROUP BY username 
            HAVING count(*) > 1
        )
    LOOP 
        -- Append a random 4-digit number to duplicates
        UPDATE public.profiles 
        SET username = username || '_' || floor(random() * 9000 + 1000)::text
        WHERE id = r.id;
    END LOOP;
END $$;

-- 2. Now it is safe to add the UNIQUE constraint
ALTER TABLE public.profiles 
DROP CONSTRAINT IF EXISTS profiles_username_key;

ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_username_key UNIQUE (username);

-- 3. Ensure RLS allows users to update their own username
-- (This should already be covered by the "Users can update own profile" policy, but good to verify)
