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
      this.hotWalletService = new HotWalletService(
        this.config.rpcUrl,
        this.config.usdtContractAddress,
        this.config.encryptionKey
      );
      await this.hotWalletService.initialize(this.config.hotWalletPrivateKey);
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
        this.supabase,
        this.hotWalletService
      );
      await this.withdrawalWorker.initialize();
      this.services.set('withdrawalWorker', this.withdrawalWorker);
      console.log('✅ Withdrawal Worker initialized');

      // Initialize Reconciliation Monitor
      this.reconciliationMonitor = new ReconciliationMonitor(
        this.supabase,
        this.hotWalletService
      );
      await this.reconciliationMonitor.initialize();
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
        this.onChainMonitor.start();
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

      // Stop On-Chain Monitor
      if (this.onChainMonitor) {
        this.onChainMonitor.stop();
        console.log('✅ On-Chain Monitor stopped');
      }

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
        const stats = await this.hotWalletService.getStats();
        statuses.push({
          name: 'Hot Wallet Service',
          status: stats.isInitialized ? 'running' : 'stopped',
          lastActivity: new Date()
        });
      }

      // On-Chain Monitor Status
      if (this.onChainMonitor) {
        const stats = await this.onChainMonitor.getStats();
        statuses.push({
          name: 'On-Chain Monitor',
          status: stats.isRunning ? 'running' : 'stopped',
          lastActivity: stats.lastBlockProcessed ? new Date() : undefined
        });
      }

      // Withdrawal Worker Status
      if (this.withdrawalWorker) {
        const stats = await this.withdrawalWorker.getStats();
        statuses.push({
          name: 'Withdrawal Worker',
          status: stats.isRunning ? 'running' : 'stopped',
          lastActivity: stats.lastProcessedAt ? new Date(stats.lastProcessedAt) : undefined
        });
      }

      // Reconciliation Monitor Status
      if (this.reconciliationMonitor) {
        const stats = await this.reconciliationMonitor.getStats();
        statuses.push({
          name: 'Reconciliation Monitor',
          status: stats.isRunning ? 'running' : 'stopped',
          lastActivity: stats.lastReconciliationAt ? new Date(stats.lastReconciliationAt) : undefined
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
      const criticalAlerts = alerts?.filter(a => a.severity === 'critical').length || 0;
      
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
      const [
        hotWalletStats,
        withdrawalStats,
        reconciliationStats
      ] = await Promise.all([
        this.hotWalletService?.getStats(),
        this.withdrawalWorker?.getStats(),
        this.reconciliationMonitor?.getStats()
      ]);

      return {
        hotWallet: hotWalletStats,
        withdrawals: withdrawalStats,
        reconciliation: reconciliationStats,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('❌ Failed to get system metrics:', error);
      return {};
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
        .from('withdrawals')
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

      const newWallet = await this.hotWalletService.generateNewWallet();
      
      const { error } = await this.supabase
        .from('crypto_wallets')
        .insert({
          user_id: userId,
          address: newWallet.address,
          network: this.config.networkName,
          private_key_encrypted: newWallet.encryptedPrivateKey
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