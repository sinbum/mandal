'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useIsLoggedIn } from '@/hooks/useAuth';
import { useTranslations } from 'next-intl';

export default function AuthButton() {
  const isLoggedIn = useIsLoggedIn(); // 전역 인증 상태 사용
  const router = useRouter();
  const t = useTranslations('navigation');

  // 로그인 상태에 따른 렌더링
  if (!isLoggedIn) {
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
              router.push('/auth/login');
            } else {
            }
          }}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded text-sm font-medium"
        >
          {t('logout')}
        </button>
      ) : (
        <Link href="/auth/login">
          <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium">
            {t('login')}
          </button>
        </Link>
      )}
    </div>
  );
} 