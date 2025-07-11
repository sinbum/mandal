/**
 * 쿠키 관련 유틸리티 함수들
 */

export const COOKIE_KEYS = {
  SLIDE_PANEL_HEIGHT: 'slideUpPanel_height',
  RECENT_MANDALART_CELL: 'recent_mandalart_cell',
} as const;

/**
 * 쿠키 값을 설정합니다
 */
export const setCookie = (name: string, value: string, days: number = 30): void => {
  if (typeof document === 'undefined') return;
  
  const expires = new Date();
  expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
  
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
};

/**
 * 쿠키 값을 가져옵니다
 */
export const getCookie = (name: string): string | null => {
  if (typeof document === 'undefined') return null;
  
  const nameEQ = name + "=";
  const ca = document.cookie.split(';');
  
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  
  return null;
};

/**
 * 쿠키를 삭제합니다
 */
export const deleteCookie = (name: string): void => {
  if (typeof document === 'undefined') return;
  
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
};

/**
 * SlideUpPanel 높이를 쿠키에 저장합니다
 */
export const savePanelHeight = (height: number): void => {
  setCookie(COOKIE_KEYS.SLIDE_PANEL_HEIGHT, height.toString());
};

/**
 * SlideUpPanel 높이를 쿠키에서 가져옵니다
 */
export const getPanelHeight = (defaultHeight: number = 400): number => {
  const saved = getCookie(COOKIE_KEYS.SLIDE_PANEL_HEIGHT);
  if (saved) {
    const height = parseInt(saved, 10);
    // 최소 200px, 최대 화면 높이의 80%로 제한
    const maxHeight = typeof window !== 'undefined' ? window.innerHeight * 0.8 : 600;
    return Math.max(200, Math.min(height, maxHeight));
  }
  return defaultHeight;
};

/**
 * 최근 만다라트 셀 ID를 쿠키에 저장합니다
 */
export const saveRecentMandalartCell = (cellId: string): void => {
  setCookie(COOKIE_KEYS.RECENT_MANDALART_CELL, cellId, 7); // 7일간 저장
};

/**
 * 최근 만다라트 셀 ID를 쿠키에서 가져옵니다
 */
export const getRecentMandalartCell = (): string | null => {
  return getCookie(COOKIE_KEYS.RECENT_MANDALART_CELL);
};