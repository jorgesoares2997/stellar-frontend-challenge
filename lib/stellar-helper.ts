/**
 * Stellar Helper
 *
 * Wallet integration via @creit.tech/stellar-wallets-kit (supports Freighter, xBull, Albedo, Lobstr).
 * Network: Stellar Testnet
 *
 * Key operations exposed:
 *  - connectWallet()   → opens wallet modal, calls kit.getAddress() to retrieve the public key
 *  - getAddress()      → directly retrieves the connected wallet's public key via kit.getAddress()
 *  - sendPayment()     → builds a Stellar transaction and signs it via kit.signTransaction()
 *  - getBalance()      → fetches XLM and asset balances from Horizon
 *  - disconnect()      → clears the connected wallet session
 */

import * as StellarSdk from '@stellar/stellar-sdk';
import {
  StellarWalletsKit,
  WalletNetwork,
  allowAllModules,
  FREIGHTER_ID,
} from '@creit.tech/stellar-wallets-kit';

export class StellarHelper {
  private server: StellarSdk.Horizon.Server;
  private networkPassphrase: string;
  private kit: StellarWalletsKit;
  private network: WalletNetwork;
  private publicKey: string | null = null;

  constructor(network: 'testnet' | 'mainnet' = 'testnet') {
    // Connect to Stellar Testnet via Horizon
    this.server = new StellarSdk.Horizon.Server(
      network === 'testnet'
        ? 'https://horizon-testnet.stellar.org'
        : 'https://horizon.stellar.org'
    );

    this.networkPassphrase =
      network === 'testnet'
        ? StellarSdk.Networks.TESTNET
        : StellarSdk.Networks.PUBLIC;

    this.network =
      network === 'testnet' ? WalletNetwork.TESTNET : WalletNetwork.PUBLIC;

    // Initialize Stellar Wallets Kit with Freighter as default wallet
    this.kit = new StellarWalletsKit({
      network: this.network,
      selectedWalletId: FREIGHTER_ID,
      modules: allowAllModules(),
    });
  }

  /**
   * Opens the wallet selection modal, then retrieves the wallet's public key
   * via kit.getAddress(). Supports Freighter, xBull, Albedo, and Lobstr.
   */
  async connectWallet(): Promise<string> {
    // Step 1: Open modal so the user can select and authorize their wallet
    await this.kit.openModal({
      onWalletSelected: (option) => {
        this.kit.setWallet(option.id);
      },
    });

    // Step 2: Retrieve the connected wallet's public key (address)
    const { address } = await this.kit.getAddress();

    if (!address) {
      throw new Error('No address returned from wallet');
    }

    this.publicKey = address;
    return address;
  }

  /**
   * Returns the connected wallet's public key directly via kit.getAddress().
   * Throws if no wallet is connected.
   */
  async getAddress(): Promise<string> {
    const { address } = await this.kit.getAddress();
    if (!address) throw new Error('Wallet not connected');
    return address;
  }

  /**
   * Fetches the XLM balance (and any other assets) for the given public key
   * from the Stellar Testnet Horizon server.
   */
  async getBalance(publicKey: string): Promise<{
    xlm: string;
    assets: Array<{ code: string; issuer: string; balance: string }>;
  }> {
    const account = await this.server.loadAccount(publicKey);

    const xlmBalance = account.balances.find(
      (b) => b.asset_type === 'native'
    );

    const assets = account.balances
      .filter((b) => b.asset_type !== 'native')
      .map((b: any) => ({
        code: b.asset_code,
        issuer: b.asset_issuer,
        balance: b.balance,
      }));

    return {
      xlm: xlmBalance && 'balance' in xlmBalance ? xlmBalance.balance : '0',
      assets,
    };
  }

  /**
   * Builds and submits an XLM payment transaction on Stellar Testnet.
   *
   * Flow:
   *  1. Load sender account from Horizon
   *  2. Build transaction with Payment operation
   *  3. Sign transaction via kit.signTransaction() (Freighter signs the XDR)
   *  4. Submit signed transaction to Horizon
   *  5. Return { hash, success }
   */
  async sendPayment(params: {
    from: string;
    to: string;
    amount: string;
    memo?: string;
  }): Promise<{ hash: string; success: boolean }> {
    // 1. Load the sender's account sequence number from Horizon
    const account = await this.server.loadAccount(params.from);

    // 2. Build the transaction
    const transactionBuilder = new StellarSdk.TransactionBuilder(account, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase: this.networkPassphrase,
    }).addOperation(
      StellarSdk.Operation.payment({
        destination: params.to,
        asset: StellarSdk.Asset.native(),
        amount: params.amount,
      })
    );

    if (params.memo) {
      transactionBuilder.addMemo(StellarSdk.Memo.text(params.memo));
    }

    const transaction = transactionBuilder.setTimeout(180).build();

    // 3. Sign the transaction XDR using the connected wallet (Freighter / kit)
    const { signedTxXdr } = await this.kit.signTransaction(
      transaction.toXDR(),
      { networkPassphrase: this.networkPassphrase }
    );

    // 4. Reconstruct and submit the signed transaction
    const signedTransaction = StellarSdk.TransactionBuilder.fromXDR(
      signedTxXdr,
      this.networkPassphrase
    );

    const result = await this.server.submitTransaction(
      signedTransaction as StellarSdk.Transaction
    );

    // 5. Return result with transaction hash
    return {
      hash: result.hash,
      success: result.successful,
    };
  }

  /**
   * Fetches recent payment operations for the given public key.
   */
  async getRecentTransactions(
    publicKey: string,
    limit: number = 10
  ): Promise<
    Array<{
      id: string;
      type: string;
      amount?: string;
      asset?: string;
      from?: string;
      to?: string;
      createdAt: string;
      hash: string;
    }>
  > {
    const payments = await this.server
      .payments()
      .forAccount(publicKey)
      .order('desc')
      .limit(limit)
      .call();

    return payments.records.map((payment: any) => ({
      id: payment.id,
      type: payment.type,
      amount: payment.amount,
      asset: payment.asset_type === 'native' ? 'XLM' : payment.asset_code,
      from: payment.from,
      to: payment.to,
      createdAt: payment.created_at,
      hash: payment.transaction_hash,
    }));
  }

  getExplorerLink(hash: string, type: 'tx' | 'account' = 'tx'): string {
    const net =
      this.networkPassphrase === StellarSdk.Networks.TESTNET
        ? 'testnet'
        : 'public';
    return `https://stellar.expert/explorer/${net}/${type}/${hash}`;
  }

  formatAddress(
    address: string,
    startChars: number = 4,
    endChars: number = 4
  ): string {
    if (address.length <= startChars + endChars) return address;
    return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
  }

  /** Disconnects the current wallet session by clearing the stored public key. */
  disconnect(): boolean {
    this.publicKey = null;
    return true;
  }
}

// Singleton configured for Stellar Testnet
export const stellar = new StellarHelper('testnet');
