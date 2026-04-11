'use client';

import * as React from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { type ThemeProviderProps } from 'next-themes';

/**
 * 🎓 MASTERCLASS: The ThemeProvider
 * 
 * Why 'use client'?
 * React Context (which next-themes uses) only works in Client Components. 
 * Even though this wraps the whole app, only the children of this provider 
 * that are components will be managed by it.
 * 
 * suppressHydrationWarning:
 * We add this to our <html> tag in layout.tsx. Without it, Next.js might 
 * complain because the server doesn't know what theme the user has 
 * saved in their browser's local storage.
 */
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
