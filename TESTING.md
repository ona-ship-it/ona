# Wallet System Testing Guide

This guide covers comprehensive testing of the cryptocurrency wallet system on testnets before mainnet deployment.

## 🚀 Quick Start

1. **Setup Environment**
   ```bash
   cp .env.test .env.local
   # Edit .env.local with your testnet configuration
   ```

2. **Run Unit Tests**
   ```bash
   npm run test:unit
   ```

3. **Run Testnet Integration Tests**
   ```bash
   npm run test:testnet
   ```

4. **Run All Tests**
   ```bash
   npm run test:all
   ```

## 📋 Test Configuration

### Environment Variables

Copy `.env.test` to `.env.local` and configure:

```bash
# Testnet RPC (choose one)
TESTNET_RPC_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_ID
# TESTNET_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY
# TESTNET_RPC_URL=https://rpc.sepolia.org  # Public endpoint (rate limited)

# Deploy a test USDT contract or use existing testnet USDT
TESTNET_USDT_ADDRESS=0x...

# Create a test wallet (NEVER use mainnet keys)
TESTNET_HOT_WALLET_PRIVATE_KEY=0x...
```

### Test Networks

**Recommended Testnets:**
- **Sepolia** (Ethereum testnet) - Most stable
- **Goerli** (Ethereum testnet) - Being deprecated
- **Mumbai** (Polygon testnet) - For Polygon testing

## 🧪 Test Types

### 1. Unit Tests (`npm run test:unit`)

Tests individual functions without blockchain interaction:

- ✅ Balance calculations
- ✅ Transfer validation
- ✅ Withdrawal validation
- ✅ Rate limiting logic
- ✅ Idempotency logic
- ✅ Encryption/decryption
- ✅ Amount formatting
- ✅ Address validation

**Duration:** ~30 seconds  
**Requirements:** Database connection only

### 2. Integration Tests (`npm run test:testnet`)

Tests complete flows with real blockchain interaction:

- ✅ Basic wallet operations
- ✅ Concurrent transfers (race condition testing)
- ✅ On-chain deposit flow
- ✅ On-chain withdrawal flow
- ✅ Rate limiting enforcement
- ✅ Idempotency enforcement
- ✅ Error handling
- ✅ Balance reconciliation

**Duration:** ~5-10 minutes  
**Requirements:** Testnet RPC, test USDT, test ETH

## 🔧 Test Setup

### 1. Get Testnet ETH

**Sepolia Faucets:**
- https://sepoliafaucet.com/
- https://www.alchemy.com/faucets/ethereum-sepolia
- https://faucet.quicknode.com/ethereum/sepolia

### 2. Deploy Test USDT Contract

```solidity
// Simple test USDT contract
pragma solidity ^0.8.0;

contract TestUSDT {
    mapping(address => uint256) public balanceOf;
    uint8 public decimals = 6;
    string public name = "Test USDT";
    string public symbol = "TUSDT";
    
    constructor() {
        balanceOf[msg.sender] = 1000000 * 10**6; // 1M test USDT
    }
    
    function transfer(address to, uint256 amount) public returns (bool) {
        require(balanceOf[msg.sender] >= amount, "Insufficient balance");
        balanceOf[msg.sender] -= amount;
        balanceOf[to] += amount;
        return true;
    }
    
    function mint(address to, uint256 amount) public {
        balanceOf[to] += amount;
    }
}
```

### 3. Fund Hot Wallet

```bash
# Send test ETH for gas
# Send test USDT for withdrawals
```

## 🏃‍♂️ Running Tests

### Unit Tests Only
```bash
npm run test:unit
```

### Testnet Integration Tests
```bash
# Ensure testnet configuration is complete
npm run test:testnet
```

### Background Services
```bash
# Start on-chain monitor
npm run wallet:monitor

# Start withdrawal worker
npm run wallet:worker

# Start reconciliation monitor
npm run wallet:reconcile
```

## 📊 Test Scenarios

### Concurrent Transfer Testing

