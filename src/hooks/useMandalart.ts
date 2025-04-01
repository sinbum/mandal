import { useState, useEffect, useCallback } from 'react';
import { MandalartCell, MandalartCellWithChildren, MandalartHierarchical } from '@/types/mandalart';

// 분리된 유틸 함수들 임포트
import { 
  findCellInHierarchy, 
  updateCellChildrenInHierarchy,
  
} from '@/utils/mandalartUtils';

// 분리된 API 함수들 임포트
import { mandalartAPI } from '@/services/mandalartService';

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
  getRootCellTitle: () => string;
  getEmptyCellsWithVirtualIds: (cellsArray: MandalartCell[]) => MandalartCell[];
  loadChildrenForCellById: (cellId: string) => Promise<MandalartCell[]>;
  createNewCell: (mandalartId: string, position: number, cellData: Partial<MandalartCell>) => Promise<string>;
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
    buildPathForCell,
    navigateToParent,
    setCurrentCellId,
    setNavigationPath,
    breadcrumbPath,
    fillEmptyCells
  } = useMandalartNavigation({ initialCell: mandalart?.rootCell });

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

    mandalartAPI.getMandalart(mandalartId)
      .then((data) => {
        // 오직 계층형 만다라트만 처리
        const hierarchicalData = data as MandalartHierarchical;
        
        // 루트 셀의 depth를 강제로 0으로 설정
        if (hierarchicalData && hierarchicalData.rootCell) {
          hierarchicalData.rootCell.depth = 0;
        }
        
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
      await mandalartAPI.updateCell(cellId, updatedCell);
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
  const createMandalart = useCallback(async (title: string): Promise<string> => {
    try {
      return await mandalartAPI.createMandalart(title);
    } catch (err) {
      console.error('만다라트 생성 실패:', err);
      throw err;
    }
  }, []);

  // 만다라트 목록 조회
  const fetchMandalartList = useCallback(async () => {
    try {
      // API 직접 호출
      return await mandalartAPI.getUserMandalarts();
    } catch (err) {
      console.error('만다라트 목록 조회 실패:', err);
      setError('만다라트 목록을 불러오는데 실패했습니다.');
      return [];
    }
  }, []);

  // 특정 만다라트 데이터 로드
  const fetchMandalart = useCallback(async (id: string): Promise<MandalartHierarchical | null> => {
    try {
      const data = await mandalartAPI.getMandalart(id);
      return data as MandalartHierarchical;
    } catch (err) {
      console.error('만다라트 데이터 조회 실패:', err);
      throw err;
    }
  }, []);

  // 개별 셀 생성
  const createCell = useCallback(async (mandalartId: string, position: number, cellData: Partial<MandalartCell>): Promise<string> => {
    try {
      // mandalartId를 cellData에 포함시켜 전달
      const cellWithMandalartId = {
        ...cellData,
        mandalartId
      };
      const cellId = await mandalartAPI.createCell(cellData.parentId || '', cellWithMandalartId);
      
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
                ? [...((parentCell as MandalartCellWithChildren).children ?? []), newCell]
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
  }, [mandalart]);

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
      
      await mandalartAPI.toggleCellCompletion(cellId, newCompletionStatus);
      
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
      await mandalartAPI.deleteMandalart(id);
      
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
    if (!mandalart || !mandalartId || isLoading) {
      return;
    }
    
    try {
      console.log('자식 셀 로드 요청:', cellId);
      
      // 현재 셀 정보 가져오기
      const targetCell = findCellInHierarchy(mandalart.rootCell, cellId);
      console.log('타겟 셀 찾음:', !!targetCell, targetCell?.topic);
      
      // 2023.10.20 수정: 자식 데이터 여부와 상관없이 항상 API 요청 수행
      // 이전에는 이미 자식 데이터가 있으면 API 요청을 하지 않았음
      
      if (!targetCell) {
        console.error('선택한 셀을 찾을 수 없습니다:', cellId);
        setError('선택한 셀을 찾을 수 없습니다.');
        return;
      }
      
      setIsLoading(true);
      console.log('셀 자식 로드 시작:', cellId);
      
      // API 직접 호출
      try {
        const childrenResults = await mandalartAPI.getChildCells(cellId);
        console.log('자식 셀 로드 완료:', childrenResults.length);
        
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
            { children: childrenResults } as Partial<MandalartCellWithChildren>
          );
          
          if (!updatedRootCell) return prev;
          
          return {
            ...prev,
            rootCell: updatedRootCell
          };
        });
        
        setCurrentCellId(cellId);
        buildPathForCell(cellId);
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mandalart, mandalartId, isLoading, setCurrentCellId, buildPathForCell, findCellInHierarchy, findCell]);

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
      const newCell = await mandalartAPI.createCellWithData(
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
                ? [...((foundParentCell as MandalartCellWithChildren).children ?? []), newCell]
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
      
      // 루트 레벨 셀 반환
      return {
        ...newCell,
        depth: 0,
        parentId: undefined
      };
    } catch (err) {
      console.error('통합 셀 생성 및 편집 실패:', err);
      throw err;
    }
  }, [mandalart, fetchMandalart, setMandalart, loadChildrenForCell]);

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
      buildPathForCell(cell.id);
    }
  }, [setCurrentCellId, buildPathForCell, findCell]);

  // 특정 셀의 자식 셀 로드
  const loadChildrenForCellById = useCallback(async (cellId: string) => {
    console.log('자식 셀 로드 요청:', cellId);
    
    try {
      // 'virtual-root-xxx' 형식의 가상 ID 확인
      if (cellId.startsWith('virtual-root-')) {
        console.log('가상 루트 셀 ID 감지됨, 실제 루트 셀 찾기');
        // 가상 루트 ID인 경우 실제 루트 셀 찾기
        if (mandalart?.rootCell) {
          cellId = mandalart.rootCell.id;
          console.log('실제 루트 셀 ID로 변환:', cellId);
        } else {
          throw new Error('루트 셀을 찾을 수 없습니다.');
        }
      }
      
      // API 호출로 자식 셀 데이터 가져오기
      const childCells = await mandalartAPI.getChildCells(cellId);
      console.log('자식 셀 로드 완료:', {
        parentId: cellId,
        childCount: childCells.length,
        children: childCells.map((c: MandalartCell) => ({id: c.id, topic: c.topic || '(제목 없음)'}))
      });
    
      // 현재 셀을 찾아서 자식 셀 업데이트
      setMandalart(prev => {
        if (!prev || !prev.rootCell) return prev;
        
        // 선택된 셀 찾기 (rootCell에서 찾기)
        const selectedCell = findCellInHierarchy(prev.rootCell, cellId);
        
        if (!selectedCell) {
          console.warn('자식 셀을 연결할 대상 셀을 찾지 못함:', cellId);
          return prev;
        }
        
        // 이미 빈 셀이 포함된 경우 필터링 (empty- 또는 temp-new- 제외)
        const realCells = childCells.filter((cell: MandalartCell) => 
          !cell.id.startsWith('empty-') && !cell.id.startsWith('temp-new-')
        );
        
        console.log('실제 셀 추출됨:', realCells.length);
        
        // Depth 레벨에 따른 빈 셀 추가
        const processedChildren = [...realCells];
        
        // 빈 셀이 없는 경우 8개의 빈 셀 추가
        if (processedChildren.length < 8) {
          for (let i = processedChildren.length; i < 8; i++) {
            processedChildren.push({
              id: `empty-${i+1}`,
              topic: '',
              memo: '클릭하여 새 셀을 추가하세요',
              isCompleted: false,
              parentId: cellId,
              depth: (selectedCell.depth || 0) + 1,
              position: i+1,
              color: '',
              imageUrl: ''
            });
          }
        }
        
        // 업데이트된 루트 셀 생성 (불변성 유지)
        const updatedRootCell = updateCellChildrenInHierarchy(
          prev.rootCell,
          cellId,
          { children: processedChildren } as Partial<MandalartCellWithChildren>
        );
        
        if (!updatedRootCell) return prev;
        
        // 새 만다라트 상태 반환
        return { ...prev, rootCell: updatedRootCell };
      });
      
      return childCells;
    } catch (err) {
      console.error('자식 셀 로드 오류:', err);
      throw err;
    }
  }, [mandalart]);

  /**
   * 새 셀 생성 함수를 훅에서 제공
   */
  const createNewCell = useCallback(async (
    mandalartId: string, 
    position: number, 
    cellData: Partial<MandalartCell>
  ) => {
    try {
      // mandalartId를 cellData에 포함시켜 전달
      const cellWithMandalartId = {
        ...cellData,
        mandalartId
      };
      return await mandalartAPI.createCell(cellData.parentId || '', cellWithMandalartId);
    } catch (err) {
      console.error('새 셀 생성 실패:', err);
      throw err;
    }
  }, []);

  // getRootCellTitle 직접 구현
  const getRootCellTitle = () => mandalart?.rootCell?.topic || '새 만다라트';

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
    setMandalart,
    getRootCellTitle,
    getEmptyCellsWithVirtualIds: (cellsArray: MandalartCell[]) => {
      // parentId와 parentDepth 기본값 제공
      return fillEmptyCells(cellsArray, null, 0);
    },
    loadChildrenForCellById,
    createNewCell
  };
};

export default useMandalart;