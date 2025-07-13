import React from 'react';
import { useParams } from 'next/navigation';

interface LocalizedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

/**
 * 언어별 모바일 키보드 최적화를 위한 Input 컴포넌트
 */
export function LocalizedInput({ type = "text", className = "", ...props }: LocalizedInputProps) {
  const params = useParams();
  const locale = params?.locale as string || 'ko';

  // 언어별 입력 모드 설정
  const getInputMode = (): React.HTMLAttributes<HTMLInputElement>['inputMode'] => {
    if (type === 'email') return 'email';
    if (type === 'tel') return 'tel';
    if (type === 'number') return 'numeric';
    if (type === 'url') return 'url';
    
    // 언어별 텍스트 입력 최적화
    switch (locale) {
      case 'ko':
        return 'text'; // 한글 입력 지원
      case 'ja':
        return 'text'; // 히라가나/가타카나 입력 지원
      case 'en':
      default:
        return 'text'; // 영문 입력
    }
  };

  // 언어별 자동완성 설정
  const getAutoComplete = (): string => {
    // 한국어와 일본어는 자동완성을 비활성화하여 IME 입력 개선
    if (locale === 'ko' || locale === 'ja') {
      return 'off';
    }
    return props.autoComplete || 'on';
  };

  // 언어별 spell check 설정
  const getSpellCheck = (): boolean => {
    // 한국어와 일본어는 맞춤법 검사 비활성화
    if (locale === 'ko' || locale === 'ja') {
      return false;
    }
    return props.spellCheck !== undefined ? props.spellCheck : true;
  };

  return (
    <input
      {...props}
      type={type}
      inputMode={getInputMode()}
      autoComplete={getAutoComplete()}
      spellCheck={getSpellCheck()}
      lang={locale}
      className={`
        w-full px-3 py-2 border border-gray-300 rounded-lg
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
        transition-colors duration-200
        ${className}
      `}
    />
  );
}

export default LocalizedInput;