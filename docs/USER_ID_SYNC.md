# User ID Synchronization System

This document describes the complete solution for synchronizing user IDs between `auth.users` and `onagui.app_users` tables.

## Problem

During user registration, there can be mismatches between the user ID in Supabase Auth (`auth.users.id`) and the application's user table (`onagui.app_users.id`). This causes foreign key constraint violations when trying to assign roles or create relationships.

## Solution Components

### 1. Database Trigger (Auto-sync for new users)

**File:** `supabase/migrations/20250117_auto_sync_user_ids.sql`

- Automatically creates `onagui.app_users` records when new users sign up
- Ensures ID consistency for all future registrations
- Handles conflicts gracefully with upsert logic

### 2. Edge Function (Registration flow integration)

**File:** `supabase/functions/sync-user-registration/index.ts`

- REST API endpoint for manual user synchronization
- Can be called from frontend during registration
- Supports both creating new users and updating existing ones

### 3. Client Utilities (Frontend integration)

**File:** `src/utils/userSync.ts`

- Helper functions for calling the sync Edge Function
- Integration with signup flows
- Manual sync capabilities for existing users

### 4. Migration Script (Fix existing data)

**File:** `supabase/migrations/20250117_fix_existing_user_id_mismatches.sql`

- Identifies and reports existing ID mismatches
- Provides functions to fix specific users
- Creates monitoring views for ongoing maintenance

### 5. Management Script (Easy administration)

**File:** `scripts/sync-user-ids.js`

- Command-line tool for managing user ID synchronization
- Status reporting and batch fixing capabilities
- Safe, interactive approach to data migration

## Setup Instructions

### Step 1: Deploy Database Components

```bash
# Apply the auto-sync trigger
supabase db push

# Or manually run the migration
psql -f supabase/migrations/20250117_auto_sync_user_ids.sql
```

### Step 2: Deploy Edge Function

```bash
# Deploy the sync function
supabase functions deploy sync-user-registration

# Set required environment variables
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Step 3: Fix Existing Data

```bash
# Check current status
node scripts/sync-user-ids.js status

# Generate detailed report
node scripts/sync-user-ids.js report

# Fix a specific user
node scripts/sync-user-ids.js fix-email user@example.com

# Fix all mismatches (use with caution)
node scripts/sync-user-ids.js fix-all
```

### Step 4: Update Registration Flow

```typescript
import { signUpWithSync } from '@/utils/userSync';

// In your signup component
const handleSignUp = async (email: string, password: string, metadata?: any) => {
  try {
    const result = await signUpWithSync(email, password, metadata);
    console.log('User created and synced:', result);
  } catch (error) {
    console.error('Signup failed:', error);
  }
};
```

## Usage Examples

### Check Sync Status

```sql
-- View all users and their sync status
SELECT * FROM onagui.user_sync_status;

-- Count users by sync status
SELECT sync_status, COUNT(*) 
FROM onagui.user_sync_status 
GROUP BY sync_status;
```

### Fix Individual User

```sql
-- Fix a specific user (aligns app_users.id with auth.users.id)
SELECT onagui.fix_user_id_mismatch('user@example.com', true);
```

### Manual Sync from Frontend

```typescript
import { syncUserRegistration } from '@/utils/userSync';

// Sync an existing user
await syncUserRegistration({
  userId: 'auth-user-id',
  email: 'user@example.com',
  username: 'username',
  metadata: { /* additional data */ }
});
```

### Call Edge Function Directly

```bash
# Health check
curl https://your-project.supabase.co/functions/v1/sync-user-registration

# Sync a user
curl -X POST https://your-project.supabase.co/functions/v1/sync-user-registration \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-id-from-auth",
    "email": "user@example.com",
    "username": "username"
  }'
```

## Monitoring and Maintenance

### Regular Health Checks

```bash
# Weekly sync status check
node scripts/sync-user-ids.js status

# Monthly detailed report
node scripts/sync-user-ids.js report > user-sync-report-$(date +%Y%m%d).txt
```

### Database Views

```sql
-- Monitor sync status
SELECT * FROM onagui.user_sync_status WHERE sync_status != 'SYNCED';

-- Check recent registrations
SELECT * FROM onagui.app_users WHERE created_at > NOW() - INTERVAL '24 hours';
```

## Troubleshooting

### Common Issues

1. **Foreign Key Violations**
   - Run sync status check to identify mismatched IDs
   - Use `fix_user_id_mismatch()` function to resolve

2. **Duplicate Email Errors**
   - Check if user already exists in `onagui.app_users`
   - Use the existing user's ID for role assignments

3. **Trigger Not Working**
   - Verify trigger is installed: `\df onagui.sync_auth_user_to_app_users`
   - Check trigger is enabled on `auth.users` table

### Debug Queries

```sql
-- Find users with mismatched IDs
SELECT au.email, au.id as auth_id, app.id as app_id
FROM auth.users au
JOIN onagui.app_users app ON au.email = app.email
WHERE au.id != app.id;

-- Find auth users missing from app_users
SELECT au.id, au.email
FROM auth.users au
LEFT JOIN onagui.app_users app ON au.id = app.id
WHERE app.id IS NULL;

-- Check trigger function exists
SELECT proname, prosrc 
FROM pg_proc 
WHERE proname = 'sync_auth_user_to_app_users';
```

## Security Considerations

- The Edge Function uses service role key for database access
- Client utilities use anon key with RLS policies
- Migration scripts should be run by database administrators
- Always backup before running batch fixes

## Future Enhancements

- Add webhook integration for real-time sync
- Implement conflict resolution strategies
- Add audit logging for sync operations
- Create dashboard for sync monitoring