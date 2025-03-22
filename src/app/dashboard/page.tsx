'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardScreen from '@/components/mandalart/DashboardScreen';
import { createClient } from '@/utils/supabase/client';
import Toast from '@/components/ui/Toast';

export default function DashboardPage() {
  const router = useRouter();
  const [userName, setUserName] = useState<string>('사용자');
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error' | 'info' | 'warning'} | null>(null);
  
  // 인증 상태 확인
  useEffect(() => {
    const checkSession = async () => {
      try {
        setLoading(true);
        const supabase = createClient();
        const { data, error } = await supabase.auth.getSession();
        
        console.log('세션 확인 결과:', data.session ? '세션 있음' : '세션 없음');
        
        if (error) {
          console.error('세션 조회 오류:', error);
          router.push('/login');
          return;
        }
        
        if (!data.session) {
          console.log('세션이 없어 로그인 페이지로 이동합니다.');
          router.push('/login');
          return;
        }

        // 사용자 데이터 가져오기
        const { data: userData, error: userError } = await supabase.auth.getUser();
        
        if (userError) {
          console.error('사용자 정보 조회 오류:', userError);
          router.push('/login');
          return;
        }
        
        if (userData.user) {
          console.log('사용자 정보 로드 성공:', userData.user.email);
          // 이메일에서 사용자 이름 추출 (@ 앞 부분)
          const email = userData.user.email || '';
          const displayName = email.split('@')[0] || '사용자';
          setUserName(displayName);
        } else {
          console.log('사용자 정보가 없습니다.');
          router.push('/login');
        }
      } catch (error) {
        console.error('Session check error:', error);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };
    
    checkSession();
  }, [router]);
  
  const handleLogout = async () => {
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('로그아웃 오류:', error);
        setToast({
          message: '로그아웃 중 오류가 발생했습니다',
          type: 'error'
        });
        return;
      }
      
      setToast({
        message: '로그아웃되었습니다.',
        type: 'info'
      });
      
      // 바로 로그인 페이지로 이동
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };
  
  // 페이지 이동 핸들러
  const handleNavigate = (path: string) => {
    router.push(path);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>로딩 중...</p>
      </div>
    );
  }

  return (
    <>
      <DashboardScreen
        userName={userName}
        onLogout={handleLogout}
        onNavigate={handleNavigate}
      />
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </>
  );
}
