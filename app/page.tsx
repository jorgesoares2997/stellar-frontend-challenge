/**
 * Stellar Payment Dashboard - Main Page
 * 
 * This is the main page that brings all components together.
 * All blockchain logic is in lib/stellar-helper.ts (DO NOT MODIFY)
 * 
 * Your job: Make this UI/UX amazing! 🎨
 */

'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// 🎓 MASTERCLASS: Handling non-SSR-friendly libraries
// Because stellar-helper.ts initializes the Wallet Kit immediately 
// (which needs the 'window' object), we must ensure these components 
// only load on the client side.
const WalletConnection = dynamic(() => import('@/components/WalletConnection'), { ssr: false });
const BalanceDisplay = dynamic(() => import('@/components/BalanceDisplay'), { ssr: false });
const PaymentForm = dynamic(() => import('@/components/PaymentForm'), { ssr: false });
const TransactionHistory = dynamic(() => import('@/components/TransactionHistory'), { ssr: false });
const BalanceChart = dynamic(() => import('@/components/BalanceChart'), { ssr: false });
const AddressBook = dynamic(() => import('@/components/AddressBook'), { ssr: false });

import { stellar } from '@/lib/stellar-helper';

/**
 * 🎓 MASTERCLASS: The Container Component
 * 
 * Why this? 
 * The BalanceChart needs TWO things: the Current Balance and the Transaction History.
 * We fetch both here and pass them down. This keeps our Chart component 
 * focused ONLY on rendering the data.
 */
function TransactionHistoryContainer({ publicKey }: { publicKey: string }) {
  const [data, setData] = useState<{ balance: string, txs: any[] } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [balanceData, txs] = await Promise.all([
          stellar.getBalance(publicKey),
          stellar.getRecentTransactions(publicKey, 20)
        ]);
        setData({ balance: balanceData.xlm, txs });
      } catch (e) {
        console.error('Failed to fetch analytics data', e);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [publicKey]);

  if (loading) return (
    <div className="h-64 bg-white/5 animate-pulse rounded-2xl border border-white/10" />
  );
  
  if (!data) return null;

  return (
    <BalanceChart 
      currentBalance={data.balance} 
      transactions={data.txs} 
      publicKey={publicKey} 
    />
  );
}

export default function Home() {
  const [publicKey, setPublicKey] = useState<string>('');
  const [isConnected, setIsConnected] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  
  // Note: For a production app, we would fetch balance and transactions here
  // and pass them down as props to avoid redundant network calls.
  // For now, we'll keep the components independent as originally designed
  // but let them share the refreshKey trigger.

  const handleConnect = (key: string) => {
    setPublicKey(key);
    setIsConnected(true);
  };

  const handleDisconnect = () => {
    setPublicKey('');
    setIsConnected(false);
  };

  const handlePaymentSuccess = () => {
    // Refresh balance and transaction history
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Header */}

      <header className="border-b border-primary/20 backdrop-blur-md bg-black/60 relative z-20">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-black/40 border border-primary/50 glow-primary rounded-xl flex items-center justify-center text-primary font-bold font-mono">
                [S]
              </div>
              <div>
                <h1 className="text-2xl font-bold text-primary font-mono tracking-widest text-glow uppercase">Cyberstellar</h1>
                <p className="text-primary/60 text-xs font-mono tracking-widest uppercase">Command Network</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <a
                href="https://stellar.org"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/60 hover:text-white text-sm transition-colors"
              >
                About Stellar
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/60 hover:text-white text-sm transition-colors"
              >
                GitHub
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Welcome Banner */}
        {!isConnected && (
          <div className="mb-10 glass-panel border-primary/30 glow-primary p-10 text-center relative max-w-4xl mx-auto rounded-[2rem] overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent pointer-events-none" />
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/20 rounded-full blur-[100px] pointer-events-none" />
            <h2 className="text-4xl font-black text-primary font-mono tracking-widest uppercase mb-4 text-glow relative z-10">
              System Offline
            </h2>
            <p className="text-primary/70 max-w-2xl mx-auto font-mono text-sm leading-relaxed relative z-10">
              Uplink required. Authenticate your identity module to access the global ledger, transmit secure payloads, and monitor quantum state changes across the network.
            </p>
          </div>
        )}

        {/* Wallet Connection */}
        <div className="mb-8">
          <WalletConnection onConnect={handleConnect} onDisconnect={handleDisconnect} />
        </div>

        {/* Dashboard Content - Only show when connected */}
        {isConnected && publicKey && (
          <div className="space-y-8">
            {/* Balance & Analytics Section */}
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1" key={`balance-${refreshKey}`}>
                <BalanceDisplay publicKey={publicKey} />
              </div>
              <div className="lg:col-span-2" key={`chart-${refreshKey}`}>
                {/* 
                  🎓 MASTERCLASS: Component Composition 
                  BalanceChart is a sub-component of our dashboard. 
                  Note: In a larger app, we would use a State Management 
                  library like Zustant or Redux to avoid 'Prop Drilling'.
                */}
                <TransactionHistoryContainer publicKey={publicKey} />
              </div>
            </div>

            {/* Actions & History Section */}
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Payment Form */}
              <div>
                <PaymentForm publicKey={publicKey} onSuccess={handlePaymentSuccess} />
              </div>

              {/* Address Book Persistence */}
              <div>
                <AddressBook />
              </div>
            </div>

            {/* Transaction History - Full Width for better readability */}
            <div key={`history-${refreshKey}`}>
              <TransactionHistory publicKey={publicKey} />
            </div>
          </div>
        )}

        {/* Getting Started Guide - Only show when not connected */}
        {!isConnected && (
          <div className="mt-8 grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { id: '01', title: 'Install Uplink', desc: 'Acquire Freighter, xBull, or compatible identity modules.', icon: '🔌' },
              { id: '02', title: 'Authenticate', desc: 'Initialize connection and bypass security protocols.', icon: '🔐' },
              { id: '03', title: 'Extract Funds', desc: 'Secure testnet credits via the Friendbot automated system.', icon: '💎' },
              { id: '04', title: 'Commence Tx', desc: 'Broadcast payloads across the decentralized state machine.', icon: '🚀' }
            ].map((step) => (
              <div key={step.id} className="glass-panel group hover:border-primary transition-all duration-500 p-6 rounded-2xl relative overflow-hidden">
                <div className="absolute -right-4 -bottom-4 text-primary/5 font-black text-8xl pointer-events-none font-mono">
                  {step.id}
                </div>
                <div className="w-12 h-12 bg-black/50 border border-primary/30 rounded-lg flex items-center justify-center mb-4 text-2xl group-hover:glow-primary transition-all">
                  {step.icon}
                </div>
                <h3 className="text-primary font-bold mb-2 font-mono tracking-wider">{step.title}</h3>
                <p className="text-primary/50 text-sm font-mono leading-relaxed relative z-10">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-primary/20 mt-16 bg-black/40 backdrop-blur-md relative z-20">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center text-primary/40 text-sm font-mono tracking-widest">
            <p className="mb-2 uppercase">
              Constructed via Stellar SDK // Testnet Environment Active
            </p>
            <p className="text-xs text-secondary glow-secondary inline-block">
              [ SECURE CONNECTION FAILED - SIMULATION ONLY ]
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
