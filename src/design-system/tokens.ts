/**
 * 만다라트 디자인 토큰 시스템
 * 
 * 이 파일은 애플리케이션 전반에 걸쳐 사용되는 디자인 토큰들을 정의합니다.
 * - 색상 시스템 (oklch 기반)
 * - 타이포그래피 시스템
 * - 스페이싱 시스템
 * - 그림자 및 애니메이션 시스템
 * - 모바일 최적화 토큰
 * - 접근성 토큰
 */

export const DESIGN_TOKENS = {
  // 색상 시스템 (oklch 기반 - 더 나은 색상 일관성)
  colors: {
    // 기본 색상 팔레트
    primary: {
      50: 'oklch(97.5% 0.01 264)',
      100: 'oklch(94.5% 0.05 264)',
      200: 'oklch(89.5% 0.09 264)',
      300: 'oklch(83.5% 0.13 264)',
      400: 'oklch(76.5% 0.15 264)',
      500: 'oklch(69.5% 0.17 264)',
      600: 'oklch(62.5% 0.19 264)',
      700: 'oklch(55.5% 0.21 264)',
      800: 'oklch(44.5% 0.23 264)',
      900: 'oklch(32.5% 0.19 264)',
      950: 'oklch(22.5% 0.15 264)',
    },
    
    // 시맨틱 색상
    semantic: {
      success: 'oklch(68% 0.15 152)',
      successLight: 'oklch(85% 0.08 152)',
      successDark: 'oklch(45% 0.18 152)',
      
      error: 'oklch(64% 0.21 22)',
      errorLight: 'oklch(85% 0.10 22)',
      errorDark: 'oklch(45% 0.24 22)',
      
      warning: 'oklch(78% 0.15 85)',
      warningLight: 'oklch(90% 0.08 85)',
      warningDark: 'oklch(60% 0.18 85)',
      
      info: 'oklch(69% 0.17 230)',
      infoLight: 'oklch(85% 0.08 230)',
      infoDark: 'oklch(50% 0.20 230)',
    },
    
    // 그레이 스케일 (중성 색상)
    gray: {
      50: 'oklch(98% 0 0)',
      100: 'oklch(95% 0 0)',
      200: 'oklch(90% 0 0)',
      300: 'oklch(83% 0 0)',
      400: 'oklch(71% 0 0)',
      500: 'oklch(62% 0 0)',
      600: 'oklch(52% 0 0)',
      700: 'oklch(42% 0 0)',
      800: 'oklch(28% 0 0)',
      900: 'oklch(19% 0 0)',
      950: 'oklch(12% 0 0)',
    },
    
    // 만다라트 셀 색상 팔레트
    cell: {
      red: {
        light: 'oklch(85% 0.12 22)',
        DEFAULT: 'oklch(69% 0.18 22)',
        dark: 'oklch(45% 0.20 22)',
      },
      orange: {
        light: 'oklch(88% 0.10 65)',
        DEFAULT: 'oklch(75% 0.15 65)',
        dark: 'oklch(55% 0.18 65)',
      },
      yellow: {
        light: 'oklch(92% 0.08 85)',
        DEFAULT: 'oklch(80% 0.13 85)',
        dark: 'oklch(60% 0.16 85)',
      },
      green: {
        light: 'oklch(85% 0.08 152)',
        DEFAULT: 'oklch(68% 0.15 152)',
        dark: 'oklch(45% 0.18 152)',
      },
      blue: {
        light: 'oklch(85% 0.08 230)',
        DEFAULT: 'oklch(69% 0.17 230)',
        dark: 'oklch(50% 0.20 230)',
      },
      purple: {
        light: 'oklch(85% 0.08 290)',
        DEFAULT: 'oklch(69% 0.15 290)',
        dark: 'oklch(50% 0.18 290)',
      },
      pink: {
        light: 'oklch(85% 0.08 340)',
        DEFAULT: 'oklch(72% 0.15 340)',
        dark: 'oklch(52% 0.18 340)',
      },
      indigo: {
        light: 'oklch(85% 0.08 264)',
        DEFAULT: 'oklch(69% 0.17 264)',
        dark: 'oklch(50% 0.20 264)',
      },
    },
  },
  
  // 타이포그래피 시스템
  typography: {
    fontFamily: {
      sans: [
        'Pretendard',
        '-apple-system',
        'BlinkMacSystemFont',
        'system-ui',
        'Roboto',
        'Helvetica Neue',
        'Segoe UI',
        'Apple SD Gothic Neo',
        'Noto Sans KR',
        'Malgun Gothic',
        'sans-serif'
      ],
      mono: [
        'JetBrains Mono',
        'Menlo',
        'Monaco',
        'Cascadia Code',
        'Segoe UI Mono',
        'Roboto Mono',
        'Oxygen Mono',
        'Ubuntu Monospace',
        'Source Code Pro',
        'Fira Code',
        'Droid Sans Mono',
        'Courier New',
        'monospace'
      ],
    },
    
    fontSize: {
      xs: ['0.75rem', { lineHeight: '1.5', letterSpacing: '0.025em' }],
      sm: ['0.875rem', { lineHeight: '1.5', letterSpacing: '0.025em' }],
      base: ['1rem', { lineHeight: '1.6', letterSpacing: '0' }],
      lg: ['1.125rem', { lineHeight: '1.6', letterSpacing: '0' }],
      xl: ['1.25rem', { lineHeight: '1.5', letterSpacing: '0' }],
      '2xl': ['1.5rem', { lineHeight: '1.4', letterSpacing: '-0.025em' }],
      '3xl': ['1.875rem', { lineHeight: '1.3', letterSpacing: '-0.025em' }],
      '4xl': ['2.25rem', { lineHeight: '1.2', letterSpacing: '-0.025em' }],
    },
    
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
  },
  
  // 스페이싱 시스템 (8px 기반)
  spacing: {
    0: '0',
    px: '1px',
    0.5: '0.125rem',    // 2px
    1: '0.25rem',       // 4px
    1.5: '0.375rem',    // 6px
    2: '0.5rem',        // 8px
    2.5: '0.625rem',    // 10px
    3: '0.75rem',       // 12px
    3.5: '0.875rem',    // 14px
    4: '1rem',          // 16px
    5: '1.25rem',       // 20px
    6: '1.5rem',        // 24px
    7: '1.75rem',       // 28px
    8: '2rem',          // 32px
    9: '2.25rem',       // 36px
    10: '2.5rem',       // 40px
    11: '2.75rem',      // 44px
    12: '3rem',         // 48px
    14: '3.5rem',       // 56px
    16: '4rem',         // 64px
    20: '5rem',         // 80px
    24: '6rem',         // 96px
    28: '7rem',         // 112px
    32: '8rem',         // 128px
  },
  
  // 브레이크포인트 (모바일 우선 설계)
  breakpoints: {
    xs: '360px',        // 초소형 모바일
    sm: '640px',        // 모바일
    md: '768px',        // 태블릿
    lg: '1024px',       // 데스크톱
    xl: '1280px',       // 대형 데스크톱
    '2xl': '1536px',    // 초대형 데스크톱
  },
  
  // 그림자 시스템
  shadow: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
    none: 'none',
  },
  
  // 애니메이션 시스템
  animation: {
    duration: {
      fast: '150ms',
      normal: '200ms',
      slow: '300ms',
      slower: '500ms',
    },
    
    easing: {
      default: 'cubic-bezier(0.4, 0, 0.2, 1)',
      smooth: 'cubic-bezier(0.4, 0, 0.6, 1)',
      bouncy: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      sharp: 'cubic-bezier(0.4, 0, 1, 1)',
    },
    
    keyframes: {
      fadeIn: {
        '0%': { opacity: '0' },
        '100%': { opacity: '1' },
      },
      fadeOut: {
        '0%': { opacity: '1' },
        '100%': { opacity: '0' },
      },
      slideInUp: {
        '0%': { transform: 'translateY(100%)', opacity: '0' },
        '100%': { transform: 'translateY(0)', opacity: '1' },
      },
      slideOutDown: {
        '0%': { transform: 'translateY(0)', opacity: '1' },
        '100%': { transform: 'translateY(100%)', opacity: '0' },
      },
      scaleIn: {
        '0%': { transform: 'scale(0.95)', opacity: '0' },
        '100%': { transform: 'scale(1)', opacity: '1' },
      },
      scaleOut: {
        '0%': { transform: 'scale(1)', opacity: '1' },
        '100%': { transform: 'scale(0.95)', opacity: '0' },
      },
    },
  },
  
  // 반지름 (Border Radius)
  radius: {
    none: '0',
    sm: '0.125rem',     // 2px
    DEFAULT: '0.25rem', // 4px
    md: '0.375rem',     // 6px
    lg: '0.5rem',       // 8px
    xl: '0.75rem',      // 12px
    '2xl': '1rem',      // 16px
    '3xl': '1.5rem',    // 24px
    full: '9999px',
  },
  
  // z-index 시스템
  zIndex: {
    hide: -1,
    auto: 'auto',
    base: 0,
    docked: 10,
    dropdown: 1000,
    sticky: 1100,
    banner: 1200,
    overlay: 1300,
    modal: 1400,
    popover: 1500,
    skipLink: 1600,
    toast: 1700,
    tooltip: 1800,
  },
} as const;

