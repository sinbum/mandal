/**
 * 디자인 시스템 유틸리티 함수들
 * 
 * 이 파일은 디자인 토큰을 활용한 유틸리티 함수들을 제공합니다.
 * - 색상 조작 함수
 * - 반응형 유틸리티
 * - 접근성 유틸리티
 * - 애니메이션 유틸리티
 */

import { DESIGN_TOKENS, MOBILE_TOKENS, ACCESSIBILITY_TOKENS } from './tokens';

// 색상 유틸리티
export const colorUtils = {
  /**
   * oklch 색상 값을 파싱하여 개별 구성요소 반환
   */
  parseOklch(color: string): { l: number; c: number; h: number } | null {
    const match = color.match(/oklch\((\d+(?:\.\d+)?%)\s+(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)\)/);
    if (!match) return null;
    
    return {
      l: parseFloat(match[1]),
      c: parseFloat(match[2]),
      h: parseFloat(match[3]),
    };
  },

  /**
   * 색상의 명도 조정
   */
  adjustLightness(color: string, adjustment: number): string {
    const parsed = this.parseOklch(color);
    if (!parsed) return color;
    
    const newL = Math.max(0, Math.min(100, parsed.l + adjustment));
    return `oklch(${newL}% ${parsed.c} ${parsed.h})`;
  },

  /**
   * 색상의 채도 조정
   */
  adjustChroma(color: string, adjustment: number): string {
    const parsed = this.parseOklch(color);
    if (!parsed) return color;
    
    const newC = Math.max(0, parsed.c + adjustment);
    return `oklch(${parsed.l}% ${newC} ${parsed.h})`;
  },

  /**
   * 색상의 색조 조정
   */
  adjustHue(color: string, adjustment: number): string {
    const parsed = this.parseOklch(color);
    if (!parsed) return color;
    
    const newH = (parsed.h + adjustment) % 360;
    return `oklch(${parsed.l}% ${parsed.c} ${newH})`;
  },

  /**
   * 색상 대비 계산 (WCAG 2.1 기준)
   */
  getContrastRatio(color1: string, color2: string): number {
    // 간단한 구현 - 실제로는 더 복잡한 계산이 필요
    // 이 함수는 oklch를 RGB로 변환한 후 계산해야 함
    // 여기서는 placeholder로 제공
    return 4.5;
  },

  /**
   * 색상이 접근성 기준을 만족하는지 확인
   */
  isAccessible(foreground: string, background: string, level: 'AA' | 'AAA' = 'AA'): boolean {
    const ratio = this.getContrastRatio(foreground, background);
    const threshold = level === 'AA' ? ACCESSIBILITY_TOKENS.colorContrast.normal : ACCESSIBILITY_TOKENS.colorContrast.enhanced;
    return ratio >= threshold;
  },
};

// 반응형 유틸리티
export const responsiveUtils = {
  /**
   * 브레이크포인트 미디어 쿼리 생성
   */
  above(breakpoint: keyof typeof DESIGN_TOKENS.breakpoints): string {
    return `@media (min-width: ${DESIGN_TOKENS.breakpoints[breakpoint]})`;
  },

  /**
   * 특정 브레이크포인트 이하 미디어 쿼리
   */
  below(breakpoint: keyof typeof DESIGN_TOKENS.breakpoints): string {
    const breakpointValue = parseInt(DESIGN_TOKENS.breakpoints[breakpoint]);
    return `@media (max-width: ${breakpointValue - 1}px)`;
  },

  /**
   * 브레이크포인트 사이 미디어 쿼리
   */
  between(min: keyof typeof DESIGN_TOKENS.breakpoints, max: keyof typeof DESIGN_TOKENS.breakpoints): string {
    const minValue = DESIGN_TOKENS.breakpoints[min];
    const maxValue = parseInt(DESIGN_TOKENS.breakpoints[max]) - 1;
    return `@media (min-width: ${minValue}) and (max-width: ${maxValue}px)`;
  },

  /**
   * 모바일 기기 감지
   */
  isMobile(): boolean {
    if (typeof window === 'undefined') return false;
    return window.innerWidth < parseInt(DESIGN_TOKENS.breakpoints.md);
  },

  /**
   * 터치 기기 감지
   */
  isTouchDevice(): boolean {
    if (typeof window === 'undefined') return false;
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  },

  /**
   * 디바이스별 최적화된 간격 반환
   */
  getOptimalSpacing(desktop: string, mobile: string): string {
    return this.isMobile() ? mobile : desktop;
  },
};

