'use client';

import dynamic from 'next/dynamic';

const ProfileContent = dynamic(() => import('@/components/profile/ProfileContent'), {
  ssr: false,
  loading: () => (
    <div className="container mx-auto py-10 px-4 max-w-2xl text-center">
      <p>Loading...</p>
    </div>
  )
});

export default function ProfilePage() {
  return <ProfileContent />;
}