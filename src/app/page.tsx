import { redirect } from 'next/navigation';

export default function HomePage() {
  // 홈 페이지에 접근하면 대시보드로 리다이렉트
  redirect('/dashboard');
}
