// frontend/src/app/stats/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { statsApi } from '@/lib/api';
import { TaskStats } from '@/types';
import Card from '@/components/ui/Card';
import Sidebar from '@/components/layout/Sidebar';

export default function StatsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<TaskStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
      return;
    }

    if (user) {
      fetchStats();
    }
  }, [user, authLoading, router]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await statsApi.getStats();
      setStats(response.data);
    } catch (error) {
      console.error('获取统计数据失败', error);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return <div className="flex justify-center py-8">加载中...</div>;
  }

  if (!user || !stats) return null;

  return (
    <div className="flex">
      <Sidebar />
      
      <div className="ml-0 md:ml-64 w-full">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">统计</h1>
            <p className="text-gray-600 mt-1">任务和进度概览</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
              <p className="mt-2 text-3xl font-bold flex items-center">
                <svg className="w-6 h-6 mr-2 text-green-600" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                </svg>
                {stats.tasksByStatus.completed_tasks}
              </p>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Card title="分类任务">
              {stats.tasksByCategory.length > 0 ? (
                <div className="space-y-4">
                  {stats.tasksByCategory.map((category) => (
                    <div key={category.id} className="space-y-1">
                      <div className="flex justify-between">
                        <span className="font-medium">{category.name}</span>
                        <span className="text-gray-500 flex items-center">
                          {category.completed_count > 0 && (
                            <svg className="w-3 h-3 mr-1 text-green-600" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                            </svg>
                          )}
                          {category.completed_count} / {category.task_count} 已完成
                        </span>
                      </div>
                      <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-green-500" 
                          style={{ 
                            width: `${category.task_count > 0 
                              ? (category.completed_count / category.task_count) * 100 
                              : 0}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">
                  暂无分类任务
                </p>
              )}
            </Card>

            <Card title="重要信息">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-red-50 p-4 rounded-lg">
                  <h3 className="font-medium text-red-800">逾期任务</h3>
                  <p className="text-2xl font-bold text-red-600 mt-2">{stats.overdueTasks}</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-medium text-blue-800">今日任务</h3>
                  <p className="text-2xl font-bold text-blue-600 mt-2">{stats.todayTasks}</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
