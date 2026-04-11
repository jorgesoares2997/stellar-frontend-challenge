/**
 * TransactionHistory Component
 * 
 * Displays recent transactions for the connected wallet
 * 
 * Features:
 * - List recent transactions
 * - Show: amount, from/to, date
 * - Link to Stellar Expert for details
 * - Empty state when no transactions
 * - Loading state
 * - Refresh functionality
 */

'use client';

import { useState, useEffect, useMemo } from 'react';
import { stellar } from '@/lib/stellar-helper';
import { FaHistory, FaSync, FaArrowUp, FaArrowDown, FaExternalLinkAlt } from 'react-icons/fa';
import { Card, EmptyState } from './example-components';

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
  const [limit] = useState(50); // Fetch more to allow for better client-side filtering

  /**
   * 🎓 MASTERCLASS: Optimized Filtering
   * useMemo recalculates the filtered list ONLY when 'transactions', 
   * 'searchQuery', or 'dateFilter' change. This is critical for 
   * a smooth, "no-lag" search experience.
   */
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      // 1. Text Search Filter (Address or Transaction Hash)
      const matchesSearch = 
        tx.from?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.to?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.hash.toLowerCase().includes(searchQuery.toLowerCase());

      // 2. Date/Time Filter Logic
      if (dateFilter === 'all') return matchesSearch;

      const txDate = new Date(tx.createdAt);
      const now = new Date();
      const diffMs = now.getTime() - txDate.getTime();
      const diffDays = diffMs / (1000 * 60 * 60 * 24);

      const withinTimeRange = 
        (dateFilter === '24h' && diffDays <= 1) ||
        (dateFilter === '7d' && diffDays <= 7) ||
        (dateFilter === '30d' && diffDays <= 30);

      return matchesSearch && withinTimeRange;
    });
  }, [transactions, searchQuery, dateFilter]);

  const fetchTransactions = async () => {
    try {
      setRefreshing(true);
      const txs = await stellar.getRecentTransactions(publicKey, limit);
      setTransactions(txs);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (publicKey) {
      fetchTransactions();
    }
  }, [publicKey]);

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  const formatAddress = (address?: string): string => {
    if (!address) return 'N/A';
    return stellar.formatAddress(address, 4, 4);
  };

  const isOutgoing = (tx: Transaction): boolean => {
    return tx.from === publicKey;
  };

  if (loading) {
    return (
      <Card>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-20 bg-primary/10 border border-primary/20 rounded-lg"></div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="flex flex-col space-y-4">
        {/* Toolbar: Search and Filter */}
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-2xl font-bold text-primary font-mono tracking-widest uppercase text-glow flex items-center gap-2">
            <FaHistory className="text-primary glow-primary mr-1" />
            Activity Network
          </h2>
          <button
            onClick={fetchTransactions}
            disabled={refreshing}
            className="text-primary hover:text-primary/70 disabled:opacity-50 transition-colors"
          >
            <FaSync className={`text-xl ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search by address or hash..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black/40 border border-primary/20 rounded-xl px-4 py-2 text-primary placeholder-primary/30 font-mono text-sm focus:outline-none focus:border-primary focus:shadow-[0_0_15px_-3px_hsl(var(--primary)/0.5)] transition-all"
            />
          </div>
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value as any)}
            className="w-full sm:w-auto bg-black/40 border border-primary/20 rounded-xl px-4 py-2 text-primary focus:outline-none focus:border-primary focus:shadow-[0_0_15px_-3px_hsl(var(--primary)/0.5)] transition-all text-sm font-mono dropdown-neon"
          >
            <option value="all">All Time</option>
            <option value="24h">Last 24h</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
          </select>
        </div>

        {/* List: Filtered Transactions */}
        {filteredTransactions.length === 0 ? (
          <div className="py-20 text-center glass-panel rounded-2xl border-primary/20">
            <p className="text-4xl mb-4 opacity-50">🔍</p>
            <h3 className="text-primary font-mono tracking-widest uppercase font-bold mb-2">No results found</h3>
            <p className="text-primary/50 text-sm font-mono mb-4">Try adjusting your search or filters</p>
            <button 
              onClick={() => { setSearchQuery(''); setDateFilter('all'); }}
              className="text-primary hover:text-primary/80 text-sm font-bold font-mono border-b border-primary/50 pb-1"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTransactions.map((tx) => {
              const outgoing = isOutgoing(tx);
              
              return (
                <div
                  key={tx.id}
                  className="bg-black/40 backdrop-blur-md rounded-xl p-4 transition-all border border-primary/10 hover:border-primary/40 hover:shadow-[0_0_15px_-3px_hsl(var(--primary)/0.2)]"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        outgoing 
                          ? 'bg-red-500/20 text-red-400' 
                          : 'bg-green-500/20 text-green-400'
                      }`}>
                        {outgoing ? <FaArrowUp /> : <FaArrowDown />}
                      </div>
                      <div>
                        <p className="text-primary font-mono uppercase tracking-wider font-bold mb-1">
                          {outgoing ? 'Sent' : 'Received'}
                        </p>
                        {tx.amount && (
                          <p className={`text-lg font-bold ${
                            outgoing ? 'text-red-400' : 'text-green-400'
                          }`}>
                            {outgoing ? '-' : '+'}{parseFloat(tx.amount).toFixed(2)} {tx.asset || 'XLM'}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <a
                      href={stellar.getExplorerLink(tx.hash, 'tx')}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:text-primary/70 text-sm flex items-center gap-1 transition-colors font-mono tracking-widest"
                    >
                      Details <FaExternalLinkAlt className="text-xs" />
                    </a>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-primary/40 text-xs mb-1 uppercase font-mono tracking-wider">From</p>
                      <p className="text-primary/80 font-mono text-xs truncate" title={tx.from}>{formatAddress(tx.from)}</p>
                    </div>
                    <div>
                      <p className="text-primary/40 text-xs mb-1 uppercase font-mono tracking-wider">To</p>
                      <p className="text-primary/80 font-mono text-xs truncate" title={tx.to}>{formatAddress(tx.to)}</p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center mt-3 pt-3 border-t border-primary/20">
                    <p className="text-primary/50 text-[10px] font-mono tracking-widest" suppressHydrationWarning>{formatDate(tx.createdAt)}</p>
                    <p className="text-primary/30 text-[10px] font-mono">{tx.hash.slice(0, 16)}...</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {filteredTransactions.length > 0 && (
        <div className="mt-4 text-center border-t border-white/5 pt-4">
          <p className="text-white/40 text-xs">
            Showing {filteredTransactions.length} result{filteredTransactions.length !== 1 ? 's' : ''}
          </p>
        </div>
      )}
    </Card>
  );
}

