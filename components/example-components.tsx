/**
 * Example Components
 * 
 * These are example components you can use as inspiration for your UI.
 * Feel free to modify, delete, or create your own components!
 */

'use client';

import { useState } from 'react';

// Example: Loading Spinner
export function LoadingSpinner() {
  return (
    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]">
      <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
        Loading...
      </span>
    </div>
  );
}

// Example: Balance Card
export function BalanceCard({ 
  balance, 
  label 
}: { 
  balance: string; 
  label: string; 
}) {
  return (
    <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl p-6 shadow-lg">
      <p className="text-white/80 text-sm mb-2">{label}</p>
      <p className="text-4xl font-bold text-white">{balance}</p>
    </div>
  );
}

// Example: Transaction Item
export function TransactionItem({
  type,
  amount,
  asset,
  date,
  hash,
  explorerLink,
}: {
  type: string;
  amount?: string;
  asset?: string;
  date: string;
  hash: string;
  explorerLink: string;
}) {
  return (
    <div className="bg-white/5 hover:bg-white/10 rounded-lg p-4 transition-colors">
      <div className="flex justify-between items-start mb-2">
        <div>
          <p className="text-white font-semibold">
            {type === 'payment' ? '💸' : '📝'} {type}
          </p>
          {amount && (
            <p className="text-white/80">
              {amount} {asset || 'XLM'}
            </p>
          )}
        </div>
        
        <a
          href={explorerLink}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 hover:text-blue-300 text-sm"
        >
          View →
        </a>
      </div>
      <div className="flex justify-between text-xs text-white/50">
        <span>{new Date(date).toLocaleString()}</span>
        <span className="font-mono">{hash.slice(0, 8)}...</span>
      </div>
    </div>
  );
}

// Example: Copy to Clipboard Button
export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="text-blue-400 hover:text-blue-300 text-sm"
    >
      {copied ? '✓ Copied!' : '📋 Copy'}
    </button>
  );
}

// Example: Alert/Toast Component
export function Alert({
  type,
  message,
  onClose,
}: {
  type: 'success' | 'error' | 'info';
  message: string;
  onClose: () => void;
}) {
  const colors = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
  };

  return (
    <div
      className={`bg-black/60 backdrop-blur-md border ${
        type === 'success' ? 'border-primary text-primary glow-primary' : 
        type === 'error' ? 'border-red-500 text-red-500 shadow-[0_0_15px_-3px_rgba(239,68,68,0.5)]' : 
        'border-blue-500 text-blue-500'
      } px-6 py-4 rounded-lg flex justify-between items-center transition-all`}
    >
      <span className="font-mono text-sm tracking-wide">{message}</span>
      <button
        onClick={onClose}
        className="ml-4 opacity-70 hover:opacity-100 transition-opacity"
      >
        ✕
      </button>
    </div>
  );
}

// Example: Card Component
export function Card({
  title,
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="glass-panel rounded-2xl p-6 relative overflow-hidden group">
      {/* Subtle background glow effect on hover */}
      <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      <div className="relative z-10">
      {title && (
        <h2 className="text-2xl font-bold text-white mb-4">{title}</h2>
      )}
      {children}
      </div>
    </div>
  );
}

// Example: Input Component
export function Input({
  label,
  placeholder,
  type = 'text',
  value,
  onChange,
  error,
}: {
  label: string;
  placeholder?: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
}) {
  return (
    <div className="relative group/input">
      <label className="block text-primary/80 font-mono text-xs uppercase tracking-widest mb-2 flex items-center gap-2">
        <span className="w-1 h-3 bg-primary inline-block animate-pulse"></span>
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-black/40 border border-primary/20 rounded-lg px-4 py-3 text-primary placeholder-primary/30 font-mono focus:outline-none focus:border-primary focus:shadow-[0_0_15px_-3px_hsl(var(--primary)/0.5)] transition-all"
      />
      {error && <p className="text-red-400 font-mono text-xs mt-2 flex items-center gap-1"><span className="text-red-500">⚠</span> {error}</p>}
    </div>
  );
}

// Example: Button Component
export function Button({
  children,
  onClick,
  variant = 'primary',
  disabled = false,
  fullWidth = false,
}: {
  children: React.ReactNode;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
  fullWidth?: boolean;
}) {
  const variants = {
    primary: 'bg-primary/10 hover:bg-primary/20 text-primary border border-primary/50 hover:border-primary glow-primary font-mono tracking-widest uppercase',
    secondary: 'bg-secondary/10 hover:bg-secondary/20 text-secondary border border-secondary/50 hover:border-secondary glow-secondary font-mono tracking-widest uppercase',
    danger: 'bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/50 hover:border-red-500 shadow-[0_0_15px_-3px_rgba(239,68,68,0.5)] font-mono tracking-widest uppercase',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`relative overflow-hidden group/btn ${variants[variant]} ${
        fullWidth ? 'w-full' : ''
      } py-3 px-6 rounded-lg transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed`}
    >
      <span className="relative z-10">{children}</span>
    </button>
  );
}

// Example: Empty State Component
export function EmptyState({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="text-center py-12">
      <div className="text-6xl mb-4">{icon}</div>
      <h3 className="text-white text-xl font-semibold mb-2">{title}</h3>
      <p className="text-white/60">{description}</p>
    </div>
  );
}

// Example: Modal Component
export function Modal({
  isOpen,
  onClose,
  title,
  children,
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full">
        <div className="flex justify-between items-center p-6 border-b border-white/10">
          <h3 className="text-2xl font-bold text-white">{title}</h3>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white text-2xl"
          >
            ✕
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
