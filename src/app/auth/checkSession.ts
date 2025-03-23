import { createClient } from "@/utils/supabase/client";

export const checkSession = async (setLoading: (loading: boolean) => void, setUserName: (userName: string) => void) => {
    try {
      setLoading(true);
      const supabase = createClient();
      
      // 캐싱을 위한 세션 스토리지 키
      const USER_CACHE_KEY = 'userSessionCache';
      
      // 브라우저 환경에서만 sessionStorage 사용
      if (typeof window !== 'undefined') {
        // 캐시된 데이터가 있는지 확인
        const cachedData = sessionStorage.getItem(USER_CACHE_KEY);
        if (cachedData) {
          const { displayName, timestamp } = JSON.parse(cachedData);
          const now = new Date().getTime();
          
          // 캐시 유효 시간 (1분)
          const CACHE_VALIDITY = 60 * 1000;
          
          // 캐시가 유효한 경우 캐시된 데이터 사용
          if (now - timestamp < CACHE_VALIDITY) {
            console.log('캐시된 사용자 정보 사용');
            setUserName(displayName);
            setLoading(false);
            return;
          }
        }
      }
      
      // getUser를 통해 한 번에 사용자 정보와 세션 정보 가져오기
      const { data: userData, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        console.error('사용자 정보 조회 오류:', userError);
        throw userError;
      }
      
      if (!userData.user) {
        console.log('사용자 정보가 없습니다.');
        throw new Error('사용자 정보가 없습니다');
      }
      
      // 이메일에서 사용자 이름 추출 (@ 앞 부분)
      const email = userData.user.email || '';
      const displayName = email.split('@')[0] || '사용자';
      
      // 데이터 캐싱
      if (typeof window !== 'undefined') {
        const cacheData = {
          displayName,
          timestamp: new Date().getTime()
        };
        sessionStorage.setItem(USER_CACHE_KEY, JSON.stringify(cacheData));
      }
      
      setUserName(displayName);
    } catch (error) {
      console.error('Session check error:', error);
      
      // 브라우저 환경에서만 실행
      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    } finally {
      setLoading(false);
    }
  };