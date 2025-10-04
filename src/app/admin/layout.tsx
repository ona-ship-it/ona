import AdminNav from '@/components/AdminNav';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-100">
      <AdminNav />
      <main className="container mx-auto py-6 px-4">{children}</main>
    </div>
  );
}