const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Supabase 클라이언트 초기화
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;

// 서비스 롤 키로 클라이언트 생성 (관리자 권한)
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// 테스트 유저 확인 또는 임시 ID 사용
async function getOrCreateTestUser() {
  try {
    // 실제 Supabase 인증된 유저가 있는지 확인
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();

    if (authError) {
      console.error('인증 유저 조회 오류:', authError);
      // 오류 발생 시에도 임시 ID 사용하도록 계속 진행
    } else if (authUsers && authUsers.users && authUsers.users.length > 0) {
      console.log(`기존 인증 유저 ID를 사용합니다: ${authUsers.users[0].id}`);
      return authUsers.users[0].id;
    }

    // 유저가 없거나 오류 발생 시 임시 ID 사용
    const TEMP_USER_ID = 'f9f8f7f6-e5e4-d3d2-c1c0-b9b8b7b6b5b4';
    console.log(`임시 유저 ID를 사용합니다: ${TEMP_USER_ID}`);
    console.log('주의: 실제 사용자와 연결되지 않은 데이터가 생성됩니다.');
    return TEMP_USER_ID;
  } catch (error) {
    console.error('유저 확인 중 오류 발생:', error);
    // 오류 발생해도 임시 ID로 계속 진행
    const TEMP_USER_ID = 'f9f8f7f6-e5e4-d3d2-c1c0-b9b8b7b6b5b4';
    console.log(`오류로 인해 임시 유저 ID를 사용합니다: ${TEMP_USER_ID}`);
    return TEMP_USER_ID;
  }
}

// 샘플 만다라트 데이터 생성 함수
async function createMandalart(userId, title, colorTag, isTemplate = false) {
  try {
    // 1. 만다라트 생성
    const { data: mandalartData, error: mandalartError } = await supabase
      .from('mandalarts')
      .insert({
        user_id: userId,
        title: title,
        is_template: isTemplate,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select('id')
      .single();

    if (mandalartError) {
      console.error(`'${title}' 만다라트 생성 오류:`, mandalartError);
      return null;
    }

    const mandalartId = mandalartData.id;
    console.log(`'${title}' 만다라트 생성 완료! ID: ${mandalartId}`);

    // 2. 셀 데이터 생성 (81개 셀: 9x9 그리드)
    const cellsToInsert = [];
    
    // 센터 블록 (대목표) - position 40 (중앙)
    cellsToInsert.push({
      mandalart_id: mandalartId,
      position: 40,
      topic: `${title} 중심 목표`,
      memo: '이것은 메인 목표입니다.',
      color: colorTag,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });

    // 서라운딩 셀 8개 (position 40을 중심으로 8방향)
    const surroundingPositions = [31, 32, 33, 39, 41, 47, 48, 49];
    
    for (let i = 0; i < surroundingPositions.length; i++) {
      cellsToInsert.push({
        mandalart_id: mandalartId,
        position: surroundingPositions[i],
        topic: `서브목표 ${i+1}`,
        memo: `${title}의 소목표 ${i+1}입니다.`,
        color: getRandomColor(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    }
    
    // 나머지 셀들 (랜덤한 주제로 몇 개만 채움)
    for (let pos = 0; pos < 81; pos++) {
      if (pos === 40 || surroundingPositions.includes(pos)) continue;
      
      // 약 30% 확률로 셀에 내용 추가
      if (Math.random() < 0.3) {
        cellsToInsert.push({
          mandalart_id: mandalartId,
          position: pos,
          topic: `행동 ${pos}`,
          memo: Math.random() < 0.5 ? `세부 행동 계획 ${pos}` : null,
          color: Math.random() < 0.5 ? getRandomColor() : null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      } else {
        // 빈 셀
        cellsToInsert.push({
          mandalart_id: mandalartId,
          position: pos,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      }
    }

    // 셀 데이터 삽입
    const { error: cellsError } = await supabase
      .from('mandalart_cells')
      .insert(cellsToInsert);

    if (cellsError) {
      console.error(`'${title}' 셀 데이터 삽입 오류:`, cellsError);
      return null;
    }

    console.log(`'${title}' 만다라트의 셀 데이터 ${cellsToInsert.length}개 생성 완료!`);
    return mandalartId;
  } catch (error) {
    console.error(`'${title}' 만다라트 생성 처리 중 예외 발생:`, error);
    return null;
  }
}

// 랜덤 색상 생성
function getRandomColor() {
  const colors = [
    '#FF6B6B', '#FF9E7D', '#FFDA77', '#A0D995', '#83BCFF', 
    '#A78BFA', '#F39FDC', '#FFC9DD', '#CBDAFC'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

// 메인 실행 함수
async function main() {
  console.log('Supabase에 샘플 만다라트 데이터 추가 시작...');

  try {
    // 테스트 유저 확인 또는 임시 ID 사용
    const userId = await getOrCreateTestUser();
    
    // 샘플 1: 개인 성장 계획
    await createMandalart(userId, '개인 성장 계획', '#A78BFA');
    
    // 샘플 2: 2025년 목표
    await createMandalart(userId, '2025년 목표', '#83BCFF');
    
    // 샘플 3: 건강 관리 (템플릿으로 설정)
    await createMandalart(userId, '건강 관리 계획', '#A0D995', true);

    console.log('샘플 데이터 추가 완료!');
  } catch (error) {
    console.error('전체 실행 오류:', error);
  }
}

// 스크립트 실행
main(); 