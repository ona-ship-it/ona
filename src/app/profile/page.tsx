import { Suspense } from 'react';
import ProfilePageClient from '@/app/profiles/ProfilePageClient';

export const metadata = { title: 'Profile | Onagui' };

export default function ProfilePage() {
  return (
    <Suspense>
      <ProfilePageClient />
    </Suspense>
  );
}
