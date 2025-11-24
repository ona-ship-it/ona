import { ethers } from 'ethers';
import crypto from 'crypto';

// USDT contract address on Ethereum mainnet
const USDT_CONTRACT_ADDRESS = '0xdAC17F958D2ee523a2206206994597C13D831ec7';
// USDT contract address on Sepolia testnet (for testing)
const USDT_SEPOLIA_ADDRESS = '0x7169D38820dfd117C3FA1f22a697dBA58d90BA06';

// ERC-20 ABI for USDT transfers
const ERC20_ABI = [
  'function transfer(address to, uint256 amount) returns (bool)',
  'function balanceOf(address account) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',
];

export interface HotWalletConfig {
  network: 'mainnet' | 'sepolia';
  rpcUrl: string;
  encryptedPrivateKey: string;
  passphrase: string;
  maxDailyWithdrawal: string; // in USDT
  gasLimit: string;
  maxGasPrice: string; // in gwei
}

export interface WithdrawalRequest {
  id: string;
  toAddress: string;
  amount: string; // in USDT
  currency: string;
  network: string;
}

export interface TransactionResult {
  success: boolean;
  txHash?: string;
  error?: string;
  gasUsed?: string;
  gasPrice?: string;
}

export class HotWalletService {
  private provider: ethers.JsonRpcProvider;
  private wallet: ethers.Wallet | null = null;
  private usdtContract: ethers.Contract | null = null;
  private config: HotWalletConfig;
  private dailyWithdrawalAmount = '0';
  private lastResetDate = new Date().toDateString();

  constructor(config: HotWalletConfig) {
    this.config = config;
    this.provider = new ethers.JsonRpcProvider(config.rpcUrl);
  }

