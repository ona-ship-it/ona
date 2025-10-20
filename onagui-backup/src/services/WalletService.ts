export class WalletService {
  static connect(): Promise<string> {
    // Simulated wallet connection
    return Promise.resolve('0x1234567890abcdef');
  }

  static disconnect(): void {
    // Simulated wallet disconnection
    console.log('Wallet disconnected');
  }

  static getBalance(): Promise<string> {
    // Simulated balance check
    return Promise.resolve('100.0');
  }
}

export default WalletService;