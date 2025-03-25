'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import { handleLogout } from '@/app/auth/logOut';

export default function AuthButton() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' | 'warning' } | null>(null);

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

  return (
    <div className="">
      {isLoggedIn ? (
        <button
          onClick={() => handleLogout(setToast)}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded text-sm"
        >
          로그아웃
        </button>
      ) : (
        <Link href="/login">
          <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm">
            로그인
          </button>
        </Link>
      )}
    </div>
  );
} 