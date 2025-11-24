import { requireAdminAccess, getAdminDashboardData } from '@/lib/supabaseServer';
import AdminDashboard from '../AdminDashboard';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  const { session } = await requireAdminAccess();
  const dashboardData = await getAdminDashboardData();

  return (
    <AdminDashboard userEmail={session.user.email || 'admin'} dashboardData={dashboardData} />
  );
}