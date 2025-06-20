import { Response } from 'express';
import pool from '../config/database';
import { AuthRequest } from '../middleware/auth';

// 创建新任务
export const createTask = async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, category_id, due_date, status = 'pending' } = req.body;
    const user_id = req.user?.id;

    if (!user_id) {
      return res.status(401).json({ error: 'Not authorized' });
    }

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const [result]: any = await pool.query(
      'INSERT INTO tasks (user_id, category_id, title, description, status, due_date) VALUES (?, ?, ?, ?, ?, ?)',
      [user_id, category_id || null, title, description || null, status, due_date || null]
    );

    res.status(201).json({
      id: result.insertId,
      user_id,
      category_id: category_id || null,
      title,
      description: description || null,
      status,
      due_date: due_date || null,
      created_at: new Date()
    });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// 获取所有任务
export const getTasks = async (req: AuthRequest, res: Response) => {
  try {
    const user_id = req.user?.id;
    const { status, category_id } = req.query;

    if (!user_id) {
      return res.status(401).json({ error: 'Not authorized' });
    }

    let query = 'SELECT t.*, c.name as category_name FROM tasks t LEFT JOIN categories c ON t.category_id = c.id WHERE t.user_id = ?';
    const queryParams: any[] = [user_id];

    // 添加可选的过滤条件
    if (status) {
      query += ' AND t.status = ?';
      queryParams.push(status);
    }

    if (category_id) {
      query += ' AND t.category_id = ?';
      queryParams.push(category_id);
    }

    query += ' ORDER BY t.created_at DESC';

    const [tasks]: any = await pool.query(query, queryParams);
    res.json(tasks);
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// 获取单个任务
export const getTaskById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const user_id = req.user?.id;

    if (!user_id) {
      return res.status(401).json({ error: 'Not authorized' });
    }

    const [tasks]: any = await pool.query(
      'SELECT t.*, c.name as category_name FROM tasks t LEFT JOIN categories c ON t.category_id = c.id WHERE t.id = ? AND t.user_id = ?',
      [id, user_id]
    );

    if (tasks.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json(tasks[0]);
  } catch (error) {
    console.error('Get task by id error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// 更新任务
export const updateTask = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, status, category_id, due_date } = req.body;
    const user_id = req.user?.id;

    if (!user_id) {
      return res.status(401).json({ error: 'Not authorized' });
    }

    // 验证任务存在且属于当前用户
    const [tasks]: any = await pool.query(
      'SELECT * FROM tasks WHERE id = ? AND user_id = ?',
      [id, user_id]
    );

    if (tasks.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const task = tasks[0];

    // 更新任务
    await pool.query(
      'UPDATE tasks SET title = ?, description = ?, status = ?, category_id = ?, due_date = ? WHERE id = ? AND user_id = ?',
      [
        title || task.title,
        description !== undefined ? description : task.description,
        status || task.status,
        category_id !== undefined ? category_id : task.category_id,
        due_date !== undefined ? due_date : task.due_date,
        id,
        user_id
      ]
    );

    // 获取更新后的任务
    const [updatedTasks]: any = await pool.query(
      'SELECT t.*, c.name as category_name FROM tasks t LEFT JOIN categories c ON t.category_id = c.id WHERE t.id = ?',
      [id]
    );

    res.json(updatedTasks[0]);
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// 删除任务
export const deleteTask = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const user_id = req.user?.id;

    if (!user_id) {
      return res.status(401).json({ error: 'Not authorized' });
    }

    const [result]: any = await pool.query(
      'DELETE FROM tasks WHERE id = ? AND user_id = ?',
      [id, user_id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
