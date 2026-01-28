# Fix: "invalid schema:onagui" Error

## Problem
When testing a fundraiser, you get an error popup: **"invalid schema:onagui"**

## Root Cause
The application code is trying to access database tables that were created in the `onagui` schema, but the code expects them to be in the `public` schema (the default).

## Solution

### 1. Code Fix (Already Applied)
✅ Updated [src/components/WalletBalance.tsx](src/components/WalletBalance.tsx) to use `wallets` instead of `onagui.wallets`

### 2. Database Migration (Required)
Run the [FIX_SCHEMA_MIGRATION.sql](FIX_SCHEMA_MIGRATION.sql) script in your Supabase SQL Editor:

1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Copy the entire content of `FIX_SCHEMA_MIGRATION.sql`
4. Paste and run it

This script will:
- Move all fundraiser tables from `onagui` schema to `public` schema
- Move the `wallets` table to `public` schema
- Update all database triggers and functions to reference the correct schema
- Set proper permissions for anonymous and authenticated users
- Verify the migration succeeded

### 3. Verify the Fix
After running the migration:
1. The last query in the script will show you which schema each table is in
2. All tables should now show `public` as the schema
3. Try creating a test fundraiser again

## What Changed
- **Before**: Tables were in `onagui.fundraisers`, `onagui.donations`, etc.
- **After**: Tables are in `public.fundraisers`, `public.donations`, etc.
- Code now correctly references tables without schema prefix (defaults to `public`)

## Prevention
- When creating new migrations, always use `public` schema or don't specify a schema (it defaults to `public`)
- Avoid creating custom schemas unless absolutely necessary for multi-tenancy
