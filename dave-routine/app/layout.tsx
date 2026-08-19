import type { Metadata, Viewport } from 'next';
import { Inter, Newsreader } from 'next/font/google';
import './globals.css';
import { TabBar } from '@/components/TabBar';
import { Atmosphere } from '@/components/Atmosphere';
import { ServiceWorkerRegistration } from '@/components/ServiceWorkerRegistration';
import { PageTransition } from '@/components/PageTransition';
import { AppStateProvider } from '@/components/AppStateProvider';

import ClientMotionProvider from '@/components/ClientMotionProvider';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const newsreader = Newsreader({
  subsets: ['latin'],
  variable: '--font-newsreader',
  weight: ['300', '400', '500'],
  style: ['normal', 'italic'],
});

export const metadata: Metadata = {
  title: "Dave's Routine",
  description: 'Van Fajr tot Isha. Eén steen per dag.',
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

// GEEN maximumScale / userScalable: false — dat was een directe WCAG 1.4.4-fout (D8).
export const viewport: Viewport = {
  themeColor: '#0A0A0F',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl" className="dark">
      <body className={`${inter.variable} ${newsreader.variable} font-sans bg-ink-850 text-paper min-h-screen antialiased`}>
        <ClientMotionProvider>
          <AppStateProvider>
            <Atmosphere />
            <main className="relative z-10 max-w-[430px] mx-auto px-5 pt-6 pb-28 min-h-screen">
              <PageTransition>{children}</PageTransition>
            </main>
            <TabBar />
          </AppStateProvider>
        </ClientMotionProvider>
        <ServiceWorkerRegistration />
      </body>
    </html>
  );
}
