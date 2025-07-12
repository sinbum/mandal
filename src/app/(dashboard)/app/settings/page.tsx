'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { User } from '@supabase/supabase-js';
import { toast } from 'sonner';
import MobileLayout from '@/components/layout/MobileLayout';
import BottomBar from '@/components/layout/BottomBar';
import PageTransition from '@/components/animations/PageTransition';
import { Button } from '@/components/ui/Button';
import InputField from '@/components/ui/InputField';
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
  User as UserIcon,
  Bell,
  Shield,
  Palette,
  Download,
  Trash2,
  ChevronRight,
  Moon,
  Sun
} from 'lucide-react';

interface SettingItem {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  action: () => void;
  type: 'navigate' | 'toggle' | 'action';
  value?: boolean | string;
}

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [deleteAccountModal, setDeleteAccountModal] = useState(false);
  const [profileEditModal, setProfileEditModal] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [newDisplayName, setNewDisplayName] = useState('');
  const supabase = createClient();

  useEffect(() => {
    async function loadUserData() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
        
        if (user) {
          setDisplayName(user.user_metadata?.display_name || user.email?.split('@')[0] || '사용자');
          setNewDisplayName(user.user_metadata?.display_name || user.email?.split('@')[0] || '사용자');
        }
        
        // Load settings from localStorage
        const savedDarkMode = localStorage.getItem('darkMode');
        const savedNotifications = localStorage.getItem('notifications');
        
        setDarkMode(savedDarkMode === 'true');
        setNotifications(savedNotifications !== 'false'); // default to true
      } catch (error) {
        console.error('사용자 데이터 로드 오류:', error);
      } finally {
        setLoading(false);
      }
    }

    loadUserData();
  }, [supabase]);

  const handleDarkModeToggle = () => {
    const newValue = !darkMode;
    setDarkMode(newValue);
    localStorage.setItem('darkMode', newValue.toString());
    
    // Apply dark mode to document
    if (newValue) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    toast.success(`다크 모드가 ${newValue ? '활성화' : '비활성화'}되었습니다`);
  };

  const handleNotificationsToggle = () => {
    const newValue = !notifications;
    setNotifications(newValue);
    localStorage.setItem('notifications', newValue.toString());
    toast.success(`알림이 ${newValue ? '활성화' : '비활성화'}되었습니다`);
  };

  const handleProfileUpdate = async () => {
    if (!user || !newDisplayName.trim()) return;

    try {
      const { error } = await supabase.auth.updateUser({
        data: { display_name: newDisplayName.trim() }
      });

      if (error) {
        toast.error('프로필 업데이트에 실패했습니다');
        return;
      }

      setDisplayName(newDisplayName.trim());
      setProfileEditModal(false);
      toast.success('프로필이 업데이트되었습니다');
    } catch (error) {
      console.error('프로필 업데이트 오류:', error);
      toast.error('프로필 업데이트 중 오류가 발생했습니다');
    }
  };

  const handleDataExport = () => {
    // TODO: Implement data export functionality
    toast.info('데이터 내보내기 기능은 곧 제공될 예정입니다');
  };

  const handleDeleteAccount = () => {
    // TODO: Implement account deletion
    toast.error('계정 삭제 기능은 곧 제공될 예정입니다');
    setDeleteAccountModal(false);
  };

  const settingSections = [
    {
      title: '프로필',
      items: [
        {
          id: 'profile',
          title: '프로필 편집',
          description: `현재: ${displayName}`,
          icon: <UserIcon size={20} />,
          action: () => setProfileEditModal(true),
          type: 'navigate' as const
        }
      ]
    },
    {
      title: '앱 설정',
      items: [
        {
          id: 'darkMode',
          title: '다크 모드',
          description: darkMode ? '활성화됨' : '비활성화됨',
          icon: darkMode ? <Moon size={20} /> : <Sun size={20} />,
          action: handleDarkModeToggle,
          type: 'toggle' as const,
          value: darkMode
        },
        {
          id: 'notifications',
          title: '알림',
          description: notifications ? '활성화됨' : '비활성화됨',
          icon: <Bell size={20} />,
          action: handleNotificationsToggle,
          type: 'toggle' as const,
          value: notifications
        }
      ]
    },
    {
      title: '데이터',
      items: [
        {
          id: 'export',
          title: '데이터 내보내기',
          description: '만다라트 데이터를 JSON 파일로 내보내기',
          icon: <Download size={20} />,
          action: handleDataExport,
          type: 'action' as const
        }
      ]
    },
    {
      title: '계정',
      items: [
        {
          id: 'delete',
          title: '계정 삭제',
          description: '모든 데이터가 영구적으로 삭제됩니다',
          icon: <Trash2 size={20} className="text-red-500" />,
          action: () => setDeleteAccountModal(true),
          type: 'action' as const
        }
      ]
    }
  ];

  if (loading) {
    return (
      <PageTransition>
        <MobileLayout
          footer={<div className="sm:hidden"><BottomBar /></div>}
        >
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
              <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">설정을 불러오는 중...</p>
            </div>
          </div>
        </MobileLayout>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <MobileLayout
        footer={<div className="sm:hidden"><BottomBar /></div>}
      >
        <div className="container mx-auto py-6 sm:py-10 px-4 max-w-2xl pb-20">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 sm:mb-8"
          >
            <div className="flex items-center gap-3 mb-2">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                aria-label="뒤로가기"
              >
                <ChevronRight size={20} className="rotate-180" />
              </button>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">설정</h1>
            </div>
            <p className="text-gray-600 dark:text-gray-400 ml-11 text-sm sm:text-base">앱 설정과 계정 정보를 관리하세요</p>
          </motion.div>

          {/* Settings Sections */}
          {settingSections.map((section, sectionIndex) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: sectionIndex * 0.1 }}
              className="mb-6"
            >
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3 px-2">
                {section.title}
              </h2>
              
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                {section.items.map((item, itemIndex) => (
                  <motion.button
                    key={item.id}
                    onClick={item.action}
                    className={`w-full p-4 sm:p-5 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                      itemIndex !== section.items.length - 1 ? 'border-b border-gray-100 dark:border-gray-700' : ''
                    }`}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="p-2 sm:p-2.5 bg-gray-100 dark:bg-gray-700 rounded-lg">
                        {item.icon}
                      </div>
                      <div className="text-left">
                        <h3 className="font-medium text-gray-900 dark:text-gray-100 text-base sm:text-lg">{item.title}</h3>
                        <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">{item.description}</p>
                      </div>
                    </div>
                    
                    {item.type === 'toggle' ? (
                      <div className={`w-12 h-6 sm:w-14 sm:h-7 rounded-full transition-colors ${
                        item.value ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
                      }`}>
                        <div className={`w-5 h-5 sm:w-6 sm:h-6 bg-white rounded-full shadow transform transition-transform ${
                          item.value ? 'translate-x-6 sm:translate-x-7' : 'translate-x-0.5'
                        } mt-0.5`} />
                      </div>
                    ) : (
                      <ChevronRight size={20} className="text-gray-400 dark:text-gray-500" />
                    )}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          ))}

          {/* User Info */}
          {user && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 sm:p-5 border border-blue-100 dark:border-blue-800"
            >
              <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2 text-base sm:text-lg">계정 정보</h3>
              <p className="text-sm sm:text-base text-blue-700 dark:text-blue-200">
                <strong>이메일:</strong> {user.email}
              </p>
              <p className="text-sm sm:text-base text-blue-700 dark:text-blue-200 mt-1">
                <strong>가입일:</strong> {new Date(user.created_at).toLocaleDateString('ko-KR')}
              </p>
            </motion.div>
          )}
        </div>

        {/* Profile Edit Modal */}
        <AlertDialog open={profileEditModal} onOpenChange={setProfileEditModal}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>프로필 편집</AlertDialogTitle>
              <AlertDialogDescription>
                표시 이름을 변경할 수 있습니다.
              </AlertDialogDescription>
            </AlertDialogHeader>
            
            <div className="py-4">
              <InputField
                id="displayName"
                label="표시 이름"
                value={newDisplayName}
                onChange={setNewDisplayName}
                placeholder="표시 이름을 입력하세요"
                maxLength={50}
              />
            </div>

            <AlertDialogFooter>
              <AlertDialogCancel>취소</AlertDialogCancel>
              <AlertDialogAction onClick={handleProfileUpdate}>
                저장
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Delete Account Modal */}
        <AlertDialog open={deleteAccountModal} onOpenChange={setDeleteAccountModal}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>계정 삭제</AlertDialogTitle>
              <AlertDialogDescription>
                정말로 계정을 삭제하시겠습니까? 이 작업은 되돌릴 수 없으며, 모든 만다라트 데이터가 영구적으로 삭제됩니다.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>취소</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDeleteAccount}
                className="bg-red-600 hover:bg-red-700"
              >
                삭제
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </MobileLayout>
    </PageTransition>
  );
}