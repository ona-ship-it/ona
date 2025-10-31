import { createClient } from '@supabase/supabase-js';
import { ethers } from 'ethers';
import cron from 'node-cron';

interface ReconciliationResult {
  address: string;
  userId: string;
  ledgerBalance: string;
  onChainBalance: string;
  discrepancy: string;
  discrepancyPercentage: number;
  lastChecked: Date;
  status: 'ok' | 'warning' | 'critical';
}

interface MonitoringAlert {
  type: 'balance_discrepancy' | 'pending_withdrawals' | 'failed_withdrawals' | 'hot_wallet_low' | 'system_error';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  data?: any;
  timestamp: Date;
}

interface SystemStats {
  totalUsers: number;
  totalBalance: string;
  pendingWithdrawals: number;
  pendingWithdrawalAmount: string;
  failedWithdrawals: number;
  failedWithdrawalAmount: string;
  hotWalletBalance: string;
  lastReconciliation: Date | null;
  systemHealth: 'healthy' | 'warning' | 'critical';
}

export class ReconciliationMonitor {
  private supabase: any;
  private provider: ethers.JsonRpcProvider;
  private usdtContract: ethers.Contract;
  private isRunning: boolean = false;
  private reconciliationJob: any = null;
  private monitoringJob: any = null;
  
  // USDT contract ABI (minimal for balance checking)
  private readonly USDT_ABI = [
    'function balanceOf(address owner) view returns (uint256)',
    'function decimals() view returns (uint8)'
  ];
  
  // Alert thresholds
  private readonly ALERT_THRESHOLDS = {
    BALANCE_DISCREPANCY_PERCENT: 1.0, // 1% discrepancy triggers alert
    BALANCE_DISCREPANCY_AMOUNT: '100', // $100 absolute discrepancy
    PENDING_WITHDRAWALS_COUNT: 50,
    PENDING_WITHDRAWALS_AMOUNT: '10000', // $10,000
    FAILED_WITHDRAWALS_COUNT: 10,
    HOT_WALLET_MIN_BALANCE: '1000' // $1,000 minimum hot wallet balance
  };
  
