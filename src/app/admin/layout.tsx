import AdminNav from '@/components/AdminNav';
import AdminAuthGuard from '@/components/AdminAuthGuard';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminAuthGuard>
      <div className="min-h-screen bg-gray-100">
        <AdminNav />
        <main className="container mx-auto py-6 px-4">{children}</main>
      </div>
    </AdminAuthGuard>
  );
}