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
 * 특정 셀의 자식 셀 로드 - 개선된 버전 (페이징 지원)
 */
export const loadChildrenForCellById = async (
  mandalartId: string, 
  cellId: string, 
  options: { limit?: number; offset?: number } = {}
): Promise<{ children: MandalartCell[]; total: number }> => {
  try {
    // 메모리 캐시 키 생성
    const cacheKey = `children_${mandalartId}_${cellId}_${options.limit || 9}_${options.offset || 0}`;
    
    // 브라우저 환경에서만 sessionStorage 사용
    if (typeof window !== 'undefined') {
      // 캐시된 데이터가 있는지 확인
      const cachedData = sessionStorage.getItem(cacheKey);
      if (cachedData) {
        const { data, timestamp } = JSON.parse(cachedData);
        const now = new Date().getTime();
        
        // 캐시 유효 시간 (30초)
        const CACHE_VALIDITY = 30 * 1000;
        
        // 캐시가 유효한 경우 캐시된 데이터 반환
        if (now - timestamp < CACHE_VALIDITY) {
          console.log('캐시된 자식 셀 데이터 사용:', cellId);
          return data;
        }
      }
    }
    
    // 기본값 설정
    const limit = options.limit || 9; // 기본적으로 9개 (만다라트 그리드 크기)
    const offset = options.offset || 0;
    
    // Supabase에서 자식 셀 로드 (페이징 적용)
    const supabase = createClient();
    
    // 전체 개수 조회 (카운트 쿼리)
    const { count, error: countError } = await supabase
      .from('mandalart_cells')
      .select('*', { count: 'exact', head: true })
      .eq('mandalart_id', mandalartId)
      .eq('parent_id', cellId);
    
    if (countError) {
      console.error('자식 셀 개수 조회 실패:', countError);
      throw new Error(countError.message);
    }
    
    // 실제 데이터 조회 (페이징 적용)
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
    
    console.log(`로드된 자식 셀 데이터 (${offset}~${offset + limit - 1}):`, childrenData?.length);
    
    // 자식 셀이 없는 경우
    if (!childrenData || childrenData.length === 0) {
      const result = { children: [], total: count || 0 };
      
      // 결과 캐싱
      if (typeof window !== 'undefined') {
        sessionStorage.setItem(cacheKey, JSON.stringify({
          data: result,
          timestamp: new Date().getTime()
        }));
      }
      
      return result;
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
    
    const result = { children, total: count || 0 };
    
    // 결과 캐싱
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(cacheKey, JSON.stringify({
        data: result,
        timestamp: new Date().getTime()
      }));
    }
    
    return result;
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
    
    // 캐싱을 위한 로컬 스토리지 키
    const cacheKey = `cell_path_${mandalartId}_${cellId}`;
    
    // 브라우저 환경에서만 localStorage 사용
    if (typeof window !== 'undefined') {
      // 캐시된 데이터가 있는지 확인
      const cachedData = sessionStorage.getItem(cacheKey);
      if (cachedData) {
        const { data, timestamp } = JSON.parse(cachedData);
        const now = new Date().getTime();
        
        // 캐시 유효 시간 (5분)
        const CACHE_VALIDITY = 5 * 60 * 1000;
        
        // 캐시가 유효한 경우 캐시된 데이터 반환
        if (now - timestamp < CACHE_VALIDITY) {
          console.log('캐시된 셀 경로 사용');
          return data;
        }
      }
    }
    
    // 현재 셀 정보 가져오기
    const { data: cellData, error: cellError } = await supabase
      .from('mandalart_cells')
      .select('*')
      .eq('id', cellId)
      .eq('mandalart_id', mandalartId)
      .single();
    
    if (cellError) {
      throw new Error(`셀 데이터 로드 실패: ${cellError.message}`);
    }
    
    // 경로 구성 (현재 셀에서 루트 셀까지)
    const cellPath: MandalartCell[] = [];
    let currentCell = cellData;
    
    while (currentCell) {
      // 프론트엔드 모델로 변환하여 경로에 추가
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
      
      // 부모가 없으면 루트에 도달한 것
      if (!currentCell.parent_id) break;
      
      // 부모 셀 정보 가져오기
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
    
    // 캐싱
    if (typeof window !== 'undefined') {
      const cacheData = {
        data: cellPath,
        timestamp: new Date().getTime()
      };
      sessionStorage.setItem(cacheKey, JSON.stringify(cacheData));
    }
    
    return cellPath;
  } catch (err) {
    console.error('셀 경로 구성 실패:', err);
    throw err;
  }
}; 