// 모바일 최적화 토큰
export const MOBILE_TOKENS = {
  // 터치 타겟 (최소 44px - Apple/Google 가이드라인)
  touchTarget: {
    min: '44px',
    comfortable: '48px',
    large: '56px',
  },
  
  // 제스처 감지 임계값
  gesture: {
    swipeThreshold: '50px',
    tapTimeout: '150ms',
    longPressTimeout: '500ms',
    doubleTapTimeout: '300ms',
  },
  
  // 모바일 전용 간격
  spacing: {
    screenPadding: '16px',      // 화면 양쪽 여백
    componentGap: '12px',       // 컴포넌트 간 간격
    listItemGap: '8px',         // 리스트 아이템 간격
    sectionGap: '24px',         // 섹션 간 간격
  },
  
  // 모바일 타이포그래피
  typography: {
    readableLineHeight: '1.6',
    minFontSize: '14px',
    maxLineLength: '70ch',
    touchFriendlyFontSize: '16px', // iOS 자동 줌 방지
  },
  
  // 모바일 인터랙션
  interaction: {
    rippleAnimation: '200ms',
    buttonPressDepth: '2px',
    swipeResistance: '0.3',
  },
} as const;

// 접근성 토큰
export const ACCESSIBILITY_TOKENS = {
  // 색상 대비 (WCAG 2.1 AA/AAA 준수)
  colorContrast: {
    normal: 4.5,        // AA 기준
    large: 3.0,         // 큰 텍스트 AA 기준
    enhanced: 7.0,      // AAA 기준
  },
  
  // 포커스 관리
  focus: {
    outline: '2px solid var(--color-primary)',
    outlineOffset: '2px',
    borderRadius: '4px',
    animationDuration: '150ms',
  },
  
  // 모션 감소 (사용자 설정 존중)
  motion: {
    reduceMotion: 'prefers-reduced-motion: reduce',
    respectSystemPreference: true,
  },
  
  // 키보드 네비게이션
  keyboard: {
    focusVisible: 'focus-visible',
    skipToContent: 'skip-to-content',
    tabIndex: {
      interactive: 0,
      nonInteractive: -1,
    },
  },
  
  // 스크린 리더
  screenReader: {
    srOnly: {
      position: 'absolute',
      width: '1px',
      height: '1px',
      padding: '0',
      margin: '-1px',
      overflow: 'hidden',
      clip: 'rect(0, 0, 0, 0)',
      whiteSpace: 'nowrap',
      borderWidth: '0',
    },
  },
} as const;

