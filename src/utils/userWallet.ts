import { Keypair } from "@solana/web3.js";
import { encryptPrivateKey } from "./encryption";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export async function createUserWallet(userId: string) {
  try {
    // Generate Solana keypair
    const keypair = Keypair.generate();
    const address = keypair.publicKey.toBase58();
    
    // Encrypt the private key
    const encryptedKey = encryptPrivateKey(
      Buffer.from(keypair.secretKey).toString("hex"),
      process.env.WALLET_ENCRYPTION_KEY!
    );

    // Create wallet entry with initial balances
    const { error: walletError } = await supabase.from("wallets").insert({
      user_id: userId,
      balance_fiat: 0,
      balance_tickets: 0,
    });

    if (walletError) {
      console.error("Error creating wallet:", walletError);
      throw walletError;
    }

    // Create user crypto wallet entry
    const { error: cryptoWalletError } = await supabase.from("user_crypto_wallets").insert({
      user_id: userId,
      address,
      encrypted_private_key: encryptedKey,
      network: "solana",
    });

    if (cryptoWalletError) {
      console.error("Error creating crypto wallet:", cryptoWalletError);
      throw cryptoWalletError;
    }

    console.log(`✅ Created wallet for user ${userId} with Solana address: ${address}`);
    
    return {
      success: true,
      address,
      network: "solana"
    };
  } catch (error) {
    console.error("Error in createUserWallet:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}