import { MandalartCell } from '@/types/mandalart';
import { mandalartAPI } from '@/services/mandalartService';

/**
 * 셀 데이터 캐시 유틸리티
 * 홈페이지에서 미리 로딩한 자식 셀들을 캐시하여 셀 페이지에서 빠르게 접근
 */

interface CellCacheData {
  cell: MandalartCell;
  children: MandalartCell[];
  timestamp: number;
}

class CellCache {
  private cache = new Map<string, CellCacheData>();
  private readonly TTL = 30 * 60 * 1000; // 30분 TTL (문서 권장사항)
  private db: IDBDatabase | null = null;
  private readonly dbName = 'mandalart-cache';
  private readonly dbVersion = 1;

  constructor() {
    this.initIndexedDB();
  }

  /**
   * IndexedDB 초기화
   */
  private async initIndexedDB(): Promise<void> {
    if (typeof window === 'undefined') return;

    try {
      const request = indexedDB.open(this.dbName, this.dbVersion);
      
      request.onerror = () => {
        console.warn('IndexedDB 초기화 실패, 메모리 캐시만 사용');
      };
      
      request.onsuccess = () => {
        this.db = request.result;
        console.log('IndexedDB 영구 캐시 활성화');
      };
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // 셀 캐시 스토어 생성
        if (!db.objectStoreNames.contains('cells')) {
          const cellStore = db.createObjectStore('cells', { keyPath: 'id' });
          cellStore.createIndex('timestamp', 'timestamp', { unique: false });
          cellStore.createIndex('mandalartId', 'mandalartId', { unique: false });
        }
      };
    } catch (err) {
      console.warn('IndexedDB 사용 불가, 메모리 캐시만 사용:', err);
    }
  }

  /**
   * 영구 캐시에 저장
   */
  private async saveToIndexedDB(cellId: string, data: CellCacheData & { mandalartId?: string }): Promise<void> {
    if (!this.db) return;

    try {
      const transaction = this.db.transaction(['cells'], 'readwrite');
      const store = transaction.objectStore('cells');
      
      await store.put({
        id: cellId,
        ...data
      });
    } catch (err) {
      console.warn('IndexedDB 저장 실패:', err);
    }
  }

  /**
   * 영구 캐시에서 로드
   */
  private async loadFromIndexedDB(cellId: string): Promise<CellCacheData | null> {
    if (!this.db) return null;

    try {
      const transaction = this.db.transaction(['cells'], 'readonly');
      const store = transaction.objectStore('cells');
      const request = store.get(cellId);
      
      return new Promise((resolve) => {
        request.onsuccess = () => {
          const result = request.result;
          if (result && Date.now() - result.timestamp <= this.TTL) {
            resolve({
              cell: result.cell,
              children: result.children,
              timestamp: result.timestamp
            });
          } else {
            resolve(null);
          }
        };
        request.onerror = () => resolve(null);
      });
    } catch (err) {
      console.warn('IndexedDB 로드 실패:', err);
      return null;
    }
  }

  /**
   * 캐시 무효화 - 셀과 연관된 모든 캐시 제거
   */
  async invalidateCache(cellId: string): Promise<void> {
    // 메모리 캐시에서 제거
    this.remove(cellId);
    
    // 부모 체인 무효화
    await this.invalidateParentChain(cellId);
    
    // 자식 체인 무효화  
    await this.invalidateChildChain(cellId);
  }

  /**
   * 부모 체인 무효화
   */
  private async invalidateParentChain(cellId: string): Promise<void> {
    const cached = this.cache.get(cellId);
    if (cached?.cell.parentId) {
      this.remove(cached.cell.parentId);
      await this.invalidateParentChain(cached.cell.parentId);
    }
  }

  /**
   * 자식 체인 무효화
   */
  private async invalidateChildChain(cellId: string): Promise<void> {
    const cached = this.cache.get(cellId);
    if (cached?.children) {
      cached.children.forEach(child => {
        this.remove(child.id);
        this.invalidateChildChain(child.id);
      });
    }
  }

  /**
   * 캐시에 셀 데이터 저장 (메모리 + IndexedDB)
   */
  set(cellId: string, cell: MandalartCell, children: MandalartCell[] = []): void {
    const cacheData = {
      cell,
      children,
      timestamp: Date.now()
    };
    
    // 메모리 캐시에 저장
    this.cache.set(cellId, cacheData);
    
    // IndexedDB에 영구 저장 (비동기)
    this.saveToIndexedDB(cellId, {
      ...cacheData,
      mandalartId: cell.mandalartId
    });
  }

  /**
   * 캐시에서 셀 데이터 조회 (메모리 우선, IndexedDB 폴백)
   */
  async get(cellId: string): Promise<{ cell: MandalartCell; children: MandalartCell[] } | null> {
    // 1. 메모리 캐시 확인
    let cached = this.cache.get(cellId);
    
    if (cached) {
      // TTL 체크
      if (Date.now() - cached.timestamp > this.TTL) {
        this.cache.delete(cellId);
        cached = undefined;
      }
    }
    
    // 2. 메모리에 없으면 IndexedDB에서 로드
    if (!cached) {
      cached = await this.loadFromIndexedDB(cellId)||undefined;
      if (cached) {
        // IndexedDB에서 로드한 데이터를 메모리 캐시에도 저장
        this.cache.set(cellId, cached);
        console.log(`IndexedDB에서 캐시 복원: ${cellId}`);
      } else {
        console.log(`완전한 캐시 미스: ${cellId}`);
        return null;
      }
    }

    return {
      cell: cached.cell,
      children: cached.children
    };
  }

  /**
   * 동기 방식으로 메모리 캐시만 조회 (기존 호환성 유지)
   */
  getSync(cellId: string): { cell: MandalartCell; children: MandalartCell[] } | null {
    const cached = this.cache.get(cellId);
    
    if (!cached) {
      return null;
    }

    // TTL 체크
    if (Date.now() - cached.timestamp > this.TTL) {
      this.cache.delete(cellId);
      return null;
    }

    return {
      cell: cached.cell,
      children: cached.children
    };
  }

  /**
   * 캐시에서 셀만 조회 (동기)
   */
  getCell(cellId: string): MandalartCell | null {
    const cached = this.cache.get(cellId);
    if (!cached || Date.now() - cached.timestamp > this.TTL) {
      return null;
    }
    return cached.cell;
  }

  /**
   * 캐시에서 자식 셀들만 조회 (동기)
   */
  getChildren(cellId: string): MandalartCell[] | null {
    const cached = this.cache.get(cellId);
    if (!cached || Date.now() - cached.timestamp > this.TTL) {
      return null;
    }
    return cached.children;
  }

  /**
   * 백그라운드 프리로딩 - 사용자 데이터 미리 로드
   */
  async preloadUserData(): Promise<void> {
    try {
      console.log('사용자 데이터 백그라운드 프리로딩 시작');
      
      // 최적화된 RPC 함수로 사용자 데이터 로드
      const rootCells = await mandalartAPI.fetchUserCells();
      
      if (rootCells.length > 0) {
        this.populateFromRootCells(rootCells);
        
        // 각 루트 셀의 자식들도 백그라운드에서 미리 로드
        const childLoadPromises = rootCells.map(async (rootCell) => {
          if (rootCell.children && rootCell.children.length > 0) {
            await this.preloadChildrenOfChildren(rootCell.children);
          }
        });
        
        await Promise.allSettled(childLoadPromises);
        console.log('백그라운드 프리로딩 완료');
      }
    } catch (err) {
      console.error('백그라운드 프리로딩 실패:', err);
    }
  }

  /**
   * 홈페이지에서 로딩한 루트 셀들과 자식들을 캐시에 저장
   */
  populateFromRootCells(rootCells: MandalartCell[]): void {
    console.log('캐시 채우기 시작:', rootCells.length, '개의 루트 셀');
    
    rootCells.forEach(rootCell => {
      const children = rootCell.children || [];
      
      // 루트 셀 캐시
      this.set(rootCell.id, rootCell, children);
      console.log(`루트 셀 캐시됨: ${rootCell.id}, 자식 개수: ${children.length}`);
      
      // 자식 셀들도 개별적으로 캐시 (빈 자식 배열로)
      children.forEach(child => {
        this.set(child.id, child, []);
        console.log(`자식 셀 캐시됨: ${child.id}`);
      });
    });
    
    console.log('캐시 채우기 완료, 총 캐시된 항목:', this.cache.size);
  }

  /**
   * 특정 셀의 캐시 제거
   */
  remove(cellId: string): void {
    this.cache.delete(cellId);
  }

  /**
   * 전체 캐시 초기화
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * 만료된 캐시 정리
   */
  cleanup(): void {
    const now = Date.now();
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp > this.TTL) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * 현재 셀의 자식들의 하위 셀들을 백그라운드에서 미리 로딩
   * 셀 페이지에서 더 깊은 네비게이션을 위한 성능 최적화
   */
  async preloadChildrenOfChildren(children: MandalartCell[]): Promise<void> {
    try {
      if (children.length === 0) return;
      
      console.log('자식들의 하위 셀들 미리 로딩 시작:', children.length, '개의 자식 셀');
      
      // 자식 셀들의 ID 수집
      const childIds = children.map(child => child.id);
      
      // 여러 셀의 자식들을 한 번의 쿼리로 가져오기
      const childrenGroups = await mandalartAPI.fetchChildrenOfMultipleCells(childIds);
      
      // 각 자식 셀과 그 하위 셀들을 캐시에 저장
      Object.entries(childrenGroups).forEach(([parentId, grandChildren]) => {
        const parentCell = children.find(child => child.id === parentId);
        if (parentCell) {
          this.set(parentId, parentCell, grandChildren);
          console.log(`자식 셀 캐시됨: ${parentId}, 하위 셀 개수: ${grandChildren.length}`);
        }
      });
      
      console.log('자식들의 하위 셀들 미리 로딩 완료');
    } catch (err) {
      console.error('자식들의 하위 셀들 미리 로딩 실패:', err);
      // 에러가 발생해도 메인 기능에 영향을 주지 않도록 조용히 실패
    }
  }

  /**
   * 특정 셀을 클릭했을 때 그 자식 데이터를 미리 로딩
   * 사용자가 클릭하기 전에 미리 준비하여 즉시 렌더링 가능하게 함
   */
  async preloadCellChildren(cellId: string): Promise<void> {
    try {
      // 빈 셀이나 잘못된 ID 체크
      if (!cellId || cellId.startsWith('empty-') || cellId.startsWith('temp-')) {
        return;
      }

      // 이미 캐시에 있는지 확인
      const cached = await this.get(cellId);
      if (cached && cached.children.length > 0) {
        console.log(`셀 ${cellId}의 자식들이 이미 캐시되어 있음`);
        return;
      }

      console.log(`셀 ${cellId}의 자식들 미리 로딩 시작`);

      // 셀 정보와 자식들을 로딩
      const [cell, children] = await Promise.all([
        cached?.cell || mandalartAPI.fetchCellById(cellId),
        mandalartAPI.fetchChildrenByCellId(cellId)
      ]);

      if (cell) {
        // 캐시에 저장
        this.set(cellId, cell, children);
        console.log(`셀 ${cellId} 프리로딩 완료: ${children.length}개의 자식 셀`);

        // 손자 셀들도 백그라운드에서 미리 로딩 (비동기)
        if (children.length > 0) {
          this.preloadChildrenOfChildren(children);
        }
      } else {
        console.log(`셀 ${cellId}을 찾을 수 없어 프리로딩 건너뜀`);
      }
    } catch (err) {
      console.error(`셀 ${cellId} 프리로딩 실패:`, err);
      // 에러가 발생해도 메인 기능에 영향을 주지 않도록 조용히 실패
    }
  }

  /**
   * 여러 셀들의 자식 데이터를 병렬로 미리 로딩
   */
  async preloadMultipleCellChildren(cellIds: string[]): Promise<void> {
    if (cellIds.length === 0) return;

    console.log(`${cellIds.length}개 셀들의 자식 데이터 병렬 프리로딩 시작`);

    // 아직 캐시되지 않은 셀들만 필터링
    const uncachedCellIds = cellIds.filter(cellId => {
      const cached = this.getSync(cellId);
      return !cached || cached.children.length === 0;
    });

    if (uncachedCellIds.length === 0) {
      console.log('모든 셀이 이미 캐시되어 있음');
      return;
    }

    // 병렬로 프리로딩 실행
    const preloadPromises = uncachedCellIds.map(cellId => 
      this.preloadCellChildren(cellId)
    );

    try {
      await Promise.allSettled(preloadPromises);
      console.log(`${uncachedCellIds.length}개 셀들의 병렬 프리로딩 완료`);
    } catch (err) {
      console.error('병렬 프리로딩 중 오류 발생:', err);
    }
  }
}

// 싱글톤 인스턴스
export const cellCache = new CellCache();

// 정기적으로 만료된 캐시 정리 (5분마다)
if (typeof window !== 'undefined') {
  setInterval(() => {
    cellCache.cleanup();
  }, 5 * 60 * 1000);
}