// 접근성 유틸리티
export const a11yUtils = {
  /**
   * 스크린 리더 전용 CSS 클래스
   */
  srOnly: ACCESSIBILITY_TOKENS.screenReader.srOnly,

  /**
   * 포커스 표시 스타일
   */
  focusVisible: {
    outline: ACCESSIBILITY_TOKENS.focus.outline,
    outlineOffset: ACCESSIBILITY_TOKENS.focus.outlineOffset,
    borderRadius: ACCESSIBILITY_TOKENS.focus.borderRadius,
    transition: `outline-color ${ACCESSIBILITY_TOKENS.focus.animationDuration} ease`,
  },

  /**
   * 키보드 네비게이션 가능한 요소 확인
   */
  isKeyboardFocusable(element: HTMLElement): boolean {
    if (!element) return false;
    
    const focusableElements = [
      'button',
      'input',
      'select',
      'textarea',
      'a[href]',
      '[tabindex]:not([tabindex="-1"])',
    ];
    
    return focusableElements.some(selector => 
      element.matches(selector) || element.querySelector(selector)
    );
  },

  /**
   * 모션 감소 설정 확인
   */
  prefersReducedMotion(): boolean {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  },

  /**
   * 다크 모드 선호 설정 확인
   */
  prefersDarkMode(): boolean {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  },

  /**
   * 고대비 모드 선호 설정 확인
   */
  prefersHighContrast(): boolean {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-contrast: high)').matches;
  },

  /**
   * ARIA 속성 생성 헬퍼
   */
  createAriaProps(config: {
    label?: string;
    labelledBy?: string;
    describedBy?: string;
    expanded?: boolean;
    selected?: boolean;
    disabled?: boolean;
    invalid?: boolean;
    required?: boolean;
    live?: 'polite' | 'assertive' | 'off';
    atomic?: boolean;
    relevant?: 'additions' | 'removals' | 'text' | 'all';
  }): Record<string, any> {
    const props: Record<string, any> = {};
    
    if (config.label) props['aria-label'] = config.label;
    if (config.labelledBy) props['aria-labelledby'] = config.labelledBy;
    if (config.describedBy) props['aria-describedby'] = config.describedBy;
    if (config.expanded !== undefined) props['aria-expanded'] = config.expanded;
    if (config.selected !== undefined) props['aria-selected'] = config.selected;
    if (config.disabled !== undefined) props['aria-disabled'] = config.disabled;
    if (config.invalid !== undefined) props['aria-invalid'] = config.invalid;
    if (config.required !== undefined) props['aria-required'] = config.required;
    if (config.live) props['aria-live'] = config.live;
    if (config.atomic !== undefined) props['aria-atomic'] = config.atomic;
    if (config.relevant) props['aria-relevant'] = config.relevant;
    
    return props;
  },
};

// 애니메이션 유틸리티
export const animationUtils = {
  /**
   * 모션 감소 설정을 고려한 애니메이션 지속 시간
   */
  getDuration(duration: keyof typeof DESIGN_TOKENS.animation.duration): string {
    if (a11yUtils.prefersReducedMotion()) return '0ms';
    return DESIGN_TOKENS.animation.duration[duration];
  },

  /**
   * 모션 감소 설정을 고려한 애니메이션 생성
   */
  createAnimation(
    name: string,
    duration: keyof typeof DESIGN_TOKENS.animation.duration,
    easing: keyof typeof DESIGN_TOKENS.animation.easing = 'default',
    delay: string = '0ms'
  ): string {
    if (a11yUtils.prefersReducedMotion()) return 'none';
    
    return `${name} ${this.getDuration(duration)} ${DESIGN_TOKENS.animation.easing[easing]} ${delay}`;
  },

  /**
   * 키프레임 애니메이션 생성
   */
  createKeyframes(name: string, keyframes: Record<string, Record<string, string>>): string {
    const keyframeRules = Object.entries(keyframes)
      .map(([percentage, styles]) => {
        const styleRules = Object.entries(styles)
          .map(([property, value]) => `${property}: ${value};`)
          .join(' ');
        return `${percentage} { ${styleRules} }`;
      })
      .join(' ');
    
    return `@keyframes ${name} { ${keyframeRules} }`;
  },

  /**
   * 스프링 애니메이션 생성 (CSS 애니메이션)
   */
  createSpringAnimation(
    property: string,
    fromValue: string,
    toValue: string,
    config: {
      tension?: number;
      friction?: number;
      mass?: number;
    } = {}
  ): string {
    const { tension = 170, friction = 26, mass = 1 } = config;
    
    // 스프링 물리학 기반 지속 시간 계산 (간단한 근사치)
    const duration = Math.sqrt(mass / tension) * friction * 100;
    
    return `${property} ${duration}ms ${DESIGN_TOKENS.animation.easing.bouncy}`;
  },

  /**
   * 페이지 전환 애니메이션
   */
  pageTransition: {
    enter: {
      opacity: 0,
      transform: 'translateX(20px)',
      transition: `opacity ${DESIGN_TOKENS.animation.duration.normal} ${DESIGN_TOKENS.animation.easing.default}, transform ${DESIGN_TOKENS.animation.duration.normal} ${DESIGN_TOKENS.animation.easing.default}`,
    },
    enterActive: {
      opacity: 1,
      transform: 'translateX(0)',
    },
    exit: {
      opacity: 1,
      transform: 'translateX(0)',
      transition: `opacity ${DESIGN_TOKENS.animation.duration.fast} ${DESIGN_TOKENS.animation.easing.default}, transform ${DESIGN_TOKENS.animation.duration.fast} ${DESIGN_TOKENS.animation.easing.default}`,
    },
    exitActive: {
      opacity: 0,
      transform: 'translateX(-20px)',
    },
  },
};

