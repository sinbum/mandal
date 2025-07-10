import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { ArrowRight, CheckCircle } from 'lucide-react';

export default function CTASection() {
  return (
    <section className="py-24 bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Main CTA */}
          <div className="mb-12">
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
              지금 시작하세요
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              체계적인 목표 관리로 꿈을 현실로 만들어보세요.
              무료로 시작할 수 있습니다.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link href="/auth/signup">
              <Button 
                size="lg" 
                className="w-full sm:w-auto bg-white hover:bg-gray-100 text-gray-900 px-8 py-4 text-lg font-medium"
              >
                무료로 시작하기
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button 
                variant="outline" 
                size="lg" 
                className="w-full sm:w-auto border-gray-600 text-gray-300 hover:bg-gray-800 hover:border-gray-500 px-8 py-4 text-lg font-medium"
              >
                로그인
              </Button>
            </Link>
          </div>

          {/* Value Proposition */}
          <div className="bg-gray-800 rounded-xl p-8 max-w-4xl mx-auto">
            <h3 className="text-xl font-semibold text-white mb-6">
              무료로 모든 기능을 사용하세요
            </h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <CheckCircle className="w-6 h-6 text-gray-400 mx-auto mb-3" />
                <h4 className="font-medium text-white mb-2">무료 계정</h4>
                <p className="text-sm text-gray-400">신용카드 없이 바로 시작</p>
              </div>
              <div className="text-center">
                <CheckCircle className="w-6 h-6 text-gray-400 mx-auto mb-3" />
                <h4 className="font-medium text-white mb-2">모든 기능</h4>
                <p className="text-sm text-gray-400">제한 없이 모든 기능 사용</p>
              </div>
              <div className="text-center">
                <CheckCircle className="w-6 h-6 text-gray-400 mx-auto mb-3" />
                <h4 className="font-medium text-white mb-2">언제든 해지</h4>
                <p className="text-sm text-gray-400">부담 없이 언제든 중단</p>
              </div>
            </div>
          </div>

          {/* Social Proof */}
          <div className="mt-12 text-center">
            <p className="text-gray-400 text-sm mb-4">1,000명 이상의 사용자가 목표를 달성하고 있습니다</p>
            <div className="flex justify-center items-center gap-6 text-gray-300">
              <div className="text-sm">
                <span className="font-medium">목표 달성률</span>
                <br />
                <span className="text-gray-400">92%</span>
              </div>
              <div className="text-sm">
                <span className="font-medium">활성 사용자</span>
                <br />
                <span className="text-gray-400">1,000+</span>
              </div>
              <div className="text-sm">
                <span className="font-medium">만족도</span>
                <br />
                <span className="text-gray-400">4.9/5</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}