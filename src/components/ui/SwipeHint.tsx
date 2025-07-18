'use client';

import React, { useEffect, useState } from 'react';
import { useSpring, animated, useTransition } from '@react-spring/web';
import { ChevronUp, ChevronDown } from 'lucide-react';

interface SwipeHintProps {
  className?: string;
  upText?: string;
  downText?: string;
  autoHide?: boolean;
  hideDelay?: number;
}

const SwipeHint: React.FC<SwipeHintProps> = ({
  className = '',
  upText = '위로 스와이프',
  downText = '아래로 스와이프',
  autoHide = true,
  hideDelay = 3000
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [pulseKey, setPulseKey] = useState(0);

  // 자동 숨김 기능
  useEffect(() => {
    if (autoHide) {
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, hideDelay);
      return () => clearTimeout(timer);
    }
  }, [autoHide, hideDelay]);

  // 주기적으로 펄스 애니메이션 트리거
  useEffect(() => {
    const interval = setInterval(() => {
      setPulseKey(prev => prev + 1);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // 메인 컨테이너 페이드 애니메이션
  const fadeSpring = useSpring({
    opacity: isVisible ? 1 : 0,
    transform: isVisible ? 'translateY(0px)' : 'translateY(10px)',
    config: { tension: 300, friction: 30 }
  });

  // 위쪽 화살표 애니메이션
  const upArrowSpring = useSpring({
    from: { transform: 'translateY(0px)', opacity: 0.6 },
    to: async (next) => {
      while (isVisible) {
        await next({ transform: 'translateY(-8px)', opacity: 1 });
        await next({ transform: 'translateY(0px)', opacity: 0.6 });
      }
    },
    config: { tension: 200, friction: 20 },
    loop: true
  });

  // 아래쪽 화살표 애니메이션 (위쪽과 반대)
  const downArrowSpring = useSpring({
    from: { transform: 'translateY(0px)', opacity: 0.6 },
    to: async (next) => {
      while (isVisible) {
        await next({ transform: 'translateY(8px)', opacity: 1 });
        await next({ transform: 'translateY(0px)', opacity: 0.6 });
      }
    },
    config: { tension: 200, friction: 20 },
    loop: true,
    delay: 500 // 위쪽 화살표와 다른 타이밍
  });

  // 텍스트 펄스 애니메이션
  const textPulseSpring = useSpring({
    from: { opacity: 0.7, transform: 'scale(1)' },
    to: { opacity: 1, transform: 'scale(1.05)' },
    config: { tension: 300, friction: 25 },
    reset: true,
    key: pulseKey
  });

  // 배경 글로우 애니메이션
  const glowSpring = useSpring({
    from: { opacity: 0.3 },
    to: { opacity: 0.7 },
    config: { tension: 200, friction: 40 },
    loop: { reverse: true }
  });

  if (!isVisible) return null;

  return (
    <animated.div 
      style={fadeSpring}
      className={`relative flex flex-col items-center justify-center ${className}`}
    >
      {/* 배경 글로우 효과 */}
      <animated.div 
        style={glowSpring}
        className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-lg"
      />
      
      {/* 메인 컨테이너 */}
      <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl px-4 py-3 shadow-lg border border-white/40">
        {/* 위쪽 화살표 */}
        <animated.div 
          style={upArrowSpring}
          className="flex justify-center mb-1"
        >
          <ChevronUp className="w-5 h-5 text-gray-600" />
        </animated.div>
        
        {/* 텍스트 */}
        <animated.div 
          style={textPulseSpring}
          className="text-center space-y-0.5"
        >
          <div className="text-xs font-medium text-gray-700">{upText}</div>
          <div className="text-xs font-medium text-gray-700">{downText}</div>
        </animated.div>
        
        {/* 아래쪽 화살표 */}
        <animated.div 
          style={downArrowSpring}
          className="flex justify-center mt-1"
        >
          <ChevronDown className="w-5 h-5 text-gray-600" />
        </animated.div>
      </div>
      
      {/* 손가락 제스처 힌트 (선택적) */}
      <div className="absolute -right-8 top-1/2 transform -translate-y-1/2">
        <animated.div 
          style={useSpring({
            from: { transform: 'translateY(0px) rotate(0deg)', opacity: 0.4 },
            to: async (next) => {
              while (isVisible) {
                await next({ transform: 'translateY(-6px) rotate(-5deg)', opacity: 0.8 });
                await next({ transform: 'translateY(6px) rotate(5deg)', opacity: 0.8 });
                await next({ transform: 'translateY(0px) rotate(0deg)', opacity: 0.4 });
              }
            },
            config: { tension: 150, friction: 20 },
            loop: true,
            delay: 1000
          })}
          className="text-2xl"
        >
          👆
        </animated.div>
      </div>
    </animated.div>
  );
};

export default SwipeHint;