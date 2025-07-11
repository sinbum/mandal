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
  private readonly TTL = 5 * 60 * 1000; // 5분 TTL

  /**
   * 캐시에 셀 데이터 저장
   */
  set(cellId: string, cell: MandalartCell, children: MandalartCell[] = []): void {
    this.cache.set(cellId, {
      cell,
      children,
      timestamp: Date.now()
    });
  }

  /**
   * 캐시에서 셀 데이터 조회
   */
  get(cellId: string): { cell: MandalartCell; children: MandalartCell[] } | null {
    const cached = this.cache.get(cellId);
    
    if (!cached) {
      console.log(`캐시 미스: ${cellId}`);
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
   * 캐시에서 셀만 조회
   */
  getCell(cellId: string): MandalartCell | null {
    const cached = this.get(cellId);
    return cached?.cell || null;
  }

  /**
   * 캐시에서 자식 셀들만 조회
   */
  getChildren(cellId: string): MandalartCell[] | null {
    const cached = this.get(cellId);
    return cached?.children || null;
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
}

// 싱글톤 인스턴스
export const cellCache = new CellCache();

// 정기적으로 만료된 캐시 정리 (5분마다)
if (typeof window !== 'undefined') {
  setInterval(() => {
    cellCache.cleanup();
  }, 5 * 60 * 1000);
}