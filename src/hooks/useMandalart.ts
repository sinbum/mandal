import { useState, useEffect, useCallback } from 'react';
import { Mandalart, MandalartCell, MandalartBlock } from '@/types/mandalart';
import { createClient } from '@/utils/supabase/client';

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
}

/**
 * 만다라트 데이터 관리 훅
 */
const useMandalart = (mandalartId?: string): UseMandalartResult => {
  const [mandalart, setMandalart] = useState<Mandalart | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(!!mandalartId);
  const [error, setError] = useState<string | null>(null);

  // 셀 위치 매핑 유틸리티
  const mapPositionToBlockAndCell = (position: number): { blockIndex: number, cellIndex: number } => {
    // 포지션을 블록 인덱스와 셀 인덱스로 변환하는 로직
    // 0-80까지의 포지션을 9x9 그리드에서 적절한 블록과 셀 인덱스로 매핑
    
    // 행과 열 계산 (0-8)
    const row = Math.floor(position / 9);
    const col = position % 9;
    
    // 블록 행과 열 (0-2)
    const blockRow = Math.floor(row / 3);
    const blockCol = Math.floor(col / 3);
    
    // 블록 내 셀 행과 열 (0-2)
    const cellRow = row % 3;
    const cellCol = col % 3;
    
    // 블록 인덱스 (0-8, 중앙 블록이 4)
    const blockIndex = blockRow * 3 + blockCol;
    
    // 블록 내 셀 인덱스 (0-8)
    const cellIndex = cellRow * 3 + cellCol;
    
    return { blockIndex, cellIndex };
  };

  // 블록과 셀 인덱스를 포지션으로 변환하는 역함수
  const mapBlockAndCellToPosition = (blockIndex: number, cellIndex: number): number => {
    // 블록의 행과 열 (0-2)
    const blockRow = Math.floor(blockIndex / 3);
    const blockCol = blockIndex % 3;
    
    // 셀의 행과 열 (0-2)
    const cellRow = Math.floor(cellIndex / 3);
    const cellCol = cellIndex % 3;
    
    // 전체 9x9 그리드에서의 행과 열
    const row = blockRow * 3 + cellRow;
    const col = blockCol * 3 + cellCol;
    
    // 포지션 계산 (0-80)
    return row * 9 + col;
  };

  // DB에서 가져온 셀 데이터를 Mandalart 구조로 변환
  const convertDbCellsToMandalart = (mandalartData: any, cells: any[]): Mandalart => {
    // 빈 만다라트 구조 생성
    const result: Mandalart = {
      id: mandalartData.id,
      title: mandalartData.title,
      createdAt: mandalartData.created_at,
      updatedAt: mandalartData.updated_at,
      centerBlock: {
        id: 'center-block',
        centerCell: { id: 'center-block-center', topic: '' },
        surroundingCells: Array(8).fill(null).map((_, i) => ({
          id: `center-block-cell-${i}`,
          topic: ''
        }))
      },
      surroundingBlocks: Array(8).fill(null).map((_, i) => ({
        id: `block-${i}`,
        centerCell: { id: `block-${i}-center`, topic: '' },
        surroundingCells: Array(8).fill(null).map((_, j) => ({
          id: `block-${i}-cell-${j}`,
          topic: ''
        }))
      }))
    };

    // 셀 데이터 채우기
    cells.forEach(cell => {
      const { blockIndex, cellIndex } = mapPositionToBlockAndCell(cell.position);
      
      // 중앙 블록 (blockIndex === 4)
      if (blockIndex === 4) {
        if (cellIndex === 4) {
          // 중앙 블록의 중앙 셀
          result.centerBlock.centerCell = {
            id: cell.id,
            topic: cell.topic || '',
            memo: cell.memo,
            color: cell.color,
            imageUrl: cell.image_url,
            isCompleted: cell.is_completed
          };
        } else {
          // 중앙 블록의 주변 셀
          const surroundingIndex = cellIndex > 4 ? cellIndex - 1 : cellIndex;
          result.centerBlock.surroundingCells[surroundingIndex] = {
            id: cell.id,
            topic: cell.topic || '',
            memo: cell.memo,
            color: cell.color,
            imageUrl: cell.image_url,
            isCompleted: cell.is_completed
          };
        }
      } else {
        // 주변 블록
        const blockIndexAdjusted = blockIndex > 4 ? blockIndex - 1 : blockIndex;
        
        if (cellIndex === 4) {
          // 주변 블록의 중앙 셀
          result.surroundingBlocks[blockIndexAdjusted].centerCell = {
            id: cell.id,
            topic: cell.topic || '',
            memo: cell.memo,
            color: cell.color,
            imageUrl: cell.image_url,
            isCompleted: cell.is_completed
          };
        } else {
          // 주변 블록의 주변 셀
          const surroundingIndex = cellIndex > 4 ? cellIndex - 1 : cellIndex;
          result.surroundingBlocks[blockIndexAdjusted].surroundingCells[surroundingIndex] = {
            id: cell.id,
            topic: cell.topic || '',
            memo: cell.memo,
            color: cell.color,
            imageUrl: cell.image_url,
            isCompleted: cell.is_completed
          };
        }
      }
    });

    return result;
  };

  // 개별 셀 생성
  const createCell = useCallback(async (mandalartId: string, position: number, cellData: Partial<MandalartCell>): Promise<string> => {
    try {
      const supabase = createClient();
      
      // 셀 데이터 삽입
      const { data, error } = await supabase
        .from('mandalart_cells')
        .insert({
          mandalart_id: mandalartId,
          position: position,
          topic: cellData.topic || '',
          memo: cellData.memo,
          color: cellData.color,
          image_url: cellData.imageUrl,
          is_completed: cellData.isCompleted || false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select('id')
        .single();
      
      if (error) {
        throw new Error(error.message);
      }
      
      return data.id;
    } catch (err) {
      console.error('셀 생성 실패:', err);
      throw err;
    }
  }, []);

  // 특정 만다라트 데이터 로드
  const fetchMandalart = useCallback(async (id: string): Promise<Mandalart | null> => {
    try {
      const supabase = createClient();
      
      // 만다라트 기본 정보 가져오기
      const { data: mandalartData, error: mandalartError } = await supabase
        .from('mandalarts')
        .select('*')
        .eq('id', id)
        .single();
      
      if (mandalartError) {
        throw new Error(mandalartError.message);
      }
      
      if (!mandalartData) {
        return null;
      }
      
      // 만다라트 셀 데이터 가져오기
      const { data: cellsData, error: cellsError } = await supabase
        .from('mandalart_cells')
        .select('*')
        .eq('mandalart_id', id)
        .order('position', { ascending: true });
      
      if (cellsError) {
        throw new Error(cellsError.message);
      }
      
      // 데이터 구조 변환
      const formattedMandalart = convertDbCellsToMandalart(mandalartData, cellsData || []);
      return formattedMandalart;
    } catch (err) {
      console.error('만다라트 데이터 조회 실패:', err);
      throw err;
    }
  }, []);

  // 만다라트 데이터 로드 (ID가 있을 경우)
  useEffect(() => {
    if (!mandalartId) return;

    setIsLoading(true);
    setError(null);

    fetchMandalart(mandalartId)
      .then((data) => {
        setMandalart(data);
        setIsLoading(false);
      })
      .catch((err) => {
        setError('만다라트를 불러오는데 실패했습니다.');
        console.error(err);
        setIsLoading(false);
      });
  }, [mandalartId, fetchMandalart]);

  // 셀 업데이트
  const updateCell = useCallback(async (cellId: string, updatedCell: MandalartCell) => {
    if (!mandalart) return;

    try {
      const supabase = createClient();
      
      // Supabase API로 셀 업데이트
      const { error } = await supabase
        .from('mandalart_cells')
        .update({
          topic: updatedCell.topic,
          memo: updatedCell.memo,
          color: updatedCell.color,
          image_url: updatedCell.imageUrl,
          is_completed: updatedCell.isCompleted,
          updated_at: new Date().toISOString()
        })
        .eq('id', cellId);
      
      if (error) {
        throw new Error(error.message);
      }
      
      // UI 업데이트
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
    } catch (err) {
      console.error('셀 업데이트 실패:', err);
      setError('셀 업데이트에 실패했습니다.');
    }
  }, [mandalart]);

  // 새 만다라트 생성
  const createMandalart = useCallback(async (title: string, templateId?: string): Promise<string> => {
    try {
      const supabase = createClient();
      
      // 현재 로그인한 사용자 정보 가져오기
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('인증된 사용자가 없습니다. 로그인이 필요합니다.');
      }
      
      if (templateId) {
        // 템플릿 기반 복제 (RPC 호출)
        const { data, error } = await supabase
          .rpc('duplicate_mandalart_from_template', {
            _template_id: templateId,
            _user_id: user.id // 실제 인증된 사용자 ID 사용
          });
        
        if (error) throw new Error(error.message);
        return data as string;
      } else {
        // 새 만다라트 생성 (RPC 호출)
        const { data, error } = await supabase
          .rpc('create_mandalart_with_cells', {
            _title: title,
            _user_id: user.id // 실제 인증된 사용자 ID 사용
          });
        
        if (error) throw new Error(error.message);
        return data as string;
      }
    } catch (err) {
      console.error('만다라트 생성 실패:', err);
      throw err;
    }
  }, []);

  // 만다라트 목록 조회
  const fetchMandalartList = useCallback(async (): Promise<Array<{id: string, title: string, createdAt: string, updatedAt: string}>> => {
    try {
      const supabase = createClient();
      
      // 현재 로그인한 사용자 정보 가져오기
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('인증된 사용자가 없습니다. 로그인이 필요합니다.');
      }
      
      const { data, error } = await supabase
        .from('mandalarts')
        .select('id, title, created_at, updated_at')
        .eq('user_id', user.id) // 현재 사용자의 만다라트만 가져오기
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

  // 셀 완료 상태 토글
  const toggleCellCompletion = useCallback(async (cellId: string) => {
    if (!mandalart) return;
    
    try {
      // 현재 셀 찾기
      let currentCell: MandalartCell | null = null;
      
      // 중앙 블록의 중앙 셀 확인
      if (mandalart.centerBlock.centerCell.id === cellId) {
        currentCell = mandalart.centerBlock.centerCell;
      } else {
        // 중앙 블록의 주변 셀 확인
        const centerSurroundingCell = mandalart.centerBlock.surroundingCells.find(cell => cell.id === cellId);
        if (centerSurroundingCell) {
          currentCell = centerSurroundingCell;
        } else {
          // 주변 블록들 확인
          for (const block of mandalart.surroundingBlocks) {
            // 블록의 중앙 셀 확인
            if (block.centerCell.id === cellId) {
              currentCell = block.centerCell;
              break;
            }
            
            // 블록의 주변 셀 확인
            const surroundingCell = block.surroundingCells.find(cell => cell.id === cellId);
            if (surroundingCell) {
              currentCell = surroundingCell;
              break;
            }
          }
        }
      }
      
      if (!currentCell) {
        throw new Error('해당 셀을 찾을 수 없습니다.');
      }
      
      // 완료 상태 반전
      const newCompletionStatus = !currentCell.isCompleted;
      
      const supabase = createClient();
      const { error } = await supabase
        .from('mandalart_cells')
        .update({
          is_completed: newCompletionStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', cellId);
      
      if (error) {
        throw new Error(error.message);
      }
      
      // UI 업데이트
      setMandalart(prev => {
        if (!prev) return null;
        
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
        
        return prev;
      });
    } catch (err) {
      console.error('셀 완료 상태 토글 실패:', err);
      setError('셀 완료 상태를 변경하는데 실패했습니다.');
    }
  }, [mandalart]);

  // 만다라트 삭제
  const deleteMandalart = useCallback(async (id: string) => {
    try {
      const supabase = createClient();
      
      // 현재 로그인한 사용자 정보 가져오기
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('인증된 사용자가 없습니다. 로그인이 필요합니다.');
      }
      
      // 만다라트 소유자 확인
      const { data: mandalartData, error: ownerError } = await supabase
        .from('mandalarts')
        .select('user_id')
        .eq('id', id)
        .single();
      
      if (ownerError) {
        throw new Error('만다라트 정보를 확인할 수 없습니다.');
      }
      
      if (mandalartData.user_id !== user.id) {
        throw new Error('본인의 만다라트만 삭제할 수 있습니다.');
      }
      
      // 만다라트 삭제 (관계된 셀들은 cascade 옵션으로 자동 삭제됨)
      const { error: deleteError } = await supabase
        .from('mandalarts')
        .delete()
        .eq('id', id);
      
      if (deleteError) {
        throw new Error(deleteError.message);
      }
      
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
    deleteMandalart
  };
};

export default useMandalart;