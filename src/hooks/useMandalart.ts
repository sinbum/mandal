import { useState, useEffect, useCallback } from 'react';
import { Mandalart, MandalartCell, MandalartCellWithChildren, MandalartHierarchical } from '@/types/mandalart';

// 분리된 유틸 함수들 임포트
import { 
  findCellInHierarchy, 
  updateCellChildrenInHierarchy
} from '@/utils/mandalartUtils';

// 분리된 API 함수들 임포트
import {
  fetchMandalartById,
  updateCellById,
  createNewMandalart,
  fetchMandalartListForUser,
  createNewCell,
  createNewCellAndGetEditData,
  toggleCellCompletionById,
  deleteMandalartById,
  loadChildrenForCellById
} from '@/api/mandalartApi';

// 분리된 네비게이션 관련 함수 임포트
import useMandalartNavigation from '@/hooks/useMandalartNavigation';

interface UseMandalartResult {
  mandalart: MandalartHierarchical | null;
  isLoading: boolean;
  error: string | null;
  updateCell: (cellId: string, updatedCell: {
    id: string;
    topic?: string;
    memo?: string;
    color?: string;
    imageUrl?: string;
    isCompleted?: boolean;
    depth?: number;
    position?: number;
    parentId?: string
  }) => void;
  createMandalart: (title: string, templateId?: string) => Promise<string>;
  fetchMandalartList: () => Promise<Array<{id: string, title: string, createdAt: string, updatedAt: string}>>;
  fetchMandalart: (id: string) => Promise<MandalartHierarchical | null>;
  createCell: (mandalartId: string, position: number, cellData: Partial<MandalartCell>) => Promise<string>;
  createCellAndEdit: (mandalartId: string, position: number, parentCell?: MandalartCell | null) => Promise<MandalartCell>;
  toggleCellCompletion: (cellId: string) => Promise<void>;
  deleteMandalart: (id: string) => Promise<void>;
  navigationPath: MandalartCell[];
  breadcrumbPath: MandalartCell[];
  currentCell: MandalartCell | null;
  navigateToCell: (cellId: string) => void;
  navigateToParent: () => void;
  loadChildrenForCell: (cellId: string) => Promise<void>;
  setNavigationPath: (path: MandalartCell[]) => void;
  setCurrentCellId: (id: string | null) => void;
  setMandalart: (data: MandalartHierarchical | null) => void;
}

/**
 * 만다라트 데이터 관리 훅
 */
