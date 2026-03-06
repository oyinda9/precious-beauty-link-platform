'use client'
import { Geist, Geist_Mono } from "next/font/google";

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });


import * as React from "react";
import { Analytics } from "@vercel/analytics/next";
import { ThemeProvider } from "./theme-provider";
import ThemeToggle from "./theme-toggle";
import { Toaster } from "./ui/toaster";

export default function ClientWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={true}>
      <div
        className={`${_geist.className} ${_geistMono.className} font-sans antialiased`}
      >
        {children}
        <ThemeToggle />
        <Toaster />
        <Analytics />
      </div>
    </ThemeProvider>
  );
}
