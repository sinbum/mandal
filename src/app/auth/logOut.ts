import router from "next/router";
import { createClient } from "@/utils/supabase/client";

export const handleLogout = async (setToast: (toast: { message: string, type: 'success' | 'error' | 'info' | 'warning' }) => void) => {
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('로그아웃 오류:', error);
        setToast({
          message: '로그아웃 중 오류가 발생했습니다',
          type: 'error'
        });
        return;
      }
      
      setToast({
        message: '로그아웃되었습니다.',
        type: 'info'
      });
      
      // 바로 로그인 페이지로 이동
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };