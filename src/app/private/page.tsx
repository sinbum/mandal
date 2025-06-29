import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import HeaderBar from '@/components/layout/HeaderBar';
import MobileLayout from '@/components/layout/MobileLayout';
import BottomBar from '@/components/layout/BottomBar';

export default async function PrivatePage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect('/login')
  }

  return (
    <MobileLayout
      header={
        <HeaderBar
          title="Private"
          showBackButton
          href="/"
        />
      }
      footer={<div className="sm:hidden"><BottomBar /></div>}
    >
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h1 className="text-xl font-bold mb-4">비공개 페이지</h1>
          <p className="text-gray-600">안녕하세요, {data.user.email}님!</p>
          <p className="text-sm text-gray-500 mt-2">이 페이지는 로그인한 사용자만 접근할 수 있습니다.</p>
        </div>
      </div>
    </MobileLayout>
  );
}