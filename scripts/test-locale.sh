#!/bin/bash

# 다국어 기능 자동 테스트 스크립트

echo "🌍 다국어 기능 테스트 시작..."

# 1. 서버가 실행 중인지 확인
if ! curl -s http://localhost:3006 > /dev/null; then
    echo "❌ 개발 서버가 실행되지 않았습니다. 'npm run dev'를 먼저 실행해주세요."
    exit 1
fi

echo "✅ 개발 서버 실행 확인"

# 2. 각 언어별 페이지 접근 테스트
declare -a locales=("ko" "en" "ja")
declare -a locale_names=("한국어" "English" "日本語")

for i in "${!locales[@]}"; do
    locale=${locales[$i]}
    name=${locale_names[$i]}
    
    echo "📍 $name ($locale) 테스트..."
    
    # 해당 언어 페이지에 접근
    response=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:3006/$locale")
    
    if [ "$response" -eq 200 ]; then
        echo "  ✅ $name 페이지 접근 성공 (HTTP $response)"
    else
        echo "  ❌ $name 페이지 접근 실패 (HTTP $response)"
    fi
done

# 3. Accept-Language 헤더 테스트
echo ""
echo "🌐 Accept-Language 헤더 테스트..."

# 각 언어별 Accept-Language 헤더로 루트 경로 접근
declare -a headers=("ko-KR,ko;q=0.9" "en-US,en;q=0.9" "ja-JP,ja;q=0.9")
declare -a expected_redirects=("/ko" "/en" "/ja")

for i in "${!headers[@]}"; do
    header=${headers[$i]}
    expected=${expected_redirects[$i]}
    
    echo "📡 Accept-Language: $header"
    
    # 리다이렉트 위치 확인
    redirect_location=$(curl -s -I -H "Accept-Language: $header" "http://localhost:3006/" | grep -i "location:" | cut -d' ' -f2 | tr -d '\r')
    
    if [[ "$redirect_location" == *"$expected"* ]]; then
        echo "  ✅ 올바른 언어로 리다이렉트: $redirect_location"
    else
        echo "  ⚠️  예상과 다른 리다이렉트: $redirect_location (예상: $expected)"
    fi
done

# 4. 번역 파일 유효성 검사
echo ""
echo "📝 번역 파일 유효성 검사..."

for locale in "${locales[@]}"; do
    file="src/messages/$locale.yaml"
    if [ -f "$file" ]; then
        echo "  ✅ $file 존재"
        
        # YAML 문법 검사 (yq가 설치되어 있다면)
        if command -v yq &> /dev/null; then
            if yq eval '.' "$file" > /dev/null 2>&1; then
                echo "    ✅ YAML 문법 유효"
            else
                echo "    ❌ YAML 문법 오류"
            fi
        fi
    else
        echo "  ❌ $file 없음"
    fi
done

echo ""
echo "🎯 테스트 완료!"
echo ""
echo "📋 수동 테스트 가이드:"
echo "1. 브라우저에서 http://localhost:3006 접속"
echo "2. 우하단 🌍 버튼 클릭하여 다국어 테스터 사용"
echo "3. 브라우저 언어 설정 변경 후 테스트"
echo "4. 개발자 도구에서 Network 탭으로 리다이렉트 확인"