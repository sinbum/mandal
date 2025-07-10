import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { ArrowRight, CheckCircle } from 'lucide-react';

export default function HeroSection() {
  return (
    <section className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="pt-20 pb-16 lg:pt-32 lg:pb-24">
          <div className="lg:grid lg:grid-cols-12 lg:gap-16 items-center">
            <div className="lg:col-span-7">
              {/* Main Headline */}
              <h1 className="text-5xl lg:text-7xl font-bold text-gray-900 leading-tight mb-8">
                목표를
                <br />
                <span className="text-blue-600">현실로</span>
              </h1>

              {/* Subheadline */}
              <p className="text-xl text-gray-600 leading-relaxed mb-12 max-w-2xl">
                체계적인 만다라트 기법으로 큰 목표를 작은 단계로 나누어
                꾸준히 달성해 나가세요.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mb-16">
                <Link href="/auth/signup">
                  <Button 
                    size="lg" 
                    className="w-full sm:w-auto bg-gray-900 hover:bg-gray-800 text-white px-8 py-4 text-lg font-medium"
                  >
                    시작하기
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Link href="/auth/login">
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="w-full sm:w-auto border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-4 text-lg font-medium"
                  >
                    로그인
                  </Button>
                </Link>
              </div>

              {/* Trust Signals */}
              <div className="flex flex-wrap gap-8 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-gray-400" />
                  <span>무료 사용</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-gray-400" />
                  <span>간편 가입</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-gray-400" />
                  <span>모든 기능 제공</span>
                </div>
              </div>
            </div>

            {/* Visual Demo */}
            <div className="mt-16 lg:mt-0 lg:col-span-5">
              <div className="bg-gray-50 rounded-2xl p-8">
                <div className="text-center mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    만다라트 목표 설정
                  </h3>
                  <p className="text-sm text-gray-600">
                    하나의 목표를 8개 영역으로 세분화
                  </p>
                </div>
              
                <div className="grid grid-cols-3 gap-3 mb-8">
                  {[
                    { text: '기술 역량', color: 'bg-white border-gray-200' },
                    { text: '네트워킹', color: 'bg-white border-gray-200' },
                    { text: '포트폴리오', color: 'bg-white border-gray-200' },
                    { text: '면접 준비', color: 'bg-white border-gray-200' },
                    { text: '취업 성공', color: 'bg-blue-600 text-white border-blue-600' },
                    { text: '자격증', color: 'bg-white border-gray-200' },
                    { text: '프로젝트', color: 'bg-white border-gray-200' },
                    { text: '어학 능력', color: 'bg-white border-gray-200' },
                    { text: '이력서', color: 'bg-white border-gray-200' }
                  ].map((item, i) => (
                    <div
                      key={i}
                      className={`
                        aspect-square rounded-lg border-2 flex items-center justify-center text-xs font-medium
                        ${item.color}
                        transition-all duration-200 hover:shadow-sm
                      `}
                    >
                      <span className="text-center px-2">{item.text}</span>
                    </div>
                  ))}
                </div>
                
                <div className="text-center">
                  <div className="text-sm text-gray-600">
                    체계적인 목표 달성
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}