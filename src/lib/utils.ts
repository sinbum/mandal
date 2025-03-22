/**
 * 날짜 문자열을 포맷팅하는 함수
 * @param dateString - ISO 형식의 날짜 문자열
 * @returns 포맷팅된 날짜 문자열 (예: '2023년 4월 15일')
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * 간략한 날짜 포맷팅 함수 (오늘, 어제, 그외 날짜)
 * @param dateString - ISO 형식의 날짜 문자열
 * @returns 포맷팅된 간략 날짜 문자열
 */
export function formatRelativeDate(dateString: string): string {
  const date = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  if (date >= today) {
    return '오늘';
  } else if (date >= yesterday) {
    return '어제';
  } else {
    return formatDate(dateString);
  }
}

/**
 * 숫자에 천 단위 콤마를 추가하는 함수
 * @param num - 숫자
 * @returns 천 단위 콤마가 추가된 문자열
 */
export function formatNumber(num: number): string {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * 문자열을 주어진 길이로 제한하는 함수
 * @param str - 원본 문자열
 * @param maxLength - 최대 길이
 * @returns 제한된 문자열 (필요한 경우 ...이 추가됨)
 */
export function truncateString(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength) + '...';
}

/**
 * UUID 생성 함수
 * @returns UUID 문자열
 */
export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * 객체의 깊은 복사본을 생성하는 함수
 * @param obj - 복사할 객체
 * @returns 깊은 복사된 객체
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * 브라우저의 로컬 스토리지에서 데이터를 가져오는 함수
 * @param key - 스토리지 키
 * @param defaultValue - 기본값 (키가 없을 경우 반환)
 * @returns 저장된 값 또는 기본값
 */
export function getFromStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error('LocalStorage get error:', error);
    return defaultValue;
  }
}

/**
 * 브라우저의 로컬 스토리지에 데이터를 저장하는 함수
 * @param key - 스토리지 키
 * @param value - 저장할 값
 */
export function saveToStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('LocalStorage save error:', error);
  }
} 