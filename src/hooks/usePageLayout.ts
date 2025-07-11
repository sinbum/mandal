import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { checkUserSession } from '@/lib/auth/utils';
import { User } from '@supabase/supabase-js';

export interface PageLayoutState {
  isLoading: boolean;
  error: string | null;
  user: User | null;
}

export function usePageLayout(requireAuth: boolean = true) {
  const [state, setState] = useState<PageLayoutState>({
    isLoading: true,
    error: null,
    user: null
  });
  const router = useRouter();

  useEffect(() => {
    async function initializePage() {
      try {
        setState(prev => ({ ...prev, isLoading: true, error: null }));
        
        if (requireAuth) {
          const sessionResult = await checkUserSession();
          
          if (!sessionResult.success) {
            router.push('/auth/login');
            return;
          }
          
          if (sessionResult.data?.user) {
            setState(prev => ({ 
              ...prev, 
              user: sessionResult.data.user,
              isLoading: false 
            }));
          }
        } else {
          setState(prev => ({ ...prev, isLoading: false }));
        }
      } catch (error) {
        console.error('Page initialization error:', error);
        setState(prev => ({ 
          ...prev, 
          error: error instanceof Error ? error.message : '페이지 초기화 중 오류가 발생했습니다',
          isLoading: false 
        }));
      }
    }

    initializePage();
  }, [requireAuth, router]);

  return state;
}