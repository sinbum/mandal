/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: "1rem",
        sm: "2rem",
        lg: "4rem",
        xl: "5rem",
        "2xl": "6rem",
      },
      screens: {
        "2xl": "1400px",
      },
    },
    screens: {
      'xs': '360px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
    },
    extend: {
      colors: {
        // 시스템 색상 (oklch 기반)
        border: "var(--color-border)",
        input: "var(--color-input)",
        ring: "var(--color-ring)",
        background: "var(--color-background)",
        foreground: "var(--color-foreground)",
        primary: {
          50: "oklch(97.5% 0.01 264)",
          100: "oklch(94.5% 0.05 264)",
          200: "oklch(89.5% 0.09 264)",
          300: "oklch(83.5% 0.13 264)",
          400: "oklch(76.5% 0.15 264)",
          DEFAULT: "oklch(69.5% 0.17 264)",
          600: "oklch(62.5% 0.19 264)",
          700: "oklch(55.5% 0.21 264)",
          800: "oklch(44.5% 0.23 264)",
          900: "oklch(32.5% 0.19 264)",
          950: "oklch(22.5% 0.15 264)",
          foreground: "var(--color-primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--color-secondary)",
          foreground: "var(--color-secondary-foreground)",
        },
        destructive: {
          DEFAULT: "var(--color-destructive)",
          foreground: "oklch(98% 0 0)",
        },
        muted: {
          DEFAULT: "var(--color-muted)",
          foreground: "var(--color-muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--color-accent)",
          foreground: "var(--color-accent-foreground)",
        },
        popover: {
          DEFAULT: "var(--color-popover)",
          foreground: "var(--color-popover-foreground)",
        },
        card: {
          DEFAULT: "var(--color-card)",
          foreground: "var(--color-card-foreground)",
        },
        // 시맨틱 색상
        success: {
          DEFAULT: "oklch(68% 0.15 152)",
          light: "oklch(85% 0.08 152)",
          dark: "oklch(45% 0.18 152)",
        },
        error: {
          DEFAULT: "oklch(64% 0.21 22)",
          light: "oklch(85% 0.10 22)",
          dark: "oklch(45% 0.24 22)",
        },
        warning: {
          DEFAULT: "oklch(78% 0.15 85)",
          light: "oklch(90% 0.08 85)",
          dark: "oklch(60% 0.18 85)",
        },
        info: {
          DEFAULT: "oklch(69% 0.17 230)",
          light: "oklch(85% 0.08 230)",
          dark: "oklch(50% 0.20 230)",
        },
        // 그레이 스케일
        gray: {
          50: "oklch(98% 0 0)",
          100: "oklch(95% 0 0)",
          200: "oklch(90% 0 0)",
          300: "oklch(83% 0 0)",
          400: "oklch(71% 0 0)",
          500: "oklch(62% 0 0)",
          600: "oklch(52% 0 0)",
          700: "oklch(42% 0 0)",
          800: "oklch(28% 0 0)",
          900: "oklch(19% 0 0)",
          950: "oklch(12% 0 0)",
        },
        // 만다라트 셀 색상
        cell: {
          red: {
            light: "oklch(85% 0.12 22)",
            DEFAULT: "oklch(69% 0.18 22)",
            dark: "oklch(45% 0.20 22)",
          },
          orange: {
            light: "oklch(88% 0.10 65)",
            DEFAULT: "oklch(75% 0.15 65)",
            dark: "oklch(55% 0.18 65)",
          },
          yellow: {
            light: "oklch(92% 0.08 85)",
            DEFAULT: "oklch(80% 0.13 85)",
            dark: "oklch(60% 0.16 85)",
          },
          green: {
            light: "oklch(85% 0.08 152)",
            DEFAULT: "oklch(68% 0.15 152)",
            dark: "oklch(45% 0.18 152)",
          },
          blue: {
            light: "oklch(85% 0.08 230)",
            DEFAULT: "oklch(69% 0.17 230)",
            dark: "oklch(50% 0.20 230)",
          },
          purple: {
            light: "oklch(85% 0.08 290)",
            DEFAULT: "oklch(69% 0.15 290)",
            dark: "oklch(50% 0.18 290)",
          },
          pink: {
            light: "oklch(85% 0.08 340)",
            DEFAULT: "oklch(72% 0.15 340)",
            dark: "oklch(52% 0.18 340)",
          },
          indigo: {
            light: "oklch(85% 0.08 264)",
            DEFAULT: "oklch(69% 0.17 264)",
            dark: "oklch(50% 0.20 264)",
          },
        },
      },
      borderRadius: {
        lg: "var(--radius-lg)",
        md: "var(--radius-md)",
        sm: "var(--radius-sm)",
      },
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
      spacing: {
        '0.5': '0.125rem',
        '1.5': '0.375rem',
        '2.5': '0.625rem',
        '3.5': '0.875rem',
        '11': '2.75rem',
        '13': '3.25rem',
        '15': '3.75rem',
        '17': '4.25rem',
        '18': '4.5rem',
        '19': '4.75rem',
        '21': '5.25rem',
        '22': '5.5rem',
        '23': '5.75rem',
        '25': '6.25rem',
        '26': '6.5rem',
        '27': '6.75rem',
        '29': '7.25rem',
        '30': '7.5rem',
        '31': '7.75rem',
        '33': '8.25rem',
        '34': '8.5rem',
        '35': '8.75rem',
        '36': '9rem',
        '37': '9.25rem',
        '38': '9.5rem',
        '39': '9.75rem',
      },
      minHeight: {
        '11': '2.75rem',  // 44px - 최소 터치 타겟
        '12': '3rem',     // 48px - 권장 터치 타겟
        '14': '3.5rem',   // 56px - 큰 터치 타겟
        'screen-safe': 'calc(100vh - env(safe-area-inset-top) - env(safe-area-inset-bottom))',
      },
      maxWidth: {
        '8xl': '88rem',
        '9xl': '96rem',
      },
      zIndex: {
        'hide': '-1',
        'base': '0',
        'docked': '10',
        'dropdown': '1000',
        'sticky': '1100',
        'banner': '1200',
        'overlay': '1300',
        'modal': '1400',
        'popover': '1500',
        'skipLink': '1600',
        'toast': '1700',
        'tooltip': '1800',
      },
      keyframes: {
        // 기본 애니메이션
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        // 페이드 애니메이션
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "fade-out": {
          "0%": { opacity: "1" },
          "100%": { opacity: "0" },
        },
        // 스케일 애니메이션
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "scale-out": {
          "0%": { opacity: "1", transform: "scale(1)" },
          "100%": { opacity: "0", transform: "scale(0.95)" },
        },
        // 슬라이드 애니메이션
        "slide-in-up": {
          "0%": { opacity: "0", transform: "translateY(100%)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-out-down": {
          "0%": { opacity: "1", transform: "translateY(0)" },
          "100%": { opacity: "0", transform: "translateY(100%)" },
        },
        "slide-in-right": {
          "0%": { opacity: "0", transform: "translateX(-100%)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        "slide-out-left": {
          "0%": { opacity: "1", transform: "translateX(0)" },
          "100%": { opacity: "0", transform: "translateX(-100%)" },
        },
        // 바운스 애니메이션
        "bounce-in": {
          "0%": { opacity: "0", transform: "scale(0.3)" },
          "50%": { opacity: "1", transform: "scale(1.05)" },
          "70%": { transform: "scale(0.9)" },
          "100%": { transform: "scale(1)" },
        },
        // 셰이크 애니메이션
        "shake": {
          "0%, 100%": { transform: "translateX(0)" },
          "10%, 30%, 50%, 70%, 90%": { transform: "translateX(-2px)" },
          "20%, 40%, 60%, 80%": { transform: "translateX(2px)" },
        },
        // 펄스 애니메이션
        "pulse-soft": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
        // 로딩 애니메이션
        "spin-slow": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
      },
      animation: {
        // 기본 애니메이션
        "accordion-down": "accordion-down 200ms cubic-bezier(0.4, 0, 0.2, 1)",
        "accordion-up": "accordion-up 200ms cubic-bezier(0.4, 0, 0.2, 1)",
        // 페이드 애니메이션
        "fade-in": "fade-in 200ms cubic-bezier(0.4, 0, 0.2, 1)",
        "fade-out": "fade-out 150ms cubic-bezier(0.4, 0, 1, 1)",
        "fade-in-slow": "fade-in 300ms cubic-bezier(0.4, 0, 0.6, 1)",
        // 스케일 애니메이션
        "scale-in": "scale-in 200ms cubic-bezier(0.4, 0, 0.2, 1)",
        "scale-out": "scale-out 150ms cubic-bezier(0.4, 0, 1, 1)",
        "scale-in-bouncy": "scale-in 200ms cubic-bezier(0.68, -0.55, 0.265, 1.55)",
        // 슬라이드 애니메이션
        "slide-in-up": "slide-in-up 300ms cubic-bezier(0.4, 0, 0.2, 1)",
        "slide-out-down": "slide-out-down 200ms cubic-bezier(0.4, 0, 1, 1)",
        "slide-in-right": "slide-in-right 300ms cubic-bezier(0.4, 0, 0.2, 1)",
        "slide-out-left": "slide-out-left 200ms cubic-bezier(0.4, 0, 1, 1)",
        // 바운스 애니메이션
        "bounce-in": "bounce-in 500ms cubic-bezier(0.68, -0.55, 0.265, 1.55)",
        // 기타 애니메이션
        "shake": "shake 500ms cubic-bezier(0.4, 0, 0.2, 1)",
        "pulse-soft": "pulse-soft 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "spin-slow": "spin-slow 2s linear infinite",
        // 모션 감소 고려 애니메이션
        "motion-safe-fade-in": "fade-in 200ms cubic-bezier(0.4, 0, 0.2, 1)",
        "motion-safe-scale-in": "scale-in 200ms cubic-bezier(0.4, 0, 0.2, 1)",
      },
      transitionDuration: {
        '0': '0ms',
        '75': '75ms',
        '100': '100ms',
        '200': '200ms',
        '300': '300ms',
        '500': '500ms',
        '700': '700ms',
        '1000': '1000ms',
      },
      transitionTimingFunction: {
        'DEFAULT': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'smooth': 'cubic-bezier(0.4, 0, 0.6, 1)',
        'bouncy': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'sharp': 'cubic-bezier(0.4, 0, 1, 1)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/line-clamp'),
    require('daisyui'),
    function({ addUtilities, addComponents, addVariant }) {
      // 스크롤바 유틸리티
      addUtilities({
        '.scrollbar-hide': {
          '-ms-overflow-style': 'none',
          'scrollbar-width': 'none',
          '&::-webkit-scrollbar': {
            display: 'none'
          }
        },
        '.scrollbar-thin': {
          'scrollbar-width': 'thin',
          '&::-webkit-scrollbar': {
            width: '6px'
          },
          '&::-webkit-scrollbar-track': {
            background: 'transparent'
          },
          '&::-webkit-scrollbar-thumb': {
            background: 'oklch(62% 0 0 / 0.2)',
            'border-radius': '3px'
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: 'oklch(62% 0 0 / 0.3)'
          }
        },
      });
      
      // 접근성 유틸리티
      addUtilities({
        '.sr-only': {
          position: 'absolute',
          width: '1px',
          height: '1px',
          padding: '0',
          margin: '-1px',
          overflow: 'hidden',
          clip: 'rect(0, 0, 0, 0)',
          'white-space': 'nowrap',
          'border-width': '0',
        },
        '.not-sr-only': {
          position: 'static',
          width: 'auto',
          height: 'auto',
          padding: '0',
          margin: '0',
          overflow: 'visible',
          clip: 'auto',
          'white-space': 'normal',
        },
      });
      
      // 터치 최적화 유틸리티
      addUtilities({
        '.touch-target': {
          'min-width': '44px',
          'min-height': '44px',
        },
        '.touch-target-comfortable': {
          'min-width': '48px',
          'min-height': '48px',
        },
        '.touch-target-large': {
          'min-width': '56px',
          'min-height': '56px',
        },
      });
      
      // 안전 영역 유틸리티
      addUtilities({
        '.safe-top': {
          'padding-top': 'env(safe-area-inset-top)',
        },
        '.safe-bottom': {
          'padding-bottom': 'env(safe-area-inset-bottom)',
        },
        '.safe-left': {
          'padding-left': 'env(safe-area-inset-left)',
        },
        '.safe-right': {
          'padding-right': 'env(safe-area-inset-right)',
        },
        '.safe-area': {
          'padding-top': 'env(safe-area-inset-top)',
          'padding-bottom': 'env(safe-area-inset-bottom)',
          'padding-left': 'env(safe-area-inset-left)',
          'padding-right': 'env(safe-area-inset-right)',
        },
      });
      
      // 애니메이션 유틸리티
      addUtilities({
        '.animate-in': {
          'animation-duration': '200ms',
          'animation-fill-mode': 'both',
        },
        '.animate-out': {
          'animation-duration': '150ms',
          'animation-fill-mode': 'both',
        },
      });
      
      // 모바일 뷰포트 유틸리티
      addUtilities({
        '.h-screen-safe': {
          height: 'calc(100vh - env(safe-area-inset-top) - env(safe-area-inset-bottom))',
        },
        '.min-h-screen-safe': {
          'min-height': 'calc(100vh - env(safe-area-inset-top) - env(safe-area-inset-bottom))',
        },
        '.h-dvh': {
          height: '100dvh',
        },
        '.min-h-dvh': {
          'min-height': '100dvh',
        },
      });
      
      // 포커스 유틸리티
      addUtilities({
        '.focus-ring': {
          '&:focus-visible': {
            outline: '2px solid var(--color-primary)',
            'outline-offset': '2px',
            'border-radius': '4px',
          },
        },
      });
      
      // 호버 및 액티브 상태 (터치 고려)
      addUtilities({
        '.hover-lift': {
          'transition': 'transform 200ms cubic-bezier(0.4, 0, 0.2, 1)',
          '@media (hover: hover)': {
            '&:hover': {
              transform: 'translateY(-1px)',
            },
          },
        },
        '.active-scale': {
          'transition': 'transform 150ms cubic-bezier(0.4, 0, 1, 1)',
          '&:active': {
            transform: 'scale(0.98)',
          },
        },
      });
      
      // 모션 감소 고려 변형
      addVariant('motion-safe', '@media (prefers-reduced-motion: no-preference)');
      addVariant('motion-reduce', '@media (prefers-reduced-motion: reduce)');
      addVariant('high-contrast', '@media (prefers-contrast: high)');
    }
  ],
  daisyui: {
    themes: [
      {
        light: {
          "primary": "#2563eb",
          "secondary": "#7c3aed",
          "accent": "#06b6d4",
          "neutral": "#374151",
          "base-100": "#ffffff",
          "info": "#3b82f6",
          "success": "#10b981",
          "warning": "#f59e0b",
          "error": "#ef4444",
        },
      },
    ],
  },
} 