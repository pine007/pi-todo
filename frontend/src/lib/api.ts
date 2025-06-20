import axios from 'axios';

// 创建 axios 实例
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true
});

// 请求拦截器 - 添加认证 token
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 响应拦截器 - 处理错误
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // 如果是认证错误，清除 token 并重定向到登录页
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        window.location.href = '/auth/login';
      }
    }
    return Promise.reject(error);
  }
);

// 用户认证接口
export const authApi = {
  register: (userData: { username: string; email: string; password: string }) => 
    api.post('/auth/register', userData),
  
  login: (credentials: { email: string; password: string }) => 
    api.post('/auth/login', credentials),
  
  logout: () => api.post('/auth/logout'),
  
  getCurrentUser: () => api.get('/auth/me'),
};

// 任务管理接口
export const tasksApi = {
  getTasks: (params?: { status?: string; category_id?: number }) => 
    api.get('/tasks', { params }),
  
  getTaskById: (id: number) => api.get(`/tasks/${id}`),
  
  createTask: (taskData: { 
    title: string; 
    description?: string; 
    category_id?: number; 
    status?: 'pending' | 'in_progress' | 'completed'; 
    due_date?: string;
  }) => api.post('/tasks', taskData),
  
  updateTask: (id: number, taskData: {
    title?: string;
    description?: string;
    category_id?: number | null;
    status?: 'pending' | 'in_progress' | 'completed';
    due_date?: string | null;
  }) => api.put(`/tasks/${id}`, taskData),
  
  deleteTask: (id: number) => api.delete(`/tasks/${id}`),
};

// 分类管理接口
export const categoriesApi = {
  getCategories: () => api.get('/categories'),
  
  createCategory: (categoryData: { name: string }) => 
    api.post('/categories', categoryData),
  
  updateCategory: (id: number, categoryData: { name: string }) => 
    api.put(`/categories/${id}`, categoryData),
  
  deleteCategory: (id: number) => api.delete(`/categories/${id}`),
};

// 数据统计接口
export const statsApi = {
  getStats: () => api.get('/stats'),
};

export default api;
