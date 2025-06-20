'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import Button from '@/components/ui/Button';

export default function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white shadow">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="text-2xl font-bold text-blue-600">
            PiToDo
        </Link>

        <nav className="flex items-center space-x-4">
          {user ? (
            <>
              <Link 
                href="/dashboard" 
                className="text-gray-600 hover:text-gray-900"
              >
                仪表盘
              </Link>
              <Link 
                href="/tasks" 
                className="text-gray-600 hover:text-gray-900"
              >
                任务
              </Link>
              <Link 
                href="/categories" 
                className="text-gray-600 hover:text-gray-900"
              >
                分类
              </Link>
              <Link 
                href="/stats" 
                className="text-gray-600 hover:text-gray-900"
              >
                统计
              </Link>
              <div className="ml-4 flex items-center">
                <span className="mr-2 text-sm text-gray-700">
                  {user.username}
                </span>
                <Button variant="secondary" size="sm" onClick={() => logout()}>
                  退出
                </Button>
              </div>
            </>
          ) : (
            <>
              <Link 
                href="/auth/login" 
                className="text-gray-600 hover:text-gray-900"
              >
                登录
              </Link>
              <Link 
                href="/auth/register" 
                className="text-gray-600 hover:text-gray-900"
              >
                注册
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