  /**
   * Encrypt a private key with AES-256-GCM
   */
  static encryptPrivateKey(privateKey: string, passphrase: string): string {
    const algorithm = 'aes-256-gcm';
    const key = crypto.scryptSync(passphrase, 'salt', 32);
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher(algorithm, key);
    
    let encrypted = cipher.update(privateKey, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    return iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted;
  }

  /**
   * Decrypt a private key with AES-256-GCM
   */
  static decryptPrivateKey(encryptedKey: string, passphrase: string): string {
    const algorithm = 'aes-256-gcm';
    const key = crypto.scryptSync(passphrase, 'salt', 32);
    
    const parts = encryptedKey.split(':');
    if (parts.length !== 3) {
      throw new Error('Invalid encrypted key format');
    }
    
    const iv = Buffer.from(parts[0], 'hex');
    const authTag = Buffer.from(parts[1], 'hex');
    const encrypted = parts[2];
    
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }

  /**
   * Initialize the wallet by decrypting the private key
   */
  async initialize(): Promise<void> {
    try {
      const privateKey = HotWalletService.decryptPrivateKey(
        this.config.encryptedPrivateKey,
        this.config.passphrase
      );
      
      this.wallet = new ethers.Wallet(privateKey, this.provider);
      
      const contractAddress = this.config.network === 'mainnet' 
        ? USDT_CONTRACT_ADDRESS 
        : USDT_SEPOLIA_ADDRESS;
        
      this.usdtContract = new ethers.Contract(
        contractAddress,
        ERC20_ABI,
        this.wallet
      );
      
      console.log(`Hot wallet initialized for ${this.config.network}`);
      console.log(`Wallet address: ${this.wallet.address}`);
      
    } catch (error) {
      console.error('Failed to initialize hot wallet:', error);
      throw new Error('Hot wallet initialization failed');
    }
  }

  /**
   * Get wallet address
   */
  getAddress(): string {
    if (!this.wallet) {
      throw new Error('Wallet not initialized');
    }
    return this.wallet.address;
  }

  /**
   * Get ETH balance
   */
  async getEthBalance(): Promise<string> {
    if (!this.wallet) {
      throw new Error('Wallet not initialized');
    }
    
    const balance = await this.provider.getBalance(this.wallet.address);
    return ethers.formatEther(balance);
  }

  /**
   * Get USDT balance
   */
  async getUsdtBalance(): Promise<string> {
    if (!this.usdtContract || !this.wallet) {
      throw new Error('Wallet not initialized');
    }
    
    const balance = await this.usdtContract.balanceOf(this.wallet.address);
    return ethers.formatUnits(balance, 6); // USDT has 6 decimals
  }

  /**
   * Check if daily withdrawal limit is exceeded
   */
  private checkDailyLimit(amount: string): boolean {
    const today = new Date().toDateString();
    
    // Reset daily amount if it's a new day
    if (this.lastResetDate !== today) {
      this.dailyWithdrawalAmount = '0';
      this.lastResetDate = today;
    }
    
    const currentTotal = parseFloat(this.dailyWithdrawalAmount);
    const requestAmount = parseFloat(amount);
    const maxDaily = parseFloat(this.config.maxDailyWithdrawal);
    
    return (currentTotal + requestAmount) <= maxDaily;
  }

  /**
   * Estimate gas for USDT transfer
   */
  async estimateTransferGas(toAddress: string, amount: string): Promise<bigint> {
    if (!this.usdtContract) {
      throw new Error('Contract not initialized');
    }
    
    const amountWei = ethers.parseUnits(amount, 6);
    return await this.usdtContract.transfer.estimateGas(toAddress, amountWei);
  }

  /**
   * Get current gas price
   */
  async getCurrentGasPrice(): Promise<bigint> {
    const feeData = await this.provider.getFeeData();
    return feeData.gasPrice || ethers.parseUnits('20', 'gwei');
  }

  /**
   * Execute USDT withdrawal
   */
  async executeWithdrawal(request: WithdrawalRequest): Promise<TransactionResult> {
    if (!this.wallet || !this.usdtContract) {
      return {
        success: false,
        error: 'Wallet not initialized'
      };
    }

    try {
      // Validate withdrawal amount and daily limits
      if (!this.checkDailyLimit(request.amount)) {
        return {
          success: false,
          error: 'Daily withdrawal limit exceeded'
        };
      }

      // Check if address is valid
      if (!ethers.isAddress(request.toAddress)) {
        return {
          success: false,
          error: 'Invalid recipient address'
        };
      }

      // Check USDT balance
      const balance = await this.getUsdtBalance();
      if (parseFloat(balance) < parseFloat(request.amount)) {
        return {
          success: false,
          error: 'Insufficient USDT balance in hot wallet'
        };
      }

      // Check ETH balance for gas
      const ethBalance = await this.getEthBalance();
      const gasEstimate = await this.estimateTransferGas(request.toAddress, request.amount);
      const gasPrice = await this.getCurrentGasPrice();
      const gasCost = gasEstimate * gasPrice;
      const gasCostEth = ethers.formatEther(gasCost);

      if (parseFloat(ethBalance) < parseFloat(gasCostEth)) {
        return {
          success: false,
          error: 'Insufficient ETH balance for gas fees'
        };
      }

      // Validate gas price
      const maxGasPriceWei = ethers.parseUnits(this.config.maxGasPrice, 'gwei');
      if (gasPrice > maxGasPriceWei) {
        return {
          success: false,
          error: 'Gas price too high, withdrawal rejected'
        };
      }

      // Execute the transfer
      const amountWei = ethers.parseUnits(request.amount, 6);
      const tx = await this.usdtContract.transfer(request.toAddress, amountWei, {
        gasLimit: this.config.gasLimit,
        gasPrice: gasPrice
      });

      console.log(`Withdrawal transaction sent: ${tx.hash}`);
      
      // Wait for confirmation
      const receipt = await tx.wait();
      
      if (receipt && receipt.status === 1) {
        // Update daily withdrawal amount
        this.dailyWithdrawalAmount = (
          parseFloat(this.dailyWithdrawalAmount) + parseFloat(request.amount)
        ).toString();

        return {
          success: true,
          txHash: tx.hash,
          gasUsed: receipt.gasUsed.toString(),
          gasPrice: gasPrice.toString()
        };
      } else {
        return {
          success: false,
          error: 'Transaction failed or reverted'
        };
      }

    } catch (error: any) {
      console.error('Withdrawal execution failed:', error);
      return {
        success: false,
        error: error.message || 'Unknown error during withdrawal'
      };
    }
  }

  /**
   * Generate a new wallet (for setup purposes)
   */
  static generateNewWallet(): { address: string; privateKey: string } {
    const wallet = ethers.Wallet.createRandom();
    return {
      address: wallet.address,
      privateKey: wallet.privateKey
    };
  }

  /**
   * Validate wallet configuration
   */
  async validateConfiguration(): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];

    try {
      await this.initialize();
      
      // Check if we can connect to the network
      const blockNumber = await this.provider.getBlockNumber();
      if (!blockNumber) {
        errors.push('Cannot connect to blockchain network');
      }

      // Check ETH balance
      const ethBalance = await this.getEthBalance();
      if (parseFloat(ethBalance) < 0.01) {
        errors.push('Low ETH balance for gas fees');
      }

      // Check USDT balance
      const usdtBalance = await this.getUsdtBalance();
      if (parseFloat(usdtBalance) < 100) {
        errors.push('Low USDT balance in hot wallet');
      }

    } catch (error: any) {
      errors.push(`Configuration error: ${error.message}`);
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

// Export utility functions
export const hotWalletUtils = {
  generateWallet: HotWalletService.generateNewWallet,
  encryptPrivateKey: HotWalletService.encryptPrivateKey,
  decryptPrivateKey: HotWalletService.decryptPrivateKey
};