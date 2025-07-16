# 변경 전후 동작 비교 테스트 계획

## 테스트 목표
IP 기반 언어 감지 로직 구현 전후의 동작을 체계적으로 비교하여 기능 개선 효과를 검증하고 기존 기능의 정상 동작을 확인합니다.

## 테스트 환경 설정

### 기준선 측정 (현재 구현)
**현재 상태**: `localeDetection: false`, 고정 `defaultLocale: 'ko'`

### 개선 후 측정 (새로운 구현)
**개선 상태**: IP 기반 언어 감지, 브라우저 언어 감지 활성화

## 비교 테스트 매트릭스

### 1. 기본 라우팅 동작 비교

| 테스트 시나리오 | 현재 결과 | 개선 후 예상 결과 | 검증 방법 |
|---|---|---|---|
| `GET /` | `→ /ko/` | `→ /{detected-locale}/` | curl + 헤더 확인 |
| `GET /` (일본 IP) | `→ /ko/` | `→ /ja/` | VPN + 브라우저 |
| `GET /` (미국 IP) | `→ /ko/` | `→ /en/` | VPN + 브라우저 |
| `GET /` (영어 브라우저) | `→ /ko/` | `→ /en/` | Accept-Language 헤더 |
| `GET /` (일본어 브라우저) | `→ /ko/` | `→ /ja/` | Accept-Language 헤더 |

### 2. 언어 감지 우선순위 비교

| 조건 | 현재 결과 | 개선 후 예상 결과 | 우선순위 |
|---|---|---|---|
| URL: `/en/` + 일본 IP | `/en/` | `/en/` | URL 우선 |
| 쿠키: `ja` + 미국 IP | `/ko/` | `/ja/` | 쿠키 우선 |
| 일본 IP + 영어 브라우저 | `/ko/` | `/ja/` | IP 우선 |
| 미국 IP + 일본어 브라우저 | `/ko/` | `/en/` | IP 우선 |
| 알 수 없는 IP + 일본어 브라우저 | `/ko/` | `/ja/` | 브라우저 우선 |

### 3. 성능 비교

| 메트릭 | 현재 성능 | 개선 후 목표 | 허용 범위 |
|---|---|---|---|
| 첫 번째 요청 응답 시간 | 측정 필요 | < 기준선 + 100ms | ± 50ms |
| 캐시된 요청 응답 시간 | 측정 필요 | < 기준선 + 50ms | ± 20ms |
| 메모리 사용량 | 측정 필요 | < 기준선 + 10MB | ± 5MB |
| 동시 접속 처리 능력 | 측정 필요 | >= 기준선 | -10% 이내 |

## 상세 테스트 케이스

### TC-01: 기본 동작 비교
```bash
# 현재 구현 테스트
curl -I http://localhost:3000 | grep -i location
# 예상: Location: /ko/

# 개선 후 테스트 (다양한 조건)
curl -H "Accept-Language: en-US,en;q=0.9" -I http://localhost:3000
# 예상: Location: /en/

curl -H "Accept-Language: ja-JP,ja;q=0.9" -I http://localhost:3000
# 예상: Location: /ja/
```

### TC-02: 언어 감지 정확도 비교
```bash
# 테스트 스크립트
#!/bin/bash
echo "=== 언어 감지 정확도 테스트 ==="

# 현재 구현
echo "현재 구현:"
for lang in "ko-KR" "en-US" "ja-JP"; do
  result=$(curl -H "Accept-Language: $lang,${lang:0:2};q=0.9" -I http://localhost:3000 2>/dev/null | grep -i location)
  echo "  $lang: $result"
done

# 개선 후 (구현 완료 후 실행)
echo "개선 후:"
for lang in "ko-KR" "en-US" "ja-JP"; do
  result=$(curl -H "Accept-Language: $lang,${lang:0:2};q=0.9" -I http://localhost:3000 2>/dev/null | grep -i location)
  echo "  $lang: $result"
done
```

### TC-03: 성능 비교
```bash
# 응답 시간 측정 스크립트
#!/bin/bash
echo "=== 성능 비교 테스트 ==="

# 현재 구현
echo "현재 구현 응답 시간:"
for i in {1..10}; do
  curl -w "%{time_total}s\n" -o /dev/null -s http://localhost:3000
done | awk '{sum+=$1} END {print "평균:", sum/NR "초"}'

# 개선 후 (구현 완료 후 실행)
echo "개선 후 응답 시간:"
for i in {1..10}; do
  curl -w "%{time_total}s\n" -o /dev/null -s http://localhost:3000
done | awk '{sum+=$1} END {print "평균:", sum/NR "초"}'
```

