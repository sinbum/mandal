import React from 'react';
import { getTranslations } from 'next-intl/server';
import LandingPageClient from './LandingPageClient';

interface LandingPageProps {
  params: Promise<{ locale: string }>;
}

export default async function LandingPage({ params }: LandingPageProps) {
  const { locale } = await params;
  
  // 서버에서 번역 텍스트 미리 로드
  const t = await getTranslations({ locale, namespace: 'navigation' });
  const tAuth = await getTranslations({ locale, namespace: 'auth' });
  
  // 번역된 텍스트를 클라이언트 컴포넌트에 전달
  const translations = {
    dashboard: t('dashboard'),
    logout: t('logout'),
    loginTitle: tAuth('login.title'),
    signupTitle: tAuth('signup.title'),
  };

  return <LandingPageClient locale={locale} translations={translations} />;
}