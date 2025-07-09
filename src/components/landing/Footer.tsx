import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { APP_CONFIG } from '@/constants/app';
import { Heart, Mail, MessageCircle } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <Image 
                src={APP_CONFIG.logo} 
                alt={APP_CONFIG.name} 
                width={32} 
                height={32} 
                className="rounded"
              />
              <span className="text-xl font-bold">{APP_CONFIG.name}</span>
            </div>
            <p className="text-gray-400 leading-relaxed mb-6 max-w-md">
              과학적으로 검증된 만다라트 기법으로 목표를 달성하세요.
              <br />
              꿈을 현실로 만드는 가장 체계적인 방법입니다.
            </p>
            <div className="flex items-center gap-4">
              <a 
                href="mailto:support@mandalart.app" 
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
              >
                <Mail className="w-4 h-4" />
                <span className="text-sm">support@mandalart.app</span>
              </a>
              <a 
                href="#" 
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span className="text-sm">문의하기</span>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4 text-white">서비스</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/auth/signup" className="text-gray-400 hover:text-white transition-colors text-sm">
                  무료 시작하기
                </Link>
              </li>
              <li>
                <Link href="/auth/login" className="text-gray-400 hover:text-white transition-colors text-sm">
                  로그인
                </Link>
              </li>
              <li>
                <Link href="#features" className="text-gray-400 hover:text-white transition-colors text-sm">
                  기능 소개
                </Link>
              </li>
              <li>
                <Link href="#testimonials" className="text-gray-400 hover:text-white transition-colors text-sm">
                  성공 사례
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-semibold mb-4 text-white">리소스</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                  만다라트 가이드
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                  목표 설정 팁
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                  자주 묻는 질문
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                  개인정보처리방침
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                  서비스 이용약관
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <span>© {currentYear} 만다라트. 모든 권리 보유.</span>
              <span className="hidden md:inline">|</span>
              <span className="flex items-center gap-1">
                대한민국에서 <Heart className="w-4 h-4 text-red-500" /> 으로 제작
              </span>
            </div>
            
            <div className="flex items-center gap-6 text-sm text-gray-400">
              <span>🎯 목표 달성률 87%</span>
              <span>👥 1,000+ 사용자</span>
              <span>⭐ 4.9/5 만족도</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Achievement Bar */}
      <div className="bg-blue-600 py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center gap-8 text-white text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span>실시간: 목표 달성 중인 사용자 247명</span>
            </div>
            <div className="hidden md:flex items-center gap-2">
              <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
              <span>오늘 새로 시작한 사용자 23명</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}