### TC-04: 메모리 사용량 비교
```bash
# Node.js 프로세스 메모리 사용량 모니터링
#!/bin/bash
echo "=== 메모리 사용량 비교 ==="

# 현재 구현
echo "현재 구현:"
pid=$(pgrep -f "next dev")
if [ ! -z "$pid" ]; then
  ps -p $pid -o pid,rss,vsz,%mem,cmd --no-headers
fi

# 개선 후 (구현 완료 후 실행)
echo "개선 후:"
pid=$(pgrep -f "next dev")
if [ ! -z "$pid" ]; then
  ps -p $pid -o pid,rss,vsz,%mem,cmd --no-headers
fi
```

### TC-05: VPN 환경 비교
**수동 테스트 절차:**

1. **현재 구현 테스트**
   - VPN 연결 전: 한국 IP에서 접속 → `/ko/` 리다이렉트
   - 일본 VPN 연결: 일본 IP에서 접속 → `/ko/` 리다이렉트 (변화 없음)
   - 미국 VPN 연결: 미국 IP에서 접속 → `/ko/` 리다이렉트 (변화 없음)

2. **개선 후 테스트**
   - VPN 연결 전: 한국 IP에서 접속 → `/ko/` 리다이렉트
   - 일본 VPN 연결: 일본 IP에서 접속 → `/ja/` 리다이렉트 (개선됨)
   - 미국 VPN 연결: 미국 IP에서 접속 → `/en/` 리다이렉트 (개선됨)

### TC-06: 브라우저 언어 설정 비교
**수동 테스트 절차:**

1. **현재 구현 테스트**
   - Chrome 언어를 영어로 변경 → `/ko/` 리다이렉트 (변화 없음)
   - Chrome 언어를 일본어로 변경 → `/ko/` 리다이렉트 (변화 없음)

2. **개선 후 테스트**
   - Chrome 언어를 영어로 변경 → `/en/` 리다이렉트 (개선됨)
   - Chrome 언어를 일본어로 변경 → `/ja/` 리다이렉트 (개선됨)

## 회귀 테스트 체크리스트

### 기존 기능 정상 동작 확인
- [ ] 명시적 언어 URL 접근 (`/ko/`, `/en/`, `/ja/`) 정상 동작
- [ ] 로케일 별칭 (`/jp` → `/ja`) 정상 동작
- [ ] 정적 자산 접근 정상 동작
- [ ] API 경로 접근 정상 동작
- [ ] 인증 미들웨어 정상 동작
- [ ] 공개 경로 접근 정상 동작

### 번역 기능 정상 동작 확인
- [ ] 한국어 페이지 번역 정상 표시
- [ ] 영어 페이지 번역 정상 표시
- [ ] 일본어 페이지 번역 정상 표시
- [ ] 언어 전환 기능 정상 동작
- [ ] 번역 누락 항목 없음

### 사용자 경험 정상 동작 확인
- [ ] 언어 변경 시 URL 정상 변경
- [ ] 새로고침 시 언어 설정 유지
- [ ] 뒤로 가기/앞으로 가기 시 언어 설정 유지
- [ ] 언어별 폰트 정상 적용
- [ ] 메타데이터 언어별 정상 생성

## 자동화 테스트 스크립트

### 통합 테스트 스크립트
```bash
#!/bin/bash
# compare-before-after.sh

BASE_URL="http://localhost:3000"
RESULTS_DIR="./test-results"

mkdir -p $RESULTS_DIR

echo "=== 변경 전후 비교 테스트 시작 ==="
echo "테스트 시간: $(date)" | tee $RESULTS_DIR/test-log.txt

# 1. 기본 라우팅 테스트
echo "1. 기본 라우팅 테스트" | tee -a $RESULTS_DIR/test-log.txt
curl -I $BASE_URL 2>/dev/null | grep -i location | tee -a $RESULTS_DIR/basic-routing.txt

# 2. 언어별 헤더 테스트
echo "2. 언어별 헤더 테스트" | tee -a $RESULTS_DIR/test-log.txt
for lang in "ko-KR,ko;q=0.9" "en-US,en;q=0.9" "ja-JP,ja;q=0.9"; do
  echo "  Testing: $lang" | tee -a $RESULTS_DIR/test-log.txt
  curl -H "Accept-Language: $lang" -I $BASE_URL 2>/dev/null | grep -i location | tee -a $RESULTS_DIR/header-test.txt
done

# 3. 성능 테스트
echo "3. 성능 테스트" | tee -a $RESULTS_DIR/test-log.txt
echo "  10회 응답 시간 측정:" | tee -a $RESULTS_DIR/test-log.txt
for i in {1..10}; do
  curl -w "%{time_total}s\n" -o /dev/null -s $BASE_URL | tee -a $RESULTS_DIR/performance.txt
done

# 4. 메모리 사용량 확인
echo "4. 메모리 사용량 확인" | tee -a $RESULTS_DIR/test-log.txt
pid=$(pgrep -f "next dev")
if [ ! -z "$pid" ]; then
  ps -p $pid -o pid,rss,vsz,%mem,cmd --no-headers | tee -a $RESULTS_DIR/memory-usage.txt
fi

# 5. 다양한 경로 테스트
echo "5. 다양한 경로 테스트" | tee -a $RESULTS_DIR/test-log.txt
for path in "/" "/ko/" "/en/" "/ja/" "/jp" "/app" "/auth/login"; do
  echo "  Testing path: $path" | tee -a $RESULTS_DIR/test-log.txt
  curl -I $BASE_URL$path 2>/dev/null | head -n 1 | tee -a $RESULTS_DIR/path-test.txt
done

echo "=== 테스트 완료 ==="
echo "결과 파일: $RESULTS_DIR/"
```

