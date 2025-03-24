import { useState, useCallback, useMemo } from 'react';
import { Mandalart, MandalartCell, MandalartCellWithChildren } from '@/types/mandalart';
import { findCellInHierarchy, findCellAndBuildPathInHierarchy } from '@/utils/mandalartUtils';

interface UseMandalartNavigationProps {
  data?: Mandalart | null;
}

interface UseMandalartNavigationResult {
  navigationPath: MandalartCell[];
  currentCellId: string | null;
  setCurrentCellId: (id: string | null) => void;
  getRootCellTitle: () => string;
  getEmptyCellsWithVirtualIds: (cellsArray: MandalartCell[], parentCell?: MandalartCell) => MandalartCell[];
  setNavigationPath: (path: MandalartCell[]) => void;
  updateNavigationPath: (cellId: string) => void;
  navigateToParent: () => void;
  navigateToCell: (cellId: string) => void;
  breadcrumbPath: MandalartCell[];
}

/**
 * 만다라트 내비게이션 관련 로직을 모아둔 훅
 */
const useMandalartNavigation = ({ data }: UseMandalartNavigationProps = {}): UseMandalartNavigationResult => {
  const [navigationPath, setNavigationPath] = useState<MandalartCell[]>([]);
  const [currentCellId, setCurrentCellId] = useState<string | null>(null);
  
  // 빵 부스러기 경로 - 네비게이션 경로에서 제목만 가져온 간소화 버전
  const breadcrumbPath = useMemo(() => {
    return navigationPath.map(cell => ({
      id: cell.id,
      topic: cell.topic,
      depth: cell.depth,
      position: cell.position,
    } as MandalartCell));
  }, [navigationPath]);
  
  // 루트 셀 제목 가져오기
  const getRootCellTitle = useCallback(() => {
    if (!data) return '새 만다라트';
    return data.rootCell?.topic || data.title || '새 만다라트';
  }, [data]);
  
  // 네비게이션 경로 업데이트
  const updateNavigationPath = useCallback((cellId: string) => {
    if (!data || !data.rootCell) {
      setNavigationPath([]);
      return;
    }
    
    console.log('네비게이션 경로 업데이트 요청:', cellId);
    
    // 루트 셀부터 현재 셀까지의 경로 찾기
    const pathResult = findCellAndBuildPathInHierarchy(data.rootCell, cellId);
    
    if (pathResult) {
      console.log('경로 찾음:', pathResult.map((c: MandalartCell) => c.topic || '무제'));
      setNavigationPath(pathResult);
    } else {
      console.log('경로를 찾을 수 없음, 루트 셀로 초기화');
      // 경로를 찾을 수 없으면 루트 셀로 초기화
      setNavigationPath([data.rootCell]);
    }
  }, [data]);
  
  // 부모 셀로 네비게이션
  const navigateToParent = useCallback(() => {
    if (navigationPath.length <= 1) {
      console.log('이미 최상위 셀입니다');
      return;
    }
    
    // 마지막에서 두 번째 셀로 이동 (현재 셀의 부모)
    const parentIndex = navigationPath.length - 2;
    if (parentIndex >= 0) {
      const parentCell = navigationPath[parentIndex];
      setCurrentCellId(parentCell.id);
      
      // 경로를 부모까지로 자르기
      setNavigationPath(navigationPath.slice(0, parentIndex + 1));
    }
  }, [navigationPath]);
  
  // 특정 셀로 네비게이션
  const navigateToCell = useCallback((cellId: string) => {
    if (!data || !data.rootCell) return;
    
    // 현재 경로에서 셀 찾기
    const cellIndex = navigationPath.findIndex(cell => cell.id === cellId);
    
    if (cellIndex >= 0) {
      // 이미 경로에 있는 셀이면 해당 위치까지 경로 잘라내기
      setCurrentCellId(cellId);
      setNavigationPath(navigationPath.slice(0, cellIndex + 1));
    } else {
      // 경로에 없는 셀이면 새 경로 생성
      updateNavigationPath(cellId);
      setCurrentCellId(cellId);
    }
  }, [data, navigationPath, updateNavigationPath]);
  
  // 빈 셀에 가상 ID 부여하기
  const getEmptyCellsWithVirtualIds = useCallback((cellsArray: MandalartCell[], parentCell?: MandalartCell) => {
    if (!cellsArray || !Array.isArray(cellsArray)) return [];

    // 배열 내 실제 셀 수
    const existingCellsCount = cellsArray.filter(cell => cell && cell.id).length;
    
    // 결과 배열 구성
    const resultCells = [...cellsArray];
    
    // 부모 셀의 depth 가져오기 (없으면 0으로 가정)
    const parentDepth = parentCell?.depth !== undefined ? parentCell.depth : 0;
    
    // 8개가 될 때까지 빈 셀 추가
    for (let i = existingCellsCount; i < 8; i++) {
      resultCells.push({
        id: `empty-${i+1}`, // 가상 ID 부여
        topic: '',
        memo: '클릭하여 새 셀을 추가하세요',
        isCompleted: false,
        parentId: parentCell?.id, // 부모 ID 설정
        depth: parentDepth + 1, // 부모 셀의 depth + 1로 설정
        position: i+1
      } as MandalartCell);
    }
    
    return resultCells;
  }, []);

  return {
    navigationPath,
    currentCellId,
    setCurrentCellId,
    getRootCellTitle,
    getEmptyCellsWithVirtualIds,
    setNavigationPath,
    updateNavigationPath,
    navigateToParent,
    navigateToCell,
    breadcrumbPath
  };
};

export default useMandalartNavigation; 