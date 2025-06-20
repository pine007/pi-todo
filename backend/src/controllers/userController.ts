import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/database';
import { AuthRequest } from '../middleware/auth';

// 注册新用户
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, email, password } = req.body;

    // 验证请求数据
    if (!username || !email || !password) {
      res.status(400).json({ error: 'All fields are required' });
      return;
    }

    // 检查用户是否已存在
    const [existingUsers]: any = await pool.query(
      'SELECT * FROM users WHERE username = ? OR email = ?',
      [username, email]
    );

    if (existingUsers.length > 0) {
      res.status(400).json({ error: 'Username or email already exists' });
      return;
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10);

    // 创建新用户
    const [result]: any = await pool.query(
      'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
      [username, email, hashedPassword]
    );

    // 生成 JWT token
    const token = jwt.sign(
      { id: result.insertId, username },
      process.env.JWT_SECRET as string,
      { expiresIn: '24h' }
    );

    res.status(201).json({ 
      message: 'User registered successfully',
      token,
      user: {
        id: result.insertId,
        username,
        email
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// 用户登录
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // 验证请求数据
    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    // 查找用户
    const [users]: any = await pool.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const user = users[0];

    // 验证密码
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    // 生成 JWT token
    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET as string,
      { expiresIn: '24h' }
    );

    res.json({ 
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// 获取当前用户信息
export const getCurrentUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ error: 'Not authorized' });
      return;
    }

    const [users]: any = await pool.query(
      'SELECT id, username, email, created_at FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json(users[0]);
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// 用户注销 - 在实际应用中，这通常是在客户端处理的，但提供一个后端端点可能有用
export const logout = async (_req: Request, res: Response): Promise<void> => {
  // JWT 是无状态的，所以从服务器端注销只需返回成功消息
  // 客户端负责删除存储的令牌
  res.json({ message: 'Logged out successfully' });
};
