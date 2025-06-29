'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { mandalartAPI } from '@/services/mandalartService';
import { MandalartCell } from '@/types/mandalart';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { User } from '@supabase/supabase-js';
import { Trash } from 'lucide-react';
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
import HeaderBar from '@/components/layout/HeaderBar';
import Image from 'next/image';
import MobileLayout from '@/components/layout/MobileLayout';
import BottomBar from '@/components/layout/BottomBar';
import SlideUpPanel from '@/components/ui/SlideUpPanel';
/**
 * 홈 페이지 컴포넌트
 * 사용자가 가진 만다라트 루트 셀 목록 표시
 */
export default function HomePage() {
  const [rootCells, setRootCells] = useState<MandalartCell[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [cellToDelete, setCellToDelete] = useState<string | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const createForm = useForm({
    defaultValues: {
      title: '새 만다라트'
    }
  });

  const supabase = createClient();
  const router = useRouter();

  // 사용자 정보와 루트 셀 로드
  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        // 사용자 정보 가져오기
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);

        const cells = await mandalartAPI.fetchUserCells();
        setRootCells(cells);
      } catch (err) {
        console.error('데이터 로드 오류:', err);
        setError('만다라트 목록을 불러오는데 실패했습니다');
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

      // 생성 후 해당 셀 페이지로 이동
      window.location.href = `/cell/${rootCellId}`;
    } catch (err) {
      console.error('만다라트 생성 오류:', err);
      setError('만다라트 생성에 실패했습니다');
      setIsLoading(false);
    }
  };

  
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/auth/login');
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
        setError('삭제할 셀을 찾을 수 없습니다');
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
      
    } catch (err) {
      console.error('만다라트 삭제 오류:', err);
      setError('만다라트 삭제에 실패했습니다');
    } finally {
      setIsLoading(false);
      setCellToDelete(null);
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <MobileLayout
      header={
        <HeaderBar
          title={
            <div className="flex items-center gap-2">
              <Image src="/logo/android-chrome-192x192.png" alt="로고" width={32} height={32} className="rounded" />
              <span className="hidden sm:inline">목록</span>
            </div>
          }
          rightElement={
            <div className="flex items-center gap-2">
              {/* 데스크톱: 기존 버튼들 */}
              <div className="hidden sm:flex items-center gap-2">
                {user && (
                  <Button onClick={handleLogout} size="sm">로그아웃</Button>
                )}
                <Link href="/profile" aria-label="프로필">
                  <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-gray-500 hover:text-blue-600">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </Link>
                <button aria-label="테마 전환" className="p-1">
                  <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-gray-500 hover:text-yellow-500">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m8.66-13.66l-.71.71M4.05 19.07l-.71.71M21 12h-1M4 12H3m16.95 7.07l-.71-.71M4.05 4.93l-.71-.71M17 12a5 5 0 11-10 0 5 5 0 0110 0z" />
                  </svg>
                </button>
                <button aria-label="설정" className="p-1">
                  <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-gray-500 hover:text-green-600">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 10c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6z" />
                  </svg>
                </button>
                <Button onClick={() => setCreateDialogOpen(true)} size="sm">새 만다라트 만들기</Button>
              </div>
              {/* 모바일: 햄버거 메뉴 */}
              <button className="sm:hidden p-2" aria-label="메뉴" onClick={() => setDrawerOpen(true)}>
                <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-gray-700">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          }
        />
      }
      footer={<div className="sm:hidden"><BottomBar /></div>}
    >
      {/* FAB: 모바일에서만 노출 */}
      <button
        className="fixed bottom-20 right-4 z-50 sm:hidden bg-blue-600 text-white rounded-full shadow-lg p-4 flex items-center justify-center hover:bg-blue-700 transition-colors"
        onClick={() => setCreateDialogOpen(true)}
        aria-label="새 만다라트 만들기"
      >
        <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </button>
      {/* 햄버거 메뉴 드로어(모바일) */}
      <SlideUpPanel isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} title="메뉴">
        <div className="flex flex-col gap-4">
          {user && (
            <Button onClick={handleLogout} variant="secondary">로그아웃</Button>
          )}
          <Link href="/profile" className="flex items-center gap-2 text-gray-700 hover:text-blue-600" onClick={() => setDrawerOpen(false)}>
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            프로필
          </Link>
          <button className="flex items-center gap-2 text-gray-700 hover:text-yellow-500" aria-label="테마 전환">
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m8.66-13.66l-.71.71M4.05 19.07l-.71.71M21 12h-1M4 12H3m16.95 7.07l-.71-.71M4.05 4.93l-.71-.71M17 12a5 5 0 11-10 0 5 5 0 0110 0z" />
            </svg>
            테마 전환
          </button>
          <button className="flex items-center gap-2 text-gray-700 hover:text-green-600" aria-label="설정">
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 10c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6z" />
            </svg>
            설정
          </button>
        </div>
      </SlideUpPanel>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {rootCells.length === 0 ? (
        <div className="bg-gray-50 p-8 rounded-lg shadow text-center">
          <p className="text-lg text-gray-600 mb-4">
            아직 만다라트가 없습니다.
          </p>
          <Button
            onClick={() => setCreateDialogOpen(true)}
          >
            첫 만다라트 만들기
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {rootCells.map(cell => {
            return (
            <Link
              key={cell.id}
              href={`/cell/${cell.id}`}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-4 flex flex-col relative"
            >
              <div
                className="h-48 mb-2 rounded"
                style={{
                  backgroundColor: cell.color || '#f0f4f8',
                  backgroundImage: cell.imageUrl ? `url(${cell.imageUrl})` : undefined,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              >
                {/* 배경 오버레이 */}
                <div className="h-full w-full bg-black bg-opacity-10 flex items-center justify-center">
                  <h2 className="text-2xl font-bold text-center text-white drop-shadow-md px-2">
                    {cell.topic || '무제'}
                  </h2>
                </div>
              </div>
              <div className="mt-auto flex justify-between items-center">
                <span className="text-sm text-gray-500">
                  {cell.isCompleted ? '완료됨' : '진행 중'}
                </span>
                <Button
                  className="p-2 rounded-full text-gray-500 hover:text-red-500 hover:bg-gray-100 transition-colors"
                  onClick={(e) => openDeleteDialog(cell.id, e)}
                  aria-label="삭제"
                >
                  <Trash size={16} />
                </Button>
              </div>
            </Link>
          );
          })}
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
  );
}
