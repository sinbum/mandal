import { useCallback, useState, useEffect } from 'react';
import { Mandalart, MandalartCell } from '@/types/mandalart';
import { isHierarchicalMandalart, isLegacyMandalart } from '@/utils/mandalartUtils';

interface UseMandalartNavigationProps {
  data?: Mandalart;
}

interface UseMandalartNavigationResult {
  navigationPath: MandalartCell[];
  currentCellId: string | null;
  setCurrentCellId: (id: string | null) => void;
  setNavigationPath: (path: MandalartCell[]) => void;
  updateNavigationPath: (cellId: string) => void;
  navigateToParent: () => void;
  navigateToCell: (cellId: string) => void;
}

/**
 * 만다라트 네비게이션 관련 훅
 * 현재 활성화된 셀과 네비게이션 경로 관리
 */
const useMandalartNavigation = ({ data }: UseMandalartNavigationProps = {}) => {
  const [navigationPath, setNavigationPath] = useState<MandalartCell[]>([]);
  const [currentCellId, setCurrentCellId] = useState<string | null>(null);

  // 초기화 - data 변경시 네비게이션 경로 초기화
  useEffect(() => {
    if (data) {
      if (isHierarchicalMandalart(data)) {
        // 계층형 구조인 경우 루트 셀로 초기화
        setNavigationPath([data.rootCell]);
        setCurrentCellId(data.rootCell.id);
      } else if (isLegacyMandalart(data)) {
        // 레거시 구조인 경우 중앙 블록의 중앙 셀로 초기화
        setNavigationPath([data.centerBlock.centerCell]);
        setCurrentCellId(data.centerBlock.centerCell.id);
      }
    }
  }, [data]);

  // 네비게이션 경로 업데이트
  const updateNavigationPath = useCallback((cellId: string) => {
    // 경로에 이미 있는지 확인
    const existingIndex = navigationPath.findIndex(cell => cell.id === cellId);
    
    if (existingIndex >= 0) {
      // 이미 경로에 있는 경우 그 위치까지 잘라냄
      setNavigationPath(prev => prev.slice(0, existingIndex + 1));
      return;
    }
    
    // 경로에 셀 추가
    setNavigationPath(prev => [...prev, { id: cellId } as MandalartCell]);
  }, [navigationPath]);

  // 상위 셀로 이동
  const navigateToParent = useCallback(() => {
    if (navigationPath.length <= 1) return;
    
    const parentCell = navigationPath[navigationPath.length - 2];
    setCurrentCellId(parentCell.id);
    setNavigationPath(prev => prev.slice(0, prev.length - 1));
  }, [navigationPath]);

  // 특정 셀로 이동 (이 함수는 사용되지 않지만 인터페이스를 맞추기 위해 유지)
  const navigateToCell = useCallback((_cellId: string) => {
    // 실제 구현은 사용하지 않으므로 비어 있음
  }, []);

  return {
    navigationPath,
    currentCellId,
    setCurrentCellId,
    setNavigationPath,
    updateNavigationPath,
    navigateToParent,
    navigateToCell
  };
};

export default useMandalartNavigation; 