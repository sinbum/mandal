'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

export default function AuthButton() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' | 'warning' } | null>(null);
  const router = useRouter();
  useEffect(() => {
    const supabase = createClient();
    
    // 현재 세션 확인
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsLoggedIn(!!session);
    };

    checkSession();

    // 인증 상태 변경 구독
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // 초기 로딩 상태
  if (isLoggedIn === null) {
    return (
      <div className="w-[73px] h-[36px] bg-gray-200 animate-pulse rounded"></div>
    );
  }

  return (
    <div className="">
      {isLoggedIn ? (
        <button
          onClick={async () => {
            const response = await fetch('/auth/logout', { method: 'POST' });
            const data = await response.json();
            if (data.status === 'success') {
              setToast({ message: data.message, type: 'success' });
              router.push('/auth/login');
            } else {
              setToast({ message: data.error, type: 'error' });
            }
          }}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded text-sm"
        >
          로그아웃
        </button>
      ) : (
        <Link href="/auth/login">
          <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm">
            로그인
          </button>
        </Link>
      )}
    </div>
  );
} 