import { createClient } from '@supabase/supabase-js';
import { ethers } from 'ethers';

// USDT contract address on Ethereum mainnet
const USDT_CONTRACT_ADDRESS = '0xdAC17F958D2ee523a2206206994597C13D831ec7';
// USDT contract address on Sepolia testnet (for testing)
const USDT_SEPOLIA_ADDRESS = '0x7169D38820dfd117C3FA1f22a697dBA58d90BA06';

// ERC-20 ABI for USDT transfers
const ERC20_ABI = [
  'event Transfer(address indexed from, address indexed to, uint256 value)',
  'function balanceOf(address owner) view returns (uint256)',
  'function decimals() view returns (uint8)'
];

interface DepositTransaction {
  txHash: string;
  fromAddress: string;
  toAddress: string;
  amount: string;
  blockNumber: number;
  timestamp: number;
  confirmations: number;
}

export class OnChainMonitor {
  private provider: ethers.JsonRpcProvider;
  private usdtContract: ethers.Contract;
  private supabase: any;
  private isTestnet: boolean;
  private requiredConfirmations: number;
  private lastProcessedBlock: number;

  constructor(
    rpcUrl: string,
    supabaseUrl: string,
    supabaseKey: string,
    isTestnet: boolean = false,
    requiredConfirmations: number = 12
  ) {
    this.provider = new ethers.JsonRpcProvider(rpcUrl);
    this.isTestnet = isTestnet;
    this.requiredConfirmations = requiredConfirmations;
    
    const contractAddress = isTestnet ? USDT_SEPOLIA_ADDRESS : USDT_CONTRACT_ADDRESS;
    this.usdtContract = new ethers.Contract(contractAddress, ERC20_ABI, this.provider);
    
    this.supabase = createClient(supabaseUrl, supabaseKey);
    this.lastProcessedBlock = 0;
  }

