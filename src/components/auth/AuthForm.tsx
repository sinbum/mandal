import React from 'react';
import {useTranslations} from 'next-intl';
import { Button } from '@/components/ui/Button';
import InputField from '@/components/ui/InputField';

interface AuthFormProps {
  pageName: 'login' | 'signup';
  email: string;
  password: string;
  confirmPassword?: string;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onConfirmPasswordChange?: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  error: string | null;
  submitLabel: string;
  loadingLabel: string;
  alternativeAction?: {
    label: string;
    buttonText: string;
    onClick: () => void;
  };
}

export default function AuthForm({
  pageName,
  email,
  password,
  confirmPassword,
  onEmailChange,
  onPasswordChange,
  onConfirmPasswordChange,
  onSubmit,
  isLoading,
  submitLabel,
  loadingLabel,
  alternativeAction,
}: AuthFormProps) {
  const t = useTranslations(`auth.${pageName}`);

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <InputField
        id="email"
        label={t('email')}
        value={email}
        onChange={onEmailChange}
        placeholder={t('email')}
        type="email"
        required
      />
      
      <InputField
        id="password"
        label={t('password')}
        value={password}
        onChange={onPasswordChange}
        placeholder={t('password')}
        type="password"
        required
      />
      
      {confirmPassword !== undefined && onConfirmPasswordChange && (
        <InputField
          id="confirmPassword"
          label={t('confirmPassword')}
          value={confirmPassword}
          onChange={onConfirmPasswordChange}
          placeholder={t('confirmPassword')}
          type="password"
          required
        />
      )}
      
      <div className="pt-4">
        <Button
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? loadingLabel : submitLabel}
        </Button>
      </div>
      
      {alternativeAction && (
        <div className="text-center pt-3">
          <p className="text-sm text-gray-600">{alternativeAction.label}</p>
          <button 
            type="button" 
            onClick={alternativeAction.onClick}
            className="text-blue-600 text-sm font-medium mt-1"
          >
            {alternativeAction.buttonText}
          </button>
        </div>
      )}
    </form>
  );
}