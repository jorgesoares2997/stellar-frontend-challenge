'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface BalanceChartProps {
  currentBalance: string;
  transactions: Array<{
    amount?: string;
    from?: string;
    createdAt: string;
  }>;
  publicKey: string;
}

export default function BalanceChart({ currentBalance, transactions, publicKey }: BalanceChartProps) {
  const chartData = useMemo(() => {
    const current = parseFloat(currentBalance.replace(/,/g, ''));
    let running = current;

    // We calculate backwards to see history
    const points = transactions
      .filter(tx => tx.amount) // Ensure there is an amount
      .slice()
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .map((tx) => {
        const val = running;
        const amt = parseFloat(tx.amount || '0');
        const outgoing = tx.from === publicKey;
        // If we are looking back:
        // If it was outgoing, the previous balance was higher
        // If it was incoming, the previous balance was lower
        running = outgoing ? running + amt : running - amt;
        return {
          date: new Date(tx.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          balance: parseFloat(val.toFixed(2)),
        };
      })
      .reverse();

    return points;
  }, [currentBalance, transactions, publicKey]);

  if (!publicKey || chartData.length === 0) {
     return (
        <div className="card-dark h-full flex items-center justify-center opacity-40 border-dashed">
           <span className="font-mono text-[10px] tracking-[0.2em] uppercase">No Analytic Samples</span>
        </div>
     );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="card-dark h-full"
    >
      <div className="flex items-center justify-between mb-8">
        <h3 className="font-display text-2xl text-foreground italic">Node Trajectory</h3>
        <span className="font-mono text-[10px] text-muted-foreground tracking-[0.2em] uppercase">
          {chartData.length} Data Points
        </span>
      </div>

      <div className="h-64 mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="accentGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(175, 85%, 55%)" stopOpacity={0.15} />
                <stop offset="100%" stopColor="hsl(175, 85%, 55%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 9, fill: 'hsl(0, 0%, 45%)', fontFamily: 'Space Mono' }}
              dy={12}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 9, fill: 'hsl(0, 0%, 45%)', fontFamily: 'Space Mono' }}
              width={40}
              hide
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(0, 0%, 7%)',
                border: '1px solid hsl(0, 0%, 14%)',
                borderRadius: '8px',
                fontFamily: 'Space Mono',
                fontSize: '11px',
                color: 'hsl(0, 0%, 93%)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
              }}
              itemStyle={{ color: 'hsl(175, 85%, 55%)' }}
              labelStyle={{ marginBottom: '4px', opacity: 0.6 }}
              formatter={(value: any) => [`${parseFloat(value).toFixed(2)} XLM`, 'Balance']}
            />
            <Area
              type="monotone"
              dataKey="balance"
              stroke="hsl(175, 85%, 55%)"
              strokeWidth={2}
              fill="url(#accentGradient)"
              animationDuration={2000}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
