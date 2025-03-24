import { Mandalart, MandalartCell, MandalartCellWithChildren } from '@/types/mandalart';
import { createClient } from '@/utils/supabase/client';

/**
 * 만다라트 API 클래스
 * 만다라트와 셀 관련 모든 API 요청을 처리합니다.
 */
export class MandalartService {
  private supabase = createClient();
  
  /**
   * 셀 ID로 셀 데이터 로드
   */
  async fetchCellById(cellId: string): Promise<MandalartCell | null> {
    try {
      const { data, error } = await this.supabase
        .from('mandalart_cells')
        .select('*')
        .eq('id', cellId)
        .single();
      
      if (error) throw error;
      if (!data) return null;
      
      return this.convertDbCellToModel(data);
    } catch (err) {
      console.error('셀 데이터 조회 실패:', err);
      throw err;
    }
  }
  
  /**
   * 셀의 자식 셀 로드
   */
  async fetchChildrenByCellId(cellId: string): Promise<MandalartCell[]> {
    try {
      // 가상 ID 처리
      if (this.isVirtualId(cellId)) {
        return [];
      }
      
      const { data, error } = await this.supabase
        .from('mandalart_cells')
        .select('*')
        .eq('parent_id', cellId)
        .order('position', { ascending: true });
      
      if (error) throw error;
      
      // DB 결과를 프론트엔드 모델로 변환
      return data.map(cell => this.convertDbCellToModel(cell));
    } catch (err) {
      console.error('자식 셀 로드 실패:', err);
      throw err;
    }
  }
  
  /**
   * 셀 업데이트
   */
  async updateCell(cellId: string, updates: Partial<MandalartCell>): Promise<void> {
    try {
      if (this.isVirtualId(cellId)) {
        throw new Error('가상 셀은 업데이트할 수 없습니다');
      }
      
      const updatePayload = {
        topic: updates.topic,
        memo: updates.memo,
        color: updates.color,
        image_url: updates.imageUrl,
        is_completed: updates.isCompleted,
        updated_at: new Date().toISOString()
      };
      
      const { error } = await this.supabase
        .from('mandalart_cells')
        .update(updatePayload)
        .eq('id', cellId);
      
      if (error) throw error;
    } catch (err) {
      console.error('셀 업데이트 실패:', err);
      throw err;
    }
  }
  
