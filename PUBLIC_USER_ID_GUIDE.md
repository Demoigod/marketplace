# 🆔 Public User ID System - Quick Reference

## What Is This?

Every user now has a **6-digit public User ID** (e.g., `482917`) in addition to their internal UUID.

## Key Features

✅ **Immutable** - Never changes after creation
✅ **Unique** - No two users can have the same ID
✅ **Backend-Generated** - Cannot be spoofed from frontend
✅ **Publicly Visible** - Displayed in Messages UI
✅ **Auto-Linked** - Connected to all user resources

---

## Database Schema

### profiles Table
```sql
public_user_id INTEGER NOT NULL UNIQUE
-- Range: 100000-999999 (6 digits)
-- Auto-assigned on user creation
```

### market_listings Table
```sql
seller_id UUID (references profiles.id)
seller_public_id INTEGER (references profiles.public_user_id)
```

---

## How It Works

### 1. User Signs Up
```
1. User creates account
2. Trigger fires: assign_public_user_id()
3. Function generates random 6-digit ID
4. Checks for collisions (retries if needed)
5. Assigns ID to user profile
```

### 2. Creating a Listing
```javascript
const itemData = {
    seller_id: user.id,              // UUID
    seller_public_id: user.publicUserId, // 6-digit ID
    // ... other fields
};
```

### 3. Displaying in Messages
```
Username: Zakhele
ID: 482917
```

---

## Frontend Usage

### Fetch User with Public ID
```javascript
import { getCurrentUser } from './auth.js';

const user = await getCurrentUser();
console.log(user.publicUserId); // 482917
```

### Display in UI
```javascript
// Messages conversation list
${partnerPublicId ? `
    <div style="font-size:0.7rem; color:var(--text-secondary);">
        ID: ${partnerPublicId}
    </div>
` : ''}
```

---

## Security

### ✅ Protected By
- **RLS Policies** - Users cannot modify their own ID
- **Database Constraints** - UNIQUE, NOT NULL, CHECK range
- **Backend Generation** - Trigger assigns ID, not frontend
- **Collision Detection** - Function retries on duplicate

### ⚠️ What's NOT Protected
- Public IDs are **visible to everyone** (by design)
- They're meant for display, not authentication
- Internal UUIDs remain the primary identifier

---

## Migration Steps

### Development
```sql
-- 1. Run migration
\i public-user-id-migration.sql

-- 2. Verify
\i verify-public-user-id.sql
```

### Production
```sql
-- 1. Backup database
-- 2. Run migration during low-traffic period
-- 3. Verify all users have IDs
-- 4. Deploy frontend changes
-- 5. Monitor for errors
```

---

## Verification Checklist

After running migration:

- [ ] All users have `public_user_id`
- [ ] No duplicate IDs exist
- [ ] All IDs are 6 digits (100000-999999)
- [ ] Listings linked to seller's public ID
- [ ] RLS policies prevent modification
- [ ] Trigger auto-assigns IDs to new users
- [ ] Messages UI displays IDs correctly

---

## Troubleshooting

### Issue: User has no public_user_id
**Solution**: Run backfill query
```sql
UPDATE public.profiles
SET public_user_id = generate_public_user_id()
WHERE public_user_id IS NULL;
```

### Issue: Duplicate IDs
**Solution**: Should never happen due to collision detection
```sql
-- Check for duplicates
SELECT public_user_id, COUNT(*) 
FROM public.profiles 
GROUP BY public_user_id 
HAVING COUNT(*) > 1;
```

### Issue: ID not displaying in Messages
**Solution**: Check that frontend fetches `public_user_id`
```javascript
// In messages.js
const { data: partner } = await supabase
    .from('profiles')
    .select('username, public_user_id') // ← Must include this
    .eq('id', partnerId)
    .single();
```

### Issue: Listing not linked to public ID
**Solution**: Ensure `post-item.js` includes `seller_public_id`
```javascript
const itemData = {
    seller_id: user.id,
    seller_public_id: user.publicUserId, // ← Must include this
    // ...
};
```

---

## Files Modified

### SQL
- `public-user-id-migration.sql` - Main migration
- `verify-public-user-id.sql` - Verification queries

### JavaScript
- `auth.js` - Fetch `publicUserId`
- `messages.js` - Display ID in conversations
- `post-item.js` - Auto-link to listings

---

## Future Enhancements

Potential uses for public IDs:

- **User Profiles** - Display on public profile pages
- **Reviews** - Link reviews to public ID
- **Search** - Allow searching by ID
- **Support** - Reference users by ID in support tickets
- **Analytics** - Track user activity by public ID
- **Referrals** - Use ID for referral codes

---

## Technical Details

### ID Generation Algorithm
```sql
1. Generate random number: floor(random() * 900000 + 100000)
2. Check if exists in database
3. If exists, retry (up to 100 attempts)
4. If all attempts fail, raise exception
5. Return unique ID
```

### Collision Probability
- **Range**: 900,000 possible IDs (100000-999999)
- **With 1,000 users**: ~0.056% collision chance per generation
- **With 10,000 users**: ~5.6% collision chance per generation
- **With 100,000 users**: ~56% collision chance per generation

**Note**: Retry logic handles collisions automatically. System can support up to ~450,000 users before collision rate becomes problematic.

---

## Support

For issues or questions:
1. Check verification script results
2. Review RLS policies
3. Check browser console for errors
4. Verify database constraints
