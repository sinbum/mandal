import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { SlideUpPanelProps } from '@/types/ui';
import { LAYOUT } from '@/lib/constants';

const SlideUpPanel: React.FC<SlideUpPanelProps> = ({
  isOpen,
  onClose,
  children,
  title,
  height = LAYOUT.SLIDEUP_MIN_HEIGHT,
  className = '',
}) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    
    // 패널이 열리면 body의 스크롤을 방지
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
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
      transform transition-all duration-300 ease-in-out
      ${isOpen ? 'translate-y-0' : 'translate-y-full'}
      border-t border-l border-r border-gray-200
      ${className}
    `,
    overlay: `
      fixed inset-0
      transition-opacity duration-300
    `,
    dragHandle: `
      w-12 h-1.5 mx-auto my-3 rounded-full bg-gray-300
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
      p-4 overflow-y-auto max-h-[70vh]
    `
  };

  const panelContent = (
    <>
      <div 
        ref={overlayRef}
        className={slideUpStyles.overlay}
        style={overlayStyle}
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={panelRef}
        className={slideUpStyles.panel}
        style={{ 
          ...glassStyle,
          height: height === 'auto' ? 'auto' : (typeof height === 'number' ? `${height}px` : height),
          maxHeight: '80vh'
        }}
        role="dialog"
        aria-modal="true"
      >
        <div className={slideUpStyles.dragHandle} />
        
        {title && (
          <div className={slideUpStyles.header}>
            <div className={slideUpStyles.title}>{title}</div>
            <button
              type="button"
              className={slideUpStyles.closeButton}
              onClick={onClose}
              aria-label="닫기"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        
        <div className={slideUpStyles.content}>
          {children}
        </div>
      </div>
    </>
  );

  // Portal을 사용하여 body에 직접 렌더링
  return typeof window !== 'undefined' 
    ? createPortal(panelContent, document.body)
    : null;
};

export default SlideUpPanel;
