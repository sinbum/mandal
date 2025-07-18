'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import MandalartBoard from '@/components/dashboard/MandalartBoard';
import MandalartBreadcrumbs from '@/components/dashboard/cells/MandalartBreadcrumbs';
import useCellOperations from '@/hooks/useCellOperations';
import CellPageSkeleton from '@/components/skeleton/CellPageSkeleton';
import { cellCache } from '@/utils/cellCache';
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
import ProgressSidebar from '@/components/dashboard/cells/ProgressSidebar';
import CellPageLayout from '@/components/layout/CellPageLayout';

/**
 * 셀 상세 페이지
 * 셀 ID를 기반으로 셀과 자식 셀을 표시합니다.
 */
export default function CellPage() {
  const params = useParams();
  const { id } = params as { id: string };
  const locale = params.locale as string;
  const cellId = Array.isArray(id) ? id[0] : id;
  const router = useRouter();
  
  // 다국어 번역 훅
  const t = useTranslations('mandalart');
  const tCommon = useTranslations('common');
  const tErrors = useTranslations('errors');
  
  const [currentCell, setCurrentCell] = useState<MandalartCell | null>(null);
  const [childCells, setChildCells] = useState<MandalartCell[]>([]);
  const [isPending, setIsPending] = useState(false);
  const [pageError, setPageError] = useState<string | null>(null);
  const [isCacheLoaded, setIsCacheLoaded] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

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

  
  // 초기 데이터 로드 (캐시 우선 사용)
  useEffect(() => {
    async function loadData() {
      console.log('🔄 [CellPage] useEffect 시작 - cellId:', cellId);
      console.log('🔄 [CellPage] 현재 상태 - currentCell:', currentCell?.id, 'childCells:', childCells.length);
      console.log('🔄 [CellPage] 브라우저 정보:', {
        userAgent: navigator.userAgent,
        vendor: navigator.vendor,
        isSamsungInternet: /SamsungBrowser/i.test(navigator.userAgent)
      });
      
      try {
        // cellId가 변경되면 상태 초기화
        console.log('🔄 [CellPage] 상태 초기화 시작');
        setCurrentCell(null);
        setChildCells([]);
        setPageError(null);
        setIsCacheLoaded(false);
        setIsInitialLoading(true);
        console.log('🔄 [CellPage] 상태 초기화 완료');
        
        // 삼성 인터넷 브라우저 대응: 약간의 지연 추가
        const isSamsungInternet = /SamsungBrowser/i.test(navigator.userAgent);
        if (isSamsungInternet) {
          console.log('🔍 [CellPage] 삼성 인터넷 브라우저 감지됨, 지연 추가');
          await new Promise(resolve => setTimeout(resolve, 50));
        }
        
        // 먼저 메모리 캐시에서 데이터 확인 (동기적)
        const cachedData = cellCache.getSync(cellId);
        console.log('🔄 [CellPage] 캐시 확인 결과:', cachedData ? '있음' : '없음');
        
        if (cachedData) {
          console.log('📦 [CellPage] 캐시에서 로딩 - cell:', cachedData.cell.id, 'children:', cachedData.children.length);
          
          // 캐시에 자식이 없는 경우 강제로 API에서 로딩
          if (cachedData.children.length === 0) {
            console.log('⚠️ [CellPage] 캐시에 자식이 없음 - API에서 강제 로딩');
            
            try {
              const freshChildren = await loadChildCells(cellId);
              console.log('🔄 [CellPage] API에서 자식 로딩 완료:', freshChildren.length);
              
              if (freshChildren.length > 0) {
                // 새로운 자식 데이터가 있으면 캐시 업데이트
                cellCache.set(cellId, cachedData.cell, freshChildren);
                setChildCells(freshChildren);
                console.log('✅ [CellPage] 캐시 업데이트 완료 - 새 자식:', freshChildren.length);
              } else {
                setChildCells(cachedData.children);
              }
            } catch (err) {
              console.error('❌ [CellPage] 자식 로딩 실패:', err);
              setChildCells(cachedData.children);
            }
          } else {
            setChildCells(cachedData.children);
          }
          
          // 삼성 인터넷 브라우저에서는 상태 업데이트를 따로 처리
          if (isSamsungInternet) {
            // 순차적으로 상태 업데이트
            setCurrentCell(cachedData.cell);
            await new Promise(resolve => setTimeout(resolve, 0)); // 다음 틱으로 이동
            await new Promise(resolve => setTimeout(resolve, 0));
            setIsCacheLoaded(true);
            setIsInitialLoading(false);
          } else {
            // 일반 브라우저는 기존 방식
            setCurrentCell(cachedData.cell);
            setIsCacheLoaded(true);
            setIsInitialLoading(false);
          }
          
          // 최근 사용 셀 ID를 localStorage와 쿠키에 저장
          setMostRecentMandalartCell(cellId);
          saveRecentMandalartCell(cellId);
          
          console.log('✅ [CellPage] 캐시에서 즉시 로딩 완료:', cellId);
          return;
        }
        
        // 캐시에 없을 때는 API에서 로딩
        console.log('🌐 [CellPage] API에서 로딩 시작');
        setIsPending(true);
        
        // 캐시에 없으면 기존 방식으로 로딩
        const cell = await loadCell(cellId);
        console.log('🌐 [CellPage] loadCell 결과:', cell ? cell.id : 'null');
        
        if (cell) {
          if (isSamsungInternet) {
            // 순차적으로 상태 업데이트
            setCurrentCell(cell);
            await new Promise(resolve => setTimeout(resolve, 0));
          } else {
            setCurrentCell(cell);
          }
          console.log('🌐 [CellPage] currentCell 설정 완료:', cell.id);
          
          // 자식 셀 로드
          const children = await loadChildCells(cellId);
          console.log('🌐 [CellPage] loadChildCells 결과:', children.length, '개');
          
          if (isSamsungInternet) {
            setChildCells(children);
            await new Promise(resolve => setTimeout(resolve, 0));
          } else {
            setChildCells(children);
          }
          console.log('🌐 [CellPage] childCells 설정 완료:', children.length, '개');
          
          // 새로 로딩한 데이터를 캐시에 저장
          cellCache.set(cellId, cell, children);
          
          // 자식들의 하위 셀들도 백그라운드에서 미리 로딩 (비동기)
          cellCache.preloadChildrenOfChildren(children);
          
          // 현재 표시된 자식 셀들의 데이터를 미리 로딩 (사용자가 클릭할 가능성이 높음)
          const childIds = children.map(child => child.id);
          cellCache.preloadMultipleCellChildren(childIds);
          
          // 최근 사용 셀 ID를 localStorage와 쿠키에 저장
          setMostRecentMandalartCell(cellId);
          saveRecentMandalartCell(cellId);
          
          console.log('✅ [CellPage] API에서 데이터 로딩 완료:', cellId);
        } else {
          console.log('❌ [CellPage] 셀을 찾을 수 없음:', cellId);
          setCurrentCell(null);
          setChildCells([]);
          setPageError(t('page.cellNotFound'));
        }
      } catch (err) {
        console.error('❌ [CellPage] 셀 페이지 데이터 로드 오류:', err);
        setCurrentCell(null);
        setChildCells([]);
        setPageError(t('page.loadFailed'));
      } finally {
        console.log('🔄 [CellPage] useEffect 종료 처리');
        setIsPending(false);
        setIsInitialLoading(false);
      }
    }
    
    if (cellId) {
      console.log('🚀 [CellPage] loadData 실행 시작 - cellId:', cellId);
      loadData();
    }
  }, [cellId]); // eslint-disable-line react-hooks/exhaustive-deps
  
  // 페이지 포커스 시 캐시 동기화 (뒤로가기 대응)
  useEffect(() => {
    console.log('🎯 [CellPage] 포커스 이벤트 리스너 등록 시작:', { cellId, hasCurrentCell: !!currentCell });
    
    const handleVisibilityChange = async () => {
      console.log('🔄 [CellPage] visibilitychange 이벤트 발생:', { 
        hidden: document.hidden, 
        cellId, 
        hasCurrentCell: !!currentCell 
      });
      
      if (!document.hidden && cellId && currentCell) {
        console.log('🔄 [CellPage] 페이지 포커스 감지 - 캐시 동기화 실행');
        
        try {
          // 캐시 무효화
          await cellCache.invalidateCache(cellId);
          
          // 최신 데이터 로딩
          const refreshedCell = await loadCell(cellId);
          if (refreshedCell) {
            setCurrentCell(refreshedCell);
            const refreshedChildren = await loadChildCells(cellId);
            setChildCells(refreshedChildren);
            
            // 캐시 업데이트
            cellCache.set(cellId, refreshedCell, refreshedChildren);
            console.log('✅ [CellPage] 포커스 시 캐시 동기화 완료');
          }
        } catch (err) {
          console.error('❌ [CellPage] 포커스 시 캐시 동기화 실패:', err);
        }
      }
    };

    const handleFocus = () => {
      console.log('🔄 [CellPage] focus 이벤트 발생');
      handleVisibilityChange();
    };

    // 뒤로가기 감지를 위한 popstate 이벤트도 추가
    const handlePopState = () => {
      console.log('🔄 [CellPage] popstate 감지 - 뒤로가기 동기화');
      handleVisibilityChange();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('popstate', handlePopState);
    
    console.log('🎯 [CellPage] 포커스 이벤트 리스너 등록 완료');
    
    return () => {
      console.log('🎯 [CellPage] 포커스 이벤트 리스너 제거');
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [cellId, currentCell]); // eslint-disable-line react-hooks/exhaustive-deps
  
  // 브레드크럼 경로 구성을 위한 별도 useEffect
  useEffect(() => {
    if (cellId && currentCell) {
      // 현재 셀이 로드된 후 브레드크럼 경로 구성
      navigation.buildPathForCell(cellId).catch(err => {
        console.error(tErrors('breadcrumbBuild'), err);
      });
    }
  }, [cellId, currentCell]); // eslint-disable-line react-hooks/exhaustive-deps
  
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
      topic: '',
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
          toast.error(t('cell.createFailed'));
          return;
        }
        
        toast.success(t('cell.created'));
      } else {
        // 기존 셀인 경우: 업데이트
        await handleCellUpdate(updatedCell.id, updatedCell);
        toast.success(t('cell.saved'));
      }
      
      // 편집 모드 종료
      setEditingCell(null);
      
      // 캐시 무효화 후 현재 셀과 자식 셀들을 새로 조회
      try {
        // 현재 셀의 캐시를 무효화
        await cellCache.invalidateCache(cellId);
        console.log('캐시 무효화 완료:', cellId);
      } catch (cacheError) {
        console.warn('캐시 무효화 실패:', cacheError);
      }
      
      const refreshedCell = await loadCell(cellId);
      if (refreshedCell) {
        setCurrentCell(refreshedCell);
        const refreshedChildren = await loadChildCells(cellId);
        setChildCells(refreshedChildren);
        
        // 새로 로딩한 데이터를 캐시에 저장
        cellCache.set(cellId, refreshedCell, refreshedChildren);
      }
      
      // 최근 사용 셀 ID를 localStorage와 쿠키에 저장
      setMostRecentMandalartCell(cellId);
      saveRecentMandalartCell(cellId);
    } catch (error) {
      console.error(t('cell.saveError'), error);
      toast.error(t('cell.saveError'));
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
    
    const confirmDelete = window.confirm(t('cell.deleteConfirm', { title: contextMenuCell.topic || t('cell.noTitle') }));
    
    if (!confirmDelete) return;
    
    try {
      const success = await deleteCell(contextMenuCell.id);
      
      if (success) {
        toast.success(t('cell.deleted'));
        
        // 현재 페이지의 셀이 삭제된 경우 부모로 이동
        if (contextMenuCell.id === currentCell?.id) {
          if (currentCell.parentId) {
            router.push(`/${locale}/app/cell/${currentCell.parentId}`);
          } else {
            router.push(`/${locale}/app`);
          }
        } else {
          // 자식 셀이 삭제된 경우 캐시 무효화 후 목록 새로고침
          try {
            await cellCache.invalidateCache(cellId);
            console.log('삭제 후 캐시 무효화 완료:', cellId);
          } catch (cacheError) {
            console.warn('삭제 후 캐시 무효화 실패:', cacheError);
          }
          
          const refreshedChildren = await loadChildCells(cellId);
          setChildCells(refreshedChildren);
          
          // 새로 로딩한 데이터를 캐시에 저장
          if (currentCell) {
            cellCache.set(cellId, currentCell, refreshedChildren);
          }
        }
      } else {
        toast.error(t('cell.deleteFailed'));
      }
    } catch (error) {
      console.error(t('cell.deleteError'), error);
      toast.error(t('cell.deleteError'));
    }
  };

  // 셀 삭제 처리
  const handleDeleteCell = async () => {
    if (!currentCell || isDeleting) return;
    
    const confirmDelete = window.confirm(t('cell.deleteConfirmCurrent'));
    
    if (!confirmDelete) return;
    
    try {
      setIsDeleting(true);
      
      const success = await deleteCell(currentCell.id);
      
      if (success) {
        toast.success(t('cell.deleted'));
        
        // 부모 셀로 이동하거나 홈으로 이동
        if (currentCell.parentId) {
          router.push(`/${locale}/app/cell/${currentCell.parentId}`);
        } else {
          router.push(`/${locale}/app`);
        }
      } else {
        toast.error(t('cell.deleteFailed'));
      }
    } catch (error) {
      console.error(t('cell.deleteError'), error);
      toast.error(t('cell.deleteError'));
    } finally {
      setIsDeleting(false);
    }
  };

  
  // 로딩 상태 표시 (캐시에서 로딩된 경우 제외) - 임시 비활성화
  // if ((isPending || isLoading || isInitialLoading) && !isCacheLoaded) {
  //   return (
  //     <PageTransition>
  //       <MobileLayout
  //         header={<div className="hidden sm:block"><AppHeaderBar showBackButton backHref="/app" /></div>}
  //         footer={<div className="sm:hidden"><BottomBar /></div>}
  //       >
  //         <CellPageSkeleton />
  //       </MobileLayout>
  //     </PageTransition>
  //   );
  // }
  
  // 오류 상태 표시
  if (pageError || error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-red-600 mb-4">{t('page.errorOccurred')}</h1>
          <p className="text-gray-700">{pageError || error}</p>
        </div>
      </div>
    );
  }
  
  // 셀이 없고 모든 로딩이 완료된 경우에만 "셀을 찾을 수 없습니다" 표시
  if (!currentCell && !isPending && !isLoading && !isInitialLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">{t('page.notFound')}</h1>
          <p className="text-gray-700">{t('page.notFoundDescription')}</p>
        </div>
      </div>
    );
  }
    
  return (
    <PageTransition>
      <MobileLayout
        header={<div className="hidden sm:block"><AppHeaderBar showBackButton backHref="/app" /></div>}
        footer={<div className="sm:hidden"><BottomBar /></div>}
        disableScroll={true}
      >

      {/* 렌더링 조건 로깅 추가 */}
      {(() => {
        console.log('🎨 [CellPage] 렌더링 조건 체크:');
        console.log('  - isPending:', isPending);
        console.log('  - isLoading:', isLoading);
        console.log('  - isInitialLoading:', isInitialLoading);
        console.log('  - currentCell:', currentCell?.id || 'null');
        console.log('  - childCells.length:', childCells.length);
        console.log('  - isCacheLoaded:', isCacheLoaded);
        console.log('  - pageError:', pageError);
        
        const shouldShowSkeleton = (isPending || isLoading || isInitialLoading) && !currentCell;
        const shouldShowContent = !!currentCell;
        
        console.log('  - shouldShowSkeleton:', shouldShowSkeleton);
        console.log('  - shouldShowContent:', shouldShowContent);
        
        return null;
      })()}

      {/* 로딩 중이거나 currentCell이 없으면 스켈레톤 표시 */}
      {(isPending || isLoading || isInitialLoading) && !currentCell ? (
        <CellPageSkeleton />
      ) : currentCell && childCells !== undefined ? (
        <CellPageLayout
          breadcrumbs={
            <MandalartBreadcrumbs 
              path={navigation.breadcrumbPath} 
              onDeleteCell={handleDeleteCell}
              isDeleting={isDeleting}
              isLoading={isPending || isLoading || isInitialLoading || navigation.isLoading || navigation.breadcrumbPath.length === 0}
            />
          }
          sidebar={<ProgressSidebar cells={childCells} />}
        >
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
          <MandalartBoard
            centerCell={currentCell}
            cells={childCells}
            onUpdateCell={handleCellUpdate}
            onToggleComplete={handleToggleCompletion}
            onCreateCell={handleCreateCell}
            onNavigate={(cellId) => {
              // 자식 셀로 네비게이션 (클라이언트 사이드 라우팅)
              router.push(`/${locale}/app/cell/${cellId}`);
            }}
            onEditCell={setEditingCell}
            onLongPress={handleCellLongPress}
            showProgressStats={true}
          />
        </CellPageLayout>
      ) : null}
      </MobileLayout>
    </PageTransition>
  );
} 