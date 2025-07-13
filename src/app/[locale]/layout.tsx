import React from 'react';
import type { Metadata, Viewport } from 'next';
import { notFound } from 'next/navigation';
import '@/app/globals.css';
import { Toaster } from '@/components/ui/sonner';
import { APP_CONFIG } from '@/constants/app';
import { routing } from '@/i18n/routing';
import {NextIntlClientProvider} from 'next-intl';
import {getMessages, getTranslations} from 'next-intl/server';
import { LocaleProvider } from '@/components/providers/LocaleProvider';
import BrowserCompatibilityProvider from '@/components/providers/BrowserCompatibilityProvider';
import { getFontClassName } from '@/utils/fonts';

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

// 언어별 메타데이터 생성
export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  // 로케일 유효성 검사
  if (!routing.locales.includes(locale as never)) {
    notFound();
  }
  
  // 기본 메타데이터에 언어별 설정 추가
  const t = await getTranslations({ locale, namespace: 'metadata' });

  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
    title: {
      default: t('title'),
      template: `%s | ${t('title')}`
    },
    description: t('description'),
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
      locale: locale === 'ko' ? 'ko_KR' : locale === 'jp' ? 'ja_JP' : 'en_US',
      url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://mandalart.app'}/${locale}`,
      title: t('title'),
      description: t('description'),
      siteName: t('title'),
      images: [
        {
          url: APP_CONFIG.logo,
          width: 192,
          height: 192,
          alt: t('title'),
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: t('title'),
      description: t('description'),
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
    // 언어별 대체 URL 설정
    alternates: {
      languages: {
        ko: '/ko',
        en: '/en',
        jp: '/jp',
      },
    },
  };
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

// 정적 파라미터 생성
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params
}: LocaleLayoutProps) {
  const { locale } = await params;
  // 로케일 유효성 검사
  if (!routing.locales.includes(locale as never)) {
    notFound();
  }

  // 해당 로케일의 메시지 가져오기
  const messages = await getMessages();
  
  const fontClassName = getFontClassName(locale);

  return (
    <html lang={locale} suppressHydrationWarning={true}>
      <head></head>
      <body className={`app-body ${fontClassName}`} suppressHydrationWarning={true}>
        <NextIntlClientProvider messages={messages}>
          <LocaleProvider>
            <BrowserCompatibilityProvider />
            <Toaster position="top-center" />
            <div className="min-h-screen bg-white">
              {children}
            </div>
          </LocaleProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}