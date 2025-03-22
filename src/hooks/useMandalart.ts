import { useState, useEffect, useCallback } from 'react';
import { Mandalart, MandalartCell } from '@/types/mandalart';
import { createClient } from '@/utils/supabase/client';

interface UseMandalartResult {
  mandalart: Mandalart | null;
  isLoading: boolean;
  error: string | null;
  updateCell: (cellId: string, updatedCell: MandalartCell) => void;
  createMandalart: (title: string, templateId?: string) => Promise<string>;
  fetchMandalartList: () => Promise<Array<{id: string, title: string, createdAt: string, updatedAt: string}>>;
}

/**
 * 만다라트 데이터 관리 훅
 */
const useMandalart = (mandalartId?: string): UseMandalartResult => {
  const [mandalart, setMandalart] = useState<Mandalart | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(!!mandalartId);
  const [error, setError] = useState<string | null>(null);

  // 샘플 데이터 생성 (실제로는 API 호출로 대체)
  const generateSampleData = (id: string, title: string): Mandalart => {
    // 빈 셀 생성 함수
    const createEmptyCell = (id: string): MandalartCell => ({
      id,
      topic: '',
    });

    // 블록 생성 함수 (센터 셀과 주변 8개 셀로 구성)
    const createBlock = (blockId: string, centerTopic: string = '') => {
      return {
        id: blockId,
        centerCell: {
          id: `${blockId}-center`,
          topic: centerTopic,
        },
        surroundingCells: Array(8).fill(null).map((_, i) => 
          createEmptyCell(`${blockId}-cell-${i}`)
        )
      };
    };

    // 현재 날짜
    const now = new Date().toISOString();

    return {
      id,
      title,
      createdAt: now,
      updatedAt: now,
      centerBlock: createBlock('center-block', '핵심 목표'),
      surroundingBlocks: Array(8).fill(null).map((_, i) =>
        createBlock(`block-${i}`)
      )
    };
  };

  // 만다라트 데이터 로드
  useEffect(() => {
    if (!mandalartId) return;

    setIsLoading(true);
    setError(null);

    // 실제로는 API 호출
    setTimeout(() => {
      try {
        // 임시 데이터 생성
        const data = generateSampleData(mandalartId, '나의 만다라트');
        setMandalart(data);
        setIsLoading(false);
      } catch (err) {
        setError('만다라트를 불러오는데 실패했습니다.');
        setIsLoading(false);
      }
    }, 500);
  }, [mandalartId]);

  // 셀 업데이트
  const updateCell = useCallback((cellId: string, updatedCell: MandalartCell) => {
    if (!mandalart) return;

    setMandalart(prev => {
      if (!prev) return null;

      const newMandalart = { ...prev };
      
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

      return prev;
    });
  }, [mandalart]);

  // 새 만다라트 생성
  const createMandalart = useCallback(async (title: string, templateId?: string): Promise<string> => {
    // 실제로는 API 호출
    return new Promise((resolve) => {
      setTimeout(() => {
        // 새 ID 생성 (실제로는 서버에서 생성)
        const newId = `mandalart-${Date.now()}`;
        resolve(newId);
      }, 500);
    });
  }, []);

  // 만다라트 목록 조회
  const fetchMandalartList = useCallback(async (): Promise<Array<{id: string, title: string, createdAt: string, updatedAt: string}>> => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('mandalarts')
        .select('id, title, created_at, updated_at')
        .order('updated_at', { ascending: false });
      
      if (error) {
        throw new Error(error.message);
      }
      
      // Supabase에서 반환된 데이터 형식을 조정
      return data.map(item => ({
        id: item.id,
        title: item.title,
        createdAt: item.created_at,
        updatedAt: item.updated_at
      }));
    } catch (err) {
      console.error('만다라트 목록 조회 실패:', err);
      setError('만다라트 목록을 불러오는데 실패했습니다.');
      return [];
    }
  }, []);

  return {
    mandalart,
    isLoading,
    error,
    updateCell,
    createMandalart,
    fetchMandalartList
  };
};

export default useMandalart;