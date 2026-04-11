/**
 * WalletConnection Component
 * 
 * Handles wallet connection/disconnection and displays connected address
 * 
 * Features:
 * - Connect button with loading state
 * - Show connected address
 * - Disconnect functionality
 * - Copy address to clipboard
 * - Check if Freighter is installed
 */

'use client';

import { useState } from 'react';
import { stellar } from '@/lib/stellar-helper';
import { FaWallet, FaCopy, FaCheck } from 'react-icons/fa';
import { MdLogout } from 'react-icons/md';
import { Card } from './example-components';

interface WalletConnectionProps {
  onConnect: (publicKey: string) => void;
  onDisconnect: () => void;
}

export default function WalletConnection({ onConnect, onDisconnect }: WalletConnectionProps) {
  const [publicKey, setPublicKey] = useState<string>('');
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
      alert(`Failed to connect wallet:\n${error.message}`);
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

  const handleCopyAddress = async () => {
    await navigator.clipboard.writeText(publicKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isConnected) {
    return (
      <Card>
        <h2 className="text-2xl font-bold text-primary font-mono tracking-widest uppercase text-glow mb-4 flex items-center gap-2">
          <FaWallet className="text-primary glow-primary" />
          Initialize Uplink
        </h2>
        <p className="text-primary/70 font-mono text-sm leading-relaxed mb-6">
          Connect your identity module to view your state, transmit payloads, and interface with the network.
        </p>
        
        <button
          onClick={handleConnect}
          disabled={loading}
          className="w-full bg-primary/20 hover:bg-primary/40 text-primary font-mono font-bold tracking-widest uppercase py-4 px-6 rounded-xl border border-primary/50 hover:border-primary glow-primary transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3 relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/20 to-transparent translate-x-[-100%] group-hover:animate-[shimmer_2s_infinite]" />
          {loading ? (
            <>
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent shadow-[0_0_10px_hsl(var(--primary))]"></div>
              Initializing...
            </>
          ) : (
            <>
              <FaWallet className="text-xl" />
              Connect Wallet
            </>
          )}
        </button>

        <div className="mt-6 p-4 bg-black/40 border border-primary/20 backdrop-blur-md rounded-xl font-mono">
          <p className="text-primary/70 text-[10px] tracking-widest uppercase mb-3">
            <span className="text-primary glow-primary font-bold">INFO: </span> COMPATIBLE MODULES
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs text-primary/50">
            <div>✓ Freighter</div>
            <div>✓ xBull</div>
            <div>✓ Albedo</div>
            <div>✓ Rabet</div>
            <div>✓ Lobstr</div>
            <div>✓ Hana</div>
            <div>✓ WalletConnect</div>
            <div>✓ More...</div>
          </div>
          <p className="text-primary/40 text-[10px] mt-3 uppercase">
            Click "Connect Wallet" to select protocol
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-primary rounded-full animate-pulse shadow-[0_0_10px_hsl(var(--primary))]"></div>
          <span className="text-primary font-mono text-[10px] tracking-widest uppercase">Uplink Active</span>
        </div>
        <button
          onClick={handleDisconnect}
          className="text-red-500 hover:text-red-400 font-mono text-[10px] tracking-widest uppercase flex items-center gap-2 transition-colors"
        >
          <MdLogout /> Terminate
        </button>
      </div>

      <div className="bg-black/40 rounded-xl p-4 border border-primary/20 backdrop-blur-md">
        <p className="text-primary/60 text-[10px] tracking-widest uppercase font-mono mb-2">Public Identity Hash</p>
        <div className="flex items-center justify-between gap-3">
          <p className="text-primary text-sm font-mono break-all text-glow">
            {publicKey}
          </p>
          <button
            onClick={handleCopyAddress}
            className="text-primary hover:text-primary/70 text-xl flex-shrink-0 transition-all hover:scale-110"
            title={copied ? 'Copied!' : 'Copy address'}
          >
            {copied ? <FaCheck className="text-primary glow-primary" /> : <FaCopy />}
          </button>
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        <a
          href={stellar.getExplorerLink(publicKey, 'account')}
          target="_blank"
          rel="noopener noreferrer"
          className="text-secondary hover:text-secondary/70 font-mono text-xs uppercase tracking-widest underline transition-colors"
        >
          Inspect Network Node →
        </a>
      </div>
    </Card>
  );
}