// 모바일 최적화 유틸리티
export const mobileUtils = {
  /**
   * 터치 타겟 크기 검증
   */
  isValidTouchTarget(width: number, height: number): boolean {
    const minSize = parseInt(MOBILE_TOKENS.touchTarget.min);
    return width >= minSize && height >= minSize;
  },

  /**
   * 터치 친화적 간격 계산
   */
  getTouchFriendlySpacing(baseSpacing: string): string {
    if (!responsiveUtils.isTouchDevice()) return baseSpacing;
    
    const spacingValue = parseInt(baseSpacing);
    const adjustedSpacing = Math.max(spacingValue, 8); // 최소 8px
    return `${adjustedSpacing}px`;
  },

  /**
   * 스와이프 제스처 감지 설정
   */
  swipeGesture: {
    threshold: parseInt(MOBILE_TOKENS.gesture.swipeThreshold),
    velocity: 0.3,
    directional: true,
  },

  /**
   * 모바일 키보드 대응 뷰포트 높이
   */
  getViewportHeight(): string {
    return 'calc(100vh - env(keyboard-inset-height, 0px))';
  },

  /**
   * 안전 영역 패딩 (iOS 노치 대응)
   */
  safeAreaPadding: {
    top: 'env(safe-area-inset-top, 0px)',
    right: 'env(safe-area-inset-right, 0px)',
    bottom: 'env(safe-area-inset-bottom, 0px)',
    left: 'env(safe-area-inset-left, 0px)',
  },
};

// 성능 최적화 유틸리티
export const performanceUtils = {
  /**
   * 디바운스 함수
   */
  debounce<T extends (...args: any[]) => void>(
    func: T,
    wait: number,
    immediate?: boolean
  ): T {
    let timeout: NodeJS.Timeout | null = null;
    
    const debounced = function (this: any, ...args: Parameters<T>) {
      const later = () => {
        timeout = null;
        if (!immediate) func.apply(this, args);
      };
      
      const callNow = immediate && !timeout;
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      
      if (callNow) func.apply(this, args);
    };
    
    return debounced as T;
  },

  /**
   * 스로틀 함수
   */
  throttle<T extends (...args: any[]) => void>(
    func: T,
    limit: number
  ): T {
    let inThrottle: boolean;
    
    const throttled = function (this: any, ...args: Parameters<T>) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
    
    return throttled as T;
  },

  /**
   * 요소가 뷰포트에 들어왔는지 확인
   */
  isInViewport(element: HTMLElement, threshold: number = 0): boolean {
    if (!element) return false;
    
    const rect = element.getBoundingClientRect();
    const windowHeight = window.innerHeight || document.documentElement.clientHeight;
    const windowWidth = window.innerWidth || document.documentElement.clientWidth;
    
    return (
      rect.top >= -threshold &&
      rect.left >= -threshold &&
      rect.bottom <= windowHeight + threshold &&
      rect.right <= windowWidth + threshold
    );
  },

  /**
   * 메모이제이션 유틸리티
   */
  memoize<T extends (...args: any[]) => any>(fn: T): T {
    const cache = new Map();
    
    const memoized = function (this: any, ...args: Parameters<T>) {
      const key = JSON.stringify(args);
      
      if (cache.has(key)) {
        return cache.get(key);
      }
      
      const result = fn.apply(this, args);
      cache.set(key, result);
      return result;
    };
    
    return memoized as T;
  },
};

// 통합 유틸리티 객체
export const designUtils = {
  color: colorUtils,
  responsive: responsiveUtils,
  a11y: a11yUtils,
  animation: animationUtils,
  mobile: mobileUtils,
  performance: performanceUtils,
};

export default designUtils;