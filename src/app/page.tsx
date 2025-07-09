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

export default function LandingPage() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  // 사용자 정보 로드
  useEffect(() => {
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
  }, [supabase]);

  // 로그아웃 처리
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      router.push('/');
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
              {isLoading ? (
                <div className="w-16 h-8 bg-gray-200 animate-pulse rounded"></div>
              ) : user ? (
                <>
                  <Link href="/app">
                    <Button variant="outline" size="sm">대시보드</Button>
                  </Link>
                  <Button onClick={handleLogout} variant="secondary" size="sm">로그아웃</Button>
                </>
              ) : (
                <>
                  <Link href="/auth/login">
                    <Button variant="outline" size="sm">로그인</Button>
                  </Link>
                  <Link href="/auth/signup">
                    <Button size="sm">무료 시작하기</Button>
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