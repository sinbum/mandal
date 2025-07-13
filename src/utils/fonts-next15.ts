// Next.js 15 compatible font configuration
// This file provides a fallback solution for font loading issues

export interface FontConfig {
  variable: string;
  className: string;
  style: Record<string, string>;
}

// Create font configurations with CSS variables
const createFontConfig = (variable: string, className: string): FontConfig => ({
  variable,
  className,
  style: {}
});

// Fallback font configurations
export const inter = createFontConfig('--font-inter', 'font-inter');
export const notoSansKR = createFontConfig('--font-noto-kr', 'font-noto-kr');
export const notoSansJP = createFontConfig('--font-noto-jp', 'font-noto-jp');

// Language-specific font class getter
export function getFontClass(locale: string): string {
  switch (locale) {
    case 'ko':
      return '--font-noto-kr';
    case 'ja':
      return '--font-noto-jp';
    case 'en':
    default:
      return '--font-inter';
  }
}

// Language-specific font CSS class name
export function getFontClassName(locale: string): string {
  switch (locale) {
    case 'ko':
      return 'font-noto-kr';
    case 'ja':
      return 'font-noto-jp';
    case 'en':
    default:
      return 'font-inter';
  }
}

// All font variables for root level usage
export const allFontsVariables = '--font-inter --font-noto-kr --font-noto-jp';