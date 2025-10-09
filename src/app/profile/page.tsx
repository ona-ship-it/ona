import ProfileClient from '@/components/ProfileClient';
import Comments from '@/components/Comments';

export const metadata = {
  title: 'Profile | ONAGUI',
  description: 'Manage your ONAGUI profile',
};

export default function ProfilePage() {
  // Using mock data for now - in a real app, this would come from the database
  const mockUser = { id: '123', email: 'user@example.com' };
  const mockProfile = { 
    id: '123', 
    user_id: '123', // Added required user_id field
    username: 'user123', 
    full_name: 'Test User',
    avatar_url: '/vercel.svg',
    bio: 'This is a test profile'
  };
  
  return (
    <>
      <ProfileClient user={mockUser} profile={mockProfile} />
      <div className="container mx-auto px-4">
        <Comments targetType="profile" targetId={mockProfile.id} />
      </div>
    </>
  );
}