import { Mandalart, MandalartCell, MandalartCellWithChildren } from '@/types/mandalart';
import { createClient } from '@/utils/supabase/client';
import { convertDbCellsToMandalart } from '@/utils/mandalartUtils';

/**
 * 특정 ID의 만다라트 데이터 로드
 */
export const fetchMandalartById = async (id: string): Promise<Mandalart | null> => {
  try {
    const supabase = createClient();
    
    // 만다라트 기본 정보 가져오기
    const { data: mandalartData, error: mandalartError } = await supabase
      .from('mandalarts')
      .select('*')
      .eq('id', id)
      .single();
    
    if (mandalartError) {
      throw new Error(mandalartError.message);
    }
    
    if (!mandalartData) {
      return null;
    }
    
    // 최적화: 루트 셀만 로드 (계층형 구조의 경우)
    const { data: rootCellData, error: rootCellError } = await supabase
      .from('mandalart_cells')
      .select('*')
      .eq('mandalart_id', id)
      .is('parent_id', null)
      .eq('depth', 0)
      .limit(1)
      .single();
    
    if (rootCellError && rootCellError.code !== 'PGRST116') { // 결과 없음 오류는 무시
      console.log('루트 셀 로드 실패, 레거시 모드로 전환:', rootCellError);
      // 레거시 구조로 처리
      return await fetchLegacyMandalartById(id, mandalartData);
    }
    
    if (rootCellData) {
      // 계층형 구조로 처리
      // 루트 셀의 직접 자식만 추가로 로드 (첫 단계 최적화)
      const { data: directChildrenData, error: directChildrenError } = await supabase
        .from('mandalart_cells')
        .select('*')
        .eq('mandalart_id', id)
        .eq('parent_id', rootCellData.id)
        .order('position', { ascending: true });
      
      if (directChildrenError) {
        console.warn('자식 셀 로드 실패, 빈 자식으로 처리:', directChildrenError);
      }
      
      // 계층형 구조로 변환
      const hierarchicalMandalart: Mandalart = {
        id: mandalartData.id,
        title: mandalartData.title,
        createdAt: mandalartData.created_at,
        updatedAt: mandalartData.updated_at,
        rootCell: {
          id: rootCellData.id,
          topic: rootCellData.topic || '',
          memo: rootCellData.memo,
          color: rootCellData.color,
          imageUrl: rootCellData.image_url,
          isCompleted: rootCellData.is_completed,
          depth: rootCellData.depth || 0,
          position: rootCellData.position || 0,
          children: (directChildrenData || []).map(child => ({
            id: child.id,
            topic: child.topic || '',
            memo: child.memo,
            color: child.color,
            imageUrl: child.image_url,
            isCompleted: child.is_completed,
            parentId: child.parent_id,
            depth: child.depth || 1,
            position: child.position || 0,
            children: [] // 초기에는 빈 배열로 설정 (필요 시 추가 로드)
          }))
        }
      };
      
      return hierarchicalMandalart;
    } else {
      // 레거시 구조로 처리
      return await fetchLegacyMandalartById(id, mandalartData);
    }
  } catch (err) {
    console.error('만다라트 데이터 조회 실패:', err);
    throw err;
  }
};

/**
 * 레거시 구조의 만다라트 로드 (별도 함수로 분리)
 */
export const fetchLegacyMandalartById = async (id: string, mandalartData: any): Promise<Mandalart | null> => {
  try {
    const supabase = createClient();
    
    // 레거시 구조의 모든 셀 로드
    const { data: cellsData, error: cellsError } = await supabase
      .from('mandalart_cells')
      .select('*')
      .eq('mandalart_id', id)
      .order('position', { ascending: true });
    
    if (cellsError) {
      throw new Error(cellsError.message);
    }
    
    // 레거시 2D 구조 처리
    const formattedMandalart = convertDbCellsToMandalart(mandalartData, cellsData || []);
    return formattedMandalart;
  } catch (err) {
    console.error('레거시 만다라트 데이터 조회 실패:', err);
    throw err;
  }
};

