import React, { useState, ChangeEvent, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useTranslations } from 'next-intl';
import { CellEditorFormProps } from '@/types/mandalart';
import { LIMITS } from '@/lib/constants';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/TextArea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from '../../ui/card';
import ColorPalette from '../../ui/ColorPalette';

const CellEditorForm: React.FC<CellEditorFormProps> = ({
  cell,
  onSave,
  onCancel,
  isNewCell = false,
}) => {
  const [topic, setTopic] = useState(cell.topic || '');
  const [memo, setMemo] = useState(cell.memo || '');
  const [color, setColor] = useState(cell.color || '');
  const [imageUrl] = useState(cell.imageUrl || '');
  const [isCompleted, setIsCompleted] = useState(cell.isCompleted || false);
  const [isMobile, setIsMobile] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showMemoInput, setShowMemoInput] = useState(!!cell.memo || false);

  // 주제 입력 필드 참조
  const topicInputRef = useRef<HTMLInputElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const colorPickerRef = useRef<HTMLDivElement>(null);
  const memoInputRef = useRef<HTMLTextAreaElement>(null);

  // 모바일 환경 감지 및 키보드 처리
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768 || 'ontouchstart' in window);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    // 모바일 키보드 감지
    if (isMobile) {
      const handleViewportChange = () => {
        if (typeof window !== 'undefined') {
          const viewportHeight = window.visualViewport?.height || window.innerHeight;
          const windowHeight = window.innerHeight;
          const heightDiff = windowHeight - viewportHeight;
          
          if (heightDiff > 150) { // 키보드가 올라왔다고 판단
            setKeyboardHeight(heightDiff);
          } else {
            setKeyboardHeight(0);
          }
        }
      };

      window.visualViewport?.addEventListener('resize', handleViewportChange);
      window.addEventListener('resize', handleViewportChange);
      
      return () => {
        window.visualViewport?.removeEventListener('resize', handleViewportChange);
        window.removeEventListener('resize', handleViewportChange);
      };
    }

    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, [isMobile]);

  // 컴포넌트 마운트 시 주제 입력 필드에 포커스 (한 번만 실행)
  useEffect(() => {
    const focusInput = () => {
      if (topicInputRef.current) {
        // 약간의 지연 후 포커스 (모달 애니메이션 완료 후)
        setTimeout(() => {
          topicInputRef.current?.focus();
          // 새 셀인 경우에만 커서를 끝으로 이동
          if (isNewCell && topicInputRef.current) {
            topicInputRef.current.setSelectionRange(
              topicInputRef.current.value.length,
              topicInputRef.current.value.length
            );
          }
        }, 300);
      }
    };

    focusInput();
  }, [isNewCell]); // isNewCell 의존성 추가

  // 색상 선택기 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (colorPickerRef.current && !colorPickerRef.current.contains(event.target as Node)) {
        setShowColorPicker(false);
      }
    };

    if (showColorPicker) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showColorPicker]);

  // 메모 입력 토글 시 포커스
  useEffect(() => {
    if (showMemoInput && memoInputRef.current) {
      setTimeout(() => {
        memoInputRef.current?.focus();
      }, 100);
    }
  }, [showMemoInput]);

  // 저장 로직을 별도 함수로 분리
  const saveCell = () => {
    // 디버깅 로그 추가
    console.log('저장 시도:', {
      cellId: cell.id,
      originalCell: cell,
      updatedValues: {
        id: cell.id,
        topic,
        memo,
        color,
        imageUrl,
        isCompleted,
      }
    });
    
    onSave({
      ...cell,
      id: cell.id,
      topic,
      memo,
      color,
      imageUrl,
      isCompleted,
    });
  };

  // 폼 제출 핸들러
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveCell();
  };

  // 엔터키 처리 개선 (onKeyDown 사용)
  const handleTopicKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      
      if (topic.trim()) {
        // 엔터키로 바로 생성/저장
        saveCell();
      }
    }
  };

  // 색상 선택 핸들러
  const handleColorSelect = (selectedColor: string) => {
    setColor(selectedColor);
    setShowColorPicker(false);
  };

  // 메모 토글 핸들러
  const handleMemoToggle = () => {
    setShowMemoInput(!showMemoInput);
    if (showMemoInput) {
      // 메모 입력을 닫을 때 메모 내용도 초기화
      setMemo('');
    }
  };

  // 키보드 높이에 따른 모달 위치 조정
  const getModalStyle = () => {
    if (isMobile && keyboardHeight > 0) {
      return {
        paddingBottom: `${keyboardHeight}px`,
        alignItems: 'flex-start',
        paddingTop: '20px',
      };
    }
    return {
      alignItems: 'center',
    };
  };

  // 색상 팝업 위치 계산
  const getColorPickerPosition = () => {
    // 모든 환경에서 오른쪽 기준으로 왼쪽으로 나오게 설정
    return {
      left: 'auto',
      right: '0',
      transform: 'translateX(0)',
    };
  };

  const modalContent = (
    <>
      {/* 배경 오버레이 */}
      <div 
        className="fixed inset-0 backdrop-blur-sm bg-black/50 animate-in fade-in duration-200"
        onClick={onCancel}
      />
      {/* 모달 컨텐츠 */}
      <div 
        className="fixed inset-0 flex justify-center p-4 overflow-y-auto pointer-events-none"
        style={getModalStyle()}
      >
        <Card 
          ref={cardRef}
          className={`relative w-full max-w-lg bg-white shadow-2xl rounded-2xl border-gray-200 my-8 pointer-events-auto transform transition-all duration-300 ease-in-out scale-95 animate-in fade-in-90 slide-in-from-bottom-10 ${
            isMobile ? 'mx-2' : ''
          }`}
        >
          <form onSubmit={handleSubmit}>
            <CardHeader className="mb-4 relative">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold">
                  {isNewCell ? t('createNewCell') : t('editCell')}
                </CardTitle>
                {/* 색상 선택 동그라미 버튼 */}
                <div className="relative" ref={colorPickerRef}>
                  <button
                    type="button"
                    onClick={() => setShowColorPicker(!showColorPicker)}
                    className={`${
                      isMobile ? 'w-11 h-11' : 'w-9 h-9'
                    } rounded-full border-2 border-gray-300 shadow-md hover:shadow-lg transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 active:scale-95`}
                    style={{ 
                      backgroundColor: color || '#f3f4f6',
                      borderColor: color ? 'transparent' : '#d1d5db'
                    }}
                    aria-label="배경 색상 선택"
                    aria-expanded={showColorPicker}
                    aria-haspopup="true"
                  >
                    {!color && (
                      <div className="w-full h-full rounded-full bg-gradient-to-br from-red-400 via-yellow-400 to-blue-400 opacity-60"></div>
                    )}
                  </button>
                  
                  {/* 색상 선택 팝업 */}
                  {showColorPicker && (
                    <div 
                      className="absolute top-full mt-2 p-4 bg-white rounded-lg shadow-xl border border-gray-200 z-50 animate-in fade-in-0 zoom-in-95 duration-200"
                      style={{
                        ...getColorPickerPosition(),
                        width: '180px',
                      }}
                    >
                      <div className="text-sm text-gray-600 mb-3">배경 색상</div>
                      <ColorPalette
                        selectedColor={color}
                        onColorSelect={handleColorSelect}
                        className="w-full"
                      />
                    </div>
                  )}
                </div>
              </div>
              {isMobile && isNewCell && (
                <p className="text-sm text-gray-500 mt-2">
                  주제를 입력하고 엔터를 누르면 바로 생성됩니다
                </p>
              )}
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 주제 입력 */}
              <div className="space-y-2">
                <Label htmlFor="topic">주제</Label>
                <Input
                  ref={topicInputRef}
                  id="topic"
                  value={topic}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setTopic(e.target.value)}
                  onKeyDown={handleTopicKeyDown}
                  maxLength={LIMITS.TOPIC_MAX_LENGTH}
                  placeholder="텍스트 입력"
                  required
                  className={`${isMobile ? 'text-16px min-h-[44px]' : 'min-h-[40px]'} transition-all duration-200 focus:scale-[1.02] focus:shadow-md`}
                  autoComplete="off"
                  inputMode="text"
                  aria-label="셀 주제 입력"
                />
              </div>
              
              {/* 메모 토글 버튼 */}
              <div className="flex items-center justify-between">
                <Label>메모</Label>
                <button
                  type="button"
                  onClick={handleMemoToggle}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    isMobile ? 'min-h-[44px] min-w-[44px]' : 'min-h-[36px]'
                  } ${
                    showMemoInput 
                      ? 'bg-indigo-100 text-gray-800 hover:bg-indigo-200 focus:bg-indigo-200' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200 focus:bg-gray-200'
                  } hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
                  aria-label={showMemoInput ? '메모 입력 숨기기' : '메모 입력 추가'}
                  aria-expanded={showMemoInput}
                >
                  <span>{showMemoInput ? '메모 숨기기' : '메모 추가'}</span>
                  <svg 
                    className={`w-4 h-4 transition-transform duration-200 ${showMemoInput ? 'rotate-180' : ''}`}
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
              
              {/* 메모 입력 (토글) */}
              {showMemoInput && (
                <div className="space-y-2 animate-in slide-in-from-top-2 fade-in-0 duration-300">
                  <Textarea
                    ref={memoInputRef}
                    id="memo"
                    value={memo}
                    onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setMemo(e.target.value)}
                    placeholder="메모를 입력하세요"
                    rows={isMobile ? 3 : 4}
                    className={`${isMobile ? 'text-16px min-h-[44px]' : 'min-h-[40px]'} transition-all duration-200 focus:scale-[1.01] focus:shadow-md`}
                    aria-label="셀 메모 입력"
                  />
                </div>
              )}
              
              {/* 완료 체크박스 */}
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="completed"
                  checked={isCompleted}
                  onCheckedChange={(checked: boolean) => setIsCompleted(checked)}
                  className={`${isMobile ? 'w-6 h-6' : 'w-5 h-5'} transition-all duration-200 hover:scale-110 focus:scale-110`}
                  aria-label="완료 상태 체크"
                />
                <Label 
                  htmlFor="completed"
                  className={`${isMobile ? 'text-base' : 'text-sm'} cursor-pointer select-none`}
                >
                  완료 표시
                </Label>
              </div>
            </CardContent>
            
            <CardFooter className={`flex justify-end space-x-3 ${isMobile ? 'pb-6' : ''}`}>
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className={`${isMobile ? 'min-h-[48px] min-w-[48px] px-6' : 'min-h-[44px] px-4'} transition-all duration-200 hover:scale-105 active:scale-95 focus:scale-105`}
                aria-label="셀 편집 취소"
              >
                취소
              </Button>
              <Button
                type="submit"
                disabled={!topic.trim()}
                className={`${isMobile ? 'min-h-[48px] min-w-[48px] px-6' : 'min-h-[44px] px-4'} transition-all duration-200 hover:scale-105 active:scale-95 focus:scale-105 disabled:hover:scale-100`}
                aria-label={`셀 ${isNewCell ? '생성' : '저장'}`}
              >
                {isNewCell ? '생성' : '저장'}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </>
  );

  // Portal을 사용하여 body에 직접 렌더링
  return typeof window !== 'undefined' 
    ? createPortal(modalContent, document.body)
    : null;
};

export default CellEditorForm;
