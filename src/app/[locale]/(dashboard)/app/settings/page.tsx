'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { createClient } from '@/utils/supabase/client';
import { User } from '@supabase/supabase-js';
import { toast } from 'sonner';
import MobileLayout from '@/components/layout/MobileLayout';
import BottomBar from '@/components/layout/BottomBar';
import PageTransition from '@/components/animations/PageTransition';
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
  Download,
  Trash2,
  ChevronRight,
  Moon,
  Sun
} from 'lucide-react';


export default function SettingsPage() {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false); // hydration 체크용
  
  // 다국어 번역 훅
  const t = useTranslations('settings');
  const tCommon = useTranslations('common');
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
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
        
        if (user) {
          setDisplayName(user.user_metadata?.display_name || user.email?.split('@')[0] || t('user.defaultName'));
          setNewDisplayName(user.user_metadata?.display_name || user.email?.split('@')[0] || t('user.defaultName'));
        }
        
        // Load settings from localStorage only on client side
        if (typeof window !== 'undefined') {
          const savedDarkMode = localStorage.getItem('darkMode');
          const savedNotifications = localStorage.getItem('notifications');
          
          setDarkMode(savedDarkMode === 'true');
          setNotifications(savedNotifications !== 'false'); // default to true
        }
      } catch (error) {
        console.error(t('errors.loadUserData'), error);
      } finally {
        setLoading(false);
        setIsInitialized(true);
      }
    }

    loadUserData();
  }, [supabase]);

  const handleDarkModeToggle = () => {
    const newValue = !darkMode;
    setDarkMode(newValue);
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('darkMode', newValue.toString());
      
      // Apply dark mode to document
      if (newValue) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
    
    toast.success(newValue ? t('app.darkModeToggle.enabled') : t('app.darkModeToggle.disabled'));
  };

  const handleNotificationsToggle = () => {
    const newValue = !notifications;
    setNotifications(newValue);
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('notifications', newValue.toString());
    }
    
    toast.success(newValue ? t('app.notificationsToggle.enabled') : t('app.notificationsToggle.disabled'));
  };

  const handleProfileUpdate = async () => {
    if (!user || !newDisplayName.trim()) return;

    try {
      const { error } = await supabase.auth.updateUser({
        data: { display_name: newDisplayName.trim() }
      });

      if (error) {
        toast.error(t('profile.updateError'));
        return;
      }

      setDisplayName(newDisplayName.trim());
      setProfileEditModal(false);
      toast.success(t('profile.updateSuccess'));
    } catch (error) {
      console.error(t('errors.profileUpdate'), error);
      toast.error(t('errors.profileUpdate'));
    }
  };

  const handleDataExport = () => {
    // TODO: Implement data export functionality
    toast.info(t('data.exportComingSoon'));
  };

  const handleDeleteAccount = () => {
    // TODO: Implement account deletion
    toast.error(t('account.deleteComingSoon'));
    setDeleteAccountModal(false);
  };

  const settingSections = [
    {
      title: t('profile.title'),
      items: [
        {
          id: 'profile',
          title: t('profile.edit'),
          description: t('profile.current', { name: displayName }),
          icon: <UserIcon size={20} />,
          action: () => setProfileEditModal(true),
          type: 'navigate' as const
        }
      ]
    },
    {
      title: t('app.title'),
      items: [
        {
          id: 'darkMode',
          title: t('app.darkMode'),
          description: darkMode ? t('app.enabled') : t('app.disabled'),
          icon: darkMode ? <Moon size={20} /> : <Sun size={20} />,
          action: handleDarkModeToggle,
          type: 'toggle' as const,
          value: darkMode
        },
        {
          id: 'notifications',
          title: t('app.notifications'),
          description: notifications ? t('app.enabled') : t('app.disabled'),
          icon: <Bell size={20} />,
          action: handleNotificationsToggle,
          type: 'toggle' as const,
          value: notifications
        }
      ]
    },
    {
      title: t('data.title'),
      items: [
        {
          id: 'export',
          title: t('data.export'),
          description: t('data.exportDescription'),
          icon: <Download size={20} />,
          action: handleDataExport,
          type: 'action' as const
        }
      ]
    },
    {
      title: t('account.title'),
      items: [
        {
          id: 'delete',
          title: t('account.delete'),
          description: t('account.deleteDescription'),
          icon: <Trash2 size={20} className="text-red-500" />,
          action: () => setDeleteAccountModal(true),
          type: 'action' as const
        }
      ]
    }
  ];

  // Hydration 이슈 방지를 위해 초기화가 완료되지 않았으면 기본 레이아웃만 렌더링
  if (!isInitialized) {
    return (
      <PageTransition>
        <MobileLayout
          footer={<div className="sm:hidden"><BottomBar /></div>}
        >
          <div className="container mx-auto py-6 sm:py-10 px-4 max-w-2xl pb-20">
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">{tCommon('loading')}</p>
              </div>
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
        <div className="container mx-auto py-6 sm:py-10 px-4 max-w-2xl">
          {/* Header - 프로필 페이지와 동일한 구조 */}
          <div className="flex items-center gap-3 mb-6 sm:mb-8">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              aria-label={t('back')}
            >
              <ChevronRight size={20} className="rotate-180" />
            </button>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">{t('title')}</h1>
          </div>

          {/* Settings Sections */}
          {settingSections.map((section) => (
            <div key={section.title} className="mb-6 sm:mb-8">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
                {section.title}
              </h2>
              
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                {section.items.map((item, itemIndex) => (
                  <button
                    key={item.id}
                    onClick={item.action}
                    className={`w-full p-4 sm:p-6 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                      itemIndex !== section.items.length - 1 ? 'border-b border-gray-100 dark:border-gray-700' : ''
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2.5 bg-gray-100 dark:bg-gray-700 rounded-lg">
                        {item.icon}
                      </div>
                      <div className="text-left">
                        <h3 className="font-medium text-gray-900 dark:text-gray-100 text-base sm:text-lg">{item.title}</h3>
                        <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 mt-1">{item.description}</p>
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
                  </button>
                ))}
              </div>
            </div>
          ))}

          {/* User Info */}
          {user && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 sm:p-5 border border-blue-100 dark:border-blue-800"
            >
              <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2 text-base sm:text-lg">{t('accountInfo.title')}</h3>
              <p className="text-sm sm:text-base text-blue-700 dark:text-blue-200">
                <strong>{t('accountInfo.email')}:</strong> {user.email}
              </p>
              <p className="text-sm sm:text-base text-blue-700 dark:text-blue-200 mt-1">
                <strong>{t('accountInfo.joinDate')}:</strong> {new Date(user.created_at).toLocaleDateString(locale === 'ko' ? 'ko-KR' : locale === 'ja' ? 'ja-JP' : 'en-US')}
              </p>
            </motion.div>
          )}
        </div>

        {/* Profile Edit Modal */}
        <AlertDialog open={profileEditModal} onOpenChange={setProfileEditModal}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t('profile.editDialog.title')}</AlertDialogTitle>
              <AlertDialogDescription>
                {t('profile.editDialog.description')}
              </AlertDialogDescription>
            </AlertDialogHeader>
            
            <div className="py-4">
              <InputField
                id="displayName"
                label={t('profile.displayName')}
                value={newDisplayName}
                onChange={setNewDisplayName}
                placeholder={t('profile.displayNamePlaceholder')}
                maxLength={50}
              />
            </div>

            <AlertDialogFooter>
              <AlertDialogCancel>{tCommon('cancel')}</AlertDialogCancel>
              <AlertDialogAction onClick={handleProfileUpdate}>
                {tCommon('save')}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Delete Account Modal */}
        <AlertDialog open={deleteAccountModal} onOpenChange={setDeleteAccountModal}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t('account.deleteDialog.title')}</AlertDialogTitle>
              <AlertDialogDescription>
                {t('account.deleteDialog.description')}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{tCommon('cancel')}</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDeleteAccount}
                className="bg-red-600 hover:bg-red-700"
              >
                {tCommon('delete')}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </MobileLayout>
    </PageTransition>
  );
}