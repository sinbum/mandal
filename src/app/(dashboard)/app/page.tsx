'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { mandalartAPI } from '@/services/mandalartService';
import { MandalartCell } from '@/types/mandalart';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';

import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import MobileLayout from '@/components/layout/MobileLayout';
import BottomBar from '@/components/layout/BottomBar';
import AppHeaderBar from '@/components/layout/AppHeaderBar';
import PageTransition from '@/components/animations/PageTransition';
import PremiumMandalartCardSlider from '@/components/dashboard/PremiumMandalartCardSlider';
import HomePageSkeleton from '@/components/skeleton/HomePageSkeleton';
import { cellCache } from '@/utils/cellCache';
/**
 * 홈 페이지 컴포넌트
 * 사용자가 가진 만다라트 루트 셀 목록 표시
 */
export default function HomePage() {
  const router = useRouter();
  const { user, loading: authLoading, isLoggedIn } = useAuth(); // 전역 인증 상태 사용
  const [rootCells, setRootCells] = useState<MandalartCell[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [cellToDelete, setCellToDelete] = useState<string | null>(null);


  // 루트 셀 및 첫 번째 레벨 자식들 로드
  useEffect(() => {
    async function loadData() {
      try {
        // 인증 상태가 로딩 중이거나 로그인되지 않은 경우 대기
        if (authLoading || !isLoggedIn) {
          console.log('인증 상태 대기 중...', { authLoading, isLoggedIn });
          return;
        }

        // 로딩 상태는 실제 API 호출 전에만 설정
        setIsLoading(true);
        
        // 최적화된 메서드로 루트 셀과 첫 번째 레벨 자식들을 함께 로딩
        const cells = await mandalartAPI.fetchUserCellsWithChildrenOptimized();
        setRootCells(cells);
        
        // 로딩한 데이터를 캐시에 저장하여 셀 페이지에서 빠르게 접근 가능
        cellCache.populateFromRootCells(cells);
        
        console.log('홈페이지 데이터 로딩 및 캐시 완료, 셀 개수:', cells.length);
      } catch (err) {
        console.error('데이터 로드 오류:', err);
        toast.error('만다라트 목록을 불러오는데 실패했습니다');
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [authLoading, isLoggedIn]); // 인증 상태 변경 시 재실행

  // 페이지가 포커스를 받을 때 최신 데이터 로드 (뒤로가기 대응)
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (!document.hidden && isLoggedIn && !authLoading) {
        try {
          const cells = await mandalartAPI.fetchUserCellsWithChildrenOptimized();
          
          // 생성 시간 기준으로 정렬 (최신순)
          const sortedCells = [...cells].sort((a, b) => {
            const dateA = new Date(a.createdAt || 0).getTime();
            const dateB = new Date(b.createdAt || 0).getTime();
            return dateB - dateA; // 내림차순 (최신이 먼저)
          });
          
          setRootCells(sortedCells);
          cellCache.populateFromRootCells(sortedCells);
        } catch (err) {
          console.error('포커스 시 데이터 새로고침 실패:', err);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isLoggedIn, authLoading]);

  // 새 만다라트 생성 처리
  const handleCreateMandalart = async (title: string) => {
    try {
      // 추가 인증 체크
      if (!user || !isLoggedIn) {
        toast.error('로그인이 필요합니다');
        router.push('/auth/login');
        return;
      }

      setIsLoading(true);
      
      console.log('만다라트 생성 시작:', { title, userId: user.id });
      
      const rootCellId = await mandalartAPI.createMandalart(title);
      console.log('만다라트 생성 완료:', rootCellId);

      // 새로운 셀을 포함한 최신 목록 조회
      const updatedCells = await mandalartAPI.fetchUserCellsWithChildrenOptimized();
      
      // 새로 생성된 셀을 맨 앞으로 정렬
      const newCell = updatedCells.find(cell => cell.id === rootCellId);
      if (newCell) {
        const otherCells = updatedCells.filter(cell => cell.id !== rootCellId);
        const reorderedCells = [newCell, ...otherCells];
        setRootCells(reorderedCells);
        
        // 캐시도 업데이트
        cellCache.populateFromRootCells(reorderedCells);
      } else {
        setRootCells(updatedCells);
        cellCache.populateFromRootCells(updatedCells);
      }

      toast.success('만다라트가 성공적으로 생성되었습니다');
      
      // 생성 후 해당 셀 페이지로 이동
      router.push(`/app/cell/${rootCellId}`);
    } catch (err) {
      console.error('만다라트 생성 오류:', err);
      
      // 더 구체적인 에러 메시지 제공
      if (err instanceof Error) {
        if (err.message.includes('인증')) {
          toast.error('로그인이 만료되었습니다. 다시 로그인해주세요');
          router.push('/auth/login');
        } else {
          toast.error(`만다라트 생성 실패: ${err.message}`);
        }
      } else {
        toast.error('만다라트 생성에 실패했습니다');
      }
      
      setIsLoading(false);
    }
  };

  // 만다라트 삭제 다이얼로그 표시
  const openDeleteDialog = (cellId: string, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setCellToDelete(cellId);
    setDeleteDialogOpen(true);
  };

  // 만다라트 삭제 처리
  const confirmDelete = async () => {
    if (!cellToDelete) return;

    try {
      setIsLoading(true);
      setDeleteDialogOpen(false);
      
      // 해당 셀의 완전한 정보 찾기
      const cell = rootCells.find(cell => cell.id === cellToDelete);
      if (!cell) {
        toast.error('삭제할 셀을 찾을 수 없습니다');
        setIsLoading(false);
        return;
      }

      // 만다라트 ID를 결정 (셀의 mandalartId가 있으면 그것을 사용, 없으면 셀 ID)
      const mandalartId = cell.mandalartId || cell.id;
      
      // 만다라트 삭제 API 호출
      await mandalartAPI.deleteMandalart(mandalartId);
      
      // 삭제 후 목록 갱신
      const updatedCells = await mandalartAPI.fetchUserCells();
      setRootCells(updatedCells);
      
      toast.success('만다라트가 성공적으로 삭제되었습니다');
      
    } catch (err) {
      console.error('만다라트 삭제 오류:', err);
      toast.error('만다라트 삭제에 실패했습니다');
    } finally {
      setIsLoading(false);
      setCellToDelete(null);
    }
  };

  // 인증 로딩 중이거나 데이터 로딩 중일 때 스켈레톤 표시
  if (authLoading || isLoading) {
    return (
      <PageTransition>
        <MobileLayout
          header={<div className="hidden sm:block"><AppHeaderBar /></div>}
          footer={<div className="sm:hidden"><BottomBar /></div>}
        >
          <HomePageSkeleton />
        </MobileLayout>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <MobileLayout
        header={<div className="hidden sm:block"><AppHeaderBar /></div>}
        footer={<div className="sm:hidden"><BottomBar /></div>}
      >
      {rootCells.length === 0 ? (
        // 빈 상태 개선
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-md"
          >
            {/* 빈 상태 일러스트 */}
            <div className="w-32 h-32 mx-auto mb-8 relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full opacity-20"></div>
              <div className="absolute inset-4 bg-gradient-to-br from-blue-500 to-purple-700 rounded-full opacity-30"></div>
              <div className="absolute inset-8 bg-gradient-to-br from-blue-600 to-purple-800 rounded-full opacity-40"></div>
              <div className="absolute inset-12 bg-gradient-to-br from-blue-700 to-purple-900 rounded-full"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <svg className="w-16 h-16 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              만다라트 여정을 시작해보세요
            </h2>
            <p className="text-gray-600 mb-8 leading-relaxed">
              목표를 세분화하고 체계적으로 관리할 수 있는 <br />
              강력한 만다라트 도구입니다
            </p>
            
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                onClick={() => handleCreateMandalart('첫 만다라트')}
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                첫 만다라트 만들기
              </Button>
            </motion.div>
          </motion.div>
        </div>
      ) : (
        <div className="absolute inset-0">
          {/* 프리미엄 만다라트 카드 슬라이더 */}
          <PremiumMandalartCardSlider
            cells={rootCells}
            onDelete={openDeleteDialog}
            onEdit={() => {
              // TODO: 편집 기능 구현
            }}
            onCreateNew={handleCreateMandalart}
          />
        </div>
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>만다라트 삭제</AlertDialogTitle>
            <AlertDialogDescription>
              이 만다라트를 삭제하시겠습니까? 삭제 후에는 복구할 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>삭제</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      </MobileLayout>
    </PageTransition>
  );
}
