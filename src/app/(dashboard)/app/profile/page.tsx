'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import InputField from '@/components/ui/InputField';
import { Textarea } from '@/components/ui/TextArea';
import { Button } from '@/components/ui/Button';
import ColorPalette from '@/components/ui/ColorPalette';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import HeaderBar from '@/components/layout/HeaderBar';
import MobileLayout from '@/components/layout/MobileLayout';
import BottomBar from '@/components/layout/BottomBar';
import AppHeaderBar from '@/components/layout/AppHeaderBar';

export default function ProfilePage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [bio, setBio] = useState('');
  const [themeColor, setThemeColor] = useState('#3B82F6');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    async function fetchUserProfile() {
      try {
        // 현재 로그인한 사용자 세션 가져오기
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !session) {
          throw new Error('로그인이 필요합니다');
        }

        // 사용자 이메일 설정
        setEmail(session.user.email || '');

        // 프로필 데이터 가져오기
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .single();

        if (profileError && profileError.code !== 'PGRST116') {
          throw profileError;
        }

        if (profile) {
          setName(profile.display_name || '');
          setBio(profile.bio || '');
          setThemeColor(profile.theme_color || '#3B82F6');
        }
      } catch (error) {
        console.error('프로필 로드 에러:', error);
        toast.error('프로필 정보를 불러오는데 실패했습니다');
        router.push('/login');
      } finally {
        setIsLoadingProfile(false);
      }
    }

    fetchUserProfile();
  }, [supabase, router]);

  const handleSave = async () => {
    try {
      setIsLoading(true);
      
      // 현재 로그인한 사용자 세션 가져오기
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('로그인이 필요합니다');
      }

      const userId = session.user.id;

      // 프로필 업데이트하기
      const { error } = await supabase
        .from('profiles')
        .upsert({
            user_id: userId,
            display_name: name,
            bio: bio,
            theme_color: themeColor,
            updated_at: new Date().toISOString()
        }, {
            onConflict: 'user_id'  // 충돌 처리 기준 명시
        });

      if (error) throw error;
      
      toast.success('프로필이 성공적으로 저장되었습니다');
    } catch (error) {
      console.error('프로필 저장 에러:', error);
      toast.error('프로필 저장에 실패했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  // 테마 색상 변경 핸들러
  const handleColorChange = (color: string) => {
    setThemeColor(color);
  };

  // 카드 스타일 계산
  const getCardStyle = () => {
    return {
      borderTop: `4px solid ${themeColor}`,
      transition: 'border-color 0.3s ease'
    };
  };

  if (isLoadingProfile) {
    return (
      <div className="container mx-auto py-10 px-4 max-w-2xl text-center">
        <p>프로필 정보를 불러오는 중...</p>
      </div>
    );
  }

  return (
    <MobileLayout
      header={
        <div>
          <div className="hidden sm:block">
            <AppHeaderBar showBackButton backHref="/app" />
          </div>
          <div className="sm:hidden">
            <HeaderBar
              title="프로필 설정"
              showBackButton
              href="/app"
            />
          </div>
        </div>
      }
      footer={<div className="sm:hidden"><BottomBar /></div>}
    >
      <div className="container mx-auto py-6 sm:py-10 px-4 max-w-2xl">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-center">프로필 설정</h1>
        
        <Card style={getCardStyle()}>
          <CardHeader style={{ borderBottom: `1px solid ${themeColor}20` }}>
            <CardTitle>개인 정보</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 sm:space-y-6">
            <InputField
              id="name"
              label="이름"
              value={name}
              onChange={setName}
              required
            />
            
            <InputField
              id="email"
              label="이메일"
              type="email"
              value={email}
              onChange={setEmail}
              required
              disabled
            />
            
            <div className="space-y-2">
              <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
                소개
              </label>
              <Textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="min-h-[100px]"
                placeholder="자기소개를 입력하세요"
              />
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                테마 색상
              </label>
              <p className="text-xs text-gray-500 mb-2">
                선택한 색상은 프로필 카드에 즉시 반영됩니다
              </p>
              <ColorPalette
                selectedColor={themeColor}
                onColorSelect={handleColorChange}
                className="mt-2"
              />
            </div>
          </CardContent>
          <CardFooter className="justify-end space-x-2 sm:space-x-4" style={{ borderTop: `1px solid ${themeColor}20` }}>
            <Button
              variant="outline"
              onClick={() => window.history.back()}
              size="sm"
            >
              취소
            </Button>
            <Button
              onClick={handleSave}
              disabled={isLoading}
              style={{ backgroundColor: themeColor, color: 'black' }}
              size="sm"
            >
              {isLoading ? '저장 중...' : '저장하기'}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </MobileLayout>
  );
}
