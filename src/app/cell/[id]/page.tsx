'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import MandalartBoard from '@/components/ui/MandalartBoard';
import MandalartBreadcrumbs from '@/components/ui/MandalartBreadcrumbs';
import useCellOperations from '@/hooks/useCellOperations';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { MandalartCell } from '@/types/mandalart';
import Toast from '@/components/ui/Toast';
import { checkSession } from '@/app/auth/checkSession';
import CellEditorForm from '@/components/cells/CellEditorForm';

/**
 * 셀 상세 페이지
 * 셀 ID를 기반으로 셀과 자식 셀을 표시합니다.
 */
export default function CellPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const cellId = Array.isArray(id) ? id[0] : id;
  
  const [currentCell, setCurrentCell] = useState<MandalartCell | null>(null);
  const [childCells, setChildCells] = useState<MandalartCell[]>([]);
  const [isPending, setIsPending] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>('사용자');
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error' | 'info' | 'warning'} | null>(null);
  
  // 셀 편집 상태 추가
  const [editingCell, setEditingCell] = useState<MandalartCell | null>(null);
  
  // 셀 조작 훅 사용
  const { 
    isLoading, 
    error, 
    navigation, 
    loadCell, 
    loadChildCells, 
    updateCell,
    createCell,
    toggleCellCompletion
  } = useCellOperations();
  
  // 인증 상태 확인
  useEffect(() => {
    checkSession(setIsPending, setUserName);
  }, []);
  
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
  }, [cellId]);
  
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
  
  // 새 셀 생성 처리
  const handleCreateCell = async (parentId: string, position: number) => {
    try {
      const newCell = await createCell(parentId, position);
      
      if (newCell) {
        // 현재 셀과 자식 셀들을 새로 조회
        const refreshedCell = await loadCell(cellId);
        if (refreshedCell) {
          setCurrentCell(refreshedCell);
          const refreshedChildren = await loadChildCells(cellId);
          setChildCells(refreshedChildren);
        }
        
        // 새로 생성된 셀을 편집 모드로 설정
        setEditingCell(newCell);
      }
    } catch (error) {
      console.error('새 셀 생성 중 오류 발생:', error);
      setToast({
        message: '새 셀 생성 중 오류가 발생했습니다',
        type: 'error'
      });
    }
  };
  
  // 셀 편집 완료 처리
  const handleEditComplete = async (updatedCell: MandalartCell) => {
    try {
      // 셀 업데이트 처리
      await handleCellUpdate(updatedCell.id, updatedCell);
      
      // 편집 모드 종료
      setEditingCell(null);
      
      // 현재 셀과 자식 셀들을 새로 조회
      const refreshedCell = await loadCell(cellId);
      if (refreshedCell) {
        setCurrentCell(refreshedCell);
        const refreshedChildren = await loadChildCells(cellId);
        setChildCells(refreshedChildren);
      }
      
      // 성공 메시지 표시
      setToast({
        message: '셀이 저장되었습니다',
        type: 'success'
      });
    } catch (error) {
      console.error('셀 업데이트 중 오류 발생:', error);
      setToast({
        message: '셀 저장 중 오류가 발생했습니다',
        type: 'error'
      });
    }
  };
  
  // 셀 편집 취소
  const handleEditCancel = () => {
    setEditingCell(null);
  };

  // 페이지 이동 핸들러
  const handleNavigate = (path: string) => {
    router.push(path);
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
    <>
      <div className="container mx-auto px-4 py-8">
        
        {/* 브레드크럼 네비게이션 */}
        <MandalartBreadcrumbs path={navigation.breadcrumbPath} />
        
        {/* 셀 편집 모달 */}
        {editingCell && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">셀 편집</h2>
              <CellEditorForm 
                cell={editingCell}
                onSave={handleEditComplete}
                onCancel={handleEditCancel}
              />
            </div>
          </div>
        )}
        
        {/* 만다라트 보드 */}
        <MandalartBoard
          centerCell={currentCell}
          cells={childCells}
          onUpdateCell={handleCellUpdate}
          onToggleComplete={handleToggleCompletion}
          onCreateCell={handleCreateCell}
          onNavigate={(cellId) => {
            // 자식 셀로 네비게이션 (클라이언트 사이드 라우팅)
            navigation.navigateToCell(cellId);
            window.location.href = `/cell/${cellId}`;
          }}
          onEditCell={setEditingCell}
        />
      </div>

      {/* 토스트 메시지 */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </>
  );
} 