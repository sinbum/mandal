import React from 'react';
import { cn } from '@/lib/utils';
import { designUtils } from '@/design-system/utils';

interface InputFieldProps {
  id: string;
  label: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search';
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  maxLength?: number;
  disabled?: boolean;
  className?: string;
  // 접근성 개선
  'aria-describedby'?: string;
  'aria-label'?: string;
  helperText?: string;
  // 모바일 최적화
  inputMode?: 'none' | 'text' | 'tel' | 'url' | 'email' | 'numeric' | 'decimal' | 'search';
  autoComplete?: string;
  // 유효성 검사
  pattern?: string;
  // 오류 상태
  invalid?: boolean;
  // 알림
  showRequired?: boolean;
  // 포커스 제어
  autoFocus?: boolean;
  // 아이콘
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  // 제어
  readOnly?: boolean;
}

const InputField: React.FC<InputFieldProps> = ({
  id,
  label,
  type = 'text',
  value,
  onChange,
  placeholder = '',
  required = false,
  error,
  maxLength,
  disabled = false,
  className = '',
  'aria-describedby': ariaDescribedby,
  'aria-label': ariaLabel,
  helperText,
  inputMode,
  autoComplete,
  pattern,
  invalid,
  showRequired = true,
  autoFocus = false,
  leftIcon,
  rightIcon,
  readOnly = false,
  ...props
}) => {
  // 오류 상태 결정
  const hasError = Boolean(error) || invalid;
  
  // 유니크 ID 생성
  const errorId = hasError ? `${id}-error` : undefined;
  const helperId = helperText ? `${id}-helper` : undefined;
  const counterId = maxLength ? `${id}-counter` : undefined;
  
  // aria-describedby 조합
  const describedBy = [
    ariaDescribedby,
    errorId,
    helperId,
    counterId,
  ].filter(Boolean).join(' ') || undefined;
  
  // 접근성 props 생성
  const a11yProps = designUtils.a11y.createAriaProps({
    label: ariaLabel,
    describedBy,
    invalid: hasError,
    required,
    disabled,
  });
  
  // 모바일 최적화 props
  const mobileProps = {
    inputMode: inputMode || getMobileInputMode(type),
    autoComplete: autoComplete || getAutoComplete(type),
  };
  
  return (
    <div className={cn("space-y-2", className)}>
      {/* 레이블 */}
      <label 
        htmlFor={id} 
        className={cn(
          "block text-sm font-medium text-foreground",
          disabled && "text-muted-foreground",
          required && "after:content-['*'] after:ml-0.5 after:text-error"
        )}
      >
        {label}
        {required && !showRequired && (
          <span className="sr-only">(필수)</span>
        )}
      </label>
      
      {/* 입력 그룹 */}
      <div className="relative">
        {/* 왼쪽 아이콘 */}
        {leftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            {React.cloneElement(leftIcon as React.ReactElement, {
              'aria-hidden': true,
              className: cn('size-4', (leftIcon as React.ReactElement).props?.className)
            })}
          </div>
        )}
        
        {/* 입력 필드 */}
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          maxLength={maxLength}
          disabled={disabled}
          readOnly={readOnly}
          pattern={pattern}
          autoFocus={autoFocus}
          className={cn(
            // 기본 스타일
            "w-full px-3 py-2.5 text-base rounded-md border transition-colors",
            // 포커스 스타일
            "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary",
            // 상태별 스타일
            hasError ? [
              "border-error text-error",
              "focus:ring-error/20 focus:border-error",
              "placeholder:text-error/60"
            ] : [
              "border-gray-300 text-foreground",
              "focus:ring-primary/20 focus:border-primary",
              "placeholder:text-muted-foreground"
            ],
            disabled && [
              "bg-gray-100 text-muted-foreground cursor-not-allowed",
              "border-gray-200"
            ],
            readOnly && [
              "bg-gray-50 cursor-default",
              "focus:ring-0 focus:border-gray-300"
            ],
            // 아이콘 여백
            leftIcon && "pl-10",
            rightIcon && "pr-10",
            // 다크 모드
            "dark:bg-background dark:border-gray-600 dark:text-foreground",
            "dark:focus:border-primary dark:focus:ring-primary/20",
            hasError && "dark:border-error dark:focus:border-error dark:focus:ring-error/20",
            // 모바일 최적화
            "touch-target",
            "text-base", // iOS 자동 줌 방지
            // 모션 감소 설정
            "motion-reduce:transition-none"
          )}
          {...mobileProps}
          {...a11yProps}
          {...props}
        />
        
        {/* 오른쪽 아이콘 */}
        {rightIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            {React.cloneElement(rightIcon as React.ReactElement, {
              'aria-hidden': true,
              className: cn('size-4', (rightIcon as React.ReactElement).props?.className)
            })}
          </div>
        )}
      </div>
      
      {/* 도움말 텍스트 */}
      {helperText && !hasError && (
        <p id={helperId} className="text-sm text-muted-foreground">
          {helperText}
        </p>
      )}
      
      {/* 오류 메시지 */}
      {hasError && (
        <div className="flex items-start gap-1">
          <svg 
            className="size-4 text-error shrink-0 mt-0.5" 
            fill="currentColor" 
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <p id={errorId} className="text-sm text-error">
            {error}
          </p>
        </div>
      )}
      
      {/* 글자 수 카운터 */}
      {maxLength && (
        <div id={counterId} className="flex justify-end">
          <span className={cn(
            "text-xs",
            value.length > maxLength * 0.9 ? "text-warning" : "text-muted-foreground",
            value.length >= maxLength && "text-error"
          )}>
            {value.length} / {maxLength}
          </span>
        </div>
      )}
    </div>
  );
};

// 모바일 입력 모드 결정
function getMobileInputMode(type: string): string {
  switch (type) {
    case 'email':
      return 'email';
    case 'tel':
      return 'tel';
    case 'number':
      return 'numeric';
    case 'url':
      return 'url';
    case 'search':
      return 'search';
    default:
      return 'text';
  }
}

// 자동 완성 결정
function getAutoComplete(type: string): string {
  switch (type) {
    case 'email':
      return 'email';
    case 'tel':
      return 'tel';
    case 'password':
      return 'current-password';
    case 'url':
      return 'url';
    default:
      return 'off';
  }
}

export default InputField;