/**
 * 셀 데이터 업데이트
 */
export const updateCellById = async (cellId: string, updatedCell: Partial<MandalartCell>): Promise<void> => {
  try {
    const supabase = createClient();
    
    if (!cellId) {
      console.error('셀 업데이트 API 오류: cellId가 없습니다', { cellId });
      throw new Error('셀 ID가 필요합니다');
    }
    
    const updatePayload = {
      topic: updatedCell.topic,
      memo: updatedCell.memo,
      color: updatedCell.color,
      image_url: updatedCell.imageUrl,
      is_completed: updatedCell.isCompleted,
      updated_at: new Date().toISOString()
    };
    
    console.log('셀 업데이트 API 요청:', {
      cellId,
      updatedData: updatePayload
    });
    
    // Supabase API로 셀 업데이트
    const { error, status, statusText, data } = await supabase
      .from('mandalart_cells')
      .update(updatePayload)
      .eq('id', cellId);
    
    console.log('셀 업데이트 API 응답:', { status, statusText, data, error });
    
    if (error) {
      console.error('셀 업데이트 API 에러:', error);
      throw new Error(error.message);
    }
    
    console.log('셀 업데이트 API 성공:', { cellId, status });
  } catch (err) {
    console.error('셀 업데이트 API 오류:', err);
    throw err;
  }
};

/**
 * 새 만다라트 생성
 */
export const createNewMandalart = async (title: string, templateId?: string): Promise<string> => {
  try {
    const supabase = createClient();
    
    // 현재 로그인한 사용자 정보 가져오기
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('인증된 사용자가 없습니다. 로그인이 필요합니다.');
    }
    
    if (templateId) {
      try {
        // 템플릿 기반 복제 (RPC 호출)
        const { data, error } = await supabase
          .rpc('duplicate_mandalart_from_template', {
            _template_id: templateId,
            _user_id: user.id // 실제 인증된 사용자 ID 사용
          });
        
        if (error) throw error;
        return data as string;
      } catch (rpcError) {
        console.error('RPC 호출 실패, 직접 데이터 삽입으로 전환:', rpcError);
        
        // 백업: RPC 호출 실패 시 직접 템플릿 데이터 삽입
        return await createMandalartFromTemplateDirectly(supabase, title, templateId, user.id);
      }
    } else {
      // 새 만다라트 생성 (RPC 호출)
      try {
        const { data, error } = await supabase
          .rpc('create_mandalart_with_cells', {
            _title: title,
            _user_id: user.id
          });
        
        if (error) throw error;
        return data as string;
      } catch (rpcError) {
        console.error('RPC 호출 실패, 직접 데이터 삽입으로 전환:', rpcError);
        
        // 백업: RPC 호출 실패 시 직접 빈 만다라트 데이터 삽입
        return await createEmptyMandalartDirectly(supabase, title, user.id);
      }
    }
  } catch (err) {
    console.error('만다라트 생성 API 오류:', err);
    throw err;
  }
};

/**
 * 템플릿 기반 만다라트 직접 생성 (RPC 호출 실패 시 백업 함수)
 */
