# 🌧️ 雨洛创作助手

一个 idea，四平台原生文案一键生成。

> 公众号 · 小红书 · 抖音 · 今日头条 —— 每个平台独立创作，不是翻译，是真正的本地化文案。

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/youjianyuluo/yuluo-creator)

## ✨ 功能

- 🤖 **AI 驱动**：基于 DeepSeek API，一键生成四平台原生文案
- 📱 **四平台支持**：公众号、小红书、抖音、今日头条，每平台独立优化风格
- 💰 **免费试用**：注册即送 5 篇/月免费额度
- 📊 **用户仪表盘**：查看创作历史和用量
- 🛡️ **管理后台**：支付审核、用户管理、数据统计
- 💚 **微信/支付宝**：支持手动扫码升级 Pro 版

## 🚀 快速开始

### 本地开发

```bash
# 1. 克隆项目
git clone https://github.com/youjianyuluo/yuluo-creator.git
cd yuluo-creator

# 2. 安装依赖
npm install

# 3. 配置环境变量
cp .env.example .env.local
# 编辑 .env.local，填入你的 API 密钥

# 4. 启动开发服务器
npm run dev
# 打开 http://localhost:3000
```

### 部署到 Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/youjianyuluo/yuluo-creator)

1. 点击上面的按钮或访问 https://vercel.com/new
2. 选择你的 GitHub 仓库 `youjianyuluo/yuluo-creator`
3. 配置环境变量（见下方）
4. 点击 Deploy

## 🔑 环境变量

| 变量名 | 说明 | 必填 |
|--------|------|------|
| `DEEPSEEK_API_KEY` | DeepSeek API 密钥 | ✅ |
| `DEEPSEEK_BASE_URL` | API 地址，默认 `https://api.deepseek.com` | ❌ |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 项目 URL | ✅ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase 匿名密钥 | ✅ |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Service Role 密钥 | ✅ |
| `NEXT_PUBLIC_APP_URL` | 应用地址 | ❌ |

## 📁 项目结构

```
yuluo-creator/
├── src/
│   ├── app/
│   │   ├── admin/          # 管理后台
│   │   ├── api/generate/   # AI 文案生成 API
│   │   ├── auth/callback/  # Supabase 认证回调
│   │   ├── create/         # 创作页面
│   │   ├── dashboard/      # 用户仪表盘
│   │   ├── login/          # 登录/注册
│   │   ├── pricing/        # 定价页面
│   │   ├── globals.css     # 全局样式
│   │   ├── layout.tsx      # 根布局
│   │   └── page.tsx        # 首页
│   ├── components/
│   │   └── header.tsx      # 顶部导航
│   └── lib/
│       ├── admin-guard.ts  # 管理员权限守卫
│       ├── auth-context.tsx # 认证上下文
│       ├── deepseek.ts     # DeepSeek API 客户端
│       ├── prompts.ts      # 各平台 Prompt 模板
│       ├── supabase.ts     # Supabase 服务端客户端
│       └── validator.ts    # 文案格式校验
├── public/                 # 静态资源（收款码等）
├── supabase-schema.sql     # 数据库建表脚本
└── .env.example            # 环境变量模板
```

## 🗄️ 数据库

使用 Supabase，执行 `supabase-schema.sql` 即可自动创建所有表：

- `generations` — 用户创作记录
- `subscriptions` — 用户订阅方案（free/pro）
- `usage` — 每月用量统计
- `payment_records` — 支付记录（手动审核）

新用户注册时自动创建 free 订阅和当月用量记录。

## 👤 用户路由

| 路由 | 说明 | 需要登录 |
|------|------|----------|
| `/` | 首页 | ❌ |
| `/create` | 创作页面 | ❌（登录可保存历史） |
| `/pricing` | 定价方案 | ❌ |
| `/login` | 登录/注册 | ❌ |
| `/dashboard` | 用户仪表盘 | ✅ |

## 🔐 管理后台

| 路由 | 说明 |
|------|------|
| `/admin/login` | 管理员登录 |
| `/admin/dashboard` | 管理面板（统计 + 支付审核） |

管理员邮箱默认为 `271312499@qq.com`，可在 `src/lib/auth-context.tsx` 中修改。

## 💰 定价

- **免费版**：¥0/永久，每月 5 篇创作
- **Pro 版**：¥29/月，无限创作，历史记录永久保存

目前采用手动支付流程：扫码付款 → 提交申请 → 管理员审核通过。

## 🛠️ 技术栈

- **框架**：Next.js 16 (App Router)
- **样式**：Tailwind CSS v4
- **认证**：Supabase Auth
- **数据库**：Supabase (PostgreSQL)
- **AI**：DeepSeek API (deepseek-chat)
- **部署**：Vercel

## 📄 License

MIT
