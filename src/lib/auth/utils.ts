import { createClient } from '@/utils/supabase/client';
import { toast } from 'sonner';

export interface AuthResult {
  success: boolean;
  error?: string;
  data?: any;
}

export interface ToastMessage {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

/**
 * 세션 확인 및 사용자 정보 조회
 */
export async function checkUserSession(): Promise<AuthResult> {
  try {
    const supabase = createClient();
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      return { success: false, error: error.message };
    }
    
    return { success: true, data: session };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : '세션 확인 중 오류가 발생했습니다' 
    };
  }
}

/**
 * 이메일 인증 처리
 */
export async function verifyEmailToken(tokenHash: string): Promise<AuthResult> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: 'email'
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : '이메일 인증 중 오류가 발생했습니다' 
    };
  }
}

/**
 * 로그인 처리
 */
export async function signInWithEmail(email: string, password: string): Promise<AuthResult> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) {
      return { success: false, error: error.message };
    }
    
    if (!data || !data.session) {
      return { success: false, error: '로그인은 성공했지만 세션이 생성되지 않았습니다.' };
    }
    
    return { success: true, data };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : '로그인 중 오류가 발생했습니다' 
    };
  }
}

/**
 * 회원가입 처리
 */
export async function signUpWithEmail(email: string, password: string): Promise<AuthResult> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({ 
      email, 
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/login`
      }
    });
    
    if (error) {
      return { success: false, error: error.message };
    }
    
    return { success: true, data };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : '회원가입 중 오류가 발생했습니다' 
    };
  }
}

/**
 * 로그아웃 처리
 */
export async function signOut(): Promise<AuthResult> {
  try {
    const supabase = createClient();
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      return { success: false, error: error.message };
    }
    
    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : '로그아웃 중 오류가 발생했습니다' 
    };
  }
}

/**
 * 폼 유효성 검사
 */
export function validateAuthForm(email: string, password: string, confirmPassword?: string): string | null {
  if (!email || !password) {
    return '이메일과 비밀번호를 모두 입력해주세요.';
  }
  
  if (confirmPassword !== undefined && password !== confirmPassword) {
    return '비밀번호가 일치하지 않습니다.';
  }
  
  return null;
}

/**
 * 사용자 이름 추출 유틸리티
 */
export function extractDisplayName(email: string): string {
  return email.split('@')[0] || '사용자';
}

/**
 * 사용자 세션 캐싱 관련 유틸리티
 */
export const SESSION_CACHE = {
  KEY: 'userSessionCache',
  VALIDITY: 60 * 1000, // 1분
  
  get(): { displayName: string; timestamp: number } | null {
    if (typeof window === 'undefined') return null;
    
    const cachedData = sessionStorage.getItem(this.KEY);
    if (!cachedData) return null;
    
    try {
      return JSON.parse(cachedData);
    } catch {
      return null;
    }
  },
  
  set(displayName: string): void {
    if (typeof window === 'undefined') return;
    
    const cacheData = {
      displayName,
      timestamp: new Date().getTime()
    };
    sessionStorage.setItem(this.KEY, JSON.stringify(cacheData));
  },
  
  isValid(timestamp: number): boolean {
    const now = new Date().getTime();
    return now - timestamp < this.VALIDITY;
  }
};