'use client';

import * as React from 'react';
import { useTheme } from 'next-themes';
import { Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * 🎓 MASTERCLASS: The ThemeToggle
 * 
 * 1. AnimatePresence: Allows components to animate when they are removed 
 *    from the React tree. Perfect for switching icons.
 * 
 * 2. Mounting Check: We only render the icons after the component is 
 *    'mounted'. This is a standard pattern for dark mode to avoid 
 *    hydration mismatches (server vs client state).
 */
export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  // When the component mounts on the client, set mounted to true
  React.useEffect(() => {
    setMounted(true);
  }, []);

  // While waiting to mount, return a placeholder to avoid layout shift
  if (!mounted) return <div className="p-2 w-9 h-9" />;

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="relative p-2 rounded-xl bg-secondary/50 hover:bg-secondary border border-primary/20 transition-all focus:outline-none focus:ring-2 focus:ring-primary shadow-sm group"
      aria-label="Toggle theme"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={theme}
          initial={{ y: -10, opacity: 0, scale: 0.5 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 10, opacity: 0, scale: 0.5 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="text-primary group-hover:scale-110 transition-transform"
        >
          {theme === 'dark' ? <Moon size={18} /> : <Sun size={18} />}
        </motion.div>
      </AnimatePresence>
    </button>
  );
}
