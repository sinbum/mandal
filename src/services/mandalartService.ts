import { Mandalart, MandalartCell } from '@/types/mandalart';
import { createClient } from '@/utils/supabase/client';
import { getCurrentUser } from '@/hooks/useAuth';

// RPC 함수 결과 타입 정의
interface DbRpcResult {
  id: string;
  topic: string;
  memo?: string;
  color?: string;
  image_url?: string;
  is_completed: boolean;
  parent_id?: string;
  depth: number;
  cell_position: number;
  mandalart_id: string;
  level: number;
}

interface UserMandalartResult {
  root_cell_id: string;
  root_topic: string;
  root_color?: string;
  mandalart_id: string;
  total_cells: number;
  completed_cells: number;
  progress_percentage: string;
}

interface TimestampResult {
  updated_at: string;
}

/**
 * 만다라트 API 클래스
 * 만다라트와 셀 관련 모든 API 요청을 처리합니다.
 */
export class MandalartService {
  private supabase = createClient();
  private lastSyncTimestamp: number = 0;
  
  /**
   * 셀 ID로 셀 데이터 로드
   */
  async fetchCellById(cellId: string): Promise<MandalartCell | null> {
    try {
      console.log('셀 데이터 조회 시작:', cellId);
      
      const { data, error } = await this.supabase
        .from('mandalart_cells')
        .select('*')
        .eq('id', cellId)
        .single();
      
      if (error) {
        console.error('Supabase 에러:', error);
        // PGRST116 에러 (데이터 없음)는 null 반환
        if (error.code === 'PGRST116') {
          console.log('셀을 찾을 수 없음:', cellId);
          return null;
        }
        throw error;
      }
      
      if (!data) {
        console.log('데이터가 없음:', cellId);
        return null;
      }
      
      console.log('셀 데이터 조회 성공:', cellId);
      return this.convertDbCellToModel(data);
    } catch (err) {
      console.error('셀 데이터 조회 실패:', cellId, err);
      // 프리로딩에서는 에러를 던지지 않고 null 반환
      return null;
    }
  }
  
  /**
   * 셀의 자식 셀 로드 (최적화된 RPC 함수 사용)
   */
  async fetchChildrenByCellId(cellId: string): Promise<MandalartCell[]> {
    try {
      // 가상 ID 처리
      if (this.isVirtualId(cellId)) {
        return [];
      }
      
      // 최적화된 RPC 함수 사용 - 계층적 구조를 한 번에 조회
      const { data, error } = await this.supabase
        .rpc('get_cell_with_children', {
          cell_uuid: cellId
        });
      
      if (error) {
        console.error('RPC 함수 호출 실패, 기존 방식으로 폴백:', error);
        return this.fetchChildrenByCellIdLegacy(cellId);
      }
      
      // 결과를 계층적 구조로 변환
      const cellsMap = new Map<string, MandalartCell>();
      const rootCell = data.find((item: DbRpcResult) => item.level === 0);
      
      // 모든 셀을 Map에 저장
      data.forEach((item: DbRpcResult) => {
        const cell = this.convertDbCellToModel({
          id: item.id,
          topic: item.topic,
          memo: item.memo,
          color: item.color,
          image_url: item.image_url,
          is_completed: item.is_completed,
          parent_id: item.parent_id,
          depth: item.depth,
          position: item.cell_position,
          mandalart_id: item.mandalart_id
        });
        
        cell.children = [];
        cellsMap.set(cell.id, cell);
      });
      
      // 부모-자식 관계 설정
      data.forEach((item: DbRpcResult) => {
        if (item.parent_id && cellsMap.has(item.parent_id)) {
          const parent = cellsMap.get(item.parent_id)!;
          const child = cellsMap.get(item.id)!;
          parent.children!.push(child);
        }
      });
      
      // 루트 셀의 직접 자식들만 반환
      if (rootCell && cellsMap.has(rootCell.id)) {
        return cellsMap.get(rootCell.id)!.children || [];
      }
      
      return [];
    } catch (err) {
      console.error('자식 셀 로드 실패:', err);
      throw err;
    }
  }

