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
          parent_id: cellData.parentId || null, // 부모 ID 설정
          depth: cellData.depth || 0, // 깊이 설정
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select('id')
        .single();
      
      if (error) {
        console.error('셀 생성 API 오류:', error);
        throw new Error(error.message);
      }
      
      console.log('새 셀 생성됨:', data.id, '위치:', position, '부모:', cellData.parentId);
      
      // 생성 후 부모 셀에 자식 셀 추가 (UI 업데이트)
      if (cellData.parentId && mandalart?.rootCell) {
        const newCell: MandalartCell = {
          id: data.id,
          topic: cellData.topic || '',
          memo: cellData.memo,
          color: cellData.color,
          imageUrl: cellData.imageUrl,
          isCompleted: cellData.isCompleted || false,
          parentId: cellData.parentId,
          depth: cellData.depth || 0,
          position: position,
          children: []
        };
        
        // UI 상태 업데이트
        setMandalart(prev => {
          if (!prev || !prev.rootCell) return prev;
          
          // 부모 셀 찾기
          const parentCell = findCellInHierarchy(prev.rootCell, cellData.parentId as string);
          if (!parentCell) return prev;
          
          // 부모 셀의 자식 배열에 새 셀 추가
          return {
            ...prev,
            rootCell: updateCellChildrenInHierarchy(
              prev.rootCell,
              cellData.parentId as string,
              [...(('children' in parentCell) ? (parentCell as MandalartCellWithChildren).children || [] : []), newCell]
            )
          };
        });
      }
      
      return data.id;
    } catch (err) {
      console.error('셀 생성 실패:', err);
      throw err;
    }
  }, [mandalart]);

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
      
      // 계층형 구조 확인 - parent_id가 있는 셀이 하나라도 있으면 계층형으로 간주
      const isHierarchical = cellsData && cellsData.some(cell => cell.parent_id !== null);
      
      if (isHierarchical) {
        // 계층형 데이터 처리
        // 먼저 루트 셀 찾기 (parent_id가 null이고 depth가 0인 셀)
        const rootCell = cellsData?.find(cell => cell.parent_id === null && cell.depth === 0);
        
        if (!rootCell) {
          // 루트 셀이 없으면 기존 방식으로 처리
          console.warn('루트 셀을 찾을 수 없어 레거시 모드로 전환합니다');
          const formattedMandalart = convertDbCellsToMandalart(mandalartData, cellsData || []);
          return formattedMandalart;
        }
        
        // 계층형 구조로 변환
        const hierarchicalMandalart: Mandalart = {
          id: mandalartData.id,
          title: mandalartData.title,
          createdAt: mandalartData.created_at,
          updatedAt: mandalartData.updated_at,
          rootCell: {
            id: rootCell.id,
            topic: rootCell.topic || '',
            memo: rootCell.memo,
            color: rootCell.color,
            imageUrl: rootCell.image_url,
            isCompleted: rootCell.is_completed,
            depth: rootCell.depth || 0,
            position: rootCell.position || 0,
            children: []
          }
        };
        
        // 직접 자식 셀 추가 (parent_id가 루트 셀 id와 같은 셀들)
        const directChildren = cellsData?.filter(cell => cell.parent_id === rootCell.id) || [];
        
        if (hierarchicalMandalart.rootCell) {
          hierarchicalMandalart.rootCell.children = directChildren.map(child => ({
            id: child.id,
            topic: child.topic || '',
            memo: child.memo,
            color: child.color,
            imageUrl: child.image_url,
            isCompleted: child.is_completed,
            parentId: child.parent_id,
            depth: child.depth || 1,
            position: child.position || 0,
            children: [] // 초기에는 빈 배열로 설정
          }));
        }
        
        return hierarchicalMandalart;
      } else {
        // 레거시 2D 구조 처리
        const formattedMandalart = convertDbCellsToMandalart(mandalartData, cellsData || []);
        return formattedMandalart;
      }
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
        
        // navigationPath 초기화
        if (data) {
          if (data.rootCell) {
            // 계층형 구조인 경우 루트 셀로 초기화
            setNavigationPath([data.rootCell]);
            setCurrentCellId(data.rootCell.id);
          } else if (data.centerBlock) {
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
      console.log('셀 자식 로드 시작:', cellId);
      
      // 현재 셀 정보 가져오기
      let targetCell: MandalartCell | null = null;
      
      // 새 구조와 레거시 구조 모두 처리
      if (mandalart.rootCell) {
        // 계층형 구조에서 셀 찾기
        targetCell = findCellInHierarchy(mandalart.rootCell, cellId);
        console.log('계층형 구조 - 타겟 셀 찾음:', !!targetCell, targetCell?.topic);
      } else if (mandalart.centerBlock) {
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
      if ('children' in targetCell && targetCell.children && targetCell.children.length > 0) {
        console.log('이미 자식이 로드되어 있음:', targetCell.children.length);
        setCurrentCellId(cellId);
        updateNavigationPath(cellId);
        setIsLoading(false);
        return;
      }
      
      // Supabase에서 자식 셀 로드
      const supabase = createClient();
      const { data: childrenData, error: childrenError } = await supabase
        .from('mandalart_cells')
        .select('*')
        .eq('mandalart_id', mandalartId)
        .eq('parent_id', cellId)
        .order('position', { ascending: true });
      
      if (childrenError) {
        console.error('자식 셀 로드 API 오류:', childrenError);
        throw new Error(childrenError.message);
      }
      
      console.log('로드된 자식 셀 데이터:', childrenData);
      
      // 자식 셀이 없는 경우
      if (!childrenData || childrenData.length === 0) {
        console.log('자식 셀이 없습니다. 새 셀 생성이 필요합니다.');
        
        // 여기서는 빈 배열로 설정하여 일단 셀 이동은 가능하게 함
        const emptyChildren: MandalartCell[] = [];
        
        // 만다라트 업데이트
        setMandalart(prev => {
          if (!prev || !prev.rootCell) return prev;
          
          return {
            ...prev,
            rootCell: updateCellChildrenInHierarchy(prev.rootCell, cellId, emptyChildren)
          };
        });
        
        setCurrentCellId(cellId);
        updateNavigationPath(cellId);
        setIsLoading(false);
        return;
      }
      
      // 자식 셀 데이터 변환
      const children = childrenData.map(child => ({
        id: child.id,
        topic: child.topic || '',
        memo: child.memo,
        color: child.color,
        imageUrl: child.image_url,
        isCompleted: child.is_completed,
        parentId: child.parent_id,
        depth: child.depth || 0,
        position: child.position || 0,
        children: []
      }));
      
      console.log('변환된 자식 셀:', children.length);
      
      // 만다라트 업데이트
      setMandalart(prev => {
        if (!prev || !prev.rootCell) {
          console.error('만다라트 또는 루트셀이 없음');
          return prev;
        }
        
        console.log('만다라트 업데이트 - 자식 셀 추가');
        
        // 계층형 구조인 경우
        const updatedMandalart = {
          ...prev,
          rootCell: updateCellChildrenInHierarchy(prev.rootCell, cellId, children)
        };
        
        return updatedMandalart;
      });
      
      setCurrentCellId(cellId);
      updateNavigationPath(cellId);
    } catch (err) {
      console.error('자식 셀 로드 실패:', err);
      setError('자식 셀을 로드하는데 실패했습니다.');
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
    
    // root.children이 없으면 빈 배열로 처리
    const children = root.children || [];
    
    for (const child of children) {
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
      children: (root.children || []).map(child => {
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
    if (!mandalart) return;
    
    // 경로에 이미 있는지 확인
    const existingIndex = navigationPath.findIndex(cell => cell.id === cellId);
    
    if (existingIndex >= 0) {
      // 이미 경로에 있는 경우 그 위치까지 잘라냄
      setNavigationPath(prev => prev.slice(0, existingIndex + 1));
      return;
    }
    
    // 경로에 없는 경우 현재 셀 정보 가져오기
    let targetCell: MandalartCell | null = null;
    
    // 계층형 구조인 경우
    if (mandalart.rootCell) {
      targetCell = findCellInHierarchy(mandalart.rootCell, cellId);
    } 
    // 레거시 구조인 경우
    else if (mandalart.centerBlock) {
      // 중앙 블록 중앙 셀 확인
      if (mandalart.centerBlock.centerCell.id === cellId) {
        targetCell = mandalart.centerBlock.centerCell;
      } else {
        // 주변 셀 확인
        const surroundingCell = mandalart.centerBlock.surroundingCells.find(c => c.id === cellId);
        if (surroundingCell) {
          targetCell = surroundingCell;
        }
        
        // 주변 블록 확인
        if (!targetCell && mandalart.surroundingBlocks) {
          for (const block of mandalart.surroundingBlocks) {
            if (block.centerCell.id === cellId) {
              targetCell = block.centerCell;
              break;
            }
            
            const blockSurroundingCell = block.surroundingCells.find(c => c.id === cellId);
            if (blockSurroundingCell) {
              targetCell = blockSurroundingCell;
              break;
            }
          }
        }
      }
    }
    
    if (targetCell) {
      // 새 셀 추가
      setNavigationPath(prev => [...prev, targetCell as MandalartCell]);
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