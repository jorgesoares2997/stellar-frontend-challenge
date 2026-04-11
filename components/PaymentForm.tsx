'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpRight, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react';
import { stellar } from '@/lib/stellar-helper';

interface PaymentFormProps {
  publicKey: string;
  onSuccess: () => void;
}

export default function PaymentForm({ publicKey, onSuccess }: PaymentFormProps) {
  const [to, setTo] = useState('');
  const [amount, setAmount] = useState('');
  const [memo, setMemo] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ hash: string; success: boolean } | null>(null);
  const [error, setError] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!to || !amount) return;
    if (!to.startsWith('G') || to.length < 56) {
      setError('Invalid Stellar address');
      return;
    }
    if (parseFloat(amount) <= 0) {
      setError('Amount must be greater than 0');
      return;
    }
    setError('');
    setShowConfirm(true);
  };

  const handleConfirm = async () => {
    setShowConfirm(false);
    setLoading(true);
    setResult(null);
    setError('');
    try {
      const res = await stellar.sendPayment({ from: publicKey, to, amount, memo });
      setResult(res);
      if (res.success) {
        onSuccess();
        setTo('');
        setAmount('');
        setMemo('');
      } else {
        setError('Transaction failed on network');
      }
    } catch (e: any) {
      console.error('Payment error:', e);
      setError(e.message || 'Payment failed. Verify testnet funding.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="card-dark"
    >
      <div className="flex items-center gap-3 mb-6">
        <ArrowUpRight className="w-4 h-4 text-primary" />
        <h3 className="font-display text-xl text-foreground italic">Payload Transmission</h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label-editorial text-muted-foreground/60">Destination Node</label>
          <input
            type="text"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            placeholder="GABCD…WXYZ"
            className="input-dark font-mono text-xs tracking-wider"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label-editorial text-muted-foreground/60">Asset Quantity (XLM)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              step="0.01"
              min="0"
              className="input-dark font-mono text-sm"
            />
          </div>
          <div>
            <label className="label-editorial text-muted-foreground/60">Reference Code</label>
            <input
              type="text"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="Optional"
              className="input-dark font-mono text-sm"
            />
          </div>
        </div>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center gap-2 text-destructive text-xs font-mono bg-destructive/5 border border-destructive/20 rounded-md p-3"
            >
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        <button
          type="submit"
          disabled={loading || !to || !amount}
          className="btn-primary w-full flex items-center justify-center gap-2 group transition-all"
        >
          {loading ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              <span>Initializing Burn…</span>
            </>
          ) : (
            <>
              <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              Transmit
            </>
          )}
        </button>
      </form>

      {/* Confirmation modal */}
      <AnimatePresence>
        {showConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-card border border-border shadow-elevated rounded-lg p-8 max-w-sm w-full"
            >
              <h4 className="font-display text-2xl mb-2 italic text-foreground text-center">Verify Link</h4>
              <p className="font-body text-xs text-muted-foreground text-center mb-8">Review the transaction parameters before signing.</p>
              
              <div className="space-y-4 mb-8">
                <div className="bg-muted/30 rounded-md p-4 space-y-1">
                  <span className="label-editorial text-[9px]">Uplink Target</span>
                  <p className="font-mono text-[11px] text-foreground break-all leading-relaxed">{to}</p>
                </div>
                <div className="bg-muted/30 rounded-md p-4 space-y-1">
                  <span className="label-editorial text-[9px]">Asset Volume</span>
                  <p className="font-display text-4xl text-foreground italic leading-none">
                    {amount} <span className="text-sm font-mono text-muted-foreground italic not-italic">XLM</span>
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowConfirm(false)} className="btn-ghost flex-1 py-3 text-xs tracking-widest uppercase">Abort</button>
                <button onClick={handleConfirm} className="btn-primary flex-1 py-3 text-xs tracking-widest uppercase shadow-glow">Authorize</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success state */}
      <AnimatePresence>
        {result?.success && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="mt-6 bg-primary/5 border border-primary/20 rounded-md p-4"
          >
            <div className="flex items-center gap-2 text-primary mb-2">
              <CheckCircle className="w-4 h-4 shadow-glow" />
              <span className="font-body text-sm font-medium">Transmission Confirmed</span>
            </div>
            <div className="flex items-center justify-between">
               <span className="font-mono text-[10px] text-muted-foreground truncate max-w-[150px]">{result.hash}</span>
               <a
                href={stellar.getExplorerLink(result.hash, 'tx')}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-mono text-primary hover:underline inline-flex items-center gap-1"
              >
                Inspect Ledger <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
