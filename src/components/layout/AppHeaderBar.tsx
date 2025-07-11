'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import HeaderBar from '@/components/layout/HeaderBar';
import AnimatedButton from '@/components/animations/AnimatedButton';
import HamburgerIcon from '@/components/animations/HamburgerIcon';
import { createClient } from '@/utils/supabase/client';
import { User } from '@supabase/supabase-js';
import SlideUpPanel from '@/components/ui/SlideUpPanel';
import { signOut } from '@/lib/auth/utils';
import { toast } from "sonner";

interface AppHeaderBarProps {
  showBackButton?: boolean;
  backHref?: string;
}

const AppHeaderBar: React.FC<AppHeaderBarProps> = ({
  showBackButton = false,
  backHref = "/app"
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    }
    getUser();

    // 인증 상태 변경 구독으로 실시간 동기화
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  const handleLogout = async () => {
    if (isLoggingOut) return; // 중복 클릭 방지
    
    try {
      setIsLoggingOut(true);
      
      // 즉시 UI 상태 초기화 (사용자 경험 개선)
      setUser(null);
      setDrawerOpen(false);
      
      // 기존 auth utils의 signOut 함수 사용 (에러 처리 포함)
      const result = await signOut();
      
      if (!result.success) {
        // 실패 시 사용자 상태 복원
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
        toast.error(result.error || '로그아웃 중 오류가 발생했습니다');
        return;
      }
      
      toast.success('성공적으로 로그아웃되었습니다');
      router.push('/');
      
    } catch (error) {
      console.error('로그아웃 오류:', error);
      // 실패 시 사용자 상태 복원
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      toast.error('로그아웃 중 예상치 못한 오류가 발생했습니다');
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleProfileNavigation = () => {
    router.push('/app/profile');
  };

  return (
    <>
      <HeaderBar
        showBackButton={showBackButton}
        href={backHref}
        title={
          <div className="flex items-center gap-2">
            <span className="sm:inline text-lg font-semibold text-gray-800 truncate">만월</span>
          </div>
        }
        rightElement={
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2">
              {user && (
                <AnimatedButton 
                  onClick={handleLogout} 
                  size="sm"
                  disabled={isLoggingOut}
                >
                  {isLoggingOut ? '로그아웃 중...' : '로그아웃'}
                </AnimatedButton>
              )}
              <button 
                onClick={handleProfileNavigation}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="프로필"
              >
                <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-gray-600 hover:text-blue-600">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </button>           
            </div>
            {/* 모바일: 햄버거 메뉴 */}
            <div className="sm:hidden">
              <HamburgerIcon 
                isOpen={drawerOpen} 
                onClick={() => setDrawerOpen(!drawerOpen)}
              />
            </div>
          </div>
        }
      />
      
      {/* 햄버거 메뉴 드로어(모바일) */}
      <SlideUpPanel isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} title="메뉴">
        <div className="flex flex-col gap-4">
          <AnimatedButton 
            onClick={() => {
              setDrawerOpen(false);
              router.push('/app/profile');
            }} 
            variant="secondary" 
            className="flex items-center gap-2"
          >
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            프로필
          </AnimatedButton>
          <AnimatedButton 
            onClick={() => {
              setDrawerOpen(false);
              // 설정 기능은 추후 구현
            }} 
            variant="secondary" 
            className="flex items-center gap-2"
          >
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            설정
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
              {isLoggingOut ? '로그아웃 중...' : '로그아웃'}
            </AnimatedButton>
          )}
        </div>
      </SlideUpPanel>
    </>
  );
};

export default AppHeaderBar;