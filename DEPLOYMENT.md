# Cryptocurrency Wallet System - Deployment Guide

This guide covers the complete deployment process for the cryptocurrency wallet system, including infrastructure setup, security configuration, and monitoring.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Database Setup](#database-setup)
4. [Security Configuration](#security-configuration)
5. [Application Deployment](#application-deployment)
6. [Service Configuration](#service-configuration)
7. [Monitoring Setup](#monitoring-setup)
8. [Production Checklist](#production-checklist)
9. [Maintenance](#maintenance)

## Prerequisites

### Infrastructure Requirements

- **Server**: Minimum 4 CPU cores, 8GB RAM, 100GB SSD
- **Operating System**: Ubuntu 20.04+ or similar Linux distribution
- **Node.js**: Version 18.x or higher
- **Database**: PostgreSQL 14+ (Supabase recommended)
- **SSL Certificate**: Valid SSL certificate for HTTPS
- **Domain**: Registered domain name

### External Services

- **Supabase Account**: For database and authentication
- **Ethereum RPC Provider**: Infura, Alchemy, or similar
- **Email Service**: For notifications (SendGrid, AWS SES, etc.)
- **Monitoring**: Uptime monitoring service

## Environment Setup

### 1. Clone and Install

```bash
git clone <your-repository>
cd wallet-system
npm install
```

### 2. Environment Variables

Create `.env.local` file:

```bash
# Application
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-domain.com

# Supabase
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Ethereum Network
ETHEREUM_NETWORK=mainnet
ETHEREUM_RPC_URL=your-ethereum-rpc-url
USDT_CONTRACT_ADDRESS=0xdAC17F958D2ee523a2206206994597C13D831ec7

# Hot Wallet (CRITICAL - Keep Secure)
HOT_WALLET_PRIVATE_KEY=your-hot-wallet-private-key
HOT_WALLET_ADDRESS=your-hot-wallet-address

# Security
ENCRYPTION_KEY=your-32-character-encryption-key
JWT_SECRET=your-jwt-secret

# Rate Limiting
RATE_LIMIT_ENABLED=true
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100

# Withdrawal Limits
MAX_WITHDRAWAL_AMOUNT=10000
MIN_WITHDRAWAL_AMOUNT=1
DAILY_WITHDRAWAL_LIMIT=50000

# Monitoring
ALERT_EMAIL=admin@your-domain.com
SLACK_WEBHOOK_URL=your-slack-webhook-url

# Gas Settings
GAS_PRICE_MULTIPLIER=1.2
MAX_GAS_PRICE=100
GAS_LIMIT=21000
```

### 3. Security Configuration

```bash
# Set proper file permissions
chmod 600 .env.local
chown app:app .env.local

# Create app user (if not exists)
sudo useradd -m -s /bin/bash app
sudo usermod -aG sudo app
```

## Database Setup

### 1. Supabase Configuration

1. Create a new Supabase project
2. Configure authentication providers
3. Set up Row Level Security (RLS)
4. Apply database migrations

### 2. Apply Migrations

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Apply migrations
supabase db push
```

### 3. Database Indexes

Ensure these indexes exist for performance:

```sql
-- User wallets
CREATE INDEX CONCURRENTLY idx_user_wallets_user_id ON user_wallets(user_id);
CREATE INDEX CONCURRENTLY idx_user_wallets_address ON user_wallets(address);

-- Transactions
CREATE INDEX CONCURRENTLY idx_deposit_transactions_address ON deposit_transactions(to_address);
CREATE INDEX CONCURRENTLY idx_deposit_transactions_status ON deposit_transactions(status);
CREATE INDEX CONCURRENTLY idx_withdrawal_requests_user_id ON withdrawal_requests(user_id);
CREATE INDEX CONCURRENTLY idx_withdrawal_requests_status ON withdrawal_requests(status);

-- Monitoring
CREATE INDEX CONCURRENTLY idx_rate_limit_log_user_id ON rate_limit_log(user_id);
CREATE INDEX CONCURRENTLY idx_reconciliation_log_timestamp ON reconciliation_log(timestamp);
```

## Security Configuration

### 1. Hot Wallet Security

```bash
# Generate secure private key (if needed)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Store private key securely
# Option 1: Environment variable (basic)
export HOT_WALLET_PRIVATE_KEY="your-private-key"

# Option 2: AWS Secrets Manager (recommended)
aws secretsmanager create-secret \
  --name "wallet-system/hot-wallet-key" \
  --secret-string "your-private-key"

# Option 3: HashiCorp Vault (enterprise)
vault kv put secret/wallet-system hot-wallet-key="your-private-key"
```

### 2. SSL/TLS Configuration

```nginx
# Nginx configuration
server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 3. Firewall Configuration

```bash
# UFW firewall rules
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

## Application Deployment

### 1. Build Application

```bash
npm run build
```

### 2. Process Manager (PM2)

```bash
# Install PM2
npm install -g pm2

# Create ecosystem file
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [
    {
      name: 'wallet-app',
      script: 'npm',
      args: 'start',
      cwd: '/path/to/wallet-system',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      instances: 'max',
      exec_mode: 'cluster',
      max_memory_restart: '1G',
      error_file: '/var/log/wallet-app/error.log',
      out_file: '/var/log/wallet-app/out.log',
      log_file: '/var/log/wallet-app/combined.log'
    },
    {
      name: 'wallet-services',
      script: 'npm',
      args: 'run wallet:start',
      cwd: '/path/to/wallet-system',
      env: {
        NODE_ENV: 'production'
      },
      instances: 1,
      exec_mode: 'fork',
      max_memory_restart: '512M',
      error_file: '/var/log/wallet-services/error.log',
      out_file: '/var/log/wallet-services/out.log',
      log_file: '/var/log/wallet-services/combined.log'
    }
  ]
};
EOF

# Start applications
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 3. Systemd Service (Alternative)

```bash
# Create systemd service
sudo cat > /etc/systemd/system/wallet-system.service << EOF
[Unit]
Description=Wallet System
After=network.target

[Service]
Type=simple
User=app
WorkingDirectory=/path/to/wallet-system
Environment=NODE_ENV=production
ExecStart=/usr/bin/npm start
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# Enable and start service
sudo systemctl enable wallet-system
sudo systemctl start wallet-system
```

## Service Configuration

### 1. Wallet Services

The wallet services run as background processes:

- **On-Chain Monitor**: Monitors blockchain for deposits
- **Withdrawal Worker**: Processes withdrawal requests
- **Reconciliation Monitor**: Verifies balance consistency

### 2. Health Checks

Configure health check endpoints:

```bash
# Add to crontab for monitoring
*/5 * * * * curl -f http://localhost:3000/api/system/health || echo "Health check failed" | mail -s "Wallet System Alert" admin@your-domain.com
```

### 3. Log Rotation

```bash
# Configure logrotate
sudo cat > /etc/logrotate.d/wallet-system << EOF
/var/log/wallet-*/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 app app
    postrotate
        pm2 reload all
    endscript
}
EOF
```

## Monitoring Setup

### 1. Application Monitoring

```javascript
// Add to your monitoring service
const healthCheck = async () => {
  try {
    const response = await fetch('https://your-domain.com/api/system/health');
    const health = await response.json();
    
    if (health.overall !== 'healthy') {
      // Send alert
      await sendAlert(`System health: ${health.overall}`, health);
    }
  } catch (error) {
    await sendAlert('Health check failed', error);
  }
};

setInterval(healthCheck, 60000); // Check every minute
```

### 2. Database Monitoring

```sql
-- Monitor database performance
SELECT 
  schemaname,
  tablename,
  n_tup_ins as inserts,
  n_tup_upd as updates,
  n_tup_del as deletes
FROM pg_stat_user_tables
WHERE schemaname = 'public';

-- Monitor active connections
SELECT count(*) as active_connections 
FROM pg_stat_activity 
WHERE state = 'active';
```

### 3. Blockchain Monitoring

```javascript
// Monitor hot wallet balance
const checkHotWalletBalance = async () => {
  const provider = new ethers.JsonRpcProvider(process.env.ETHEREUM_RPC_URL);
  const balance = await provider.getBalance(process.env.HOT_WALLET_ADDRESS);
  const balanceEth = ethers.formatEther(balance);
  
  if (parseFloat(balanceEth) < 0.1) {
    await sendAlert('Hot wallet balance low', { balance: balanceEth });
  }
};
```

## Production Checklist

### Pre-Deployment

- [ ] Environment variables configured
- [ ] SSL certificate installed
- [ ] Database migrations applied
- [ ] Hot wallet funded with ETH for gas
- [ ] Firewall configured
- [ ] Backup strategy implemented
- [ ] Monitoring configured
- [ ] Load testing completed

### Security Checklist

- [ ] Private keys stored securely
- [ ] Rate limiting enabled
- [ ] Input validation implemented
- [ ] SQL injection protection
- [ ] XSS protection enabled
- [ ] CSRF protection enabled
- [ ] Security headers configured
- [ ] Audit logs enabled

### Performance Checklist

- [ ] Database indexes optimized
- [ ] Caching configured
- [ ] CDN configured (if applicable)
- [ ] Compression enabled
- [ ] Image optimization
- [ ] Bundle size optimized

### Monitoring Checklist

- [ ] Health checks configured
- [ ] Error tracking enabled
- [ ] Performance monitoring
- [ ] Log aggregation
- [ ] Alert notifications
- [ ] Uptime monitoring
- [ ] Security monitoring

## Maintenance

### Daily Tasks

- Check system health dashboard
- Review error logs
- Monitor hot wallet balance
- Verify withdrawal processing

### Weekly Tasks

- Review security logs
- Check database performance
- Update dependencies (if needed)
- Backup verification

### Monthly Tasks

- Security audit
- Performance optimization
- Capacity planning
- Disaster recovery testing

### Emergency Procedures

#### Hot Wallet Compromise

1. Immediately stop all services
2. Transfer remaining funds to secure wallet
3. Generate new hot wallet
4. Update environment variables
5. Restart services
6. Notify users if necessary

#### Database Issues

1. Check database connectivity
2. Review recent migrations
3. Check disk space
4. Restore from backup if necessary
5. Update DNS if switching databases

#### Service Outage

1. Check system health endpoint
2. Review service logs
3. Restart affected services
4. Scale resources if needed
5. Communicate with users

## Support

For deployment issues or questions:

- Check logs: `/var/log/wallet-*/*.log`
- Health check: `https://your-domain.com/api/system/health`
- Service status: `pm2 status` or `systemctl status wallet-system`

## Security Contacts

- **Security Issues**: security@your-domain.com
- **Emergency**: +1-XXX-XXX-XXXX
- **Incident Response**: incident@your-domain.com