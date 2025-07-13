'use client';

import React, { useEffect, Suspense } from 'react';
import { useSearchParams, useParams } from 'next/navigation';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import AuthLayout from '@/components/auth/AuthLayout';
import AuthForm from '@/components/auth/AuthForm';
import { 
  verifyEmailToken, 
  signInWithEmail, 
  checkUserSession, 
  validateAuthForm
} from '@/lib/auth/utils';
import { useFormState } from '@/hooks/useFormState';
import { useNavigation } from '@/utils/navigation';
import { AUTH_MESSAGES, LOADING_STATES } from '@/constants/app';

interface LoginFormData {
  email: string;
  password: string;
}

function LoginContent() {
  const params = useParams();
  const locale = params.locale as string;
  const navigation = useNavigation();
  const searchParams = useSearchParams();
  
  // 다국어 번역 훅
  const t = useTranslations('auth.login');
  const tAuth = useTranslations('auth');
  const tErrors = useTranslations('auth.errors');
  const tLoading = useTranslations('loading');
  
  const formState = useFormState<LoginFormData>({
    email: '',
    password: ''
  });

  // 이메일 인증 처리 및 에러 처리
  useEffect(() => {
    const handleEmailConfirmation = async () => {
      const tokenHash = searchParams.get('token_hash');
      const type = searchParams.get('type');
      const errorParam = searchParams.get('error');

      // URL에서 에러 파라미터 확인
      if (errorParam === 'confirmation_failed') {
        toast.error(tErrors('loginFailed'));
        return;
      }

      if (tokenHash && type === 'email') {
        formState.setLoading(true);
        try {
          const result = await verifyEmailToken(tokenHash);

          if (!result.success) {
            throw new Error(result.error);
          }

          if (result.data && typeof result.data === 'object' && 'session' in result.data && result.data.session) {
            toast.success(tAuth('login.submit'));
            
            // 성공 후 앱 페이지로 이동
            setTimeout(() => {
              navigation.navigateToApp(locale);
            }, 1500);
          }
        } catch (err: unknown) {
          console.error('이메일 인증 오류:', err);
          toast.error(err instanceof Error ? err.message : tErrors('loginFailed'));
        } finally {
          formState.setLoading(false);
        }
      }
    };

    handleEmailConfirmation();
  }, [searchParams, navigation, formState]);

  // 이미 로그인되어 있는지 확인
  useEffect(() => {
    const checkSession = async () => {
      try {
        const result = await checkUserSession();
        
        if (result.success && result.data) {
          navigation.navigateToApp(locale);
        }
      } catch (error) {
        console.error('세션 확인 오류:', error);
      }
    };
    
    checkSession();
  }, [navigation]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    formState.setLoading(true);
    formState.setError(null);
    
    // 유효성 검사
    const validationError = validateAuthForm(formState.data.email, formState.data.password);
    if (validationError) {
      toast.error(tErrors('invalidEmail')); // 실제 에러에 맞게 매핑 필요
      formState.setLoading(false);
      return;
    }
    
    try {
      const result = await signInWithEmail(formState.data.email, formState.data.password);
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      toast.success(t('submit'));
      
      // 즉시 이동 (Next.js 라우팅은 비동기적으로 처리됨)
      navigation.navigateToApp(locale);
      
      // 백업으로 직접 이동도 시도
      setTimeout(() => {
        if (typeof window !== 'undefined' && !window.location.pathname.includes('/app')) {
          window.location.href = `/${locale}/app`;
        }
      }, 1000);
    } catch (err: unknown) {
      console.error('로그인 오류:', err);
      toast.error(err instanceof Error ? err.message : tErrors('loginFailed'));
      formState.setLoading(false);
    }
  };

  return (
    <AuthLayout title={t('title')}>
      <AuthForm
        pageName="login"
        email={formState.data.email}
        password={formState.data.password}
        onEmailChange={(value) => formState.updateField('email', value)}
        onPasswordChange={(value) => formState.updateField('password', value)}
        onSubmit={handleLogin}
        isLoading={formState.isLoading}
        error={formState.error}
        submitLabel={t('submit')}
        loadingLabel={tLoading('default')}
        alternativeAction={{
          label: t('noAccount'),
          buttonText: t('signUpLink'),
          onClick: () => navigation.navigateToSignup(locale)
        }}
      />
    </AuthLayout>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
} 