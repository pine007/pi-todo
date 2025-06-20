import { Response } from 'express';
import pool from '../config/database';
import { AuthRequest } from '../middleware/auth';

// 创建新分类
export const createCategory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name } = req.body;
    const user_id = req.user?.id;

    if (!user_id) {
      res.status(401).json({ error: 'Not authorized' });
      return;
    }

    if (!name) {
      res.status(400).json({ error: 'Category name is required' });
      return;
    }

    // 检查是否已存在同名分类
    const [existingCategories]: any = await pool.query(
      'SELECT * FROM categories WHERE user_id = ? AND name = ?',
      [user_id, name]
    );

    if (existingCategories.length > 0) {
      res.status(400).json({ error: 'Category with this name already exists' });
      return;
    }

    const [result]: any = await pool.query(
      'INSERT INTO categories (user_id, name) VALUES (?, ?)',
      [user_id, name]
    );

    res.status(201).json({
      id: result.insertId,
      user_id,
      name,
      created_at: new Date()
    });
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// 获取所有分类
export const getCategories = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user_id = req.user?.id;

    if (!user_id) {
      res.status(401).json({ error: 'Not authorized' });
      return;
    }

    // 获取分类及每个分类的任务数量
    const [categories]: any = await pool.query(`
      SELECT c.*, COUNT(t.id) as task_count 
      FROM categories c
      LEFT JOIN tasks t ON c.id = t.category_id
      WHERE c.user_id = ?
      GROUP BY c.id
      ORDER BY c.name
    `, [user_id]);

    res.json(categories);
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// 更新分类
export const updateCategory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const user_id = req.user?.id;

    if (!user_id) {
      res.status(401).json({ error: 'Not authorized' });
      return;
    }

    if (!name) {
      res.status(400).json({ error: 'Category name is required' });
      return;
    }

    // 检查分类是否存在且属于当前用户
    const [categories]: any = await pool.query(
      'SELECT * FROM categories WHERE id = ? AND user_id = ?',
      [id, user_id]
    );

    if (categories.length === 0) {
      res.status(404).json({ error: 'Category not found' });
      return;
    }

    // 检查新名称是否与其他分类冲突
    const [existingCategories]: any = await pool.query(
      'SELECT * FROM categories WHERE user_id = ? AND name = ? AND id != ?',
      [user_id, name, id]
    );

    if (existingCategories.length > 0) {
      res.status(400).json({ error: 'Category with this name already exists' });
      return;
    }

    await pool.query(
      'UPDATE categories SET name = ? WHERE id = ? AND user_id = ?',
      [name, id, user_id]
    );

    res.json({
      id: parseInt(id),
      user_id,
      name
    });
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// 删除分类
export const deleteCategory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const user_id = req.user?.id;

    if (!user_id) {
      res.status(401).json({ error: 'Not authorized' });
      return;
    }

    const [result]: any = await pool.query(
      'DELETE FROM categories WHERE id = ? AND user_id = ?',
      [id, user_id]
    );

    if (result.affectedRows === 0) {
      res.status(404).json({ error: 'Category not found' });
      return;
    }

    // 分类被删除后，相关任务的 category_id 会自动设为 NULL (通过外键约束)
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
