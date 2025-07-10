'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { mandalartAPI } from '@/services/mandalartService';
import { MandalartCell } from '@/types/mandalart';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';

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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel
} from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import MobileLayout from '@/components/layout/MobileLayout';
import BottomBar from '@/components/layout/BottomBar';
import AppHeaderBar from '@/components/layout/AppHeaderBar';
import PageTransition from '@/components/animations/PageTransition';
import MandalartCard from '@/components/dashboard/MandalartCard';
import MandalartCardDesktop from '@/components/dashboard/MandalartCardDesktop';
/**
 * 홈 페이지 컴포넌트
 * 사용자가 가진 만다라트 루트 셀 목록 표시
 */
export default function HomePage() {
  const [rootCells, setRootCells] = useState<MandalartCell[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [cellToDelete, setCellToDelete] = useState<string | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const createForm = useForm({
    defaultValues: {
      title: '새 만다라트'
    }
  });

  const router = useRouter();

  // 루트 셀 로드
  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        const cells = await mandalartAPI.fetchUserCells();
        setRootCells(cells);
      } catch (err) {
        console.error('데이터 로드 오류:', err);
        toast.error('만다라트 목록을 불러오는데 실패했습니다');
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // 새 만다라트 생성 처리
  const handleCreateMandalart = async (data: { title: string }) => {
    try {
      setIsLoading(true);
      setCreateDialogOpen(false);
      
      const title = data.title || '새 만다라트';
      const rootCellId = await mandalartAPI.createMandalart(title);

      toast.success('만다라트가 성공적으로 생성되었습니다');
      
      // 생성 후 해당 셀 페이지로 이동
      window.location.href = `/app/cell/${rootCellId}`;
    } catch (err) {
      console.error('만다라트 생성 오류:', err);
      toast.error('만다라트 생성에 실패했습니다');
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

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <PageTransition>
      <MobileLayout
        header={<AppHeaderBar onCreateMandalart={() => setCreateDialogOpen(true)} />}
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
                onClick={() => setCreateDialogOpen(true)}
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                첫 만다라트 만들기
              </Button>
            </motion.div>
          </motion.div>
        </div>
      ) : (
        <div className="px-4 sm:px-6 lg:px-8 pb-24 sm:pb-8">
          {/* 섹션 헤더 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-2">내 만다라트</h2>
            <p className="text-gray-600">목표 달성을 위한 체계적인 계획을 확인하세요</p>
          </motion.div>

          {/* 모바일 카드 그리드 */}
          <div className="block sm:hidden">
            <div className="space-y-4">
              {rootCells.slice(0, 6).map((cell, index) => (
                <MandalartCard
                  key={cell.id}
                  cell={cell}
                  index={index}
                  onDelete={openDeleteDialog}
                  onEdit={(cellId) => {
                    // 편집 기능 추후 구현
                    console.log('Edit cell:', cellId);
                  }}
                />
              ))}
            </div>
          </div>

          {/* 태블릿 카드 그리드 */}
          <div className="hidden sm:block lg:hidden">
            <div className="grid grid-cols-2 gap-6">
              {rootCells.slice(0, 6).map((cell, index) => (
                <MandalartCard
                  key={cell.id}
                  cell={cell}
                  index={index}
                  onDelete={openDeleteDialog}
                  onEdit={(cellId) => {
                    // 편집 기능 추후 구현
                    console.log('Edit cell:', cellId);
                  }}
                />
              ))}
            </div>
          </div>

          {/* 데스크톱 카드 그리드 */}
          <div className="hidden lg:block">
            <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-8 max-w-none">
              {rootCells.slice(0, 9).map((cell, index) => (
                <MandalartCardDesktop
                  key={cell.id}
                  cell={cell}
                  index={index}
                  onDelete={openDeleteDialog}
                  onEdit={(cellId) => {
                    // 편집 기능 추후 구현
                    console.log('Edit cell:', cellId);
                  }}
                />
              ))}
            </div>
          </div>
          
          {/* 더 보기 섹션 */}
          {rootCells.length > 6 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="mt-12 text-center"
            >
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  더 많은 만다라트가 있습니다
                </h3>
                <p className="text-gray-600 mb-4">
                  총 {rootCells.length}개 중 {Math.min(rootCells.length, 9)}개를 표시하고 있습니다
                </p>
                <Button
                  variant="outline"
                  className="border-gray-300 hover:border-gray-400"
                >
                  모두 보기
                </Button>
              </div>
            </motion.div>
          )}
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

      <AlertDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>새 만다라트 만들기</AlertDialogTitle>
            <AlertDialogDescription>
              새 만다라트의 제목을 입력해주세요.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <Form {...createForm}>
            <form onSubmit={createForm.handleSubmit(handleCreateMandalart)} className="space-y-4">
              <FormField
                control={createForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>제목</FormLabel>
                    <FormControl>
                      <Input placeholder="새 만다라트" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <AlertDialogFooter>
                <AlertDialogCancel>취소</AlertDialogCancel>
                <AlertDialogAction type="submit">생성</AlertDialogAction>
              </AlertDialogFooter>
            </form>
          </Form>
        </AlertDialogContent>
      </AlertDialog>
      </MobileLayout>
    </PageTransition>
  );
}
