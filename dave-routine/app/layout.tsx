import type { Metadata, Viewport } from 'next';
import { Inter, Newsreader } from 'next/font/google';
import './globals.css';
import { TabBar } from '@/components/TabBar';
import { Atmosphere } from '@/components/Atmosphere';
import { ServiceWorkerRegistration } from '@/components/ServiceWorkerRegistration';
import { PageTransition } from '@/components/PageTransition';
import { AppStateProvider } from '@/components/AppStateProvider';
import { NotificationScheduler } from '@/components/NotificationScheduler';
import { NotificationPrompt } from '@/components/ui/NotificationPrompt';
import { LaunchIntro } from '@/components/LaunchIntro';

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
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icons/icon-192.png', type: 'image/png', sizes: '192x192' },
    ],
    apple: '/apple-touch-icon.png',
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
          <LaunchIntro />
          <AppStateProvider>
            <Atmosphere />
            <main className="relative z-10 max-w-[430px] mx-auto px-5 pt-safe pb-28 min-h-screen">
              <PageTransition>{children}</PageTransition>
            </main>
            <TabBar />
            <NotificationScheduler />
            <NotificationPrompt />
          </AppStateProvider>
        </ClientMotionProvider>
        <ServiceWorkerRegistration />
      </body>
    </html>
  );
}
