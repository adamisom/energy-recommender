import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth/context";
import { UserMenu } from "@/components/auth/user-menu";
import Link from "next/link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Energy Plan Recommender - Find Your Perfect Energy Plan",
  description: "Get AI-powered energy plan recommendations based on your usage patterns and preferences",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          {/* Global Header */}
          <header className="border-b bg-white">
            <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
              <Link href="/" className="text-xl font-bold text-slate-900">
                ⚡ Energy Recommender
              </Link>
              <UserMenu />
            </div>
          </header>
          
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
