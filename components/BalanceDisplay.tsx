'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, TrendingUp } from 'lucide-react';
import { stellar } from '@/lib/stellar-helper';

interface BalanceDisplayProps {
  publicKey: string;
}

export default function BalanceDisplay({ publicKey }: BalanceDisplayProps) {
  const [balance, setBalance] = useState('0');
  const [assets, setAssets] = useState<Array<{ code: string; issuer: string; balance: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchBalance = async () => {
    if (!publicKey) return;
    try {
      setRefreshing(true);
      const data = await stellar.getBalance(publicKey);
      setBalance(data.xlm);
      setAssets(data.assets);
    } catch (e) {
      console.error('Balance fetch error:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (publicKey) {
      fetchBalance();
      // Add a periodic refresh like the original component had
      const interval = setInterval(fetchBalance, 30000);
      return () => clearInterval(interval);
    }
  }, [publicKey]);

  if (loading && publicKey) {
    return (
      <div className="card-dark h-full animate-pulse bg-muted/20 border-dashed">
        <div className="h-4 bg-muted/40 rounded w-20 mb-8" />
        <div className="h-16 bg-muted/40 rounded w-40 mb-3" />
        <div className="h-4 bg-muted/40 rounded w-24" />
      </div>
    );
  }

  if (!publicKey) return null;

  const numericBalance = parseFloat(balance.replace(/,/g, '')) || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="card-dark h-full relative overflow-hidden"
    >
      {/* Background Decor */}
      <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full opacity-[0.06] blur-[60px] pointer-events-none"
        style={{ background: 'hsl(175 85% 55%)' }}
      />

      <div className="flex items-center justify-between mb-8">
        <span className="label-editorial mb-0 text-muted-foreground/60">Asset Reserve</span>
        <button
          onClick={fetchBalance}
          disabled={refreshing}
          className="text-muted-foreground hover:text-primary transition-colors focus:outline-none"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="relative z-10">
        <div className="flex items-baseline gap-2">
          <span className="font-display text-5xl md:text-6xl text-foreground italic tracking-tight">
            {balance}
          </span>
          <span className="font-mono text-sm text-muted-foreground">XLM</span>
        </div>

        <div className="flex items-center gap-2 mt-3">
          <TrendingUp className="w-3.5 h-3.5 text-primary/60" />
          <span className="font-mono text-xs text-primary/60">
            Node Status: Operational
          </span>
        </div>
      </div>

      {assets.length > 0 && (
        <div className="mt-8 pt-6 border-t border-border/50 space-y-3">
          <span className="label-editorial">Sub-Ledder Assets</span>
          {assets.map((asset, i) => (
            <div key={i} className="flex items-center justify-between group">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] text-muted-foreground w-6 h-6 rounded bg-muted/30 flex items-center justify-center uppercase group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                  {asset.code.slice(0, 2)}
                </span>
                <span className="font-body text-sm text-foreground/80">{asset.code}</span>
              </div>
              <span className="font-mono text-sm text-foreground/70">{asset.balance}</span>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
