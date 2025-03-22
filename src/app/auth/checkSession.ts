import { createClient } from "@/utils/supabase/client";

import router from "next/router";

export const checkSession = async (setLoading: (loading: boolean) => void, setUserName: (userName: string) => void) => {
    try {
      setLoading(true);
      const supabase = createClient();
      const { data, error } = await supabase.auth.getSession();
      
      console.log('세션 확인 결과:', data.session ? '세션 있음' : '세션 없음');
      
      if (error) {
        console.error('세션 조회 오류:', error);
        router.push('/login');
        return;
      }
      
      if (!data.session) {
        console.log('세션이 없어 로그인 페이지로 이동합니다.');
        router.push('/login');
        return;
      }

      // 사용자 데이터 가져오기
      const { data: userData, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        console.error('사용자 정보 조회 오류:', userError);
        router.push('/login');
        return;
      }
      
      if (userData.user) {
        console.log('사용자 정보 로드 성공:', userData.user.email);
        // 이메일에서 사용자 이름 추출 (@ 앞 부분)
        const email = userData.user.email || '';
        const displayName = email.split('@')[0] || '사용자';
        setUserName(displayName);
      } else {
        console.log('사용자 정보가 없습니다.');
        router.push('/login');
      }
    } catch (error) {
      console.error('Session check error:', error);
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };