'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import HeaderBar from '@/components/layout/HeaderBar';
import { Button } from '@/components/ui/Button';
import { createClient } from '@/utils/supabase/client';
import { User } from '@supabase/supabase-js';
import SlideUpPanel from '@/components/ui/SlideUpPanel';
import { mandalartAPI } from '@/services/mandalartService';
import { toast } from "sonner";

interface AppHeaderBarProps {
  showBackButton?: boolean;
  backHref?: string;
  onCreateMandalart?: () => void;
}

const AppHeaderBar: React.FC<AppHeaderBarProps> = ({
  showBackButton = false,
  backHref = "/app",
  onCreateMandalart
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    }
    getUser();
  }, [supabase]);

  const handleCreateMandalart = async () => {
    if (onCreateMandalart) {
      onCreateMandalart();
    } else {
      try {
        setDrawerOpen(false);
        const title = '새 만다라트';
        const rootCellId = await mandalartAPI.createMandalart(title);
        
        window.location.href = `/app/cell/${rootCellId}`;
      } catch (err) {
        console.error('만다라트 생성 오류:', err);
        toast.error('만다라트 생성에 실패했습니다');
      }
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/auth/login');
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
            {/* 데스크톱: 기존 버튼들 */}
            <div className="flex items-center gap-2">
              <Button onClick={handleCreateMandalart} size="sm">새 만다라트 만들기</Button>
            </div>
            <div className="hidden sm:flex items-center gap-2">
              {user && (
                <Button onClick={handleLogout} size="sm">로그아웃</Button>
              )}
              <Link href="/app/profile" aria-label="프로필">
                <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-gray-500 hover:text-blue-600">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </Link>           
            </div>
            {/* 모바일: 햄버거 메뉴 */}
            <button className="sm:hidden p-2" aria-label="메뉴" onClick={() => setDrawerOpen(true)}>
              <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-gray-700">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        }
      />
      
      {/* 햄버거 메뉴 드로어(모바일) */}
      <SlideUpPanel isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} title="메뉴">
        <div className="flex flex-col gap-4">
          <Button 
            onClick={() => {
              setDrawerOpen(false);
              window.location.href = '/app/profile';
            }} 
            variant="secondary" 
            className="flex items-center gap-2"
          >
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            프로필
          </Button>
          <Button 
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
          </Button>
          {user && (
            <Button onClick={handleLogout} variant="secondary" className="flex items-center gap-2">
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              로그아웃
            </Button>
          )}
        </div>
      </SlideUpPanel>
    </>
  );
};

export default AppHeaderBar;