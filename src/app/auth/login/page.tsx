'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MobileLayout from '@/components/layout/MobileLayout';
import HeaderBar from '@/components/layout/HeaderBar';
import InputField from '@/components/ui/InputField';
import Toast from '@/components/ui/Toast';
import { createClient } from '@/utils/supabase/client';
import { Button } from '@/components/ui/Button';

export default function AuthPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error' | 'info' | 'warning'} | null>(null);

  // 이미 로그인되어 있는지 확인
  useEffect(() => {
    const checkSession = async () => {
      try {
        const supabase = createClient();
        const { data } = await supabase.auth.getSession();
        
        if (data.session) {
          router.push('/');
        }
      } catch (error) {
        console.error('세션 확인 오류:', error);
      }
    };
    
    checkSession();
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    // 간단한 유효성 검사
    if (!email || !password) {
      setError('이메일과 비밀번호를 모두 입력해주세요.');
      setIsLoading(false);
      return;
    }
    
    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        throw error;
      }
      
      if (!data || !data.session) {
        throw new Error('로그인은 성공했지만 세션이 생성되지 않았습니다.');
      }
      
      setToast({
        message: '로그인 성공!',
        type: 'success'
      });
      
      // 즉시 대시보드로 이동
      router.push('/');
    } catch (err: unknown) {
      console.error('로그인 오류:', err);
      setError(err instanceof Error ? err.message : '로그인 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = () => {
    router.push('/auth/signup');
  };

  return (
    <MobileLayout
      header={<HeaderBar title="로그인" />}
    >
      <div className="p-6 flex flex-col h-full">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">만다라트 플래너</h1>
          <p className="text-gray-600">
            목표를 체계적으로 관리하는 만다라트 기법 플래너
          </p>
        </div>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <InputField
            id="email"
            label="이메일"
            value={email}
            onChange={(value: string) => {
              setEmail(value);
              setError(null);
            }}
            placeholder="이메일 입력"
            type="email"
            required
          />
          
          <InputField
            id="password"
            label="비밀번호"
            value={password}
            onChange={(value: string) => {
              setPassword(value);
              setError(null);
            }}        
            placeholder="비밀번호 입력"
            type="password"
            required
          />
          
          {error && (
            <div className="text-red-500 text-sm mt-2">
              {error}
            </div>
          )}
          
          <div className="mt-6">
            <Button
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? '로그인 중...' : '로그인'}
            </Button>
          </div>
          
          <div className="text-center mt-4">
            <p className="text-sm text-gray-600">계정이 없으신가요?</p>
            <button 
              type="button" 
              onClick={handleSignUp}
              className="text-blue-600 text-sm font-medium"
            >
              회원가입하기
            </button>
          </div>
        </form>
        
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </div>
    </MobileLayout>
  );
} 