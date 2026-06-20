'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useInView } from 'framer-motion';
import { ArrowDown } from 'lucide-react';
import dynamic from 'next/dynamic';

// All components use ssr: false because stellar-wallets-kit accesses window at module init time
// WalletConnection wraps stellar.connectWallet() → kit.getAddress() and stellar.disconnect()
const WalletConnection = dynamic(() => import('@/components/WalletConnection'), { ssr: false });
const BalanceDisplay = dynamic(() => import('@/components/BalanceDisplay'), { ssr: false });
const PaymentForm = dynamic(() => import('@/components/PaymentForm'), { ssr: false });
const TransactionHistory = dynamic(() => import('@/components/TransactionHistory'), { ssr: false });
const BalanceChart = dynamic(() => import('@/components/BalanceChart'), { ssr: false });
const AddressBook = dynamic(() => import('@/components/AddressBook'), { ssr: false });

import { stellar } from '@/lib/stellar-helper';
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster as Sonner } from "@/components/ui/sonner";

function RevealText({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 60 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.9, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function AnalyticsContainer({ publicKey, refreshKey }: { publicKey: string; refreshKey: number }) {
  const [data, setData] = useState<{ balance: string; txs: any[] } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!publicKey) return;
      try {
        setLoading(true);
        const [balanceData, txs] = await Promise.all([
          stellar.getBalance(publicKey),
          stellar.getRecentTransactions(publicKey, 20),
        ]);
        setData({ balance: balanceData.xlm, txs });
      } catch (e) {
        console.error('Failed to fetch analytics data', e);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [publicKey, refreshKey]);

  if (loading) return <div className="card-dark min-h-[320px] animate-pulse bg-muted/10 border-dashed" />;
  if (!data) return null;

  return <BalanceChart currentBalance={data.balance} transactions={data.txs} publicKey={publicKey} />;
}

function Marquee() {
  return (
    <div className="overflow-hidden border-y border-border py-6 my-24 bg-muted/5">
      <motion.div
        animate={{ x: [0, -1920] }}
        transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
        className="flex gap-20 whitespace-nowrap"
      >
        {Array.from({ length: 12 }).map((_, i) => (
          <span key={i} className="font-mono text-[10px] text-muted-foreground/60 tracking-[0.4em] uppercase">
            Stellar Network · Protocol 20 · Smart Contracts · Decentralized · Instant Settlement · Global Assets
          </span>
        ))}
      </motion.div>
    </div>
  );
}

export default function Home() {
  const [publicKey, setPublicKey] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [currentTime, setCurrentTime] = useState('');
  const heroRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });

  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.8], [1, 0.95]);
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 100]);

  useEffect(() => {
    const update = () => {
      setCurrentTime(new Date().toLocaleTimeString('en-US', {
        hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
      }));
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  /**
   * Called by WalletConnection after stellar.connectWallet() resolves.
   * stellar.connectWallet() internally calls kit.getAddress() to retrieve
   * the Freighter/xBull/Albedo wallet's public key on Stellar Testnet.
   */
  const handleConnect = (address: string) => {
    setPublicKey(address);
    setIsConnected(true);
  };

  /**
   * Disconnects the wallet by calling stellar.disconnect(), which clears
   * the stored public key from the StellarHelper instance.
   */
  const handleDisconnect = () => {
    stellar.disconnect();
    setPublicKey('');
    setIsConnected(false);
  };

  /**
   * Triggered after a successful XLM payment via stellar.sendPayment().
   * stellar.sendPayment() builds the transaction and signs it with
   * kit.signTransaction() before submitting to Stellar Testnet.
   */
  const handlePaymentSuccess = () => setRefreshKey((k) => k + 1);

  return (
    <TooltipProvider>
      <Sonner />
      <div className="min-h-screen bg-background selection:bg-primary/10 selection:text-primary">
        {/* Editorial fixed header */}
        <header className="fixed top-0 left-0 right-0 z-50 mix-blend-difference">
          <div className="flex items-center justify-between px-8 md:px-16 py-8">
            <span className="font-mono text-[10px] text-white tracking-[0.3em] uppercase font-bold">
              Terminal.System
            </span>
            <span className="font-mono text-[10px] text-white/40 tracking-widest uppercase tabular-nums" suppressHydrationWarning>
              {currentTime} UTC
            </span>
            <span className="font-mono text-[10px] text-white tracking-[0.3em] uppercase">
              Stellar // Testnet
            </span>
          </div>
        </header>

        <AnimatePresence mode="wait">
          {!isConnected ? (
            <motion.div
              key="landing"
              exit={{ opacity: 0, transition: { duration: 0.6 } }}
            >
              {/* HERO SECTION */}
              <motion.section
                ref={heroRef}
                style={{ opacity: heroOpacity, scale: heroScale, y: heroY }}
                className="relative h-screen flex flex-col justify-end pb-20 md:pb-32 px-8 md:px-16"
              >
                {/* Asymmetric background grid */}
                <div className="absolute inset-0 opacity-[0.04] pointer-events-none" style={{
                  backgroundImage: 'linear-gradient(hsl(var(--foreground)/0.2) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)/0.2) 1px, transparent 1px)',
                  backgroundSize: '80px 80px'
                }} />

                {/* Ambient accent orb */}
                <div className="absolute top-1/4 right-[10%] w-[400px] h-[400px] md:w-[600px] md:h-[600px] rounded-full opacity-[0.05] blur-[120px] pointer-events-none"
                  style={{ background: 'radial-gradient(circle, hsl(var(--primary)), transparent)' }}
                />

                <div className="relative z-10 max-w-7xl">
                  <motion.div
                    initial={{ opacity: 0, y: 100 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1.4, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <h1 className="font-display text-[clamp(3.5rem,14vw,11rem)] leading-[0.8] text-foreground tracking-tighter italic">
                      Lighthouse
                      <br />
                      <span className="text-gradient-accent">Stellar</span>
                      <br />
                      Terminal
                    </h1>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1, delay: 1.2 }}
                    className="flex flex-col md:flex-row items-start md:items-end justify-between mt-12 md:mt-20 gap-8"
                  >
                    <p className="font-body text-sm md:text-base text-muted-foreground max-w-md leading-relaxed">
                      A high-precision interface for managing digital assets, authorizing global payments, and auditing the Stellar ledger.
                    </p>
                    <motion.div
                      animate={{ y: [0, 10, 0] }}
                      transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                      className="hidden md:block"
                    >
                      <ArrowDown className="w-6 h-6 text-muted-foreground/30" />
                    </motion.div>
                  </motion.div>
                </div>

                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 1.8, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute bottom-0 left-0 right-0 h-px bg-border origin-left"
                />
              </motion.section>

              {/* PHILOSOPHY SECTION */}
              <section className="px-8 md:px-16 py-32 md:py-56 bg-muted/5">
                <div className="max-w-7xl mx-auto">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-24">
                    <div className="md:col-span-4">
                      <RevealText>
                        <span className="font-mono text-[10px] text-primary tracking-[0.4em] uppercase font-bold">
                          01 — Vision
                        </span>
                      </RevealText>
                    </div>
                    <div className="md:col-span-8">
                      <RevealText delay={0.1}>
                        <h2 className="font-display text-4xl md:text-6xl lg:text-7xl text-foreground italic leading-[1] text-balance">
                          Decentralized architecture. 
                          <br />
                          Architectural precision.
                        </h2>
                      </RevealText>
                      <RevealText delay={0.2}>
                        <p className="font-body text-lg text-muted-foreground mt-12 max-w-2xl leading-relaxed">
                          The "Lighthouse" interface is designed to strip away the noise of modern finance. 
                          We provide a sterile, high-performance command module for individual and institutional asset management on the Stellar network.
                        </p>
                      </RevealText>
                    </div>
                  </div>
                </div>
              </section>

              {/* FEATURES */}
              <section className="px-8 md:px-16 py-32">
                <div className="max-w-7xl mx-auto">
                  <RevealText>
                    <span className="font-mono text-[10px] text-primary tracking-[0.4em] uppercase font-bold block mb-20 text-center md:text-left">
                      02 — Modules
                    </span>
                  </RevealText>

                  <div className="space-y-1">
                    {[
                      { num: '01', title: 'Identity Uplink', desc: 'Secure connection via Freighter & xBull hardware modules with encrypted session tokens.' },
                      { num: '02', title: 'Asset Monitoring', desc: 'Sub-ledger monitoring for XLM, USDC, and every verified anchor asset in real-time.' },
                      { num: '03', title: 'Ledger Broadcast', desc: 'Low-latency payload transmission. Settle global payments in ≤ 5 seconds.' },
                      { num: '04', title: 'Audit Registry', desc: 'Cryptographic history search. Direct deep-links to network node explorers.' },
                    ].map((item, i) => (
                      <RevealText key={item.num} delay={i * 0.1}>
                        <div className="group flex items-start gap-8 md:gap-16 py-12 border-t border-border/50 cursor-default hover:bg-muted/30 transition-all duration-700 px-6 -mx-6">
                          <span className="font-mono text-xs text-muted-foreground/40 mt-1 flex-shrink-0 group-hover:text-primary transition-colors">
                            {item.num}
                          </span>
                          <div className="flex-1 flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <h3 className="font-display text-3xl md:text-5xl text-foreground italic group-hover:translate-x-4 transition-transform duration-700 select-none">
                              {item.title}
                            </h3>
                            <p className="font-body text-sm text-muted-foreground max-w-xs md:text-right leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                              {item.desc}
                            </p>
                          </div>
                        </div>
                      </RevealText>
                    ))}
                  </div>
                </div>
              </section>

              <Marquee />

              {/* CONNECT CTA */}
              <section className="px-8 md:px-16 py-32 md:py-56 bg-gradient-to-b from-transparent to-muted/10">
                <div className="max-w-4xl mx-auto">
                  <RevealText className="text-center md:text-left">
                    <span className="font-mono text-[10px] text-primary tracking-[0.4em] uppercase font-bold block mb-12">
                      03 — Access
                    </span>
                  </RevealText>
                  <WalletConnection onConnect={handleConnect} onDisconnect={handleDisconnect} />
                </div>
              </section>

              <footer className="border-t border-border px-8 md:px-16 py-12">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 text-muted-foreground">
                  <span className="font-mono text-[9px] tracking-[0.3em] uppercase opacity-50">
                    Stellar / Testnet Env // Simulator mode active
                  </span>
                  <div className="flex gap-12">
                    <a href="https://stellar.org" target="_blank" rel="noopener noreferrer" className="font-mono text-[9px] tracking-[0.3em] uppercase hover:text-primary transition-colors">
                      Stellar.org
                    </a>
                    <a href="https://github.com/jorgesoares2997/stellar-frontend-challenge" target="_blank" rel="noopener noreferrer" className="font-mono text-[9px] tracking-[0.3em] uppercase hover:text-primary transition-colors">
                      Source.Audit
                    </a>
                  </div>
                </div>
              </footer>
            </motion.div>
          ) : (
            /* ==================== DASHBOARD ==================== */
            <motion.div
              key="dashboard"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
              className="pt-32 pb-24"
            >
              <div className="px-8 md:px-16 max-w-7xl mx-auto">
                <div className="mb-16">
                  <WalletConnection onConnect={handleConnect} onDisconnect={handleDisconnect} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
                  <div className="lg:col-span-4">
                    <BalanceDisplay publicKey={publicKey} key={`bal-${refreshKey}`} />
                  </div>
                  <div className="lg:col-span-8">
                    <AnalyticsContainer publicKey={publicKey} refreshKey={refreshKey} />
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                  <PaymentForm publicKey={publicKey} onSuccess={handlePaymentSuccess} />
                  <AddressBook />
                </div>

                <TransactionHistory publicKey={publicKey} key={`txs-${refreshKey}`} />
              </div>

              <footer className="border-t border-border mt-32 px-8 md:px-16 py-12 bg-muted/5">
                <div className="max-w-7xl mx-auto flex items-center justify-between text-muted-foreground/40">
                  <span className="font-mono text-[9px] tracking-[0.2em] uppercase">
                    Security Policy: LocalStorage.Cache
                  </span>
                  <span className="font-mono text-[9px] tracking-[0.2em] uppercase">
                    Stellar Testnet Node
                  </span>
                </div>
              </footer>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </TooltipProvider>
  );
}
