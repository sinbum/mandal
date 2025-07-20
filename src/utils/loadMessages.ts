import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';

/**
 * YAML 번역 파일을 로드하는 함수
 * @param locale 언어 코드 (ko, en, ja)
 * @returns 번역 객체
 */
export async function loadMessages(locale: string): Promise<Record<string, unknown>> {
  try {
    const filePath = path.join(process.cwd(), 'src/messages', `${locale}.yaml`);
    
    // 파일 존재 여부 확인
    if (!fs.existsSync(filePath)) {
      console.warn(`Translation file not found for locale: ${locale}`);
      // 기본 언어로 폴백
      const fallbackPath = path.join(process.cwd(), 'src/messages', 'en.yaml');
      if (fs.existsSync(fallbackPath)) {
        const fallbackContents = fs.readFileSync(fallbackPath, 'utf8');
        return yaml.load(fallbackContents) as Record<string, unknown>;
      }
      return {};
    }
    
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const messages = yaml.load(fileContents) as Record<string, unknown>;
    
    if (!messages) {
      console.warn(`Empty or invalid YAML file for locale: ${locale}`);
      return {};
    }
    
    return messages;
  } catch (error) {
    console.error(`Error loading messages for locale ${locale}:`, error);
    return {};
  }
}

/**
 * 지원되는 로케일 목록
 */
export const supportedLocales = ['ko', 'en', 'ja'] as const;
export type SupportedLocale = typeof supportedLocales[number];

/**
 * 기본 로케일
 */
export const defaultLocale: SupportedLocale = 'en';

/**
 * 로케일 유효성 검사
 * @param locale 검사할 로케일
 * @returns 유효한 로케일 여부
 */
export function isValidLocale(locale: string): locale is SupportedLocale {
  return supportedLocales.includes(locale as SupportedLocale);
}