const useMandalart = (mandalartId?: string): UseMandalartResult => {
  const [mandalart, setMandalart] = useState<MandalartHierarchical | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(!!mandalartId);
  const [error, setError] = useState<string | null>(null);
  
  // 네비게이션 관련 훅 사용
  const {
    navigationPath,
    currentCellId,
    updateNavigationPath,
    navigateToParent,
    navigateToCell,
    setCurrentCellId,
    setNavigationPath,
    breadcrumbPath
  } = useMandalartNavigation({ data: mandalart || undefined });

  // 셀 찾기
  const findCell = useCallback((cellId: string): MandalartCell | null => {
    if (!mandalart) return null;
    return findCellInHierarchy(mandalart.rootCell, cellId);
  }, [mandalart]);
  
  // 만다라트 데이터 로드 (ID가 있을 경우)
  useEffect(() => {
    if (!mandalartId) return;

    setIsLoading(true);
    setError(null);

    fetchMandalartById(mandalartId)
      .then((data) => {
        // 오직 계층형 만다라트만 처리
        const hierarchicalData = data as MandalartHierarchical;
        setMandalart(hierarchicalData);
        
        // navigationPath 초기화
        if (hierarchicalData && hierarchicalData.rootCell) {
          // 계층형 구조인 경우 루트 셀로 초기화
          setNavigationPath([hierarchicalData.rootCell]);
          setCurrentCellId(hierarchicalData.rootCell.id);
        }
        
        setIsLoading(false);
      })
      .catch((err) => {
        setError('만다라트를 불러오는데 실패했습니다.');
        console.error(err);
        setIsLoading(false);
      });
  }, [mandalartId, setCurrentCellId, setNavigationPath]);

  // 셀 업데이트
  const updateCell = useCallback(async (cellId: string, updatedCell: Partial<MandalartCell>) => {
    if (!mandalart) return;

    // 디버깅 로그 추가
    console.log('셀 업데이트 시도:', {
      cellId,
      updatedCell
    });

    if (!cellId) {
      console.error('셀 업데이트 실패: cellId가 없습니다');
      return;
    }

    try {
      await updateCellById(cellId, updatedCell);
      console.log('셀 업데이트 API 호출 성공:', { cellId, updatedCell });
      
      // UI 업데이트
      setMandalart(prev => {
        if (!prev) return null;

        // 루트 셀 업데이트
        if (prev.rootCell.id === cellId) {
          return {
            ...prev,
            rootCell: {
              ...prev.rootCell,
              ...updatedCell,
              children: prev.rootCell.children
            }
          };
        }
        
        // 하위 셀 업데이트
        const updatedRootCell = updateCellChildrenInHierarchy(
          prev.rootCell,
          cellId,
          updatedCell
        );
        
        if (updatedRootCell) {
          return {
            ...prev,
            rootCell: updatedRootCell
          };
        }

        return prev;
      });
    } catch (err) {
      console.error('셀 업데이트 실패:', err);
      setError('셀 업데이트에 실패했습니다.');
    }
  }, [mandalart]);

  // 새 만다라트 생성
  const createMandalart = useCallback(async (title: string, templateId?: string): Promise<string> => {
    try {
      const mandalartId = await createNewMandalart(title, templateId);
      return mandalartId;
    } catch (err) {
      console.error('만다라트 생성 실패:', err);
      throw err;
    }
  }, []);

  // 만다라트 목록 조회
  const fetchMandalartList = useCallback(async () => {
    try {
      // API 직접 호출
      const data = await fetchMandalartListForUser();
      return data;
    } catch (err) {
      console.error('만다라트 목록 조회 실패:', err);
      setError('만다라트 목록을 불러오는데 실패했습니다.');
      return [];
    }
  }, []);

  // 특정 만다라트 데이터 로드
  const fetchMandalart = useCallback(async (id: string): Promise<MandalartHierarchical | null> => {
    try {
      const data = await fetchMandalartById(id);
      return data as MandalartHierarchical;
    } catch (err) {
      console.error('만다라트 데이터 조회 실패:', err);
      throw err;
    }
  }, []);

  // 개별 셀 생성
  const createCell = useCallback(async (mandalartId: string, position: number, cellData: Partial<MandalartCell>): Promise<string> => {
    try {
      const cellId = await createNewCell(mandalartId, position, cellData);
      
      // 생성 후 부모 셀에 자식 셀 추가 (UI 업데이트)
      if (cellData.parentId && mandalart) {
        const newCell: MandalartCell = {
          id: cellId,
          topic: cellData.topic || '',
          memo: cellData.memo,
          color: cellData.color,
          imageUrl: cellData.imageUrl,
          isCompleted: cellData.isCompleted || false,
          parentId: cellData.parentId,
          depth: cellData.depth || 0,
          position: position
        };
        
        // UI 상태 업데이트
        setMandalart(prev => {
          if (!prev) return prev;
          
          // 부모 셀 찾기
          const parentCell = findCellInHierarchy(prev.rootCell, cellData.parentId as string);
          if (!parentCell) return prev;
          
          // 부모 셀의 자식 배열에 새 셀 추가
          const updatedRootCell = updateCellChildrenInHierarchy(
            prev.rootCell,
            cellData.parentId as string,
            { 
              children: Array.isArray((parentCell as MandalartCellWithChildren).children) 
                ? [...(parentCell as MandalartCellWithChildren).children, newCell]
                : [newCell]
            } as Partial<MandalartCellWithChildren>
          );
          
          if (updatedRootCell) {
            return {
              ...prev,
              rootCell: updatedRootCell
            };
          }
          
          return prev;
        });
      }
      
      return cellId;
    } catch (err) {
      console.error('셀 생성 실패:', err);
      throw err;
    }
  }, [mandalart, findCell]);

  // 셀 완료 상태 토글
  const toggleCellCompletion = useCallback(async (cellId: string) => {
    if (!mandalart) return;
    
    try {
      // 현재 셀 찾기
      const currentCell = findCell(cellId);
      
      if (!currentCell) {
        throw new Error('해당 셀을 찾을 수 없습니다.');
      }
      
      // 완료 상태 반전
      const newCompletionStatus = !currentCell.isCompleted;
      
      await toggleCellCompletionById(cellId, newCompletionStatus);
      
      // UI 업데이트
      setMandalart(prev => {
        if (!prev) return null;
        
        // 계층형 구조에서 업데이트
        const updatedRootCell = updateCellChildrenInHierarchy(
          prev.rootCell,
          cellId,
          { isCompleted: newCompletionStatus }
        );
        
        if (updatedRootCell) {
          return {
            ...prev,
            rootCell: updatedRootCell
          };
        }
        
        return prev;
      });
    } catch (err) {
      console.error('셀 완료 상태 토글 실패:', err);
      setError('셀 완료 상태를 변경하는데 실패했습니다.');
    }
  }, [mandalart, findCell]);

  // 만다라트 삭제
  const deleteMandalart = useCallback(async (id: string) => {
    try {
      await deleteMandalartById(id);
      
      // 현재 보고 있는 만다라트가 삭제된 경우 상태 초기화
      if (mandalartId === id) {
        setMandalart(null);
      }
    } catch (err) {
      console.error('만다라트 삭제 실패:', err);
      setError('만다라트 삭제에 실패했습니다.');
      throw err;
    }
  }, [mandalartId]);

  // 특정 셀의 자식 셀 로드
  const loadChildrenForCell = useCallback(async (cellId: string) => {
    if (!mandalart || !mandalartId) return;
    
    try {
      // 이미 로딩 중이면 중복 요청 방지
      if (isLoading) {
        console.log('이미 다른 데이터 로딩 중 - 요청 무시:', cellId);
        return;
      }
      
      // 현재 셀 정보 가져오기
      const targetCell = findCellInHierarchy(mandalart.rootCell, cellId);
      console.log('계층형 구조 - 타겟 셀 찾음:', !!targetCell, targetCell?.topic);
      
      // 이미 자식 데이터가 있는지 확인
      const targetCellWithChildren = targetCell as MandalartCellWithChildren;
      if (targetCellWithChildren && 
          targetCellWithChildren.children && 
          targetCellWithChildren.children.length > 0) {
        console.log('이미 자식 데이터가 로드되어 있음:', targetCellWithChildren.children.length);
        
        // 이미 데이터가 있으면 네비게이션만 업데이트하고 API 요청은 하지 않음
        setCurrentCellId(cellId);
        updateNavigationPath(cellId);
        return;
      }
      
      if (!targetCell) {
        console.error('선택한 셀을 찾을 수 없습니다:', cellId);
        setError('선택한 셀을 찾을 수 없습니다.');
        return;
      }
      
      setIsLoading(true);
      console.log('셀 자식 로드 시작:', cellId);
      
      // API 직접 호출
      try {
        const childrenResults = await loadChildrenForCellById(mandalartId, cellId, { limit: 25 });
        console.log('자식 셀 로드 완료:', childrenResults.children.length);
        
        // 만다라트 업데이트
        setMandalart(prev => {
          if (!prev) {
            console.error('만다라트가 없음');
            return prev;
          }
          
          console.log('만다라트 업데이트 - 자식 셀 추가');
          
          // 계층형 구조인 경우
          const updatedRootCell = updateCellChildrenInHierarchy(
            prev.rootCell,
            cellId,
            { children: childrenResults.children } as Partial<MandalartCellWithChildren>
          );
          
          if (!updatedRootCell) return prev;
          
          return {
            ...prev,
            rootCell: updatedRootCell
          };
        });
        
        setCurrentCellId(cellId);
        updateNavigationPath(cellId);
      } catch (apiError) {
        console.error('API 호출 실패:', apiError);
        setError('자식 셀을 로드하는데 실패했습니다.');
      }
    } catch (err) {
      console.error('자식 셀 로드 실패:', err);
      setError('자식 셀을 로드하는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [mandalart, mandalartId, isLoading, setCurrentCellId, updateNavigationPath, findCell]);

  // 통합된 셀 생성 및 편집 함수 (UI 효율성 개선)
  const createCellAndEdit = useCallback(async (
    mandalartId: string, 
    position: number, 
    parentCell?: MandalartCell | null
  ): Promise<MandalartCell> => {
    console.log('셀 생성 및 편집 시작:', {
      mandalartId,
      position,
      parentCell
    });

    try {
      // 부모 셀 정보 구성
      const parentData = parentCell ? {
        parentId: parentCell.id,
        parentDepth: parentCell.depth || 0
      } : {}; 

      console.log('셀 생성 부모 데이터:', parentData);

      // 새 셀 생성 및 편집 데이터 받기
      const newCell = await createNewCellAndGetEditData(
        mandalartId, 
        position, 
        parentData
      );
      
      console.log('새 셀 생성 완료:', newCell);
      
      // 부모 셀이 있으면 자식 셀 업데이트
      if (parentCell && parentCell.id && mandalart) {
        // UI 상태 업데이트
        setMandalart(prev => {
          if (!prev) return prev;
          
          // 부모 셀 찾기
          const foundParentCell = findCellInHierarchy(prev.rootCell, parentCell.id);
          if (!foundParentCell) return prev;
          
          // 부모 셀의 자식 배열에 새 셀 추가
          const updatedRootCell = updateCellChildrenInHierarchy(
            prev.rootCell,
            parentCell.id,
            { 
              children: Array.isArray((foundParentCell as MandalartCellWithChildren).children) 
                ? [...(foundParentCell as MandalartCellWithChildren).children, newCell]
                : [newCell]
            } as Partial<MandalartCellWithChildren>
          );
          
          if (updatedRootCell) {
            return {
              ...prev,
              rootCell: updatedRootCell
            };
          }
          
          return prev;
        });
        
        // 부모 셀의 자식 목록 다시 로드 (백엔드 동기화)
        loadChildrenForCell(parentCell.id);
      } else if (!parentCell && mandalart) {
        // 루트 레벨 셀인 경우 만다라트 전체 다시 로드
        fetchMandalart(mandalartId).then(data => {
          if (data) {
            setMandalart(data);
          }
        });
      }
      
      console.log('셀 생성 및 UI 업데이트 완료, 반환 데이터:', newCell);
      return newCell;
    } catch (err) {
      console.error('통합 셀 생성 및 편집 실패:', err);
      throw err;
    }
  }, [mandalart, fetchMandalart, loadChildrenForCell]);

  // 현재 활성화된 셀 가져오기
  const getCurrentCell = useCallback(() => {
    if (!mandalart || !currentCellId) return null;
    
    return findCell(currentCellId);
  }, [mandalart, currentCellId, findCell]);

  // 현재 셀로 이동 함수
  const navigateToCellById = useCallback((cellId: string) => {
    const cell = findCell(cellId);
    if (cell) {
      setCurrentCellId(cell.id);
      updateNavigationPath(cell.id);
    }
  }, [findCell, setCurrentCellId, updateNavigationPath]);

  return {
    mandalart,
    isLoading,
    error,
    updateCell,
    createMandalart,
    fetchMandalartList,
    fetchMandalart,
    createCell,
    createCellAndEdit,
    toggleCellCompletion,
    deleteMandalart,
    navigationPath,
    breadcrumbPath,
    currentCell: getCurrentCell(),
    navigateToCell: navigateToCellById,
    navigateToParent,
    loadChildrenForCell,
    setNavigationPath,
    setCurrentCellId,
    setMandalart
  };
};

export default useMandalart;