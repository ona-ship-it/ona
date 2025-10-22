# Escrow System Integration Guide

## 🎯 Overview

The escrow system ensures users have sufficient wallet balance before creating giveaways, while allowing admin bypass. This guide shows how to integrate it with your existing giveaway creation flow.

## 📋 Current State Analysis

### ✅ What's Already Working
- **Giveaways table** has `prize_amount` column
- **Admin bypass logic** exists in frontend (`isAdmin ? 0 : formData.prize_amount`)
- **Escrow amount tracking** in `escrow_amount` field
- **Admin detection** via `onagui.user_roles` system

### ❌ What Needs Implementation
- **Wallets table** (doesn't exist yet)
- **RLS escrow policy** (needs to replace current insert policy)
- **Frontend wallet integration** (balance checking, funding)
- **Error handling** for insufficient funds

## 🚀 Implementation Steps

### Step 1: Apply the SQL Script

Run the `implement-escrow-system.sql` script in Supabase SQL editor:

```sql
-- This will create:
-- ✅ onagui.wallets table
-- ✅ RLS policies for wallet security
-- ✅ Admin bypass policy for giveaways
-- ✅ Helper functions for wallet management
-- ✅ Escrow checking logic
```

### Step 2: Frontend Integration

#### A. Add Wallet Balance Display

Create a wallet balance component:

```typescript
// components/WalletBalance.tsx
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

interface WalletBalanceProps {
  userId: string;
  onBalanceUpdate?: (balance: number) => void;
}

export function WalletBalance({ userId, onBalanceUpdate }: WalletBalanceProps) {
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBalance();
  }, [userId]);

  const fetchBalance = async () => {
    try {
      const { data, error } = await supabase
        .from('wallets')
        .select('balance')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      const userBalance = data?.balance || 0;
      setBalance(userBalance);
      onBalanceUpdate?.(userBalance);
    } catch (error) {
      console.error('Error fetching balance:', error);
      setBalance(0);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading balance...</div>;

  return (
    <div className="bg-purple-900 bg-opacity-30 rounded-lg p-4 border border-purple-500/30">
      <div className="flex items-center justify-between">
        <span className="text-purple-300">Wallet Balance:</span>
        <span className="text-white font-semibold">${balance?.toFixed(2)} USDT</span>
      </div>
    </div>
  );
}
```

#### B. Update Giveaway Creation Form

Modify `NewGiveawayClient.tsx`:

```typescript
// Add to imports
import { WalletBalance } from '@/components/WalletBalance';

// Add state for wallet balance
const [walletBalance, setWalletBalance] = useState<number>(0);
const [balanceLoading, setBalanceLoading] = useState(true);

// Add balance checking logic
const checkSufficientFunds = () => {
  if (isAdmin) return true; // Admin bypass
  return walletBalance >= formData.prize_amount;
};

// Update form validation
const validateForm = () => {
  // ... existing validations ...
  
  if (!isAdmin && !checkSufficientFunds()) {
    throw new Error(`Insufficient funds. You need $${formData.prize_amount} USDT but only have $${walletBalance.toFixed(2)} USDT in your wallet.`);
  }
};

// Add to the form JSX (before submit buttons)
<WalletBalance 
  userId={user?.id || ''} 
  onBalanceUpdate={setWalletBalance}
/>

{!isAdmin && (
  <div className="bg-yellow-500 bg-opacity-20 border border-yellow-500 rounded-lg p-4">
    <div className="flex items-center gap-2 mb-2">
      <span className="text-yellow-400">⚠️</span>
      <span className="text-yellow-300 font-medium">Escrow Required</span>
    </div>
    <p className="text-yellow-200 text-sm">
      Creating this giveaway requires ${formData.prize_amount} USDT to be held in escrow.
      {walletBalance < formData.prize_amount && (
        <span className="block mt-1 text-red-300">
          You need ${(formData.prize_amount - walletBalance).toFixed(2)} more USDT.
        </span>
      )}
    </p>
  </div>
)}
```

### Step 3: Admin Wallet Management

Create an admin interface for managing user wallets:

```typescript
// components/AdminWalletManager.tsx
export function AdminWalletManager() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [amount, setAmount] = useState('');

  const addFunds = async () => {
    try {
      const { error } = await supabase.rpc('add_funds_to_wallet', {
        user_uuid: selectedUser,
        amount: parseFloat(amount)
      });

      if (error) throw error;
      
      alert('Funds added successfully!');
      setAmount('');
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">Wallet Management</h3>
      
      <div className="space-y-4">
        <select 
          value={selectedUser} 
          onChange={(e) => setSelectedUser(e.target.value)}
          className="w-full p-2 border rounded"
        >
          <option value="">Select User</option>
          {users.map(user => (
            <option key={user.id} value={user.id}>
              {user.email}
            </option>
          ))}
        </select>
        
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Amount to add (USDT)"
          className="w-full p-2 border rounded"
        />
        
        <button
          onClick={addFunds}
          disabled={!selectedUser || !amount}
          className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          Add Funds
        </button>
      </div>
    </div>
  );
}
```

## 🔧 How the Escrow System Works

### For Regular Users
1. **Balance Check**: System verifies wallet balance ≥ prize amount
2. **Escrow Lock**: Funds are held when giveaway is created
3. **Release**: Funds released to winner when giveaway completes

### For Admin Users
1. **Bypass**: Admins can create giveaways without balance checks
2. **Override**: `escrow_amount` set to 0 for admin-created giveaways
3. **Management**: Admins can add funds to any user's wallet

### Database Flow
```sql
-- When user creates giveaway:
INSERT INTO giveaways (prize_amount, ...) 
-- RLS Policy checks:
-- IF admin: Allow
-- IF user has balance ≥ prize_amount: Allow  
-- ELSE: Reject with insufficient funds error
```

## 🧪 Testing the Integration

### Test Cases

1. **Admin Bypass Test**
   - Login as admin
   - Create giveaway with any prize amount
   - Should succeed regardless of wallet balance

2. **Sufficient Funds Test**
   - Add funds to user wallet: `SELECT onagui.add_funds_to_wallet('user-id', 100.00);`
   - Create giveaway with prize ≤ wallet balance
   - Should succeed

3. **Insufficient Funds Test**
   - User with $0 wallet balance
   - Try to create $50 giveaway
   - Should fail with clear error message

4. **Balance Display Test**
   - Wallet balance should update in real-time
   - Should show current balance before form submission

## 📝 Error Messages

The system will provide clear error messages:

- **Insufficient Funds**: "Insufficient funds. You need $50.00 USDT but only have $25.00 USDT in your wallet."
- **No Wallet**: "Wallet not found. Please contact support."
- **Admin Success**: "Giveaway created successfully (admin bypass - no escrow required)."
- **User Success**: "Giveaway created successfully. $50.00 USDT held in escrow."

## 🔄 Migration Notes

### Existing Giveaways
- Existing giveaways will continue to work
- `prize_amount` column already exists
- No data migration needed

### Policy Changes
- Old `giveaways_insert_owner` policy will be replaced
- New escrow policy includes balance checking
- Admin bypass policy remains functional

## 🚀 Next Steps

1. **Apply SQL Script** - Run `implement-escrow-system.sql`
2. **Update Frontend** - Add wallet balance display and validation
3. **Test Thoroughly** - Verify admin bypass and user balance checking
4. **Add Admin Tools** - Implement wallet management interface
5. **Monitor** - Watch for any escrow-related issues

The escrow system provides a robust foundation for ensuring giveaway integrity while maintaining admin flexibility!