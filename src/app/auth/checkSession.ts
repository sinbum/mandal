import { checkUserSession, extractDisplayName, SESSION_CACHE } from '@/lib/auth/utils';
import { redirectToLogin } from '@/utils/navigation';

export const checkSession = async (setLoading: (loading: boolean) => void, setUserName: (userName: string) => void) => {
  try {
    setLoading(true);
    
    // 캐시된 데이터 확인
    const cachedData = SESSION_CACHE.get();
    if (cachedData && SESSION_CACHE.isValid(cachedData.timestamp)) {
      console.log('캐시된 사용자 정보 사용');
      setUserName(cachedData.displayName);
      setLoading(false);
      return;
    }
    
    // 세션 확인
    const result = await checkUserSession();
    
    if (!result.success || !(result.data && typeof result.data === 'object' && 'user' in result.data && result.data.user)) {
      console.log('사용자 정보가 없습니다.');
      throw new Error('사용자 정보가 없습니다');
    }
    
    // 이메일에서 사용자 이름 추출
    const userData = result.data as { user: { email?: string } };
    const email = userData.user.email || '';
    const displayName = extractDisplayName(email);
    
    // 데이터 캐싱
    SESSION_CACHE.set(displayName);
    
    setUserName(displayName);
  } catch (error) {
    console.error('Session check error:', error);
    redirectToLogin();
  } finally {
    setLoading(false);
  }
};