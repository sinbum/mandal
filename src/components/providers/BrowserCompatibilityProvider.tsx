'use client';

import { useEffect } from 'react';

export default function BrowserCompatibilityProvider() {
  useEffect(() => {
    // 삼성 인터넷 브라우저 감지 및 폴리필
    if (typeof window !== 'undefined' && /SamsungBrowser/i.test(navigator.userAgent)) {
      console.log('Samsung Internet detected, applying compatibility fixes');
      
      // Promise 폴리필 (필요시)
      if (!window.Promise.allSettled) {
        (window.Promise as any).allSettled = function(promises: Promise<any>[]) {
          return Promise.all(promises.map(p => 
            Promise.resolve(p).then(
              value => ({ status: 'fulfilled', value }),
              reason => ({ status: 'rejected', reason })
            )
          ));
        };
      }
      
      // setTimeout 0 폴리필 개선
      const originalSetTimeout = window.setTimeout;
      window.setTimeout = function(fn: () => void, delay?: number, ...args: any[]) {
        return originalSetTimeout(fn, Math.max(delay || 0, 4), ...args);
      };
    }
  }, []);

  return null; // 렌더링하지 않음
}