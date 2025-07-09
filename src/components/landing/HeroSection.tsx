import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { ArrowRight, CheckCircle, Star } from 'lucide-react';

export default function HeroSection() {
  return (
    <section className="hero min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-200 to-purple-200 rounded-full blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-indigo-200 to-pink-200 rounded-full blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-yellow-200 to-orange-200 rounded-full blur-3xl opacity-20 animate-pulse"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-20 lg:py-32">
          <div className="lg:grid lg:grid-cols-12 lg:gap-8 items-center">
            <div className="lg:col-span-7">
              {/* Urgency Badge */}
              <div className="badge badge-error badge-lg gap-2 mb-4 animate-bounce">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
                작년 목표 달성률 17%... 올해도 실패할 건가요?
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
                <span className="text-red-600">작심삼일</span>에서 벗어나
                <br />
                <span className="text-blue-600">목표를 현실로</span>
                <br />
                만드는 방법
              </h1>

              {/* Subheadline */}
              <p className="text-xl text-gray-600 leading-relaxed mb-8">
                <strong className="text-gray-900">오타니 쇼헤이</strong>가 실제로 사용한 만다라트 기법으로
                <br />
                <span className="bg-yellow-100 px-2 py-1 rounded">막연한 꿈을 구체적인 행동계획</span>으로 바꿔보세요.
              </p>

              {/* Key Benefits */}
              <div className="card bg-gradient-to-r from-blue-50 to-purple-50 shadow-xl mb-8">
                <div className="card-body">
                  <h3 className="card-title text-lg font-bold text-gray-900 mb-4">🚀 이런 분들이 사용 중입니다</h3>
                  <div className="grid grid-cols-1 gap-3">
                    <div className="flex items-center gap-3">
                      <div className="badge badge-success badge-sm">✓</div>
                      <span className="text-gray-700"><strong>직장인</strong> - 승진, 자격증, 부업 목표 달성</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="badge badge-success badge-sm">✓</div>
                      <span className="text-gray-700"><strong>학생</strong> - 입시, 취업, 어학 점수 향상</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="badge badge-success badge-sm">✓</div>
                      <span className="text-gray-700"><strong>창업자</strong> - 사업 계획, 매출 목표 달성</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="badge badge-success badge-sm">✓</div>
                      <span className="text-gray-700"><strong>개발자</strong> - 기술 습득, 프로젝트 완성</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Link href="/auth/signup">
                  <button className="btn btn-primary btn-lg w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 px-8 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all">
                    🎯 3분만에 목표 설정하기
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </button>
                </Link>
                <div className="text-center sm:text-left">
                  <p className="text-sm text-gray-500 mb-2">이미 계정이 있으신가요?</p>
                  <Link href="/auth/login">
                    <button className="btn btn-outline btn-lg w-full sm:w-auto">
                      로그인하기
                    </button>
                  </Link>
                </div>
              </div>

              {/* Trust Signals */}
              <div className="card bg-base-100 shadow-xl">
                <div className="card-body py-4">
                  <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600">
                    <div className="badge badge-outline badge-lg gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span><strong>완전 무료</strong> 사용</span>
                    </div>
                    <div className="badge badge-outline badge-lg gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span><strong>30초</strong> 간편 가입</span>
                    </div>
                    <div className="badge badge-outline badge-lg gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span><strong>모든 기능</strong> 제한 없음</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Visual Demo */}
            <div className="mt-16 lg:mt-0 lg:col-span-5">
              <div className="relative">
                {/* Success Stories */}
                <div className="card bg-base-100 shadow-2xl mx-auto max-w-md">
                  <div className="card-body">
                    <div className="text-center mb-6">
                      <div className="badge badge-success gap-2 mb-3">
                        <Star className="w-4 h-4 fill-current" />
                        <span>실제 성공사례</span>
                      </div>
                      <h3 className="card-title text-lg font-bold text-gray-800 mb-2 justify-center">오타니 쇼헤이의 만다라트</h3>
                      <p className="text-sm text-gray-600">고교 시절 작성한 목표 → MLB 최고의 선수</p>
                    </div>
                  
                  <div className="grid grid-cols-3 gap-2 mb-6">
                    {[
                      { text: '메이저리그 계약', color: 'bg-blue-50 text-blue-700', completed: true },
                      { text: '8구종 완성', color: 'bg-green-50 text-green-700', completed: true },
                      { text: '160km 구속', color: 'bg-purple-50 text-purple-700', completed: true },
                      { text: '인원관리', color: 'bg-pink-50 text-pink-700', completed: true },
                      { text: '8구단 1위지명', color: 'bg-red-600 text-white', isCenter: true, completed: true },
                      { text: '체력향상', color: 'bg-orange-50 text-orange-700', completed: true },
                      { text: '운50%', color: 'bg-teal-50 text-teal-700', completed: true },
                      { text: '재구성', color: 'bg-indigo-50 text-indigo-700', completed: true },
                      { text: '변화구', color: 'bg-red-50 text-red-700', completed: true }
                    ].map((item, i) => (
                      <div
                        key={i}
                        className={`
                          aspect-square rounded-lg flex items-center justify-center text-xs font-medium relative
                          ${item.color}
                          ${item.isCenter ? 'ring-4 ring-red-200' : ''}
                          transition-all duration-300 hover:scale-105 hover:shadow-md
                        `}
                      >
                        <span className="text-center px-1">{item.text}</span>
                        {item.completed && (
                          <CheckCircle className="w-3 h-3 text-green-500 absolute -top-1 -right-1 bg-white rounded-full" />
                        )}
                      </div>
                    ))}
                  </div>
                  
                    <div className="text-center">
                      <div className="badge badge-warning gap-2 text-sm font-bold">
                        <span>🏆</span>
                        <span>목표 달성률 100%</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating Elements */}
                <div className="absolute -top-4 -right-4 animate-pulse">
                  <div className="badge badge-error gap-2 shadow-lg">
                    💡 당신도 가능해요!
                  </div>
                </div>
                <div className="absolute -bottom-4 -left-4">
                  <div className="badge badge-info gap-2 shadow-lg animate-bounce">
                    🚀 지금 시작하세요
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