  /**
   * 셀의 자식 셀 로드 (기존 방식 - 폴백용)
   */
  private async fetchChildrenByCellIdLegacy(cellId: string): Promise<MandalartCell[]> {
    try {
      // 직접 자식 셀들 로드
      const { data: directChildren, error } = await this.supabase
        .from('mandalart_cells')
        .select('*')
        .eq('parent_id', cellId)
        .order('position', { ascending: true });
      
      if (error) throw error;
      
      if (!directChildren || directChildren.length === 0) {
        return [];
      }
      
      // 각 직접 자식의 자식들도 미리 로드
      const childIds = directChildren.map(child => child.id);
      const { data: grandchildren } = await this.supabase
        .from('mandalart_cells')
        .select('*')
        .in('parent_id', childIds)
        .order('position', { ascending: true });
      
      // 각 자식에 대해 손자 셀들을 매핑
      const childrenWithGrandchildren = directChildren.map(child => {
        const childGrandchildren = (grandchildren || [])
          .filter(gc => gc.parent_id === child.id)
          .map(gc => this.convertDbCellToModel(gc));
        
        const childModel = this.convertDbCellToModel(child);
        childModel.children = childGrandchildren;
        return childModel;
      });
      
      return childrenWithGrandchildren;
    } catch (err) {
      console.error('Legacy 자식 셀 로드 실패:', err);
      throw err;
    }
  }
  
  /**
   * 셀 업데이트 (캐시 무효화 포함)
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

      // 캐시 무효화 및 실시간 업데이트
      await this.invalidateCacheForCell(cellId);
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

      // 부모 셀의 캐시 무효화 (새 자식이 추가되었으므로)
      await this.invalidateCacheForCell(parentCellId);
      
      return data.id;
    } catch (err) {
      console.error('셀 생성 실패:', err);
      throw err;
    }
  }

  /**
   * 셀 완료 상태 토글 (캐시 무효화 포함)
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

      // 완료 상태 변경은 진행률에 영향을 주므로 관련 캐시 무효화
      await this.invalidateCacheForCell(cellId);
      await this.invalidateProgressCache(cellId);
    } catch (err) {
      console.error('셀 완료 상태 토글 실패:', err);
      throw err;
    }
  }
  
  /**
   * 셀 삭제 (캐시 무효화 포함)
   */
  async deleteCell(cellId: string): Promise<void> {
    try {
      if (this.isVirtualId(cellId)) {
        throw new Error('가상 셀은 삭제할 수 없습니다');
      }

      // 삭제 전에 부모 ID 조회 (캐시 무효화용)
      const { data: cellData } = await this.supabase
        .from('mandalart_cells')
        .select('parent_id')
        .eq('id', cellId)
        .single();
      
      // 자식 셀들도 함께 삭제 (CASCADE)
      const { error } = await this.supabase
        .from('mandalart_cells')
        .delete()
        .eq('id', cellId);
      
      if (error) throw error;

      // 해당 셀과 부모 셀의 캐시 무효화
      await this.invalidateCacheForCell(cellId);
      if (cellData?.parent_id) {
        await this.invalidateCacheForCell(cellData.parent_id);
      }
    } catch (err) {
      console.error('셀 삭제 실패:', err);
      throw err;
    }
  }

