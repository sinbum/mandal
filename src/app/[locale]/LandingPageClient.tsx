'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { APP_CONFIG } from '@/constants/app';
import HeroSection from '@/components/landing/HeroSection';
import FeaturesSection from '@/components/landing/FeaturesSection';
import TestimonialsSection from '@/components/landing/TestimonialsSection';
import CTASection from '@/components/landing/CTASection';
import Footer from '@/components/landing/Footer';
import { createClient } from '@/utils/supabase/client';
import { User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

interface LandingPageClientProps {
  locale: string;
  translations: {
    dashboard: string;
    logout: string;
    loginTitle: string;
    signupTitle: string;
  };
}

export default function LandingPageClient({ locale, translations }: LandingPageClientProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isHydrated, setIsHydrated] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  // 하이드레이션 완료 추적
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // 사용자 정보 로드
  useEffect(() => {
    if (!isHydrated) return;

    async function loadUser() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
      } catch (error) {
        console.error('사용자 정보 로드 오류:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadUser();

    // 인증 상태 변경 구독
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, isHydrated]);

  // 로그아웃 처리
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      router.push(`/${locale}`);
    } catch (error) {
      console.error('로그아웃 오류:', error);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Image 
                src={APP_CONFIG.logo} 
                alt={APP_CONFIG.name} 
                width={32} 
                height={32} 
                className="rounded"
              />
              <span className="text-xl font-bold text-gray-900">{APP_CONFIG.shortName}</span>
            </div>
            
            <div className="flex items-center space-x-4">
              {!isHydrated || isLoading ? (
                <div className="w-16 h-8 bg-gray-200 animate-pulse rounded"></div>
              ) : user ? (
                <>
                  <Link href={`/${locale}/app`}>
                    <Button variant="outline" size="sm">{translations.dashboard}</Button>
                  </Link>
                  <Button onClick={handleLogout} variant="secondary" size="sm">{translations.logout}</Button>
                </>
              ) : (
                <>
                  <Link href={`/${locale}/auth/login`}>
                    <Button variant="outline" size="sm">{translations.loginTitle}</Button>
                  </Link>
                  <Link href={`/${locale}/auth/signup`}>
                    <Button size="sm">{translations.signupTitle}</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      <HeroSection />
      <FeaturesSection />
      <TestimonialsSection />
      <CTASection />
      <Footer />
    </div>
  );
}