import React from 'react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  message?: string;
  fullScreen?: boolean;
}

/**
 * 현대적인 로딩 스피너 컴포넌트
 */
const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  message = '로딩 중...',
  fullScreen = true 
}) => {
  const t = useTranslations('common');
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  const dotSizes = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3', 
    lg: 'w-4 h-4'
  };

  const containerClass = fullScreen 
    ? "flex flex-col justify-center items-center min-h-screen bg-gray-50/80 backdrop-blur-sm"
    : "flex flex-col justify-center items-center p-8";

  return (
    <div className={containerClass}>
      {/* 만다라트 스타일 로딩 애니메이션 */}
      <div className={`relative ${sizeClasses[size]} mb-4`}>
        {/* 중앙 원 */}
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-blue-200"
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        />
        
        {/* 회전하는 그라디언트 원 */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: 'conic-gradient(from 0deg, transparent, #3b82f6, transparent)',
            mask: 'radial-gradient(farthest-side, transparent calc(100% - 2px), black calc(100% - 2px))'
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />

        {/* 중앙 9개 점 (만다라트 그리드) */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="grid grid-cols-3 gap-1">
            {[...Array(9)].map((_, i) => (
              <motion.div
                key={i}
                className={`${dotSizes[size]} bg-blue-500 rounded-full`}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ 
                  scale: [0, 1, 0],
                  opacity: [0, 1, 0]
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.1,
                  ease: "easeInOut"
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* 로딩 메시지 */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-center"
      >
        <p className="text-gray-600 font-medium mb-1">{message || t('loading')}</p>
        
        {/* 로딩 도트 애니메이션 */}
        <div className="flex justify-center gap-1">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="w-1.5 h-1.5 bg-blue-500 rounded-full"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: i * 0.2
              }}
            />
          ))}
        </div>
      </motion.div>

      <span className="sr-only">{message}</span>
    </div>
  );
};

export default LoadingSpinner; 