// 성능 최적화 토큰
export const PERFORMANCE_TOKENS = {
  // 지연 로딩 임계값
  lazyLoading: {
    imageIntersectionMargin: '50px',
    componentIntersectionMargin: '100px',
  },
  
  // 애니메이션 최적화
  animation: {
    useTransform: true,
    useWillChange: true,
    preferredProperties: ['transform', 'opacity'],
  },
  
  // 번들 크기 최적화
  bundle: {
    codesplitting: true,
    treeshaking: true,
    compression: true,
  },
} as const;

// 타입 정의
export type ColorToken = keyof typeof DESIGN_TOKENS.colors;
export type TypographyToken = keyof typeof DESIGN_TOKENS.typography;
export type SpacingToken = keyof typeof DESIGN_TOKENS.spacing;
export type BreakpointToken = keyof typeof DESIGN_TOKENS.breakpoints;
export type AnimationToken = keyof typeof DESIGN_TOKENS.animation;
export type RadiusToken = keyof typeof DESIGN_TOKENS.radius;
export type ZIndexToken = keyof typeof DESIGN_TOKENS.zIndex;

// 토큰 사용 헬퍼 함수
export const getColorToken = (token: string): string => {
  const keys = token.split('.');
  let value: Record<string, unknown> | string | unknown = DESIGN_TOKENS.colors;
  
  for (const key of keys) {
    if (typeof value === 'object' && value !== null && key in value) {
      value = (value as Record<string, unknown>)[key];
    } else {
      console.warn(`Color token "${token}" not found`);
      return 'transparent';
    }
  }
  
  return typeof value === 'string' ? value : 'transparent';
};

export const getSpacingToken = (token: keyof typeof DESIGN_TOKENS.spacing): string => {
  return DESIGN_TOKENS.spacing[token];
};

export const getBreakpointToken = (token: keyof typeof DESIGN_TOKENS.breakpoints): string => {
  return DESIGN_TOKENS.breakpoints[token];
};

// 유틸리티 함수
export const createColorScale = (hue: number, saturation: number) => {
  return {
    50: `oklch(97.5% ${saturation * 0.1} ${hue})`,
    100: `oklch(94.5% ${saturation * 0.3} ${hue})`,
    200: `oklch(89.5% ${saturation * 0.5} ${hue})`,
    300: `oklch(83.5% ${saturation * 0.7} ${hue})`,
    400: `oklch(76.5% ${saturation * 0.8} ${hue})`,
    500: `oklch(69.5% ${saturation} ${hue})`,
    600: `oklch(62.5% ${saturation * 1.1} ${hue})`,
    700: `oklch(55.5% ${saturation * 1.2} ${hue})`,
    800: `oklch(44.5% ${saturation * 1.3} ${hue})`,
    900: `oklch(32.5% ${saturation * 1.1} ${hue})`,
    950: `oklch(22.5% ${saturation * 0.9} ${hue})`,
  };
};

export default DESIGN_TOKENS;