import { Router } from 'express';
import * as userController from '../controllers/userController';
import * as taskController from '../controllers/taskController';
import * as categoryController from '../controllers/categoryController';
import * as statsController from '../controllers/statsController';
import { auth } from '../middleware/auth';

const router = Router();

// 用户认证路由
router.post('/auth/register', userController.register);
router.post('/auth/login', userController.login);
router.post('/auth/logout', userController.logout);
router.get('/auth/me', auth, userController.getCurrentUser);

// 任务管理路由
router.post('/tasks', auth, taskController.createTask);
router.get('/tasks', auth, taskController.getTasks);
router.get('/tasks/:id', auth, taskController.getTaskById);
router.put('/tasks/:id', auth, taskController.updateTask);
router.delete('/tasks/:id', auth, taskController.deleteTask);

// 分类管理路由
router.post('/categories', auth, categoryController.createCategory);
router.get('/categories', auth, categoryController.getCategories);
router.put('/categories/:id', auth, categoryController.updateCategory);
router.delete('/categories/:id', auth, categoryController.deleteCategory);

// 统计路由
router.get('/stats', auth, statsController.getTaskStats);

export default router;
