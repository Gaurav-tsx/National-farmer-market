import type { Metadata, Viewport } from "next";
import "./globals.css";
import { LanguageProvider } from "@/lib/i18n/context";
import { AdminSessionProvider } from "@/lib/admin-session-context";

export const metadata: Metadata = {
  title: "NAM-Core | National Agricultural Marketplace of India",
  description:
    "Direct Kisan-to-Buyer National Agricultural Marketplace with sub-50ms APMC spot pricing, DigiLocker verified identity, and granular RBAC admin control.",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  themeColor: "#15803d",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="NAM-Core" />
      </head>
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased flex flex-col">
        <LanguageProvider>
          <AdminSessionProvider>
            {children}
          </AdminSessionProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
