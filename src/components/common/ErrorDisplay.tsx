import React from 'react';
import { Button } from '@/components/ui/Button';
import { useTranslations } from 'next-intl';

interface ErrorDisplayProps {
  error: string;
  title?: string;
  onRetry?: () => void;
  onGoBack?: () => void;
}

export default function ErrorDisplay({
  error,
  title,
  onRetry,
  onGoBack
}: ErrorDisplayProps) {
  const t = useTranslations('errors');

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">{title || t('errorOccurred')}</h1>
        <p className="text-gray-700 mb-6">{error}</p>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {onRetry && (
            <Button onClick={onRetry} variant="default" size="sm">
              {t('retry')}
            </Button>
          )}
          {onGoBack && (
            <Button onClick={onGoBack} variant="outline" size="sm">
              {t('goBack')}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}