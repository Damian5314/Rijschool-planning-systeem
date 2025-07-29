"use client"
import { ThemeProvider as NextThemesProvider, type ThemeProviderProps } from "next-themes"

// This file is intentionally left empty as dark mode functionality has been removed.
// It remains here to prevent import errors if other components still reference it.
// You can safely delete this file if no other components depend on it.

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
