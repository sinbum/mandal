import React from 'react';
import { Button } from '@/components/ui/Button';

interface ErrorDisplayProps {
  error: string;
  title?: string;
  onRetry?: () => void;
  onGoBack?: () => void;
}

export default function ErrorDisplay({ 
  error, 
  title = '오류 발생', 
  onRetry, 
  onGoBack 
}: ErrorDisplayProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">{title}</h1>
        <p className="text-gray-700 mb-6">{error}</p>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {onRetry && (
            <Button onClick={onRetry} variant="default" size="sm">
              다시 시도
            </Button>
          )}
          {onGoBack && (
            <Button onClick={onGoBack} variant="outline" size="sm">
              돌아가기
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}