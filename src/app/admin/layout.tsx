import AdminNav from '@/components/AdminNav';
import Navbar from '@/components/Navbar';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen admin-theme" style={{ marginLeft: 'var(--sidebar-width)' }}>
      <Navbar />
      <AdminNav />
      <main className="container mx-auto py-6 px-4">{children}</main>
    </div>
  );
}