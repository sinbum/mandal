import { useState, useEffect, useCallback } from 'react';
import { Mandalart, MandalartCell, MandalartBlock, MandalartCellWithChildren } from '@/types/mandalart';

// 분리된 유틸 함수들 임포트
import { 
  findCellInHierarchy, 
  updateCellChildrenInHierarchy,
  isHierarchicalMandalart,
  isLegacyMandalart
} from '@/utils/mandalartUtils';

// 분리된 API 함수들 임포트
import {
  fetchMandalartById,
  updateCellById,
  createNewMandalart,
  fetchMandalartListForUser,
  createNewCell,
  toggleCellCompletionById,
  deleteMandalartById,
  loadChildrenForCellById
} from '@/api/mandalartApi';

// 분리된 네비게이션 관련 함수 임포트
import useMandalartNavigation from '@/hooks/useMandalartNavigation';

interface UseMandalartResult {
  mandalart: Mandalart | null;
  isLoading: boolean;
  error: string | null;
  updateCell: (cellId: string, updatedCell: MandalartCell) => void;
  createMandalart: (title: string, templateId?: string) => Promise<string>;
  fetchMandalartList: () => Promise<Array<{id: string, title: string, createdAt: string, updatedAt: string}>>;
  fetchMandalart: (id: string) => Promise<Mandalart | null>;
  createCell: (mandalartId: string, position: number, cellData: Partial<MandalartCell>) => Promise<string>;
  toggleCellCompletion: (cellId: string) => Promise<void>;
  deleteMandalart: (id: string) => Promise<void>;
  navigationPath: MandalartCell[];
  currentCell: MandalartCell | null;
  navigateToCell: (cellId: string) => void;
  navigateToParent: () => void;
  loadChildrenForCell: (cellId: string) => Promise<void>;
}

/**
 * 만다라트 데이터 관리 훅
 */
