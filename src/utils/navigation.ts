import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

export interface NavigationUtils {
  navigateToHome: (locale?: string) => void;
  navigateToApp: (locale?: string) => void;
  navigateToLogin: (locale?: string) => void;
  navigateToSignup: (locale?: string) => void;
  navigateToProfile: (locale?: string) => void;
  navigateToCell: (cellId: string, locale?: string) => void;
  navigateBack: () => void;
  reload: () => void;
}

export function useNavigation(): NavigationUtils {
  const router = useRouter();

  const navigateToHome = useCallback((locale = 'ko') => {
    router.push(`/${locale}`);
  }, [router]);

  const navigateToApp = useCallback((locale = 'ko') => {
    router.push(`/${locale}/app`);
  }, [router]);

  const navigateToLogin = useCallback((locale = 'ko') => {
    router.push(`/${locale}/auth/login`);
  }, [router]);

  const navigateToSignup = useCallback((locale = 'ko') => {
    router.push(`/${locale}/auth/signup`);
  }, [router]);

  const navigateToProfile = useCallback((locale = 'ko') => {
    router.push(`/${locale}/app/profile`);
  }, [router]);

  const navigateToCell = useCallback((cellId: string, locale = 'ko') => {
    router.push(`/${locale}/app/cell/${cellId}`);
  }, [router]);

  const navigateBack = useCallback(() => {
    router.back();
  }, [router]);

  const reload = useCallback(() => {
    router.refresh();
  }, [router]);

  return {
    navigateToHome,
    navigateToApp,
    navigateToLogin,
    navigateToSignup,
    navigateToProfile,
    navigateToCell,
    navigateBack,
    reload
  };
}

export function redirectToLogin() {
  if (typeof window !== 'undefined' && window.location.pathname !== '/auth/login') {
    window.location.href = '/auth/login';
  }
}

export function redirectToHome() {
  if (typeof window !== 'undefined') {
    window.location.href = '/';
  }
}