// Font configuration for Next.js 15
// Uses CSS font families to avoid build issues

// Language-specific font CSS class name
export function getFontClassName(locale: string): string {
  switch (locale) {
    case 'ko':
      return 'font-noto-sans-kr';
    case 'ja':
    case 'jp': // 하위 호환성을 위한 fallback
      return 'font-noto-sans-jp';
    case 'en':
    default:
      return 'font-inter';
  }
}

// Font variables (for compatibility)
export const inter = {
  variable: '--font-inter',
  className: 'font-inter'
};

export const notoSansKR = {
  variable: '--font-noto-kr',
  className: 'font-noto-sans-kr'
};

export const notoSansJP = {
  variable: '--font-noto-jp',  
  className: 'font-noto-sans-jp'
};

// All font variables for root level usage
export const allFontsVariables = 'font-inter font-noto-sans-kr font-noto-sans-jp';