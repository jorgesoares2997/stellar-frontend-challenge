'use client';

import React, { useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { Card } from './example-components';
import { TrendingUp, Activity } from 'lucide-react';

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

interface BalanceChartProps {
  currentBalance: string;
  transactions: Transaction[];
  publicKey: string;
}

/**
 * 🎓 MASTERCLASS: Reconstructing State from History
 * 
 * Blockchains are "State Machines." They only store the *current* balance. 
 * To show a chart of history, we must "replay" the events backwards.
 * 
 * Logic:
 * 1. Start with the CURRENT balance.
 * 2. Go backwards through transactions.
 * 3. If we received 10 XLM, it means we had 10 XLM *less* before that.
 * 4. If we sent 5 XLM, it means we had 5 XLM *more* before that.
 */
export default function BalanceChart({ currentBalance, transactions, publicKey }: BalanceChartProps) {
  const chartData = useMemo(() => {
    if (!transactions.length) return [];

    let runningBalance = parseFloat(currentBalance);
    
    // We sort transactions by date (newest first) and map them
    // but to build the chart we process them from newest to oldest
    const history = transactions.map((tx) => {
      const amount = parseFloat(tx.amount || '0');
      const isOutgoing = tx.from === publicKey;
      
      const point = {
        name: new Date(tx.createdAt).toLocaleDateString(),
        balance: runningBalance,
        timestamp: new Date(tx.createdAt).getTime(),
      };

      // Rewind the balance for the NEXT point (which is actually the PREVIOUS time)
      if (isOutgoing) {
        runningBalance += amount; // We have more before we sent it
      } else {
        runningBalance -= amount; // We had less before we received it
      }

      return point;
    });

    // Reverse to show oldest to newest on the chart
    return history.reverse();
  }, [currentBalance, transactions, publicKey]);

  if (transactions.length < 2) {
    return (
      <Card>
        <div className="h-64 flex flex-col items-center justify-center text-primary/70 font-mono text-sm tracking-widest uppercase text-center">
          <Activity size={48} className="mb-4 text-primary glow-primary opacity-50" />
          <p>Insufficient state history data.</p>
          <p className="text-xs opacity-50 mt-2">Requires minimum 2 ledger entries.</p>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10 text-primary glow-primary">
            <TrendingUp size={20} />
          </div>
          <h2 className="text-xl font-bold text-primary text-glow font-mono tracking-widest uppercase">State Analytics</h2>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-primary/60 uppercase tracking-widest font-mono mb-1">Current State</p>
          <p className="text-xl font-bold text-primary text-glow font-mono" suppressHydrationWarning>{parseFloat(currentBalance).toFixed(2)} XLM</p>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border) / 0.1)" />
            <XAxis 
              dataKey="name" 
              hide 
            />
            <YAxis 
              hide 
              domain={['dataMin - 1', 'dataMax + 1']} 
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(0,0,0,0.8)', 
                borderColor: 'hsl(var(--primary)/0.3)',
                borderRadius: '8px',
                color: 'hsl(var(--primary))',
                fontFamily: 'monospace',
                boxShadow: '0 0 15px -3px hsl(var(--primary)/0.3)'
              }}
              itemStyle={{ color: 'hsl(var(--primary))' }}
            />
            <Area 
              type="monotone" 
              dataKey="balance" 
              stroke="hsl(var(--primary))" 
              fillOpacity={1} 
              fill="url(#colorBalance)" 
              strokeWidth={3}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
