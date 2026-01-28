import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';

export interface SolanaWalletProvider {
  publicKey: PublicKey | null;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  signAndSendTransaction: (transaction: Transaction) => Promise<{ signature: string }>;
}

export async function connectPhantomWallet(): Promise<SolanaWalletProvider | null> {
  if (typeof window === 'undefined') return null;
  
  const { solana } = window as any;
  
  if (!solana?.isPhantom) {
    alert('Please install Phantom Wallet for Solana donations!');
    window.open('https://phantom.app/', '_blank');
    return null;
  }

  try {
    const resp = await solana.connect();
    return solana;
  } catch (err) {
    console.error('Error connecting to Phantom:', err);
    return null;
  }
}

export async function sendSolanaTransaction(
  wallet: SolanaWalletProvider,
  toAddress: string,
  amountSOL: number,
  rpcUrl: string = 'https://api.mainnet-beta.solana.com'
): Promise<string> {
  if (!wallet.publicKey) {
    throw new Error('Wallet not connected');
  }

  const connection = new Connection(rpcUrl, 'confirmed');
  
  // Create transaction
  const transaction = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: wallet.publicKey,
      toPubkey: new PublicKey(toAddress),
      lamports: amountSOL * LAMPORTS_PER_SOL,
    })
  );

  // Get recent blockhash
  transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
  transaction.feePayer = wallet.publicKey;

  // Sign and send transaction
  const { signature } = await wallet.signAndSendTransaction(transaction);
  
  // Wait for confirmation
  await connection.confirmTransaction(signature);
  
  return signature;
}

export function getSolanaExplorerUrl(signature: string, network: string = 'mainnet-beta'): string {
  return `https://solscan.io/tx/${signature}`;
}
