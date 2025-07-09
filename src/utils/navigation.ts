import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

export interface NavigationUtils {
  navigateToHome: () => void;
  navigateToLogin: () => void;
  navigateToSignup: () => void;
  navigateToProfile: () => void;
  navigateToCell: (cellId: string) => void;
  navigateBack: () => void;
  reload: () => void;
}

export function useNavigation(): NavigationUtils {
  const router = useRouter();

  const navigateToHome = useCallback(() => {
    router.push('/');
  }, [router]);

  const navigateToLogin = useCallback(() => {
    router.push('/auth/login');
  }, [router]);

  const navigateToSignup = useCallback(() => {
    router.push('/auth/signup');
  }, [router]);

  const navigateToProfile = useCallback(() => {
    router.push('/profile');
  }, [router]);

  const navigateToCell = useCallback((cellId: string) => {
    router.push(`/cell/${cellId}`);
  }, [router]);

  const navigateBack = useCallback(() => {
    router.back();
  }, [router]);

  const reload = useCallback(() => {
    router.refresh();
  }, [router]);

  return {
    navigateToHome,
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