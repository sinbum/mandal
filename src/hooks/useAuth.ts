import { useState, useEffect, createContext, useContext } from 'react';
import { User } from '@supabase/supabase-js';
import { createClient } from '@/utils/supabase/client';

// 전역 인증 상태 관리를 위한 컨텍스트
interface AuthContextType {
  user: User | null;
  loading: boolean;
  isLoggedIn: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isLoggedIn: false,
});

// 싱글톤 패턴으로 인증 상태 관리
class AuthManager {
  private static instance: AuthManager;
  private user: User | null = null;
  private loading = true;
  private listeners: Array<(state: AuthContextType) => void> = [];
  private supabase = createClient();
  private initialized = false;

  static getInstance(): AuthManager {
    if (!AuthManager.instance) {
      AuthManager.instance = new AuthManager();
    }
    return AuthManager.instance;
  }

  private constructor() {
    this.initialize();
  }

  private async initialize() {
    if (this.initialized) return;
    
    try {
      console.log('Auth 초기화 시작');
      
      // 인증 상태 변경 리스너 먼저 설정 (한 번만)
      this.supabase.auth.onAuthStateChange((event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        this.user = session?.user || null;
        this.loading = false;
        this.notifyListeners();
      });

      // 초기 사용자 상태 확인
      const { data: { user } } = await this.supabase.auth.getUser();
      this.user = user;
      this.loading = false;
      this.initialized = true;
      
      console.log('Auth 초기화 완료:', !!user);
      this.notifyListeners();
    } catch (error) {
      console.error('Auth initialization failed:', error);
      this.user = null;
      this.loading = false;
      this.initialized = true;
      this.notifyListeners();
    }
  }

  subscribe(listener: (state: AuthContextType) => void) {
    this.listeners.push(listener);
    
    // 즉시 현재 상태 전달
    listener({
      user: this.user,
      loading: this.loading,
      isLoggedIn: !!this.user,
    });

    // 구독 해제 함수 반환
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners() {
    const state: AuthContextType = {
      user: this.user,
      loading: this.loading,
      isLoggedIn: !!this.user,
    };
    
    this.listeners.forEach(listener => listener(state));
  }

  getUser(): User | null {
    return this.user;
  }

  isAuthenticated(): boolean {
    return !!this.user;
  }

  isLoading(): boolean {
    return this.loading;
  }
}

// 전역 인증 상태를 사용하는 훅
export function useAuth(): AuthContextType {
  const [authState, setAuthState] = useState<AuthContextType>({
    user: null,
    loading: true,
    isLoggedIn: false,
  });

  useEffect(() => {
    const authManager = AuthManager.getInstance();
    const unsubscribe = authManager.subscribe(setAuthState);
    
    return unsubscribe;
  }, []);

  return authState;
}

// 컴포넌트에서 사용자 정보만 필요한 경우
export function useUser(): User | null {
  const { user } = useAuth();
  return user;
}

// 인증 상태만 확인하는 경우
export function useIsLoggedIn(): boolean {
  const { isLoggedIn } = useAuth();
  return isLoggedIn;
}

// 서비스에서 동기적으로 사용자 정보를 가져오는 경우
export function getCurrentUser(): User | null {
  return AuthManager.getInstance().getUser();
}

// 서비스에서 인증 상태를 확인하는 경우
export function isUserAuthenticated(): boolean {
  return AuthManager.getInstance().isAuthenticated();
}

export { AuthContext };
export default useAuth;