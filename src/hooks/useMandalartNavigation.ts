import { useCallback, useState, useEffect } from 'react';
import { Mandalart, MandalartCell } from '@/types/mandalart';

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
  breadcrumbPath: MandalartCell[];
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
      // 계층형 구조인 경우 루트 셀로 초기화
      setNavigationPath([data.rootCell]);
      setCurrentCellId(data.rootCell.id);
    }
  }, [data]);

  // 네비게이션 경로 업데이트
  const updateNavigationPath = useCallback((cellId: string) => {
    // 현재 경로의 맨 마지막 셀 ID 확인
    const currentLastCellId = navigationPath.length > 0 ? 
      navigationPath[navigationPath.length - 1].id : null;
    
    // 이미 현재 셀이 경로의 마지막이면 업데이트 불필요
    if (currentLastCellId === cellId) {
      console.log('이미 현재 셀이 네비게이션 경로의 마지막입니다:', cellId);
      return;
    }
    
    // 경로에 이미 있는지 확인
    const existingIndex = navigationPath.findIndex(cell => cell.id === cellId);
    
    if (existingIndex >= 0) {
      // 이미 경로에 있는 경우 그 위치까지 잘라냄
      console.log(`셀 ${cellId}은(는) 이미 경로에 있습니다. 인덱스: ${existingIndex}`);
      setNavigationPath(prev => prev.slice(0, existingIndex + 1));
      return;
    }
    
    // 셀 데이터 검증
    if (!cellId) {
      console.warn('유효하지 않은 셀 ID로 네비게이션 경로 업데이트 시도:', cellId);
      return;
    }
    
    // 경로에 셀 추가
    console.log(`네비게이션 경로에 셀 추가: ${cellId}`);
    setNavigationPath(prev => [...prev, { id: cellId } as MandalartCell]);
  }, [navigationPath]);

  // 상위 셀로 이동
  const navigateToParent = useCallback(() => {
    if (navigationPath.length <= 1) {
      console.log('이미 최상위 셀입니다.');
      return;
    }
    
    const parentCell = navigationPath[navigationPath.length - 2];
    console.log(`상위 셀로 이동: ${parentCell.id}`);
    setCurrentCellId(parentCell.id);
    setNavigationPath(prev => prev.slice(0, prev.length - 1));
  }, [navigationPath, setCurrentCellId]);

  // 특정 셀로 이동
  const navigateToCell = useCallback((cellId: string) => {
    // 현재 셀과 동일하면 불필요한 상태 업데이트 방지
    if (currentCellId === cellId) {
      console.log('이미 선택된 셀입니다:', cellId);
      return;
    }
    
    console.log(`특정 셀로 이동: ${cellId}`);
    setCurrentCellId(cellId);
    updateNavigationPath(cellId);
  }, [currentCellId, updateNavigationPath, setCurrentCellId]);

  // 브레드크럼 경로 계산 - "../부모 뎁스 주제/현재 뎁스 주제" 형식으로 변환
  const breadcrumbPath = useCallback(() => {
    // 경로가 없거나 한 개만 있으면 그대로 반환 (루트 경로)
    if (navigationPath.length <= 1) {
      return navigationPath;
    }
    
    // 경로가 있으면 마지막 두 개 항목만 가져옴 (부모와 현재)
    const parentCell = navigationPath[navigationPath.length - 2];
    const currentCell = navigationPath[navigationPath.length - 1];
    
    return [parentCell, currentCell];
  }, [navigationPath])();

  return {
    navigationPath,
    currentCellId,
    setCurrentCellId,
    setNavigationPath,
    updateNavigationPath,
    navigateToParent,
    navigateToCell,
    breadcrumbPath
  };
};

export default useMandalartNavigation; 