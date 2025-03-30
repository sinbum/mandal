import { useState, useCallback, useMemo } from 'react';
import { MandalartCell } from '@/types/mandalart';
import { mandalartAPI } from '@/services/mandalartService';

interface UseMandalartNavigationProps {
  initialCell?: MandalartCell | null;
}

/**
 * 만다라트 내비게이션 관련 로직을 담당하는 훅
 */
const useMandalartNavigation = ({ initialCell }: UseMandalartNavigationProps = {}) => {
  const [navigationPath, setNavigationPath] = useState<MandalartCell[]>(
    initialCell ? [initialCell] : []
  );
  const [currentCellId, setCurrentCellId] = useState<string | null>(
    initialCell ? initialCell.id : null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // 현재 셀 정보
  const currentCell = useMemo(() => {
    if (!currentCellId) return null;
    return navigationPath.find(cell => cell.id === currentCellId) || null;
  }, [navigationPath, currentCellId]);
  
  // 빵 부스러기 경로 - 네비게이션 경로에서 제목만 가져온 간소화 버전
  const breadcrumbPath = useMemo(() => {
    return navigationPath.map(cell => ({
      id: cell.id,
      topic: cell.topic || '무제',
      depth: cell.depth,
      position: cell.position,
    } as MandalartCell));
  }, [navigationPath]);
  
  // 셀 ID로 경로 구성
  const buildPathForCell = useCallback(async (cellId: string) => {
    if (!cellId) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      // API를 통해 셀 경로 가져오기
      const path = await mandalartAPI.buildCellPath(cellId);
      
      if (path.length > 0) {
        setNavigationPath(path);
        setCurrentCellId(cellId);
      } else {
        // 단일 셀 정보 가져오기
        const cell = await mandalartAPI.fetchCellById(cellId);
        if (cell) {
          setNavigationPath([cell]);
          setCurrentCellId(cell.id);
        } else {
          setError('셀 정보를 찾을 수 없습니다');
        }
      }
    } catch (err) {
      console.error('셀 경로 구성 오류:', err);
      setError('셀 경로를 구성하는데 실패했습니다');
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // 부모 셀로 네비게이션
  const navigateToParent = useCallback(() => {
    if (navigationPath.length <= 1) {
      return; // 이미 최상위 셀
    }
    
    // 마지막에서 두 번째 셀로 이동 (현재 셀의 부모)
    const parentIndex = navigationPath.length - 2;
    if (parentIndex >= 0) {
      const parentCell = navigationPath[parentIndex];
      setCurrentCellId(parentCell.id);
      setNavigationPath(prevPath => prevPath.slice(0, parentIndex + 1));
    }
  }, [navigationPath]);
  
  // 특정 셀로 네비게이션
  const navigateToCell = useCallback((cellId: string) => {
    if (!cellId) return;
    
    // 이미 현재 셀이면 무시
    if (currentCellId === cellId) return;
    
    // 현재 경로에서 셀 찾기
    const cellIndex = navigationPath.findIndex(cell => cell.id === cellId);
    
    if (cellIndex >= 0) {
      // 이미 경로에 있는 셀이면 해당 위치까지 경로 잘라내기
      setCurrentCellId(cellId);
      setNavigationPath(prevPath => prevPath.slice(0, cellIndex + 1));
    } else {
      // 경로에 없는 셀이면 새 경로 구성
      buildPathForCell(cellId);
    }
  }, [currentCellId, navigationPath, buildPathForCell]);
  
  // 빈 셀 생성 헬퍼 함수
  const createEmptyCell = useCallback((
    parentId: string | null,
    position: number,
    depth: number
  ): MandalartCell => ({
    id: `empty-${position}`,
    topic: '',
    memo: '클릭하여 새 셀을 추가하세요',
    isCompleted: false,
    parentId,
    depth,
    position
  }), []);
  
  // 빈 셀 자동 채우기
  const fillEmptyCells = useCallback((
    cells: MandalartCell[],
    parentId: string | null,
    parentDepth: number
  ): MandalartCell[] => {
    const resultCells = [...cells];
    
    // 8개가 될 때까지 빈 셀 추가
    for (let i = resultCells.length; i < 8; i++) {
      resultCells.push(createEmptyCell(parentId, i + 1, parentDepth + 1));
    }
    
    return resultCells;
  }, [createEmptyCell]);

  return {
    navigationPath,
    currentCellId,
    currentCell,
    breadcrumbPath,
    isLoading,
    error,
    setNavigationPath,
    setCurrentCellId,
    buildPathForCell,
    navigateToParent,
    navigateToCell,
    fillEmptyCells,
    createEmptyCell
  };
};

export default useMandalartNavigation; 