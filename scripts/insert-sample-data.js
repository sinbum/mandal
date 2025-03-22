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

// 샘플 만다라트 데이터 생성 함수 (무한 뎁스 구조)
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

    // 2. 루트 셀 생성 (최상위 셀)
    const rootCellData = {
      mandalart_id: mandalartId,
      parent_id: null,
      position: 0,
      depth: 0,
      topic: `${title} 중심 목표`,
      memo: '이것은 메인 목표입니다.',
      color: colorTag,
      is_completed: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data: rootCell, error: rootCellError } = await supabase
      .from('mandalart_cells')
      .insert(rootCellData)
      .select('id')
      .single();

    if (rootCellError) {
      console.error(`'${title}' 루트 셀 생성 오류:`, rootCellError);
      return null;
    }

    const rootCellId = rootCell.id;
    console.log(`'${title}' 루트 셀 생성 완료! ID: ${rootCellId}`);

    // 3. 첫 번째 레벨 자식 셀 8개 생성 (루트 셀의 직계 자식들)
    await createChildCells(mandalartId, rootCellId, 0, 8, `${title}의 소목표`, colorTag);

    // 4. 두 번째 레벨 자식 셀 생성 (첫 번째 레벨 셀들의 자식들)
    // 첫 번째 레벨의 첫 두 셀에만 자식 셀을 생성하여 데모합니다
    const { data: firstLevelCells } = await supabase
      .from('mandalart_cells')
      .select('id')
      .eq('parent_id', rootCellId)
      .limit(2);

    if (firstLevelCells && firstLevelCells.length > 0) {
      for (let i = 0; i < firstLevelCells.length; i++) {
        const parentCellId = firstLevelCells[i].id;
        await createChildCells(mandalartId, parentCellId, 1, 8, `${title}의 세부 목표 ${i+1}`, getRandomColor());
      }
    }

    console.log(`'${title}' 만다라트 계층 구조 생성 완료!`);
    return mandalartId;
  } catch (error) {
    console.error(`'${title}' 만다라트 생성 처리 중 예외 발생:`, error);
    return null;
  }
}

// 자식 셀 생성 헬퍼 함수
async function createChildCells(mandalartId, parentId, parentDepth, count, topicPrefix, parentColor) {
  const depth = parentDepth + 1;
  const childCells = [];

  for (let i = 0; i < count; i++) {
    // 80%의 확률로 색상을 부모 색상과 다르게, 20%는 부모와 같게
    const cellColor = Math.random() < 0.8 ? getRandomColor() : parentColor;
    
    childCells.push({
      mandalart_id: mandalartId,
      parent_id: parentId,
      position: i,
      depth: depth,
      topic: `${topicPrefix} ${i+1}`,
      memo: Math.random() < 0.6 ? `${topicPrefix} ${i+1}에 대한 메모입니다.` : null,
      color: cellColor,
      is_completed: Math.random() < 0.3, // 약 30%의 확률로 완료 상태로 설정
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
  }

  const { error: childCellsError } = await supabase
    .from('mandalart_cells')
    .insert(childCells);

  if (childCellsError) {
    console.error(`자식 셀 데이터 삽입 오류:`, childCellsError);
    return false;
  }

  console.log(`부모 셀 ID: ${parentId}의 자식 셀 ${count}개 생성 완료 (깊이: ${depth})`);
  return true;
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
  console.log('Supabase에 계층형 구조의 샘플 만다라트 데이터 추가 시작...');

  try {
    // 테스트 유저 확인 또는 임시 ID 사용
    const userId = await getOrCreateTestUser();
    
    // 샘플 1: 개인 성장 계획
    await createMandalart(userId, '개인 성장 계획', '#A78BFA');
    
    // 샘플 2: 2025년 목표
    await createMandalart(userId, '2025년 목표', '#83BCFF');
    
    // 샘플 3: 건강 관리 (템플릿으로 설정)
    await createMandalart(userId, '건강 관리 계획', '#A0D995', true);

    console.log('계층형 구조의 샘플 데이터 추가 완료!');
  } catch (error) {
    console.error('전체 실행 오류:', error);
  }
}

// 스크립트 실행
main();