import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import { StoreProvider } from "@/lib/store";
import { AppShell } from "@/components/layout/app-shell";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "CaterOS — Catering Operations Platform",
  description:
    "One Event Record. Every document generated automatically — quotation, contract, event order and operations checklist.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans antialiased">
        <StoreProvider>
          <AppShell>{children}</AppShell>
          <Toaster position="bottom-right" richColors />
        </StoreProvider>
      </body>
    </html>
  );
}
