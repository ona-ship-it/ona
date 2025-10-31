import { createClient } from '@supabase/supabase-js';
import { HotWalletService, HotWalletConfig, WithdrawalRequest, TransactionResult } from './hotWallet';
import cron from 'node-cron';

interface WithdrawalRecord {
  id: string;
  user_id: string;
  currency: string;
  network: string;
  amount: string;
  to_address: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  tx_hash?: string;
  failure_reason?: string;
  created_at: string;
  updated_at: string;
}

export class WithdrawalWorker {
  private supabase: any;
  private hotWallet: HotWalletService;
  private isProcessing = false;
  private maxConcurrentWithdrawals = 1; // Process one at a time for safety
  private processingInterval: NodeJS.Timeout | null = null;

  constructor(
    supabaseUrl: string,
    supabaseKey: string,
    hotWalletConfig: HotWalletConfig
  ) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
    this.hotWallet = new HotWalletService(hotWalletConfig);
  }

  /**
   * Initialize the withdrawal worker
   */
  async initialize(): Promise<void> {
    try {
      await this.hotWallet.initialize();
      console.log('Withdrawal worker initialized successfully');
      
      // Validate hot wallet configuration
      const validation = await this.hotWallet.validateConfiguration();
      if (!validation.valid) {
        console.warn('Hot wallet configuration issues:', validation.errors);
      }
      
    } catch (error) {
      console.error('Failed to initialize withdrawal worker:', error);
      throw error;
    }
  }

  /**
   * Start the withdrawal processing worker
   */
  start(): void {
    if (this.processingInterval) {
      console.log('Withdrawal worker already running');
      return;
    }

    console.log('Starting withdrawal worker...');
    
    // Process withdrawals every 30 seconds
    this.processingInterval = setInterval(async () => {
      if (!this.isProcessing) {
        await this.processWithdrawals();
      }
    }, 30000);

    // Also schedule using cron for more reliable scheduling
    cron.schedule('*/1 * * * *', async () => {
      if (!this.isProcessing) {
        await this.processWithdrawals();
      }
    });

    console.log('Withdrawal worker started');
  }

  /**
   * Stop the withdrawal processing worker
   */
  stop(): void {
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
      this.processingInterval = null;
      console.log('Withdrawal worker stopped');
    }
  }

  /**
   * Process pending withdrawals
   */
  async processWithdrawals(): Promise<void> {
    if (this.isProcessing) {
      return;
    }

    this.isProcessing = true;
    
    try {
      // Get pending withdrawals
      const { data: withdrawals, error } = await this.supabase
        .from('withdrawals')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: true })
        .limit(this.maxConcurrentWithdrawals);

      if (error) {
        console.error('Error fetching withdrawals:', error);
        return;
      }

      if (!withdrawals || withdrawals.length === 0) {
        return; // No pending withdrawals
      }

      console.log(`Processing ${withdrawals.length} withdrawal(s)`);

      for (const withdrawal of withdrawals) {
        await this.processWithdrawal(withdrawal);
      }

    } catch (error) {
      console.error('Error in withdrawal processing:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Process a single withdrawal with atomic balance checks
   */
  async processWithdrawal(withdrawal: WithdrawalRecord): Promise<void> {
    const { id, user_id, currency, amount, to_address, network } = withdrawal;

    console.log(`Processing withdrawal ${id} for user ${user_id}: ${amount} ${currency}`);

    try {
      // Start database transaction
      const { data, error: txError } = await this.supabase.rpc('begin_withdrawal_transaction', {
        p_withdrawal_id: id,
        p_user_id: user_id,
        p_amount: parseFloat(amount),
        p_currency: currency
      });

      if (txError || !data) {
        console.error(`Failed to begin withdrawal transaction for ${id}:`, txError);
        await this.markWithdrawalFailed(id, 'Failed to begin transaction: ' + (txError?.message || 'Unknown error'));
        return;
      }

      // Mark withdrawal as processing
      await this.updateWithdrawalStatus(id, 'processing');

      // Execute the on-chain transaction
      const withdrawalRequest: WithdrawalRequest = {
        id,
        toAddress: to_address,
        amount,
        currency,
        network
      };

      const result = await this.hotWallet.executeWithdrawal(withdrawalRequest);

      if (result.success && result.txHash) {
        // Transaction successful - commit the database transaction
        await this.supabase.rpc('commit_withdrawal_transaction', {
          p_withdrawal_id: id,
          p_tx_hash: result.txHash,
          p_gas_used: result.gasUsed || '0',
          p_gas_price: result.gasPrice || '0'
        });

        console.log(`Withdrawal ${id} completed successfully. TX: ${result.txHash}`);
        
      } else {
        // Transaction failed - rollback the database transaction
        await this.supabase.rpc('rollback_withdrawal_transaction', {
          p_withdrawal_id: id,
          p_failure_reason: result.error || 'Unknown transaction error'
        });

        console.error(`Withdrawal ${id} failed:`, result.error);
      }

    } catch (error: any) {
      console.error(`Error processing withdrawal ${id}:`, error);
      
      // Rollback transaction on any error
      try {
        await this.supabase.rpc('rollback_withdrawal_transaction', {
          p_withdrawal_id: id,
          p_failure_reason: error.message || 'Processing error'
        });
      } catch (rollbackError) {
        console.error(`Failed to rollback withdrawal ${id}:`, rollbackError);
      }
    }
  }

  /**
   * Update withdrawal status
   */
  private async updateWithdrawalStatus(
    withdrawalId: string, 
    status: 'pending' | 'processing' | 'completed' | 'failed'
  ): Promise<void> {
    const { error } = await this.supabase
      .from('withdrawals')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', withdrawalId);

    if (error) {
      console.error(`Failed to update withdrawal ${withdrawalId} status:`, error);
    }
  }

  /**
   * Mark withdrawal as failed
   */
  private async markWithdrawalFailed(withdrawalId: string, reason: string): Promise<void> {
    const { error } = await this.supabase
      .from('withdrawals')
      .update({ 
        status: 'failed',
        failure_reason: reason,
        updated_at: new Date().toISOString()
      })
      .eq('id', withdrawalId);

    if (error) {
      console.error(`Failed to mark withdrawal ${withdrawalId} as failed:`, error);
    }
  }

  /**
   * Get withdrawal statistics
   */
  async getWithdrawalStats(): Promise<any> {
    const { data, error } = await this.supabase.rpc('get_withdrawal_stats');
    
    if (error) {
      console.error('Error getting withdrawal stats:', error);
      return null;
    }
    
    return data;
  }

  /**
   * Get hot wallet status
   */
  async getHotWalletStatus(): Promise<any> {
    try {
      const address = this.hotWallet.getAddress();
      const ethBalance = await this.hotWallet.getEthBalance();
      const usdtBalance = await this.hotWallet.getUsdtBalance();
      
      return {
        address,
        ethBalance,
        usdtBalance,
        isHealthy: parseFloat(ethBalance) > 0.01 && parseFloat(usdtBalance) > 100
      };
    } catch (error) {
      console.error('Error getting hot wallet status:', error);
      return {
        address: 'Unknown',
        ethBalance: '0',
        usdtBalance: '0',
        isHealthy: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Manual withdrawal processing (for admin use)
   */
  async processWithdrawalManually(withdrawalId: string): Promise<boolean> {
    try {
      const { data: withdrawal, error } = await this.supabase
        .from('withdrawals')
        .select('*')
        .eq('id', withdrawalId)
        .single();

      if (error || !withdrawal) {
        console.error('Withdrawal not found:', withdrawalId);
        return false;
      }

      if (withdrawal.status !== 'pending') {
        console.error('Withdrawal is not in pending status:', withdrawal.status);
        return false;
      }

      await this.processWithdrawal(withdrawal);
      return true;
      
    } catch (error) {
      console.error('Error in manual withdrawal processing:', error);
      return false;
    }
  }
}

// Singleton instance for the withdrawal worker
let withdrawalWorkerInstance: WithdrawalWorker | null = null;

export function getWithdrawalWorker(): WithdrawalWorker | null {
  return withdrawalWorkerInstance;
}

export function initializeWithdrawalWorker(
  supabaseUrl: string,
  supabaseKey: string,
  hotWalletConfig: HotWalletConfig
): WithdrawalWorker {
  if (!withdrawalWorkerInstance) {
    withdrawalWorkerInstance = new WithdrawalWorker(supabaseUrl, supabaseKey, hotWalletConfig);
  }
  return withdrawalWorkerInstance;
}