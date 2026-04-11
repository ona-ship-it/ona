# Crypto Payments Integration Guide

This guide explains how to integrate and use the cryptocurrency payment system for raffles and giveaways on Onagui.

## Overview

The platform supports payments in three major cryptocurrencies:
- **Solana (SOL)** - Via Phantom Wallet
- **Bitcoin (BTC)** - Via Sats Connect
- **Ethereum (ETH)** and EVM chains - Via Ethers.js or Web3 wallets

## Supported Networks

### Solana
- **Network**: Solana Mainnet Beta
- **Wallet**: Phantom (primary), Solflare (compatible)
- **Payment Token**: SOL (native) or USDC
- **Confirmation**: 32 confirmations recommended

### Bitcoin
- **Network**: Bitcoin Mainnet
- **Wallet**: Sats Connect compatible wallets
- **Payment**: Native BTC only
- **Confirmation**: 6 confirmations (approximately 1 hour)

### Ethereum & EVM
- **Networks**: Ethereum, Polygon, Arbitrum, Optimism
- **Wallet**: MetaMask, WalletConnect, etc.
- **Payment Tokens**: ETH, USDC, USDT (depends on chain)
- **Confirmation**: Based on network (12-15 blocks for Ethereum)

## Wallet Setup

### For Users

#### Solana (Phantom Wallet)
1. Install Phantom browser extension
2. Create or import a wallet
3. Fund with SOL from an exchange
4. Connect to Onagui via the "Connect Wallet" button

#### Bitcoin (Sats Connect)
1. Use a compatible Bitcoin wallet (Leather, etc.)
2. Ensure wallet supports Sats Connect protocol
3. Fund Bitcoin address
4. Connect via Sats Connect during purchase

#### Ethereum (MetaMask)
1. Install MetaMask browser extension
2. Create or import a wallet
3. Add funds via bridge or exchange
4. Connect via WalletConnect or direct MetaMask integration

### For Developers

Configure wallet providers in your Next.js app:

```tsx
// src/hooks/useWallet.tsx
import { useWallet as useSolanaWallet } from '@solana/wallet-adapter-react'
import { ethers } from 'ethers'
import { satConnect } from 'sats-connect'

export function useWallet() {
  const solanaWallet = useSolanaWallet()
  const [ethProvider, setEthProvider] = useState(null)
  
  const connectEthereumWallet = async () => {
    if (window.ethereum) {
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      })
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      setEthProvider(provider)
    }
  }

  return {
    solana: solanaWallet,
    ethereum: { provider: ethProvider, connect: connectEthereumWallet },
    bitcoin: { /* Sats Connect */ }
  }
}
```

## Making Crypto Payments

### API Endpoint

```
POST /api/raffles/{raffleId}/buy-crypto
```

### Request Format

```json
{
  "quantity": 5,
  "paymentMethod": "solana",
  "walletAddress": "EPjFWaJxNvtokMV8xjVHzpHXDCAjLpwxKDDpUSzgYqyG",
  "transactionHash": "5qbHMLyHXfLdhqsUYvuUQVpLCnK8AZtPZjNnhqV"
}
```

### Response Format

```json
{
  "data": {
    "ticketId": "ticket_123",
    "raffleId": "raffle_456",
    "quantity": 5,
    "totalPrice": 50,
    "currency": "SOL",
    "paymentMethod": "solana",
    "status": "confirmed",
    "ticketNumbers": [46, 47, 48, 49, 50],
    "transactionHash": "5qbHMLyHXfLdhqsUYvuUQVpLCnK8AZtPZjNnhqV",
    "confirmedAt": "2024-03-12T15:30:00Z"
  },
  "status": "success"
}
```

## Implementation Example

### Solana Payment Flow

```tsx
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { Transaction, SystemProgram, PublicKey } from '@solana/web3.js'

export async function purchaseRaffleTicketsSolana(
  raffleId: string,
  quantity: number,
  ticketPrice: number
) {
  const { connection } = useConnection()
  const { publicKey, sendTransaction } = useWallet()

  if (!publicKey) throw new Error('Wallet not connected')

  // Create transaction
  const transaction = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: publicKey,
      toPubkey: new PublicKey('MERCHANT_WALLET_ADDRESS'),
      lamports: ticketPrice * quantity * 1e9, // Convert SOL to lamports
    })
  )

  // Send transaction
  const signature = await sendTransaction(transaction, connection)
  
  // Wait for confirmation
  const confirmation = await connection.confirmTransaction(signature)
  
  // Process payment on backend
  const response = await fetch(`/api/raffles/${raffleId}/buy-crypto`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      quantity,
      paymentMethod: 'solana',
      walletAddress: publicKey.toBase58(),
      transactionHash: signature,
    }),
  })

  return response.json()
}
```