  /**
   * 새 셀 생성
   */
  async createCell(
    parentCellId: string, 
    cellData: Partial<MandalartCell>
  ): Promise<string> {
    try {
      // 부모 셀 정보 가져오기
      let mandalartId: string;
      let parentDepth = 0;
      
      // 가상 ID가 아닌 경우 실제 부모 정보 조회
      if (!this.isVirtualId(parentCellId)) {
        const { data: parentCell, error } = await this.supabase
          .from('mandalart_cells')
          .select('mandalart_id, depth')
          .eq('id', parentCellId)
          .single();
        
        if (error) throw error;
        
        mandalartId = parentCell.mandalart_id;
        parentDepth = parentCell.depth || 0;
      } else {
        throw new Error('유효한 부모 셀 ID가 필요합니다');
      }
      
      // 셀 데이터 준비
      const newCellData = {
        mandalart_id: mandalartId,
        parent_id: parentCellId,
        topic: cellData.topic || '새 셀',
        memo: cellData.memo || '',
        color: cellData.color || '',
        image_url: cellData.imageUrl || '',
        is_completed: cellData.isCompleted || false,
        position: cellData.position || 0,
        depth: parentDepth + 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      // 새 셀 생성
      const { data, error } = await this.supabase
        .from('mandalart_cells')
        .insert(newCellData)
        .select('id')
        .single();
      
      if (error) throw error;
      
      return data.id;
    } catch (err) {
      console.error('셀 생성 실패:', err);
      throw err;
    }
  }
  
  /**
   * 셀 삭제
   */
  async deleteCell(cellId: string): Promise<void> {
    try {
      if (this.isVirtualId(cellId)) {
        throw new Error('가상 셀은 삭제할 수 없습니다');
      }
      
      const { error } = await this.supabase
        .from('mandalart_cells')
        .delete()
        .eq('id', cellId);
      
      if (error) throw error;
    } catch (err) {
      console.error('셀 삭제 실패:', err);
      throw err;
    }
  }
  
  /**
   * 셀 완료 상태 토글
   */
  async toggleCellCompletion(cellId: string, isCompleted: boolean): Promise<void> {
    try {
      if (this.isVirtualId(cellId)) {
        throw new Error('가상 셀은 업데이트할 수 없습니다');
      }
      
      const { error } = await this.supabase
        .from('mandalart_cells')
        .update({
          is_completed: isCompleted,
          updated_at: new Date().toISOString()
        })
        .eq('id', cellId);
      
      if (error) throw error;
    } catch (err) {
      console.error('셀 완료 상태 토글 실패:', err);
      throw err;
    }
  }
  
  /**
   * 새 만다라트 생성
   */
  async createMandalart(title: string): Promise<string> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      
      if (!user) {
        throw new Error('인증된 사용자가 없습니다');
      }
      
      // 트랜잭션으로 처리하는 것이 이상적이지만, 
      // Supabase에서는 클라이언트 사이드 트랜잭션이 쉽지 않으므로 순차 처리
      
      // 1. 만다라트 생성
      const { data: mandalartData, error: mandalartError } = await this.supabase
        .from('mandalarts')
        .insert({
          title,
          user_id: user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select('id')
        .single();
      
      if (mandalartError) throw mandalartError;
      
      // 2. 루트 셀 생성
      const { data: rootCellData, error: rootCellError } = await this.supabase
        .from('mandalart_cells')
        .insert({
          mandalart_id: mandalartData.id,
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
      
      return rootCellData.id; // 루트 셀 ID 반환
    } catch (err) {
      console.error('만다라트 생성 실패:', err);
      throw err;
    }
  }
  
  /**
   * 사용자의 셀 목록 조회
   */
  async fetchUserCells(): Promise<MandalartCell[]> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      
      if (!user) {
        throw new Error('인증된 사용자가 없습니다');
      }
      
      // 사용자의 만다라트 ID 찾기
      const { data: mandalarts, error: mandalartError } = await this.supabase
        .from('mandalarts')
        .select('id')
        .eq('user_id', user.id);
      
      if (mandalartError) throw mandalartError;
      
      if (!mandalarts.length) return [];
      
      // 각 만다라트의 루트 셀 찾기
      const mandalartIds = mandalarts.map(m => m.id);
      
      const { data: rootCells, error: cellsError } = await this.supabase
        .from('mandalart_cells')
        .select('*')
        .in('mandalart_id', mandalartIds)
        .is('parent_id', null)
        .order('created_at', { ascending: false });
      
      if (cellsError) throw cellsError;
      
      return rootCells.map(cell => this.convertDbCellToModel(cell));
    } catch (err) {
      console.error('사용자 셀 목록 조회 실패:', err);
      throw err;
    }
  }
  
  /**
   * 셀 경로 구성
   */
  async buildCellPath(cellId: string): Promise<MandalartCell[]> {
    try {
      if (this.isVirtualId(cellId)) {
        return [];
      }
      
      const path: MandalartCell[] = [];
      let currentCellId = cellId;
      
      // 셀 ID가 있는 동안 반복
      while (currentCellId) {
        const { data, error } = await this.supabase
          .from('mandalart_cells')
          .select('*')
          .eq('id', currentCellId)
          .single();
        
        if (error) throw error;
        
        // 경로에 셀 추가
        path.unshift(this.convertDbCellToModel(data));
        
        // 부모 셀로 이동
        currentCellId = data.parent_id;
        
        // 부모 셀이 없으면 종료
        if (!currentCellId) break;
      }
      
      return path;
    } catch (err) {
      console.error('셀 경로 구성 실패:', err);
      throw err;
    }
  }
  
  /**
   * DB 셀 데이터를 프론트엔드 모델로 변환
   */
  private convertDbCellToModel(dbCell: any): MandalartCell {
    return {
      id: dbCell.id,
      topic: dbCell.topic || '',
      memo: dbCell.memo || '',
      color: dbCell.color || '',
      imageUrl: dbCell.image_url || '',
      isCompleted: dbCell.is_completed || false,
      parentId: dbCell.parent_id || null,
      depth: dbCell.depth || 0,
      position: dbCell.position || 0,
      mandalartId: dbCell.mandalart_id
    };
  }
  
  /**
   * 가상 ID인지 확인
   */
  private isVirtualId(id: string): boolean {
    return id.startsWith('empty-') || 
           id.startsWith('virtual-') || 
           id.startsWith('temp-');
  }

  async getMandalart(id: string): Promise<Mandalart | null> {
    return fetchMandalartById(id);
  }

  async getUserMandalarts(): Promise<Array<{id: string, title: string, createdAt: string, updatedAt: string}>> {
    return fetchMandalartListForUser();
  }

  async deleteMandalart(id: string): Promise<void> {
    return deleteMandalartById(id);
  }

  async getChildCells(cellId: string): Promise<MandalartCell[]> {
    return loadChildCellsForParent(cellId);
  }

  async createCellWithData(
    mandalartId: string, 
    position: number, 
    parentData: any
  ): Promise<MandalartCell> {
    return createNewCellAndGetEditData(mandalartId, position, parentData);
  }
}

// 싱글톤 인스턴스 export
export const mandalartAPI = new MandalartService();

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
      .limit(1)
      .single();
    
