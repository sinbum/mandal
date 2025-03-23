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
    
    // 만다라트 셀 데이터 가져오기
    const { data: cellsData, error: cellsError } = await supabase
      .from('mandalart_cells')
      .select('*')
      .eq('mandalart_id', id)
      .order('position', { ascending: true });
    
    if (cellsError) {
      throw new Error(cellsError.message);
    }
    
    // 계층형 구조 확인 - parent_id가 있는 셀이 하나라도 있으면 계층형으로 간주
    const isHierarchical = cellsData && cellsData.some(cell => cell.parent_id !== null);
    
    if (isHierarchical) {
      // 계층형 데이터 처리
      // 먼저 루트 셀 찾기 (parent_id가 null이고 depth가 0인 셀)
      const rootCell = cellsData?.find(cell => cell.parent_id === null && cell.depth === 0);
      
      if (!rootCell) {
        // 루트 셀이 없으면 기존 방식으로 처리
        console.warn('루트 셀을 찾을 수 없어 레거시 모드로 전환합니다');
        const formattedMandalart = convertDbCellsToMandalart(mandalartData, cellsData || []);
        return formattedMandalart;
      }
      
      // 계층형 구조로 변환
      const hierarchicalMandalart: Mandalart = {
        id: mandalartData.id,
        title: mandalartData.title,
        createdAt: mandalartData.created_at,
        updatedAt: mandalartData.updated_at,
        rootCell: {
          id: rootCell.id,
          topic: rootCell.topic || '',
          memo: rootCell.memo,
          color: rootCell.color,
          imageUrl: rootCell.image_url,
          isCompleted: rootCell.is_completed,
          depth: rootCell.depth || 0,
          position: rootCell.position || 0,
          children: []
        }
      };
      
      // 직접 자식 셀 추가 (parent_id가 루트 셀 id와 같은 셀들)
      const directChildren = cellsData?.filter(cell => cell.parent_id === rootCell.id) || [];
      
      if (hierarchicalMandalart.rootCell) {
        hierarchicalMandalart.rootCell.children = directChildren.map(child => ({
          id: child.id,
          topic: child.topic || '',
          memo: child.memo,
          color: child.color,
          imageUrl: child.image_url,
          isCompleted: child.is_completed,
          parentId: child.parent_id,
          depth: child.depth || 1,
          position: child.position || 0,
          children: [] // 초기에는 빈 배열로 설정
        }));
      }
      
      return hierarchicalMandalart;
    } else {
      // 레거시 2D 구조 처리
      const formattedMandalart = convertDbCellsToMandalart(mandalartData, cellsData || []);
      return formattedMandalart;
    }
  } catch (err) {
    console.error('만다라트 데이터 조회 실패:', err);
    throw err;
  }
};

/**
 * 셀 데이터 업데이트
 */
export const updateCellById = async (cellId: string, updatedCell: MandalartCell): Promise<void> => {
  try {
    const supabase = createClient();
    
    // Supabase API로 셀 업데이트
    const { error } = await supabase
      .from('mandalart_cells')
      .update({
        topic: updatedCell.topic,
        memo: updatedCell.memo,
        color: updatedCell.color,
        image_url: updatedCell.imageUrl,
        is_completed: updatedCell.isCompleted,
        updated_at: new Date().toISOString()
      })
      .eq('id', cellId);
    
    if (error) {
      throw new Error(error.message);
    }
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
      // 템플릿 기반 복제 (RPC 호출)
      const { data, error } = await supabase
        .rpc('duplicate_mandalart_from_template', {
          _template_id: templateId,
          _user_id: user.id // 실제 인증된 사용자 ID 사용
        });
      
      if (error) throw new Error(error.message);
      return data as string;
    } else {
      // 새 만다라트 생성 (RPC 호출)
      const { data, error } = await supabase
        .rpc('create_mandalart_with_cells', {
          _title: title,
          _user_id: user.id // 실제 인증된 사용자 ID 사용
        });
      
      if (error) throw new Error(error.message);
      return data as string;
    }
  } catch (err) {
    console.error('만다라트 생성 API 오류:', err);
    throw err;
  }
};

/**
 * 사용자의 만다라트 목록 조회
 */
