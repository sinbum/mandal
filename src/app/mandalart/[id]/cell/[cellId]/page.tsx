'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import HeaderBar from '@/components/layout/HeaderBar';
import MobileLayout from '@/components/layout/MobileLayout';
import MandalartGrid from '@/components/mandalart/MandalartGrid';
import MandalartNavigation from '@/components/mandalart/MandalartNavigation';
import CellEditorForm from '@/components/mandalart/CellEditorForm';
import SlideUpPanel from '@/components/ui/SlideUpPanel';
import useMandalart from '@/hooks/useMandalart';
import { MandalartCell, MandalartCellWithChildren, MandalartHierarchical } from '@/types/mandalart';
import { createClient } from '@/utils/supabase/client';

// 타입 가드 함수 추가
const isHierarchicalMandalart = (mandalart: any): mandalart is MandalartHierarchical => {
  return 'rootCell' in mandalart;
};

export default function CellDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const cellId = params?.cellId as string;
  const router = useRouter();
  
  const [selectedCell, setSelectedCell] = useState<MandalartCell | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  
  // useMandalart 훅 사용
  const { 
    mandalart, 
    isLoading, 
    error: mandalartError, 
    updateCell, 
    navigationPath, 
    currentCell, 
    navigateToCell, 
    navigateToParent, 
    loadChildrenForCell,
    createCell,
    createCellAndEdit,
    toggleCellCompletion,
    setNavigationPath,
    setCurrentCellId,
    getEmptyCellsWithVirtualIds,
    loadChildrenForCellById,
    createNewCell
  } = useMandalart(id);

  // 셀 ID 로 자식 데이터 로드
  useEffect(() => {
    if (mandalart && cellId && !isLoading) {
      console.log('셀 상세 페이지 로드 - cellId:', cellId);
      
      // 이미 현재 cellId에 해당하는 셀이 로드되어 있는지 확인
      const isCellAlreadyLoaded = (selectedCell && selectedCell.id === cellId) || 
                                 (currentCell && currentCell.id === cellId);
      
      // 이미 로드되었으면 다시 요청하지 않음
      if (isCellAlreadyLoaded) {
        console.log('이미 셀 데이터가 로드되어 있습니다:', cellId);
        return;
      }
      
      // 새 셀로 이동할 때는 항상 기존 상태를 초기화
      setSelectedCell(null);
      
      // 최적화된 셀 로드 및 경로 구성
      const loadCellData = async () => {
        try {
          console.log('셀 데이터 최적화 로드 시작:', cellId);
          
          // 1. 해당 셀의 경로 구성 (API 함수 활용)
          const { buildCellPathById, loadChildrenForCellById } = await import('@/api/mandalartApi');
          
          // 2. 셀 경로 조회 (최적화된 함수 사용)
          const cellPath = await buildCellPathById(id, cellId);
          console.log('셀 경로 구성됨:', cellPath.map(c => c.topic));
          
          // 3. 현재 셀의 자식 셀 로드 (페이징 적용)
          const { children: childrenData, total } = await loadChildrenForCellById(id, cellId, { limit: 9 });
          console.log(`자식 셀 로드됨: ${childrenData.length}/${total}`);
          
          // 자식 셀의 depth를 올바르게 설정 - 현재 셀의 depth + 1로 강제 설정
          const currentCellDepth = cellPath[cellPath.length - 1].depth || 0;
          const processedChildrenData = childrenData.map(child => ({
            ...child,
            depth: currentCellDepth + 1 // 부모 셀 depth + 1로 명시적 설정
          }));
          
          console.log('처리된 자식 셀 depth:', processedChildrenData.map(c => ({ id: c.id, topic: c.topic, depth: c.depth })));
          
          // 4. UI 상태 업데이트 - 전체 경로를 한 번에 설정
          if (isHierarchicalMandalart(mandalart) && mandalart.rootCell) {
            try {
              // 네비게이션 경로 직접 설정 (API 호출 없이)
              setNavigationPath(cellPath);
              setCurrentCellId(cellId);
              
              // 커스텀 상태로 현재 셀과 자식 관리
              const currentCellWithChildren = {
                ...cellPath[cellPath.length - 1],
                children: processedChildrenData // depth가 조정된 자식 셀 사용
              };
              
              console.log('현재 셀 설정:', {
                id: currentCellWithChildren.id,
                topic: currentCellWithChildren.topic,
                depth: currentCellWithChildren.depth,
                childrenCount: processedChildrenData.length,
                childrenDepths: processedChildrenData.map(c => c.depth)
              });
              
              // MandalartCell로 캐스팅하여 확실히 타입 설정
              setSelectedCell({
                id: currentCellWithChildren.id,
                topic: currentCellWithChildren.topic || '',
                memo: currentCellWithChildren.memo,
                color: currentCellWithChildren.color,
                imageUrl: currentCellWithChildren.imageUrl,
                isCompleted: currentCellWithChildren.isCompleted || false,
                depth: currentCellWithChildren.depth !== undefined ? currentCellWithChildren.depth : 0,
                position: currentCellWithChildren.position || 0,
                parentId: currentCellWithChildren.parentId
              });
              
              // 부모 셀들의 자식 셀 정보를 메모리에 업데이트
              // (이 데이터가 현재 경로 이동 시 필요할 때를 위해)
              if (cellPath.length > 1) {
                const asyncUpdateCells = async () => {
                  try {
                    // 현재 셀의 부모 셀에 자식 정보만 업데이트 (1회만)
                    const parentCell = cellPath[cellPath.length - 2];
                    if (parentCell && parentCell.id) {
                      await loadChildrenForCell(parentCell.id);
                    }
                  } catch (e) {
                    console.warn('부모 셀 자식 정보 업데이트 중 오류:', e);
                  }
                };
                
                // 백그라운드로 실행 (UI 블로킹 방지)
                asyncUpdateCells();
              }
            } catch (e) {
              console.error('셀 경로 설정 실패:', e);
            }
          }
        } catch (err) {
          console.error('셀 데이터 로드 실패:', err);
          setLocalError('셀 데이터를 처리하는데 실패했습니다.');
        }
      };
      
      loadCellData();
    }
  }, [mandalart, cellId, id, currentCell, selectedCell, isLoading, navigateToCell, loadChildrenForCell, setNavigationPath, setCurrentCellId]);

  // 디버깅용 로그
  useEffect(() => {
    console.log('---------- 만다라트 셀 디버깅 정보 ----------');
    console.log('ID:', id);
    console.log('셀 ID:', cellId);
    console.log('로딩 상태:', isLoading);
    console.log('에러:', localError);
    
    if (currentCell) {
      console.log('현재 셀:', currentCell.topic || '(제목 없음)');
      const currentCellWithChildren = currentCell as MandalartCellWithChildren;
      console.log('자식 셀 수:', currentCellWithChildren.children?.length || 0);
    }
    
    console.log('네비게이션 경로:', navigationPath.map(cell => cell.topic || '무제'));
    console.log('----------------------------------------');
  }, [id, cellId, isLoading, localError, currentCell, navigationPath]);

  // 셀 클릭 시 행동 (하위 셀로 이동)
  const handleCellClick = (clickedCellId: string) => {
    if (!mandalart) return;
    
    // 빈 셀인 경우 새 셀 생성 모드로 전환
    if (clickedCellId.startsWith('empty-')) {
      console.log('빈 셀 클릭됨 - 새 셀 생성 시작');
      const positionNumber = parseInt(clickedCellId.split('-')[1], 10);
      handleCreateNewCell(positionNumber);
      return;
    }
    
    console.log(`셀 클릭: ${clickedCellId}`);
    
    // 새 경로로 이동
    router.push(`/mandalart/${id}/cell/${clickedCellId}`);
  };
  
  // 셀 편집 버튼 클릭 처리
  const handleCellEdit = (editCellId: string) => {
    if (!mandalart) return;
    
    // 빈 셀인 경우 새 셀 생성 로직 실행
    if (editCellId.startsWith('empty-')) {
      const positionNumber = parseInt(editCellId.split('-')[1], 10);
      handleCreateNewCell(positionNumber);
      return;
    }
    
    // 셀 찾기
    const cellToEdit = findCellById(editCellId);
    if (cellToEdit) {
      setSelectedCell(cellToEdit);
      setIsEditorOpen(true);
    }
  };
  
  // 새 셀 생성 처리
  const handleCreateNewCell = async (position: number) => {
    if (!mandalart || !currentCell) return;
    
    // 임시 빈 셀 데이터 생성 (아직 저장하지 않음)
    const tempNewCell: MandalartCell = {
      id: `temp-new-${position}`, // 임시 ID
      topic: '새 셀',
      memo: '',
      color: '',
      imageUrl: '',
      isCompleted: false,
      parentId: currentCell.id,
      depth: (currentCell.depth || 0) + 1,
      position: position
    };
    
    // 편집기 열기
    setSelectedCell(tempNewCell);
    setIsEditorOpen(true);
  };
  
  // 네비게이션 경로에서 ID로 셀 찾기
  const findCellById = (searchCellId: string): MandalartCell | null => {
    // 네비게이션 경로에서 찾기
    const cellInPath = navigationPath.find(cell => cell.id === searchCellId);
    if (cellInPath) return cellInPath;
    
    // 현재 셀 자식에서 찾기
    const currentCellWithChildren = currentCell as MandalartCellWithChildren;
    if (currentCellWithChildren?.children) {
      const childCell = currentCellWithChildren.children.find((cell: MandalartCell) => cell.id === searchCellId);
      if (childCell) return childCell;
    }
    
    return null;
  };

  // 셀 저장 처리
  const handleSaveCell = useCallback(async (editedCell: MandalartCell) => {
    try {
      console.log('셀 저장 요청:', editedCell);
      
      // 임시 ID를 가진 새 셀 처리 (empty-x 또는 temp-new-x)
      if (editedCell.id.startsWith('empty-') || editedCell.id.startsWith('temp-new-')) {
        console.log('새 셀 생성 처리 시작:', {
          id: editedCell.id,
          parentId: editedCell.parentId,
          mandalartId: params.id
        });
        
        // 부모 ID 확인 (가상 루트 ID 처리 포함)
        let parentId = editedCell.parentId;
        if (parentId && (parentId.startsWith('virtual-root-') || parentId === 'root')) {
          // 가상 루트 ID는 null로 설정 (실제 DB에서는 최상위 셀에 부모가 없음)
          console.log('가상 루트 ID 감지, 부모 ID를 null로 설정:', parentId);
          parentId = undefined;  // string | undefined 타입에 맞게 수정
        }
        
        // 새 셀 생성 요청
        const position = parseInt(editedCell.id.split('-').pop() || '0', 10);
        
        const cellData: Partial<MandalartCell> = {
          topic: editedCell.topic,
          memo: editedCell.memo,
          color: editedCell.color,
          imageUrl: editedCell.imageUrl,
          isCompleted: editedCell.isCompleted,
          parentId: parentId,
          position: position
        };
        
        console.log('새 셀 생성 데이터:', cellData);
        
        // 새 셀 생성 API 호출 (params.id가 배열일 경우 첫 번째 요소 사용, undefined인 경우 기본값 제공)
        const mandalartId = typeof params?.id === 'string' 
          ? params.id 
          : Array.isArray(params?.id) 
            ? params.id[0] 
            : id; // 현재 컴포넌트에서 접근 가능한 id 사용
        
        await createNewCell(mandalartId, position, cellData);
        
        console.log('새 셀 생성 완료');
        
        // 셀 선택 상태 및 패널 초기화
        setSelectedCell(null);
        setIsEditorOpen(false);
        
        // 현재 셀의 자식 셀 다시 로드 (현재 셀이 있는 경우에만)
        if (currentCell) {
          await loadChildrenForCellById(currentCell.id);
        }
        
        return;
      }
      
      // 기존 셀 업데이트
      await updateCell(editedCell.id, editedCell);
      
      // 셀 선택 상태 및 패널 초기화
      setSelectedCell(null);
      setIsEditorOpen(false);
      
      // 현재 셀의 자식 셀 다시 로드 (현재 셀이 있는 경우에만)
      if (currentCell) {
        // 현재 셀이 수정된 경우 현재 셀 ID 다시 설정 (새로고침 효과)
        if (editedCell.id === currentCell.id) {
          setCurrentCellId(editedCell.id);
        }
        // 자식 셀 목록 갱신
        await loadChildrenForCellById(currentCell.id);
      }
    } catch (error) {
      console.error('셀 저장 중 오류 발생:', error);
    }
  }, [currentCell, params, id, loadChildrenForCellById, createNewCell, updateCell, setCurrentCellId]);

  // 패널 닫기
  const handleClosePanel = () => {
    setIsEditorOpen(false);
  };
  
  // 뒤로가기 처리
  const handleBackClick = () => {
    if (navigationPath.length > 1) {
      // 부모 셀로 이동
      const parentCell = navigationPath[navigationPath.length - 2];
      if (isHierarchicalMandalart(mandalart) && mandalart.rootCell && parentCell.id === mandalart.rootCell.id) {
        // 루트 셀이면 만다라트 메인 페이지로
        router.push(`/mandalart/${id}`);
      } else {
        // 다른 셀이면 해당 셀 페이지로
        router.push(`/mandalart/${id}/cell/${parentCell.id}`);
      }
    } else {
      // 경로가 없거나 짧으면 대시보드로
      router.push('/dashboard');
    }
  };
  
  // 특정 셀로 이동 처리
  const handleNavigateTo = (navCellId: string) => {
    if (isHierarchicalMandalart(mandalart) && mandalart.rootCell && navCellId === mandalart.rootCell.id) {
      // 루트 셀이면 만다라트 메인 페이지로
      router.push(`/mandalart/${id}`);
    } else {
      // 다른 셀이면 해당 셀 페이지로
      router.push(`/mandalart/${id}/cell/${navCellId}`);
    }
  };

  // 셀 완료 상태 토글 처리
  const handleCellToggleComplete = (cellId: string) => {
    if (!mandalart) return;
    
    // 빈 셀인 경우 무시
    if (cellId.startsWith('empty-')) {
      return;
    }
    
    console.log(`셀 완료 상태 토글: ${cellId}`);
    toggleCellCompletion(cellId);
  };

  // 현재 셀의 자식 셀 배열 (빈 셀 포함)
  const getDisplayChildren = () => {
    if (!currentCell) return [];
    
    // 현재 셀의 자식 셀만 사용
    const currentCellWithChildren = currentCell as MandalartCellWithChildren;
    const children = currentCellWithChildren.children || [];
    
    // 자식 셀의 depth가 올바른지 확인 (현재 셀의 depth + 1)
    const currentDepth = currentCell.depth !== undefined ? currentCell.depth : 0;
    
    console.log('자식 셀 처리 시작:', {
      currentCellId: currentCell.id,
      currentCellTopic: currentCell.topic,
      currentCellDepth: currentDepth,
      childrenCount: children.length,
    });
    
    // 빈 배열인 경우 8개의 빈 셀 생성
    if (!children || children.length === 0) {
      console.log('자식 셀이 없음 - 빈 셀 8개 생성');
      const emptyChildren = Array(8).fill(null).map((_, index) => ({
        id: `empty-${index+1}`,
        topic: '',
        memo: '클릭하여 새 셀을 추가하세요',
        isCompleted: false,
        parentId: currentCell.id,
        depth: currentDepth + 1, // 부모 셀 depth + 1
        position: index+1,
        color: '',
        imageUrl: ''
      }));
      
      console.log('빈 셀 생성 완료:', emptyChildren.length);
      return emptyChildren;
    }
    
    // depth 값이 일치하지 않는 자식 셀들의 depth 값을 수정
    const processedChildren = children.map(child => ({
      ...child,
      depth: currentDepth + 1 // 부모 셀 depth + 1로 강제 설정
    }));
    
    console.log('자식 셀 처리 완료:', {
      childrenCount: processedChildren.length,
      processedChildren: processedChildren.slice(0, 3).map(c => ({ id: c.id, topic: c.topic, depth: c.depth }))
    });
    
    // 빈 셀이 없는 경우 8개의 빈 셀 추가
    if (processedChildren.length < 8) {
      console.log(`${8 - processedChildren.length}개의 빈 셀 추가`);
      
      for (let i = processedChildren.length; i < 8; i++) {
        processedChildren.push({
          id: `empty-${i+1}`,
          topic: '',
          memo: '클릭하여 새 셀을 추가하세요', 
          isCompleted: false,
          parentId: currentCell.id,
          depth: currentDepth + 1,
          position: i+1,
          color: '',
          imageUrl: ''
        });
      }
    }
    
    return processedChildren;
  };

  const title = selectedCell ? (selectedCell.topic || '셀 상세') : currentCell ? (currentCell.topic || '셀 상세') : '셀 상세';
  
  const header = (
    <HeaderBar 
      title={title}
      showBackButton
      onBackClick={handleBackClick}
    />
  );

  if (isLoading) {
    return (
      <MobileLayout
        header={<HeaderBar title="로딩 중..." showBackButton onBackClick={handleBackClick} />}
        className="bg-gray-50"
      >
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-600">셀 정보를 불러오는 중입니다...</p>
        </div>
      </MobileLayout>
    );
  }

  if (mandalartError || localError || !mandalart) {
    return (
      <MobileLayout
        header={<HeaderBar title="오류" showBackButton onBackClick={handleBackClick} />}
        className="bg-gray-50"
      >
        <div className="flex flex-col items-center justify-center h-full p-4">
          <p className="text-red-500 font-medium">셀 정보를 불러오는데 실패했습니다.</p>
          <p className="text-sm text-gray-500 mt-2">{mandalartError || localError}</p>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout 
      header={header}
      className="bg-gray-50"
    >
      <div className="flex flex-col items-center justify-center w-full h-full p-1 pb-16 overflow-auto">
        {navigationPath.length > 0 && (
          <div className="w-full mb-3">
            <MandalartNavigation 
              path={navigationPath} 
              onNavigate={handleNavigateTo} 
            />
          </div>
        )}

        <div className="w-full max-w-4xl mx-auto">
          <MandalartGrid
            mandalart={mandalart}
            currentCell={
              (selectedCell || currentCell) 
                ? {
                    ...(selectedCell || currentCell),
                    children: getDisplayChildren()
                  } as MandalartCellWithChildren
                : {
                    id: 'root',
                    topic: '셀 상세',
                    memo: '',
                    isCompleted: false,
                    depth: 0,
                    position: 0,
                    children: []
                  } as MandalartCellWithChildren
            }
            onCellClick={handleCellClick}
            onCellEdit={handleCellEdit}
            onCellToggleComplete={handleCellToggleComplete}
            onNavigateBack={navigationPath.length > 1 ? handleBackClick : undefined}
            className="w-full aspect-square"
            // 명시적으로 현재 셀의 실제 depth 값 설정
            depth={currentCell && currentCell.depth !== undefined ? currentCell.depth : 0}
          />
        </div>
      </div>

      {/* 셀 편집 슬라이드업 패널 */}
      <SlideUpPanel isOpen={isEditorOpen} onClose={handleClosePanel} height="auto">
        {selectedCell && (
          <CellEditorForm
            cell={selectedCell}
            onSave={handleSaveCell}
            onCancel={handleClosePanel}
          />
        )}
      </SlideUpPanel>
    </MobileLayout>
  );
} 