    if (rootCellError && rootCellError.code !== 'PGRST116') { // 결과 없음 오류는 무시
      console.log('루트 셀 로드 실패:', rootCellError);
      // 루트 셀이 없는 경우 빈 만다라트 반환
      return {
        id: mandalartData.id,
        title: mandalartData.title,
        createdAt: mandalartData.created_at,
        updatedAt: mandalartData.updated_at,
        rootCell: {
          id: `virtual-root-${mandalartData.id}`, // 고유한 가상 ID 생성
          topic: mandalartData.title || '새 만다라트',
          memo: '',
          color: '',
          imageUrl: '',
          isCompleted: false,
          depth: 0,
          position: 0,
          children: []
        }
      };
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
      
      // 자식 셀 데이터 준비 - 8개가 되지 않으면 빈 셀 자동 추가
      let processedChildren = (directChildrenData || []).map(child => ({
        id: child.id,
        topic: child.topic || '',
        memo: child.memo,
        color: child.color,
        imageUrl: child.image_url,
        isCompleted: child.is_completed,
        parentId: child.parent_id,
        depth: 1, // 루트 셀의 직접 자식은 항상 depth 1로 고정
        position: child.position || 0,
        children: [] // 초기에는 빈 배열로 설정 (필요 시 추가 로드)
      }));
      
      // 8개가 될 때까지 빈 셀 데이터 추가
      for (let i = processedChildren.length; i < 8; i++) {
        processedChildren.push({
          id: `empty-${i+1}`,
          topic: '',
          memo: '클릭하여 새 셀을 추가하세요',
          parentId: rootCellData.id,
          depth: 1,
          position: i+1,
          isCompleted: false,
          color: '',
          imageUrl: '',
          children: []
        });
      }
      
      // 계층형 구조로 변환
      const hierarchicalMandalart: Mandalart = {
        id: mandalartData.id,
        title: mandalartData.title,
        createdAt: mandalartData.created_at,
        updatedAt: mandalartData.updated_at,
        rootCell: {
          id: rootCellData.id,
          topic: rootCellData.topic || mandalartData.title || '',
          memo: rootCellData.memo,
          color: rootCellData.color,
          imageUrl: rootCellData.image_url,
          isCompleted: rootCellData.is_completed,
          depth: 0,
          position: rootCellData.position || 0,
          children: processedChildren
        }
      };
      
      return hierarchicalMandalart;
    } else {
      // 루트 셀이 없는 경우 빈 만다라트 반환
      return {
        id: mandalartData.id,
        title: mandalartData.title,
        createdAt: mandalartData.created_at,
        updatedAt: mandalartData.updated_at,
        rootCell: {
          id: `virtual-root-${mandalartData.id}`, // 고유한 가상 ID 생성
          topic: mandalartData.title || '새 만다라트',
          memo: '',
          color: '',
          imageUrl: '',
          isCompleted: false,
          depth: 0,
          position: 0,
          children: []
        }
      };
    }
  } catch (err) {
    console.error('만다라트 데이터 조회 실패:', err);
    throw err;
  }
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
    depth: parentData.parentId ? (parentData.parentDepth !== undefined ? parentData.parentDepth + 1 : 1) : 0, // 부모가 없는 경우 루트셀로 depth=0
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
    
    // 부모 셀의 depth 확인 (무조건 수행)
    let parentDepth = 0;
    if (!cellId.startsWith('empty-')) {
      // 실제 존재하는 셀이면 DB에서 depth 조회
      const { data: parentCell, error: parentCellError } = await supabase
        .from('mandalart_cells')
        .select('depth')
        .eq('id', cellId)
        .single();
        
      if (!parentCellError && parentCell) {
        parentDepth = parentCell.depth || 0;
      }
    }
    
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
      // 자식 셀이 없는 경우, 8개의 빈 셀 생성
      const emptyChildren = Array(8).fill(null).map((_, index) => ({
        id: `empty-${index+1}`,
        topic: '',
        memo: '클릭하여 새 셀을 추가하세요',
        isCompleted: false,
        parentId: cellId,
        depth: parentDepth + 1,
        position: index+1,
        color: '',
        imageUrl: ''
      }));
      
      console.log('빈 셀 생성:', {
        parentId: cellId,
        parentDepth,
        childDepth: parentDepth + 1
      });
      
      return { children: emptyChildren, total: 8 };
    }
    
    // 실제 데이터 변환
    const children = childrenData.map(child => ({
      id: child.id,
      topic: child.topic || '',
      memo: child.memo,
      color: child.color,
      imageUrl: child.image_url,
      isCompleted: child.is_completed,
      parentId: child.parent_id,
      depth: parentDepth + 1,
      position: child.position || 0
    }));
    
    // 빈 셀이 없는 경우 8개의 빈 셀 추가
    for (let i = children.length; i < 8; i++) {
      children.push({
        id: `empty-${i+1}`,
        topic: '',
        memo: '클릭하여 새 셀을 추가하세요', 
        isCompleted: false,
        parentId: cellId,
        depth: parentDepth + 1, // 부모 depth + 1로 일관되게 설정
        position: i+1, // 포지션은 1부터 시작
        color: '',
        imageUrl: ''
      });
    }
    
    return { children, total: count || children.length };
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
    
    // 경로를 재처리하여 depth 값을 재조정
    // 최상위 셀(루트)의 depth를 0으로 설정하고 그 아래로 1씩 증가
    for (let i = 0; i < cellPath.length; i++) {
      cellPath[i].depth = i; // 인덱스를 depth로 사용하면 자연스럽게 0부터 시작
    }
    
    console.log('경로 depth 조정됨:', cellPath.map(c => ({ id: c.id, topic: c.topic, depth: c.depth })));
    
    return cellPath;
  } catch (err) {
    console.error('셀 경로 구성 실패:', err);
    throw err;
  }
};

