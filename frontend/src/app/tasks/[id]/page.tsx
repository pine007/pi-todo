// frontend/src/app/tasks/[id]/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { tasksApi, categoriesApi } from '@/lib/api';
import { Task, Category } from '@/types';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import Sidebar from '@/components/layout/Sidebar';

export default function EditTaskPage() {
  const { id } = useParams<{ id: string }>();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [task, setTask] = useState<Task | null>(null);
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

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [taskResponse, categoriesResponse] = await Promise.all([
        tasksApi.getTaskById(Number(id)),
        categoriesApi.getCategories()
      ]);
      const taskData = taskResponse.data;
      setTask(taskData);
      let formattedDueDate = '';
      if (taskData.due_date) {
        const date = new Date(taskData.due_date);
        formattedDueDate = date.toISOString().slice(0, 16);
      }
      setFormData({
        title: taskData.title,
        description: taskData.description || '',
        status: taskData.status,
        category_id: taskData.category_id ? taskData.category_id.toString() : '',
        due_date: formattedDueDate
      });
      setCategories(categoriesResponse.data);
    } catch (error) {
      console.error('Failed to fetch task data', error);
      setError('Failed to load task data');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
      return;
    }
    if (user && id) {
      fetchData();
    }
  }, [user, authLoading, router, id, fetchData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }
    try {
      setSubmitting(true);
      const taskData = {
        ...formData,
        category_id: formData.category_id ? parseInt(formData.category_id) : null,
        status: formData.status as 'pending' | 'in_progress' | 'completed',
      };
      await tasksApi.updateTask(Number(id), taskData);
      router.push('/tasks');
    } catch (error: unknown) {
      console.error('Failed to update task', error);
      if (
        error &&
        typeof error === 'object' &&
        'response' in error &&
        error.response &&
        typeof error.response === 'object' &&
        'data' in error.response
      ) {
        // @ts-expect-error: error.response is not typed
        setError(error.response.data?.error || 'Failed to update task');
      } else {
        setError('Failed to update task');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    try {
      setSubmitting(true);
      await tasksApi.deleteTask(Number(id));
      router.push('/tasks');
    } catch (error: unknown) {
      console.error('Failed to delete task', error);
      if (
        error &&
        typeof error === 'object' &&
        'response' in error &&
        error.response &&
        typeof error.response === 'object' &&
        'data' in error.response
      ) {
        // @ts-expect-error: error.response is not typed
        setError(error.response.data?.error || 'Failed to delete task');
      } else {
        setError('Failed to delete task');
      }
      setSubmitting(false);
    }
  };

  if (authLoading || loading) {
    return <div className="flex justify-center py-8">Loading...</div>;
  }

  if (!user || !task) return null;

  return (
    <div className="flex">
      <Sidebar />
      
      <div className="ml-0 md:ml-64 w-full">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-2xl font-bold">Edit Task</h1>
            <Button variant="danger" onClick={handleDelete} isLoading={submitting}>
              Delete Task
            </Button>
          </div>

          <Card>
            {error && (
              <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <Input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  placeholder="Enter task title"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Enter task description"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full rounded-md border border-gray-300 px-3 py-2"
                  >
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    name="category_id"
                    value={formData.category_id}
                    onChange={handleChange}
                    className="w-full rounded-md border border-gray-300 px-3 py-2"
                  >
                    <option value="">No Category</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id.toString()}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
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
                  <Button variant="secondary" type="button">Cancel</Button>
                </Link>
                <Button type="submit" isLoading={submitting}>Update Task</Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}