import { useState, useEffect, useCallback } from 'react';
import { Mandalart, MandalartCell, MandalartBlock, MandalartCellWithChildren } from '@/types/mandalart';
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
  const [navigationPath, setNavigationPath] = useState<MandalartCell[]>([]);
  const [currentCellId, setCurrentCellId] = useState<string | null>(null);

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
        centerCell: { id: 'center-block-center', topic: '', depth: 0, position: 0 },
        surroundingCells: Array(8).fill(null).map((_, i) => ({
          id: `center-block-cell-${i}`,
          topic: '',
          depth: 1,
          position: i
        }))
      },
      surroundingBlocks: Array(8).fill(null).map((_, i) => ({
        id: `block-${i}`,
        centerCell: { id: `block-${i}-center`, topic: '', depth: 1, position: 0 },
        surroundingCells: Array(8).fill(null).map((_, j) => ({
          id: `block-${i}-cell-${j}`,
          topic: '',
          depth: 2, 
          position: j
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
          if (result.centerBlock) {
            result.centerBlock.centerCell = {
              id: cell.id,
              topic: cell.topic || '',
              memo: cell.memo,
              color: cell.color,
              imageUrl: cell.image_url,
              isCompleted: cell.is_completed,
              depth: cell.depth || 0,
              position: cell.position || 0
            };
          }
        } else {
          // 중앙 블록의 주변 셀
          const surroundingIndex = cellIndex > 4 ? cellIndex - 1 : cellIndex;
          if (result.centerBlock) {
            result.centerBlock.surroundingCells[surroundingIndex] = {
              id: cell.id,
              topic: cell.topic || '',
              memo: cell.memo,
              color: cell.color,
              imageUrl: cell.image_url,
              isCompleted: cell.is_completed,
              depth: cell.depth || 1,
              position: cell.position || surroundingIndex
            };
          }
        }
      } else {
        // 주변 블록
        const blockIndexAdjusted = blockIndex > 4 ? blockIndex - 1 : blockIndex;
        
        if (cellIndex === 4) {
          // 주변 블록의 중앙 셀
          if (result.surroundingBlocks) {
            result.surroundingBlocks[blockIndexAdjusted].centerCell = {
              id: cell.id,
              topic: cell.topic || '',
              memo: cell.memo,
              color: cell.color,
              imageUrl: cell.image_url,
              isCompleted: cell.is_completed,
              depth: cell.depth || 1,
              position: cell.position || 0
            };
          }
        } else {
          // 주변 블록의 주변 셀
          const surroundingIndex = cellIndex > 4 ? cellIndex - 1 : cellIndex;
          if (result.surroundingBlocks) {
            result.surroundingBlocks[blockIndexAdjusted].surroundingCells[surroundingIndex] = {
              id: cell.id,
              topic: cell.topic || '',
              memo: cell.memo,
              color: cell.color,
              imageUrl: cell.image_url,
              isCompleted: cell.is_completed,
              depth: cell.depth || 2,
              position: cell.position || surroundingIndex
            };
          }
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
        if (newMandalart.centerBlock && cellId === newMandalart.centerBlock.centerCell.id) {
          newMandalart.centerBlock = {
            ...newMandalart.centerBlock,
            centerCell: {
              ...updatedCell
            }
          };
          return newMandalart;
        }

        // 중앙 블록의 주변 셀 검사
        if (newMandalart.centerBlock) {
          const centerSurroundingIndex = newMandalart.centerBlock.surroundingCells.findIndex(cell => cell.id === cellId);
          if (centerSurroundingIndex !== -1) {
            newMandalart.centerBlock.surroundingCells[centerSurroundingIndex] = {
              ...updatedCell
            };
            return newMandalart;
          }
        }

        // 주변 블록 검사
        if (newMandalart.surroundingBlocks) {
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
      if (mandalart.centerBlock && mandalart.centerBlock.centerCell.id === cellId) {
        currentCell = mandalart.centerBlock.centerCell;
      } else {
        // 중앙 블록의 주변 셀 확인
        if (mandalart.centerBlock) {
          const centerSurroundingCell = mandalart.centerBlock.surroundingCells.find(cell => cell.id === cellId);
          if (centerSurroundingCell) {
            currentCell = centerSurroundingCell;
          }
        }
        
        // 주변 블록들 확인
        if (!currentCell && mandalart.surroundingBlocks) {
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
        if (newMandalart.centerBlock && newMandalart.centerBlock.centerCell.id === cellId) {
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
        if (newMandalart.centerBlock) {
          const centerSurroundingIndex = newMandalart.centerBlock.surroundingCells.findIndex(cell => cell.id === cellId);
          if (centerSurroundingIndex !== -1) {
            newMandalart.centerBlock.surroundingCells[centerSurroundingIndex] = {
              ...newMandalart.centerBlock.surroundingCells[centerSurroundingIndex],
              isCompleted: newCompletionStatus
            };
            return newMandalart;
          }
        }
        
        // 주변 블록 업데이트
        if (newMandalart.surroundingBlocks) {
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

  // 계층 구조 데이터 로드 헬퍼 함수
  const loadHierarchicalData = async (mandalartId: string, parentId: string | null = null, depth: number = 0): Promise<MandalartCellWithChildren> => {
    const supabase = createClient();
    
    // 해당 부모의 직접 자식 셀 로드
    const query = supabase
      .from('mandalart_cells')
      .select('*')
      .eq('mandalart_id', mandalartId);
      
    if (parentId === null) {
      // 루트 셀 로드 (parent_id가 null)
      query.is('parent_id', null);
    } else {
      // 특정 셀의 자식 로드
      query.eq('parent_id', parentId);
    }
    
    const { data, error } = await query;
    
    if (error) {
      throw new Error(error.message);
    }
    
    // 부모 셀을 찾거나 루트 셀 생성
    let parentCell: MandalartCellWithChildren;
    
    if (parentId === null) {
      // 루트 셀
      if (data && data.length > 0) {
        const rootData = data[0];
        parentCell = {
          id: rootData.id,
          topic: rootData.topic || '',
          memo: rootData.memo,
          color: rootData.color,
          imageUrl: rootData.image_url,
          isCompleted: rootData.is_completed,
          parentId: null,
          depth: 0,
          position: 0,
          children: []
        };
      } else {
        throw new Error('루트 셀을 찾을 수 없습니다');
      }
    } else {
      // 부모 셀 로드
      const { data: parentData, error: parentError } = await supabase
        .from('mandalart_cells')
        .select('*')
        .eq('id', parentId)
        .single();
      
      if (parentError) {
        throw new Error(parentError.message);
      }
      
      parentCell = {
        id: parentData.id,
        topic: parentData.topic || '',
        memo: parentData.memo,
        color: parentData.color,
        imageUrl: parentData.image_url,
        isCompleted: parentData.is_completed,
        parentId: parentData.parent_id,
        depth: parentData.depth || depth,
        position: parentData.position || 0,
        children: []
      };
    }
    
    // 자식 셀 로드 (첫 번째 부모의 직접 자식이 아닌 경우)
    if (parentId !== null) {
      const { data: childrenData, error: childrenError } = await supabase
        .from('mandalart_cells')
        .select('*')
        .eq('parent_id', parentId);
      
      if (childrenError) {
        throw new Error(childrenError.message);
      }
      
      // 자식 셀 처리
      const children = childrenData || [];
      parentCell.children = children.map(child => ({
        id: child.id,
        topic: child.topic || '',
        memo: child.memo,
        color: child.color,
        imageUrl: child.image_url,
        isCompleted: child.is_completed,
        parentId: child.parent_id,
        depth: child.depth || (parentCell.depth + 1),
        position: child.position || 0,
        children: [] // 기본적으로 빈 배열로 설정
      }));
    }
    
    return parentCell;
  };

  // 특정 셀의 자식 셀 로드
  const loadChildrenForCell = useCallback(async (cellId: string) => {
    if (!mandalart || !mandalartId) return;
    
    try {
      setIsLoading(true);
      
      // 이미 로드된 셀인지 확인
      const targetCell = findCellInHierarchy(mandalart.rootCell, cellId);
      
      // 이미 자식이 로드되어 있으면 그대로 사용
      if (targetCell && 'children' in targetCell && targetCell.children && targetCell.children.length > 0) {
        setCurrentCellId(cellId);
        
        // 네비게이션 경로 업데이트
        updateNavigationPath(cellId);
        
        setIsLoading(false);
        return;
      }
      
      // 자식 셀 로드
      const cellWithChildren = await loadHierarchicalData(mandalartId, cellId);
      
      // 만다라트 업데이트
      setMandalart(prev => {
        if (!prev || !prev.rootCell) return prev;
        
        return {
          ...prev,
          rootCell: updateCellChildrenInHierarchy(prev.rootCell, cellId, cellWithChildren.children)
        };
      });
      
      setCurrentCellId(cellId);
      
      // 네비게이션 경로 업데이트
      updateNavigationPath(cellId);
    } catch (err) {
      console.error('자식 셀 로드 실패:', err);
      setError(err instanceof Error ? err.message : '자식 셀 로드에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [mandalart, mandalartId]);
  
  // 특정 셀 찾기 헬퍼 함수
  const findCellInHierarchy = (root: MandalartCellWithChildren | undefined, cellId: string): MandalartCell | null => {
    if (!root) return null;
    
    if (root.id === cellId) {
      return root;
    }
    
    for (const child of root.children) {
      if (child.id === cellId) {
        return child;
      }
      
      if ('children' in child && child.children && child.children.length > 0) {
        const found = findCellInHierarchy(child as MandalartCellWithChildren, cellId);
        if (found) return found;
      }
    }
    
    return null;
  };
  
  // 특정 셀의 자식 업데이트 헬퍼 함수
  const updateCellChildrenInHierarchy = (
    root: MandalartCellWithChildren,
    cellId: string,
    children: MandalartCell[]
  ): MandalartCellWithChildren => {
    if (root.id === cellId) {
      return { ...root, children };
    }
    
    return {
      ...root,
      children: root.children.map(child => {
        if ('children' in child) {
          return updateCellChildrenInHierarchy(child as MandalartCellWithChildren, cellId, children);
        }
        
        if (child.id === cellId) {
          return { ...child, children } as MandalartCellWithChildren;
        }
        
        return child;
      })
    };
  };
  
  // 네비게이션 경로 업데이트
  const updateNavigationPath = (cellId: string) => {
    if (!mandalart || !mandalart.rootCell) return;
    
    // 경로에 이미 있는지 확인
    const existingIndex = navigationPath.findIndex(cell => cell.id === cellId);
    
    if (existingIndex >= 0) {
      // 이미 경로에 있는 경우 그 위치까지 잘라냄
      setNavigationPath(prev => prev.slice(0, existingIndex + 1));
      return;
    }
    
    // 경로에 없는 경우 현재 셀 정보 가져오기
    const targetCell = findCellInHierarchy(mandalart.rootCell, cellId);
    
    if (targetCell) {
      // 새 셀 추가
      setNavigationPath(prev => [...prev, targetCell]);
    }
  };
  
  // 상위 셀로 이동
  const navigateToParent = useCallback(() => {
    if (navigationPath.length <= 1) return;
    
    const parentCell = navigationPath[navigationPath.length - 2];
    setCurrentCellId(parentCell.id);
    setNavigationPath(prev => prev.slice(0, prev.length - 1));
  }, [navigationPath]);
  
  // 특정 셀로 이동
  const navigateToCell = useCallback((cellId: string) => {
    const index = navigationPath.findIndex(cell => cell.id === cellId);
    
    if (index >= 0) {
      setCurrentCellId(cellId);
      setNavigationPath(prev => prev.slice(0, index + 1));
    }
  }, [navigationPath]);
  
  // 현재 활성화된 셀 가져오기
  const getCurrentCell = useCallback(() => {
    if (!mandalart || !mandalart.rootCell || !currentCellId) return null;
    
    return findCellInHierarchy(mandalart.rootCell, currentCellId) as MandalartCellWithChildren;
  }, [mandalart, currentCellId]);

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
    navigateToCell,
    navigateToParent,
    loadChildrenForCell
  };
};

export default useMandalart;