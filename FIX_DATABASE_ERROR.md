# Fix: Database Error Saving New User

## Problem
Users are seeing this error when signing up:
```
https://www.onagui.com/#error=server_error&error_code=unexpected_failure&error_description=Database+error+saving+new+user
```

## Root Cause
The database trigger `onagui.sync_auth_user_to_app_users()` is trying to insert records into `onagui.app_users`, but the actual table is in the `public` schema (`public.app_users`). This causes the trigger to fail when new users sign up.

## Solution

### Step 1: Apply the Fixed Migration

Run the new migration that corrects the schema references:

```bash
# If using Supabase CLI locally
supabase db push

# Or via SQL editor in Supabase Dashboard
# Copy and run the contents of: supabase/migrations/20250123_fix_trigger_schema.sql
```

The migration file: `/workspaces/ona/supabase/migrations/20250123_fix_trigger_schema.sql`

This migration will:
1. Drop the incorrect trigger and function
2. Create a new trigger function in the `public` schema
3. Update to insert into both `public.app_users` AND `public.onagui_profiles`
4. Set proper permissions

### Step 2: Verify the Fix

After applying the migration, test the signup flow:

1. Try creating a new user account
2. Verify the user appears in both tables:
   ```sql
   SELECT id, email, username FROM public.app_users WHERE email = 'test@example.com';
   SELECT id, username, full_name FROM public.onagui_profiles WHERE id = '<user-id>';
   ```

### Step 3: Fix Existing Users (if needed)

If you have users who signed up during the error period, run:

```bash
# This will sync existing auth.users to app_users and onagui_profiles
node scripts/sync-user-ids.js fix-all
```

## What Changed

### Before (Broken):
- Trigger tried to insert into `onagui.app_users` (schema doesn't exist)
- Only updated `app_users`, not `onagui_profiles`

### After (Fixed):
- Trigger inserts into `public.app_users` (correct schema)
- Also creates/updates records in `public.onagui_profiles`
- Both tables are kept in sync automatically

## Testing

Test the complete signup flow:

1. **Email/Password Signup:**
   - Go to `/signup`
   - Create a new account
   - Should succeed without errors

2. **OAuth Signup (Google, Discord, X):**
   - Click "Sign in with Google/Discord/X"
   - Complete OAuth flow
   - Should redirect successfully to `/profile`

3. **Verify Database:**
   ```sql
   -- Check both tables have the new user
   SELECT 
     au.id,
     au.email,
     app.username as app_username,
     prof.username as profile_username,
     prof.onagui_type
   FROM auth.users au
   LEFT JOIN public.app_users app ON au.id = app.id
   LEFT JOIN public.onagui_profiles prof ON au.id = prof.id
   WHERE au.email = 'your-test-email@example.com';
   ```

## Deployment Steps

### For Production (Supabase Dashboard):

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Create a new query
4. Copy and paste the contents of `/workspaces/ona/supabase/migrations/20250123_fix_trigger_schema.sql`
5. Run the query
6. Verify success in the output

### For Local Development:

```bash
# Make sure Supabase is running
supabase start

# Apply the migration
supabase db push

# Or apply specific migration
supabase db execute --file supabase/migrations/20250123_fix_trigger_schema.sql
```

## Additional Notes

- The trigger now handles both `INSERT` and `UPDATE` events on `auth.users`
- It creates records in both `app_users` and `onagui_profiles` to maintain data consistency
- The `ON CONFLICT` clauses ensure idempotency - running the trigger multiple times won't cause errors
- The auth callback route at `/api/auth/callback` also attempts to create profiles as a fallback

## Related Files

- Migration: [`supabase/migrations/20250123_fix_trigger_schema.sql`](supabase/migrations/20250123_fix_trigger_schema.sql)
- Old (broken) migration: [`supabase/migrations/20250117_auto_sync_user_ids.sql`](supabase/migrations/20250117_auto_sync_user_ids.sql)
- Sync script: [`scripts/sync-user-ids.js`](scripts/sync-user-ids.js)
- Auth callback: [`src/app/api/auth/callback/route.ts`](src/app/api/auth/callback/route.ts)