  /**
   * Initialize the monitor by getting the last processed block from database
   */
  async initialize(): Promise<void> {
    try {
      // Get the last processed block from database or start from recent block
      const { data, error } = await this.supabase
        .from('monitor_state')
        .select('last_processed_block')
        .eq('network', this.isTestnet ? 'sepolia' : 'mainnet')
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
        throw error;
      }

      if (data) {
        this.lastProcessedBlock = data.last_processed_block;
      } else {
        // Start from current block minus 100 blocks for safety
        const currentBlock = await this.provider.getBlockNumber();
        this.lastProcessedBlock = Math.max(0, currentBlock - 100);
        
        // Save initial state
        await this.updateLastProcessedBlock(this.lastProcessedBlock);
      }

      console.log(`OnChainMonitor initialized. Starting from block: ${this.lastProcessedBlock}`);
    } catch (error) {
      console.error('Failed to initialize OnChainMonitor:', error);
      throw error;
    }
  }

  /**
   * Start monitoring for deposits
   */
  async startMonitoring(intervalMs: number = 60000): Promise<void> {
    console.log(`Starting on-chain monitoring with ${intervalMs}ms interval`);
    
    // Initial scan
    await this.scanForDeposits();
    
    // Set up recurring scan
    setInterval(async () => {
      try {
        await this.scanForDeposits();
      } catch (error) {
        console.error('Error during deposit scan:', error);
      }
    }, intervalMs);
  }

  /**
   * Scan for new USDT deposits
   */
  async scanForDeposits(): Promise<void> {
    try {
      const currentBlock = await this.provider.getBlockNumber();
      const fromBlock = this.lastProcessedBlock + 1;
      const toBlock = Math.min(fromBlock + 1000, currentBlock); // Process max 1000 blocks at a time

      if (fromBlock > currentBlock) {
        return; // No new blocks to process
      }

      console.log(`Scanning blocks ${fromBlock} to ${toBlock} for USDT deposits`);

      // Get all our monitored addresses
      const { data: wallets, error } = await this.supabase
        .from('crypto_wallets')
        .select('address, user_id')
        .eq('currency', 'USDT')
        .eq('network', this.isTestnet ? 'sepolia' : 'mainnet');

      if (error) {
        throw error;
      }

      if (!wallets || wallets.length === 0) {
        console.log('No USDT wallets to monitor');
        await this.updateLastProcessedBlock(toBlock);
        return;
      }

      const addressSet = new Set(wallets.map(w => w.address.toLowerCase()));

      // Get Transfer events for USDT contract
      const filter = this.usdtContract.filters.Transfer();
      const events = await this.usdtContract.queryFilter(filter, fromBlock, toBlock);

      for (const event of events) {
        if (!event.args) continue;

        const [from, to, value] = event.args;
        const toAddress = to.toLowerCase();

        // Check if this transfer is to one of our monitored addresses
        if (addressSet.has(toAddress)) {
          const wallet = wallets.find(w => w.address.toLowerCase() === toAddress);
          if (!wallet) continue;

          const txHash = event.transactionHash;
          const blockNumber = event.blockNumber;

          // Check if we already processed this transaction
          const { data: existingDeposit } = await this.supabase
            .from('deposits')
            .select('id')
            .eq('tx_hash', txHash)
            .eq('to_address', toAddress)
            .single();

          if (existingDeposit) {
            continue; // Already processed
          }

          // Get transaction details
          const tx = await this.provider.getTransaction(txHash);
          const block = await this.provider.getBlock(blockNumber);
          
          if (!tx || !block) continue;

          // Convert amount from wei to USDT (6 decimals for USDT)
          const amount = ethers.formatUnits(value, 6);
          const confirmations = currentBlock - blockNumber;

          const depositData: DepositTransaction = {
            txHash,
            fromAddress: from,
            toAddress: to,
            amount,
            blockNumber,
            timestamp: block.timestamp,
            confirmations
          };

          await this.processDeposit(depositData, wallet.user_id);
        }
      }

      // Update last processed block
      await this.updateLastProcessedBlock(toBlock);
      
    } catch (error) {
      console.error('Error scanning for deposits:', error);
      throw error;
    }
  }

  /**
   * Process a detected deposit
   */
  private async processDeposit(deposit: DepositTransaction, userId: string): Promise<void> {
    try {
      const isConfirmed = deposit.confirmations >= this.requiredConfirmations;
      
      console.log(`Processing deposit: ${deposit.amount} USDT to ${deposit.toAddress} (${deposit.confirmations} confirmations)`);

      // Insert deposit record
      const { data: depositRecord, error: depositError } = await this.supabase
        .from('deposits')
        .insert({
          user_id: userId,
          currency: 'USDT',
          network: this.isTestnet ? 'sepolia' : 'mainnet',
          amount: parseFloat(deposit.amount),
          from_address: deposit.fromAddress,
          to_address: deposit.toAddress,
          tx_hash: deposit.txHash,
          block_number: deposit.blockNumber,
          confirmations: deposit.confirmations,
          status: isConfirmed ? 'completed' : 'pending',
          created_at: new Date(deposit.timestamp * 1000).toISOString()
        })
        .select()
        .single();

      if (depositError) {
        throw depositError;
      }

      // If confirmed, create ledger entry and update balance
      if (isConfirmed) {
        await this.confirmDeposit(depositRecord.id, userId, parseFloat(deposit.amount));
      }

    } catch (error) {
      console.error('Error processing deposit:', error);
      throw error;
    }
  }

  /**
   * Confirm a deposit and update user balance
   */
  private async confirmDeposit(depositId: string, userId: string, amount: number): Promise<void> {
    try {
      // Use Supabase transaction to ensure atomicity
      const { error } = await this.supabase.rpc('process_confirmed_deposit', {
        p_deposit_id: depositId,
        p_user_id: userId,
        p_amount: amount,
        p_currency: 'USDT'
      });

      if (error) {
        throw error;
      }

      console.log(`Confirmed deposit: ${amount} USDT for user ${userId}`);
    } catch (error) {
      console.error('Error confirming deposit:', error);
      throw error;
    }
  }

  /**
   * Update confirmations for pending deposits
   */
  async updatePendingDeposits(): Promise<void> {
    try {
      const currentBlock = await this.provider.getBlockNumber();

      // Get pending deposits
      const { data: pendingDeposits, error } = await this.supabase
        .from('deposits')
        .select('*')
        .eq('status', 'pending')
        .eq('network', this.isTestnet ? 'sepolia' : 'mainnet');

      if (error) {
        throw error;
      }

      for (const deposit of pendingDeposits || []) {
        const confirmations = currentBlock - deposit.block_number;
        
        // Update confirmations
        await this.supabase
          .from('deposits')
          .update({ confirmations })
          .eq('id', deposit.id);

        // If now confirmed, process it
        if (confirmations >= this.requiredConfirmations) {
          await this.confirmDeposit(deposit.id, deposit.user_id, deposit.amount);
        }
      }
    } catch (error) {
      console.error('Error updating pending deposits:', error);
    }
  }

  /**
   * Update the last processed block in database
   */
  private async updateLastProcessedBlock(blockNumber: number): Promise<void> {
    const { error } = await this.supabase
      .from('monitor_state')
      .upsert({
        network: this.isTestnet ? 'sepolia' : 'mainnet',
        last_processed_block: blockNumber,
        updated_at: new Date().toISOString()
      });

    if (error) {
      throw error;
    }

    this.lastProcessedBlock = blockNumber;
  }

  /**
   * Get monitoring statistics
   */
  async getStats(): Promise<any> {
    const currentBlock = await this.provider.getBlockNumber();
    
    const { data: deposits } = await this.supabase
      .from('deposits')
      .select('status, amount')
      .eq('network', this.isTestnet ? 'sepolia' : 'mainnet');

    const stats = {
      currentBlock,
      lastProcessedBlock: this.lastProcessedBlock,
      blocksBehind: currentBlock - this.lastProcessedBlock,
      totalDeposits: deposits?.length || 0,
      pendingDeposits: deposits?.filter(d => d.status === 'pending').length || 0,
      confirmedDeposits: deposits?.filter(d => d.status === 'completed').length || 0,
      totalAmount: deposits?.reduce((sum, d) => sum + (d.amount || 0), 0) || 0
    };

    return stats;
  }
}

// Export singleton instance
let monitorInstance: OnChainMonitor | null = null;

export function getMonitorInstance(): OnChainMonitor {
  if (!monitorInstance) {
    const rpcUrl = process.env.ETHEREUM_RPC_URL || 'https://eth-mainnet.g.alchemy.com/v2/your-api-key';
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const isTestnet = process.env.NODE_ENV !== 'production';
    
    monitorInstance = new OnChainMonitor(rpcUrl, supabaseUrl, supabaseKey, isTestnet);
  }
  
  return monitorInstance;
}