/**
 * 특정 부모 셀의 자식 셀 목록 로드
 */
export const loadChildCellsForParent = async (parentId: string): Promise<MandalartCell[]> => {
  try {
    const supabase = createClient();
    
    // 가상 ID 처리 (virtual-root-)
    if (parentId.startsWith('virtual-root-')) {
      console.log('가상 루트 ID 감지됨:', parentId);
      
      // 가상 ID에서 만다라트 ID 추출
      const mandalartId = parentId.replace('virtual-root-', '');
      
      if (!mandalartId) {
        throw new Error('가상 ID에서 만다라트 ID를 추출할 수 없습니다');
      }
      
      // 해당 만다라트의 실제 루트 셀 찾기
      const { data: rootCell, error: rootError } = await supabase
        .from('mandalart_cells')
        .select('id')
        .eq('mandalart_id', mandalartId)
        .is('parent_id', null)
        .limit(1)
        .single();
      
      if (rootError) {
        console.log('루트 셀을 찾을 수 없음, 빈 배열 반환');
        return [];
      }
      
      // 찾은 루트 셀의 ID로 부모 ID 변경
      parentId = rootCell.id;
    }
    
    // 부모 ID로 자식 셀 검색
    const { data, error } = await supabase
      .from('mandalart_cells')
      .select('*')
      .eq('parent_id', parentId)
      .order('position');
    
    if (error) {
      console.error('자식 셀 로드 오류:', error);
      throw new Error(`자식 셀 로드 실패: ${error.message}`);
    }
    
    if (!data || data.length === 0) {
      return [];
    }
    
    // DB 결과를 프론트엔드 모델로 변환
    return data.map(cell => ({
      id: cell.id,
      topic: cell.topic || '',
      memo: cell.memo || '',
      color: cell.color || '',
      imageUrl: cell.image_url || '',
      isCompleted: cell.is_completed || false,
      parentId: cell.parent_id || undefined,
      depth: cell.depth || 0,
      position: cell.position || 0
    }));
  } catch (err) {
    console.error('자식 셀 로드 API 오류:', err);
    throw err;
  }
};

export const createNewCell = async (
  mandalartId: string,
  position: number, 
  cellData: Partial<MandalartCell>
): Promise<string> => {
  try {
    const supabase = createClient();
    
    // 셀 데이터 준비
    const newCellData = {
      mandalart_id: mandalartId,
      parent_id: cellData.parentId || null,
      topic: cellData.topic || '새 셀',
      memo: cellData.memo || '',
      color: cellData.color || '',
      image_url: cellData.imageUrl || '',
      is_completed: cellData.isCompleted || false,
      position: position,
      depth: cellData.depth || 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // 새 셀 생성
    const { data, error } = await supabase
      .from('mandalart_cells')
      .insert(newCellData)
      .select('id')
      .single();
    
    if (error) throw error;
    
    return data.id;
  } catch (err) {
    console.error('셀 생성 실패:', err);
    throw err;
  }
}; 