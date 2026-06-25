# 🚀 雨洛创作助手 — Railway 部署清单

## 前置条件
- [x] GitHub 仓库: https://github.com/youjianyuluo/yuluo-creator
- [x] Supabase 项目: dodvojhmcnanoopmloyo
- [x] DeepSeek API Key 已配置
- [ ] Railway 账号（https://railway.app）

---

## 步骤 1：创建 Railway 项目

1. 登录 https://railway.app
2. New Project → **Import from GitHub**
3. 选择 `youjianyuluo/yuluo-creator`
4. Railway 会自动检测到 Next.js 项目并开始首次构建

## 步骤 2：配置环境变量

进入项目的 **Variables** 标签，添加以下变量：

| 变量名 | 值 | 来源 |
|--------|------|------|
| `DEEPSEEK_API_KEY` | `sk-9b983299892e4a0c903e903f9169153f` | 已有 |
| `DEEPSEEK_BASE_URL` | `https://api.deepseek.com` | 默认 |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://dodvojhmcnanoopmloyo.supabase.co` | Supabase Dashboard |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | *(复制自 Supabase)* | Supabase Dashboard → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | *(复制自 Supabase)* | Supabase Dashboard → Settings → API |

> ⚠️ 添加环境变量后 Railway 会自动重新构建和部署。

## 步骤 3：执行数据库 Schema

1. 打开 https://app.supabase.com/project/dodvojhmcnanoopmloyo/editor
2. 进入 **SQL Editor**
3. 复制 `supabase-schema.sql` 的全部内容
4. 粘贴到编辑器中，点 **Run**

这会创建以下表：
- `generations` — 创作记录
- `subscriptions` — 用户订阅
- `usage` — 用量统计
- `payment_records` — 支付记录

## 步骤 4：设置管理员

在 Supabase SQL Editor 中执行：

```sql
-- 将你的管理员邮箱设为 admin 角色
UPDATE auth.users 
SET raw_user_meta_data = jsonb_set(raw_user_meta_data, '{role}', '"admin"') 
WHERE email = '271312499@qq.com';
```

然后登录：
- 前台：https://你的-railway域名/login （注册/登录）
- 后台：https://你的-railway域名/admin/login （管理员登录）

## 步骤 5：验证部署

访问以下页面确认一切正常：

| 页面 | 预期结果 |
|------|----------|
| `/` | 首页正常显示 |
| `/create` | 创作页面可用 |
| `/pricing` | 定价页面 + 支付弹窗 |
| `/login` | 注册/登录表单 |
| `/dashboard` | 登录后显示仪表盘 |
| `/admin/login` | 管理员登录 |
| `/admin/dashboard` | 管理后台 |

## 步骤 6（可选）：绑定自定义域名

1. Railway → Settings → Domains
2. 添加你的域名
3. 在域名提供商处添加 CNAME 记录指向 Railway 提供的地址

---

## 费用预估

| 项目 | 月费用 |
|------|--------|
| Railway | $0（免费额度 $5/月） |
| Supabase | $0（免费层） |
| DeepSeek | $0（500万 tokens 免费） |
| 域名 | ~¥50/年 |

总计：**每月约 ¥4**（仅域名费用）
