# Raffle Escrow Smart Contract

## Overview
Secure on-chain escrow system for Onagui raffle platform built with Solidity and deployed on Polygon.

## Features
- ✅ USDC escrow for raffle funds
- ✅ 2% platform fee
- ✅ Automated refunds on cancellation
- ✅ Transparent on-chain verification
- ✅ Emergency withdraw mechanism
- ✅ ReentrancyGuard protection

## Setup

### 1. Install Dependencies
```bash
cd contracts
npm install --save-dev hardhat @nomiclabs/hardhat-waffle @nomiclabs/hardhat-ethers @nomiclabs/hardhat-etherscan @openzeppelin/contracts ethers ethereum-waffle chai
```

### 2. Configure Environment
```bash
cp .env.example .env
```

Edit `.env` and add:
- `PRIVATE_KEY` - Your deployer wallet private key
- `POLYGONSCAN_API_KEY` - For contract verification

### 3. Compile Contracts
```bash
npx hardhat compile
```

### 4. Deploy to Mumbai Testnet (Test First!)
```bash
npm run deploy:mumbai
```

### 5. Deploy to Polygon Mainnet
```bash
npm run deploy:polygon
```

### 6. Verify Contract
Contract verification happens automatically during deployment. If needed, manually verify:
```bash
npx hardhat verify --network polygon <CONTRACT_ADDRESS> <USDC_ADDRESS>
```

## Contract Architecture

### RaffleEscrow.sol
Main escrow contract that manages raffle lifecycle:

**Key Functions:**
- `createRaffle()` - Create raffle with cancellation fee
- `purchaseTickets()` - Buy tickets with USDC
- `completeRaffle()` - Release funds to creator (admin only)
- `cancelRaffle()` - Cancel and enable refunds
- `claimRefund()` - Claim refund after cancellation
- `withdrawPlatformFees()` - Withdraw collected fees (admin only)

**Security Features:**
- ReentrancyGuard on all state-changing functions
- Ownable for admin functions
- SafeERC20 for token transfers
- Emergency withdraw function

## Fee Structure
- **Platform Fee**: 2% of total funds
- **Cancellation Fee**: 2% of prize value (non-refundable)

## USDC Addresses
- **Polygon Mainnet**: `0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174`
- **Mumbai Testnet**: `0x0FA8781a83E46826621b3BC094Ea2A0212e71B23`

## Frontend Integration

### Install ethers.js
```bash
npm install ethers
```

### Usage Example
```typescript
import { createRaffleOnChain, purchaseTicketsOnChain } from '@/lib/escrow'

// Create raffle
await createRaffleOnChain(signer, raffleId, 1000, 100, 10)

// Purchase tickets
await purchaseTicketsOnChain(signer, raffleId, 5, 10)
```

## Testing
```bash
npm run test
```

## Gas Optimization
- Compiler optimizations enabled (200 runs)
- Efficient storage patterns
- Minimal external calls

## Audit Recommendations
Before mainnet deployment:
1. Professional smart contract audit
2. Extensive testnet testing
3. Bug bounty program
4. Gradual rollout with limits

## License
MIT
