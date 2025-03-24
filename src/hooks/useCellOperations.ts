import { useState, useCallback } from 'react';
import { MandalartCell } from '@/types/mandalart';
import { mandalartAPI } from '@/services/mandalartService';
import useMandalartNavigation from '@/hooks/useMandalartNavigation';

/**
 * 셀 조작 관련 기능을 제공하는 훅
 */
const useCellOperations = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // 셀 탐색 및 네비게이션 훅 사용
  const navigation = useMandalartNavigation();
  
  /**
   * 셀 데이터 로드
   */
  const loadCell = useCallback(async (cellId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const cell = await mandalartAPI.fetchCellById(cellId);
      
      if (cell) {
        // 셀 경로 구성
        await navigation.buildPathForCell(cellId);
        
        return cell;
      } else {
        setError('셀 데이터를 찾을 수 없습니다');
        return null;
      }
    } catch (err) {
      console.error('셀 로드 오류:', err);
      setError('셀 데이터 로드에 실패했습니다');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [navigation]);
  
  /**
   * 자식 셀 로드
   */
  const loadChildCells = useCallback(async (parentId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // 부모 셀 정보 가져오기
      const parentCell = navigation.currentCell || 
                        await mandalartAPI.fetchCellById(parentId);
      
      if (!parentCell) {
        setError('부모 셀 정보를 찾을 수 없습니다');
        return [];
      }
      
      // 자식 셀 로드
      const childCells = await mandalartAPI.fetchChildrenByCellId(parentId);
      
      // 부모 깊이 계산
      const parentDepth = parentCell.depth || 0;
      
      // 빈 셀 자동 채우기
      const filledCells = navigation.fillEmptyCells(
        childCells, 
        parentId, 
        parentDepth
      );
      
      return filledCells;
    } catch (err) {
      console.error('자식 셀 로드 오류:', err);
      setError('자식 셀 로드에 실패했습니다');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [navigation]);
  
  /**
   * 셀 업데이트
   */
  const updateCell = useCallback(async (cellId: string, updates: Partial<MandalartCell>) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // 가상 ID 확인
      if (cellId.startsWith('empty-')) {
        setError('가상 셀은 업데이트할 수 없습니다');
        return null;
      }
      
      await mandalartAPI.updateCell(cellId, updates);
      
      // 업데이트된 셀 정보 반환
      return {
        ...(navigation.currentCell || {}),
        ...updates,
        id: cellId
      } as MandalartCell;
    } catch (err) {
      console.error('셀 업데이트 오류:', err);
      setError('셀 업데이트에 실패했습니다');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [navigation.currentCell]);
  
  /**
   * 새 셀 생성
   */
  const createCell = useCallback(async (
    parentId: string,
    position: number,
    cellData: Partial<MandalartCell> = {}
  ) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // 기본 셀 데이터
      const defaultCellData: Partial<MandalartCell> = {
        topic: '새 셀',
        position,
        ...cellData
      };
      
      // 셀 생성
      const newCellId = await mandalartAPI.createCell(parentId, defaultCellData);
      
      // 생성된 셀 정보 반환
      return await loadCell(newCellId);
    } catch (err) {
      console.error('셀 생성 오류:', err);
      setError('셀 생성에 실패했습니다');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [loadCell]);
  
  /**
   * 셀 완료 상태 토글
   */
  const toggleCellCompletion = useCallback(async (cellId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // 현재 셀 확인
      const cell = navigation.currentCell || await mandalartAPI.fetchCellById(cellId);
      
      if (!cell) {
        setError('셀 정보를 찾을 수 없습니다');
        return false;
      }
      
      // 완료 상태 반전
      const newState = !cell.isCompleted;
      
      await mandalartAPI.toggleCellCompletion(cellId, newState);
      
      return newState;
    } catch (err) {
      console.error('셀 완료 상태 토글 오류:', err);
      setError('셀 완료 상태 변경에 실패했습니다');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [navigation.currentCell]);
  
  /**
   * 새 만다라트 생성
   */
  const createMandalart = useCallback(async (title: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // 새 만다라트 생성 (루트 셀 ID 반환)
      const rootCellId = await mandalartAPI.createMandalart(title);
      
      // 생성된 루트 셀 정보 반환
      return await loadCell(rootCellId);
    } catch (err) {
      console.error('만다라트 생성 오류:', err);
      setError('만다라트 생성에 실패했습니다');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [loadCell]);
  
  return {
    isLoading,
    error,
    navigation,
    loadCell,
    loadChildCells,
    updateCell,
    createCell,
    toggleCellCompletion,
    createMandalart
  };
};

export default useCellOperations; 