### 연속 모니터링 스크립트
```bash
#!/bin/bash
# continuous-monitor.sh

BASE_URL="http://localhost:3000"
MONITOR_DURATION=300  # 5분
INTERVAL=10           # 10초마다

echo "=== 연속 모니터링 시작 (${MONITOR_DURATION}초) ==="

end_time=$(($(date +%s) + MONITOR_DURATION))

while [ $(date +%s) -lt $end_time ]; do
  timestamp=$(date "+%Y-%m-%d %H:%M:%S")
  
  # 응답 시간 측정
  response_time=$(curl -w "%{time_total}" -o /dev/null -s $BASE_URL)
  
  # 응답 상태 확인
  status_code=$(curl -I $BASE_URL 2>/dev/null | head -n 1 | cut -d' ' -f2)
  
  # 메모리 사용량 확인
  pid=$(pgrep -f "next dev")
  if [ ! -z "$pid" ]; then
    memory=$(ps -p $pid -o rss --no-headers | tr -d ' ')
  else
    memory="N/A"
  fi
  
  echo "$timestamp | 응답시간: ${response_time}s | 상태: $status_code | 메모리: ${memory}KB"
  
  sleep $INTERVAL
done

echo "=== 모니터링 완료 ==="
```

## 테스트 결과 분석

### 성공 기준
1. **기능 개선**
   - IP 기반 언어 감지 정확도 > 80%
   - 브라우저 언어 감지 정확도 > 90%
   - 언어 감지 우선순위 정상 동작

2. **성능 유지**
   - 응답 시간 증가 < 100ms
   - 메모리 사용량 증가 < 10MB
   - 기존 기능 100% 정상 동작

3. **사용자 경험**
   - 해외 사용자 자동 언어 설정 동작
   - 언어 변경 클릭률 50% 감소
   - 언어 관련 문의 감소

### 실패 시 대응 방안
1. **성능 저하 시**
   - 캐싱 최적화
   - 타임아웃 시간 단축
   - 비동기 처리 최적화

2. **기능 오류 시**
   - 단계별 롤백
   - 로그 분석 및 디버깅
   - 폴백 전략 강화

3. **호환성 문제 시**
   - 라이브러리 버전 확인
   - 의존성 충돌 해결
   - 점진적 배포 전략

## 테스트 실행 일정

### 1단계: 기준선 측정 (현재)
- [ ] 현재 구현 성능 측정
- [ ] 기본 동작 확인
- [ ] 기준선 문서화

### 2단계: 개선 구현 후 테스트
- [ ] 새로운 기능 단위 테스트
- [ ] 통합 테스트 실행
- [ ] 비교 분석 수행

### 3단계: 회귀 테스트
- [ ] 기존 기능 정상 동작 확인
- [ ] 성능 영향 분석
- [ ] 사용자 경험 검증

### 4단계: 최종 검증
- [ ] VPN 환경 테스트
- [ ] 브라우저 호환성 테스트
- [ ] 배포 전 최종 확인

## 결론 및 다음 단계

이 비교 테스트 계획을 통해:
1. 현재 구현의 정확한 상태 파악
2. 개선 효과의 정량적 측정
3. 기존 기능의 안정성 보장
4. 사용자 경험 개선 효과 검증

다음 단계로 실제 IP 기반 언어 감지 로직 구현을 진행합니다.