const useMandalart = (mandalartId?: string): UseMandalartResult => {
  const [mandalart, setMandalart] = useState<Mandalart | null>(null);
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
    setNavigationPath
  } = useMandalartNavigation({ data: mandalart || undefined });

  // 셀 찾기
  const findCell = useCallback((cellId: string): MandalartCell | null => {
    if (!mandalart) return null;

    if (isHierarchicalMandalart(mandalart)) {
      return findCellInHierarchy(mandalart.rootCell, cellId);
    }

    if (isLegacyMandalart(mandalart)) {
      // 중앙 블록의 중앙 셀 확인
      if (mandalart.centerBlock.centerCell.id === cellId) {
        return mandalart.centerBlock.centerCell;
      }

      // 중앙 블록의 주변 셀 확인
      const centerBlockSurroundingCell = mandalart.centerBlock.surroundingCells.find(
        cell => cell.id === cellId
      );
      if (centerBlockSurroundingCell) {
        return centerBlockSurroundingCell;
      }

      // 주변 블록 확인
      for (const block of mandalart.surroundingBlocks) {
        // 주변 블록의 중앙 셀 확인
        if (block.centerCell.id === cellId) {
          return block.centerCell;
        }

        // 주변 블록의 주변 셀 확인
        const surroundingCell = block.surroundingCells.find(cell => cell.id === cellId);
        if (surroundingCell) {
          return surroundingCell;
        }
      }
    }

    return null;
  }, [mandalart]);
  
  // 만다라트 데이터 로드 (ID가 있을 경우)
  useEffect(() => {
    if (!mandalartId) return;

    setIsLoading(true);
    setError(null);

    fetchMandalartById(mandalartId)
      .then((data) => {
        setMandalart(data);
        
        // navigationPath 초기화
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
        
        setIsLoading(false);
      })
      .catch((err) => {
        setError('만다라트를 불러오는데 실패했습니다.');
        console.error(err);
        setIsLoading(false);
      });
  }, [mandalartId, setCurrentCellId, setNavigationPath]);

  // 셀 업데이트
  const updateCell = useCallback(async (cellId: string, updatedCell: MandalartCell) => {
    if (!mandalart) return;

    try {
      await updateCellById(cellId, updatedCell);
      
      // UI 업데이트
      setMandalart(prev => {
        if (!prev) return null;

        const newMandalart = { ...prev };
        
        if (isLegacyMandalart(newMandalart)) {
          // 중앙 블록 검사
          if (cellId === newMandalart.centerBlock.centerCell.id) {
            newMandalart.centerBlock = {
              ...newMandalart.centerBlock,
              centerCell: {
                ...updatedCell
              }
            };
            return newMandalart;
          }

          // 중앙 블록의 주변 셀 검사
          const centerSurroundingIndex = newMandalart.centerBlock.surroundingCells.findIndex(cell => cell.id === cellId);
          if (centerSurroundingIndex !== -1) {
            newMandalart.centerBlock.surroundingCells[centerSurroundingIndex] = {
              ...updatedCell
            };
            return newMandalart;
          }

          // 주변 블록 검사
          for (let i = 0; i < newMandalart.surroundingBlocks.length; i++) {
            const block = newMandalart.surroundingBlocks[i];
            
            // 블록 중앙 셀 검사
            if (block.centerCell.id === cellId) {
              newMandalart.surroundingBlocks[i] = {
                ...block,
                centerCell: {
                  ...updatedCell
                }
              };
              return newMandalart;
            }

            // 블록 주변 셀 검사
            const surroundingIndex = block.surroundingCells.findIndex(cell => cell.id === cellId);
            if (surroundingIndex !== -1) {
              newMandalart.surroundingBlocks[i].surroundingCells[surroundingIndex] = {
                ...updatedCell
              };
              return newMandalart;
            }
          }
        } else if (isHierarchicalMandalart(newMandalart)) {
          // 계층형 구조에서 업데이트
          if (newMandalart.rootCell.id === cellId) {
            // 루트 셀 업데이트
            newMandalart.rootCell = {
              ...newMandalart.rootCell,
              ...updatedCell,
              children: newMandalart.rootCell.children
            };
            return newMandalart;
          }
          
          // 하위 셀 업데이트
          const updatedRootCell = updateCellChildrenInHierarchy(
            newMandalart.rootCell,
            cellId,
            updatedCell
          );
          
          if (updatedRootCell) {
            return {
              ...newMandalart,
              rootCell: updatedRootCell
            };
          }
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
      return await fetchMandalartListForUser();
    } catch (err) {
      console.error('만다라트 목록 조회 실패:', err);
      setError('만다라트 목록을 불러오는데 실패했습니다.');
      return [];
    }
  }, []);

  // 특정 만다라트 데이터 로드
  const fetchMandalart = useCallback(async (id: string): Promise<Mandalart | null> => {
    try {
      return await fetchMandalartById(id);
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
      if (cellData.parentId && mandalart && isHierarchicalMandalart(mandalart)) {
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
        } as any; // 자식 셀 속성은 any로 처리
        
        // UI 상태 업데이트
        setMandalart(prev => {
          if (!prev || !isHierarchicalMandalart(prev)) return prev;
          
          // 부모 셀 찾기
          const parentCell = findCellInHierarchy(prev.rootCell, cellData.parentId as string);
          if (!parentCell) return prev;
          
          // 부모 셀의 자식 배열에 새 셀 추가
          const updatedRootCell = updateCellChildrenInHierarchy(
            prev.rootCell,
            cellData.parentId as string,
            { 
              children: Array.isArray((parentCell as any).children) 
                ? [...(parentCell as any).children, newCell]
                : [newCell]
            } as any
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
        
        if (isLegacyMandalart(prev)) {
          const newMandalart = { ...prev };
          
          // 중앙 블록의 중앙 셀 업데이트
          if (newMandalart.centerBlock.centerCell.id === cellId) {
            newMandalart.centerBlock = {
              ...newMandalart.centerBlock,
              centerCell: {
                ...newMandalart.centerBlock.centerCell,
                isCompleted: newCompletionStatus
              }
            };
            return newMandalart;
          }
          
          // 중앙 블록의 주변 셀 업데이트
          const centerSurroundingIndex = newMandalart.centerBlock.surroundingCells.findIndex(cell => cell.id === cellId);
          if (centerSurroundingIndex !== -1) {
            newMandalart.centerBlock.surroundingCells[centerSurroundingIndex] = {
              ...newMandalart.centerBlock.surroundingCells[centerSurroundingIndex],
              isCompleted: newCompletionStatus
            };
            return newMandalart;
          }
          
          // 주변 블록 업데이트
          for (let i = 0; i < newMandalart.surroundingBlocks.length; i++) {
            const block = newMandalart.surroundingBlocks[i];
            
            // 블록 중앙 셀 업데이트
            if (block.centerCell.id === cellId) {
              newMandalart.surroundingBlocks[i] = {
                ...block,
                centerCell: {
                  ...block.centerCell,
                  isCompleted: newCompletionStatus
                }
              };
              return newMandalart;
            }
            
            // 블록 주변 셀 업데이트
            const surroundingIndex = block.surroundingCells.findIndex(cell => cell.id === cellId);
            if (surroundingIndex !== -1) {
              newMandalart.surroundingBlocks[i].surroundingCells[surroundingIndex] = {
                ...newMandalart.surroundingBlocks[i].surroundingCells[surroundingIndex],
                isCompleted: newCompletionStatus
              };
              return newMandalart;
            }
          }
        } else if (isHierarchicalMandalart(prev)) {
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
      setIsLoading(true);
      console.log('셀 자식 로드 시작:', cellId);
      
      // 현재 셀 정보 가져오기
      let targetCell: MandalartCell | null = null;
      
      // 새 구조와 레거시 구조 모두 처리
      if (isHierarchicalMandalart(mandalart)) {
        // 계층형 구조에서 셀 찾기
        targetCell = findCellInHierarchy(mandalart.rootCell, cellId);
        console.log('계층형 구조 - 타겟 셀 찾음:', !!targetCell, targetCell?.topic);
      } else if (isLegacyMandalart(mandalart)) {
        // 레거시 구조에서는 하위 셀 로드가 지원되지 않음
        console.log('레거시 구조에서는 하위 셀 로드가 지원되지 않음');
        setCurrentCellId(cellId);
        updateNavigationPath(cellId);
        setIsLoading(false);
        return;
      }
      
      if (!targetCell) {
        console.error('선택한 셀을 찾을 수 없습니다:', cellId);
        setError('선택한 셀을 찾을 수 없습니다.');
        setIsLoading(false);
        return;
      }
      
      // 이미 자식이 로드되어 있는지 확인
      if ('children' in targetCell && Array.isArray((targetCell as any).children) && (targetCell as any).children.length > 0) {
        console.log('이미 자식이 로드되어 있음:', (targetCell as any).children.length);
        setCurrentCellId(cellId);
        updateNavigationPath(cellId);
        setIsLoading(false);
        return;
      }
      
      const childrenResults = await loadChildrenForCellById(mandalartId, cellId);
      
      // 자식 셀이 없는 경우
      if (!childrenResults.children || childrenResults.children.length === 0) {
        console.log('자식 셀이 없습니다. 새 셀 생성이 필요합니다.');
        
        setCurrentCellId(cellId);
        updateNavigationPath(cellId);
        setIsLoading(false);
        return;
      }
      
      // 만다라트 업데이트
      setMandalart(prev => {
        if (!prev || !isHierarchicalMandalart(prev)) {
          console.error('만다라트가 없거나 계층형 구조가 아님');
          return prev;
        }
        
        console.log('만다라트 업데이트 - 자식 셀 추가');
        
        // 계층형 구조인 경우
        const updatedRootCell = updateCellChildrenInHierarchy(
          prev.rootCell,
          cellId,
          { children: childrenResults.children } as any
        );
        
        if (!updatedRootCell) return prev;
        
        return {
          ...prev,
          rootCell: updatedRootCell
        };
      });
      
      setCurrentCellId(cellId);
      updateNavigationPath(cellId);
    } catch (err) {
      console.error('자식 셀 로드 실패:', err);
      setError('자식 셀을 로드하는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [mandalart, mandalartId, setCurrentCellId, updateNavigationPath, findCell]);
  
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
    toggleCellCompletion,
    deleteMandalart,
    navigationPath,
    currentCell: getCurrentCell(),
    navigateToCell: navigateToCellById,
    navigateToParent,
    loadChildrenForCell
  };
};

export default useMandalart;