'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useRouter } from 'next/navigation';

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
  const [isExpanded, setIsExpanded] = useState(false);
  
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
    createCell
  } = useMandalart(id);

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
      console.log('- centerBlock 존재 여부:', !!mandalart.centerBlock);
      console.log('- surroundingBlocks 존재 여부:', !!mandalart.surroundingBlocks);
      
      // 자세한 구조 확인
      if (mandalart.rootCell) {
        console.log('rootCell 주제:', mandalart.rootCell.topic || '없음');
        console.log('rootCell 자식 수:', mandalart.rootCell.children?.length || 0);
      }
      
      if (mandalart.centerBlock) {
        console.log('centerBlock 중앙 주제:', mandalart.centerBlock.centerCell.topic || '없음');
        console.log('centerBlock 주변 셀 수:', mandalart.centerBlock.surroundingCells.length);
      }
    }
    
    console.log('네비게이션 경로:', navigationPath.map(cell => cell.topic || '무제'));
    console.log('현재 선택된 셀:', currentCell?.topic || '없음');
    console.log('----------------------------------------');
  }, [id, isLoading, error, mandalart, navigationPath, currentCell]);

  // 확장/축소 전환 처리
  const toggleExpand = () => {
    setIsExpanded(prev => !prev);
  };

  // 셀 클릭 시 행동 (하위 셀로 이동 또는 편집 패널 열기)
  const handleCellClick = (cellId: string) => {
    if (!mandalart) return;
    
    // 빈 셀인 경우 편집 기능 열기
    if (cellId.startsWith('empty-')) {
      const positionNumber = parseInt(cellId.split('-')[1], 10);
      handleCellEdit(cellId); // 빈 셀도 편집 기능으로 처리
      return;
    }
    
    console.log(`셀 클릭: ${cellId}`);
    
    // 만다라트 구조 확인
    if (mandalart.rootCell) {
      // 계층형 구조인 경우 - 셀 상세 페이지로 이동
      router.push(`/mandalart/${id}/cell/${cellId}`);
    } else {
      // 레거시 구조인 경우 - 기존 로직 사용
      try {
        // 자식 셀 로드 시도
        loadChildrenForCell(cellId);
      } catch (error) {
        console.error('셀 클릭 처리 오류:', error);
      }
    }
  };
  
  // 셀 편집 버튼 클릭 처리
  const handleCellEdit = (cellId: string) => {
    if (!mandalart) return;
    
    // 빈 셀인 경우 새 셀 생성 로직 실행
    if (cellId.startsWith('empty-')) {
      const positionNumber = parseInt(cellId.split('-')[1], 10);
      handleCreateNewCell(positionNumber);
      return;
    }
    
    // 새 구조에서는 findCellById 사용
    if (mandalart.rootCell) {
      const cell = findCellById(cellId);
      if (cell) {
        setSelectedCell(cell);
        setIsEditorOpen(true);
      }
    } else {
      // 레거시 구조 지원 (이전 코드)
      let cell: MandalartCell | undefined;
      
      // 중앙 블록 확인
      if (mandalart.centerBlock && cellId === mandalart.centerBlock.centerCell.id) {
        cell = mandalart.centerBlock.centerCell;
      } else if (mandalart.centerBlock) {
        // 중앙 블록의 주변 셀 확인
        const centerSurroundingCell = mandalart.centerBlock.surroundingCells.find(c => c.id === cellId);
        if (centerSurroundingCell) {
          cell = centerSurroundingCell;
        } else if (mandalart.surroundingBlocks) {
          // 주변 블록 확인
          for (const block of mandalart.surroundingBlocks) {
            if (cellId === block.centerCell.id) {
              cell = block.centerCell;
              break;
            }
            
            const surroundingCell = block.surroundingCells.find(c => c.id === cellId);
            if (surroundingCell) {
              cell = surroundingCell;
              break;
            }
          }
        }
      }
      
      if (cell) {
        setSelectedCell(cell);
        setIsEditorOpen(true);
      }
    }
  };
  
  // 새 셀 생성 처리
  const handleCreateNewCell = async (position: number) => {
    if (!mandalart) return;
    
    try {
      let parentId: string | null = null;
      let depth = 0;
      
      // 계층형 구조인 경우
      if (mandalart.rootCell) {
        // 루트 셀을 부모로 설정
        parentId = mandalart.rootCell.id;
        depth = 1; // 루트 셀의 자식은 깊이가 1
      }
      
      // 현재 선택된 셀을 부모로 하는 새 셀 생성
      const newCellId = await createCell(id, position, {
        topic: '새 셀',
        parentId: parentId,
        depth: depth,
        position: position
      });
      
      console.log('새 셀 생성됨:', newCellId);
      
      // 자식 셀 다시 로드
      if (parentId) {
        loadChildrenForCell(parentId);
      } else {
        // 레거시 구조인 경우 전체 만다라트 다시 로드
        fetchMandalart(id).then(data => {
          if (data) {
            // 기존 만다라트 데이터를 교체하는 대신 페이지를 새로고침
            window.location.reload();
          }
        });
      }
    } catch (err) {
      console.error('새 셀 생성 실패:', err);
    }
  };
  
  // 네비게이션 경로에서 ID로 셀 찾기
  const findCellById = (cellId: string): MandalartCell | null => {
    // 네비게이션 경로에서 찾기
    const cellInPath = navigationPath.find(cell => cell.id === cellId);
    if (cellInPath) return cellInPath;
    
    // 현재 셀 자식에서 찾기
    if (currentCell && currentCell.children) {
      const childCell = currentCell.children.find(cell => cell.id === cellId);
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
        </div>
      </MobileLayout>
    );
  }

  // 레거시 모드인지 확인 (이전 코드와의 호환성)
  const isLegacyMode = !mandalart.rootCell && mandalart.centerBlock;

  return (
    <MobileLayout 
      header={header}
      className="bg-gray-50"
    >
      <div className="flex flex-col items-center justify-center w-full h-full p-1 pb-16 overflow-auto">
        {!isLegacyMode && navigationPath.length > 0 && (
          <div className="w-full mb-3">
            <MandalartNavigation 
              path={navigationPath} 
              onNavigate={handleNavigateTo} 
            />
          </div>
        )}
        
        {isLegacyMode && (
          <div className="flex justify-center mb-4">
            <button
              onClick={toggleExpand}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              {isExpanded ? '접기' : '펼쳐보기'}
            </button>
          </div>
        )}

        <div className="w-full max-w-4xl mx-auto">
          <MandalartGrid
            mandalart={mandalart}
            currentCell={currentCell as MandalartCellWithChildren}
            onCellClick={handleCellClick}
            onCellEdit={handleCellEdit}
            onNavigateBack={navigationPath.length > 1 ? handleNavigateBack : undefined}
            isExpanded={isExpanded}
            className="w-full aspect-square"
            depth={navigationPath.length - 1}
          />
        </div>
      </div>

      {/* 셀 편집 슬라이드업 패널 */}
      <SlideUpPanel isOpen={isEditorOpen} onClose={handleClosePanel}>
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