  /**
   * 새 만다라트 생성
   */
  async createMandalart(title: string): Promise<string> {
    try {
      // 캐시된 사용자 정보 사용 (미들웨어에서 이미 인증 확인됨)
      // 캐시된 사용자 정보 사용 (안전한 체크)
      const user = getCurrentUser();
      
      if (!user) {
        console.warn('사용자 인증 정보 없음');
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
   * 사용자의 셀 목록 조회 (캐시 검증 포함)
   */
  async fetchUserCells(): Promise<MandalartCell[]> {
    try {
      const user = getCurrentUser();
      if (!user) {
        console.warn('사용자 인증 정보 없음');
        throw new Error('인증된 사용자가 없습니다');
      }

      // 1. 캐시 검증 실행
      const needsUpdate = await this.validateAndSyncCache(user.id);
      
      // 2. 캐시가 유효하면 캐시된 데이터 사용, 아니면 서버에서 새로 로드
      if (!needsUpdate) {
        console.log('캐시가 최신 상태, 캐시된 데이터 사용');
        // 여기서 캐시에서 로드하는 로직 추가 필요
      }

      // 3. 최적화된 RPC 함수 사용 - 단일 쿼리로 모든 데이터 조회
      const { data, error } = await this.supabase
        .rpc('get_user_mandalarts_with_progress', {
          user_uuid: user.id
        });
      
      if (error) {
        console.error('RPC 함수 호출 실패, 기존 방식으로 폴백:', error);
        return this.fetchUserCellsLegacy();
      }
      
      // 4. RPC 결과를 프론트엔드 모델로 변환
      const rootCellsWithProgress = data.map((item: UserMandalartResult) => {
        const cell = this.convertDbCellToModel({
          id: item.root_cell_id,
          topic: item.root_topic,
          color: item.root_color,
          parent_id: null,
          depth: 0,
          position: 0,
          mandalart_id: item.mandalart_id
        });
        
        cell.progressInfo = {
          totalCells: item.total_cells || 0,
          completedCells: item.completed_cells || 0,
          progressPercentage: parseFloat(item.progress_percentage || '0')
        };
        
        return cell;
      });
      
      // 5. 동기화 타임스탬프 업데이트
      this.lastSyncTimestamp = Date.now();
      
      console.log('최신 데이터로 업데이트된 rootCells:', rootCellsWithProgress);
      return rootCellsWithProgress;
    } catch (err) {
      console.error('사용자 셀 목록 조회 실패:', err);
      throw err;
    }
  }

  /**
   * 캐시 검증 및 동기화
   */
  private async validateAndSyncCache(userId: string): Promise<boolean> {
    try {
      // 1. 서버의 최신 타임스탬프들 조회
      const { data: serverTimestamps, error } = await this.supabase
        .rpc('get_user_data_timestamps', {
          user_uuid: userId
        });

      if (error) {
        console.warn('타임스탬프 조회 실패, 전체 갱신:', error);
        return true; // 에러 시 전체 갱신
      }

      if (!serverTimestamps || serverTimestamps.length === 0) {
        console.log('서버에 데이터 없음');
        return false;
      }

      // 2. 마지막 동기화 이후 변경사항 확인
      const lastSyncDate = new Date(this.lastSyncTimestamp);
      const hasChanges = serverTimestamps.some((item: TimestampResult) => {
        const serverUpdateTime = new Date(item.updated_at);
        return serverUpdateTime > lastSyncDate;
      });

      if (hasChanges) {
        console.log('서버에 새로운 변경사항 발견, 동기화 필요');
        
        // 3. 증분 업데이트 실행
        await this.performIncrementalSync(userId, lastSyncDate);
        return true;
      }

      console.log('캐시가 최신 상태');
      return false;
    } catch (err) {
      console.error('캐시 검증 실패:', err);
      return true; // 에러 시 전체 갱신
    }
  }

  /**
   * 증분 동기화 실행
   */
  private async performIncrementalSync(userId: string, sinceDate: Date): Promise<void> {
    try {
      console.log('증분 동기화 시작:', sinceDate);

      // 1. 변경된 셀들만 조회
      const { data: changedCells, error } = await this.supabase
        .rpc('get_changed_cells_since', {
          user_uuid: userId,
          since_timestamp: sinceDate.toISOString()
        });

      if (error) {
        console.error('변경된 셀 조회 실패:', error);
        return;
      }

      if (!changedCells || changedCells.length === 0) {
        console.log('변경된 셀이 없음');
        return;
      }

      console.log(`${changedCells.length}개의 변경된 셀 발견`);

      // 2. 변경된 셀들을 타입별로 처리
      const { cellCache } = await import('@/utils/cellCache');
      
      for (const changedCell of changedCells) {
        const cell = this.convertDbCellToModel({
          id: changedCell.id,
          topic: changedCell.topic,
          memo: changedCell.memo,
          color: changedCell.color,
          image_url: changedCell.image_url,
          is_completed: changedCell.is_completed,
          parent_id: changedCell.parent_id,
          depth: changedCell.depth,
          position: changedCell.cell_position,
          mandalart_id: changedCell.mandalart_id
        });

        // 3. 캐시 무효화 및 업데이트
        if (changedCell.change_type === 'created') {
          console.log(`새 셀 캐시 추가: ${cell.id}`);
          cellCache.set(cell.id, cell, []);
        } else if (changedCell.change_type === 'updated') {
          console.log(`기존 셀 캐시 업데이트: ${cell.id}`);
          await cellCache.invalidateCache(cell.id);
          cellCache.set(cell.id, cell, []);
        }
      }

      console.log('증분 동기화 완료');
    } catch (err) {
      console.error('증분 동기화 실패:', err);
    }
  }

  /**
   * 사용자의 셀 목록 조회 (기존 방식 - 폴백용)
   */
  private async fetchUserCellsLegacy(): Promise<MandalartCell[]> {
    try {
      const user = getCurrentUser();
      if (!user) throw new Error('인증된 사용자가 없습니다');
      
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
      
      // 각 루트 셀에 대해 진행률 계산
      const rootCellsWithProgress = await Promise.all(
        rootCells.map(async (cell) => {
          const progressInfo = await this.calculateMandalartProgress(cell.mandalart_id);
          const convertedCell = this.convertDbCellToModel(cell);
          convertedCell.progressInfo = progressInfo;
          return convertedCell;
        })
      );
      
      return rootCellsWithProgress;
    } catch (err) {
      console.error('Legacy 사용자 셀 목록 조회 실패:', err);
      throw err;
    }
  }

  /**
   * 특정 셀과 관련된 캐시 무효화
   */
  private async invalidateCacheForCell(cellId: string): Promise<void> {
    try {
      const { cellCache } = await import('@/utils/cellCache');
      
      // 해당 셀과 관련된 모든 캐시 무효화
      await cellCache.invalidateCache(cellId);
      
      console.log(`셀 ${cellId}과 관련된 캐시 무효화 완료`);
    } catch (err) {
      console.error('캐시 무효화 실패:', err);
    }
  }

  /**
   * 진행률 관련 캐시 무효화 (완료 상태 변경 시)
   */
  private async invalidateProgressCache(cellId: string): Promise<void> {
    try {
      // 해당 셀의 만다라트 ID 조회
      const { data: cellData, error } = await this.supabase
        .from('mandalart_cells')
        .select('mandalart_id, parent_id')
        .eq('id', cellId)
        .single();

      if (error || !cellData) {
        console.warn('셀 정보 조회 실패, 진행률 캐시 무효화 생략');
        return;
      }

      const { cellCache } = await import('@/utils/cellCache');

      // 루트 셀까지 올라가면서 진행률 관련 캐시 무효화
      let currentCellId = cellData.parent_id;
      while (currentCellId) {
        await cellCache.invalidateCache(currentCellId);
        
        const { data: parentData } = await this.supabase
          .from('mandalart_cells')
          .select('parent_id')
          .eq('id', currentCellId)
          .single();
        
        currentCellId = parentData?.parent_id;
      }

      console.log(`진행률 관련 캐시 무효화 완료 (만다라트: ${cellData.mandalart_id})`);
    } catch (err) {
      console.error('진행률 캐시 무효화 실패:', err);
    }
  }

  /**
   * 백그라운드 동기화 시작
   */
  startBackgroundSync(): void {
    if (typeof window === 'undefined') return;

    // 5분마다 백그라운드 동기화 실행
    const syncInterval = 5 * 60 * 1000; // 5분
    
    setInterval(async () => {
      try {
        const user = getCurrentUser();
        if (user) {
          console.log('백그라운드 동기화 시작');
          await this.validateAndSyncCache(user.id);
        }
      } catch (err) {
        console.error('백그라운드 동기화 실패:', err);
      }
    }, syncInterval);

    // 페이지 포커스 시에도 동기화
    window.addEventListener('focus', async () => {
      try {
        const user = getCurrentUser();
        if (user) {
          console.log('페이지 포커스 시 동기화');
          await this.validateAndSyncCache(user.id);
        }
      } catch (err) {
        console.error('포커스 시 동기화 실패:', err);
      }
    });
  }

  /**
   * 사용자의 루트 셀들과 첫 번째 레벨 자식들을 함께 가져오기
   */
  async fetchUserCellsWithChildren(): Promise<MandalartCell[]> {
    try {
      // 캐시된 사용자 정보 사용 (안전한 체크)
      const user = getCurrentUser();
      
      if (!user) {
        console.warn('사용자 인증 정보 없음');
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
      
      // 각 루트 셀의 첫 번째 레벨 자식들도 함께 가져오기
      const rootCellsWithChildrenAndProgress = await Promise.all(
        rootCells.map(async (cell) => {
          // 진행률 계산
          const progressInfo = await this.calculateMandalartProgress(cell.mandalart_id);
          const convertedCell = this.convertDbCellToModel(cell);
          convertedCell.progressInfo = progressInfo;
          
          // 첫 번째 레벨 자식들 가져오기
          const children = await this.fetchChildrenByCellId(cell.id);
          convertedCell.children = children;
          
          return convertedCell;
        })
      );
      
      console.log('rootCells with children and progress', rootCellsWithChildrenAndProgress);
      return rootCellsWithChildrenAndProgress;
    } catch (err) {
      console.error('사용자 셀과 자식들 조회 실패:', err);
      throw err;
    }
  }

  /**
   * 여러 셀의 자식들을 한 번의 쿼리로 효율적으로 가져오기
   */
  async fetchChildrenOfMultipleCells(parentIds: string[]): Promise<{ [parentId: string]: MandalartCell[] }> {
    try {
      if (parentIds.length === 0) return {};
      
      // 가상 ID 필터링
      const realParentIds = parentIds.filter(id => !this.isVirtualId(id));
      
      if (realParentIds.length === 0) return {};
      
      const { data, error } = await this.supabase
        .from('mandalart_cells')
        .select('*')
        .in('parent_id', realParentIds)
        .order('parent_id', { ascending: true })
        .order('position', { ascending: true });
      
      if (error) throw error;
      
      // 부모 ID별로 자식들 그룹화
      const groupedChildren: { [parentId: string]: MandalartCell[] } = {};
      
      data.forEach(cell => {
        const parentId = cell.parent_id;
        if (!groupedChildren[parentId]) {
          groupedChildren[parentId] = [];
        }
        groupedChildren[parentId].push(this.convertDbCellToModel(cell));
      });
      
      return groupedChildren;
    } catch (err) {
      console.error('여러 셀의 자식들 로드 실패:', err);
      throw err;
    }
  }

  /**
   * 사용자의 루트 셀들과 첫 번째 레벨 자식들을 한 번의 쿼리로 효율적으로 가져오기
   */
  async fetchUserCellsWithChildrenOptimized(): Promise<MandalartCell[]> {
    try {
      // 캐시된 사용자 정보 사용 (안전한 체크)
      const user = getCurrentUser();
      
      if (!user) {
        console.warn('사용자 인증 정보 없음');
        throw new Error('인증된 사용자가 없습니다');
      }
      
      // 사용자의 만다라트 ID 찾기
      const { data: mandalarts, error: mandalartError } = await this.supabase
        .from('mandalarts')
        .select('id')
        .eq('user_id', user.id);
      
      if (mandalartError) throw mandalartError;
      
      if (!mandalarts.length) return [];
      
      const mandalartIds = mandalarts.map(m => m.id);
      
      // 루트 셀(depth 0)과 첫 번째 레벨 자식들(depth 1)을 한 번에 가져오기
      const { data: allCells, error: cellsError } = await this.supabase
        .from('mandalart_cells')
        .select('*')
        .in('mandalart_id', mandalartIds)
        .in('depth', [0, 1])
        .order('depth', { ascending: true })
        .order('created_at', { ascending: false });
      
      if (cellsError) throw cellsError;
      
      // 셀들을 루트와 자식으로 분류
      const rootCells = allCells.filter(cell => cell.depth === 0);
      const childCells = allCells.filter(cell => cell.depth === 1);
      
      // 루트 셀들을 그룹화하고 자식들을 연결
      const rootCellsWithChildrenAndProgress = await Promise.all(
        rootCells.map(async (cell) => {
          // 진행률 계산
          const progressInfo = await this.calculateMandalartProgress(cell.mandalart_id);
          const convertedCell = this.convertDbCellToModel(cell);
          convertedCell.progressInfo = progressInfo;
          
          // 해당 루트 셀의 자식들 필터링
          const cellChildren = childCells
            .filter(child => child.parent_id === cell.id)
            .map(child => this.convertDbCellToModel(child));
          
          convertedCell.children = cellChildren;
          
          return convertedCell;
        })
      );
      
      console.log('rootCells with children (optimized) and progress', rootCellsWithChildrenAndProgress);
      return rootCellsWithChildrenAndProgress;
    } catch (err) {
      console.error('사용자 셀과 자식들 조회 실패 (최적화):', err);
      throw err;
    }
  }
  
  /**
   * 만다라트의 진행률 계산 (최적화된 RPC 함수 사용)
   */
  private async calculateMandalartProgress(mandalartId: string): Promise<{
    totalCells: number;
    completedCells: number;
    progressPercentage: number;
  }> {
    try {
      // 최적화된 RPC 함수 사용 - 빠른 진행률 계산
      const { data, error } = await this.supabase
        .rpc('calculate_mandalart_progress_fast', {
          mandalart_uuid: mandalartId
        });
      
      if (error) {
        console.error('RPC 진행률 계산 실패, 기존 방식으로 폴백:', error);
        return this.calculateMandalartProgressLegacy(mandalartId);
      }
      
      if (!data || data.length === 0) {
        return { totalCells: 0, completedCells: 0, progressPercentage: 0 };
      }
      
      const result = data[0];
      return {
        totalCells: parseInt(result.total_cells) || 0,
        completedCells: parseInt(result.completed_cells) || 0,
        progressPercentage: parseFloat(result.progress_percentage) || 0
      };
    } catch (err) {
      console.error('진행률 계산 실패:', err);
      return {
        totalCells: 0,
        completedCells: 0,
        progressPercentage: 0
      };
    }
  }

  /**
   * 만다라트의 진행률 계산 (기존 방식 - 폴백용)
   */
  private async calculateMandalartProgressLegacy(mandalartId: string): Promise<{
    totalCells: number;
    completedCells: number;
    progressPercentage: number;
  }> {
    try {
      // 해당 만다라트의 모든 셀 조회 (루트 제외)
      const { data: allCells, error } = await this.supabase
        .from('mandalart_cells')
        .select('is_completed')
        .eq('mandalart_id', mandalartId)
        .not('parent_id', 'is', null); // 루트 셀 제외
      
      if (error) throw error;
      
      const totalCells = allCells.length;
      const completedCells = allCells.filter(cell => cell.is_completed).length;
      const progressPercentage = totalCells > 0 ? Math.round((completedCells / totalCells) * 100) : 0;
      
      return {
        totalCells,
        completedCells,
        progressPercentage
      };
    } catch (err) {
      console.error('Legacy 진행률 계산 실패:', err);
      return {
        totalCells: 0,
        completedCells: 0,
        progressPercentage: 0
      };
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
  private convertDbCellToModel(dbCell: {
    id: string;
    topic?: string;
    memo?: string;
    color?: string;
    image_url?: string;
    is_completed?: boolean;
    parent_id?: string | null;
    depth?: number;
    position?: number;
    mandalart_id?: string;
  }): MandalartCell {
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

  async deleteMandalart(mandalartId: string): Promise<void> {
    return deleteMandalartById(mandalartId);
  }

  async getChildCells(cellId: string): Promise<MandalartCell[]> {
    return loadChildCellsForParent(cellId);
  }

  async createCellWithData(
    mandalartId: string, 
    position: number, 
    parentData: {
      parentId?: string;
      parentDepth?: number;
      depth?: number;
    }
  ): Promise<MandalartCell> {
    return createNewCellAndGetEditData(mandalartId, position, parentData);
  }

  async getUserCellsWithChildren(): Promise<MandalartCell[]> {
    return this.fetchUserCellsWithChildren();
  }

  async getUserCellsWithChildrenOptimized(): Promise<MandalartCell[]> {
    return this.fetchUserCellsWithChildrenOptimized();
  }
}

// 싱글톤 인스턴스 export
export const mandalartAPI = new MandalartService();

// 백그라운드 동기화 시작 (클라이언트 사이드에서만)
if (typeof window !== 'undefined') {
  mandalartAPI.startBackgroundSync();
}

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
      const processedChildren = (directChildrenData || []).map(child => ({
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
    
    // 캐시된 사용자 정보 사용 (안전한 체크)
    const user = getCurrentUser();
    
    if (!user) {
      console.warn('사용자 인증 정보 없음');
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
    topic: '',
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
    console.log('deleteMandalartById 호출됨:', id);
    const supabase = createClient();
    
    // 현재 로그인한 사용자 정보 가져오기
    // 캐시된 사용자 정보 사용 (안전한 체크)
    const user = getCurrentUser();
    
    if (!user) {
      console.warn('사용자 인증 정보 없음');
      throw new Error('인증된 사용자가 없습니다. 로그인이 필요합니다.');
    }
    
    console.log('사용자 인증 확인:', user.id);
        
    // 만다라트 삭제 (관계된 셀들은 cascade 옵션으로 자동 삭제됨)
    const { error: deleteError } = await supabase
      .from('mandalarts')
      .delete()
      .eq('id', id);
    
    if (deleteError) {
      console.error('만다라트 삭제 에러:', deleteError);
      throw new Error(deleteError.message);
    }
    
    console.log('만다라트 삭제 성공:', id);
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

    // 부모 셀의 캐시 무효화 (새 자식이 추가되었으므로)
    if (cellData.parentId) {
      const { cellCache } = await import('@/utils/cellCache');
      await cellCache.invalidateCache(cellData.parentId);
    }
    
    return data.id;
  } catch (err) {
    console.error('셀 생성 실패:', err);
    throw err;
  }
}; 