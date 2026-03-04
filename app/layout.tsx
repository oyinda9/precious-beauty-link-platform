import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import ThemeToggle from "@/components/theme-toggle";

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SalonBook- Your Ultimate Beauty Salon Booking Platform",
  description: "Precious Beauty Link Platform",
  generator: "precious-beauty-link-platform",
  icons: {
    icon: [
      {
        url: "https://chatgpt.com/s/m_69a896dfd6088191bf5e90b08028a852",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/favicon.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "https://chatgpt.com/s/m_69a896dfd6088191bf5e90b08028a852",
        type: "image/png",
      },
    ],
    apple: "https://chatgpt.com/s/m_69a896dfd6088191bf5e90b08028a852",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={true}
        >
          {children}
          <ThemeToggle />
          <Toaster />
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
