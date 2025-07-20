'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { getMostRecentMandalartCell } from '@/lib/utils';
import HamburgerIcon from '@/components/animations/HamburgerIcon';
import SlideUpPanel from '@/components/ui/SlideUpPanel';
import AnimatedButton from '@/components/animations/AnimatedButton';
import { signOut } from '@/lib/auth/utils';
import { toast } from "sonner";
import { useUser } from '@/hooks/useAuth';


// 최근 만다라트 데이터 가져오기 (쿠키에서)
// cell 경로로 요청 이동


const BottomBar: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const locale = params?.locale as string || 'ko';
  const [recentCellId, setRecentCellId] = useState<string | null>(null);
  const user = useUser(); // 전역 인증 상태 사용
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  // 다국어 번역 훅
  const t = useTranslations('navigation');

  // 브라우저 환경에서만 실행되도록 useEffect 사용
  useEffect(() => {
    try {
      // 최근 만다라트 셀 ID를 로컬 스토리지에서 가져오기
      const storedCellId = getMostRecentMandalartCell();
      if (storedCellId) {
        setRecentCellId(storedCellId);
      }
    } catch (error) {
      console.error(t('localStorageError'), error);
    }
  }, []);

  // 만다라트 버튼 클릭 핸들러
  const handleMandalartClick = (e: React.MouseEvent) => {
    if (!recentCellId) {
      e.preventDefault();
      toast.error(t('noRecentMandalart'));
      router.push(`/${locale}`);
    }
  };

  const handleLogout = async () => {
    if (isLoggingOut) return; // 중복 클릭 방지
    
    try {
      setIsLoggingOut(true);
      setDrawerOpen(false);
      
      // 기존 auth utils의 signOut 함수 사용 (에러 처리 포함)
      const result = await signOut();
      
      if (!result.success) {
        toast.error(result.error || t('logoutError'));
        return;
      }
      
      toast.success(t('logoutSuccess'));
      router.push(`/${locale}`);
      
    } catch (error) {
      console.error(t('logoutError'), error);
      toast.error(t('logoutUnexpectedError'));
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 h-14 flex items-center justify-around z-tooltip">
        <Link href={`/${locale}/app`} className="flex flex-col items-center text-gray-600 hover:text-blue-600">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span className="text-xs mt-1">{t('dashboard')}</span>
        </Link>
        
        <Link 
          href={recentCellId ? `/${locale}/app/cell/${recentCellId}` : '#'}
          className="flex flex-col items-center text-gray-600 hover:text-blue-600"
          onClick={handleMandalartClick}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
          <span className="text-xs mt-1">{t('mandalart')}</span>
        </Link>


        <div className="flex flex-col items-center text-gray-600 hover:text-blue-600">
          <HamburgerIcon isOpen={drawerOpen} onClick={() => setDrawerOpen(!drawerOpen)} />
          <span className="text-xs">{t('menu')}</span>
        </div>
      </nav>

      {/* 햄버거 메뉴 드로어 */}
      <SlideUpPanel isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} title={t('menu')}>
        <div className="flex flex-col gap-4">
          <AnimatedButton 
            onClick={() => {
              setDrawerOpen(false);
              router.push(`/${locale}/app/settings`);
            }} 
            variant="secondary" 
            className="flex items-center gap-2"
          >
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {t('settings')}
          </AnimatedButton>
          {user && (
            <AnimatedButton 
              onClick={handleLogout} 
              variant="secondary" 
              className="flex items-center gap-2"
              disabled={isLoggingOut}
            >
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              {isLoggingOut ? t('loggingOut') : t('logout')}
            </AnimatedButton>
          )}
        </div>
      </SlideUpPanel>
    </>
  );
};

export default BottomBar; 