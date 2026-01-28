# Escrow System Configuration

Add these to your `.env.local` file:

```env
# Platform Escrow Wallet (where all donations are held)
NEXT_PUBLIC_PLATFORM_ESCROW_WALLET=0xYourPlatformWalletAddress

# Platform Fee Settings
NEXT_PUBLIC_PLATFORM_FEE_PERCENTAGE=2.9
NEXT_PUBLIC_PLATFORM_FEE_FIXED=0.30

# Admin wallet for processing withdrawals
ADMIN_WALLET_PRIVATE_KEY=your_admin_private_key_here
```

## Setup Steps:

### 1. Run the SQL Migration
Run `ADD_ESCROW_KYC_SYSTEM.sql` in your Supabase SQL Editor

### 2. Create Platform Escrow Wallet
- Create a new wallet (MetaMask or similar)
- This wallet will receive ALL donations
- Keep the private key secure
- Add the address to `NEXT_PUBLIC_PLATFORM_ESCROW_WALLET`

### 3. How It Works:

**Donation Flow:**
```
1. User donates $100 USDC
2. Fee calculated: 2.9% + $0.30 = $3.20
3. $100 sent to PLATFORM_ESCROW_WALLET
4. Database records:
   - donation.amount = $100
   - donation.platform_fee = $3.20
   - donation.net_amount = $96.80
5. Fundraiser escrow_balance += $96.80
6. Platform revenue += $3.20
```

**Withdrawal Flow:**
```
1. Fundraiser reaches goal or creator closes it
2. System prompts for KYC (name, phone, passport)
3. Creator submits KYC documents
4. Admin reviews and approves KYC
5. Creator requests withdrawal
6. Admin processes: sends $96.80 from escrow to creator's wallet
7. Platform keeps $3.20 as revenue
```

### 4. Database Tables Created:

- **fundraiser_kyc**: Stores KYC documents and verification status
- **withdrawal_requests**: Tracks payout requests
- **platform_revenue**: Tracks platform earnings
- **donations**: Updated with fee tracking

### 5. Next Steps:

1. Create KYC submission UI component
2. Create admin dashboard for KYC approval
3. Create withdrawal request UI
4. Implement automated withdrawal processing
5. Add storage bucket for KYC documents

Would you like me to create these UI components now?
