# Post Item Debugging Guide

## Common Issues & Solutions

### Issue 1: Storage Bucket Not Created
**Symptom**: Error message about "listing-images" bucket not found

**Solution**: 
1. Go to Supabase Dashboard → Storage
2. Check if "listing-images" bucket exists
3. If not, create it manually:
   - Click "New Bucket"
   - Name: `listing-images`
   - Public: ✅ (checked)
   - Click "Create bucket"

### Issue 2: RLS Policies Not Applied
**Symptom**: "new row violates row-level security policy" or upload fails

**Solution**:
1. Go to Supabase Dashboard → Storage → listing-images
2. Click "Policies" tab
3. Verify these policies exist:
   - "Public Access" (SELECT)
   - "Users can upload listing images" (INSERT)
   - "Users can manage own listing images" (ALL)
4. If missing, re-run the `post-item-schema.sql` script

### Issue 3: Images Column Missing
**Symptom**: Error about "column images does not exist"

**Solution**:
1. Go to Supabase Dashboard → Table Editor → market_listings
2. Check if `images` column exists (type: text[])
3. If missing, run this SQL:
```sql
ALTER TABLE public.market_listings 
ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT '{}';
```

### Issue 4: Form Validation Errors
**Symptom**: Button stays disabled or form doesn't submit

**Check**:
- Open browser console (F12)
- Look for JavaScript errors
- Verify all required fields are filled:
  - Title (not empty)
  - Category (selected)
  - Price (valid number > 0)
  - Description (not empty)

### Issue 5: Authentication Issues
**Symptom**: Redirected to index.html or "Authentication required" error

**Solution**:
- Make sure you're logged in
- Check if session is valid
- Try logging out and back in

## Testing Without Images (Quick Test)

To test if the basic posting works without images:

1. Fill out the form completely
2. **Do NOT upload any images**
3. Click "List Item Now"
4. If this works, the issue is with image upload/storage
5. If this fails, the issue is with database insertion

## Browser Console Debugging

Open the browser console and look for these specific errors:

### Storage Errors:
```
"Bucket not found"
"new row violates row-level security policy for table"
"permission denied for bucket"
```
→ Storage bucket or RLS issue

### Database Errors:
```
"column 'images' does not exist"
"null value in column 'seller_id'"
"violates foreign key constraint"
```
→ Database schema issue

### Authentication Errors:
```
"Authentication required"
"User is null"
```
→ Session/auth issue

## Step-by-Step Manual Test

1. Open browser console (F12)
2. Navigate to post-item.html
3. Fill form with test data
4. Click submit
5. Watch console for errors
6. Copy the EXACT error message
7. Share it for specific help

## Quick SQL Verification

Run this in Supabase SQL Editor to verify setup:

```sql
-- Check if images column exists
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'market_listings' 
AND column_name = 'images';

-- Check storage bucket
SELECT * FROM storage.buckets WHERE name = 'listing-images';

-- Check storage policies
SELECT * FROM storage.policies WHERE bucket_id = 'listing-images';
```
