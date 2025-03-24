import { Mandalart, MandalartCell, MandalartCellWithChildren, MandalartHierarchical } from '@/types/mandalart';

// 타입 가드 유틸리티 함수들
export const isHierarchicalMandalart = (mandalart: Mandalart): mandalart is MandalartHierarchical => {
  return 'rootCell' in mandalart;
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
 * 특정 셀의 경로 찾기 헬퍼 함수
 * root 셀로부터 특정 ID를 가진 셀까지의 경로를 배열로 반환 (breadcrumb 용)
 */
export const findCellAndBuildPathInHierarchy = (
  root: MandalartCellWithChildren,
  cellId: string,
  path: MandalartCell[] = []
): MandalartCell[] | null => {
  // root가 없는 경우 처리
  if (!root) return null;
  
  // 현재 root를 path에 추가
  const currentPath = [...path, root];
  
  // 현재 root가 찾는 cellId와 일치하면 현재까지의 경로 반환
  if (root.id === cellId) {
    return currentPath;
  }
  
  // root.children이 없으면 빈 배열로 처리
  const children = root.children || [];
  
  // 각 자식 셀에 대해 재귀적으로 탐색
  for (const child of children) {
    // 자식 셀이 찾는 cellId와 일치하면 바로 경로 반환
    if (child.id === cellId) {
      return [...currentPath, child];
    }
    
    // 자식 셀에 children이 있고 배열 형태인 경우 재귀적으로 탐색
    if ('children' in child && Array.isArray(child.children) && child.children.length > 0) {
      const foundPath = findCellAndBuildPathInHierarchy(
        child as MandalartCellWithChildren, 
        cellId, 
        currentPath
      );
      
      if (foundPath) return foundPath;
    }
  }
  
  // 경로를 찾지 못한 경우
  return null;
}; 