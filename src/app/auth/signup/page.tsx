'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import MobileLayout from '@/components/layout/MobileLayout';
import HeaderBar from '@/components/layout/HeaderBar';
import { Button } from '@/components/ui/Button';
import InputField from '@/components/ui/InputField';
import Toast from '@/components/ui/Toast';
import { createClient } from '@/utils/supabase/client';

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error' | 'info' | 'warning'} | null>(null);
  
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    // 간단한 유효성 검사
    if (!email || !password || !confirmPassword) {
      setError('모든 필드를 입력해주세요.');
      setIsLoading(false);
      return;
    }
    
    if (password !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      setIsLoading(false);
      return;
    }
    
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/login/confirm`
        }
      });
      
      if (error) {
        throw error;
      }
      
      setToast({
        message: '회원가입 성공! 이메일 확인을 통해 계정을 활성화해주세요.',
        type: 'success'
      });
      
      // 로그인 페이지로 이동
      setTimeout(() => {
        router.push('/auth/login');
      }, 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '회원가입 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <MobileLayout
      header={<HeaderBar title="회원가입" showBackButton onBackClick={() => router.push('/auth/login')} />}
    >
      <div className="p-6 flex flex-col h-full">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">만다라트 플래너</h1>
          <p className="text-gray-600">
            새 계정 만들기
          </p>
        </div>
        
        <form onSubmit={handleSignUp} className="space-y-4">
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
          
          <InputField
            id="confirmPassword"
            label="비밀번호 확인"
            value={confirmPassword}
            onChange={(value: string) => {
              setConfirmPassword(value);
              setError(null);
            }}
            placeholder="비밀번호 재입력"
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
              {isLoading ? '처리 중...' : '회원가입'}
            </Button>
          </div>
          
          <div className="text-center mt-4">
            <p className="text-sm text-gray-600">이미 계정이 있으신가요?</p>
            <button 
              type="button" 
              onClick={() => router.push('/auth/login')}
              className="text-blue-600 text-sm font-medium"
            >
              로그인하기
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