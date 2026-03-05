// components/theme-provider-wrapper.tsx (Client Component)
'use client'

import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import ThemeToggle from "@/components/theme-toggle";

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export default function ThemeProviderWrapper({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={true}>
      <div className={`${_geist.className} ${_geistMono.className} font-sans antialiased`}>
        {children}
        <ThemeToggle />
        <Toaster />
      </div>
    </ThemeProvider>
  );
}