// src/types/index.ts

// 用户相关类型
export interface User {
  id: number;
  username: string;
  email: string;
  created_at: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

// 任务相关类型
export interface Task {
  id: number;
  user_id: number;
  category_id: number | null;
  category_name?: string;
  title: string;
  description: string | null;
  status: 'pending' | 'in_progress' | 'completed';
  due_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface TaskFormData {
  title: string;
  description?: string;
  category_id?: number | null;
  status?: 'pending' | 'in_progress' | 'completed';
  due_date?: string | null;
}

// 分类相关类型
export interface Category {
  id: number;
  user_id: number;
  name: string;
  created_at: string;
  task_count?: number;
}

// 统计相关类型
export interface TaskStats {
  tasksByStatus: {
    total_tasks: number;
    pending_tasks: number;
    in_progress_tasks: number;
    completed_tasks: number;
  };
  tasksByCategory: Array<{
    id: number;
    name: string;
    task_count: number;
    completed_count: number;
  }>;
  tasksByDate: Array<{
    date: string;
    created_count: number;
    completed_count: number;
  }>;
  overdueTasks: number;
  todayTasks: number;
}
