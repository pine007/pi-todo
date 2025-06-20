import { Response } from 'express';
import pool from '../config/database';
import { AuthRequest } from '../middleware/auth';

// 获取任务统计信息
export const getTaskStats = async (req: AuthRequest, res: Response) => {
  try {
    const user_id = req.user?.id;

    if (!user_id) {
      return res.status(401).json({ error: 'Not authorized' });
    }

    // 按状态统计任务数量
    const [statusStats]: any = await pool.query(`
      SELECT 
        COUNT(*) as total_tasks,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_tasks,
        SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress_tasks,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_tasks
      FROM tasks 
      WHERE user_id = ?
    `, [user_id]);

    // 按分类统计任务数量
    const [categoryStats]: any = await pool.query(`
      SELECT 
        c.id,
        c.name,
        COUNT(t.id) as task_count,
        SUM(CASE WHEN t.status = 'completed' THEN 1 ELSE 0 END) as completed_count
      FROM categories c
      LEFT JOIN tasks t ON c.id = t.category_id AND t.user_id = ?
      WHERE c.user_id = ?
      GROUP BY c.id
      ORDER BY task_count DESC
    `, [user_id, user_id]);

    // 按日期统计任务
    const [dateStats]: any = await pool.query(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as created_count,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_count
      FROM tasks
      WHERE user_id = ? AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      GROUP BY DATE(created_at)
      ORDER BY date
    `, [user_id]);

    // 过期任务统计
    const [overdueStats]: any = await pool.query(`
      SELECT COUNT(*) as overdue_tasks
      FROM tasks
      WHERE user_id = ? 
        AND status != 'completed' 
        AND due_date IS NOT NULL 
        AND due_date < NOW()
    `, [user_id]);

    // 今日任务统计
    const [todayStats]: any = await pool.query(`
      SELECT COUNT(*) as today_tasks
      FROM tasks
      WHERE user_id = ? 
        AND (
          DATE(created_at) = CURDATE()
          OR (status != 'completed' AND DATE(due_date) = CURDATE())
        )
    `, [user_id]);

    res.json({
      tasksByStatus: statusStats[0],
      tasksByCategory: categoryStats,
      tasksByDate: dateStats,
      overdueTasks: overdueStats[0].overdue_tasks,
      todayTasks: todayStats[0].today_tasks
    });
  } catch (error) {
    console.error('Get task stats error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
