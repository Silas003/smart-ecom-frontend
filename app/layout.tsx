import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "../components/ui/toaster";
import type { ReactNode } from "react";
import ClientShell from "./shell-client";
import CartBootstrap from "../components/layout/CartBootstrap";
import AuthProvider from "@/components/AuthProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ecommerce Storefront",
  description: "Modern ecommerce storefront built with Next.js and Tailwind CSS",
};

// app/layout.tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" suppressHydrationWarning>
        <body>
        <ToastProvider>
            <AuthProvider>
                <CartBootstrap />  {/* now runs after auth is hydrated */}
                <ClientShell>{children}</ClientShell>
            </AuthProvider>
        </ToastProvider>
        </body>
</html>
);
}