const createMandalartFromTemplateDirectly = async (
  supabase: any,
  title: string,
  templateId: string,
  userId: string
): Promise<string> => {
  // 1. 새 만다라트 레코드 생성
  const { data: mandalartData, error: mandalartError } = await supabase
    .from('mandalarts')
    .insert({
      title: title,
      user_id: userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .select('id')
    .single();

  if (mandalartError) throw mandalartError;
  const newMandalartId = mandalartData.id;

  // 2. 템플릿 ID에 따라 처리
  if (templateId === 'goal' || templateId === 'skill') {
    // 루트 셀 먼저 생성
    const rootCellTopic = templateId === 'goal' ? '1년 목표' : '기술 습득';
    const rootCellMemo = templateId === 'goal' 
      ? '1년 동안 이루고 싶은 목표를 설정하세요' 
      : '배우고 싶은 기술들을 관리하세요';
    
    const { data: rootCell, error: rootCellError } = await supabase
      .from('mandalart_cells')
      .insert({
        mandalart_id: newMandalartId,
        topic: rootCellTopic,
        memo: rootCellMemo,
        position: 0,
        depth: 0,
        parent_id: null,
        is_completed: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select('id')
      .single();

    if (rootCellError) throw rootCellError;

    // 8개의 주요 영역 생성
    const childTopics = templateId === 'goal' 
      ? [
          { topic: '건강', position: 1 },
          { topic: '재정', position: 2 },
          { topic: '경력', position: 3 },
          { topic: '관계', position: 4 },
          { topic: '자기계발', position: 5 },
          { topic: '취미', position: 6 },
          { topic: '여행', position: 7 },
          { topic: '생활환경', position: 8 }
        ]
      : [
          { topic: '프로그래밍', position: 1 },
          { topic: '언어', position: 2 },
          { topic: '디자인', position: 3 },
          { topic: '비즈니스', position: 4 },
          { topic: '소통', position: 5 },
          { topic: '마케팅', position: 6 },
          { topic: '분석', position: 7 },
          { topic: '리더십', position: 8 }
        ];

    // 자식 셀 생성
    const childCells = childTopics.map(item => ({
      mandalart_id: newMandalartId,
      topic: item.topic,
      memo: templateId === 'goal' 
        ? `${item.topic}과 관련된 목표를 설정하세요` 
        : `${item.topic} 관련 기술을 구체화하세요`,
      position: item.position,
      depth: 1,
      parent_id: rootCell.id,
      is_completed: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));

    const { error: childrenError } = await supabase
      .from('mandalart_cells')
      .insert(childCells);

    if (childrenError) {
      console.error('템플릿 자식 셀 삽입 오류:', childrenError);
      throw childrenError;
    }
  } else {
    // 알 수 없는 템플릿은 빈 템플릿으로 처리
    return await createEmptyMandalartDirectly(supabase, title, userId, newMandalartId);
  }

  return newMandalartId;
};

/**
 * 빈 만다라트 직접 생성 (RPC 호출 실패 시 백업 함수)
 */
const createEmptyMandalartDirectly = async (
  supabase: any,
  title: string,
  userId: string,
  existingMandalartId?: string
): Promise<string> => {
  let mandalartId: string;
  
  // 만다라트 ID가 없으면 새로 생성
  if (!existingMandalartId) {
    const { data: mandalartData, error: mandalartError } = await supabase
      .from('mandalarts')
      .insert({
        title: title,
        user_id: userId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select('id')
      .single();

    if (mandalartError) throw mandalartError;
    mandalartId = mandalartData.id;
  } else {
    mandalartId = existingMandalartId;
  }

  // 루트 셀 생성
  const { data: rootCellData, error: rootCellError } = await supabase
    .from('mandalart_cells')
    .insert({
      mandalart_id: mandalartId,
      topic: title,
      memo: '',
      position: 0,
      depth: 0,
      parent_id: null,
      is_completed: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .select('id')
    .single();

  if (rootCellError) throw rootCellError;
  
  // 8개의 빈 하위 셀 생성
  const childCells = Array(8).fill(null).map((_, index) => ({
    mandalart_id: mandalartId,
    topic: '',
    memo: '',
    position: index + 1, // 1부터 8까지
    depth: 1,
    parent_id: rootCellData.id,
    is_completed: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }));

  const { error: childCellsError } = await supabase
    .from('mandalart_cells')
    .insert(childCells);

  if (childCellsError) throw childCellsError;

  return mandalartId;
};

/**
 * 사용자의 만다라트 목록 조회
 */
export const fetchMandalartListForUser = async (): Promise<Array<{id: string, title: string, createdAt: string, updatedAt: string}>> => {
  try {
    const supabase = createClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('인증된 사용자가 없습니다. 로그인이 필요합니다.');
    }
    
    const { data, error } = await supabase
      .from('mandalarts')
      .select('id, title, created_at, updated_at')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }
    
    return data.map(item => ({
      id: item.id,
      title: item.title,
      createdAt: item.created_at,
      updatedAt: item.updated_at
    }));
  } catch (err) {
    console.error('만다라트 목록 조회 API 오류:', err);
    throw err;
  }
};

/**
 * 새 셀 생성
 */
export const createNewCell = async (mandalartId: string, position: number, cellData: Partial<MandalartCell>): Promise<string> => {
  try {
    const supabase = createClient();
    
    const cellPayload = {
      mandalart_id: mandalartId,
      position: position,
      topic: cellData.topic || '',
      memo: cellData.memo,
      color: cellData.color,
      image_url: cellData.imageUrl,
      is_completed: cellData.isCompleted || false,
      parent_id: cellData.parentId || null, // 부모 ID 설정
      depth: cellData.depth || 0, // 깊이 설정
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    console.log('셀 생성 API 요청 데이터:', cellPayload);
    
    // 셀 데이터 삽입
    const { data, error, status } = await supabase
      .from('mandalart_cells')
      .insert(cellPayload)
      .select('id')
      .single();
    
    console.log('셀 생성 API 응답:', { data, error, status });
    
    if (error) {
      console.error('셀 생성 API 오류:', error);
      throw new Error(error.message);
    }
    
    if (!data || !data.id) {
      console.error('셀 생성 API 응답에 ID가 없습니다:', data);
      throw new Error('생성된 셀 ID를 받지 못했습니다');
    }
    
    console.log('새 셀 생성됨:', data.id, '위치:', position, '부모:', cellData.parentId);
    
    return data.id;
  } catch (err) {
    console.error('셀 생성 API 오류:', err);
    throw err;
  }
};

/**
 * 새 셀 생성 후 편집을 위한 셀 객체 생성 
 * (UI에서 재사용 가능한 통합 함수)
 */
export const createNewCellAndGetEditData = async (
  mandalartId: string, 
  position: number, 
  parentData: {
    parentId?: string;
    parentDepth?: number;
  } = {}
): Promise<MandalartCell> => {
  // 기본 셀 데이터 구성
  const cellData: Partial<MandalartCell> = {
    topic: '새 셀',
    parentId: parentData.parentId,
    depth: parentData.parentId ? (parentData.parentDepth !== undefined ? parentData.parentDepth + 1 : 1) : 0,
    position
  };

  try {
    // 셀 생성 API 호출
    const newCellId = await createNewCell(mandalartId, position, cellData);
    
    console.log('새 셀 ID 생성 확인:', newCellId);
    
    // 즉시 편집할 수 있는 셀 데이터 반환
    const newCellData = {
      id: newCellId,
      topic: cellData.topic || '',
      memo: '',
      color: '',
      imageUrl: '',
      isCompleted: false,
      parentId: cellData.parentId,
      depth: cellData.depth || 0,
      position
    };
    
    console.log('새 셀 데이터 생성 완료:', newCellData);
    
    return newCellData;
  } catch (err) {
    console.error('새 셀 생성 및 편집 데이터 준비 실패:', err);
    throw err;
  }
};

/**
 * 셀 완료 상태 토글
 */
export const toggleCellCompletionById = async (cellId: string, isCompleted: boolean): Promise<void> => {
  try {
    const supabase = createClient();
    const { error } = await supabase
      .from('mandalart_cells')
      .update({
        is_completed: isCompleted,
        updated_at: new Date().toISOString()
      })
      .eq('id', cellId);
    
    if (error) {
      throw new Error(error.message);
    }
  } catch (err) {
    console.error('셀 완료 상태 토글 API 오류:', err);
    throw err;
  }
};

/**
 * 만다라트 삭제
 */
export const deleteMandalartById = async (id: string): Promise<void> => {
  try {
    const supabase = createClient();
    
    // 현재 로그인한 사용자 정보 가져오기
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('인증된 사용자가 없습니다. 로그인이 필요합니다.');
    }
    
    // 만다라트 소유자 확인
    const { data: mandalartData, error: ownerError } = await supabase
      .from('mandalarts')
      .select('user_id')
      .eq('id', id)
      .single();
    
    if (ownerError) {
      throw new Error('만다라트 정보를 확인할 수 없습니다.');
    }
    
    if (mandalartData.user_id !== user.id) {
      throw new Error('본인의 만다라트만 삭제할 수 있습니다.');
    }
    
    // 만다라트 삭제 (관계된 셀들은 cascade 옵션으로 자동 삭제됨)
    const { error: deleteError } = await supabase
      .from('mandalarts')
      .delete()
      .eq('id', id);
    
    if (deleteError) {
      throw new Error(deleteError.message);
    }
  } catch (err) {
    console.error('만다라트 삭제 API 오류:', err);
    throw err;
  }
};

/**
 * 특정 셀의 자식 셀 로드 - 개선된 버전 (페이징 지원)
 */
export const loadChildrenForCellById = async (
  mandalartId: string, 
  cellId: string, 
  options: { limit?: number; offset?: number } = {}
): Promise<{ children: MandalartCell[]; total: number }> => {
  try {
    const limit = options.limit || 9;
    const offset = options.offset || 0;
    
    const supabase = createClient();
    
    const { count, error: countError } = await supabase
      .from('mandalart_cells')
      .select('*', { count: 'exact', head: true })
      .eq('mandalart_id', mandalartId)
      .eq('parent_id', cellId);
    
    if (countError) {
      console.error('자식 셀 개수 조회 실패:', countError);
      throw new Error(countError.message);
    }
    
    const { data: childrenData, error: childrenError } = await supabase
      .from('mandalart_cells')
      .select('*')
      .eq('mandalart_id', mandalartId)
      .eq('parent_id', cellId)
      .order('position', { ascending: true })
      .range(offset, offset + limit - 1);
    
    if (childrenError) {
      console.error('자식 셀 로드 API 오류:', childrenError);
      throw new Error(childrenError.message);
    }
    
    if (!childrenData || childrenData.length === 0) {
      return { children: [], total: count || 0 };
    }
    
    const children = childrenData.map(child => ({
      id: child.id,
      topic: child.topic || '',
      memo: child.memo,
      color: child.color,
      imageUrl: child.image_url,
      isCompleted: child.is_completed,
      parentId: child.parent_id,
      depth: child.depth || 0,
      position: child.position || 0,
      children: []
    }));
    
    return { children, total: count || 0 };
  } catch (err) {
    console.error('자식 셀 로드 API 오류:', err);
    throw err;
  }
};

/**
 * 특정 셀 경로 구성하기 (셀 ID에서 루트까지의 경로)
 */
export const buildCellPathById = async (mandalartId: string, cellId: string): Promise<MandalartCell[]> => {
  try {
    const supabase = createClient();
    
    const { data: cellData, error: cellError } = await supabase
      .from('mandalart_cells')
      .select('*')
      .eq('id', cellId)
      .eq('mandalart_id', mandalartId)
      .single();
    
    if (cellError) {
      throw new Error(`셀 데이터 로드 실패: ${cellError.message}`);
    }
    
    const cellPath: MandalartCell[] = [];
    let currentCell = cellData;
    
    while (currentCell) {
      cellPath.unshift({
        id: currentCell.id,
        topic: currentCell.topic || '',
        memo: currentCell.memo,
        color: currentCell.color,
        imageUrl: currentCell.image_url,
        isCompleted: currentCell.is_completed,
        parentId: currentCell.parent_id,
        depth: currentCell.depth || 0,
        position: currentCell.position || 0
      });
      
      if (!currentCell.parent_id) break;
      
      const { data: parentData, error: parentError } = await supabase
        .from('mandalart_cells')
        .select('*')
        .eq('id', currentCell.parent_id)
        .single();
      
      if (parentError) {
        console.error('부모 셀 로드 실패:', parentError);
        break;
      }
      
      currentCell = parentData;
    }
    
    return cellPath;
  } catch (err) {
    console.error('셀 경로 구성 실패:', err);
    throw err;
  }
}; 