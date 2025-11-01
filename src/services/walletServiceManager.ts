/**
 * Wallet Service Manager
 * 
 * Coordinates all wallet-related services and provides a unified interface
 * for the main application to interact with the cryptocurrency wallet system.
 */

import { OnChainMonitor } from './onChainMonitor';
import { HotWalletService } from './hotWallet';
import { WithdrawalWorker } from './withdrawalWorker';
import { ReconciliationMonitor } from './reconciliationMonitor';
import { createClient } from '@supabase/supabase-js';

interface WalletConfig {
  supabaseUrl: string;
  supabaseServiceKey: string;
  rpcUrl: string;
  usdtContractAddress: string;
  hotWalletPrivateKey: string;
  encryptionKey: string;
  networkName: string;
  chainId: number;
}

interface ServiceStatus {
  name: string;
  status: 'running' | 'stopped' | 'error';
  lastActivity?: Date;
  error?: string;
}

export class WalletServiceManager {
  private config: WalletConfig;
  private supabase: any;
  private onChainMonitor?: OnChainMonitor;
  private hotWalletService?: HotWalletService;
  private withdrawalWorker?: WithdrawalWorker;
  private reconciliationMonitor?: ReconciliationMonitor;
  private isInitialized = false;
  private services: Map<string, any> = new Map();

  constructor(config: WalletConfig) {
    this.config = config;
    this.supabase = createClient(config.supabaseUrl, config.supabaseServiceKey);
  }

  /**
   * Initialize all wallet services
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.log('🔄 Wallet services already initialized');
      return;
    }

    try {
      console.log('🚀 Initializing wallet services...');

      // Initialize Hot Wallet Service
      const hotWalletConfig = {
        network: this.config.networkName === 'ethereum' ? 'mainnet' : 'sepolia' as 'mainnet' | 'sepolia',
        rpcUrl: this.config.rpcUrl,
        encryptedPrivateKey: this.config.hotWalletPrivateKey,
        passphrase: this.config.encryptionKey,
        maxDailyWithdrawal: '10000', // Default limit
        gasLimit: '21000',
        maxGasPrice: '50' // 50 gwei
      };
      this.hotWalletService = new HotWalletService(hotWalletConfig);
      await this.hotWalletService.initialize();
      this.services.set('hotWallet', this.hotWalletService);
      console.log('✅ Hot Wallet Service initialized');

      // Initialize On-Chain Monitor
      this.onChainMonitor = new OnChainMonitor(
        this.config.rpcUrl,
        this.config.usdtContractAddress,
        this.supabase
      );
      await this.onChainMonitor.initialize();
      this.services.set('onChainMonitor', this.onChainMonitor);
      console.log('✅ On-Chain Monitor initialized');

      // Initialize Withdrawal Worker
      this.withdrawalWorker = new WithdrawalWorker(
        this.config.supabaseUrl,
        this.config.supabaseServiceKey,
        hotWalletConfig
      );
      await this.withdrawalWorker.initialize();
      this.services.set('withdrawalWorker', this.withdrawalWorker);
      console.log('✅ Withdrawal Worker initialized');

      // Initialize Reconciliation Monitor
      this.reconciliationMonitor = new ReconciliationMonitor(
        this.config.supabaseUrl,
        this.config.supabaseServiceKey,
        this.config.rpcUrl,
        this.config.usdtContractAddress
      );
      this.services.set('reconciliationMonitor', this.reconciliationMonitor);
      console.log('✅ Reconciliation Monitor initialized');

      this.isInitialized = true;
      console.log('🎉 All wallet services initialized successfully');

    } catch (error) {
      console.error('❌ Failed to initialize wallet services:', error);
      throw error;
    }
  }

  /**
   * Start all services
   */
  async startAll(): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      console.log('▶️ Starting all wallet services...');

      // Start On-Chain Monitor
      if (this.onChainMonitor) {
        await this.onChainMonitor.startMonitoring();
        console.log('✅ On-Chain Monitor started');
      }

      // Start Withdrawal Worker
      if (this.withdrawalWorker) {
        this.withdrawalWorker.start();
        console.log('✅ Withdrawal Worker started');
      }

      // Start Reconciliation Monitor
      if (this.reconciliationMonitor) {
        this.reconciliationMonitor.start();
        console.log('✅ Reconciliation Monitor started');
      }

