'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MobileLayout from '@/components/layout/MobileLayout';
import HeaderBar from '@/components/layout/HeaderBar';
import MandalartCard from '@/components/mandalart/MandalartCard';
import NewMandalartModal from '@/components/mandalart/NewMandalartModal';
import Button from '@/components/ui/Button';
import Toast from '@/components/ui/Toast';
import EmptyState from '@/components/ui/EmptyState';
import useMandalart from '@/hooks/useMandalart';

interface DashboardScreenProps {
  userName?: string;
  onLogout?: () => void;
  onNavigate?: (path: string) => void;
}

const DashboardScreen: React.FC<DashboardScreenProps> = ({
  userName = '사용자',
  onLogout,
  onNavigate,
}) => {
  const router = useRouter();
  const { fetchMandalartList, createMandalart } = useMandalart();
  
  const [mandalarts, setMandalarts] = useState<Array<{id: string, title: string, createdAt: string, updatedAt: string}>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error' | 'info' | 'warning'} | null>(null);

  // 만다라트 목록 로드
  useEffect(() => {
    let isMounted = true;
    
    const loadMandalarts = async () => {
      if (!isMounted) return;
      
      try {
        setIsLoading(true);
        const data = await fetchMandalartList();
        if (isMounted) {
          setMandalarts(data);
        }
      } catch (error) {
        if (isMounted) {
          setToast({
            message: '만다라트 목록을 불러오는데 실패했습니다.',
            type: 'error'
          });
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadMandalarts();
    
    // 클린업 함수 추가
    return () => {
      isMounted = false;
    };
  }, []); // fetchMandalartList 종속성 제거

  // 만다라트 카드 클릭 핸들러
  const handleCardClick = (id: string) => {
    if (onNavigate) {
      onNavigate(`/mandalart/${id}`);
    } else {
      router.push(`/mandalart/${id}`);
    }
  };

  // 새 만다라트 생성 핸들러
  const handleCreateMandalart = async (title: string, templateId?: string) => {
    try {
      const newId = await createMandalart(title, templateId);
      setToast({
        message: '만다라트가 생성되었습니다.',
        type: 'success'
      });
      
      // 바로 편집 페이지로 이동
      if (onNavigate) {
        onNavigate(`/mandalart/${newId}`);
      } else {
        router.push(`/mandalart/${newId}`);
      }
    } catch (error) {
      setToast({
        message: '만다라트 생성에 실패했습니다.',
        type: 'error'
      });
    }
  };

  // 로그아웃 핸들러
  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      // 기본 로그아웃 경우(onLogout이 없는 경우)는 없어야 함
      console.error('로그아웃 핸들러가 제공되지 않았습니다.');
    }
  };

  // 헤더 오른쪽 요소 (로그아웃 버튼)
  const headerRightElement = (
    <button 
      className="text-gray-600 hover:text-gray-800"
      onClick={handleLogout}
      aria-label="로그아웃"
    >
      로그아웃
    </button>
  );

  // 빈 상태 아이콘
  const emptyStateIcon = (
    <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );

  return (
    <MobileLayout
      header={<HeaderBar title={`${userName}님의 만다라트`} rightElement={headerRightElement} />}
    >
      <div className="p-4">
        {/* 새 만다라트 생성 버튼 */}
        <Button
          variant="primary"
          onClick={() => setIsModalOpen(true)}
          fullWidth
          className="mb-4"
        >
          + 새 만다라트 만들기
        </Button>

        {/* 만다라트 카드 목록 */}
        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <div className="text-gray-500">로딩 중...</div>
          </div>
        ) : mandalarts.length > 0 ? (
          <div className="grid gap-4">
            {mandalarts.map((mandalart) => (
              <MandalartCard
                key={mandalart.id}
                mandalart={mandalart}
                onClick={() => handleCardClick(mandalart.id)}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={emptyStateIcon}
            title="아직 작성한 만다라트가 없습니다"
            description="새로운 만다라트를 만들어 목표를 체계적으로 관리해보세요."
            action={
              <Button 
                variant="secondary"
                onClick={() => setIsModalOpen(true)}
              >
                첫 만다라트 만들기
              </Button>
            }
          />
        )}
      </div>

      {/* 새 만다라트 모달 */}
      <NewMandalartModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreateMandalart={handleCreateMandalart}
      />

      {/* 토스트 메시지 */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </MobileLayout>
  );
};

export default DashboardScreen; 