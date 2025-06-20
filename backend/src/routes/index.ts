import { Router, Request, Response, NextFunction } from 'express';
import * as userController from '../controllers/userController';
import * as taskController from '../controllers/taskController';
import * as categoryController from '../controllers/categoryController';
import * as statsController from '../controllers/statsController';
import { auth, AuthRequest } from '../middleware/auth';

const router = Router();

// 用户认证路由
router.post('/auth/register', (req: Request, res: Response) => {
  userController.register(req, res);
});

router.post('/auth/login', (req: Request, res: Response) => {
  userController.login(req, res);
});

router.post('/auth/logout', (req: Request, res: Response) => {
  userController.logout(req, res);
});

router.get('/auth/me', auth, (req: AuthRequest, res: Response) => {
  userController.getCurrentUser(req, res);
});

// 任务管理路由
router.post('/tasks', auth, (req: AuthRequest, res: Response) => {
  taskController.createTask(req, res);
});

router.get('/tasks', auth, (req: AuthRequest, res: Response) => {
  taskController.getTasks(req, res);
});

router.get('/tasks/:id', auth, (req: AuthRequest, res: Response) => {
  taskController.getTaskById(req, res);
});

router.put('/tasks/:id', auth, (req: AuthRequest, res: Response) => {
  taskController.updateTask(req, res);
});

router.delete('/tasks/:id', auth, (req: AuthRequest, res: Response) => {
  taskController.deleteTask(req, res);
});

// 分类管理路由
router.post('/categories', auth, (req: AuthRequest, res: Response) => {
  categoryController.createCategory(req, res);
});

router.get('/categories', auth, (req: AuthRequest, res: Response) => {
  categoryController.getCategories(req, res);
});

router.put('/categories/:id', auth, (req: AuthRequest, res: Response) => {
  categoryController.updateCategory(req, res);
});

router.delete('/categories/:id', auth, (req: AuthRequest, res: Response) => {
  categoryController.deleteCategory(req, res);
});

// 统计路由
router.get('/stats', auth, (req: AuthRequest, res: Response) => {
  statsController.getTaskStats(req, res);
});

export default router;