      console.log('🎉 All wallet services started successfully');

    } catch (error) {
      console.error('❌ Failed to start wallet services:', error);
      throw error;
    }
  }

  /**
   * Stop all services
   */
  async stopAll(): Promise<void> {
    try {
      console.log('⏹️ Stopping all wallet services...');

      // Stop Reconciliation Monitor
      if (this.reconciliationMonitor) {
        this.reconciliationMonitor.stop();
        console.log('✅ Reconciliation Monitor stopped');
      }

      // Stop Withdrawal Worker
      if (this.withdrawalWorker) {
        this.withdrawalWorker.stop();
        console.log('✅ Withdrawal Worker stopped');
      }

      // Note: OnChainMonitor doesn't have a stop method
      // It uses setInterval which will be cleaned up when the process exits

      console.log('🎉 All wallet services stopped successfully');

    } catch (error) {
      console.error('❌ Failed to stop wallet services:', error);
      throw error;
    }
  }

  /**
   * Get status of all services
   */
  async getServiceStatus(): Promise<ServiceStatus[]> {
    const statuses: ServiceStatus[] = [];

    try {
      // Hot Wallet Service Status
      if (this.hotWalletService) {
        try {
          // Test if the service is working by getting the address
          const address = this.hotWalletService.getAddress();
          statuses.push({
            name: 'Hot Wallet Service',
            status: address ? 'running' : 'stopped',
            lastActivity: new Date()
          });
        } catch (error) {
          statuses.push({
            name: 'Hot Wallet Service',
            status: 'error',
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }

      // On-Chain Monitor Status
      if (this.onChainMonitor) {
        statuses.push({
          name: 'On-Chain Monitor',
          status: 'running',
          lastActivity: new Date()
        });
      }

      // Withdrawal Worker Status
      if (this.withdrawalWorker) {
        statuses.push({
          name: 'Withdrawal Worker',
          status: 'running',
          lastActivity: new Date()
        });
      }

      // Reconciliation Monitor Status
      if (this.reconciliationMonitor) {
        statuses.push({
          name: 'Reconciliation Monitor',
          status: 'running',
          lastActivity: new Date()
        });
      }

    } catch (error) {
      console.error('❌ Failed to get service status:', error);
    }

    return statuses;
  }

  /**
   * Get comprehensive system health
   */
  async getSystemHealth(): Promise<{
    overall: 'healthy' | 'warning' | 'critical';
    services: ServiceStatus[];
    metrics: any;
    alerts: any[];
  }> {
    try {
      const services = await this.getServiceStatus();
      
      // Get system metrics
      const metrics = await this.getSystemMetrics();
      
      // Get active alerts
      const { data: alerts } = await this.supabase
        .from('monitoring_alerts')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      // Determine overall health
      const runningServices = services.filter(s => s.status === 'running').length;
      const totalServices = services.length;
      const criticalAlerts = alerts?.filter((a: any) => a.severity === 'critical').length || 0;
      
      let overall: 'healthy' | 'warning' | 'critical' = 'healthy';
      
      if (criticalAlerts > 0 || runningServices < totalServices * 0.5) {
        overall = 'critical';
      } else if (runningServices < totalServices || (alerts?.length || 0) > 0) {
        overall = 'warning';
      }

      return {
        overall,
        services,
        metrics,
        alerts: alerts || []
      };

    } catch (error) {
      console.error('❌ Failed to get system health:', error);
      return {
        overall: 'critical',
        services: [],
        metrics: {},
        alerts: []
      };
    }
  }

  /**
   * Get system metrics
   */
  async getSystemMetrics(): Promise<any> {
    try {
      const metrics: any = {
        timestamp: new Date().toISOString()
      };

      // Hot Wallet metrics
      if (this.hotWalletService) {
        try {
          const address = this.hotWalletService.getAddress();
          const ethBalance = await this.hotWalletService.getEthBalance();
          const usdtBalance = await this.hotWalletService.getUsdtBalance();
          
          metrics.hotWallet = {
            address,
            ethBalance,
            usdtBalance,
            isInitialized: true
          };
        } catch (error) {
          metrics.hotWallet = {
            isInitialized: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          };
        }
      }

      // Withdrawal Worker metrics
      if (this.withdrawalWorker) {
        metrics.withdrawals = {
          isRunning: true,
          lastCheck: new Date().toISOString()
        };
      }

      // Reconciliation Monitor metrics
      if (this.reconciliationMonitor) {
        metrics.reconciliation = {
          isRunning: true,
          lastCheck: new Date().toISOString()
        };
      }

      return metrics;

    } catch (error) {
      console.error('❌ Failed to get system metrics:', error);
      return {
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Process a withdrawal request
   */
  async processWithdrawal(userId: string, amount: string, toAddress: string): Promise<{
    success: boolean;
    withdrawalId?: string;
    error?: string;
  }> {
    try {
      if (!this.withdrawalWorker) {
        throw new Error('Withdrawal worker not initialized');
      }

      // Create withdrawal request
      const { data: withdrawal, error } = await this.supabase
        .from('withdrawal_requests')
        .insert({
          user_id: userId,
          amount,
          to_address: toAddress,
          status: 'pending'
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create withdrawal: ${error.message}`);
      }

      return {
        success: true,
        withdrawalId: withdrawal.id
      };

    } catch (error) {
      console.error('❌ Failed to process withdrawal:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get wallet balance for a user
   */
  async getUserBalance(userId: string): Promise<{
    balance: string;
    availableBalance: string;
    pendingWithdrawals: string;
  }> {
    try {
      const { data: balance, error: balanceError } = await this.supabase
        .rpc('get_user_balance', { p_user_id: userId });

      const { data: availableBalance, error: availableError } = await this.supabase
        .rpc('get_available_balance', { p_user_id: userId });

      if (balanceError || availableError) {
        throw new Error('Failed to get user balance');
      }

      const pendingWithdrawals = (parseFloat(balance) - parseFloat(availableBalance)).toFixed(2);

      return {
        balance: balance || '0.00',
        availableBalance: availableBalance || '0.00',
        pendingWithdrawals
      };

    } catch (error) {
      console.error('❌ Failed to get user balance:', error);
      return {
        balance: '0.00',
        availableBalance: '0.00',
        pendingWithdrawals: '0.00'
      };
    }
  }

  /**
   * Get user's crypto wallet address
   */
  async getUserWalletAddress(userId: string): Promise<string | null> {
    try {
      const { data: wallet, error } = await this.supabase
        .from('crypto_wallets')
        .select('address')
        .eq('user_id', userId)
        .eq('network', this.config.networkName)
        .single();

      if (error || !wallet) {
        return null;
      }

      return wallet.address;

    } catch (error) {
      console.error('❌ Failed to get user wallet address:', error);
      return null;
    }
  }

  /**
   * Create a new crypto wallet for a user
   */
  async createUserWallet(userId: string): Promise<{
    success: boolean;
    address?: string;
    error?: string;
  }> {
    try {
      if (!this.hotWalletService) {
        throw new Error('Hot wallet service not initialized');
      }

      // Get encryption passphrase from environment
      const walletPassphrase = process.env.WALLET_PASSPHRASE;
      if (!walletPassphrase) {
        throw new Error('WALLET_PASSPHRASE environment variable is required');
      }

      const newWallet = HotWalletService.generateNewWallet();
      
      // Encrypt the private key before storing
      const { encryptPrivateKey } = await import('../utils/encryption');
      const encryptedPrivateKey = encryptPrivateKey(newWallet.privateKey, walletPassphrase);
      
      const { error } = await this.supabase
        .from('crypto_wallets')
        .insert({
          user_id: userId,
          address: newWallet.address,
          network: this.config.networkName,
          private_key_encrypted: encryptedPrivateKey
        });

      if (error) {
        throw new Error(`Failed to save wallet: ${error.message}`);
      }

      return {
        success: true,
        address: newWallet.address
      };

    } catch (error) {
      console.error('❌ Failed to create user wallet:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get service instance by name
   */
  getService(serviceName: string): any {
    return this.services.get(serviceName);
  }

  /**
   * Check if services are initialized
   */
  isServicesInitialized(): boolean {
    return this.isInitialized;
  }

  /**
   * Restart a specific service
   */
  async restartService(serviceName: string): Promise<void> {
    const service = this.services.get(serviceName);
    if (!service) {
      throw new Error(`Service ${serviceName} not found`);
    }

    try {
      console.log(`🔄 Restarting ${serviceName}...`);
      
      if (service.stop) {
        service.stop();
      }
      
      if (service.start) {
        service.start();
      }
      
      console.log(`✅ ${serviceName} restarted successfully`);
      
    } catch (error) {
      console.error(`❌ Failed to restart ${serviceName}:`, error);
      throw error;
    }
  }
}

// Export singleton instance
let walletServiceManager: WalletServiceManager | null = null;

export function getWalletServiceManager(): WalletServiceManager | null {
  return walletServiceManager;
}

export function initializeWalletServiceManager(config: WalletConfig): WalletServiceManager {
  if (!walletServiceManager) {
    walletServiceManager = new WalletServiceManager(config);
  }
  return walletServiceManager;
}

export default WalletServiceManager;