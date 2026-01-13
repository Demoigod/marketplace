# 🔧 Fixing User Signup Error - Step by Step

## The Problem

You're getting "Database error saving new user" because the `public_user_id` column is causing issues during signup.

---

## 🎯 Solution: Run These Commands in Order

### Open Supabase SQL Editor

1. Go to your Supabase Dashboard
2. Click **SQL Editor** in the left sidebar
3. Click **New Query**

---

### Step 1: Remove NOT NULL Constraint

```sql
ALTER TABLE public.profiles
ALTER COLUMN public_user_id DROP NOT NULL;
```

**Click "Run"** and wait for success message.

---

### Step 2: Create ID Generation Function

```sql
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
        new_id := floor(random() * 900000 + 100000)::INTEGER;
        
        IF NOT EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE public_user_id = new_id
        ) THEN
            RETURN new_id;
        END IF;
        
        attempt := attempt + 1;
        IF attempt >= max_attempts THEN
            RAISE EXCEPTION 'Could not generate unique public_user_id';
        END IF;
    END LOOP;
END;
$$;
```

**Click "Run"**

---

### Step 3: Create Trigger Function

```sql
CREATE OR REPLACE FUNCTION assign_public_user_id()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    IF NEW.public_user_id IS NULL THEN
        NEW.public_user_id := generate_public_user_id();
    END IF;
    RETURN NEW;
END;
$$;
```

**Click "Run"**

---

### Step 4: Create Trigger

```sql
DROP TRIGGER IF EXISTS trigger_assign_public_user_id ON public.profiles;

CREATE TRIGGER trigger_assign_public_user_id
BEFORE INSERT ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION assign_public_user_id();
```

**Click "Run"**

---

### Step 5: Backfill Existing Users

```sql
UPDATE public.profiles
SET public_user_id = generate_public_user_id()
WHERE public_user_id IS NULL;
```

**Click "Run"**

---

### Step 6: Verify All Users Have IDs

```sql
SELECT 
    COUNT(*) as total_users,
    COUNT(public_user_id) as users_with_id
FROM public.profiles;
```

**Expected Result:** Both numbers should be the same.

---

### Step 7: Add Constraints Back

**ONLY run this if Step 6 shows all users have IDs:**

```sql
-- Make it NOT NULL
ALTER TABLE public.profiles
ALTER COLUMN public_user_id SET NOT NULL;

-- Make it UNIQUE
ALTER TABLE public.profiles
ADD CONSTRAINT public_user_id_unique UNIQUE (public_user_id);

-- Ensure 6-digit range
ALTER TABLE public.profiles
ADD CONSTRAINT public_user_id_range 
CHECK (public_user_id >= 100000 AND public_user_id <= 999999);
```

**Click "Run"**

---

## ✅ Test Signup

Now try signing up a new user in your app. It should work!

---

## 🚨 If It STILL Doesn't Work

Run this as a fallback:

```sql
ALTER TABLE public.profiles
ALTER COLUMN public_user_id SET DEFAULT (generate_public_user_id());
```

This sets a default value that will assign IDs even if the trigger fails.

---

## 📊 Verify Everything Works

```sql
-- Check trigger exists
SELECT trigger_name, action_timing
FROM information_schema.triggers
WHERE trigger_name = 'trigger_assign_public_user_id';

-- Should show: BEFORE INSERT
```

---

## 💡 Why This Happened

1. The migration added `public_user_id` as NOT NULL
2. But the trigger wasn't set up yet
3. New signups failed because the column was required but empty
4. Solution: Make it nullable first, set up trigger, then add constraints

---

## ✅ Success Checklist

- [ ] Step 1 completed (DROP NOT NULL)
- [ ] Step 2 completed (generation function)
- [ ] Step 3 completed (trigger function)
- [ ] Step 4 completed (trigger created)
- [ ] Step 5 completed (backfill)
- [ ] Step 6 verified (all users have IDs)
- [ ] Step 7 completed (constraints added)
- [ ] Test signup works
- [ ] New users get 6-digit IDs automatically

---

**After completing all steps, try signing up again!**
