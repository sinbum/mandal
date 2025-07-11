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
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
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
      <body className={inter.className}>
        <Toaster />
        <div className="min-h-screen bg-white">
          {children}
        </div>
      </body>
    </html>
  );
}