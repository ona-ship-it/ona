# OAuth Setup Instructions for Supabase

## Step 1: Delete All Existing Users
Run this SQL in your Supabase SQL Editor:
```sql
DELETE FROM auth.users;
```

## Step 2: Configure OAuth Providers in Supabase

### Google OAuth Setup
1. Go to Supabase Dashboard → Authentication → Providers
2. Enable Google provider
3. Create Google OAuth credentials:
   - Visit: https://console.cloud.google.com/
   - Create a new project or select existing
   - Navigate to APIs & Services → Credentials
   - Click "Create Credentials" → "OAuth client ID"
   - Application type: Web application
   - Authorized redirect URIs: `https://qazuurdubwpcpzpwjfwh.supabase.co/auth/v1/callback`
   - Copy Client ID and Client Secret
4. Paste credentials in Supabase Google provider settings

### Twitter/X OAuth Setup
1. Go to Supabase Dashboard → Authentication → Providers
2. Enable Twitter provider
3. Create Twitter OAuth app:
   - Visit: https://developer.twitter.com/en/portal/dashboard
   - Create a new app or select existing
   - Navigate to app settings → User authentication settings
   - Enable OAuth 2.0
   - Callback URL: `https://qazuurdubwpcpzpwjfwh.supabase.co/auth/v1/callback`
   - App permissions: Read users
   - Copy Client ID and Client Secret
4. Paste credentials in Supabase Twitter provider settings

### Apple OAuth Setup
1. Go to Supabase Dashboard → Authentication → Providers
2. Enable Apple provider
3. Create Apple OAuth app:
   - Visit: https://developer.apple.com/account/resources/identifiers/list/serviceId
   - Create a new Services ID
   - Configure Sign in with Apple
   - Return URLs: `https://qazuurdubwpcpzpwjfwh.supabase.co/auth/v1/callback`
   - Copy Services ID and generate Key
4. Paste credentials in Supabase Apple provider settings

## Step 3: Update Auth Callback Handler
The app already has `/auth/callback` route configured.

## Step 4: Test OAuth Flow
1. Click "Continue with Google/X/Apple" button
2. Complete OAuth flow
3. User should be redirected back with profile auto-created

## Notes
- OAuth users don't need email verification
- Profile data is auto-populated from OAuth provider
- Users can still sign up with email/password if they prefer
