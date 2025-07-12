import React from 'react';
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import '@/app/globals.css';
import { Toaster } from '@/components/ui/sonner';
import { APP_CONFIG } from '@/constants/app';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: {
    default: APP_CONFIG.name,
    template: `%s | ${APP_CONFIG.name}`
  },
  description: APP_CONFIG.description,
  keywords: ['만다라트', '목표관리', '플래너', '생산성', '체계적관리', 'mandalart', 'goal', 'planning'],
  authors: [{ name: 'Mandalart Team' }],
  creator: 'Mandalart Team',
  publisher: 'Mandalart',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://mandalart.app',
    title: APP_CONFIG.name,
    description: APP_CONFIG.description,
    siteName: APP_CONFIG.name,
    images: [
      {
        url: APP_CONFIG.logo,
        width: 192,
        height: 192,
        alt: APP_CONFIG.name,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: APP_CONFIG.name,
    description: APP_CONFIG.description,
    images: [APP_CONFIG.logo],
  },
  manifest: '/manifest.json',
  icons: {
    icon: '/logo/favicon-32x32.png',
    shortcut: '/logo/favicon-16x16.png',
    apple: [
      { url: '/logo/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <head>
        {/* 삼성 인터넷 브라우저 호환성 스크립트 */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // 삼성 인터넷 브라우저 감지 및 폴리필
              if (/SamsungBrowser/i.test(navigator.userAgent)) {
                console.log('Samsung Internet detected, applying compatibility fixes');
                
                // Promise 폴리필 (필요시)
                if (!window.Promise.allSettled) {
                  Promise.allSettled = function(promises) {
                    return Promise.all(promises.map(p => 
                      Promise.resolve(p).then(
                        value => ({ status: 'fulfilled', value }),
                        reason => ({ status: 'rejected', reason })
                      )
                    ));
                  };
                }
                
                // setTimeout 0 폴리필 개선
                const originalSetTimeout = window.setTimeout;
                window.setTimeout = function(fn, delay, ...args) {
                  return originalSetTimeout(fn, Math.max(delay || 0, 4), ...args);
                };
              }
            `,
          }}
        />
      </head>
      <body className={inter.className}>
        <Toaster />
        <div className="min-h-screen bg-white">
          {children}
        </div>
      </body>
    </html>
  );
}