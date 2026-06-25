# 雨洛创作助手 — 部署指南 v2

## 前置条件

1. [GitHub](https://github.com) 账号
2. [Vercel](https://vercel.com) 账号（用 GitHub 登录）
3. [Supabase](https://supabase.com) 账号
4. [DeepSeek](https://platform.deepseek.com) 账号

## 部署步骤

### 1. Supabase 配置

1. 打开 https://app.supabase.com，创建新项目
2. 进入 SQL Editor，执行 `supabase-schema.sql` 中的全部 SQL
3. 进入 Project Settings → API，复制：
   - `Project URL` → 填到 Vercel 环境变量 `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public key` → 填到 `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role key` → 填到 `SUPABASE_SERVICE_ROLE_KEY`
4. 进入 Authentication → Providers，启用 Email 登录
5. 进入 Authentication → URL Configuration：
   - Site URL: `https://你的域名.vercel.app`
   - Redirect URLs: `https://你的域名.vercel.app/auth/callback`

### 2. DeepSeek API 配置

1. 打开 https://platform.deepseek.com/api_keys
2. 创建 API Key
3. 复制到 Vercel 环境变量 `DEEPSEEK_API_KEY`

### 3. 管理员账号设置

1. 在 Supabase Dashboard → Authentication → Users 中创建管理员账号
2. 使用邮箱 `271312499@qq.com` 注册（与代码中硬编码的管理员邮箱一致）
3. 注册后，在 Supabase SQL Editor 中执行：
   ```sql
   UPDATE auth.users SET raw_user_meta_data = jsonb_set(raw_user_meta_data, '{role}', '"admin"') WHERE email = '271312499@qq.com';
   ```
4. 登录后可访问 `/admin/dashboard` 管理后台

### 4. 支付配置

#### 收款码
1. 准备微信收款码和支付宝收款码图片
2. 将图片放入 `public/` 目录（例如 `public/wechat-pay.png`、`public/alipay.png`）
3. 在 `src/app/pricing/page.tsx` 中替换收款码占位图为真实图片：
   ```tsx
   <Image src="/wechat-pay.png" alt="微信支付" width={192} height={192} />
   ```

#### 支付流程
- 用户选择 Pro → 扫码付款 → 提交支付申请
- 管理员在 `/admin/dashboard` 审核通过 → 自动升级为 Pro
- 审核拒绝 → 用户收到通知

### 5. Vercel 部署

1. 推送代码到 GitHub
2. 打开 https://vercel.com/new，导入 GitHub 仓库
3. 配置环境变量（Settings → Environment Variables）：
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `DEEPSEEK_API_KEY`
   - `DEEPSEEK_BASE_URL`（默认 https://api.deepseek.com）
   - `NEXT_PUBLIC_APP_URL`（填 Vercel 分配的域名）
4. 点击 Deploy

### 6. 域名配置（可选）

1. 购买域名（推荐 Namecheap 或阿里云）
2. 在 Vercel → Settings → Domains 添加域名
3. 更新 DNS 解析指向 Vercel
4. 更新 Supabase 的 Site URL 和 Redirect URLs

## 本地开发

```bash
# 复制环境变量
cp .env.example .env.local
# 编辑 .env.local，填入真实值

# 启动开发服务器
npm run dev
# http://localhost:3000
```

## 项目路由总览

| 路由 | 说明 | 公开 |
|------|------|------|
| `/` | 首页 | ✅ |
| `/create` | 创作页面 | ✅（登录后可保存历史） |
| `/pricing` | 定价页面 | ✅ |
| `/login` | 登录/注册 | ✅ |
| `/dashboard` | 用户仪表盘 | 🔒 需登录 |
| `/admin/login` | 管理员登录 | 🔒 仅管理员 |
| `/admin/dashboard` | 管理后台 | 🔒 仅管理员 |

## 管理后台功能

- 📊 统计概览：用户数、待审核支付、总创作次数
- 💰 支付审核：通过/拒绝用户的 Pro 升级申请
- 📝 创作记录：查看最近的所有生成内容

## 成本预估（月）

| 项目 | 免费层 | 超免费后 |
|------|--------|----------|
| Vercel | 100GB 带宽 | $20/月起 |
| Supabase | 500MB 数据库 | $25/月起 |
| DeepSeek | 5M tokens | ¥1/百万tokens |
| 微信/支付宝 | - | 0%手续费（手动开通） |
| 域名 | - | ~¥50/年 |
