import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// 扩展 Request 类型以包含用户信息
export interface AuthRequest extends Request {
  user?: {
    id: number;
    username: string;
  };
}

export const auth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Please authenticate' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      id: number;
      username: string;
    };
    
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Please authenticate' });
  }
};
