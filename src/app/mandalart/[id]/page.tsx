'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useRouter } from 'next/navigation';

import MandalartGrid from '@/components/mandalart/MandalartGrid';
import CellEditorForm from '@/components/mandalart/CellEditorForm';
import HeaderBar from '@/components/layout/HeaderBar';
import MobileLayout from '@/components/layout/MobileLayout';
import SlideUpPanel from '@/components/ui/SlideUpPanel';

import useMandalart from '@/hooks/useMandalart';
import { MandalartCell } from '@/types/mandalart';

export default function MandalartEditorPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  
  const [selectedCell, setSelectedCell] = useState<MandalartCell | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  
  // useMandalart 훅 사용
  const { mandalart, isLoading, error, updateCell } = useMandalart(id);

  // 디버깅용 로그
  useEffect(() => {
    console.log('ID:', id);
    console.log('isLoading:', isLoading);
    console.log('error:', error);
    console.log('mandalart:', mandalart);
  }, [id, isLoading, error, mandalart]);

  // 셀 클릭 시 편집 패널 열기
  const handleCellClick = (cellId: string) => {
    if (!mandalart) return;
    
    // 해당 ID의 셀 찾기
    let cell: MandalartCell | undefined;
    
    // 중앙 블록 확인
    if (cellId === mandalart.centerBlock.centerCell.id) {
      cell = mandalart.centerBlock.centerCell;
    } else {
      // 중앙 블록의 주변 셀 확인
      const centerSurroundingCell = mandalart.centerBlock.surroundingCells.find(c => c.id === cellId);
      if (centerSurroundingCell) {
        cell = centerSurroundingCell;
      } else {
        // 주변 블록 확인
        for (const block of mandalart.surroundingBlocks) {
          if (cellId === block.centerCell.id) {
            cell = block.centerCell;
            break;
          }
          
          const surroundingCell = block.surroundingCells.find(c => c.id === cellId);
          if (surroundingCell) {
            cell = surroundingCell;
            break;
          }
        }
      }
    }
    
    if (cell) {
      setSelectedCell(cell);
      setIsEditorOpen(true);
    }
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
    router.push('/dashboard');
  };

  const header = (
    <HeaderBar 
      title={mandalart?.title || '만다라트'} 
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
          <p className="text-gray-600">만다라트를 불러오는 중입니다...</p>
        </div>
      </MobileLayout>
    );
  }

  if (error || !mandalart) {
    return (
      <MobileLayout
        header={<HeaderBar title="오류" showBackButton onBackClick={handleBackClick} />}
        className="bg-gray-50"
      >
        <div className="flex flex-col items-center justify-center h-full p-4">
          <p className="text-red-500 font-medium">만다라트를 불러오는데 실패했습니다.</p>
          <p className="text-sm text-gray-500 mt-2">{error}</p>
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
        <div className="w-full max-w-4xl mx-auto">
          <MandalartGrid
            mandalart={mandalart}
            onCellClick={handleCellClick}
            className="w-full aspect-square"
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