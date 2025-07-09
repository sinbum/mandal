import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { APP_CONFIG } from '@/constants/app';
import { ChevronRight, Target, Grid3X3, Users, Trophy, ArrowRight, Check } from 'lucide-react';

export default function LandingPage() {

  const features = [
    {
      icon: <Target className="w-8 h-8 text-blue-600" />,
      title: "목표 세분화",
      description: "큰 목표를 8개의 구체적인 하위 목표로 나누어 단계별로 달성하세요"
    },
    {
      icon: <Grid3X3 className="w-8 h-8 text-green-600" />,
      title: "체계적 관리",
      description: "3x3 만다라트 매트릭스로 목표를 시각화하고 체계적으로 관리하세요"
    },
    {
      icon: <Users className="w-8 h-8 text-purple-600" />,
      title: "협업 기능",
      description: "팀원들과 목표를 공유하고 함께 달성해 나가세요"
    },
    {
      icon: <Trophy className="w-8 h-8 text-yellow-600" />,
      title: "성취 추적",
      description: "목표 달성률을 실시간으로 확인하고 성취감을 느끼세요"
    }
  ];

  const benefits = [
    "명확한 목표 설정과 계획 수립",
    "단계별 실행으로 부담 감소",
    "시각적 진행상황 파악",
    "동기부여 및 지속성 향상",
    "체계적인 목표 관리 습관 형성"
  ];


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
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

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-12 lg:gap-8 items-center">
            <div className="lg:col-span-6">
              <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight">
                목표를 
                <span className="text-blue-600"> 체계적으로</span>
                <br />
                관리하는 가장 
                <span className="text-purple-600">스마트한</span> 방법
              </h1>
              
              <p className="mt-6 text-xl text-gray-600 leading-relaxed">
                만다라트 기법을 활용해 큰 목표를 작은 단위로 나누고, 
                단계별로 달성해나가며 성공의 경험을 쌓아보세요.
              </p>
              
              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <Link href="/auth/signup">
                  <Button size="lg" className="w-full sm:w-auto">
                    무료로 시작하기
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Link href="/auth/login">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto">
                    로그인
                  </Button>
                </Link>
              </div>
              
              <div className="mt-8 flex items-center space-x-6 text-sm text-gray-500">
                <div className="flex items-center">
                  <Check className="w-4 h-4 text-green-500 mr-2" />
                  무료 사용
                </div>
                <div className="flex items-center">
                  <Check className="w-4 h-4 text-green-500 mr-2" />
                  계정 생성 간편
                </div>
                <div className="flex items-center">
                  <Check className="w-4 h-4 text-green-500 mr-2" />
                  언제든 접근
                </div>
              </div>
            </div>
            
            <div className="mt-12 lg:mt-0 lg:col-span-6">
              <div className="relative">
                <div className="bg-white rounded-2xl shadow-2xl p-8 mx-auto max-w-md">
                  <div className="grid grid-cols-3 gap-3">
                    {Array.from({ length: 9 }, (_, i) => (
                      <div
                        key={i}
                        className={`
                          aspect-square rounded-lg flex items-center justify-center text-sm font-medium
                          ${i === 4 
                            ? 'bg-blue-600 text-white' 
                            : i % 2 === 0 
                            ? 'bg-blue-50 text-blue-700' 
                            : 'bg-gray-50 text-gray-600'
                          }
                        `}
                      >
                        {i === 4 ? '목표' : `세부${i + 1}`}
                      </div>
                    ))}
                  </div>
                  <p className="text-center text-gray-600 text-sm mt-4">
                    3x3 만다라트 매트릭스 예시
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              왜 만다라트 플래너를 선택해야 할까요?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              과학적으로 검증된 만다라트 기법을 디지털로 구현하여 
              더욱 효과적인 목표 관리 경험을 제공합니다.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center group">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-50 group-hover:bg-gray-100 transition-colors mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-center">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
                만다라트로 얻을 수 있는 
                <br />5가지 핵심 효과
              </h2>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center text-white">
                    <Check className="w-6 h-6 text-green-300 mr-3 flex-shrink-0" />
                    <span className="text-lg">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="mt-12 lg:mt-0">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 text-white">
                <h3 className="text-2xl font-bold mb-4">지금 시작해보세요!</h3>
                <p className="text-lg mb-6 text-white/90">
                  수많은 사용자들이 만다라트 플래너로 목표를 달성하고 있습니다.
                </p>
                <div className="space-y-3 text-white/80">
                  <div>✨ 회원가입 후 바로 사용 가능</div>
                  <div>🎯 개인 맞춤형 목표 설정</div>
                  <div>📱 모바일과 데스크톱 모두 지원</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-900">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
            오늘부터 체계적인 목표 관리를 시작하세요
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            만다라트 플래너와 함께 꿈을 현실로 만들어보세요. 
            지금 시작하면 더 나은 내일을 만날 수 있습니다.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signup">
              <Button size="lg" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700">
                무료로 시작하기
                <ChevronRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button variant="outline" size="lg" className="w-full sm:w-auto text-white border-white hover:bg-white hover:text-gray-900">
                기존 계정으로 로그인
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-950 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Image 
                src={APP_CONFIG.logo} 
                alt={APP_CONFIG.name} 
                width={24} 
                height={24} 
                className="rounded"
              />
              <span className="text-lg font-semibold text-white">{APP_CONFIG.name}</span>
            </div>
            
            <div className="text-gray-400 text-sm">
              © 2024 {APP_CONFIG.name}. All rights reserved.
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-500 text-sm">
            {APP_CONFIG.description}
          </div>
        </div>
      </footer>
    </div>
  );
}