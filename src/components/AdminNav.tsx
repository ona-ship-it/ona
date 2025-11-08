'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AdminNav() {
  const pathname = usePathname();
  const items = [
    { href: '/admin/dashboard', label: 'Dashboard' },
    { href: '/admin/users', label: 'Users' },
    { href: '/admin/audit', label: 'Audit' },
    { href: '/admin/giveaways/review', label: 'Giveaway Review' },
  ];

  return (
    <nav className="bg-white border-b">
      <div className="container mx-auto px-4 py-3 flex gap-4">
        {items.map((item) => {
          const active = pathname?.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`text-sm px-3 py-1 rounded ${active ? 'bg-gray-200 font-medium' : 'hover:bg-gray-100'}`}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}