import React, { useEffect, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { SlideUpPanelProps } from '@/types/ui';
import { LAYOUT } from '@/lib/constants';
import { savePanelHeight, getPanelHeight } from '@/utils/cookies';

const SlideUpPanel: React.FC<SlideUpPanelProps> = ({
  isOpen,
  onClose,
  children,
  title,
  height = LAYOUT.SLIDEUP_MIN_HEIGHT,
  className = '',
}) => {
  const t = useTranslations('common');
  const tPanel = useTranslations('slideUpPanel');
  const panelRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  
  // 터치 기기 감지
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  
  // 드래그 리사이즈를 위한 상태
  const [panelHeight, setPanelHeight] = useState<number>(() => {
    return typeof height === 'number' ? height : 400;
  });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartY, setDragStartY] = useState(0);
  const [dragStartHeight, setDragStartHeight] = useState(0);
  
  // 드래그하여 닫기를 위한 상태
  const [isDragClosing, setIsDragClosing] = useState(false);
  const [currentPanelY, setCurrentPanelY] = useState(0);
  const [dragType, setDragType] = useState<'resize' | 'close' | null>(null);

  // 터치 기기 감지
  useEffect(() => {
    const checkTouchDevice = () => {
      setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
    };
    
    checkTouchDevice();
    window.addEventListener('resize', checkTouchDevice);
    
    return () => {
      window.removeEventListener('resize', checkTouchDevice);
    };
  }, []);

  // 컴포넌트 마운트 시 저장된 높이 가져오기
  useEffect(() => {
    if (isOpen) {
      const savedHeight = getPanelHeight(typeof height === 'number' ? height : 400);
      setPanelHeight(savedHeight);
    }
  }, [isOpen, height]);

  // 드래그 핸들러들
  const handleDragStart = useCallback((event: React.PointerEvent | React.TouchEvent, source: 'handle' | 'content' = 'handle') => {
    // 터치 이벤트가 아닌 경우 (마우스 등) content에서의 드래그는 무시
    if (source === 'content' && !('touches' in event)) {
      return;
    }
    
    setIsDragging(true);
    const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY;
    setDragStartY(clientY);
    setDragStartHeight(panelHeight);
    setCurrentPanelY(0);
    
    // 드래그 타입 결정 (핸들에서 시작하면 리사이즈, 콘텐츠에서 시작하면 닫기)
    setDragType(source === 'handle' ? 'resize' : 'close');
    
    // 포인터 캡처 설정 (마우스인 경우에만)
    if ('setPointerCapture' in event.currentTarget) {
      (event.currentTarget as HTMLElement).setPointerCapture((event as React.PointerEvent).pointerId);
    }
  }, [panelHeight]);

  const handleDragMove = useCallback((event: React.PointerEvent | React.TouchEvent) => {
    if (!isDragging) return;
    
    const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY;
    const deltaY = clientY - dragStartY; // 아래로 드래그하면 양수
    
    if (dragType === 'resize') {
      // 리사이즈 모드: 핸들을 드래그하여 높이 조절
      const newHeight = Math.max(200, Math.min(dragStartHeight - deltaY, window.innerHeight * 0.9));
      setPanelHeight(newHeight);
    } else if (dragType === 'close') {
      // 닫기 모드: 패널을 아래로 드래그하여 닫기
      if (deltaY > 0) { // 아래로 드래그할 때만
        setCurrentPanelY(deltaY);
        setIsDragClosing(true);
      } else {
        setCurrentPanelY(0);
        setIsDragClosing(false);
      }
    }
  }, [isDragging, dragStartY, dragStartHeight, dragType]);

  const handleDragEnd = useCallback(() => {
    if (!isDragging) return;
    
    if (dragType === 'resize') {
      // 리사이즈 완료
      savePanelHeight(panelHeight);
    } else if (dragType === 'close') {
      // 닫기 임계점 체크 (패널 높이의 25% 이상 드래그하면 닫기)
      const closeThreshold = panelHeight * 0.25;
      if (currentPanelY > closeThreshold) {
        onClose();
      }
      // 패널 위치 초기화
      setCurrentPanelY(0);
      setIsDragClosing(false);
    }
    
    setIsDragging(false);
    setDragType(null);
  }, [isDragging, dragType, panelHeight, currentPanelY, onClose]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    
    // 패널이 열리면 body의 스크롤을 방지하되, 레이아웃 시프트 방지
    if (isOpen) {
      // 현재 스크롤바 너비 계산
      const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
      
      // 원래 스타일 저장
      const originalOverflow = document.body.style.overflow;
      const originalPaddingRight = document.body.style.paddingRight;
      
      // 스크롤 막고 패딩으로 보상
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = `${scrollBarWidth}px`;
      
      // cleanup 함수에서 원래 스타일 복원하도록 ref에 저장
      return () => {
        document.body.style.overflow = originalOverflow;
        document.body.style.paddingRight = originalPaddingRight;
      };
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // 유리 효과(glass effect)용 스타일
  const glassStyle = {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)', // Safari 지원
  };

  const overlayStyle = {
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    backdropFilter: 'blur(2px)',
    WebkitBackdropFilter: 'blur(2px)', // Safari 지원
  };

  const slideUpStyles = {
    panel: `
      fixed bottom-0 left-0 right-0
      rounded-t-2xl shadow-xl
      border-t border-l border-r border-gray-200
      ${className}
    `,
    overlay: `
      fixed inset-0
    `,
    dragHandle: `
      w-12 h-2 mx-auto my-3 rounded-full bg-gray-300 cursor-ns-resize select-none
      ${isDragging && dragType === 'resize' ? 'bg-primary-400' : 'hover:bg-gray-400'}
      transition-colors duration-200
    `,
    header: `
      px-4 py-3 border-b border-gray-200 flex justify-between items-center
    `,
    title: `
      font-semibold text-lg
    `,
    closeButton: `
      text-gray-500 hover:text-gray-700 focus:outline-none
    `,
    content: `
      p-4 overflow-y-auto
    `
  };

  const panelContent = (
    <>
      <motion.div 
        ref={overlayRef}
        className={slideUpStyles.overlay}
        style={overlayStyle}
        onClick={onClose}
        aria-hidden="true"
        initial={{ opacity: 0 }}
        animate={{ 
          opacity: isOpen ? (isDragClosing ? Math.max(0.1, 1 - (currentPanelY / panelHeight * 2)) : 1) : 0 
        }}
        transition={isDragging ? { type: 'tween', duration: 0 } : { duration: 0.3 }}
      />
      <motion.div
        ref={panelRef}
        className={slideUpStyles.panel}
        style={{ 
          ...glassStyle,
          height: `${panelHeight}px`,
          maxHeight: '90vh'
        }}
        role="dialog"
        aria-modal="true"
        initial={{ y: '100%' }}
        animate={{ 
          y: isOpen ? (isDragClosing ? currentPanelY : 0) : '100%',
          opacity: isDragClosing ? Math.max(0.3, 1 - (currentPanelY / panelHeight)) : 1
        }}
        transition={isDragging ? { type: 'tween', duration: 0 } : { 
          type: 'spring',
          damping: 30,
          stiffness: 300,
          duration: 0.5
        }}
        onPointerMove={handleDragMove}
        onPointerUp={handleDragEnd}
        onTouchMove={handleDragMove}
        onTouchEnd={handleDragEnd}
        drag={false}
      >
        <div 
          className={slideUpStyles.dragHandle}
          onPointerDown={(e) => handleDragStart(e, 'handle')}
          onTouchStart={(e) => handleDragStart(e, 'handle')}
          style={{
            touchAction: 'none', // 터치 스크롤 방지
          }}
        >
          {/* 드래그 힌트 (첫 방문 시에만 보이도록 하거나 선택적으로 표시) */}
          {!title && (
            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-xs text-gray-400 whitespace-nowrap">
              {isDragClosing ? tPanel('releaseToClose') : tPanel('resizeHint')}
            </div>
          )}
        </div>
        
        {title && (
          <div className={slideUpStyles.header}>
            <div className={slideUpStyles.title}>
              {title}
              {/* 드래그하여 닫기 힌트 */}
              {isDragClosing && (
                <span className="ml-2 text-xs text-gray-500 animate-pulse">
                  {tPanel('pullToClose')}
                </span>
              )}
            </div>
            <button
              type="button"
              className={slideUpStyles.closeButton}
              onClick={onClose}
              aria-label={t('close')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        
        <div 
          className={slideUpStyles.content}
          style={{
            height: `${panelHeight - (title ? 120 : 60)}px`, // 헤더와 드래그 핸들 높이 제외
          }}
          {...(isTouchDevice && {
            onPointerDown: (e) => {
              // 터치 기기에서만 스크롤이 맨 위에 있을 때만 드래그하여 닫기 활성화
              const target = e.currentTarget;
              if (target.scrollTop === 0) {
                handleDragStart(e, 'content');
              }
            },
            onTouchStart: (e) => {
              // 터치 기기에서만 스크롤이 맨 위에 있을 때만 드래그하여 닫기 활성화
              const target = e.currentTarget;
              if (target.scrollTop === 0) {
                handleDragStart(e, 'content');
              }
            }
          })}
        >
          {children}
        </div>
      </motion.div>
    </>
  );

  // Portal을 사용하여 body에 직접 렌더링
  return typeof window !== 'undefined' 
    ? createPortal(panelContent, document.body)
    : null;
};

export default SlideUpPanel;
