// Bitcoin wallet integration using Unisat and Xverse wallets

export interface BitcoinWalletProvider {
  address: string;
  publicKey: string;
  sendBitcoin: (address: string, amount: number) => Promise<string>;
}

export async function connectUnisatWallet(): Promise<BitcoinWalletProvider | null> {
  if (typeof window === 'undefined') return null;
  
  const { unisat } = window as any;
  
  if (!unisat) {
    alert('Please install Unisat Wallet for Bitcoin donations!');
    window.open('https://unisat.io/', '_blank');
    return null;
  }

  try {
    const accounts = await unisat.requestAccounts();
    const publicKey = await unisat.getPublicKey();
    
    return {
      address: accounts[0],
      publicKey,
      sendBitcoin: async (toAddress: string, amountSats: number) => {
        const txid = await unisat.sendBitcoin(toAddress, amountSats);
        return txid;
      }
    };
  } catch (err) {
    console.error('Error connecting to Unisat:', err);
    return null;
  }
}

export async function connectXverseWallet(): Promise<BitcoinWalletProvider | null> {
  if (typeof window === 'undefined') return null;

  try {
    // @ts-ignore
    const { getAddress, signTransaction } = await import('sats-connect');
    
    return new Promise((resolve, reject) => {
      getAddress({
        payload: {
          purposes: ['payment'],
          message: 'Connect wallet to donate',
          network: {
            type: 'Mainnet'
          }
        },
        onFinish: (response: any) => {
          const paymentAddress = response.addresses.find((addr: any) => addr.purpose === 'payment');
          
          if (paymentAddress) {
            resolve({
              address: paymentAddress.address,
              publicKey: paymentAddress.publicKey,
              sendBitcoin: async (toAddress: string, amountSats: number) => {
                // For now, we'll show the address to send to manually
                // Full implementation would use sats-connect's sendBtcTransaction
                alert(`Please send ${amountSats / 100000000} BTC to: ${toAddress}`);
                throw new Error('Manual Bitcoin payment not yet automated');
              }
            });
          } else {
            reject(new Error('No payment address found'));
          }
        },
        onCancel: () => reject(new Error('User cancelled'))
      });
    });
  } catch (err) {
    console.error('Error connecting to Xverse:', err);
    alert('Please install Xverse Wallet for Bitcoin donations!');
    window.open('https://www.xverse.app/', '_blank');
    return null;
  }
}

export function btcToSatoshis(btc: number): number {
  return Math.floor(btc * 100000000);
}

export function satoshisToBtc(sats: number): number {
  return sats / 100000000;
}

export function getBitcoinExplorerUrl(txid: string): string {
  return `https://mempool.space/tx/${txid}`;
}
