'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useLocale } from 'next-intl';

const LocaleTester = () => {
  const router = useRouter();
  const pathname = usePathname();
  const currentLocale = useLocale();
  const [isVisible, setIsVisible] = useState(false);

  const locales = [
    { code: 'ko', name: '한국어', flag: '🇰🇷' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'ja', name: '日本語', flag: '🇯🇵' }
  ];

  const changeLocale = (newLocale: string) => {
    const newPathname = pathname.replace(`/${currentLocale}`, `/${newLocale}`);
    router.push(newPathname);
  };

  const simulateRegion = (region: string) => {
    const acceptLanguage = {
      'US': 'en-US,en;q=0.9',
      'JP': 'ja-JP,ja;q=0.9',  
      'KR': 'ko-KR,ko;q=0.9'
    }[region];

    if (acceptLanguage) {
      // 새 탭에서 헤더를 시뮬레이션한 요청 (실제로는 서버 테스트용)
      console.log(`Simulating request from ${region} with Accept-Language: ${acceptLanguage}`);
      alert(`실제 테스트시에는 VPN을 사용하거나 브라우저 언어 설정을 변경해주세요.\n\nAccept-Language: ${acceptLanguage}`);
    }
  };

  const getCurrentInfo = () => {
    return {
      currentLocale,
      pathname,
      browserLanguage: typeof navigator !== 'undefined' ? navigator.language : 'N/A',
      browserLanguages: typeof navigator !== 'undefined' ? navigator.languages : [],
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'N/A',
      cookies: typeof document !== 'undefined' ? document.cookie : 'N/A'
    };
  };

  const clearLocaleData = () => {
    // 로케일 관련 쿠키 삭제
    if (typeof document !== 'undefined') {
      document.cookie = 'NEXT_LOCALE=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      document.cookie = 'locale=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      
      // 로컬 스토리지도 정리
      localStorage.removeItem('locale');
      localStorage.removeItem('NEXT_LOCALE');
      
      alert('로케일 데이터가 초기화되었습니다. 페이지를 새로고침하면 브라우저 언어로 자동 감지됩니다.');
    }
  };

  const testAutoDetection = () => {
    // 루트 경로로 이동하여 자동 감지 테스트
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  if (process.env.NODE_ENV !== 'development') {
    return null; // 프로덕션에서는 표시하지 않음
  }

  return (
    <>
      {/* 토글 버튼 */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="fixed bottom-4 right-4 z-50 bg-blue-600 text-white p-2 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
        title="다국어 테스터"
      >
        🌍
      </button>

      {/* 테스터 패널 */}
      {isVisible && (
        <div className="fixed bottom-16 right-4 z-50 bg-white border border-gray-300 rounded-lg shadow-xl p-4 w-80 max-h-96 overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg">🌍 다국어 테스터</h3>
            <button 
              onClick={() => setIsVisible(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          {/* 현재 상태 */}
          <div className="mb-4 p-3 bg-gray-50 rounded">
            <h4 className="font-semibold mb-2">현재 상태</h4>
            <div className="text-sm space-y-1">
              <div><strong>현재 언어:</strong> {currentLocale}</div>
              <div><strong>경로:</strong> {pathname}</div>
              <div><strong>브라우저 언어:</strong> {getCurrentInfo().browserLanguage}</div>
            </div>
          </div>

          {/* 언어 변경 */}
          <div className="mb-4">
            <h4 className="font-semibold mb-2">언어 변경</h4>
            <div className="grid grid-cols-1 gap-2">
              {locales.map((locale) => (
                <button
                  key={locale.code}
                  onClick={() => changeLocale(locale.code)}
                  className={`p-2 rounded border text-left ${
                    currentLocale === locale.code 
                      ? 'bg-blue-100 border-blue-300' 
                      : 'hover:bg-gray-50'
                  }`}
                >
                  {locale.flag} {locale.name} ({locale.code})
                </button>
              ))}
            </div>
          </div>

          {/* 자동 감지 테스트 */}
          <div className="mb-4">
            <h4 className="font-semibold mb-2">자동 감지 테스트</h4>
            <div className="space-y-2">
              <button
                onClick={clearLocaleData}
                className="w-full p-2 bg-yellow-50 hover:bg-yellow-100 border border-yellow-200 rounded text-sm"
              >
                🗑️ 로케일 데이터 초기화
              </button>
              <button
                onClick={testAutoDetection}
                className="w-full p-2 bg-green-50 hover:bg-green-100 border border-green-200 rounded text-sm"
              >
                🔄 자동 감지 테스트 (루트로 이동)
              </button>
            </div>
          </div>

          {/* 지역 시뮬레이션 */}
          <div className="mb-4">
            <h4 className="font-semibold mb-2">지역 시뮬레이션</h4>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => simulateRegion('US')}
                className="p-2 bg-blue-50 hover:bg-blue-100 rounded text-sm"
              >
                🇺🇸 미국
              </button>
              <button
                onClick={() => simulateRegion('JP')}
                className="p-2 bg-red-50 hover:bg-red-100 rounded text-sm"
              >
                🇯🇵 일본
              </button>
              <button
                onClick={() => simulateRegion('KR')}
                className="p-2 bg-green-50 hover:bg-green-100 rounded text-sm"
              >
                🇰🇷 한국
              </button>
            </div>
          </div>

          {/* 디버그 정보 */}
          <details className="text-xs">
            <summary className="cursor-pointer font-semibold">디버그 정보</summary>
            <pre className="mt-2 p-2 bg-gray-100 rounded overflow-x-auto">
              {JSON.stringify(getCurrentInfo(), null, 2)}
            </pre>
          </details>
        </div>
      )}
    </>
  );
};

export default LocaleTester;