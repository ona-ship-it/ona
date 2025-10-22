# Apply Escrow System - Manual SQL Application Guide

## 🚨 IMPORTANT: SQL Must Be Applied Manually

The escrow system SQL script needs to be applied manually through the Supabase SQL Editor because:
- The `exec_sql` RPC function is not available in this Supabase instance
- Direct SQL execution requires database admin privileges
- The escrow tables, functions, and policies don't exist yet

## 📋 Step-by-Step Application Process

### Step 1: Access Supabase SQL Editor

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Navigate to **SQL Editor** in the left sidebar
4. Click **New Query**

### Step 2: Apply the SQL Script

1. Open the file `implement-escrow-system-fixed.sql` in your code editor
2. Copy the **entire contents** of the file
3. Paste it into the Supabase SQL Editor
4. Click **Run** to execute the script

**⚠️ Important Notes:**
- The script contains 47 SQL statements
- It will create the `onagui` schema, tables, functions, and policies
- Make sure to run the **entire script** in one go
- If you get any errors, note them down for troubleshooting

### Step 3: Verify Application Success

After running the SQL script, you can verify it was applied correctly:

#### 3.1 Check Tables Created
Run this query in the SQL Editor:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'onagui';
```

**Expected Result:** Should show `wallets` and `giveaways` tables.

#### 3.2 Check Functions Created
Run this query in the SQL Editor:
```sql
SELECT routine_name, routine_type 
FROM information_schema.routines 
WHERE routine_schema = 'onagui' 
AND routine_type = 'FUNCTION';
```

**Expected Result:** Should show functions like:
- `ensure_user_wallet`
- `is_admin_user`
- `add_funds_to_wallet_fiat`
- `deduct_funds_from_wallet_fiat`
- `add_funds_to_wallet_tickets`
- `deduct_funds_from_wallet_tickets`

#### 3.3 Check Giveaways Table Structure
Run this query in the SQL Editor:
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'onagui' 
AND table_name = 'giveaways';
```

**Expected Result:** Should include new columns:
- `prize_amount` (numeric)
- `escrow_amount` (numeric)
- `escrow_status` (text)

### Step 4: Test Function Access

After applying the SQL, run this command in your terminal to test function access:

```bash
node check-database-functions.mjs
```

**Expected Result:** 
- ✅ Wallets table exists
- ✅ Giveaways table has escrow columns
- ✅ Functions are accessible

### Step 5: Run Backend Tests

Once the SQL is applied and verified, run the escrow system tests:

```bash
node test-escrow-system.mjs
```

**Expected Result:** All 6 tests should pass.

## 🔧 Troubleshooting

### Common Issues and Solutions

#### Issue: "permission denied for schema onagui"
**Solution:** Make sure you're running the SQL as a database admin/owner.

#### Issue: "relation already exists"
**Solution:** Some tables might already exist. You can either:
1. Drop existing tables first, or
2. Modify the script to use `CREATE TABLE IF NOT EXISTS`

#### Issue: Functions not accessible after creation
**Solution:** Check that the GRANT statements executed successfully:
```sql
SELECT grantee, privilege_type 
FROM information_schema.routine_privileges 
WHERE routine_schema = 'onagui';
```

#### Issue: RLS policies blocking access
**Solution:** Verify your user has the correct role and permissions.

## 📞 Next Steps After SQL Application

1. ✅ Verify SQL application using the queries above
2. 🧪 Run `node check-database-functions.mjs` to confirm database state
3. 🧪 Run `node test-escrow-system.mjs` to test backend functionality
4. 🎨 Test the frontend wallet balance display and escrow warnings
5. 🚀 Create and test giveaways with escrow functionality

## 📁 Files Involved

- **SQL Script:** `implement-escrow-system-fixed.sql`
- **Backend Tests:** `test-escrow-system.mjs`
- **Database Check:** `check-database-functions.mjs`
- **Frontend Components:** `WalletBalance.tsx`, `AdminWalletManager.tsx`

---

**🎯 Goal:** Once the SQL is applied, the escrow system will be fully functional, allowing users to create giveaways with automatic escrow handling and wallet balance management.