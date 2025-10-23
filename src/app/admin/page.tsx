import { requireAdminAccess, getAdminDashboardData } from '@/lib/supabaseServer';
import AdminDashboard from './AdminDashboard';

interface DashboardStats {
  totalUsers: number
  totalGiveaways: number
  activeGiveaways: number
}

interface RecentGiveaway {
  id: string
  title: string
  status: string
  created_at: string
  creator_id: string
}

export default async function AdminPage() {
  // Server-side authentication and authorization
  const { session, profile } = await requireAdminAccess();
  
  // Fetch dashboard data server-side
  const dashboardData = await getAdminDashboardData();

  return (
    <AdminDashboard 
      userEmail={session.user.email || 'Admin'} 
      dashboardData={dashboardData} 
    />
  );
}