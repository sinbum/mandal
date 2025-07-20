// 브라우저 콘솔에서 사용할 수 있는 다국어 테스트 스크립트

// 1. 현재 언어 확인
console.log('Current locale:', document.documentElement.lang);
console.log('Browser language:', navigator.language);
console.log('Browser languages:', navigator.languages);

// 2. URL로 언어 변경 테스트
function testLocale(locale) {
  const currentPath = window.location.pathname;
  const newPath = currentPath.replace(/^\/[a-z]{2}(\/|$)/, `/${locale}$1`);
  window.location.href = newPath;
}

// 3. 사용법
// testLocale('en') - 영어로 변경
// testLocale('ja') - 일본어로 변경  
// testLocale('ko') - 한국어로 변경

// 4. 번역된 텍스트 확인
function checkTranslations() {
  const elements = document.querySelectorAll('[data-testid*="translation"]');
  elements.forEach(el => {
    console.log(`Element: ${el.tagName}, Text: "${el.textContent}"`);
  });
}

console.log('테스트 함수 사용법:');
console.log('- testLocale("en") - 영어로 변경');
console.log('- testLocale("ja") - 일본어로 변경');
console.log('- testLocale("ko") - 한국어로 변경');
console.log('- checkTranslations() - 번역 텍스트 확인');