import { useCallback, useRef } from 'react';

interface LongPressOptions {
  onLongPress: () => void;
  onClick?: () => void;
  delay?: number;
}

/**
 * Long press 제스처를 감지하는 커스텀 훅
 * @param options - long press 옵션
 * @returns event handlers
 */
export const useLongPress = ({ 
  onLongPress, 
  onClick, 
  delay = 600 
}: LongPressOptions) => {
  const timeoutRef = useRef<number | null>(null);
  const isLongPressRef = useRef(false);

  const start = useCallback(() => {
    isLongPressRef.current = false;
    timeoutRef.current = window.setTimeout(() => {
      isLongPressRef.current = true;
      onLongPress();
    }, delay);
  }, [onLongPress, delay]);

  const clear = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const clickHandler = useCallback(() => {
    if (!isLongPressRef.current && onClick) {
      onClick();
    }
    isLongPressRef.current = false;
  }, [onClick]);

  return {
    // 마우스 이벤트
    onMouseDown: start,
    onMouseUp: clear,
    onMouseLeave: clear,
    // 터치 이벤트
    onTouchStart: start,
    onTouchEnd: clear,
    onTouchCancel: clear,
    // 클릭 이벤트
    onClick: clickHandler,
  };
}; 