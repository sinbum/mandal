// 길이 제한
export const LIMITS = {
  TOPIC_MAX_LENGTH: 7, // 주제 입력 최대 길이
  TITLE_MAX_LENGTH: 30, // 만다라트 제목 최대 길이
  MEMO_MAX_LENGTH: 300, // 메모 최대 길이 (필요시)
};

// 이미지 관련 설정
export const IMAGE = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  THUMBNAIL_SIZE: 256,
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/gif'],
};

// 레이아웃 관련 상수
export const LAYOUT = {
  HEADER_HEIGHT: 56,
  FOOTER_HEIGHT: 56,
  SLIDEUP_MIN_HEIGHT: 300,
  SLIDEUP_MAX_HEIGHT: '80vh',
};

// Z-index 관리
export const Z_INDEX = {
  HEADER: 10,
  BOTTOM_BAR: 10,
  FAB: 50,
  TOAST: 50,
  MODAL_OVERLAY: 60,
  SLIDE_UP_OVERLAY: 69,
  SLIDE_UP_PANEL: 70,
  ALERT_DIALOG: 80,
  CELL_EDITOR_MODAL: 9999,
};

// 애니메이션 시간 (ms)
export const ANIMATION = {
  SLIDEUP_DURATION: 300,
  MODAL_DURATION: 200,
  TOAST_DURATION: 3000,
};

// API 엔드포인트 (임시)
export const API = {
  BASE_URL: '/api',
  MANDALART: '/api/mandalart',
};

// 로컬 스토리지 키
export const STORAGE_KEYS = {
  THEME: 'mandalart-theme',
  AUTH_TOKEN: 'mandalart-auth-token',
}; 