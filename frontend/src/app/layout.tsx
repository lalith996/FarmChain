import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Web3Provider } from "@/components/providers/Web3Provider";
import { ToastProvider } from "@/components/providers/ToastProvider";
import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "FarmChain - Agricultural Supply Chain on Blockchain",
  description: "Transparent and secure agricultural supply chain management powered by blockchain technology",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased flex flex-col min-h-screen`} suppressHydrationWarning>
        <Web3Provider>
          <Navigation />
          <main className="flex-grow">
            {children}
          </main>
          <Footer />
          <ToastProvider />
        </Web3Provider>
      </body>
    </html>
  );
}
