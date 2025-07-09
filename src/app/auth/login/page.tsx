'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import AuthLayout from '@/components/auth/AuthLayout';
import AuthForm from '@/components/auth/AuthForm';
import { 
  verifyEmailToken, 
  signInWithEmail, 
  checkUserSession, 
  validateAuthForm,
  ToastMessage 
} from '@/lib/auth/utils';
import { useFormState } from '@/hooks/useFormState';
import { useNavigation } from '@/utils/navigation';
import { AUTH_MESSAGES, LOADING_STATES } from '@/constants/app';

interface LoginFormData {
  email: string;
  password: string;
}

export default function AuthPage() {
  const router = useRouter();
  const navigation = useNavigation();
  const searchParams = useSearchParams();
  const [toast, setToast] = useState<ToastMessage | null>(null);
  
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
        formState.setError(AUTH_MESSAGES.EMAIL_VERIFICATION_FAILED);
        return;
      }

      if (tokenHash && type === 'email') {
        formState.setLoading(true);
        try {
          const result = await verifyEmailToken(tokenHash);

          if (!result.success) {
            throw new Error(result.error);
          }

          if (result.data.session) {
            setToast({
              message: AUTH_MESSAGES.EMAIL_VERIFICATION_SUCCESS,
              type: 'success'
            });
            
            // 성공 후 메인 페이지로 이동
            setTimeout(() => {
              navigation.navigateToHome();
            }, 1500);
          }
        } catch (err: unknown) {
          console.error('이메일 인증 오류:', err);
          formState.setError(err instanceof Error ? err.message : AUTH_MESSAGES.EMAIL_VERIFICATION_FAILED);
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
          navigation.navigateToHome();
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
      formState.setError(validationError);
      formState.setLoading(false);
      return;
    }
    
    try {
      const result = await signInWithEmail(formState.data.email, formState.data.password);
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      setToast({
        message: AUTH_MESSAGES.LOGIN_SUCCESS,
        type: 'success'
      });
      
      // 즉시 대시보드로 이동
      navigation.navigateToHome();
    } catch (err: unknown) {
      console.error('로그인 오류:', err);
      formState.setError(err instanceof Error ? err.message : AUTH_MESSAGES.LOGIN_FAILED);
    } finally {
      formState.setLoading(false);
    }
  };

  return (
    <AuthLayout title="로그인">
      <AuthForm
        email={formState.data.email}
        password={formState.data.password}
        onEmailChange={(value) => formState.updateField('email', value)}
        onPasswordChange={(value) => formState.updateField('password', value)}
        onSubmit={handleLogin}
        isLoading={formState.isLoading}
        error={formState.error}
        toast={toast}
        onToastClose={() => setToast(null)}
        submitLabel="로그인"
        loadingLabel={LOADING_STATES.LOGIN}
        alternativeAction={{
          label: '계정이 없으신가요?',
          buttonText: '회원가입하기',
          onClick: navigation.navigateToSignup
        }}
      />
    </AuthLayout>
  );
} 