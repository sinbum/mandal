import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import MobileLayout from '@/components/layout/MobileLayout';
import HeaderBar from '@/components/layout/HeaderBar';
import MandalartGrid from '@/components/mandalart/MandalartGrid';
import SlideUpPanel from '@/components/ui/SlideUpPanel';
import CellEditorForm from '@/components/mandalart/CellEditorForm';
import Toast from '@/components/ui/Toast';
import useMandalart from '@/hooks/useMandalart';
import { MandalartCell } from '@/types/mandalart';

const MandalartEditorPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const { mandalart, isLoading, error, updateCell } = useMandalart(id as string);
  
  const [isSlideUpOpen, setIsSlideUpOpen] = useState(false);
  const [selectedCell, setSelectedCell] = useState<MandalartCell | null>(null);
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error' | 'info' | 'warning'} | null>(null);

  // ID가 변경될 때마다 상태 초기화
  useEffect(() => {
    setIsSlideUpOpen(false);
    setSelectedCell(null);
  }, [id]);

  // 셀 클릭 핸들러
  const handleCellClick = (cellId: string) => {
    if (!mandalart) return;

    // 선택된 셀 찾기
    let foundCell: MandalartCell | null = null;

    // 중앙 블록 검사
    if (cellId === mandalart.centerBlock.centerCell.id) {
      foundCell = mandalart.centerBlock.centerCell;
    } else {
      // 중앙 블록의 주변 셀 검사
      const centerSurroundingCell = mandalart.centerBlock.surroundingCells.find(cell => cell.id === cellId);
      if (centerSurroundingCell) {
        foundCell = centerSurroundingCell;
      } else {
        // 주변 블록 검사
        for (const block of mandalart.surroundingBlocks) {
          // 블록 중앙 셀 검사
          if (block.centerCell.id === cellId) {
            foundCell = block.centerCell;
            break;
          }
          
          // 블록 주변 셀 검사
          const surroundingCell = block.surroundingCells.find(cell => cell.id === cellId);
          if (surroundingCell) {
            foundCell = surroundingCell;
            break;
          }
        }
      }
    }

    if (foundCell) {
      setSelectedCell(foundCell);
      setIsSlideUpOpen(true);
    }
  };

  // 셀 저장 핸들러
  const handleCellSave = (updatedCell: MandalartCell) => {
    if (!selectedCell) return;

    updateCell(selectedCell.id, updatedCell);
    setIsSlideUpOpen(false);
    setToast({
      message: '셀이 성공적으로 저장되었습니다.',
      type: 'success'
    });
  };

  // 뒤로가기 핸들러
  const handleBackClick = () => {
    router.push('/');
  };

  return (
    <MobileLayout
      header={
        <HeaderBar 
          title={mandalart?.title || '만다라트'} 
          showBackButton 
          onBackClick={handleBackClick} 
        />
      }
    >
      {isLoading ? (
        <div className="flex justify-center items-center h-full">
          <div className="text-gray-500">로딩 중...</div>
        </div>
      ) : error ? (
        <div className="flex flex-col justify-center items-center h-full p-4">
          <div className="text-red-500 mb-4">{error}</div>
          <button
            className="text-blue-500 hover:underline"
            onClick={handleBackClick}
          >
            대시보드로 돌아가기
          </button>
        </div>
      ) : mandalart ? (
        <MandalartGrid
          mandalart={mandalart}
          onCellClick={handleCellClick}
          className="pb-16"
        />
      ) : null}

      {/* 셀 편집 슬라이드업 */}
      {selectedCell && (
        <SlideUpPanel
          isOpen={isSlideUpOpen}
          onClose={() => setIsSlideUpOpen(false)}
          title="셀 편집"
        >
          <CellEditorForm
            cell={selectedCell}
            onSave={handleCellSave}
            onCancel={() => setIsSlideUpOpen(false)}
          />
        </SlideUpPanel>
      )}

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

export default MandalartEditorPage;
