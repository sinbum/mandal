'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import HeaderBar from '@/components/layout/HeaderBar';
import MobileLayout from '@/components/layout/MobileLayout';
import MandalartGrid from '@/components/mandalart/MandalartGrid';
import MandalartNavigation from '@/components/mandalart/MandalartNavigation';
import CellEditorForm from '@/components/mandalart/CellEditorForm';
import SlideUpPanel from '@/components/ui/SlideUpPanel';
import useMandalart from '@/hooks/useMandalart';
import { MandalartCell, MandalartCellWithChildren, MandalartLegacy, MandalartHierarchical } from '@/types/mandalart';
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
    setCurrentCellId
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
          
          // 4. UI 상태 업데이트 - 전체 경로를 한 번에 설정
          if (isHierarchicalMandalart(mandalart) && mandalart.rootCell) {
            try {
              // 네비게이션 경로 직접 설정 (API 호출 없이)
              setNavigationPath(cellPath);
              setCurrentCellId(cellId);
              
              // 커스텀 상태로 현재 셀과 자식 관리
              const currentCellWithChildren = {
                ...cellPath[cellPath.length - 1],
                children: childrenData
              };
              
              setSelectedCell(currentCellWithChildren as MandalartCell);
              
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
    
    try {
      // 통합 함수 사용: 현재 셀을 부모로 하는 새 셀 생성
      const newCell = await createCellAndEdit(id, position, currentCell);
      
      console.log('새 셀 생성됨:', newCell.id);
      
      // 편집기 열기
      setSelectedCell(newCell);
      setIsEditorOpen(true);
    } catch (err) {
      console.error('새 셀 생성 실패:', err);
    }
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

  // 셀 편집 폼 저장 처리
  const handleSaveCell = (updatedCell: MandalartCell) => {
    if (selectedCell && selectedCell.id) {
      updateCell(selectedCell.id, updatedCell);
      setIsEditorOpen(false);
    }
  };

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
            currentCell={selectedCell as MandalartCellWithChildren || currentCell as MandalartCellWithChildren}
            onCellClick={handleCellClick}
            onCellEdit={handleCellEdit}
            onCellToggleComplete={handleCellToggleComplete}
            onNavigateBack={undefined} // 네비게이션 컴포넌트로 대체
            className="w-full aspect-square"
            depth={navigationPath.length - 1}
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