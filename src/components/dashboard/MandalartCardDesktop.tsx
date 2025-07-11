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
  Edit3,
  Trash2,
  Star,
  BarChart3,
  Clock,
  Copy,
  Share,
  Archive,
  Download,
  Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface MandalartCardDesktopProps {
  cell: MandalartCell;
  index: number;
  onDelete: (cellId: string, event: React.MouseEvent) => void;
  onEdit?: (cellId: string) => void;
}

const MandalartCardDesktop: React.FC<MandalartCardDesktopProps> = ({ 
  cell, 
  index, 
  onDelete,
  onEdit 
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showActions, setShowActions] = useState(false);

  // 진행률 계산 (실제 데이터 사용)
  const progress = cell.progressInfo?.progressPercentage || 0;
  const completedTasks = cell.progressInfo?.completedCells || 0;
  const totalTasks = cell.progressInfo?.totalCells || 0;
  
  // 안정적인 가상 데이터 (셀 ID 기반으로 고정값 생성)
  const cellIdHash = cell.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const daysLeft = (cellIdHash % 30) + 1;
  const priorityIndex = cellIdHash % 3;
  const priority = ['높음', '보통', '낮음'][priorityIndex];

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

  const priorityColors = {
    '높음': 'text-red-600 bg-red-50',
    '보통': 'text-yellow-600 bg-yellow-50',
    '낮음': 'text-green-600 bg-green-50'
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
      진행률: cell.progressInfo?.progressPercentage || 0
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
      initial={{ opacity: 0, y: 30, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        duration: 0.6,
        delay: index * 0.15,
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
      whileHover={{
        y: -12,
        scale: 1.02,
        transition: { duration: 0.3, ease: "easeOut" }
      }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="group relative"
    >
      <div className={cn(
        "relative overflow-hidden rounded-3xl bg-white transition-all duration-500",
        "border border-gray-100 hover:border-gray-200",
        "shadow-lg hover:shadow-2xl",
        isHovered && "shadow-xl"
      )}
      style={{
        boxShadow: isHovered 
          ? `0 25px 50px -12px ${theme.shadow}, 0 0 0 1px ${theme.light}` 
          : undefined
      }}>
        
        {/* 헤더 섹션 */}
        <div className="relative h-32 overflow-hidden">
          {/* 배경 그라디언트 */}
          <div 
            className="absolute inset-0"
            style={{ background: theme.gradient }}
          />
          
          {/* 기하학적 패턴 */}
          <div className="absolute inset-0 opacity-10">
            <svg viewBox="0 0 200 200" className="w-full h-full">
              <defs>
                <pattern id={`grid-${cell.id}`} width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="white" strokeWidth="0.5"/>
                </pattern>
              </defs>
              <rect width="200" height="200" fill={`url(#grid-${cell.id})`}/>
              <circle cx="100" cy="100" r="60" fill="none" stroke="white" strokeWidth="1" opacity="0.3"/>
              <circle cx="100" cy="100" r="40" fill="none" stroke="white" strokeWidth="0.5" opacity="0.5"/>
              <circle cx="100" cy="100" r="20" fill="none" stroke="white" strokeWidth="0.5" opacity="0.7"/>
            </svg>
          </div>

          {/* 상단 액션 바 */}
          <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
              {/* 상태 배지 */}
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.1 + 0.3 }}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-md"
              >
                {cell.isCompleted ? (
                  <CheckCircle2 size={14} className="text-white" />
                ) : (
                  <Circle size={14} className="text-white" />
                )}
                <span className="text-xs text-white font-medium">
                  {cell.isCompleted ? '완료' : '진행중'}
                </span>
              </motion.div>

              {/* 우선순위 배지 */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.1 + 0.4 }}
                className={cn(
                  "px-2 py-1 rounded-full text-xs font-medium bg-white/90 backdrop-blur-sm",
                  priorityColors[priority as keyof typeof priorityColors]
                )}
              >
                {priority}
              </motion.div>
            </div>

            {/* 액션 버튼들 */}
            <div className="flex items-center gap-2">
              {/* 삭제 버튼 */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => onDelete(cell.id, e)}
                className="w-8 h-8 rounded-full bg-red-500/20 backdrop-blur-sm text-white hover:bg-red-500/30 transition-colors duration-200 flex items-center justify-center"
              >
                <Trash2 size={14} />
              </motion.button>

              {/* 액션 메뉴 */}
              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowActions(!showActions)}
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
                      className="absolute right-0 top-10 w-44 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-10"
                    >
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit?.(cell.id);
                          setShowActions(false);
                        }}
                        className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-gray-700"
                      >
                        <Edit3 size={14} />
                        편집
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopyMandalart();
                          setShowActions(false);
                        }}
                        className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-gray-700"
                      >
                        <Copy size={14} />
                        데이터 복사
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleShareMandalart();
                          setShowActions(false);
                        }}
                        className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-gray-700"
                      >
                        <Share size={14} />
                        공유하기
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleFavorite();
                          setShowActions(false);
                        }}
                        className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-gray-700"
                      >
                        <Star size={14} />
                        즐겨찾기
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewAnalytics();
                          setShowActions(false);
                        }}
                        className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-gray-700"
                      >
                        <BarChart3 size={14} />
                        통계 보기
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleExportData();
                          setShowActions(false);
                        }}
                        className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-gray-700"
                      >
                        <Download size={14} />
                        내보내기
                      </button>
                      <div className="border-t border-gray-100 my-1"></div>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleArchiveMandalart();
                          setShowActions(false);
                        }}
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
          </div>

          {/* 진행률 원형 차트 */}
          <div className="absolute bottom-4 right-4">
            <div className="relative w-12 h-12">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 42 42">
                <circle
                  cx="21"
                  cy="21"
                  r="15.915"
                  fill="transparent"
                  stroke="rgba(255,255,255,0.2)"
                  strokeWidth="2"
                />
                <motion.circle
                  cx="21"
                  cy="21"
                  r="15.915"
                  fill="transparent"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeDasharray="100"
                  initial={{ strokeDashoffset: 100 }}
                  animate={{ strokeDashoffset: 100 - progress }}
                  transition={{ duration: 1.5, delay: index * 0.1 + 0.5 }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-bold text-white">{progress}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* 메인 콘텐츠 */}
        <Link href={`/app/cell/${cell.id}`} prefetch={true}>
          <div className="p-6 space-y-5">
            {/* 제목과 설명 */}
            <div>
              <h3 className="text-xl font-bold text-gray-900 line-clamp-2 group-hover:text-gray-700 transition-colors">
                {cell.topic || '새 만다라트'}
              </h3>
              {cell.memo && (
                <p className="text-gray-600 mt-2 line-clamp-2 text-sm leading-relaxed">
                  {cell.memo}
                </p>
              )}
            </div>

            {/* 통계 그리드 */}
            <div className="grid grid-cols-4 gap-4">
              <div className="text-center p-3 rounded-xl" style={{ backgroundColor: theme.light }}>
                <Target size={16} className="mx-auto mb-1" style={{ color: theme.primary }} />
                <div className="text-lg font-bold text-gray-900">{totalTasks}</div>
                <div className="text-xs text-gray-500">총 목표</div>
              </div>
              <div className="text-center p-3 rounded-xl bg-green-50">
                <CheckCircle2 size={16} className="mx-auto mb-1 text-green-600" />
                <div className="text-lg font-bold text-green-600">{completedTasks}</div>
                <div className="text-xs text-gray-500">완료</div>
              </div>
              <div className="text-center p-3 rounded-xl bg-orange-50">
                <Clock size={16} className="mx-auto mb-1 text-orange-600" />
                <div className="text-lg font-bold text-orange-600">{daysLeft}</div>
                <div className="text-xs text-gray-500">일 남음</div>
              </div>
              <div className="text-center p-3 rounded-xl bg-blue-50">
                <TrendingUp size={16} className="mx-auto mb-1 text-blue-600" />
                <div className="text-lg font-bold text-blue-600">+{Math.max(Math.floor(progress/10), 1)}</div>
                <div className="text-xs text-gray-500">이번 주</div>
              </div>
            </div>

            {/* 진행률 바 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 font-medium">전체 진행률</span>
                <span className="font-bold" style={{ color: theme.primary }}>{progress}%</span>
              </div>
              
              <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                <motion.div 
                  className="h-full rounded-full"
                  style={{ background: theme.gradient }}
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 1.2, delay: index * 0.1 + 0.6 }}
                />
              </div>
            </div>

            {/* 하단 메타 정보 */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Calendar size={14} />
                <span>최근 {(cellIdHash % 7) + 1}일 전</span>
              </div>
              <div className="flex items-center gap-1">
                <Star size={14} className="text-yellow-400 fill-current" />
                <span className="text-sm text-gray-600">즐겨찾기</span>
              </div>
            </div>
          </div>
        </Link>

        {/* 호버 효과 오버레이 */}
        <motion.div 
          className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black/5 pointer-events-none rounded-3xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        />
      </div>
    </motion.div>
  );
};

export default MandalartCardDesktop;