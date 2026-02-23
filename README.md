# 心迹 · Diary

一个私密、优雅的电子日记 Web 应用，支持富文本编辑、心情追踪、标签分类与写作统计。

## 功能特性

- 用户注册与 JWT 认证
- 日记增删改查（含富文本编辑器）
- 心情标记与统计图表
- 标签分类与全文搜索
- 日历打卡视图
- 导出 PDF / Markdown
- 深色 / 浅色主题切换
- 响应式设计，支持移动端
 - 响应式设计，支持移动端

## 页面截图

以下为应用界面示例（点击图片可查看大图）：

| 首页 | 编辑页面 |
| --- | --- |
| ![Home Page](frontend/src/assets/screenshots/home.png) | ![编辑页面](frontend/src/assets/screenshots/editor.png) |

截图文件位置： `frontend/src/assets/screenshots/`

## 技术栈

**前端**
- React 18 + Vite
- React Router v6
- Zustand（状态管理）
- TipTap（富文本编辑器）
- Recharts（统计图表）
- Axios（HTTP 客户端）

**后端**
- Node.js + Express
- PostgreSQL + Sequelize ORM
- JWT + bcrypt（认证加密）
- Multer（文件上传）
- Morgan + Winston（日志）

**部署**
- 前端：Vercel
- 后端：Railway / Render
- 数据库：Supabase（免费托管 PostgreSQL）

## 目录结构

```
diary-app/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── api/            # Axios 请求封装
│   │   ├── assets/         # SVG 图标、字体
│   │   ├── components/     # 通用 UI 组件
│   │   │   ├── icons/      # SVG 图标组件
│   │   │   ├── Layout.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── EntryCard.jsx
│   │   │   ├── Editor.jsx
│   │   │   └── Modal.jsx
│   │   ├── hooks/          # 自定义 Hooks
│   │   │   ├── useAuth.js
│   │   │   ├── useEntries.js
│   │   │   └── useTheme.js
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── HomePage.jsx
│   │   │   ├── EditorPage.jsx
│   │   │   ├── DetailPage.jsx
│   │   │   ├── CalendarPage.jsx
│   │   │   └── StatsPage.jsx
│   │   ├── store/
│   │   │   ├── authStore.js
│   │   │   └── entryStore.js
│   │   ├── styles/
│   │   │   ├── globals.css
│   │   │   └── theme.css
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── backend/
│   ├── config/
│   │   ├── database.js
│   │   └── jwt.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── entryController.js
│   │   └── statsController.js
│   ├── db/
│   │   ├── migrations/
│   │   └── seeders/
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── errorHandler.js
│   │   └── validate.js
│   ├── models/
│   │   ├── index.js
│   │   ├── User.js
│   │   ├── Entry.js
│   │   └── Tag.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── entries.js
│   │   └── stats.js
│   ├── utils/
│   │   ├── logger.js
│   │   └── pagination.js
│   ├── app.js
│   ├── server.js
│   └── package.json
│
├── docker-compose.yml
├── .env.example
└── README.md
```

## 快速开始

### 环境要求

- Node.js >= 18
- PostgreSQL >= 14（或使用 Docker）

### 1. 克隆项目

```bash
git clone https://github.com/yourname/diary-app.git
cd diary-app
```

### 2. 配置环境变量

```bash
cp .env.example .env
# 编辑 .env 填写数据库连接信息和 JWT 密钥
```

### 3. 启动数据库（Docker）

```bash
docker-compose up -d postgres
```

### 4. 启动后端

```bash
cd backend
npm install
npm run migrate   # 运行数据库迁移
npm run dev       # 开发模式
```

### 5. 启动前端

```bash
cd frontend
npm install
npm run dev
```

访问 http://localhost:5173

### 一键 Docker 启动

```bash
docker-compose up --build
```

## API 文档

### 认证

| 方法 | 路由 | 描述 |
|------|------|------|
| POST | `/api/auth/register` | 注册新用户 |
| POST | `/api/auth/login` | 登录，返回 JWT |
| POST | `/api/auth/refresh` | 刷新 token |
| POST | `/api/auth/logout` | 登出 |

### 日记

| 方法 | 路由 | 描述 |
|------|------|------|
| GET | `/api/entries` | 获取日记列表（支持分页、搜索、筛选） |
| GET | `/api/entries/:id` | 获取单篇日记 |
| POST | `/api/entries` | 创建新日记 |
| PUT | `/api/entries/:id` | 更新日记 |
| DELETE | `/api/entries/:id` | 删除日记 |

#### 查询参数（GET /api/entries）

```
page=1&limit=20
search=关键词
mood=happy
tag=生活
startDate=2025-01-01&endDate=2025-12-31
sortBy=date&order=desc
```

### 统计

| 方法 | 路由 | 描述 |
|------|------|------|
| GET | `/api/stats/overview` | 总览数据（总篇数、总字数、连续天数） |
| GET | `/api/stats/moods` | 心情分布 |
| GET | `/api/stats/activity` | 写作活跃度（按月/周） |
| GET | `/api/stats/tags` | 标签使用频率 |

## 数据库 Schema

```sql
-- 用户表
CREATE TABLE users (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email       VARCHAR(255) UNIQUE NOT NULL,
  username    VARCHAR(100) NOT NULL,
  password    VARCHAR(255) NOT NULL,
  avatar_url  VARCHAR(500),
  created_at  TIMESTAMP DEFAULT NOW(),
  updated_at  TIMESTAMP DEFAULT NOW()
);

-- 日记表
CREATE TABLE entries (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
  title       VARCHAR(300) NOT NULL,
  content     TEXT NOT NULL,          -- 存储 TipTap JSON 或 HTML
  content_text TEXT,                  -- 纯文本，用于全文搜索
  mood        VARCHAR(30),
  word_count  INT DEFAULT 0,
  date        DATE NOT NULL,
  is_pinned   BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMP DEFAULT NOW(),
  updated_at  TIMESTAMP DEFAULT NOW()
);

-- 标签表
CREATE TABLE tags (
  id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id  UUID REFERENCES users(id) ON DELETE CASCADE,
  name     VARCHAR(50) NOT NULL,
  UNIQUE (user_id, name)
);

-- 日记与标签关联表
CREATE TABLE entry_tags (
  entry_id  UUID REFERENCES entries(id) ON DELETE CASCADE,
  tag_id    UUID REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (entry_id, tag_id)
);

-- 全文搜索索引
CREATE INDEX entries_search_idx ON entries USING gin(to_tsvector('simple', content_text || ' ' || title));
CREATE INDEX entries_user_date_idx ON entries(user_id, date DESC);
```

## 环境变量说明

```bash
# 数据库
DATABASE_URL=postgresql://user:password@localhost:5432/diary_db

# JWT
JWT_SECRET=your-super-secret-key-min-32-chars
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your-refresh-secret
JWT_REFRESH_EXPIRES_IN=30d

# 服务器
PORT=4000
NODE_ENV=development

# 前端地址（CORS）
FRONTEND_URL=http://localhost:5173

# 文件上传（可选，用于头像）
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=5242880
```

## 贡献指南

1. Fork 本仓库
2. 创建功能分支：`git checkout -b feature/your-feature`
3. 提交变更：`git commit -m 'feat: add some feature'`
4. 推送分支：`git push origin feature/your-feature`
5. 提交 Pull Request

## 许可证

MIT License

