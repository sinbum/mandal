/**
 * 만다라트의 셀 조작 관련 기능을 모아둔 훅
 * 셀 업데이트, 생성, 완료 토글, 자식 로드 등의 기능을 담당
 */
import { useCallback, useRef, useEffect } from 'react';
import { Mandalart, MandalartCell, MandalartCellWithChildren } from '@/types/mandalart';
import { updateCellChildrenInHierarchy, isHierarchicalMandalart, findCellInHierarchy } from '@/utils/mandalartUtils';
import { mandalartAPI } from '@/services/mandalartService';

interface UseMandalartCellOperationsProps {
  mandalart: Mandalart | null;
  mandalartId?: string;
  setMandalart: (data: Mandalart | null | ((prev: Mandalart | null) => Mandalart | null)) => void;
  setIsLoading: (loading: boolean) => void;
  setError: (err: string | null) => void;
  isLoading: boolean;
  findCell: (cellId: string) => MandalartCell | null;
  setCurrentCellId: (id: string | null) => void;
  updateNavigationPath: (cellId: string) => void;
  fetchMandalart: (id: string) => Promise<Mandalart | null>;
}

// 타입 확장: 자식 배열을 포함하는 셀 타입
interface CellWithChildren {
  children: MandalartCell[];
}

/**
 * 만다라트 셀 조작 훅
 */
