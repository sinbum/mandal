'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { mandalartAPI } from '@/services/mandalartService';
import { MandalartCell } from '@/types/mandalart';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { SupabaseClient, User } from '@supabase/supabase-js';
import { Trash } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
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
  }, []);

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
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">목록</h1>
        {user && (
          <Button onClick={handleLogout}>
            로그아웃
          </Button>
        )}
        <Button
          onClick={() => setCreateDialogOpen(true)}
        >
          새 만다라트 만들기
        </Button>
      </div>

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
    </div>
  );
}
