import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { ArrowRight, CheckCircle, Clock, Users, Zap } from 'lucide-react';

export default function CTASection() {
  return (
    <section className="py-20 bg-blue-600 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/5 to-transparent"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Main CTA */}
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 bg-red-500 text-white px-6 py-3 rounded-full text-sm font-bold mb-6 animate-pulse">
              <Clock className="w-4 h-4" />
              <span>⚠️ 작심삼일 또 반복할 건가요?</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
              <span className="text-red-300">2025년도 실패</span>하기 전에
              <br />
              <span className="text-yellow-300">이번엔 정말 달성</span>해보세요
            </h2>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
              <strong className="text-white">오타니 쇼헤이</strong>처럼 체계적으로 접근하면
              <br />
              <span className="bg-yellow-400 text-gray-900 px-3 py-1 rounded font-bold">누구든지 목표를 달성할 수 있습니다</span>
            </p>
          </div>

          {/* Urgency Elements */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-white">
              <Clock className="w-4 h-4" />
              <span className="text-sm">30초 만에 가입</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-white">
              <Users className="w-4 h-4" />
              <span className="text-sm">1,000+ 사용자 선택</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-white">
              <Zap className="w-4 h-4" />
              <span className="text-sm">즉시 사용 가능</span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link href="/auth/signup">
              <Button 
                size="lg" 
                className="w-full sm:w-auto bg-yellow-400 hover:bg-yellow-500 text-gray-900 px-8 py-4 text-lg font-bold shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all border-0"
              >
                지금 무료로 시작하기
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button 
                variant="outline" 
                size="lg" 
                className="w-full sm:w-auto border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 text-lg font-semibold backdrop-blur-sm bg-white/10"
              >
                기존 계정으로 로그인
              </Button>
            </Link>
          </div>

          {/* Value Proposition */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-white mb-6">
              완전 무료로 시작하세요
            </h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <CheckCircle className="w-8 h-8 text-green-300 mx-auto mb-3" />
                <h4 className="font-semibold text-white mb-2">무료 계정</h4>
                <p className="text-sm text-blue-100">신용카드 없이 바로 시작</p>
              </div>
              <div className="text-center">
                <CheckCircle className="w-8 h-8 text-green-300 mx-auto mb-3" />
                <h4 className="font-semibold text-white mb-2">모든 기능</h4>
                <p className="text-sm text-blue-100">제한 없이 모든 기능 사용</p>
              </div>
              <div className="text-center">
                <CheckCircle className="w-8 h-8 text-green-300 mx-auto mb-3" />
                <h4 className="font-semibold text-white mb-2">언제든 해지</h4>
                <p className="text-sm text-blue-100">부담 없이 언제든 중단</p>
              </div>
            </div>
          </div>

          {/* Social Proof */}
          <div className="mt-12 text-center">
            <p className="text-blue-100 text-sm mb-4">지금 이 순간에도 목표를 달성하고 있는 사용자들</p>
            <div className="flex justify-center items-center gap-4 text-white">
              <div className="flex -space-x-2">
                {['👨‍💼', '👩‍💻', '👨‍🎓', '👩‍🎨', '👨‍🔬', '👩‍⚕️'].map((emoji, i) => (
                  <div key={i} className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                    {emoji}
                  </div>
                ))}
              </div>
              <div className="text-sm">
                <span className="font-semibold">+1,000명</span>
                <br />
                <span className="text-blue-200">활발히 사용 중</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}