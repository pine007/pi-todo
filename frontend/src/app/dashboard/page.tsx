// src/app/dashboard/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { tasksApi, statsApi } from '@/lib/api';
import { Task, TaskStats } from '@/types';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Sidebar from '@/components/layout/Sidebar';

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [recentTasks, setRecentTasks] = useState<Task[]>([]);
  const [stats, setStats] = useState<TaskStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
      return;
    }

    if (user) {
      const fetchDashboardData = async () => {
        try {
          setLoading(true);
          const [tasksResponse, statsResponse] = await Promise.all([
            tasksApi.getTasks(),
            statsApi.getStats()
          ]);
          
          setRecentTasks(tasksResponse.data.slice(0, 5));
          setStats(statsResponse.data);
        } catch (error) {
          console.error('获取仪表盘数据失败', error);
        } finally {
          setLoading(false);
        }
      };

      fetchDashboardData();
    }
  }, [user, authLoading, router]);

  if (authLoading || loading) {
    return <div className="flex justify-center py-8">加载中...</div>;
  }

  if (!user) return null;

  return (
    <div className="flex">
      <Sidebar />
      
      <div className="ml-0 md:ml-64 w-full">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-2xl font-bold">仪表盘</h1>
            <Link href="/tasks/new">
              <Button>新建任务</Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {stats && (
              <>
                <Card className="bg-blue-50">
                  <h3 className="text-lg font-medium text-gray-700">总任务数</h3>
                  <p className="mt-2 text-3xl font-bold">{stats.tasksByStatus.total_tasks}</p>
                </Card>
                
                <Card className="bg-yellow-50">
                  <h3 className="text-lg font-medium text-gray-700">待处理</h3>
                  <p className="mt-2 text-3xl font-bold">{stats.tasksByStatus.pending_tasks}</p>
                </Card>
                
                <Card className="bg-purple-50">
                  <h3 className="text-lg font-medium text-gray-700">进行中</h3>
                  <p className="mt-2 text-3xl font-bold">{stats.tasksByStatus.in_progress_tasks}</p>
                </Card>
                
                <Card className="bg-green-50">
                  <h3 className="text-lg font-medium text-gray-700">已完成</h3>
                  <p className="mt-2 text-3xl font-bold">{stats.tasksByStatus.completed_tasks}</p>
                </Card>
              </>
            )}
          </div>

          <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card title="最近任务">
              {recentTasks.length > 0 ? (
                <ul className="divide-y divide-gray-200">
                  {recentTasks.map((task) => (
                    <li key={task.id} className="py-3">
                      <Link href={`/tasks/${task.id}`}>
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-sm font-medium">{task.title}</h3>
                            <p className="text-xs text-gray-500">{task.category_name || '无分类'}</p>
                          </div>
                          <span
                            className={`inline-flex rounded-full px-2 py-1 text-xs ${
                              task.status === 'completed'
                                ? 'bg-green-100 text-green-800'
                                : task.status === 'in_progress'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            {task.status === 'completed' ? '已完成' : 
                             task.status === 'in_progress' ? '进行中' : '待处理'}
                          </span>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 text-sm">暂无任务。创建您的第一个任务吧！</p>
              )}
              <div className="mt-4">
                <Link href="/tasks">
                  <Button variant="secondary" size="sm">查看全部任务</Button>
                </Link>
              </div>
            </Card>
            
            <Card title="分类">
              {stats && stats.tasksByCategory.length > 0 ? (
                <ul className="divide-y divide-gray-200">
                  {stats.tasksByCategory.slice(0, 5).map((category) => (
                    <li key={category.id} className="py-3 flex justify-between items-center">
                      <div>
                        <h3 className="text-sm font-medium">{category.name}</h3>
                        <p className="text-xs text-gray-500">
                          已完成 {category.completed_count} / {category.task_count} 个任务
                        </p>
                      </div>
                      <div className="h-2 w-24 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-green-500" 
                          style={{ 
                            width: `${category.task_count > 0 
                              ? (category.completed_count / category.task_count) * 100 
                              : 0}%` 
                          }}
                        ></div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 text-sm">暂无分类。创建您的第一个分类吧！</p>
              )}
              <div className="mt-4">
                <Link href="/categories">
                  <Button variant="secondary" size="sm">管理分类</Button>
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}