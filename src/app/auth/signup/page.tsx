'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
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
  const router = useRouter();
  const navigation = useNavigation();
  
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
      toast.error(validationError);
      formState.setLoading(false);
      return;
    }
    
    try {
      const result = await signUpWithEmail(formState.data.email, formState.data.password);
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      toast.success(AUTH_MESSAGES.SIGNUP_SUCCESS);
      
      // 로그인 페이지로 이동
      setTimeout(() => {
        navigation.navigateToLogin();
      }, 3000);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : AUTH_MESSAGES.SIGNUP_FAILED);
    } finally {
      formState.setLoading(false);
    }
  };
  
  return (
    <AuthLayout 
      title="회원가입" 
      showBackButton 
      onBackClick={navigation.navigateToLogin}
    >
      <AuthForm
        email={formState.data.email}
        password={formState.data.password}
        confirmPassword={formState.data.confirmPassword}
        onEmailChange={(value) => formState.updateField('email', value)}
        onPasswordChange={(value) => formState.updateField('password', value)}
        onConfirmPasswordChange={(value) => formState.updateField('confirmPassword', value)}
        onSubmit={handleSignUp}
        isLoading={formState.isLoading}
        error={formState.error}
        submitLabel="회원가입"
        loadingLabel={LOADING_STATES.SIGNUP}
        alternativeAction={{
          label: '이미 계정이 있으신가요?',
          buttonText: '로그인하기',
          onClick: navigation.navigateToLogin
        }}
      />
    </AuthLayout>
  );
} 