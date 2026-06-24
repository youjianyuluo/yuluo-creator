# 雨洛创作助手 — 部署指南

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

### 3. 支付配置（微信/支付宝）

1. 准备微信收款码和支付宝收款码图片
2. 在定价页替换收款码占位图（`src/app/pricing/page.tsx` 第206行附近）
3. 目前采用手动开通流程：用户扫码付款 → 发送付款凭证至邮箱 → 管理员在 Supabase Dashboard 手动升级用户 plan 为 'pro'

### 4. Vercel 部署

1. 推送代码到 GitHub：
```bash
git add .
git commit -m "雨洛创作助手 v0.1.0 — MVP 上线"
git push origin main
```

2. 打开 https://vercel.com/new，导入 GitHub 仓库
3. 配置环境变量（Settings → Environment Variables）：
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `DEEPSEEK_API_KEY`
   - `DEEPSEEK_BASE_URL`（默认 https://api.deepseek.com）
   - `NEXT_PUBLIC_APP_URL`（填 Vercel 分配的域名）

4. 点击 Deploy

### 5. 域名配置（可选）

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
```

## 成本预估（月）

| 项目 | 免费层 | 超免费后 |
|------|--------|----------|
| Vercel | 100GB 带宽 | $20/月起 |
| Supabase | 500MB 数据库 | $25/月起 |
| DeepSeek | 5M tokens | ¥1/百万tokens |
| 微信/支付宝 | - | 0%手续费（手动开通） |
| 域名 | - | ~¥50/年 |
