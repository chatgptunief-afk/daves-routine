import type { Metadata, Viewport } from 'next';
import { Inter, Space_Grotesk } from 'next/font/google';
import './globals.css';
import { Navigation } from '@/components/Navigation';
import { ServiceWorkerRegistration } from '@/components/ServiceWorkerRegistration';
import { PageTransition } from '@/components/PageTransition';

import ClientMotionProvider from '@/components/ClientMotionProvider';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-space-grotesk', weight: ['500', '600', '700'] });

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
  themeColor: '#0c0b10',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl" className="dark">
      <body className={`${inter.variable} ${spaceGrotesk.variable} font-sans bg-bg text-text min-h-screen antialiased`}>
        <ClientMotionProvider>
          <main className="relative z-10 max-w-lg mx-auto px-4 pt-6 pb-28 min-h-screen">
            <PageTransition>{children}</PageTransition>
          </main>
        </ClientMotionProvider>
        <ServiceWorkerRegistration />
        <Navigation />
      </body>
    </html>
  );
}
