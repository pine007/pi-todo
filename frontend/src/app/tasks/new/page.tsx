// frontend/src/app/tasks/new/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { tasksApi, categoriesApi } from '@/lib/api';
import { Category } from '@/types';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import Sidebar from '@/components/layout/Sidebar';

export default function NewTaskPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'pending',
    category_id: '',
    due_date: ''
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
      return;
    }

    if (user) {
      fetchCategories();
    }
  }, [user, authLoading, router]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await categoriesApi.getCategories();
      setCategories(response.data);
    } catch (error) {
      console.error('获取分类失败', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!formData.title.trim()) {
      setError('标题不能为空');
      return;
    }
    
    try {
      setSubmitting(true);
      
      // 准备提交数据 - 改进格式确保与后端期望一致
      const taskData = {
        title: formData.title.trim(),
        description: formData.description || undefined,
        status: formData.status as 'pending' | 'in_progress' | 'completed',
        category_id: formData.category_id ? parseInt(formData.category_id) : undefined,
        due_date: formData.due_date || undefined
      };
      
      console.log('提交任务数据:', taskData);
      
      // 使用 try-catch 包装API调用以捕获具体错误
      try {
        await tasksApi.createTask(taskData);
        router.push('/tasks');
      } catch (apiError: any) {
        console.error('API错误:', apiError);
        if (apiError.response) {
          setError(`服务器错误: ${apiError.response.status} - ${apiError.response.data?.error || '未知错误'}`);
        } else {
          setError('创建任务失败，请稍后再试');
        }
      }
    } catch (error: any) {
      console.error('创建任务失败', error);
      setError('提交表单时出错');
    } finally {
      setSubmitting(false);
    }
  };

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
            <h1 className="text-2xl font-bold">创建新任务</h1>
          </div>

          <Card>
            {error && (
              <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">标题 *</label>
                <Input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  placeholder="输入任务标题"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">描述</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="输入任务描述"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">状态</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full rounded-md border border-gray-300 px-3 py-2"
                  >
                    <option value="pending">待处理</option>
                    <option value="in_progress">进行中</option>
                    <option value="completed">已完成</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">分类</label>
                  <select
                    name="category_id"
                    value={formData.category_id}
                    onChange={handleChange}
                    className="w-full rounded-md border border-gray-300 px-3 py-2"
                  >
                    <option value="">无分类</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id.toString()}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">截止日期</label>
                  <Input
                    type="datetime-local"
                    name="due_date"
                    value={formData.due_date}
                    onChange={handleChange}
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3">
                <Link href="/tasks">
                  <Button variant="secondary" type="button">取消</Button>
                </Link>
                <Button type="submit" isLoading={submitting}>创建任务</Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}