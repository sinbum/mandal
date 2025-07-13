import {getRequestConfig} from 'next-intl/server';
import {routing} from './routing';
import {loadMessages} from '@/utils/loadMessages';

export default getRequestConfig(async ({locale}) => {
  // 유효하지 않은 로케일 검증
  if (!routing.locales.includes(locale as never)) {
    // 기본 로케일로 폴백
    locale = routing.defaultLocale;
  }

  try {
    // YAML 파일에서 번역 메시지 로드
    const messages = await loadMessages(locale);
    
    return {
      locale, // 검증된 로케일 사용
      messages,
      // 시간대 설정 (필요시)
      timeZone: locale === 'ja' ? 'Asia/Tokyo' : 'Asia/Seoul',
      // 기본 날짜 형식
      formats: {
        dateTime: {
          short: {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
          }
        }
      }
    };
  } catch (error) {
    console.error(`Failed to load messages for locale ${locale}:`, error);
    
    // 에러 발생 시 기본 로케일로 폴백
    const fallbackMessages = await loadMessages(routing.defaultLocale);
    
    return {
      locale: routing.defaultLocale, // 기본 로케일 사용
      messages: fallbackMessages,
      timeZone: 'Asia/Seoul'
    };
  }
});