export const fetchMandalartListForUser = async (): Promise<Array<{id: string, title: string, createdAt: string, updatedAt: string}>> => {
  try {
    const supabase = createClient();
    
    // 현재 로그인한 사용자 정보 가져오기
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('인증된 사용자가 없습니다. 로그인이 필요합니다.');
    }
    
    const { data, error } = await supabase
      .from('mandalarts')
      .select('id, title, created_at, updated_at')
      .eq('user_id', user.id) // 현재 사용자의 만다라트만 가져오기
      .order('updated_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }
    
    // Supabase에서 반환된 데이터 형식을 조정
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
    
    // 셀 데이터 삽입
    const { data, error } = await supabase
      .from('mandalart_cells')
      .insert({
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
      })
      .select('id')
      .single();
    
    if (error) {
      console.error('셀 생성 API 오류:', error);
      throw new Error(error.message);
    }
    
    console.log('새 셀 생성됨:', data.id, '위치:', position, '부모:', cellData.parentId);
    
    return data.id;
  } catch (err) {
    console.error('셀 생성 API 오류:', err);
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
 * 특정 셀의 자식 셀 로드
 */
export const loadChildrenForCellById = async (mandalartId: string, cellId: string): Promise<{ children: MandalartCell[] }> => {
  try {
    // Supabase에서 자식 셀 로드
    const supabase = createClient();
    const { data: childrenData, error: childrenError } = await supabase
      .from('mandalart_cells')
      .select('*')
      .eq('mandalart_id', mandalartId)
      .eq('parent_id', cellId)
      .order('position', { ascending: true });
    
    if (childrenError) {
      console.error('자식 셀 로드 API 오류:', childrenError);
      throw new Error(childrenError.message);
    }
    
    console.log('로드된 자식 셀 데이터:', childrenData);
    
    // 자식 셀이 없는 경우
    if (!childrenData || childrenData.length === 0) {
      return { children: [] };
    }
    
    // 자식 셀 데이터 변환
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
    
    console.log('변환된 자식 셀:', children.length);
    
    return { children };
  } catch (err) {
    console.error('자식 셀 로드 API 오류:', err);
    throw err;
  }
};

/**
 * 계층 구조 데이터 로드 헬퍼 함수
 */
export const loadHierarchicalData = async (mandalartId: string, parentId: string | null = null, depth: number = 0): Promise<MandalartCellWithChildren> => {
  const supabase = createClient();
  
  // 해당 부모의 직접 자식 셀 로드
  const query = supabase
    .from('mandalart_cells')
    .select('*')
    .eq('mandalart_id', mandalartId);
    
  if (parentId === null) {
    // 루트 셀 로드 (parent_id가 null)
    query.is('parent_id', null);
  } else {
    // 특정 셀의 자식 로드
    query.eq('parent_id', parentId);
  }
  
  const { data, error } = await query;
  
  if (error) {
    throw new Error(error.message);
  }
  
  // 부모 셀을 찾거나 루트 셀 생성
  let parentCell: MandalartCellWithChildren;
  
  if (parentId === null) {
    // 루트 셀
    if (data && data.length > 0) {
      const rootData = data[0];
      parentCell = {
        id: rootData.id,
        topic: rootData.topic || '',
        memo: rootData.memo,
        color: rootData.color,
        imageUrl: rootData.image_url,
        isCompleted: rootData.is_completed,
        parentId: undefined,
        depth: 0,
        position: 0,
        children: []
      };
    } else {
      throw new Error('루트 셀을 찾을 수 없습니다');
    }
  } else {
    // 부모 셀 로드
    const { data: parentData, error: parentError } = await supabase
      .from('mandalart_cells')
      .select('*')
      .eq('id', parentId)
      .single();
    
    if (parentError) {
      throw new Error(parentError.message);
    }
    
    parentCell = {
      id: parentData.id,
      topic: parentData.topic || '',
      memo: parentData.memo,
      color: parentData.color,
      imageUrl: parentData.image_url,
      isCompleted: parentData.is_completed,
      parentId: parentData.parent_id,
      depth: parentData.depth || depth,
      position: parentData.position || 0,
      children: []
    };
  }
  
  // 자식 셀 로드 (첫 번째 부모의 직접 자식이 아닌 경우)
  if (parentId !== null) {
    const { data: childrenData, error: childrenError } = await supabase
      .from('mandalart_cells')
      .select('*')
      .eq('parent_id', parentId);
    
    if (childrenError) {
      throw new Error(childrenError.message);
    }
    
    // 자식 셀 처리
    const children = childrenData || [];
    parentCell.children = children.map(child => ({
      id: child.id,
      topic: child.topic || '',
      memo: child.memo,
      color: child.color,
      imageUrl: child.image_url,
      isCompleted: child.is_completed,
      parentId: child.parent_id,
      depth: child.depth || (parentCell.depth + 1),
      position: child.position || 0,
      children: [] // 기본적으로 빈 배열로 설정
    }));
  }
  
  return parentCell;
}; 