// Multi-chain cryptocurrency configuration

export interface CryptoNetwork {
  id: string;
  name: string;
  symbol: string;
  chainId?: string; // For EVM chains
  rpcUrl?: string;
  explorerUrl: string;
  platformWallet: string;
  tokenAddress?: string; // For tokens like USDC
  decimals: number;
  logo: string;
}

export const SUPPORTED_CRYPTOS: CryptoNetwork[] = [
  {
    id: 'ethereum',
    name: 'Ethereum',
    symbol: 'ETH',
    chainId: '0x1',
    rpcUrl: 'https://eth.llamarpc.com',
    explorerUrl: 'https://etherscan.io',
    platformWallet: process.env.NEXT_PUBLIC_PLATFORM_WALLET_ETHEREUM || '0x0077ab7Fe5a3CEbf2E68aB8cfC20Cc4a73a36428',
    decimals: 18,
    logo: '🔷',
  },
  {
    id: 'ethereum-usdc',
    name: 'USDC on Ethereum',
    symbol: 'USDC',
    chainId: '0x1',
    rpcUrl: 'https://eth.llamarpc.com',
    explorerUrl: 'https://etherscan.io',
    platformWallet: process.env.NEXT_PUBLIC_PLATFORM_WALLET_ETHEREUM || '0x0077ab7Fe5a3CEbf2E68aB8cfC20Cc4a73a36428',
    tokenAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    decimals: 6,
    logo: '💵',
  },
  {
    id: 'polygon',
    name: 'Polygon',
    symbol: 'MATIC',
    chainId: '0x89',
    rpcUrl: 'https://polygon-rpc.com',
    explorerUrl: 'https://polygonscan.com',
    platformWallet: process.env.NEXT_PUBLIC_PLATFORM_WALLET_POLYGON || '0x0077ab7Fe5a3CEbf2E68aB8cfC20Cc4a73a36428',
    decimals: 18,
    logo: '🟣',
  },
  {
    id: 'polygon-usdc',
    name: 'USDC on Polygon',
    symbol: 'USDC',
    chainId: '0x89',
    rpcUrl: 'https://polygon-rpc.com',
    explorerUrl: 'https://polygonscan.com',
    platformWallet: process.env.NEXT_PUBLIC_PLATFORM_WALLET_POLYGON || '0x0077ab7Fe5a3CEbf2E68aB8cfC20Cc4a73a36428',
    tokenAddress: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
    decimals: 6,
    logo: '💵',
  },
  {
    id: 'base',
    name: 'Base',
    symbol: 'ETH',
    chainId: '0x2105',
    rpcUrl: 'https://mainnet.base.org',
    explorerUrl: 'https://basescan.org',
    platformWallet: process.env.NEXT_PUBLIC_PLATFORM_WALLET_BASE || '0x0077ab7Fe5a3CEbf2E68aB8cfC20Cc4a73a36428',
    decimals: 18,
    logo: '🔵',
  },
  {
    id: 'base-usdc',
    name: 'USDC on Base',
    symbol: 'USDC',
    chainId: '0x2105',
    rpcUrl: 'https://mainnet.base.org',
    explorerUrl: 'https://basescan.org',
    platformWallet: process.env.NEXT_PUBLIC_PLATFORM_WALLET_BASE || '0x0077ab7Fe5a3CEbf2E68aB8cfC20Cc4a73a36428',
    tokenAddress: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    decimals: 6,
    logo: '💵',
  },
  {
    id: 'bnb',
    name: 'BNB Chain',
    symbol: 'BNB',
    chainId: '0x38',
    rpcUrl: 'https://bsc-dataseed.binance.org',
    explorerUrl: 'https://bscscan.com',
    platformWallet: process.env.NEXT_PUBLIC_PLATFORM_WALLET_BNB || '0x0077ab7Fe5a3CEbf2E68aB8cfC20Cc4a73a36428',
    decimals: 18,
    logo: '🟡',
  },
  {
    id: 'bnb-usdc',
    name: 'USDC on BNB',
    symbol: 'USDC',
    chainId: '0x38',
    rpcUrl: 'https://bsc-dataseed.binance.org',
    explorerUrl: 'https://bscscan.com',
    platformWallet: process.env.NEXT_PUBLIC_PLATFORM_WALLET_BNB || '0x0077ab7Fe5a3CEbf2E68aB8cfC20Cc4a73a36428',
    tokenAddress: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
    decimals: 18,
    logo: '💵',
  },
  {
    id: 'bitcoin',
    name: 'Bitcoin',
    symbol: 'BTC',
    explorerUrl: 'https://blockchain.com',
    platformWallet: process.env.NEXT_PUBLIC_PLATFORM_WALLET_BITCOIN || 'bc1qf06408puy797vjwdv36rmju2jw2sj9v8nnck0e',
    decimals: 8,
    logo: '₿',
  },
  {
    id: 'solana',
    name: 'Solana',
    symbol: 'SOL',
    explorerUrl: 'https://solscan.io',
    platformWallet: process.env.NEXT_PUBLIC_PLATFORM_WALLET_SOLANA || '2XbHxvuDFLz7k2KJFRrwVpYLZHQTNzkvhRjzTxxrMMD4',
    decimals: 9,
    logo: '◎',
  },
  {
    id: 'tron-usdt',
    name: 'USDT (TRC20)',
    symbol: 'USDT',
    explorerUrl: 'https://tronscan.org',
    platformWallet: process.env.NEXT_PUBLIC_PLATFORM_WALLET_TRON || 'TXYZopYRdj2D9XRtbG411XZZ3kM5VkAeBf',
    tokenAddress: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t', // USDT contract on TRON
    decimals: 6,
    logo: '💰',
  },
];

export const ERC20_ABI = [
  'function transfer(address to, uint256 amount) returns (bool)',
  'function balanceOf(address owner) view returns (uint256)',
  'function decimals() view returns (uint8)',
];

export function getCryptoById(id: string): CryptoNetwork | undefined {
  return SUPPORTED_CRYPTOS.find(c => c.id === id);
}

export function getCryptosByChain(chainId: string): CryptoNetwork[] {
  return SUPPORTED_CRYPTOS.filter(c => c.chainId === chainId);
}
