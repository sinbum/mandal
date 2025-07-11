'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import MandalartBoard from '@/components/dashboard/MandalartBoard';
import MandalartBreadcrumbs from '@/components/dashboard/cells/MandalartBreadcrumbs';
import useCellOperations from '@/hooks/useCellOperations';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { MandalartCell } from '@/types/mandalart';
import { toast } from "sonner";
import CellEditorForm from '@/components/dashboard/cells/CellEditorForm';
import CellContextMenu from '@/components/dashboard/cells/CellContextMenu';
import { setMostRecentMandalartCell } from '@/lib/utils';
import { saveRecentMandalartCell } from '@/utils/cookies';
import MobileLayout from '@/components/layout/MobileLayout';
import BottomBar from '@/components/layout/BottomBar';
import AppHeaderBar from '@/components/layout/AppHeaderBar';
import PageTransition from '@/components/animations/PageTransition';

/**
 * 셀 상세 페이지
 * 셀 ID를 기반으로 셀과 자식 셀을 표시합니다.
 */
export default function CellPage() {
  const { id } = useParams<{ id: string }>();
  const cellId = Array.isArray(id) ? id[0] : id;
  const router = useRouter();
  
  const [currentCell, setCurrentCell] = useState<MandalartCell | null>(null);
  const [childCells, setChildCells] = useState<MandalartCell[]>([]);
  const [isPending, setIsPending] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);

  // 셀 편집 상태 추가
  const [editingCell, setEditingCell] = useState<MandalartCell | null>(null);
  
  // 삭제 상태 추가
  const [isDeleting, setIsDeleting] = useState(false);

  // 컨텍스트 메뉴 상태 추가
  const [contextMenuCell, setContextMenuCell] = useState<MandalartCell | null>(null);
  
  // 셀 조작 훅 사용
  const { 
    isLoading, 
    error, 
    navigation, 
    loadCell, 
    loadChildCells, 
    updateCell,
    createCell,
    deleteCell,
    toggleCellCompletion
  } = useCellOperations();

  
  // 초기 데이터 로드
  useEffect(() => {
    async function loadData() {
      try {
        setIsPending(true);
        setPageError(null);
        
        // 셀 데이터 로드
        const cell = await loadCell(cellId);
        
        if (cell) {
          setCurrentCell(cell);
          
          // 자식 셀 로드
          const children = await loadChildCells(cellId);
          setChildCells(children);
          
          // 최근 사용 셀 ID를 localStorage와 쿠키에 저장
          setMostRecentMandalartCell(cellId);
          saveRecentMandalartCell(cellId);
        } else {
          setPageError('셀 정보를 찾을 수 없습니다');
        }
      } catch (err) {
        console.error('셀 페이지 데이터 로드 오류:', err);
        setPageError('데이터 로드에 실패했습니다');
      } finally {
        setIsPending(false);
      }
    }
    
    if (cellId) {
      loadData();
    }
  }, [cellId]); // eslint-disable-line react-hooks/exhaustive-deps
  
  // 셀 업데이트 처리
  const handleCellUpdate = async (cellId: string, updates: Partial<MandalartCell>) => {
    const updatedCell = await updateCell(cellId, updates);
    
    if (updatedCell) {
      // 현재 셀 업데이트인 경우
      if (currentCell && currentCell.id === cellId) {
        setCurrentCell(updatedCell);
      }
      
      // 자식 셀 업데이트인 경우
      setChildCells(prev => 
        prev.map(cell => 
          cell.id === cellId ? { ...cell, ...updates } : cell
        )
      );
    }
  };
  
  // 완료 상태 토글 처리
  const handleToggleCompletion = async (cellId: string) => {
    const newState = await toggleCellCompletion(cellId);
    
    // 현재 셀 업데이트인 경우
    if (currentCell && currentCell.id === cellId) {
      setCurrentCell(prev => prev ? { ...prev, isCompleted: newState } : null);
    }
    
    // 자식 셀 업데이트인 경우
    setChildCells(prev => 
      prev.map(cell => 
        cell.id === cellId ? { ...cell, isCompleted: newState } : cell
      )
    );
  };
  
  // 새 셀 생성 처리 (임시 셀 객체만 생성)
  const handleCreateCell = async (parentId: string, position: number) => {
    // 부모 셀의 깊이 계산
    const parentDepth = currentCell?.depth || 0;
    
    // 임시 셀 객체 생성 (DB에는 저장하지 않음)
    const tempCell: MandalartCell = {
      id: `temp-new-${Date.now()}`, // 임시 ID
      topic: '새 셀',
      memo: '',
      color: '',
      imageUrl: '',
      isCompleted: false,
      parentId: parentId,
      depth: parentDepth + 1,
      position: position,
      mandalartId: currentCell?.mandalartId
    };
    
    // 임시 셀을 편집 모드로 설정
    setEditingCell(tempCell);
  };
  
  // 셀 편집 완료 처리
  const handleEditComplete = async (updatedCell: MandalartCell) => {
    try {
      const isNewCell = updatedCell.id.startsWith('temp-new-');
      
      if (isNewCell) {
        // 새 셀인 경우: DB에 실제로 생성
        const newCell = await createCell(
          updatedCell.parentId!, 
          updatedCell.position,
          {
            topic: updatedCell.topic,
            memo: updatedCell.memo,
            color: updatedCell.color,
            imageUrl: updatedCell.imageUrl,
            isCompleted: updatedCell.isCompleted
          }
        );
        
        if (!newCell) {
          toast.error('새 셀 생성에 실패했습니다');
          return;
        }
        
        toast.success('새 셀이 생성되었습니다');
      } else {
        // 기존 셀인 경우: 업데이트
        await handleCellUpdate(updatedCell.id, updatedCell);
        toast.success('셀이 저장되었습니다');
      }
      
      // 편집 모드 종료
      setEditingCell(null);
      
      // 현재 셀과 자식 셀들을 새로 조회
      const refreshedCell = await loadCell(cellId);
      if (refreshedCell) {
        setCurrentCell(refreshedCell);
        const refreshedChildren = await loadChildCells(cellId);
        setChildCells(refreshedChildren);
      }
      
      // 최근 사용 셀 ID를 localStorage와 쿠키에 저장
      setMostRecentMandalartCell(cellId);
      saveRecentMandalartCell(cellId);
    } catch (error) {
      console.error('셀 저장 중 오류 발생:', error);
      toast.error('셀 저장 중 오류가 발생했습니다');
    }
  };
  
  // 셀 편집 취소
  const handleEditCancel = () => {
    setEditingCell(null);
  };

  // Long press 핸들러
  const handleCellLongPress = (cell: MandalartCell) => {
    setContextMenuCell(cell);
  };

  // 컨텍스트 메뉴에서 편집 선택
  const handleContextMenuEdit = () => {
    if (contextMenuCell) {
      setEditingCell(contextMenuCell);
    }
  };

  // 컨텍스트 메뉴에서 완료 상태 토글
  const handleContextMenuToggleComplete = () => {
    if (contextMenuCell) {
      handleToggleCompletion(contextMenuCell.id);
    }
  };

  // 컨텍스트 메뉴에서 삭제 선택
  const handleContextMenuDelete = async () => {
    if (!contextMenuCell) return;
    
    const confirmDelete = window.confirm(`'${contextMenuCell.topic || '제목 없음'}' 셀을 삭제하시겠습니까?\n\n이 작업은 되돌릴 수 없으며, 모든 하위 셀도 함께 삭제됩니다.`);
    
    if (!confirmDelete) return;
    
    try {
      const success = await deleteCell(contextMenuCell.id);
      
      if (success) {
        toast.success('셀이 삭제되었습니다');
        
        // 현재 페이지의 셀이 삭제된 경우 부모로 이동
        if (contextMenuCell.id === currentCell?.id) {
          if (currentCell.parentId) {
            router.push(`/app/cell/${currentCell.parentId}`);
          } else {
            router.push('/app');
          }
        } else {
          // 자식 셀이 삭제된 경우 목록 새로고침
          const refreshedChildren = await loadChildCells(cellId);
          setChildCells(refreshedChildren);
        }
      } else {
        toast.error('셀 삭제에 실패했습니다');
      }
    } catch (error) {
      console.error('셀 삭제 중 오류 발생:', error);
      toast.error('셀 삭제 중 오류가 발생했습니다');
    }
  };

  // 셀 삭제 처리
  const handleDeleteCell = async () => {
    if (!currentCell || isDeleting) return;
    
    const confirmDelete = window.confirm('정말로 이 셀을 삭제하시겠습니까?\n\n이 작업은 되돌릴 수 없으며, 모든 하위 셀도 함께 삭제됩니다.');
    
    if (!confirmDelete) return;
    
    try {
      setIsDeleting(true);
      
      const success = await deleteCell(currentCell.id);
      
      if (success) {
        toast.success('셀이 삭제되었습니다');
        
        // 부모 셀로 이동하거나 홈으로 이동
        if (currentCell.parentId) {
          router.push(`/app/cell/${currentCell.parentId}`);
        } else {
          router.push('/app');
        }
      } else {
        toast.error('셀 삭제에 실패했습니다');
      }
    } catch (error) {
      console.error('셀 삭제 중 오류 발생:', error);
      toast.error('셀 삭제 중 오류가 발생했습니다');
    } finally {
      setIsDeleting(false);
    }
  };

  
  if (isPending || isLoading) {
    return <LoadingSpinner />;
  }
  
  if (pageError || error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-red-600 mb-4">오류 발생</h1>
          <p className="text-gray-700">{pageError || error}</p>
        </div>
      </div>
    );
  }
  
  if (!currentCell) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">셀을 찾을 수 없습니다</h1>
          <p className="text-gray-700">요청하신 셀 정보를 찾을 수 없습니다.</p>
        </div>
      </div>
    );
  }
  
  return (
    <PageTransition>
      <MobileLayout
        header={<div className="hidden sm:block"><AppHeaderBar showBackButton backHref="/app" /></div>}
        footer={<div className="sm:hidden"><BottomBar /></div>}
      >

      <div className="container mx-auto px-0 py-0 sm:px-4 sm:py-8 h-full sm:h-screen flex flex-col max-w-none 2xl:max-w-8xl overflow-hidden">
        
        {/* 브레드크럼 네비게이션 */}
        <div className="flex-shrink-0">
        <MandalartBreadcrumbs 
          path={navigation.breadcrumbPath} 
          onDeleteCell={handleDeleteCell}
          isDeleting={isDeleting}
        />
        </div>
        
        {/* 셀 편집 모달 */}
        {editingCell && (
          <CellEditorForm 
            cell={editingCell}
            onSave={handleEditComplete}
            onCancel={handleEditCancel}
            isNewCell={editingCell.id.startsWith('temp-new-')}
          />
        )}

        {/* 컨텍스트 메뉴 */}
        <CellContextMenu
          isOpen={!!contextMenuCell}
          onClose={() => setContextMenuCell(null)}
          cell={contextMenuCell}
          onEdit={handleContextMenuEdit}
          onToggleComplete={handleContextMenuToggleComplete}
          onDelete={handleContextMenuDelete}
        />
        
        {/* 만다라트 보드 */}
        <div className="flex-1 w-full flex items-center justify-center p-2 sm:p-4 min-h-0">
          <MandalartBoard
            centerCell={currentCell}
            cells={childCells}
            onUpdateCell={handleCellUpdate}
            onToggleComplete={handleToggleCompletion}
            onCreateCell={handleCreateCell}
            onNavigate={(cellId) => {
              // 자식 셀로 네비게이션 (클라이언트 사이드 라우팅)
              navigation.navigateToCell(cellId);
              window.location.href = `/app/cell/${cellId}`;
            }}
            onEditCell={setEditingCell}
            onLongPress={handleCellLongPress}
          />
        </div>
      </div>
      </MobileLayout>
    </PageTransition>
  );
} 