const useMandalartCellOperations = ({
  mandalart,
  mandalartId,
  setMandalart,
  setIsLoading,
  setError,
  isLoading,
  findCell,
  setCurrentCellId,
  updateNavigationPath,
  fetchMandalart
}: UseMandalartCellOperationsProps) => {
  
  // 이미 업데이트 중인 상태인지 확인하는 플래그
  const isUpdating = useRef(false);

  /**
   * 만다라트 상태 업데이트 헬퍼 함수
   * 여러 함수에서 공통으로 사용되는 상태 업데이트 로직을 추출함
   */
  const updateMandalartState = useCallback((
    cellId: string, 
    updates: Partial<MandalartCell & CellWithChildren>
  ) => {
    // 최적화: 기존 상태와 동일하면 업데이트 하지 않음
    setMandalart((prev: Mandalart | null) => {
      if (!prev) return null;

      // 루트 셀 업데이트 시 최적화
      if (prev.rootCell.id === cellId) {
        // 이미 같은 값이면 업데이트하지 않음 (children 비교는 별도 처리 필요)
        const hasChanges = Object.entries(updates).some(([key, value]) => {
          if (key === 'children') return false; // children은 별도 비교
          return (prev.rootCell as Record<string, any>)[key] !== value;
        });

        // children 비교 (깊은 비교 대신 단순 참조 비교)
        const hasChildrenChanges = 
          updates.children !== undefined && 
          prev.rootCell.children !== updates.children;

        if (!hasChanges && !hasChildrenChanges) {
          return prev; // 변경 사항 없음
        }

        return {
          ...prev,
          rootCell: {
            ...prev.rootCell,
            ...updates,
            id: cellId, // ID는 항상 보존
          }
        };
      }

      // 계층 구조에서 셀 업데이트
      const updatedRootCell = updateCellChildrenInHierarchy(
        prev.rootCell,
        cellId,
        updates as any // 타입 캐스팅 사용
      );

      if (!updatedRootCell) return prev;

      return {
        ...prev,
        rootCell: updatedRootCell
      };
    });
  }, [setMandalart]);

  /**
   * API 호출 에러 핸들러
   */
  const handleApiError = useCallback((error: unknown, message: string) => {
    console.error(`${message}:`, error);
    setError(message);
    return null;
  }, [setError]);

  /**
   * 셀 업데이트 함수
   * @param cellId 업데이트할 셀 ID
   * @param updatedCell 업데이트 내용
   */
  const updateCell = useCallback(async (cellId: string, updatedCell: Partial<MandalartCell>) => {
    if (!mandalart || !cellId) return;

    try {
      await mandalartAPI.updateCell(cellId, updatedCell);
      updateMandalartState(cellId, updatedCell);
    } catch (err) {
      handleApiError(err, '셀 업데이트에 실패했습니다.');
    }
  }, [mandalart, updateMandalartState, handleApiError]);

  /**
   * 개별 셀 생성 함수
   * @param mandalartId 만다라트 ID
   * @param position 셀 위치
   * @param cellData 셀 데이터
   */
  const createCell = useCallback(async (
    mandalartId: string, 
    position: number, 
    cellData: Partial<MandalartCell>
  ): Promise<string> => {
    try {
      const parentId = cellData.parentId || '';
      const cellId = await mandalartAPI.createCell(parentId, {
        ...cellData,
        position,
        mandalartId
      });

      // 생성 후 부모 셀에 자식 셀 추가 (UI 업데이트)
      if (cellData.parentId && mandalart && isHierarchicalMandalart(mandalart)) {
        const newCell: MandalartCell = {
          id: cellId,
          topic: cellData.topic || '',
          memo: cellData.memo || '',
          color: cellData.color || '',
          imageUrl: cellData.imageUrl || '',
          isCompleted: cellData.isCompleted || false,
          parentId: cellData.parentId,
          depth: cellData.depth || 0,
          position: position
        };

        // 부모 셀 찾기
        const parentCell = findCell(cellData.parentId);
        
        if (parentCell) {
          // 부모 셀의 자식 배열에 새 셀 추가
          const existingChildren = Array.isArray((parentCell as any).children) 
            ? (parentCell as any).children 
            : [];
            
          updateMandalartState(cellData.parentId, {
            children: [...existingChildren, newCell]
          });
        }
      }

      return cellId;
    } catch (err) {
      handleApiError(err, '셀 생성에 실패했습니다.');
      throw err;
    }
  }, [mandalart, findCell, updateMandalartState, handleApiError]);

  /**
   * 셀 완료 상태 토글 함수
   * @param cellId 토글할 셀 ID
   */
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
      updateMandalartState(cellId, { isCompleted: newCompletionStatus });
    } catch (err) {
      handleApiError(err, '셀 완료 상태를 변경하는데 실패했습니다.');
    }
  }, [mandalart, findCell, updateMandalartState, handleApiError]);

  /**
   * 빈 셀 생성 유틸리티 함수
   */
  const createEmptyCell = useCallback((
    parentId: string, 
    position: number, 
    depth: number
  ): MandalartCell => {
    return {
      id: `empty-${position}`,
      topic: '',
      memo: '',
      color: '',
      imageUrl: '',
      isCompleted: false,
      parentId: parentId, // 명시적으로 항상 문자열 값 보장
      depth,
      position
    } as MandalartCell; // 타입 캐스팅
  }, []);

  /**
   * 강제 depth 적용 헬퍼 함수
   */
  const applyForcedDepth = useCallback((
    children: MandalartCell[], 
    parentId: string, 
    parentDepth: number
  ) => {
    return children.map(child => ({
      ...child,
      depth: parentDepth + 1,
      parentId
    }));
  }, []);

  /**
   * 특정 셀의 자식 셀 로드 함수
   * @param cellId 자식을 로드할 셀 ID
   * @param forcedDepth 강제 적용할 깊이 (선택적)
   * @param skipNavigation 네비게이션 업데이트 건너뛰기 (선택적)
   */
  const loadChildrenForCell = useCallback(async (
    cellId: string, 
    forcedDepth?: number,
    skipNavigation?: boolean
  ) => {
    // 추가: 이전 실행 중에는 다시 호출되지 않도록 보호
    if (!mandalart || !mandalartId || isLoading || isUpdating.current) return;

    try {
      isUpdating.current = true;
      
      // 자식 셀이 이미 로드되어 있는지 확인
      const targetCell = findCellInHierarchy(mandalart.rootCell, cellId) as MandalartCellWithChildren;
      
      if (!targetCell) {
        throw new Error('선택한 셀을 찾을 수 없습니다.');
      }

      // 자식 셀이 이미 로드되어 있고 내용이 있는 경우
      if ((targetCell.children ?? []).length > 0) {
        const parentDepth = forcedDepth !== undefined ? forcedDepth : 
          targetCell.depth !== undefined ? targetCell.depth : 0;
        
        // 강제 깊이가 있거나 depth/parentId 불일치가 있는 경우에만 업데이트
        const needsUpdate = forcedDepth !== undefined || 
          (targetCell.children ?? []).some(child => 
            child.depth === undefined || 
            child.parentId === undefined || 
            child.depth !== parentDepth + 1);
        
        if (needsUpdate) {
          // 자식 셀에 depth와 parentId 적용
          const updatedChildren = (targetCell.children ?? []).map(child => ({
            ...child,
            depth: parentDepth + 1,
            parentId: cellId
          }));
          updateMandalartState(cellId, { children: updatedChildren });
        }
        
        // 네비게이션 업데이트 (skipNavigation이 true가 아닐 때만)
        if (!skipNavigation) {
          setCurrentCellId(cellId);
          updateNavigationPath(cellId);
        }
        return;
      }

      // 자식 셀 로드 시작
      setIsLoading(true);
      
      const parentDepth = forcedDepth !== undefined ? forcedDepth :
        targetCell.depth !== undefined ? targetCell.depth : 0;

      // API 호출
      const childrenResults = await mandalartAPI.getChildCells(cellId);
      
      // 자식 셀에 메타데이터 추가
      const enrichedChildren = childrenResults.map(child => ({
        ...child,
        depth: parentDepth + 1,
        parentId: cellId
      }));

      // 자식 셀이 9개 미만인 경우 빈 셀 추가
      if (enrichedChildren.length < 9) {
        const existingPositions = new Set(enrichedChildren.map(child => child.position));
        
        for (let i = 0; i < 9; i++) {
          if (!existingPositions.has(i)) {
            // 유효한 parentId와 함께 빈 셀 생성
            if (cellId) {
              // 타입 호환성 문제 해결을 위한 캐스팅
              enrichedChildren.push(createEmptyCell(cellId, i, parentDepth + 1) as any);
            }
          }
        }
        
        // position 순으로 정렬
        enrichedChildren.sort((a, b) => a.position - b.position);
      }

      // 만다라트 상태 업데이트
      updateMandalartState(cellId, { children: enrichedChildren } as any);

      // 네비게이션 업데이트 (skipNavigation이 true가 아닐 때만)
      if (!skipNavigation) {
        setCurrentCellId(cellId);
        updateNavigationPath(cellId);
      }
    } catch (err) {
      handleApiError(err, '자식 셀을 로드하는데 실패했습니다.');
    } finally {
      setIsLoading(false);
      isUpdating.current = false;
    }
  }, [
    mandalart, 
    mandalartId, 
    isLoading,
    setCurrentCellId,
    updateNavigationPath,
    setIsLoading,
    updateMandalartState,
    createEmptyCell,
    handleApiError
  ]);

  /**
   * 통합된 셀 생성 및 편집 함수
   * @param mandalartId 만다라트 ID
   * @param position 셀 위치
   * @param parentCell 부모 셀 (선택적)
   */
  const createCellAndEdit = useCallback(async (
    mandalartId: string,
    position: number,
    parentCell?: MandalartCell | null
  ): Promise<MandalartCell> => {
    try {
      // 부모 셀의 depth 정보 계산
      const parentDepth = parentCell?.depth || 0;

      // 부모 셀 정보 구성
      const parentData = parentCell ? {
        parentId: parentCell.id,
        parentDepth: parentDepth,
        depth: parentDepth + 1
      } : {};

      // 새 셀 생성 및 편집 데이터 받기
      const newCell = await mandalartAPI.createCellWithData(
        mandalartId,
        position,
        parentData
      );

      // 만다라트 상태 업데이트
      if (parentCell?.id && mandalart && isHierarchicalMandalart(mandalart)) {
        // 생성된 셀에 메타데이터 추가
        const enrichedNewCell = {
          ...newCell,
          depth: parentDepth + 1,
          parentId: parentCell.id
        };

        // 부모 셀의 자식 셀 배열에 추가
        const foundParentCell = findCell(parentCell.id);
        if (foundParentCell) {
          const existingChildren = Array.isArray((foundParentCell as any).children) 
            ? (foundParentCell as any).children 
            : [];
          
          updateMandalartState(parentCell.id, {
            children: [...existingChildren, enrichedNewCell]
          });
        }

        // 자식 셀 목록 다시 로드
        loadChildrenForCell(parentCell.id, parentDepth, true);

        // 생성된 셀 반환
        return {
          ...newCell,
          depth: parentDepth + 1,
          parentId: parentCell.id
        };
      } else if (mandalart) {
        // 루트 레벨 셀인 경우 만다라트 전체 다시 로드
        fetchMandalart(mandalartId).then(data => {
          if (data) {
            setMandalart(data);
          }
        });

        // 루트 레벨 셀 반환
        return {
          ...newCell,
          depth: 0,
          parentId: undefined
        };
      }

      return newCell;
    } catch (err) {
      handleApiError(err, '셀 생성 및 편집에 실패했습니다.');
      throw err;
    }
  }, [
    mandalart, 
    fetchMandalart, 
    setMandalart, 
    updateMandalartState, 
    loadChildrenForCell,
    findCell,
    handleApiError
  ]);

  return {
    updateCell,
    createCell,
    createCellAndEdit,
    toggleCellCompletion,
    loadChildrenForCell,
    updateMandalartState
  };
};

export default useMandalartCellOperations; 