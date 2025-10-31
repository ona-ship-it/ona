#!/usr/bin/env node

/**
 * Wallet Services Startup Script
 * 
 * This script initializes and starts all wallet-related services:
 * - On-chain monitor for deposit detection
 * - Withdrawal worker for processing withdrawals
 * - Reconciliation monitor for balance verification
 * - Hot wallet service for transaction management
 */

const path = require('path');
const { spawn } = require('child_process');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '../../.env.local') });

const services = [
  {
    name: 'On-Chain Monitor',
    script: 'src/services/onChainMonitor.js',
    env: { ...process.env, SERVICE_NAME: 'on-chain-monitor' }
  },
  {
    name: 'Withdrawal Worker',
    script: 'src/services/withdrawalWorker.js',
    env: { ...process.env, SERVICE_NAME: 'withdrawal-worker' }
  },
  {
    name: 'Reconciliation Monitor',
    script: 'src/services/reconciliationMonitor.js',
    env: { ...process.env, SERVICE_NAME: 'reconciliation-monitor' }
  }
];

const runningProcesses = [];

function startService(service) {
  console.log(`Starting ${service.name}...`);
  
  const child = spawn('node', [service.script], {
    cwd: path.join(__dirname, '../..'),
    env: service.env,
    stdio: ['inherit', 'pipe', 'pipe']
  });

  child.stdout.on('data', (data) => {
    console.log(`[${service.name}] ${data.toString().trim()}`);
  });

  child.stderr.on('data', (data) => {
    console.error(`[${service.name}] ERROR: ${data.toString().trim()}`);
  });

  child.on('close', (code) => {
    console.log(`[${service.name}] Process exited with code ${code}`);
    if (code !== 0) {
      console.log(`[${service.name}] Restarting in 5 seconds...`);
      setTimeout(() => startService(service), 5000);
    }
  });

  child.on('error', (err) => {
    console.error(`[${service.name}] Failed to start: ${err.message}`);
  });

  runningProcesses.push({ name: service.name, process: child });
  return child;
}

function gracefulShutdown() {
  console.log('\nShutting down wallet services...');
  
  runningProcesses.forEach(({ name, process }) => {
    console.log(`Stopping ${name}...`);
    process.kill('SIGTERM');
  });

  setTimeout(() => {
    console.log('Force killing remaining processes...');
    runningProcesses.forEach(({ process }) => {
      process.kill('SIGKILL');
    });
    process.exit(0);
  }, 10000);
}

// Handle graceful shutdown
process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

// Validate environment
const requiredEnvVars = [
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'ETHEREUM_RPC_URL',
  'HOT_WALLET_PRIVATE_KEY',
  'USDT_CONTRACT_ADDRESS'
];

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingVars.length > 0) {
  console.error('Missing required environment variables:');
  missingVars.forEach(varName => console.error(`  - ${varName}`));
  process.exit(1);
}

console.log('='.repeat(60));
console.log('🚀 Starting Wallet Services');
console.log('='.repeat(60));
console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`Network: ${process.env.ETHEREUM_NETWORK || 'sepolia'}`);
console.log(`Hot Wallet: ${process.env.HOT_WALLET_ADDRESS || 'Not configured'}`);
console.log('='.repeat(60));

// Start all services
services.forEach(service => {
  startService(service);
});

console.log('\n✅ All wallet services started successfully!');
console.log('Press Ctrl+C to stop all services\n');

// Keep the main process alive
setInterval(() => {
  // Health check - could be expanded to ping services
}, 30000);