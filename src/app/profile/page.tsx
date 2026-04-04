import { Suspense } from 'react';
import ProfilePageClient from './ProfilePageClient';

export const metadata = { title: 'Profile | Onagui' };

export default function ProfilePage() {
  return (
    <Suspense>
      <ProfilePageClient />
    </Suspense>
  );
}
