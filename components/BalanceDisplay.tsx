/**
 * BalanceDisplay Component
 * 
 * Displays user's XLM balance with refresh functionality
 * 
 * Features:
 * - Show XLM balance with nice formatting
 * - Refresh balance button
 * - Loading skeleton/spinner
 * - Multiple asset support (bonus feature ready)
 */

'use client';

import { useState, useEffect } from 'react';
import { stellar } from '@/lib/stellar-helper';
import { FaSync, FaCoins } from 'react-icons/fa';
import { Card } from './example-components';

interface BalanceDisplayProps {
  publicKey: string;
}

export default function BalanceDisplay({ publicKey }: BalanceDisplayProps) {
  const [balance, setBalance] = useState<string>('0');
  const [assets, setAssets] = useState<Array<{ code: string; issuer: string; balance: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchBalance = async () => {
    try {
      setRefreshing(true);
      const balanceData = await stellar.getBalance(publicKey);
      setBalance(balanceData.xlm);
      setAssets(balanceData.assets);
    } catch (error) {
      console.error('Error fetching balance:', error);
      alert('Failed to fetch balance. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (publicKey) {
      fetchBalance();
    }
  }, [publicKey]);

  const formatBalance = (balance: string): string => {
    const num = parseFloat(balance);
    return num.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 7,
    });
  };

  if (loading) {
    return (
      <Card>
        <div className="animate-pulse">
          <div className="h-16 bg-primary/20 rounded-lg mb-4"></div>
          <div className="h-10 bg-primary/10 rounded-lg w-1/2"></div>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-primary font-mono tracking-widest text-glow uppercase flex items-center gap-2">
          <FaCoins className="text-primary glow-primary mr-2" />
          Active Balance
        </h2>
        <button
          onClick={fetchBalance}
          disabled={refreshing}
          className="text-primary hover:text-primary/70 disabled:opacity-50 transition-colors"
          title="Refresh balance"
        >
          <FaSync className={`text-xl ${refreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* XLM Balance */}
      <div className="glass-panel border-primary/30 glow-primary rounded-[1.5rem] p-8 mb-4">
        <p className="text-primary/60 text-xs font-mono tracking-widest uppercase mb-4">Current Mainnet Equivalent</p>
        <div className="flex items-baseline gap-2">
          <p className="text-6xl font-bold text-primary text-glow font-mono tracking-tighter" suppressHydrationWarning>
            {formatBalance(balance)}
          </p>
          <p className="text-2xl text-primary/80 font-mono tracking-widest">XLM</p>
        </div>
        
        {/* USD Estimate (placeholder for bonus feature) */}
        <p className="text-primary/40 text-[10px] font-mono tracking-widest mt-4" suppressHydrationWarning>
          ≈ ${(parseFloat(balance) * 0.12).toFixed(2)} USD (SIMULATED)
        </p>
      </div>

      {/* Other Assets */}
      {assets.length > 0 && (
        <div className="space-y-2">
          <p className="text-white/60 text-sm mb-3">Other Assets</p>
          {assets.map((asset, index) => (
            <div
              key={index}
              className="bg-white/5 border border-white/10 rounded-lg p-4 flex justify-between items-center"
            >
              <div>
                <p className="text-white font-semibold">{asset.code}</p>
                <p className="text-white/40 text-xs font-mono truncate max-w-[200px]">
                  {asset.issuer}
                </p>
              </div>
              <p className="text-white text-lg font-bold">
                {formatBalance(asset.balance)}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Info Box */}
      <div className="mt-6 p-4 bg-black/40 border border-primary/20 backdrop-blur-md rounded-xl">
        <p className="text-primary/70 text-xs font-mono leading-relaxed">
          <span className="text-primary font-bold text-glow">💡 NETWORK PROTOCOL:</span> Keep at least 1 XLM in your identity module for ledger reserves.
        </p>
      </div>
    </Card>
  );
}

