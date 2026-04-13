import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Navigation } from '@/components/Navigation';
import { ServiceWorkerRegistration } from '@/components/ServiceWorkerRegistration';

import ClientMotionProvider from '@/components/ClientMotionProvider';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: "Dave's Routine",
  description: 'Persoonlijke dagplanning en herstelroutine met streak systeem',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: "Dave's Routine",
  },
  icons: {
    apple: '/icons/icon-192.png',
  },
};

export const viewport: Viewport = {
  themeColor: '#0f0f1a',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl" className="dark">
      <body className={`${inter.variable} font-sans bg-[#0f0f1a] text-white min-h-screen antialiased`}>
        {/* Ambient background gradient - Hardware accelerated to prevent mobile battery drain */}
        <div className="fixed inset-0 pointer-events-none" style={{ willChange: 'transform', transform: 'translateZ(0)' }}>
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl opacity-70" />
          <div className="absolute bottom-1/3 right-0 w-80 h-80 bg-purple-600/8 rounded-full blur-3xl opacity-70" />
          <div className="absolute top-1/2 left-0 w-72 h-72 bg-indigo-600/8 rounded-full blur-3xl opacity-70" />
        </div>

        <ClientMotionProvider>
          <main className="relative z-10 max-w-lg mx-auto px-4 pt-6 pb-32 min-h-screen">
            {children}
          </main>
        </ClientMotionProvider>
        <ServiceWorkerRegistration />
        <Navigation />
      </body>
    </html>
  );
}