  constructor(
    supabaseUrl: string,
    supabaseKey: string,
    rpcUrl: string,
    usdtContractAddress: string
  ) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
    this.provider = new ethers.JsonRpcProvider(rpcUrl);
    this.usdtContract = new ethers.Contract(
      usdtContractAddress,
      this.USDT_ABI,
      this.provider
    );
  }
  
  /**
   * Start the reconciliation and monitoring services
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      console.log('Reconciliation monitor is already running');
      return;
    }
    
    this.isRunning = true;
    console.log('Starting reconciliation and monitoring services...');
    
    // Schedule nightly reconciliation at 2 AM
    this.reconciliationJob = cron.schedule('0 2 * * *', async () => {
      console.log('Starting nightly reconciliation...');
      await this.performReconciliation();
    }, {
      scheduled: true,
      timezone: 'UTC'
    });
    
    // Schedule monitoring checks every 5 minutes
    this.monitoringJob = cron.schedule('*/5 * * * *', async () => {
      await this.performMonitoringChecks();
    }, {
      scheduled: true,
      timezone: 'UTC'
    });
    
    console.log('Reconciliation monitor started successfully');
    
    // Perform initial checks
    await this.performMonitoringChecks();
  }
  
  /**
   * Stop the reconciliation and monitoring services
   */
  async stop(): Promise<void> {
    if (!this.isRunning) {
      return;
    }
    
    this.isRunning = false;
    
    if (this.reconciliationJob) {
      this.reconciliationJob.stop();
      this.reconciliationJob = null;
    }
    
    if (this.monitoringJob) {
      this.monitoringJob.stop();
      this.monitoringJob = null;
    }
    
    console.log('Reconciliation monitor stopped');
  }
  
  /**
   * Perform full balance reconciliation
   */
  async performReconciliation(): Promise<ReconciliationResult[]> {
    console.log('Starting balance reconciliation...');
    const results: ReconciliationResult[] = [];
    
    try {
      // Get all crypto wallets with their user balances
      const { data: wallets, error } = await this.supabase
        .from('crypto_wallets')
        .select(`
          address,
          user_id,
          user_balances!inner(balance)
        `);
      
      if (error) {
        throw new Error(`Failed to fetch wallets: ${error.message}`);
      }
      
      for (const wallet of wallets || []) {
        try {
          const result = await this.reconcileWallet(wallet);
          results.push(result);
          
          // Store reconciliation result
          await this.storeReconciliationResult(result);
          
          // Check for alerts
          if (result.status !== 'ok') {
            await this.sendAlert({
              type: 'balance_discrepancy',
              severity: result.status === 'critical' ? 'critical' : 'medium',
              message: `Balance discrepancy detected for wallet ${result.address}`,
              data: result,
              timestamp: new Date()
            });
          }
          
        } catch (error: any) {
          console.error(`Error reconciling wallet ${wallet.address}:`, error);
          
          await this.sendAlert({
            type: 'system_error',
            severity: 'high',
            message: `Failed to reconcile wallet ${wallet.address}: ${error.message}`,
            data: { wallet, error: error.message },
            timestamp: new Date()
          });
        }
      }
      
      console.log(`Reconciliation completed. Processed ${results.length} wallets`);
      return results;
      
    } catch (error: any) {
      console.error('Reconciliation failed:', error);
      
      await this.sendAlert({
        type: 'system_error',
        severity: 'critical',
        message: `Reconciliation process failed: ${error.message}`,
        data: { error: error.message },
        timestamp: new Date()
      });
      
      throw error;
    }
  }
  
  /**
   * Reconcile a single wallet
   */
  private async reconcileWallet(wallet: any): Promise<ReconciliationResult> {
    // Get ledger balance (sum of all ledger entries for this user)
    const { data: ledgerData, error: ledgerError } = await this.supabase
      .rpc('get_user_balance', { p_user_id: wallet.user_id });
    
    if (ledgerError) {
      throw new Error(`Failed to get ledger balance: ${ledgerError.message}`);
    }
    
    const ledgerBalance = ledgerData || '0';
    
    // Get on-chain balance
    const onChainBalanceWei = await this.usdtContract.balanceOf(wallet.address);
    const decimals = await this.usdtContract.decimals();
    const onChainBalance = ethers.formatUnits(onChainBalanceWei, decimals);
    
    // Calculate discrepancy
    const ledgerBN = ethers.parseUnits(ledgerBalance, 6);
    const onChainBN = ethers.parseUnits(onChainBalance, 6);
    const discrepancyBN = ledgerBN - onChainBN;
    const discrepancy = ethers.formatUnits(discrepancyBN, 6);
    
    // Calculate percentage discrepancy
    const discrepancyPercentage = ledgerBN > 0n 
      ? Number(discrepancyBN * 10000n / ledgerBN) / 100 
      : 0;
    
    // Determine status
    let status: 'ok' | 'warning' | 'critical' = 'ok';
    const absDiscrepancy = Math.abs(Number(discrepancy));
    const absPercentage = Math.abs(discrepancyPercentage);
    
    if (absDiscrepancy >= Number(this.ALERT_THRESHOLDS.BALANCE_DISCREPANCY_AMOUNT) ||
        absPercentage >= this.ALERT_THRESHOLDS.BALANCE_DISCREPANCY_PERCENT) {
      status = absPercentage >= 5.0 ? 'critical' : 'warning';
    }
    
    return {
      address: wallet.address,
      userId: wallet.user_id,
      ledgerBalance,
      onChainBalance,
      discrepancy,
      discrepancyPercentage,
      lastChecked: new Date(),
      status
    };
  }
  
  /**
   * Perform monitoring checks
   */
  async performMonitoringChecks(): Promise<void> {
    try {
      await Promise.all([
        this.checkPendingWithdrawals(),
        this.checkFailedWithdrawals(),
        this.checkHotWalletBalance(),
        this.checkSystemHealth()
      ]);
    } catch (error: any) {
      console.error('Monitoring checks failed:', error);
      
      await this.sendAlert({
        type: 'system_error',
        severity: 'high',
        message: `Monitoring checks failed: ${error.message}`,
        data: { error: error.message },
        timestamp: new Date()
      });
    }
  }
  
  /**
   * Check pending withdrawals
   */
  private async checkPendingWithdrawals(): Promise<void> {
    const { data, error } = await this.supabase
      .from('withdrawals')
      .select('amount')
      .eq('status', 'pending');
    
    if (error) {
      throw new Error(`Failed to check pending withdrawals: ${error.message}`);
    }
    
    const count = data?.length || 0;
    const totalAmount = data?.reduce((sum, w) => sum + Number(w.amount), 0) || 0;
    
    if (count >= this.ALERT_THRESHOLDS.PENDING_WITHDRAWALS_COUNT ||
        totalAmount >= Number(this.ALERT_THRESHOLDS.PENDING_WITHDRAWALS_AMOUNT)) {
      
      await this.sendAlert({
        type: 'pending_withdrawals',
        severity: 'medium',
        message: `High pending withdrawals: ${count} withdrawals totaling $${totalAmount.toFixed(2)}`,
        data: { count, totalAmount },
        timestamp: new Date()
      });
    }
  }
  
  /**
   * Check failed withdrawals
   */
  private async checkFailedWithdrawals(): Promise<void> {
    const { data, error } = await this.supabase
      .from('withdrawals')
      .select('amount, created_at')
      .eq('status', 'failed')
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());
    
    if (error) {
      throw new Error(`Failed to check failed withdrawals: ${error.message}`);
    }
    
    const count = data?.length || 0;
    const totalAmount = data?.reduce((sum, w) => sum + Number(w.amount), 0) || 0;
    
    if (count >= this.ALERT_THRESHOLDS.FAILED_WITHDRAWALS_COUNT) {
      await this.sendAlert({
        type: 'failed_withdrawals',
        severity: 'high',
        message: `High failed withdrawals in last 24h: ${count} withdrawals totaling $${totalAmount.toFixed(2)}`,
        data: { count, totalAmount },
        timestamp: new Date()
      });
    }
  }
  
  /**
   * Check hot wallet balance
   */
  private async checkHotWalletBalance(): Promise<void> {
    try {
      // Get hot wallet address from environment or config
      const hotWalletAddress = process.env.HOT_WALLET_ADDRESS;
      if (!hotWalletAddress) {
        return; // Skip if not configured
      }
      
      const balanceWei = await this.usdtContract.balanceOf(hotWalletAddress);
      const decimals = await this.usdtContract.decimals();
      const balance = ethers.formatUnits(balanceWei, decimals);
      
      if (Number(balance) < Number(this.ALERT_THRESHOLDS.HOT_WALLET_MIN_BALANCE)) {
        await this.sendAlert({
          type: 'hot_wallet_low',
          severity: 'critical',
          message: `Hot wallet balance is low: $${Number(balance).toFixed(2)}`,
          data: { balance, address: hotWalletAddress },
          timestamp: new Date()
        });
      }
      
    } catch (error: any) {
      console.error('Failed to check hot wallet balance:', error);
    }
  }
  
  /**
   * Check overall system health
   */
  private async checkSystemHealth(): Promise<void> {
    // This is a placeholder for more comprehensive health checks
    // You can add checks for database connectivity, external service availability, etc.
    
    try {
      // Simple database connectivity check
      const { error } = await this.supabase
        .from('user_balances')
        .select('id')
        .limit(1);
      
      if (error) {
        await this.sendAlert({
          type: 'system_error',
          severity: 'critical',
          message: `Database connectivity issue: ${error.message}`,
          data: { error: error.message },
          timestamp: new Date()
        });
      }
      
    } catch (error: any) {
      await this.sendAlert({
        type: 'system_error',
        severity: 'critical',
        message: `System health check failed: ${error.message}`,
        data: { error: error.message },
        timestamp: new Date()
      });
    }
  }
  
  /**
   * Store reconciliation result in database
   */
  private async storeReconciliationResult(result: ReconciliationResult): Promise<void> {
    const { error } = await this.supabase
      .from('reconciliation_log')
      .insert({
        wallet_address: result.address,
        user_id: result.userId,
        ledger_balance: result.ledgerBalance,
        onchain_balance: result.onChainBalance,
        discrepancy: result.discrepancy,
        discrepancy_percentage: result.discrepancyPercentage,
        status: result.status,
        checked_at: result.lastChecked.toISOString()
      });
    
    if (error) {
      console.error('Failed to store reconciliation result:', error);
    }
  }
  
  /**
   * Send alert (placeholder - implement with your preferred alerting system)
   */
  private async sendAlert(alert: MonitoringAlert): Promise<void> {
    console.log(`🚨 ALERT [${alert.severity.toUpperCase()}]: ${alert.message}`);
    
    // Store alert in database
    const { error } = await this.supabase
      .from('monitoring_alerts')
      .insert({
        type: alert.type,
        severity: alert.severity,
        message: alert.message,
        data: alert.data,
        created_at: alert.timestamp.toISOString()
      });
    
    if (error) {
      console.error('Failed to store alert:', error);
    }
    
    // TODO: Implement actual alerting (email, Slack, SMS, etc.)
    // Example integrations:
    // - Email via SendGrid/SES
    // - Slack webhook
    // - SMS via Twilio
    // - Push notifications
    // - Sentry for error tracking
    
    if (alert.severity === 'critical') {
      // For critical alerts, you might want immediate notification
      console.log('🔥 CRITICAL ALERT - Immediate attention required!');
    }
  }
  
  /**
   * Get system statistics
   */
  async getSystemStats(): Promise<SystemStats> {
    try {
      // Get total users
      const { count: totalUsers } = await this.supabase
        .from('user_balances')
        .select('*', { count: 'exact', head: true });
      
      // Get total balance
      const { data: balanceData } = await this.supabase
        .rpc('get_total_system_balance');
      
      // Get pending withdrawals
      const { data: pendingWithdrawals } = await this.supabase
        .from('withdrawals')
        .select('amount')
        .eq('status', 'pending');
      
      // Get failed withdrawals (last 24h)
      const { data: failedWithdrawals } = await this.supabase
        .from('withdrawals')
        .select('amount')
        .eq('status', 'failed')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());
      
      // Get last reconciliation
      const { data: lastReconciliation } = await this.supabase
        .from('reconciliation_log')
        .select('checked_at')
        .order('checked_at', { ascending: false })
        .limit(1);
      
      const pendingCount = pendingWithdrawals?.length || 0;
      const pendingAmount = pendingWithdrawals?.reduce((sum, w) => sum + Number(w.amount), 0) || 0;
      const failedCount = failedWithdrawals?.length || 0;
      const failedAmount = failedWithdrawals?.reduce((sum, w) => sum + Number(w.amount), 0) || 0;
      
      // Determine system health
      let systemHealth: 'healthy' | 'warning' | 'critical' = 'healthy';
      
      if (failedCount >= this.ALERT_THRESHOLDS.FAILED_WITHDRAWALS_COUNT ||
          pendingCount >= this.ALERT_THRESHOLDS.PENDING_WITHDRAWALS_COUNT) {
        systemHealth = 'warning';
      }
      
      if (pendingAmount >= Number(this.ALERT_THRESHOLDS.PENDING_WITHDRAWALS_AMOUNT)) {
        systemHealth = 'critical';
      }
      
      return {
        totalUsers: totalUsers || 0,
        totalBalance: balanceData || '0',
        pendingWithdrawals: pendingCount,
        pendingWithdrawalAmount: pendingAmount.toFixed(2),
        failedWithdrawals: failedCount,
        failedWithdrawalAmount: failedAmount.toFixed(2),
        hotWalletBalance: '0', // TODO: Implement hot wallet balance check
        lastReconciliation: lastReconciliation?.[0]?.checked_at ? new Date(lastReconciliation[0].checked_at) : null,
        systemHealth
      };
      
    } catch (error: any) {
      console.error('Failed to get system stats:', error);
      throw error;
    }
  }
  
  /**
   * Get reconciliation history
   */
  async getReconciliationHistory(limit: number = 100): Promise<ReconciliationResult[]> {
    const { data, error } = await this.supabase
      .from('reconciliation_log')
      .select('*')
      .order('checked_at', { ascending: false })
      .limit(limit);
    
    if (error) {
      throw new Error(`Failed to get reconciliation history: ${error.message}`);
    }
    
    return data?.map(row => ({
      address: row.wallet_address,
      userId: row.user_id,
      ledgerBalance: row.ledger_balance,
      onChainBalance: row.onchain_balance,
      discrepancy: row.discrepancy,
      discrepancyPercentage: row.discrepancy_percentage,
      lastChecked: new Date(row.checked_at),
      status: row.status
    })) || [];
  }
  
  /**
   * Manual reconciliation trigger
   */
  async triggerManualReconciliation(): Promise<ReconciliationResult[]> {
    console.log('Manual reconciliation triggered');
    return await this.performReconciliation();
  }
}