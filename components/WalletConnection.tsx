'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, Check, ExternalLink, LogOut, ArrowRight } from 'lucide-react';
import { stellar } from '@/lib/stellar-helper';

interface WalletConnectionProps {
  onConnect: (publicKey: string) => void;
  onDisconnect: () => void;
}

export default function WalletConnection({ onConnect, onDisconnect }: WalletConnectionProps) {
  const [publicKey, setPublicKey] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleConnect = async () => {
    try {
      setLoading(true);
      const key = await stellar.connectWallet();
      setPublicKey(key);
      setIsConnected(true);
      onConnect(key);
    } catch (error: any) {
      console.error('Connection error:', error);
      // Removed alert to keep it minimal as per the reimagined UI's vibe
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = () => {
    stellar.disconnect();
    setPublicKey('');
    setIsConnected(false);
    onDisconnect();
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(publicKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isConnected) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="text-center"
      >
        <h2 className="font-display text-4xl md:text-6xl lg:text-7xl text-foreground italic leading-[0.95] mb-6">
          Connect your
          <br />
          <span className="text-gradient-accent">wallet</span>
        </h2>
        <p className="font-body text-sm text-muted-foreground max-w-sm mx-auto mb-10 leading-relaxed">
          Link your Stellar wallet to begin. We support Freighter, xBull, Albedo, and Lobstr.
        </p>

        <button
          onClick={handleConnect}
          disabled={loading}
          className="group btn-primary text-base px-10 py-4 inline-flex items-center gap-3 relative overflow-hidden"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              <span>Connecting…</span>
            </>
          ) : (
            <>
              <span>Enter</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>

        <div className="mt-12 flex items-center justify-center gap-6">
          {['Freighter', 'xBull', 'Albedo', 'Lobstr'].map((w) => (
            <span key={w} className="font-mono text-[10px] text-muted-foreground/40 tracking-[0.15em] uppercase">
              {w}
            </span>
          ))}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between flex-wrap gap-4 py-4 border-b border-border"
    >
      <div className="flex items-center gap-3">
        <div className="w-2 h-2 bg-primary rounded-full animate-pulse shadow-glow" />
        <span className="font-mono text-[10px] text-muted-foreground tracking-[0.2em] uppercase">Connected</span>
      </div>

      <div className="flex items-center gap-2 flex-1 min-w-0 mx-6">
        <span className="font-mono text-xs text-foreground/60 truncate max-w-[200px] md:max-w-none">{publicKey}</span>
        <button onClick={handleCopy} className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0">
          {copied ? <Check className="w-3.5 h-3.5 text-primary" /> : <Copy className="w-3.5 h-3.5" />}
        </button>
        <a
          href={stellar.getExplorerLink(publicKey, 'account')}
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted-foreground hover:text-primary transition-colors flex-shrink-0"
        >
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      <button
        onClick={handleDisconnect}
        className="btn-ghost text-xs inline-flex items-center gap-2 text-muted-foreground hover:text-destructive transition-all"
      >
        <LogOut className="w-3.5 h-3.5" />
        Disconnect
      </button>
    </motion.div>
  );
}
