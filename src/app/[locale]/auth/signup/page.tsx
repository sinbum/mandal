'use client';

import React from 'react';
import { toast } from 'sonner';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import AuthLayout from '@/components/auth/AuthLayout';
import AuthForm from '@/components/auth/AuthForm';
import { signUpWithEmail, validateAuthForm } from '@/lib/auth/utils';
import { useFormState } from '@/hooks/useFormState';
import { useNavigation } from '@/utils/navigation';
import { AUTH_MESSAGES, LOADING_STATES } from '@/constants/app';

interface SignupFormData {
  email: string;
  password: string;
  confirmPassword: string;
}

export default function SignupPage() {
  const params = useParams();
  const locale = params.locale as string;
  const navigation = useNavigation();
  
  // 다국어 번역 훅
  const t = useTranslations('auth.signup');
  const tAuth = useTranslations('auth');
  const tErrors = useTranslations('auth.errors');
  const tLoading = useTranslations('loading');
  
  const formState = useFormState<SignupFormData>({
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    formState.setLoading(true);
    formState.setError(null);
    
    // 유효성 검사
    const validationError = validateAuthForm(
      formState.data.email, 
      formState.data.password, 
      formState.data.confirmPassword
    );
    if (validationError) {
      toast.error(tErrors('passwordMismatch')); // 실제 에러에 맞게 매핑 필요
      formState.setLoading(false);
      return;
    }
    
    try {
      const result = await signUpWithEmail(formState.data.email, formState.data.password);
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      toast.success(t('submit'));
      
      // 로그인 페이지로 이동
      setTimeout(() => {
        navigation.navigateToLogin(locale);
      }, 3000);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : tErrors('signupFailed'));
    } finally {
      formState.setLoading(false);
    }
  };
  
  return (
    <AuthLayout 
      title={t('title')} 
      showBackButton 
      onBackClick={() => navigation.navigateToLogin(locale)}
    >
      <AuthForm
        pageName="signup"
        email={formState.data.email}
        password={formState.data.password}
        confirmPassword={formState.data.confirmPassword}
        onEmailChange={(value) => formState.updateField('email', value)}
        onPasswordChange={(value) => formState.updateField('password', value)}
        onConfirmPasswordChange={(value) => formState.updateField('confirmPassword', value)}
        onSubmit={handleSignUp}
        isLoading={formState.isLoading}
        error={formState.error}
        submitLabel={t('submit')}
        loadingLabel={tLoading('default')}
        alternativeAction={{
          label: t('hasAccount'),
          buttonText: t('loginLink'),
          onClick: () => navigation.navigateToLogin(locale)
        }}
      />
    </AuthLayout>
  );
} 