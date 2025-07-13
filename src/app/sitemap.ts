import { MetadataRoute } from 'next';
import { routing } from '@/i18n/routing'; // next-intl 라우팅 설정 가져오기

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mandalart.app';

export default function sitemap(): MetadataRoute.Sitemap {
  // 모든 페이지 경로를 정의합니다.
  // 실제 애플리케이션의 페이지 구조에 따라 추가/수정해야 합니다.
  const pages = [
    '/',
    '/app',
    '/app/settings',
    '/app/profile',
    // '/app/cell/[id]'와 같은 동적 경로는 별도로 처리해야 합니다.
    // 여기서는 정적 경로만 예시로 포함합니다.
    '/auth/login',
    '/auth/signup',
  ];

  return routing.locales.flatMap(locale =>
    pages.map(page => ({
      url: `${baseUrl}/${locale}${page}`,
      lastModified: new Date(),
      alternates: {
        languages: Object.fromEntries(
          routing.locales.map(l => [l, `${baseUrl}/${l}${page}`])
        )
      }
    }))
  );
}