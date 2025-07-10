import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { designUtils } from "@/design-system/utils"

const buttonVariants = cva(
  [
    // 기본 스타일
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium",
    // 상태 처리
    "disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed",
    // 아이콘 처리
    "[&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0",
    // 접근성 개선
    "outline-none focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2",
    "focus-visible:ring-2 focus-visible:ring-primary/20",
    // 터치 최적화
    "touch-target",
    // 에러 상태
    "aria-invalid:ring-2 aria-invalid:ring-error/20 aria-invalid:border-error",
    // 애니메이션
    "transition-all duration-200 ease-default",
    // 모바일 최적화
    "active-scale",
    // 호버 효과 (터치 디바이스 고려)
    "hover-lift",
  ],
  {
    variants: {
      variant: {
        default: [
          "text-primary-foreground shadow-sm text-gray-900",
          "hover:bg-primary/90 active:bg-primary/80",
          "focus-visible:ring-primary/20",
          "dark:bg-primary dark:hover:bg-primary/90 dark:active:bg-primary/80",
        ],
        destructive: [
          "bg-error text-white shadow-sm",
          "hover:bg-error-dark active:bg-error-dark",
          "focus-visible:ring-error/20",
          "dark:bg-error-dark dark:hover:bg-error-dark",
        ],
        outline: [
          "border border-gray-300 bg-background shadow-sm",
          "hover:bg-gray-50 active:bg-gray-100",
          "focus-visible:ring-gray-500/20",
          "dark:border-gray-600 dark:hover:bg-gray-800 dark:active:bg-gray-700",
        ],
        secondary: [
          "bg-gray-100 text-gray-900 shadow-sm",
          "hover:bg-gray-200 active:bg-gray-300",
          "focus-visible:ring-gray-500/20",
          "dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600 dark:active:bg-gray-500",
        ],
        ghost: [
          "bg-transparent text-gray-700",
          "hover:bg-gray-100 active:bg-gray-200",
          "focus-visible:ring-gray-500/20",
          "dark:text-gray-300 dark:hover:bg-gray-800 dark:active:bg-gray-700",
        ],
        link: [
          "text-primary-500 underline-offset-4",
          "hover:underline hover:text-primary-600",
          "focus-visible:ring-primary-500/20",
          "dark:text-primary-400 dark:hover:text-primary-300",
        ],
      },
      size: {
        sm: [
          "h-8 px-3 text-xs gap-1.5",
          "has-[>svg]:px-2.5",
          "min-w-[2rem]", // 최소 터치 타겟 보장
        ],
        default: [
          "h-11 px-4 py-2 text-sm", // 44px 터치 타겟
          "has-[>svg]:px-3",
          "min-w-[2.75rem]", // 최소 터치 타겟 보장
        ],
        lg: [
          "h-12 px-6 text-base", // 48px 터치 타겟
          "has-[>svg]:px-4",
          "min-w-[3rem]", // 최소 터치 타겟 보장
        ],
        icon: [
          "size-11", // 44px 터치 타겟
          "p-0",
        ],
      },
      loading: {
        true: "cursor-wait",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      loading: false,
    },
  }
)

interface ButtonProps extends React.ComponentProps<"button">, 
  VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
  loadingText?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  // 접근성 개선
  'aria-label'?: string;
  'aria-describedby'?: string;
  'aria-expanded'?: boolean;
  'aria-pressed'?: boolean;
}

function Button({
  className,
  variant,
  size,
  loading = false,
  loadingText,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  asChild = false,
  disabled,
  children,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button"
  
  // 로딩 상태나 disabled 상태 처리
  const isDisabled = disabled || loading;
  
  // 접근성 props 생성
  const a11yProps = designUtils.a11y.createAriaProps({
    disabled: isDisabled,
    ...props,
  });
  
  // 로딩 스피너 컴포넌트
  const LoadingSpinner = () => (
    <svg 
      className="animate-spin-slow size-4" 
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle 
        cx="12" 
        cy="12" 
        r="10" 
        stroke="currentColor" 
        strokeWidth="4" 
        fill="none" 
        strokeDasharray="32" 
        strokeDashoffset="32"
      />
    </svg>
  );
  
  // 아이콘 렌더링
  const renderIcon = () => {
    if (loading) {
      return <LoadingSpinner />;
    }
    if (icon) {
      return icon;
    }
    return null;
  };
  
  // 텍스트 렌더링
  const renderText = () => {
    if (loading && loadingText) {
      return loadingText;
    }
    return children;
  };
  
  return (
    <Comp
      data-slot="button"
      className={cn(
        buttonVariants({ variant, size, loading, className }),
        fullWidth && "w-full",
        // 모션 감소 설정 고려
        "motion-reduce:transition-none motion-reduce:transform-none"
      )}
      disabled={isDisabled}
      {...a11yProps}
      {...props}
    >
      {iconPosition === 'left' && renderIcon()}
      {renderText()}
      {iconPosition === 'right' && renderIcon()}
    </Comp>
  )
}

export { Button, buttonVariants, type ButtonProps }