### Ethereum Payment Flow

```tsx
import { ethers } from 'ethers'

export async function purchaseRaffleTicketsEthereum(
  raffleId: string,
  quantity: number,
  ticketPrice: number
) {
  const provider = new ethers.providers.Web3Provider(window.ethereum)
  const signer = provider.getSigner()
  const userAddress = await signer.getAddress()

  // Create transaction
  const tx = await signer.sendTransaction({
    to: 'MERCHANT_WALLET_ADDRESS',
    value: ethers.utils.parseEther(
      (ticketPrice * quantity).toString()
    ),
  })

  // Wait for confirmation
  const receipt = await tx.wait(12) // Wait for 12 block confirmations

  // Process payment on backend
  const response = await fetch(`/api/raffles/${raffleId}/buy-crypto`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      quantity,
      paymentMethod: 'ethereum',
      walletAddress: userAddress,
      transactionHash: tx.hash,
    }),
  })

  return response.json()
}
```

## Transaction Verification

### Solana Verification

The backend verifies Solana transactions by:
```typescript
const signature = await connection.getSignatureStatus(transactionHash)
if (signature.value?.confirmationStatus === 'confirmed') {
  // Payment verified
}
```

### Ethereum Verification

The backend verifies Ethereum transactions by:
```typescript
const receipt = await provider.getTransactionReceipt(transactionHash)
if (receipt?.confirmations >= 12) {
  // Payment verified
}
```

### Bitcoin Verification

Bitcoin transactions are verified using blockchain.com API or similar:
```typescript
const tx = await fetch(
  `https://blockchain.info/rawtx/${transactionHash}?format=json`
)
if (tx.confirmations >= 6) {
  // Payment verified
}
```

## Security Considerations

### On Frontend
- ✅ Validate wallet connections
- ✅ Display clear transaction details before signing
- ✅ Never expose private keys
- ✅ Use hardware wallets for large amounts

### On Backend
- ✅ Always verify transaction signatures
- ✅ Check transaction recipient matches merchant wallet
- ✅ Verify amount matches expected price
- ✅ Implement rate limiting
- ✅ Log all transactions
- ✅ Use HTTPS only
- ✅ Implement webhook verification

### Contract Interactions (Future)
- Deploy smart contracts for escrow
- Implement atomic swaps
- Add multi-sig wallets for merchant funds

## Testing

### Testnet Configuration

For development/testing, configure testnets:

```env
# .env.local
NEXT_PUBLIC_NETWORK=testnet
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com
```

### Test Funds

- **Solana Devnet**: Use airdrop via CLI
- **Bitcoin Testnet**: Get free testnet BTC from faucets
- **Ethereum Sepolia**: Get testnet ETH from faucets

### Test Transactions

```bash
# Solana - Send test transaction
solana transfer <recipient> 1 --network devnet

# Bitcoin - Send test transaction
bitcoin-cli -testnet sendtoaddress <address> 0.001

# Ethereum - Send test transaction via ethers.js (see examples above)
```

## Error Handling

### Common Errors

```javascript
{
  "error": "Invalid transaction signature",
  "status": "error"
}

{
  "error": "Transaction not confirmed",
  "status": "error"
}

{
  "error": "Insufficient funds",
  "status": "error"
}

{
  "error": "Wallet address invalid for solana network",
  "status": "error"
}
```

## Best Practices

1. **Always wait for confirmation** - Don't process payments until blockchain confirms
2. **Show user feedback** - Display transaction status in UI
3. **Handle failures gracefully** - Retry logic for temporary failures
4. **Store transaction hashes** - For audit and refund purposes
5. **Monitor gas prices** - Warn users of high network fees
6. **Use rate limiting** - Prevent spam/DoS attacks

## Future Enhancements

- [ ] Stablecoin support (USDC, USDT, DAI)
- [ ] Layer 2 scaling (Lightning Network, Polygon)
- [ ] Batch transactions
- [ ] Refund management
- [ ] Fiat on-ramp integration
- [ ] Multi-sig wallets
- [ ] DAO treasury integration

## Troubleshooting

### Transaction Not Confirming

1. Check network status (status.solana.com)
2. Try with higher gas price/fee
3. Wait for longer confirmation time
4. Check wallet balance

### Wallet Not Connecting

1. Ensure wallet extension installed
2. Check wallet is unlocked
3. Try different browser
4. Clear browser cache

### Invalid Address Error

1. Verify address format for network
2. Check address isn't mainnet on testnet (or vice versa)
3. Use address encoding for network (base58 for Solana, hex for Ethereum)

## Support

For questions or issues:
- Documentation: https://onagui.com/docs/crypto-payments
- GitHub Issues: https://github.com/ona-ship-it/ona/issues
- Email: support@onagui.com