The test suite simulates multiple users performing concurrent operations:

```javascript
// 5 users performing 10 concurrent operations each
const CONCURRENT_USERS = 5;
const CONCURRENT_OPERATIONS = 10;
```

This tests:
- Database transaction isolation
- Race condition handling
- Balance consistency
- Deadlock prevention

### Rate Limiting Testing

Tests enforce configured limits:
- 10 transfers per minute per user
- 2 withdrawals per day per user
- 60 balance checks per minute per user

### Idempotency Testing

Tests duplicate request handling:
- Same idempotency key returns cached response
- Different keys process normally
- Expired keys allow new processing

### Error Handling Testing

Tests various error conditions:
- Insufficient balance
- Invalid addresses
- Network failures
- Database errors

## 🔍 Monitoring During Tests

### Database Monitoring

```sql
-- Check active connections
SELECT count(*) FROM pg_stat_activity;

-- Check for locks
SELECT * FROM pg_locks WHERE NOT granted;

-- Check recent transactions
SELECT * FROM ledger ORDER BY created_at DESC LIMIT 10;
```

### Blockchain Monitoring

```bash
# Check transaction status
curl -X POST $TESTNET_RPC_URL \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_getTransactionByHash","params":["0x..."],"id":1}'
```

## 🚨 Test Alerts

The system monitors for:

- **Pending withdrawals > 10**
- **Failed withdrawals > 5**
- **Hot wallet balance < $500**
- **Reconciliation discrepancies**

## 📈 Performance Benchmarks

Expected performance on testnets:

| Operation | Target Time | Concurrent Users |
|-----------|-------------|------------------|
| Balance Check | < 100ms | 100 |
| Internal Transfer | < 200ms | 50 |
| Withdrawal Request | < 500ms | 10 |
| Deposit Detection | < 5 minutes | N/A |

## 🔒 Security Testing

### Private Key Security
- ✅ Keys encrypted at rest
- ✅ Keys decrypted only during signing
- ✅ No keys in logs or error messages
- ✅ Secure key rotation process

### API Security
- ✅ Rate limiting enforced
- ✅ Idempotency keys required
- ✅ Input validation
- ✅ SQL injection prevention

### Transaction Security
- ✅ Atomic balance updates
- ✅ Double-spend prevention
- ✅ Withdrawal limits enforced
- ✅ Address validation

## 🐛 Troubleshooting

### Common Issues

**1. RPC Rate Limiting**
```
Error: Too Many Requests
```
Solution: Use paid RPC provider or reduce polling frequency

**2. Insufficient Gas**
```
Error: insufficient funds for gas
```
Solution: Fund hot wallet with more test ETH

**3. Database Connection**
```
Error: connection terminated
```
Solution: Check Supabase connection and credentials

**4. Contract Not Found**
```
Error: contract not deployed
```
Solution: Verify USDT contract address and network

### Debug Mode

Enable detailed logging:
```bash
ENABLE_DETAILED_LOGGING=true npm run test:testnet
```

## 📝 Test Reports

Tests generate detailed reports:

```
📊 Test Results Summary
========================
✅ Passed: 8
❌ Failed: 0
📈 Success Rate: 100.0%

🎯 Test suite completed
```

## 🚀 Mainnet Preparation

Before mainnet deployment:

1. ✅ All tests pass on testnet
2. ✅ Performance benchmarks met
3. ✅ Security audit completed
4. ✅ Monitoring alerts configured
5. ✅ Backup procedures tested
6. ✅ Key rotation procedures tested
7. ✅ Emergency procedures documented

## 📞 Support

For testing issues:
1. Check this guide
2. Review error logs
3. Verify environment configuration
4. Test with minimal amounts first

## 🔄 Continuous Testing

Recommended testing schedule:
- **Unit tests:** Every commit
- **Integration tests:** Daily
- **Full testnet tests:** Weekly
- **Performance tests:** Monthly

---

**⚠️ Important:** Never use mainnet private keys or real funds during testing. Always use testnets with test tokens.