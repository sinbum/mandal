export const APP_CONFIG = {
  name: '만다라트 플래너',
  description: '목표를 체계적으로 관리하는 만다라트 기법 플래너',
  logo: '/logo/android-chrome-192x192.png',
  shortName: '만월'
} as const;

export const ROUTES = {
  HOME: '/',
  LOGIN: '/auth/login',
  SIGNUP: '/auth/signup',
  PROFILE: '/profile',
  CELL: '/cell',
  ERROR: '/error',
  PRIVATE: '/private'
} as const;

export const AUTH_MESSAGES = {
  LOGIN_SUCCESS: '로그인 성공!',
  LOGIN_FAILED: '로그인 중 오류가 발생했습니다.',
  SIGNUP_SUCCESS: '회원가입 성공! 이메일 확인을 통해 계정을 활성화해주세요.',
  SIGNUP_FAILED: '회원가입 중 오류가 발생했습니다.',
  EMAIL_VERIFICATION_SUCCESS: '이메일 인증이 완료되었습니다! 자동 로그인됩니다.',
  EMAIL_VERIFICATION_FAILED: '이메일 인증에 실패했습니다. 다시 시도해주세요.',
  LOGOUT_SUCCESS: '로그아웃되었습니다.',
  SESSION_EXPIRED: '세션이 만료되었습니다. 다시 로그인해주세요.',
  UNAUTHORIZED: '로그인이 필요합니다.',
  INVALID_CREDENTIALS: '이메일 또는 비밀번호가 올바르지 않습니다.',
  PASSWORD_MISMATCH: '비밀번호가 일치하지 않습니다.',
  REQUIRED_FIELDS: '모든 필드를 입력해주세요.'
} as const;

export const CELL_MESSAGES = {
  SAVE_SUCCESS: '셀이 저장되었습니다',
  SAVE_FAILED: '셀 저장 중 오류가 발생했습니다',
  CREATE_SUCCESS: '새 셀이 생성되었습니다',
  CREATE_FAILED: '새 셀 생성 중 오류가 발생했습니다',
  DELETE_SUCCESS: '셀이 삭제되었습니다',
  DELETE_FAILED: '셀 삭제 중 오류가 발생했습니다',
  LOAD_FAILED: '셀 정보를 불러오는데 실패했습니다',
  NOT_FOUND: '셀 정보를 찾을 수 없습니다'
} as const;

export const PROFILE_MESSAGES = {
  SAVE_SUCCESS: '프로필이 성공적으로 저장되었습니다',
  SAVE_FAILED: '프로필 저장에 실패했습니다',
  LOAD_FAILED: '프로필 정보를 불러오는데 실패했습니다'
} as const;

export const LOADING_STATES = {
  LOGIN: '로그인 중...',
  SIGNUP: '회원가입 중...',
  LOADING: '로딩 중...',
  SAVING: '저장 중...',
  DELETING: '삭제 중...',
  PROCESSING: '처리 중...'
} as const;

export const UI_CONSTANTS = {
  MOBILE_BREAKPOINT: 768,
  CACHE_VALIDITY: 60 * 1000, // 1분
  TOAST_DURATION: 3000,
  DEFAULT_THEME_COLOR: '#3B82F6'
} as const;