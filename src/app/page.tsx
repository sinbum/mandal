import { redirect } from 'next/navigation';
import { routing } from '@/i18n/routing';

// 루트 페이지는 기본 로케일로 리다이렉트
export default function RootPage() {
  redirect(`/${routing.defaultLocale}`);
}