// 만다라트 셀의 기본 색상 팔레트
export const CELL_COLORS = {
  DEFAULT: '#F8F9FA',
  RED: '#FFE3E3',
  PINK: '#FFD6FF',
  PURPLE: '#E5D9F2',
  BLUE: '#DBE4FF',
  CYAN: '#C5F6FA',
  TEAL: '#C3FAE8',
  GREEN: '#D3F9D8',
  YELLOW: '#FFF3BF',
  ORANGE: '#FFE8CC',
  GRAY: '#E9ECEF',
};

// UI 테마 색상 (기본 + 다크모드 지원)
export const THEME_COLORS = {
  light: {
    primary: '#5C7CFA',
    secondary: '#748FFC',
    background: '#FFFFFF',
    surface: '#F8F9FA',
    text: '#212529',
    textSecondary: '#495057',
    border: '#E9ECEF',
    divider: '#DEE2E6',
    success: '#51CF66',
    error: '#FA5252',
    warning: '#FCC419',
    info: '#339AF0',
  },
  dark: {
    primary: '#5C7CFA',
    secondary: '#748FFC',
    background: '#121212',
    surface: '#1E1E1E',
    text: '#E9ECEF',
    textSecondary: '#ADB5BD',
    border: '#343A40',
    divider: '#495057',
    success: '#51CF66',
    error: '#FA5252',
    warning: '#FCC419',
    info: '#339AF0',
  },
};

// 색상 선택 팔레트용 색상 배열 (3x3 그리드)
export const COLOR_PALETTE = [
  CELL_COLORS.DEFAULT,
  CELL_COLORS.GRAY,
  CELL_COLORS.RED,
  CELL_COLORS.PINK,
  CELL_COLORS.PURPLE,
  CELL_COLORS.BLUE,
  CELL_COLORS.GREEN,
  CELL_COLORS.YELLOW,
  CELL_COLORS.ORANGE
];
