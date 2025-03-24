'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

import MandalartGrid from '@/components/mandalart/MandalartGrid';
import MandalartNavigation from '@/components/mandalart/MandalartNavigation';
import CellEditorForm from '@/components/mandalart/CellEditorForm';
import HeaderBar from '@/components/layout/HeaderBar';
import MobileLayout from '@/components/layout/MobileLayout';
import SlideUpPanel from '@/components/ui/SlideUpPanel';

import useMandalart from '@/hooks/useMandalart';
import { MandalartCell, MandalartCellWithChildren } from '@/types/mandalart';

export default function MandalartEditorPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  
  const [selectedCell, setSelectedCell] = useState<MandalartCell | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  
  // useMandalart 훅 사용
  const { 
    mandalart, 
    isLoading, 
    error, 
    updateCell, 
    navigationPath, 
    currentCell, 
    navigateToCell, 
    navigateToParent, 
    loadChildrenForCell,
    fetchMandalart,
    createCell,
    toggleCellCompletion,
    breadcrumbPath,
    setMandalart,
    createCellAndEdit
  } = useMandalart(id);

  // 직접 구현한 함수들 (useMandalart에 없는 경우)
  // 루트 셀 제목 가져오기 (중앙 셀에 표시하기 위함)
  const getRootCellTitle = () => {
    if (!mandalart || !mandalart.rootCell) return '새 만다라트';
    return mandalart.rootCell.topic || mandalart.title || '새 만다라트';
  };

  // 빈 셀에 가상 ID 부여하기
  const createEmptyCells = (cellsArray: MandalartCell[] = []) => {
    if (!Array.isArray(cellsArray)) return [];

    // 배열 내 실제 셀 수
    const existingCellsCount = cellsArray.filter(cell => cell && cell.id && !cell.id.startsWith('empty-')).length;
    
    // 결과 배열 구성
    const resultCells = [...cellsArray];
    
    // 8개가 될 때까지 빈 셀 추가
    for (let i = existingCellsCount; i < 8; i++) {
      resultCells.push({
        id: `empty-${i+1}`, // 가상 ID 부여
        topic: '',
        memo: '클릭하여 새 셀을 추가하세요',
        isCompleted: false,
        depth: 1, // 루트셀의 자식이므로 depth는 항상 1
        position: i+1
      } as MandalartCell);
    }
    
    return resultCells;
  };

  // 현재 셀의 자식 셀 배열 (빈 셀 포함)
  const getDisplayChildren = () => {
    if (!currentCell) return [];
    
    const currentCellWithChildren = currentCell as MandalartCellWithChildren;
    const children = currentCellWithChildren.children || [];
    
    // 빈 셀을 포함한 8개의 셀 목록 생성
    return createEmptyCells(children);
  };

  // 디버깅용 로그
  useEffect(() => {
    console.log('---------- 만다라트 디버깅 정보 ----------');
    console.log('ID:', id);
    console.log('로딩 상태:', isLoading);
    console.log('에러:', error);
    
    if (mandalart) {
      console.log('만다라트 구조:');
      console.log('- 제목:', mandalart.title);
      console.log('- rootCell 존재 여부:', !!mandalart.rootCell);
      if (mandalart.rootCell) {
        console.log('rootCell 주제:', mandalart.rootCell.topic || '없음');
        console.log('rootCell 자식 수:', mandalart.rootCell.children?.length || 0);
        console.log('rootCell depth:', mandalart.rootCell.depth);
      }
    }
    
    console.log('네비게이션 경로:', navigationPath.map(cell => cell.topic || '무제'));
    console.log('현재 선택된 셀:', currentCell?.topic || '없음');
    console.log('현재 셀 depth:', currentCell?.depth);
    console.log('----------------------------------------');
  }, [id, isLoading, error, mandalart, navigationPath, currentCell]);

  // 셀 클릭 시 행동 (하위 셀로 이동 또는 편집 패널 열기)
  const handleCellClick = (cellId: string) => {
    if (!mandalart) return;
    
    // 빈 셀인 경우 편집 기능 열기
    if (cellId.startsWith('empty-')) {
      const positionNumber = parseInt(cellId.split('-')[1], 10);
      handleCellEdit(cellId);
      return;
    }
    
    console.log(`셀 클릭: ${cellId}`);
    router.push(`/mandalart/${id}/cell/${cellId}`);
  };
  
  // 셀 편집 버튼 클릭 처리
  const handleCellEdit = (cellId: string) => {
    if (!mandalart) return;
    
    if (cellId.startsWith('empty-')) {
      const positionNumber = parseInt(cellId.split('-')[1], 10);
      handleCreateNewCell(positionNumber);
      return;
    }
    
    const cell = findCellById(cellId);
    if (cell) {
      setSelectedCell(cell);
      setIsEditorOpen(true);
    }
  };
  
  // 새 셀 생성 처리
  const handleCreateNewCell = async (position: number) => {
    if (!mandalart) return;
    
    try {
      // 부모 셀 정보 (현재 셀 또는 루트 셀)
      const parentCell = currentCell || mandalart.rootCell;
      
      // 임시 빈 셀 데이터 생성 (아직 저장하지 않음)
      const tempNewCell: MandalartCell = {
        id: `temp-new-${position}`, // 임시 ID
        topic: '새 셀',
        memo: '',
        color: '',
        imageUrl: '',
        isCompleted: false,
        parentId: parentCell.id,
        depth: (parentCell.depth || 0) + 1,
        position: position
      };
      
      // 편집기 열기
      setSelectedCell(tempNewCell);
      setIsEditorOpen(true);
    } catch (err) {
      console.error('새 셀 생성 준비 실패:', err);
    }
  };
  
  // 네비게이션 경로에서 ID로 셀 찾기
  const findCellById = (cellId: string): MandalartCell | null => {
    // 네비게이션 경로에서 찾기
    const cellInPath = navigationPath.find(cell => cell.id === cellId);
    if (cellInPath) return cellInPath;
    
    // 현재 셀 자식에서 찾기
    const currentCellWithChildren = currentCell as MandalartCellWithChildren;
    if (currentCellWithChildren?.children) {
      const childCell = currentCellWithChildren.children.find((cell: MandalartCell) => cell.id === cellId);
      if (childCell) return childCell;
    }
    
    return null;
  };

  // 셀 편집 폼 저장 처리
  const handleSaveCell = async (updatedCell: Partial<MandalartCell>) => {
    console.log('셀 저장 시도:', { 
      selectedCell, 
      updatedCell, 
      selectedCellId: selectedCell?.id,
      hasId: !!selectedCell?.id
    });

    if (!selectedCell) {
      console.error('선택된 셀이 없어 저장 실패');
      return;
    }

    // 부모 셀 정보 (현재 셀 또는 루트 셀)
    const parentCell = currentCell || (mandalart ? mandalart.rootCell : null);
    if (!parentCell) {
      console.error('부모 셀을 찾을 수 없어 저장 실패');
      return;
    }

    try {
      // 임시 ID(temp-new-)로 시작하는 경우 새 셀 생성
      if (selectedCell.id.startsWith('temp-new-')) {
        console.log('임시 셀 생성 시작');
        
        // 실제 셀 생성
        const newCell = await createCellAndEdit(
          id, 
          selectedCell.position, 
          parentCell
        );
        
        console.log('새 셀 생성됨:', newCell.id);
        
        // 업데이트 데이터에 ID 추가 (새로 생성된 셀의 ID)
        const cellToUpdate = {
          ...updatedCell,
          id: newCell.id
        };
        
        // 생성된 셀 업데이트
        await updateCell(newCell.id, cellToUpdate);
      } else {
        // 기존 셀 업데이트
        const cellToUpdate = {
          ...updatedCell,
          id: selectedCell.id
        };
        
        await updateCell(selectedCell.id, cellToUpdate);
      }
      
      console.log('셀 저장 성공');
      setIsEditorOpen(false);
      
      // 현재 표시 중인 셀의 자식들 다시 로드 (UI 업데이트를 위해)
      if (parentCell && parentCell.id) {
        await loadChildrenForCell(parentCell.id);
      }
    } catch (error) {
      console.error('셀 저장 중 오류 발생:', error);
    }
  };

  // 패널 닫기
  const handleClosePanel = () => {
    setIsEditorOpen(false);
  };
  
  // 뒤로가기 처리
  const handleBackClick = () => {
    router.push('/dashboard');
  };
  
  // 상위 셀로 이동 처리
  const handleNavigateBack = () => {
    navigateToParent();
  };
  
  // 특정 셀로 이동 처리
  const handleNavigateTo = (cellId: string) => {
    navigateToCell(cellId);
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

  const header = (
    <HeaderBar 
      title={mandalart?.title || '만다라트'} 
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
          <p className="text-gray-600">만다라트를 불러오는 중입니다...</p>
        </div>
      </MobileLayout>
    );
  }

  if (error || !mandalart) {
    return (
      <MobileLayout
        header={<HeaderBar title="오류" showBackButton onBackClick={handleBackClick} />}
        className="bg-gray-50"
      >
        <div className="flex flex-col items-center justify-center h-full p-4">
          <p className="text-red-500 font-medium">만다라트를 불러오는데 실패했습니다.</p>
          <p className="text-sm text-gray-500 mt-2">{error}</p>
          <button 
            onClick={() => router.push('/dashboard')}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md shadow-sm"
          >
            대시보드로 돌아가기
          </button>
        </div>
      </MobileLayout>
    );
  }

  // 현재 표시할 셀과 자식 셀 준비
  const displayCurrentCell: MandalartCellWithChildren = currentCell 
    ? { ...currentCell, children: getDisplayChildren() } 
    : {
        id: 'root',
        topic: getRootCellTitle(),
        memo: '',
        isCompleted: false,
        depth: 0,
        position: 0,
        children: getDisplayChildren()
      };

  return (
    <>
      <MobileLayout 
        header={header}
        className="bg-gray-50"
      >
        <div className="flex flex-col items-center justify-center w-full h-full p-1 pb-16 overflow-auto">
          {navigationPath.length > 0 && (
            <div className="w-full mb-3">
              <MandalartNavigation 
                path={breadcrumbPath} 
                onNavigate={handleNavigateTo} 
              />
            </div>
          )}

          <div className="w-full max-w-4xl mx-auto">
            <MandalartGrid
              mandalart={mandalart}
              currentCell={displayCurrentCell}
              onCellClick={handleCellClick}
              onCellEdit={handleCellEdit}
              onCellToggleComplete={handleCellToggleComplete}
              onNavigateBack={navigationPath.length > 1 ? handleNavigateBack : undefined}
              className="w-full aspect-square"
              depth={navigationPath.length - 1}
            />
          </div>
        </div>
      </MobileLayout>

      {/* 셀 편집 슬라이드업 패널 - MobileLayout 밖으로 이동 */}
      <SlideUpPanel 
        isOpen={isEditorOpen} 
        onClose={handleClosePanel}
        height="auto"
      >
        {selectedCell && (
          <CellEditorForm
            cell={selectedCell}
            onSave={handleSaveCell}
            onCancel={handleClosePanel}
          />
        )}
      </SlideUpPanel>
    </>
  );
} 