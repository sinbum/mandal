import React from 'react';
import { Button } from '@/components/ui/Button';
import InputField from '@/components/ui/InputField';
import Toast from '@/components/ui/Toast';
import { ToastMessage } from '@/lib/auth/utils';

interface AuthFormProps {
  email: string;
  password: string;
  confirmPassword?: string;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onConfirmPasswordChange?: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  error: string | null;
  toast: ToastMessage | null;
  onToastClose: () => void;
  submitLabel: string;
  loadingLabel: string;
  alternativeAction?: {
    label: string;
    buttonText: string;
    onClick: () => void;
  };
}

export default function AuthForm({
  email,
  password,
  confirmPassword,
  onEmailChange,
  onPasswordChange,
  onConfirmPasswordChange,
  onSubmit,
  isLoading,
  error,
  toast,
  onToastClose,
  submitLabel,
  loadingLabel,
  alternativeAction
}: AuthFormProps) {
  return (
    <>
      <form onSubmit={onSubmit} className="space-y-4">
        <InputField
          id="email"
          label="이메일"
          value={email}
          onChange={onEmailChange}
          placeholder="이메일 입력"
          type="email"
          required
        />
        
        <InputField
          id="password"
          label="비밀번호"
          value={password}
          onChange={onPasswordChange}
          placeholder="비밀번호 입력"
          type="password"
          required
        />
        
        {confirmPassword !== undefined && onConfirmPasswordChange && (
          <InputField
            id="confirmPassword"
            label="비밀번호 확인"
            value={confirmPassword}
            onChange={onConfirmPasswordChange}
            placeholder="비밀번호 재입력"
            type="password"
            required
          />
        )}
        
        {error && (
          <div className="text-red-500 text-sm mt-2">
            {error}
          </div>
        )}
        
        <div className="mt-6">
          <Button
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? loadingLabel : submitLabel}
          </Button>
        </div>
        
        {alternativeAction && (
          <div className="text-center mt-4">
            <p className="text-sm text-gray-600">{alternativeAction.label}</p>
            <button 
              type="button" 
              onClick={alternativeAction.onClick}
              className="text-blue-600 text-sm font-medium"
            >
              {alternativeAction.buttonText}
            </button>
          </div>
        )}
      </form>
      
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={onToastClose}
        />
      )}
    </>
  );
}