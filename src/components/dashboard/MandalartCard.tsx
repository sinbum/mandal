'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { MandalartCell } from '@/types/mandalart';
import {
  MoreVertical,
  Target,
  CheckCircle2,
  Circle,
  Calendar,
  TrendingUp,
  Trash2,
  Edit3,
  Star
} from 'lucide-react';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

interface MandalartCardProps {
  cell: MandalartCell;
  index: number;
  onDelete: (cellId: string, event: React.MouseEvent) => void;
  onEdit?: (cellId: string) => void;
}

const MandalartCard: React.FC<MandalartCardProps> = ({ cell, index, onDelete, onEdit }) => {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const [showActions, setShowActions] = useState(false);
  const t = useTranslations('mandalart');

  // 색상 테마
  const getThemeColors = (color?: string) => {
    if (color) {
      return {
        primary: color,
        light: `${color}15`,
        gradient: `linear-gradient(135deg, ${color} 0%, ${color}90 100%)`,
        shadow: `${color}40`
      };
    }
    
    const themes = [
      { 
        primary: '#6366f1', 
        light: '#6366f115', 
        gradient: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
        shadow: '#6366f140'
      },
      { 
        primary: '#06b6d4', 
        light: '#06b6d415', 
        gradient: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
        shadow: '#06b6d440'
      },
      { 
        primary: '#10b981', 
        light: '#10b98115', 
        gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        shadow: '#10b98140'
      },
      { 
        primary: '#f59e0b', 
        light: '#f59e0b15', 
        gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
        shadow: '#f59e0b40'
      }
    ];
    
    return themes[index % themes.length];
  };

  const theme = getThemeColors(cell.color);

  // 메뉴 액션 핸들러
  const handleMenuAction = (action: string, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setShowActions(false);
    
    if (action === 'edit' && onEdit) {
      onEdit(cell.id);
    } else if (action === 'delete') {
      onDelete(cell.id, event);
    }
  };

  // 즐겨찾기 토글
  const handleToggleFavorite = () => {
    const favorites = JSON.parse(localStorage.getItem('favoriteMandalarts') || '[]');
    const isFavorite = favorites.includes(cell.id);
    
    if (isFavorite) {
      const newFavorites = favorites.filter((id: string) => id !== cell.id);
      localStorage.setItem('favoriteMandalarts', JSON.stringify(newFavorites));
      toast.success(t('mandalart.favorites.removed'));
    } else {
      favorites.push(cell.id);
      localStorage.setItem('favoriteMandalarts', JSON.stringify(favorites));
      toast.success(t('mandalart.favorites.added'));
    }
  };

  // 진행률 계산 (실제 데이터 사용)
  const progress = cell.progressInfo?.progressPercentage || 0;
  const completedTasks = cell.progressInfo?.completedCells || 0;
  const totalTasks = cell.progressInfo?.totalCells || 0;

  // 날짜 포맷팅 (가상 데이터)
  const formatDate = () => {
    const cellIdHash = cell.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const daysAgo = (cellIdHash % 30) + 1;
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    return date.toLocaleDateString(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.5,
        delay: index * 0.1,
        ease: "easeOut"
      }}
      whileHover={{
        y: -8,
        scale: 1.02,
        transition: { duration: 0.2 }
      }}
      whileTap={{
        scale: 0.98,
        transition: { duration: 0.1 }
      }}
      className="group"
    >
      <div className="relative overflow-hidden rounded-2xl bg-white shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100">
        {/* 헤더 그라디언트 */}
        <div
          className="h-24 relative"
          style={{ background: theme.gradient }}
        >
          {/* 만다라트 패턴 오버레이 */}
          <div className="absolute inset-0 opacity-20">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <defs>
                <pattern id={`mandala-${cell.id}`} x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                  <circle cx="10" cy="10" r="1" fill="white" opacity="0.5" />
                </pattern>
              </defs>
              <rect width="100" height="100" fill={`url(#mandala-${cell.id})`} />
            </svg>
          </div>

          {/* 액션 버튼들 */}
          <div className="absolute top-3 right-3 flex gap-2">
            {/* 즐겨찾기 버튼 */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleToggleFavorite();
              }}
              className="w-8 h-8 rounded-full bg-yellow-500/20 backdrop-blur-sm text-white hover:bg-yellow-500/30 transition-colors duration-200 flex items-center justify-center"
            >
              <Star size={14} />
            </motion.button>

            {/* 메뉴 드롭다운 */}
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowActions(!showActions);
                }}
                className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-colors duration-200 flex items-center justify-center"
              >
                <MoreVertical size={14} />
              </motion.button>

              {/* 드롭다운 메뉴 */}
              <AnimatePresence>
                {showActions && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    className="absolute right-0 top-10 w-44 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-20"
                  >
                    <button
                      onClick={(e) => handleMenuAction('edit', e)}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-gray-700"
                    >
                      <Edit3 size={14} />
                      {t('board.edit')}
                    </button>
                    <div className="border-t border-gray-100 my-1"></div>
                    <button
                      onClick={(e) => handleMenuAction('delete', e)}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-red-600"
                    >
                      <Trash2 size={14} />
                      {t('board.delete')}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="absolute top-3 left-3">
            <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-white/20 backdrop-blur-sm">
              {cell.isCompleted ? (
                <CheckCircle2 size={12} className="text-white" />
              ) : (
                <Circle size={12} className="text-white" />
              )}
              <span className="text-xs text-white font-medium">
                {cell.isCompleted ? t('cell.completed') : t('cell.inProgress')}
              </span>
            </div>
          </div>
        </div>

        {/* 메인 콘텐츠 */}
        <Link href={`/${locale}/app/cell/${cell.id}`} prefetch={true} className="block">
          <div className="p-6 space-y-4">
            {/* 제목 */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 line-clamp-2 group-hover:text-gray-700 transition-colors">
                {cell.topic || t('board.newMandalart')}
              </h3>
              {cell.memo && (
                <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                  {cell.memo}
                </p>
              )}
            </div>

            {/* 진행률 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-1">
                  <Target size={14} className="text-gray-400" />
                  <span className="text-gray-600">{t('cell.progress')}</span>
                </div>
                <span className="font-semibold text-gray-900">{progress}%</span>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: theme.gradient }}
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 1, delay: index * 0.1 + 0.5 }}
                />
              </div>

              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>{t('cell.completedTasks', { completed: completedTasks, total: totalTasks })}</span>
                <div className="flex items-center gap-1">
                  <TrendingUp size={12} />
                  <span>{t('board.goalAchieving')}</span>
                </div>
              </div>
            </div>

            {/* 통계 카드 */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              <div className="text-center">
                <div className="text-lg font-bold text-gray-900">{totalTasks}</div>
                <div className="text-xs text-gray-500">{t('board.goals')}</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold" style={{ color: theme.primary }}>{completedTasks}</div>
                <div className="text-xs text-gray-500">{t('cell.completed')}</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-orange-500">{totalTasks - completedTasks}</div>
                <div className="text-xs text-gray-500">{t('board.remaining')}</div>
              </div>
            </div>
          </div>
        </Link>

        {/* 하단 액션 영역 */}
        <div className="px-6 pb-4">
          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Calendar size={12} />
              <span>{t('board.lastUpdated')}: {formatDate()}</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: theme.primary }}></div>
              <span className="text-xs text-gray-500">{t('active')}</span>
            </div>
          </div>
        </div>

        {/* 호버 오버레이 */}
        <div className="absolute inset-0 bg-gradient-to-t from-transparent to-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl" />
      </div>
    </motion.div>
  );
};

export default MandalartCard;