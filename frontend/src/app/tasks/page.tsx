// frontend/src/app/tasks/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { tasksApi, categoriesApi } from '@/lib/api';
import { Task, Category } from '@/types';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import Sidebar from '@/components/layout/Sidebar';

export default function TasksPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  
  // 筛选状态
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState('');
  
  // 新任务表单状态
  const [showNewTaskForm, setShowNewTaskForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // 新任务表单数据
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    status: 'pending',
    category_id: '',
    due_date: ''
  });
  
  // 快捷创建任务
  const [quickTask, setQuickTask] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
      return;
    }

    if (user) {
      fetchData();
    }
  }, [user, authLoading, router]);

  // 当分类或状态筛选条件变化时重新获取任务
  useEffect(() => {
    if (user) {
      fetchTasks();
    }
  }, [selectedCategoryId, statusFilter]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const [tasksResponse, categoriesResponse] = await Promise.all([
        tasksApi.getTasks(),
        categoriesApi.getCategories()
      ]);
      
      setTasks(tasksResponse.data);
      setCategories(categoriesResponse.data);
    } catch (error) {
      console.error('获取数据失败', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTasks = async () => {
    try {
      setLoading(true);
      
      const params: any = {};
      if (statusFilter) params.status = statusFilter;
      if (selectedCategoryId) params.category_id = selectedCategoryId;
      
      const response = await tasksApi.getTasks(params);
      setTasks(response.data);
    } catch (error) {
      console.error('获取任务失败', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTask = async (id: number) => {
    if (!confirm('确定要删除这个任务吗？')) return;
    
    try {
      await tasksApi.deleteTask(id);
      setTasks(tasks.filter(task => task.id !== id));
    } catch (error) {
      console.error('删除任务失败', error);
    }
  };

  const handleStatusChange = async (id: number, status: 'pending' | 'in_progress' | 'completed') => {
    try {
      await tasksApi.updateTask(id, { status });
      setTasks(tasks.map(task => 
        task.id === id ? { ...task, status } : task
      ));
    } catch (error) {
      console.error('更新任务状态失败', error);
    }
  };

  const handleCategorySelect = (categoryId: number | null) => {
    setSelectedCategoryId(categoryId === selectedCategoryId ? null : categoryId);
  };

  const handleStatusFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value);
  };

  const handleNewTaskChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewTask(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!newTask.title.trim()) {
      setError('标题不能为空');
      return;
    }
    
    try {
      setSubmitting(true);
      
      // 确保数据格式正确
      const taskData = {
        title: newTask.title.trim(),
        description: newTask.description || undefined,
        status: newTask.status as 'pending' | 'in_progress' | 'completed',
        category_id: newTask.category_id ? parseInt(newTask.category_id) : 
                    selectedCategoryId || undefined,
        due_date: newTask.due_date || undefined
      };
      
      console.log('创建任务数据:', taskData);
      
      try {
        const response = await tasksApi.createTask(taskData);
        console.log('创建任务响应:', response);
        
        // 添加新任务到列表并刷新
        fetchTasks();
        
        // 重置表单
        setNewTask({
          title: '',
          description: '',
          status: 'pending',
          category_id: '',
          due_date: ''
        });
        
        setSuccess('任务创建成功');
        setShowNewTaskForm(false);
      } catch (apiError: any) {
        console.error('API错误:', apiError);
        if (apiError.response) {
          setError(`服务器错误: ${apiError.response.status} - ${apiError.response.data?.error || '未知错误'}`);
        } else if (apiError.request) {
          setError('网络错误: 无法连接到服务器');
        } else {
          setError(`错误: ${apiError.message}`);
        }
      }
    } catch (error: any) {
      console.error('创建任务失败', error);
      setError('提交表单时出错');
    } finally {
      setSubmitting(false);
    }
  };

  // 快捷创建任务
  const handleQuickTaskCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!quickTask.trim()) {
      return;
    }
    
    try {
      setSubmitting(true);
      
      // 确保数据格式正确
      const taskData = {
        title: quickTask.trim(),
        status: 'pending' as const,
        category_id: selectedCategoryId || undefined
      };
      
      console.log('快捷创建任务数据:', taskData);
      
      try {
        await tasksApi.createTask(taskData);
        
        // 刷新任务列表
        fetchTasks();
        
        // 重置输入
        setQuickTask('');
        setSuccess('任务创建成功');
      } catch (apiError: any) {
        console.error('API错误:', apiError);
        setError('创建任务失败');
      }
    } catch (error: any) {
      console.error('快捷创建任务失败', error);
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusText = (status: string) => {
    switch(status) {
      case 'pending': return '待处理';
      case 'in_progress': return '进行中';
      case 'completed': return '已完成';
      default: return status;
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
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <h1 className="text-2xl font-bold">任务</h1>
            <Button onClick={() => setShowNewTaskForm(!showNewTaskForm)}>
              {showNewTaskForm ? '取消' : '详细创建任务'}
            </Button>
          </div>

          {/* 快捷创建任务 */}
          <Card className="mb-6">
            <form onSubmit={handleQuickTaskCreate} className="flex gap-2">
              <Input
                type="text"
                value={quickTask}
                onChange={(e) => setQuickTask(e.target.value)}
                placeholder="快速添加任务..."
                className="flex-1"
              />
              <Button type="submit" isLoading={submitting}>添加</Button>
            </form>
            
            {error && (
              <div className="mt-2 text-sm text-red-700">
                {error}
              </div>
            )}
            
            {success && (
              <div className="mt-2 text-sm text-green-700">
                {success}
              </div>
            )}
          </Card>

          {/* 分类切换按钮 */}
          <div className="mb-6">
            <h2 className="text-lg font-medium mb-3">分类</h2>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedCategoryId === null ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => handleCategorySelect(null)}
              >
                全部
              </Button>
              
              {categories.map(category => (
                <Button
                  key={category.id}
                  variant={selectedCategoryId === category.id ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => handleCategorySelect(category.id)}
                >
                  {category.name} {category.task_count ? `(${category.task_count})` : ''}
                </Button>
              ))}
            </div>
          </div>

          {/* 详细创建任务表单 */}
          {showNewTaskForm && (
            <Card className="mb-6">
              <h2 className="text-xl font-semibold mb-4">创建新任务</h2>
              
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
              
              <form onSubmit={handleCreateTask} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">标题 *</label>
                  <Input
                    type="text"
                    name="title"
                    value={newTask.title}
                    onChange={handleNewTaskChange}
                    required
                    placeholder="输入任务标题"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">描述</label>
                  <textarea
                    name="description"
                    value={newTask.description}
                    onChange={handleNewTaskChange}
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
                      value={newTask.status}
                      onChange={handleNewTaskChange}
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
                      value={newTask.category_id || (selectedCategoryId ? String(selectedCategoryId) : '')}
                      onChange={handleNewTaskChange}
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
                      value={newTask.due_date}
                      onChange={handleNewTaskChange}
                    />
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Button type="submit" isLoading={submitting}>创建任务</Button>
                </div>
              </form>
            </Card>
          )}

          {/* 任务列表 */}
          {tasks.length > 0 ? (
            <div>
              {/* 待处理和进行中的任务 */}
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-3">待处理和进行中</h2>
                <div className="grid gap-1">
                  {tasks
                    .filter(task => task.status !== 'completed')
                    .map(task => (
                      <Card key={task.id} className="p-2">
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1 flex-wrap">
                              <h2 className="text-sm font-medium truncate mr-1">{task.title}</h2>
                              {task.category_name && (
                                <span className="inline-flex items-center rounded-full bg-blue-50 px-1.5 py-0.5 text-xs font-medium text-blue-700">
                                  {task.category_name}
                                </span>
                              )}
                              <span
                                className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-xs ${
                                  task.status === 'in_progress'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-yellow-100 text-yellow-800'
                                }`}
                              >
                                {task.status === 'in_progress' && (
                                  <span className="inline-block w-1 h-1 mr-1 rounded-full bg-green-500 animate-pulse"></span>
                                )}
                                {getStatusText(task.status)} {task.status === 'in_progress' && 'ing'}
                              </span>
                            </div>
                            {(task.description || task.due_date) && (
                              <div className="text-xs text-gray-500 truncate">
                                {task.description && (
                                  <span className="mr-2">{task.description}</span>
                                )}
                                {task.due_date && (
                                  <span className="whitespace-nowrap">
                                    截: {new Date(task.due_date).toLocaleDateString()}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                            <Button 
                              variant={task.status === 'pending' ? 'primary' : 'secondary'}
                              size="sm" 
                              onClick={() => handleStatusChange(task.id, task.status === 'pending' ? 'in_progress' : 'pending')}
                              className="py-0.5 px-1.5 text-xs"
                            >
                              {task.status === 'pending' ? '开始' : '暂停'}
                            </Button>
                            <Button 
                              variant="success" 
                              size="sm" 
                              onClick={() => handleStatusChange(task.id, 'completed')}
                              className="py-0.5 px-1.5 text-xs"
                            >
                              完成
                            </Button>
                            <Button 
                              variant="danger" 
                              size="sm" 
                              onClick={() => handleDeleteTask(task.id)}
                              className="py-0.5 px-1.5 text-xs"
                            >
                              删除
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                </div>
                {tasks.filter(task => task.status !== 'completed').length === 0 && (
                  <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                    <h3 className="text-lg font-medium text-gray-900">没有待处理或进行中的任务</h3>
                    <p className="mt-2 text-gray-500">
                      开始创建您的第一个任务吧。
                    </p>
                  </div>
                )}
              </div>
              
              {/* 已完成的任务 */}
              <div>
                <h2 className="text-xl font-semibold mb-3">已完成</h2>
                <div className="grid gap-1">
                  {tasks
                    .filter(task => task.status === 'completed')
                    .map(task => (
                      <Card key={task.id} className="p-2 bg-gray-50">
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1 flex-wrap">
                              <h2 className="text-sm font-medium truncate mr-1">{task.title}</h2>
                              {task.category_name && (
                                <span className="inline-flex items-center rounded-full bg-blue-50 px-1.5 py-0.5 text-xs font-medium text-blue-700">
                                  {task.category_name}
                                </span>
                              )}
                              <span className="inline-flex items-center rounded-full px-1.5 py-0.5 text-xs bg-green-100 text-green-800">
                                <svg className="w-2.5 h-2.5 mr-0.5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                                </svg>
                                {getStatusText(task.status)}
                              </span>
                            </div>
                            {(task.description || task.due_date) && (
                              <div className="text-xs text-gray-500 truncate">
                                {task.description && (
                                  <span className="mr-2">{task.description}</span>
                                )}
                                {task.due_date && (
                                  <span className="whitespace-nowrap">
                                    截: {new Date(task.due_date).toLocaleDateString()}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                            <Button 
                              variant="secondary" 
                              size="sm" 
                              onClick={() => handleStatusChange(task.id, 'pending')}
                              className="py-0.5 px-1.5 text-xs"
                            >
                              重新开始
                            </Button>
                            <Button 
                              variant="danger" 
                              size="sm" 
                              onClick={() => handleDeleteTask(task.id)}
                              className="py-0.5 px-1.5 text-xs"
                            >
                              删除
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                </div>
                {tasks.filter(task => task.status === 'completed').length === 0 && (
                  <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                    <h3 className="text-lg font-medium text-gray-900">没有已完成的任务</h3>
                    <p className="mt-2 text-gray-500">
                      完成您的第一个任务以在此处显示。
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
              <h3 className="text-lg font-medium text-gray-900">未找到任务</h3>
              <p className="mt-2 text-gray-500">
                {selectedCategoryId
                  ? '尝试更改筛选条件或创建新任务。'
                  : '开始创建您的第一个任务吧。'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}