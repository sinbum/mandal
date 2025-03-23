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
import { MandalartCell, MandalartCellWithChildren } from '@/types/mandalart';
import { createClient } from '@/utils/supabase/client';

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
    createCell
  } = useMandalart(id);

  // cellId 로 자식 데이터 로드
  useEffect(() => {
    if (mandalart && cellId) {
      console.log('셀 상세 페이지 로드 - cellId:', cellId);
      
      // 1. 특정 셀에 대한 경로 구성
      const buildCellPath = async () => {
        try {
          // Supabase 클라이언트 생성
          const supabase = createClient();
          
          // 현재 셀 정보 가져오기
          const { data: cellData, error: cellError } = await supabase
            .from('mandalart_cells')
            .select('*')
            .eq('id', cellId)
            .eq('mandalart_id', id)
            .single();
          
          if (cellError) {
            console.error('셀 데이터 로드 실패:', cellError);
            setLocalError('셀 데이터를 가져오는데 실패했습니다.');
            return;
          }
          
          if (!cellData) {
            console.error('셀을 찾을 수 없습니다:', cellId);
            setLocalError('요청한 셀을 찾을 수 없습니다.');
            return;
          }
          
          console.log('셀 데이터 로드 성공:', cellData);
          
          // 2. 셀 경로 구성하기 (상위 셀 체인 찾기)
          const cellChain: any[] = [cellData];
          let currentParentId = cellData.parent_id;
          
          // 루트 셀까지 거슬러 올라가며 경로 구성
          while (currentParentId) {
            const { data: parentData, error: parentError } = await supabase
              .from('mandalart_cells')
              .select('*')
              .eq('id', currentParentId)
              .single();
            
            if (parentError || !parentData) {
              console.error('부모 셀 로드 실패:', parentError);
              break;
            }
            
            cellChain.unshift(parentData); // 경로 앞에 부모 셀 추가
            currentParentId = parentData.parent_id;
          }
          
          console.log('셀 경로 구성됨:', cellChain.map(c => c.topic));
          
          // 3. 경로 셀들을 MandalartCell 형식으로 변환하여 네비게이션 경로 설정
          const convertedPath = cellChain.map(cell => ({
            id: cell.id,
            topic: cell.topic || '',
            memo: cell.memo,
            color: cell.color,
            imageUrl: cell.image_url,
            isCompleted: cell.is_completed,
            parentId: cell.parent_id,
            depth: cell.depth || 0,
            position: cell.position || 0
          }));
          
          // 4. 현재 셀의 자식 셀도 함께 로드
          const { data: childrenData, error: childrenError } = await supabase
            .from('mandalart_cells')
            .select('*')
            .eq('mandalart_id', id)
            .eq('parent_id', cellId);
          
          if (childrenError) {
            console.error('자식 셀 로드 실패:', childrenError);
            // 자식이 없어도 계속 진행
          }
          
          // 자식 셀 데이터 변환
          const convertedChildren = (childrenData || []).map(child => ({
            id: child.id,
            topic: child.topic || '',
            memo: child.memo,
            color: child.color,
            imageUrl: child.image_url,
            isCompleted: child.is_completed,
            parentId: child.parent_id,
            depth: child.depth || 0,
            position: child.position || 0
          }));
          
          console.log('로드된 자식 셀:', convertedChildren.length);
          
          // 5. 두 단계로 나누어 상태 업데이트
          // 먼저 상위 경로 업데이트 (setMandalart를 직접 호출하지 않음)
          if (mandalart.rootCell) {
            try {
              // 루트 셀부터 시작하여 상위 경로 따라가기
              await navigateToCell(mandalart.rootCell.id);
              
              // 중간 경로 셀들을 통과
              for (let i = 1; i < convertedPath.length; i++) {
                try {
                  await loadChildrenForCell(convertedPath[i-1].id);
                  await navigateToCell(convertedPath[i].id);
                } catch (e) {
                  console.warn(`경로 구성 중 ${i}번째 셀 처리 실패:`, e);
                  // 계속 진행
                }
              }
            } catch (e) {
              console.warn('경로 구성 중 오류 발생, 직접 현재 셀 로드 시도:', e);
            }
          }
          
          // 마지막으로 직접 현재 셀 처리 (실패해도 이 단계는 반드시 수행)
          try {
            // 이미 로드된 자식 데이터로 UI 업데이트
            if (mandalart.rootCell) {
              // 현재 셀의 자식 셀 정보를 직접 업데이트 (만다라트 hook 외부에서)
              // 1. 셀 페이지에서 사용할 현재 셀 데이터 구성
              const currentCellWithChildren = {
                ...convertedPath[convertedPath.length - 1],
                children: convertedChildren
              };
              
              console.log('현재 셀 데이터 설정 완료:', currentCellWithChildren.topic);
              
              // 2. 커스텀 상태로 현재 셀과 자식 관리 (useMandalart가 실패하는 경우 대비)
              setSelectedCell(currentCellWithChildren as MandalartCell);
            }
          } catch (e) {
            console.error('최종 셀 데이터 설정 실패:', e);
          }
          
        } catch (err) {
          console.error('셀 경로 구성 실패:', err);
          setLocalError('셀 데이터를 처리하는데 실패했습니다.');
        }
      };
      
      buildCellPath();
    }
  }, [mandalart, cellId, id, loadChildrenForCell, navigateToCell]);

  // 디버깅용 로그
  useEffect(() => {
    console.log('---------- 만다라트 셀 디버깅 정보 ----------');
    console.log('ID:', id);
    console.log('셀 ID:', cellId);
    console.log('로딩 상태:', isLoading);
    console.log('에러:', localError);
    
    if (currentCell) {
      console.log('현재 셀:', currentCell.topic || '(제목 없음)');
      console.log('자식 셀 수:', currentCell.children?.length || 0);
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
      // 현재 선택된 셀을 부모로 하는 새 셀 생성
      const newCellId = await createCell(id, position, {
        topic: '새 셀',
        parentId: currentCell.id,
        depth: (currentCell.depth || 0) + 1,
        position: position
      });
      
      console.log('새 셀 생성됨:', newCellId);
      
      // 자식 셀 다시 로드
      loadChildrenForCell(currentCell.id);
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
    if (currentCell && currentCell.children) {
      const childCell = currentCell.children.find(cell => cell.id === searchCellId);
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
      if (parentCell.id === mandalart?.rootCell?.id) {
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
    if (navCellId === mandalart?.rootCell?.id) {
      // 루트 셀이면 만다라트 메인 페이지로
      router.push(`/mandalart/${id}`);
    } else {
      // 다른 셀이면 해당 셀 페이지로
      router.push(`/mandalart/${id}/cell/${navCellId}`);
    }
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
            onNavigateBack={undefined} // 네비게이션 컴포넌트로 대체
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