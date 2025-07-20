# 다국어 기능 테스트 가이드

## 1. 로컬 개발 환경에서 테스트

### URL 직접 접근
```
http://localhost:3006/ko    # 한국어
http://localhost:3006/en    # 영어
http://localhost:3006/ja    # 일본어
```

### 브라우저 언어 설정 변경
1. Chrome 설정 → 고급 → 언어 → 언어 추가
2. 우선순위 변경 후 새로고침
3. 자동 리다이렉트 확인

## 2. Accept-Language 헤더 테스트

### curl 명령어로 테스트
```bash
# 영어 요청
curl -H "Accept-Language: en-US,en;q=0.9" http://localhost:3006/

# 일본어 요청  
curl -H "Accept-Language: ja-JP,ja;q=0.9" http://localhost:3006/

# 한국어 요청
curl -H "Accept-Language: ko-KR,ko;q=0.9" http://localhost:3006/
```

### Postman/Insomnia 사용
Headers에 `Accept-Language` 추가하여 테스트

## 3. 실제 지역 시뮬레이션

### VPN 사용
1. 일본 VPN → 일본어 자동 감지 확인
2. 미국 VPN → 영어 자동 감지 확인
3. 한국 VPN → 한국어 자동 감지 확인

### 모바일 디바이스
1. Android/iOS 언어 설정 변경
2. 모바일 브라우저에서 접속 테스트

## 4. 자동화된 테스트

### Playwright를 활용한 E2E 테스트
```javascript
// tests/locale.spec.js
import { test, expect } from '@playwright/test';

test('다국어 자동 감지 테스트', async ({ page, context }) => {
  // 브라우저 언어를 일본어로 설정
  await context.setExtraHTTPHeaders({
    'Accept-Language': 'ja-JP,ja;q=0.9'
  });
  
  await page.goto('/');
  
  // 일본어로 리다이렉트되는지 확인
  await expect(page).toHaveURL('/ja');
  
  // 일본어 텍스트가 표시되는지 확인
  await expect(page.locator('h1')).toContainText('ダッシュボード');
});
```

## 5. 브라우저 개발자 도구 활용

### Application 탭에서 확인
1. F12 → Application → Local Storage
2. `NEXT_LOCALE` 값 확인
3. 쿠키에서 언어 설정 확인

### Network 탭에서 확인
1. 페이지 새로고침
2. Request Headers의 `Accept-Language` 확인
3. Response에서 리다이렉트 여부 확인

## 6. 실제 번역 품질 테스트

### 체크리스트
- [ ] 네비게이션 메뉴 번역
- [ ] 에러 메시지 번역
- [ ] 폼 라벨 및 플레이스홀더
- [ ] 버튼 텍스트
- [ ] 날짜/시간 형식
- [ ] 숫자 형식 (1,000 vs 1.000)

### 테스트 시나리오
1. 회원가입 → 로그인 → 대시보드 → 설정
2. 각 단계에서 모든 텍스트가 올바른 언어로 표시되는지 확인
3. 에러 상황에서도 올바른 언어로 메시지 표시되는지 확인

## 7. 성능 테스트

### 언어별 번들 크기 확인
```bash
npm run build
npm run analyze
```

### 번역 파일 로딩 시간 측정
- Network 탭에서 messages/*.yaml 파일 로딩 시간 확인
- 초기 로딩 성능 vs 런타임 성능 비교