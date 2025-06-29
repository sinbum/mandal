import React, { ReactNode, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface ModalContainerProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
  overlayClassName?: string;
  closeOnOverlayClick?: boolean;
}

const ModalContainer: React.FC<ModalContainerProps> = ({
  isOpen,
  onClose,
  children,
  className = '',
  overlayClassName = '',
  closeOnOverlayClick = true,
}) => {
  // ESC 키로 모달 닫기
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    // 모달이 열릴 때 body 스크롤 방지
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const modalContent = (
    <>
      {/* 배경 오버레이 */}
      <div 
        className={`fixed inset-0 backdrop-blur-sm bg-black/50 animate-in fade-in duration-200 ${overlayClassName}`}
        onClick={closeOnOverlayClick ? onClose : undefined}
      />
      {/* 모달 컨텐츠 */}
      <div className={`fixed inset-0 flex items-center justify-center p-4 overflow-y-auto pointer-events-none ${className}`}>
        <div className="pointer-events-auto">
          {children}
        </div>
      </div>
    </>
  );

  // Portal을 사용하여 body에 직접 렌더링
  return typeof window !== 'undefined' 
    ? createPortal(modalContent, document.body)
    : null;
};

export default ModalContainer;
