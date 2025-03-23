'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { checkSession } from '@/app/auth/checkSession';
import DashboardScreen from '@/components/mandalart/DashboardScreen';
import Toast from '@/components/ui/Toast';
import { handleLogout } from '@/app/auth/logOut';


export default function DashboardPage() {
  const router = useRouter();
  const [userName, setUserName] = useState<string>('사용자');
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error' | 'info' | 'warning'} | null>(null);
  
  // 인증 상태 확인 - 의존성 배열에 router를 제거하여 한 번만 호출되도록 수정
  useEffect(() => {
    checkSession(setLoading, setUserName);
  }, []);
  

  
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
        onLogout={() => handleLogout(setToast)}
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
