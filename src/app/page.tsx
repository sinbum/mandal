'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { mandalartAPI } from '@/services/mandalartService';
import { MandalartCell } from '@/types/mandalart';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Button } from '@/components/ui/Button';
/**
 * 홈 페이지 컴포넌트
 * 사용자가 가진 만다라트 루트 셀 목록 표시
 */
export default function HomePage() {
  const [rootCells, setRootCells] = useState<MandalartCell[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 사용자의 루트 셀 로드
  useEffect(() => {
    async function loadUserCells() {
      try {
        setIsLoading(true);
        const cells = await mandalartAPI.fetchUserCells();
        setRootCells(cells);
      } catch (err) {
        console.error('루트 셀 로드 오류:', err);
        setError('만다라트 목록을 불러오는데 실패했습니다');
      } finally {
        setIsLoading(false);
      }
    }

    loadUserCells();
  }, []);

  // 새 만다라트 생성 처리
  const handleCreateMandalart = async () => {
    try {
      const title = window.prompt('새 만다라트 제목을 입력하세요:') || '새 만다라트';

      setIsLoading(true);
      const rootCellId = await mandalartAPI.createMandalart(title);

      // 생성 후 해당 셀 페이지로 이동
      window.location.href = `/cell/${rootCellId}`;
    } catch (err) {
      console.error('만다라트 생성 오류:', err);
      setError('만다라트 생성에 실패했습니다');
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">목록</h1>
        <Button
          onClick={handleCreateMandalart}
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
          <button
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
            onClick={handleCreateMandalart}
          >
            첫 만다라트 만들기
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {rootCells.map(cell => (
            <Link
              key={cell.id}
              href={`/cell/${cell.id}`}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-4 flex flex-col"
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
              <div className="mt-auto">
                <span className="text-sm text-gray-500">
                  {cell.isCompleted ? '완료됨' : '진행 중'}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
