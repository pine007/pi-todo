'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { HomeIcon, CheckCircleIcon, FolderIcon, ChartBarIcon } from '@heroicons/react/24/outline';

export default function Sidebar() {
  const pathname = usePathname();

  const navigation = [
    { name: '仪表盘', href: '/dashboard', icon: HomeIcon },
    { name: '任务', href: '/tasks', icon: CheckCircleIcon },
    { name: '分类', href: '/categories', icon: FolderIcon },
    { name: '统计', href: '/stats', icon: ChartBarIcon },
  ];

  return (
    <aside className="fixed inset-y-0 left-0 z-10 w-64 bg-white border-r border-gray-200 hidden md:block pt-16">
      <div className="p-4">
        <nav className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                  isActive
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <item.icon className={`mr-3 h-5 w-5 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
