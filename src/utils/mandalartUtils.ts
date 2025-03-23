import { Mandalart, MandalartCell, MandalartCellWithChildren, MandalartLegacy, MandalartHierarchical } from '@/types/mandalart';

// 타입 가드 유틸리티 함수들
export const isHierarchicalMandalart = (mandalart: Mandalart): mandalart is MandalartHierarchical => {
  return 'rootCell' in mandalart;
};

export const isLegacyMandalart = (mandalart: Mandalart): mandalart is MandalartLegacy => {
  return 'centerBlock' in mandalart;
};

/**
 * 셀 위치 매핑 유틸리티
 * 포지션을 블록 인덱스와 셀 인덱스로 변환
 */
export const mapPositionToBlockAndCell = (position: number): { blockIndex: number, cellIndex: number } => {
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

/**
 * 블록과 셀 인덱스를 포지션으로 변환하는 역함수
 */
export const mapBlockAndCellToPosition = (blockIndex: number, cellIndex: number): number => {
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

/**
 * 특정 셀 찾기 헬퍼 함수
 * 계층적 구조에서 특정 ID를 가진 셀을 찾음
 */
export const findCellInHierarchy = (root: MandalartCellWithChildren | undefined, cellId: string): MandalartCell | null => {
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
    
    if ('children' in child && Array.isArray(child.children) && child.children.length > 0) {
      const found = findCellInHierarchy(child as MandalartCellWithChildren, cellId);
      if (found) return found;
    }
  }
  
  return null;
};

/**
 * 특정 셀의 자식 업데이트 헬퍼 함수
 * 계층적 구조에서 특정 ID를 가진 셀의 자식을 업데이트
 */
export const updateCellChildrenInHierarchy = (
  root: MandalartCellWithChildren, 
  cellId: string, 
  update: Partial<MandalartCell> | any
): MandalartCellWithChildren | null => {
  // 루트 셀이 업데이트 대상인 경우
  if (root.id === cellId) {
    return {
      ...root,
      ...update
    };
  }
  
  // 자식 셀들을 복사하여 새 배열 생성
  const newChildren = [...(root.children || [])];
  
  // 자식 셀 중 업데이트 대상 찾기
  for (let i = 0; i < newChildren.length; i++) {
    const child = newChildren[i];
    
    if (child.id === cellId) {
      // 자식 셀이 업데이트 대상인 경우
      newChildren[i] = {
        ...child,
        ...update
      };
      
      return {
        ...root,
        children: newChildren
      };
    }
    
    // 재귀적으로 하위 셀 확인 (계층 구조)
    if ('children' in child && Array.isArray(child.children) && child.children.length > 0) {
      const updatedChild = updateCellChildrenInHierarchy(
        child as MandalartCellWithChildren,
        cellId,
        update
      );
      
      if (updatedChild) {
        newChildren[i] = updatedChild;
        
        return {
          ...root,
          children: newChildren
        };
      }
    }
  }
  
  // 해당 셀을 찾지 못한 경우
  return null;
};

/**
 * DB에서 가져온 셀 데이터를 Mandalart 구조로 변환
 */
export const convertDbCellsToMandalart = (mandalartData: any, cells: any[]): MandalartLegacy => {
  // 빈 만다라트 구조 생성
  const result: MandalartLegacy = {
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