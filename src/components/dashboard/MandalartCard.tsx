'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
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
  Copy,
  Share,
  Star,
  BarChart3,
  Archive,
  Download
} from 'lucide-react';
import { toast } from 'sonner';

interface MandalartCardProps {
  cell: MandalartCell;
  index: number;
  onDelete: (cellId: string, event: React.MouseEvent) => void;
  onEdit?: (cellId: string) => void;
}

const MandalartCard: React.FC<MandalartCardProps> = ({ cell, index, onDelete, onEdit }) => {
  const [showActions, setShowActions] = useState(false);

  // 진행률 계산 (실제 데이터 사용)
  const progress = cell.progressInfo?.progressPercentage || 0;
  const completedTasks = cell.progressInfo?.completedCells || 0;
  const totalTasks = cell.progressInfo?.totalCells || 0;

  // 색상 테마 결정
  const getThemeColors = (color?: string) => {
    if (color) {
      return {
        primary: color,
        light: `${color}20`,
        gradient: `linear-gradient(135deg, ${color} 0%, ${color}80 100%)`
      };
    }

    // 기본 테마들
    const themes = [
      { primary: '#6366f1', light: '#6366f120', gradient: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' },
      { primary: '#06b6d4', light: '#06b6d420', gradient: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)' },
      { primary: '#10b981', light: '#10b98120', gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' },
      { primary: '#f59e0b', light: '#f59e0b20', gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' },
      { primary: '#ef4444', light: '#ef444420', gradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' }
    ];

    return themes[index % themes.length];
  };

  const theme = getThemeColors(cell.color);

  const handleMenuAction = (action: string, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setShowActions(false);

    switch (action) {
      case 'edit':
        window.location.href = `/app/cell/${cell.id}`;
        break;
      case 'copy':
        handleCopyMandalart();
        break;
      case 'share':
        handleShareMandalart();
        break;
      case 'favorite':
        handleToggleFavorite();
        break;
      case 'analytics':
        handleViewAnalytics();
        break;
      case 'export':
        handleExportData();
        break;
      case 'archive':
        handleArchiveMandalart();
        break;
      case 'delete':
        onDelete(cell.id, event);
        break;
    }
  };

  const handleCopyMandalart = () => {
    const mandalartData = {
      id: cell.id,
      topic: cell.topic,
      memo: cell.memo,
      progress: cell.progressInfo
    };
    
    navigator.clipboard.writeText(JSON.stringify(mandalartData, null, 2))
      .then(() => {
        toast.success('만다라트 데이터가 클립보드에 복사되었습니다');
      })
      .catch(() => {
        toast.error('복사에 실패했습니다');
      });
  };

  const handleShareMandalart = async () => {
    const shareData = {
      title: `만다라트: ${cell.topic}`,
      text: `${cell.topic} - 진행률: ${cell.progressInfo?.progressPercentage || 0}%`,
      url: `${window.location.origin}/app/cell/${cell.id}`
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        toast.success('공유가 완료되었습니다');
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          toast.error('공유에 실패했습니다');
        }
      }
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(shareData.url)
        .then(() => {
          toast.success('링크가 클립보드에 복사되었습니다');
        })
        .catch(() => {
          toast.error('공유에 실패했습니다');
        });
    }
  };

  const handleToggleFavorite = () => {
    const favorites = JSON.parse(localStorage.getItem('favoriteMandalarts') || '[]');
    const isFavorite = favorites.includes(cell.id);
    
    if (isFavorite) {
      const newFavorites = favorites.filter((id: string) => id !== cell.id);
      localStorage.setItem('favoriteMandalarts', JSON.stringify(newFavorites));
      toast.success('즐겨찾기에서 제거되었습니다');
    } else {
      favorites.push(cell.id);
      localStorage.setItem('favoriteMandalarts', JSON.stringify(favorites));
      toast.success('즐겨찾기에 추가되었습니다');
    }
  };

  const handleViewAnalytics = () => {
    const analyticsData = {
      총목표: cell.progressInfo?.totalCells || 0,
      완료된목표: cell.progressInfo?.completedCells || 0,
      진행률: cell.progressInfo?.progressPercentage || 0,
      생성일: '최근 생성됨',
      마지막수정: '최근 수정됨'
    };

    toast.info(
      `📊 ${cell.topic} 통계\n` +
      `진행률: ${analyticsData.진행률}%\n` +
      `완료: ${analyticsData.완료된목표}/${analyticsData.총목표}`,
      { duration: 4000 }
    );
  };

  const handleExportData = () => {
    const exportData = {
      id: cell.id,
      topic: cell.topic,
      memo: cell.memo,
      color: cell.color,
      isCompleted: cell.isCompleted,
      depth: cell.depth,
      position: cell.position,
      progressInfo: cell.progressInfo,
      exportedAt: new Date().toISOString()
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `mandalart-${cell.topic.replace(/[^\w\s]/gi, '')}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success('만다라트 데이터가 다운로드되었습니다');
  };

  const handleArchiveMandalart = () => {
    const archived = JSON.parse(localStorage.getItem('archivedMandalarts') || '[]');
    
    if (!archived.includes(cell.id)) {
      archived.push(cell.id);
      localStorage.setItem('archivedMandalarts', JSON.stringify(archived));
      toast.success('만다라트가 보관되었습니다');
    } else {
      toast.info('이미 보관된 만다라트입니다');
    }
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
            {/* 삭제 버튼 */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => onDelete(cell.id, e)}
              className="w-8 h-8 rounded-full bg-red-500/20 backdrop-blur-sm text-white hover:bg-red-500/30 transition-colors duration-200 flex items-center justify-center"
            >
              <Trash2 size={14} />
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
                      편집하기
                    </button>
                    <button
                      onClick={(e) => handleMenuAction('copy', e)}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-gray-700"
                    >
                      <Copy size={14} />
                      데이터 복사
                    </button>
                    <button
                      onClick={(e) => handleMenuAction('share', e)}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-gray-700"
                    >
                      <Share size={14} />
                      공유하기
                    </button>
                    <button
                      onClick={(e) => handleMenuAction('favorite', e)}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-gray-700"
                    >
                      <Star size={14} />
                      즐겨찾기
                    </button>
                    <button
                      onClick={(e) => handleMenuAction('analytics', e)}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-gray-700"
                    >
                      <BarChart3 size={14} />
                      통계 보기
                    </button>
                    <button
                      onClick={(e) => handleMenuAction('export', e)}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-gray-700"
                    >
                      <Download size={14} />
                      내보내기
                    </button>
                    <div className="border-t border-gray-100 my-1"></div>
                    <button
                      onClick={(e) => handleMenuAction('archive', e)}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-orange-600"
                    >
                      <Archive size={14} />
                      보관하기
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* 상태 배지 */}
          <div className="absolute top-3 left-3">
            <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-white/20 backdrop-blur-sm">
              {cell.isCompleted ? (
                <CheckCircle2 size={12} className="text-white" />
              ) : (
                <Circle size={12} className="text-white" />
              )}
              <span className="text-xs text-white font-medium">
                {cell.isCompleted ? '완료' : '진행중'}
              </span>
            </div>
          </div>
        </div>

        {/* 메인 콘텐츠 */}
        <Link href={`/app/cell/${cell.id}`} className="block">
          <div className="p-6 space-y-4">
            {/* 제목 */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 line-clamp-2 group-hover:text-gray-700 transition-colors">
                {cell.topic || '새 만다라트'}
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
                  <span className="text-gray-600">진행률</span>
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
                <span>{completedTasks}/{totalTasks} 완료</span>
                <div className="flex items-center gap-1">
                  <TrendingUp size={12} />
                  <span>목표 달성 중</span>
                </div>
              </div>
            </div>

            {/* 통계 카드 */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              <div className="text-center">
                <div className="text-lg font-bold text-gray-900">{totalTasks}</div>
                <div className="text-xs text-gray-500">목표</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold" style={{ color: theme.primary }}>{completedTasks}</div>
                <div className="text-xs text-gray-500">완료</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-orange-500">{totalTasks - completedTasks}</div>
                <div className="text-xs text-gray-500">남은</div>
              </div>
            </div>
          </div>
        </Link>

        {/* 하단 액션 영역 */}
        <div className="px-6 pb-4">
          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Calendar size={12} />
              <span>최근 업데이트</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: theme.primary }}></div>
              <span className="text-xs text-gray-500">활성</span>
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