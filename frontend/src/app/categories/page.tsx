// frontend/src/app/categories/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { categoriesApi } from '@/lib/api';
import { Category } from '@/types';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import Sidebar from '@/components/layout/Sidebar';

export default function CategoriesPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // 新增分类表单
  const [newCategory, setNewCategory] = useState('');
  
  // 编辑分类状态
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');

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

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!newCategory.trim()) {
      setError('分类名称不能为空');
      return;
    }
    
    try {
      setSubmitting(true);
      const response = await categoriesApi.createCategory({ name: newCategory });
      setCategories([...categories, response.data]);
      setNewCategory('');
      setSuccess('分类创建成功');
    } catch (error: any) {
      console.error('创建分类失败', error);
      setError(error.response?.data?.error || '创建分类失败');
    } finally {
      setSubmitting(false);
    }
  };

  const startEditing = (category: Category) => {
    setEditingId(category.id);
    setEditName(category.name);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditName('');
  };

  const handleUpdateCategory = async (id: number) => {
    setError('');
    setSuccess('');
    
    if (!editName.trim()) {
      setError('分类名称不能为空');
      return;
    }
    
    try {
      setSubmitting(true);
      await categoriesApi.updateCategory(id, { name: editName });
      
      // 更新本地分类列表
      setCategories(categories.map(category => 
        category.id === id ? { ...category, name: editName } : category
      ));
      
      setEditingId(null);
      setSuccess('分类更新成功');
    } catch (error: any) {
      console.error('更新分类失败', error);
      setError(error.response?.data?.error || '更新分类失败');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCategory = async (id: number) => {
    if (!confirm('确定要删除这个分类吗？相关任务将不再属于任何分类。')) {
      return;
    }
    
    setError('');
    setSuccess('');
    
    try {
      setSubmitting(true);
      await categoriesApi.deleteCategory(id);
      
      // 更新本地分类列表
      setCategories(categories.filter(category => category.id !== id));
      setSuccess('分类删除成功');
    } catch (error: any) {
      console.error('删除分类失败', error);
      setError(error.response?.data?.error || '删除分类失败');
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
          <div className="mb-6">
            <h1 className="text-2xl font-bold">分类</h1>
            <p className="text-gray-600 mt-1">使用分类整理您的任务</p>
          </div>

          <Card className="mb-6">
            <h2 className="text-xl font-semibold mb-4">创建新分类</h2>
            
            {error && (
              <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            )}
            
            {success && (
              <div className="mb-4 rounded-md bg-green-50 p-3 text-sm text-green-700">
                {success}
              </div>
            )}
            
            <form onSubmit={handleCreateCategory} className="flex gap-2">
              <div className="flex-1">
                <Input
                  type="text"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="输入分类名称"
                  required
                />
              </div>
              <Button 
                type="submit" 
                isLoading={submitting}
              >
                创建分类
              </Button>
            </form>
          </Card>

          <Card>
            <h2 className="text-xl font-semibold mb-4">您的分类</h2>
            
            {categories.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {categories.map(category => (
                  <li key={category.id} className="py-4">
                    {editingId === category.id ? (
                      <div className="flex items-center">
                        <Input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="flex-1"
                        />
                        <div className="ml-3 flex space-x-2">
                          <Button 
                            size="sm" 
                            onClick={() => handleUpdateCategory(category.id)}
                            isLoading={submitting}
                          >
                            保存
                          </Button>
                          <Button 
                            variant="secondary" 
                            size="sm" 
                            onClick={cancelEditing}
                          >
                            取消
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-medium">{category.name}</h3>
                          <p className="text-sm text-gray-500">
                            {category.task_count || 0} 个任务
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <Button 
                            variant="secondary" 
                            size="sm" 
                            onClick={() => startEditing(category)}
                          >
                            编辑
                          </Button>
                          <Button 
                            variant="danger" 
                            size="sm" 
                            onClick={() => handleDeleteCategory(category.id)}
                            isLoading={submitting && editingId === category.id}
                          >
                            删除
                          </Button>
                        </div>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">您还没有创建任何分类。</p>
                <p className="text-gray-500 mt-1">创建一个分类来整理您的任务！</p>
              </div>
            )}
          </Card>
          
          <Card className="mt-6">
            <h2 className="text-xl font-semibold mb-4">小贴士</h2>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>分类可以帮助您整理任务</li>
              <li>在任务页面可以按分类筛选任务</li>
              <li>每个任务只能属于一个分类</li>
              <li>删除分类不会删除相关联的任务</li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}