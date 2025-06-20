import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import routes from './routes';

// 加载环境变量
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// 中间件
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  exposedHeaders: ['Content-Length', 'Content-Type', 'Authorization'],
  optionsSuccessStatus: 204,
  preflightContinue: false
}));
app.use(express.json());

// 路由
app.use('/api', routes);

// 简单的健康检查端点
app.get('/', (_req, res) => {
  res.json({ message: 'Todo API is running' });
});

// 错误处理中间件
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;
