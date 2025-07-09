import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { ArrowRight, CheckCircle, Star } from 'lucide-react';

export default function HeroSection() {
  return (
    <section className="relative bg-white">
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-50 rounded-full blur-3xl opacity-70"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-50 rounded-full blur-3xl opacity-70"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-20 lg:py-32">
          <div className="lg:grid lg:grid-cols-12 lg:gap-8 items-center">
            <div className="lg:col-span-7">
              {/* Social Proof */}
              <div className="flex items-center gap-2 mb-6">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <span className="text-sm text-gray-600">1,000+ 사용자의 선택</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
                꿈을 현실로 만드는
                <br />
                <span className="text-blue-600">과학적 목표달성</span>
                <br />
                시스템
              </h1>

              {/* Subheadline */}
              <p className="text-xl text-gray-600 leading-relaxed mb-8">
                일본 메이지대학교 연구진이 개발한 <strong>만다라트 기법</strong>으로
                <br />
                큰 꿈을 작은 단계로 나누어 확실하게 달성하세요.
              </p>

              {/* Key Benefits */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700">목표 달성률 <strong>300% 향상</strong></span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700">실행 가능한 <strong>구체적 계획</strong></span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700">지속 가능한 <strong>습관 형성</strong></span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700">명확한 <strong>진행상황 추적</strong></span>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Link href="/auth/signup">
                  <Button 
                    size="lg" 
                    className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
                  >
                    지금 무료로 시작하기
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Link href="/auth/login">
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="w-full sm:w-auto border-2 border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-4 text-lg font-semibold"
                  >
                    로그인
                  </Button>
                </Link>
              </div>

              {/* Trust Signals */}
              <div className="flex items-center gap-6 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>신용카드 불필요</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>30초 가입</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>언제든 해지</span>
                </div>
              </div>
            </div>

            {/* Visual Demo */}
            <div className="mt-16 lg:mt-0 lg:col-span-5">
              <div className="relative">
                {/* Main Grid */}
                <div className="bg-white rounded-2xl shadow-2xl p-8 mx-auto max-w-md border border-gray-100">
                  <div className="text-center mb-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">만다라트 매트릭스</h3>
                    <p className="text-sm text-gray-600">하나의 목표를 8개의 실행 가능한 단계로</p>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { text: '실행계획1', color: 'bg-blue-50 text-blue-700' },
                      { text: '실행계획2', color: 'bg-green-50 text-green-700' },
                      { text: '실행계획3', color: 'bg-purple-50 text-purple-700' },
                      { text: '실행계획4', color: 'bg-pink-50 text-pink-700' },
                      { text: '핵심목표', color: 'bg-blue-600 text-white', isCenter: true },
                      { text: '실행계획5', color: 'bg-orange-50 text-orange-700' },
                      { text: '실행계획6', color: 'bg-teal-50 text-teal-700' },
                      { text: '실행계획7', color: 'bg-indigo-50 text-indigo-700' },
                      { text: '실행계획8', color: 'bg-red-50 text-red-700' }
                    ].map((item, i) => (
                      <div
                        key={i}
                        className={`
                          aspect-square rounded-lg flex items-center justify-center text-xs font-medium
                          ${item.color}
                          ${item.isCenter ? 'ring-4 ring-blue-200' : ''}
                          transition-all duration-300 hover:scale-105 hover:shadow-md
                        `}
                      >
                        {item.text}
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-6 text-center">
                    <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm">
                      <CheckCircle className="w-4 h-4" />
                      <span>달성률 진행 중</span>
                    </div>
                  </div>
                </div>

                {/* Floating Elements */}
                <div className="absolute -top-4 -right-4 bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium shadow-lg">
                  ✨ 실시간 진행률
                </div>
                <div className="absolute -bottom-4 -left-4 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium shadow-lg">
                  🎯 목표 달성 중
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}