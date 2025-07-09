import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { APP_CONFIG } from '@/constants/app';
import HeroSection from '@/components/landing/HeroSection';
import FeaturesSection from '@/components/landing/FeaturesSection';
import TestimonialsSection from '@/components/landing/TestimonialsSection';
import CTASection from '@/components/landing/CTASection';
import Footer from '@/components/landing/Footer';

export default function LandingPage() {
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
              <Link href="/auth/login">
                <Button variant="outline" size="sm">로그인</Button>
              </Link>
              <Link href="/auth/signup">
                <Button size="sm">무료 시작하기</Button>
              </Link>
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