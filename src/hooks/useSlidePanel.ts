import { useState, useCallback } from 'react';

interface UseSlidePanelResult {
  isOpen: boolean;
  openPanel: () => void;
  closePanel: () => void;
  togglePanel: () => void;
}

/**
 * 슬라이드 패널의 열림/닫힘 상태를 관리하는 훅
 */
const useSlidePanel = (initialState: boolean = false): UseSlidePanelResult => {
  const [isOpen, setIsOpen] = useState<boolean>(initialState);

  const openPanel = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closePanel = useCallback(() => {
    setIsOpen(false);
  }, []);

  const togglePanel = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  return {
    isOpen,
    openPanel,
    closePanel,
    togglePanel
  };
};

export default useSlidePanel;
