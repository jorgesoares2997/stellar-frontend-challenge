'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownLeft, ExternalLink, RefreshCw, Search } from 'lucide-react';
import { stellar } from '@/lib/stellar-helper';

interface Transaction {
  id: string;
  type: string;
  amount?: string;
  asset?: string;
  from?: string;
  to?: string;
  createdAt: string;
  hash: string;
}

interface TransactionHistoryProps {
  publicKey: string;
}

export default function TransactionHistory({ publicKey }: TransactionHistoryProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState<'all' | '24h' | '7d' | '30d'>('all');

  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const matchesSearch =
        !searchQuery ||
        tx.from?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.to?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.hash.toLowerCase().includes(searchQuery.toLowerCase());

      if (dateFilter === 'all') return matchesSearch;
      const diffDays = (Date.now() - new Date(tx.createdAt).getTime()) / 86400000;
      const withinRange =
        (dateFilter === '24h' && diffDays <= 1) ||
        (dateFilter === '7d' && diffDays <= 7) ||
        (dateFilter === '30d' && diffDays <= 30);
      return matchesSearch && withinRange;
    });
  }, [transactions, searchQuery, dateFilter]);

  const fetchTransactions = async () => {
    if (!publicKey) return;
    try {
      setRefreshing(true);
      const txs = await stellar.getRecentTransactions(publicKey, 50);
      setTransactions(txs);
    } catch (e) {
      console.error('Tx fetch error:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (publicKey) fetchTransactions();
  }, [publicKey]);

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const diffMs = Date.now() - date.getTime();
    const mins = Math.floor(diffMs / 60000);
    const hrs = Math.floor(diffMs / 3600000);
    const days = Math.floor(diffMs / 86400000);
    if (mins < 1) return 'Now';
    if (mins < 60) return `${mins}m`;
    if (hrs < 24) return `${hrs}h`;
    if (days < 7) return `${days}d`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const isOutgoing = (tx: Transaction) => tx.from === publicKey;

  if (loading && publicKey) {
    return (
      <div className="card-dark space-y-3 border-dashed opacity-50">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="animate-pulse h-16 bg-muted/20 rounded-md" />
        ))}
      </div>
    );
  }

  if (!publicKey) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="card-dark"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
           <h3 className="font-display text-2xl text-foreground italic leading-none">Ledger Registry</h3>
           <div className="px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20">
             <span className="font-mono text-[9px] text-primary uppercase font-bold tracking-tight">Real-time</span>
           </div>
        </div>
        <button
          onClick={fetchTransactions}
          disabled={refreshing}
          className="text-muted-foreground hover:text-primary transition-colors focus:outline-none"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/50" />
          <input
            type="text"
            placeholder="Search hash or node address…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-dark pl-9 font-mono text-[11px] tracking-tight placeholder:italic"
          />
        </div>
        <div className="flex items-center gap-1.5 p-1 bg-muted/20 border border-border rounded-lg">
          {(['all', '24h', '7d', '30d'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setDateFilter(f)}
              className={`px-3 py-1.5 rounded-md font-mono text-[9px] tracking-[0.15em] uppercase transition-all duration-300 ${
                dateFilter === f
                  ? 'bg-primary text-primary-foreground shadow-glow'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {f === 'all' ? 'All' : f}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {filteredTransactions.length === 0 ? (
        <div className="text-center py-24 border border-dashed border-border rounded-lg bg-muted/5">
          <p className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase mb-4">Registry Empty</p>
          <button
            onClick={() => { setSearchQuery(''); setDateFilter('all'); }}
            className="text-primary text-[10px] font-mono hover:underline uppercase tracking-widest"
          >
            Reset Query
          </button>
        </div>
      ) : (
        <div className="space-y-px">
          {filteredTransactions.map((tx, i) => {
            const outgoing = isOutgoing(tx);
            return (
              <motion.div
                key={tx.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.02 }}
                className="flex items-center gap-4 py-5 border-b border-border/40 last:border-0 group hover:bg-muted/30 transition-all -mx-6 px-6"
              >
                <div className={`w-9 h-9 rounded flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105 ${
                  outgoing ? 'bg-destructive/5 text-destructive border border-destructive/20' : 'bg-primary/5 text-primary border border-primary/20'
                }`}>
                  {outgoing ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownLeft className="w-4 h-4" />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className={outgoing ? 'tag-sent' : 'tag-received'}>
                      {outgoing ? 'Transmitted' : 'Received'}
                    </span>
                    <span className="font-mono text-[9px] text-muted-foreground/60 tracking-tighter" suppressHydrationWarning>
                       {formatDate(tx.createdAt)}
                    </span>
                  </div>
                  <p className="font-mono text-[11px] text-foreground/40 mt-1 truncate max-w-[200px] md:max-w-none">
                    {stellar.formatAddress(outgoing ? tx.to || '' : tx.from || '', 8, 8)}
                  </p>
                </div>

                <div className="text-right flex-shrink-0">
                  <p className={`font-mono text-sm font-bold tracking-tight ${outgoing ? 'text-destructive' : 'text-primary'}`}>
                    {outgoing ? '−' : '+'}{tx.amount} <span className="text-[10px] font-normal opacity-70">XLM</span>
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <a
                    href={stellar.getExplorerLink(tx.hash, 'tx')}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary opacity-0 group-hover:opacity-100 transition-all p-1"
                    title="View Transaction"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
