# PI-Todo 应用部署指南

## 1. 准备服务器环境

### 安装 Node.js (使用 yum)

```bash
# 添加 NodeSource 仓库
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -

# 安装 Node.js
sudo yum install -y nodejs

# 验证安装
node -v
npm -v
```

### 安装 MySQL

```bash
# 安装 MySQL
sudo yum install -y mysql-server

# 启动 MySQL 服务
sudo systemctl start mysqld
sudo systemctl enable mysqld

# 获取初始密码 (仅在首次安装时需要)
sudo grep 'temporary password' /var/log/mysqld.log

# 运行安全配置脚本
sudo mysql_secure_installation
```

### 安装 Nginx

```bash
# 安装 Nginx
sudo yum install -y nginx

# 启动 Nginx 服务
sudo systemctl start nginx
sudo systemctl enable nginx

# 允许 HTTP 和 HTTPS 流量
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload
```

## 2. 数据库设置

### 创建数据库和用户

```bash
# 登录 MySQL
mysql -u root -p

# 创建数据库和用户
CREATE DATABASE `pi-todo`;
CREATE USER 'pi-todo-user'@'localhost' IDENTIFIED BY '安全密码';
GRANT ALL PRIVILEGES ON `pi-todo`.* TO 'pi-todo-user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 导入数据库结构

```bash
# 将 database.sql 上传到服务器
scp backend/database.sql username@your-server-ip:/tmp/

# 导入数据库结构
mysql -u pi-todo-user -p pi-todo < /tmp/database.sql
```

## 3. 部署后端应用

### 准备后端目录

```bash
# 创建应用目录
sudo mkdir -p /var/www/pi-todo/backend
sudo chown -R $USER:$USER /var/www/pi-todo
```

### 上传和配置后端代码

```bash
# 在本地打包后端代码 (排除 node_modules 和 .git)
cd backend
tar --exclude='node_modules' --exclude='.git' -czvf backend.tar.gz .

# 上传到服务器
scp backend.tar.gz username@your-server-ip:/var/www/pi-todo/backend/

# 在服务器上解压和配置
ssh username@your-server-ip
cd /var/www/pi-todo/backend
tar -xzvf backend.tar.gz
npm install
npm run build

# 创建生产环境配置文件
cat > .env << EOF
PORT=3001
DB_HOST=localhost
DB_USER=pi-todo-user
DB_PASSWORD=安全密码
DB_NAME=pi-todo
JWT_SECRET=生成一个长的随机字符串
FRONTEND_URL=https://你的域名
EOF
```

### 使用 PM2 管理后端进程

```bash
# 全局安装 PM2
sudo npm install -g pm2

# 启动应用
pm2 start dist/app.js --name "pi-todo-backend"

# 设置开机自启
pm2 startup
pm2 save
```

### 配置 Nginx 反向代理

```bash
# 创建 Nginx 配置文件
sudo nano /etc/nginx/conf.d/pi-todo-backend.conf
```

添加以下内容:

```nginx
server {
    listen 80;
    server_name api.你的域名.com;  # 为API设置子域名

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# 测试 Nginx 配置
sudo nginx -t

# 重启 Nginx
sudo systemctl restart nginx
```

## 4. 部署前端应用

### 准备前端目录

```bash
# 创建前端目录
sudo mkdir -p /var/www/pi-todo/frontend
```

### 构建和部署前端代码

```bash
# 在本地构建前端
cd frontend
npm install
npm run build

# 打包构建产物
tar -czvf frontend-build.tar.gz .next public

# 上传到服务器
scp frontend-build.tar.gz username@your-server-ip:/var/www/pi-todo/frontend/

# 在服务器上解压
ssh username@your-server-ip
cd /var/www/pi-todo/frontend
tar -xzvf frontend-build.tar.gz

# 安装生产依赖
npm install --production

# 创建 .env.local 文件
cat > .env.local << EOF
NEXT_PUBLIC_API_URL=https://api.你的域名.com/api
EOF
```

### 使用 PM2 管理前端进程

```bash
# 启动 Next.js 应用
pm2 start npm --name "pi-todo-frontend" -- start

# 保存 PM2 配置
pm2 save
```

### 配置 Nginx 反向代理

```bash
# 创建 Nginx 配置文件
sudo nano /etc/nginx/conf.d/pi-todo-frontend.conf
```

添加以下内容:

```nginx
server {
    listen 80;
    server_name 你的域名.com www.你的域名.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# 测试 Nginx 配置
sudo nginx -t

# 重启 Nginx
sudo systemctl restart nginx
```

## 5. 配置 HTTPS (使用 Let's Encrypt)

```bash
# 安装 Certbot
sudo yum install -y certbot python3-certbot-nginx

# 获取并配置 SSL 证书
sudo certbot --nginx -d 你的域名.com -d www.你的域名.com -d api.你的域名.com

# 测试自动续期
sudo certbot renew --dry-run
```

## 6. 监控和维护

### 设置日志轮转

```bash
sudo nano /etc/logrotate.d/pi-todo
```

添加以下内容:

```
/var/www/pi-todo/*/logs/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 www-data www-data
}
```

### 自动备份数据库

创建备份脚本:

```bash
sudo nano /usr/local/bin/backup-pi-todo.sh
```

添加以下内容:

```bash
#!/bin/bash
BACKUP_DIR="/var/backups/pi-todo"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/pi-todo-$TIMESTAMP.sql.gz"

# 创建备份目录
mkdir -p $BACKUP_DIR

# 备份数据库
mysqldump -u pi-todo-user -p'安全密码' pi-todo | gzip > $BACKUP_FILE

# 保留最近30天的备份
find $BACKUP_DIR -type f -name "pi-todo-*.sql.gz" -mtime +30 -delete
```

设置执行权限和定时任务:

```bash
sudo chmod +x /usr/local/bin/backup-pi-todo.sh
sudo crontab -e
```

添加定时任务 (每天凌晨2点执行):

```
0 2 * * * /usr/local/bin/backup-pi-todo.sh
```

## 7. 更新应用

### 更新后端

```bash
cd /var/www/pi-todo/backend
git pull  # 如果使用 Git
npm install
npm run build
pm2 restart pi-todo-backend
```

### 更新前端

```bash
cd /var/www/pi-todo/frontend
git pull  # 如果使用 Git
npm install
npm run build
pm2 restart pi-todo-frontend
```

## 常见问题排查

### 检查应用状态

```bash
# 检查后端状态
pm2 status
pm2 logs pi-todo-backend

# 检查前端状态
pm2 logs pi-todo-frontend

# 检查 Nginx 状态
sudo systemctl status nginx
sudo tail -f /var/log/nginx/error.log
```

### 排查数据库问题

```bash
# 检查 MySQL 状态
sudo systemctl status mysqld
sudo tail -f /var/log/mysqld.log

# 登录数据库检查
mysql -u pi-todo-user -p pi-todo
```

### 排查 CORS 问题

检查后端 CORS 配置 (`backend/src/app.ts`):
- 确保 `origin` 设置正确
- 确保 `allowedHeaders` 和 `methods` 设置适当

如有需要，编辑并重新部署。 