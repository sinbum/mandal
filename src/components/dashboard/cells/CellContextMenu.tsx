'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { MandalartCell } from '@/types/mandalart';
import { cn } from '@/lib/utils';

interface CellContextMenuProps {
  isOpen: boolean;
  onClose: () => void;
  cell: MandalartCell | null;
  onEdit: () => void;
  onToggleComplete: () => void;
  onDelete: () => void;
  position?: { x: number; y: number };
}

/**
 * 셀 컨텍스트 메뉴 컴포넌트
 * long press시 나타나는 액션 메뉴
 */
const CellContextMenu: React.FC<CellContextMenuProps> = ({
  isOpen,
  onClose,
  cell,
  onEdit,
  onToggleComplete,
  onDelete
}) => {
  const t = useTranslations('common');
  const tMandalart = useTranslations('mandalart');
  
  if (!cell) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const menuItems = [
    {
      icon: (
        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
        </svg>
      ),
      label: t('edit'),
      onClick: () => {
        onEdit();
        onClose();
      },
      color: 'text-blue-600 hover:bg-blue-50'
    },
    {
      icon: (
        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ),
      label: cell.isCompleted ? tMandalart('cell.markAsInProgress') : tMandalart('cell.markAsCompleted'),
      onClick: () => {
        onToggleComplete();
        onClose();
      },
      color: cell.isCompleted 
        ? 'text-orange-600 hover:bg-orange-50'
        : 'text-green-600 hover:bg-green-50'
    },
    {
      icon: (
        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      ),
      label: t('delete'),
      onClick: () => {
        onDelete();
        onClose();
      },
      color: 'text-red-600 hover:bg-red-50'
    }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleBackdropClick}
        >
          <motion.div
            className="bg-white rounded-xl shadow-xl border border-gray-200 p-1.5 sm:p-2 min-w-[180px] sm:min-w-[200px] max-w-[260px] sm:max-w-[280px] mx-4"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", duration: 0.3 }}
          >
            {/* 헤더 */}
            <div className="px-3 py-2 border-b border-gray-100">
              <h3 className="text-sm font-medium text-gray-900 truncate">
                {cell.topic || tMandalart('cell.noTitle')}
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                {tMandalart('cell.edit')}
              </p>
            </div>

            {/* 메뉴 아이템들 */}
            <div className="py-1">
              {menuItems.map((item, index) => (
                <motion.button
                  key={item.label}
                  className={cn(
                    "w-full flex items-center gap-2 sm:gap-3 px-2.5 sm:px-3 py-2 sm:py-2.5 text-left text-sm font-medium rounded-lg transition-colors",
                    item.color,
                    "focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  )}
                  onClick={item.onClick}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </motion.button>
              ))}
            </div>

            {/* 닫기 버튼 */}
            <div className="px-2 pt-1 border-t border-gray-100">
              <button
                className="w-full px-3 py-2 text-sm text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                onClick={onClose}
              >
                {t('cancel')}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CellContextMenu; 