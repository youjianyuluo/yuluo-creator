-- 雨洛创作助手 - Supabase 数据库 Schema
-- 在 Supabase SQL Editor 中执行此文件

-- 1. 用户创作记录表
CREATE TABLE IF NOT EXISTS generations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  idea TEXT NOT NULL,
  platform TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 索引：按用户+时间查询历史
CREATE INDEX idx_generations_user_date ON generations (user_id, created_at DESC);

-- 2. 用户订阅表
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro')),
  payment_customer_id TEXT,
  payment_subscription_id TEXT,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'past_due', 'canceled', 'expired')),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 3. 用量表（用户每月创作次数）
CREATE TABLE IF NOT EXISTS usage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  month TEXT NOT NULL, -- 格式: "2026-06"
  count INTEGER DEFAULT 0,
  UNIQUE (user_id, month)
);

-- 索引：查用户当月用量
CREATE INDEX idx_usage_user_month ON usage (user_id, month);

-- 4. RLS 策略：用户只能看自己的数据
ALTER TABLE generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage ENABLE ROW LEVEL SECURITY;

-- generations: 用户可读可写自己的记录
CREATE POLICY "Users can manage own generations"
  ON generations FOR ALL
  USING (auth.uid() = user_id);

-- subscriptions: 用户只读自己的
CREATE POLICY "Users can read own subscription"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- usage: 用户只读自己的
CREATE POLICY "Users can read own usage"
  ON usage FOR SELECT
  USING (auth.uid() = user_id);

-- 5. 触发器：新用户自动创建免费订阅和当月用量记录
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  current_month TEXT;
BEGIN
  current_month := to_char(now(), 'YYYY-MM');
  INSERT INTO public.subscriptions (user_id, plan) VALUES (NEW.id, 'free');
  INSERT INTO public.usage (user_id, month) VALUES (NEW.id, current_month);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 6. 函数：检查用户是否超过免费额度
CREATE OR REPLACE FUNCTION check_usage_limit(user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  user_plan TEXT;
  current_month TEXT;
  usage_count INTEGER;
BEGIN
  -- 获取用户订阅方案
  SELECT plan INTO user_plan FROM subscriptions WHERE user_id = check_usage_limit.user_id;

  -- 如果是pro，不限制
  IF user_plan = 'pro' THEN
    RETURN TRUE;
  END IF;

  -- 免费用户：检查当月用量
  current_month := to_char(now(), 'YYYY-MM');
  SELECT count INTO usage_count FROM usage
  WHERE user_id = check_usage_limit.user_id AND month = current_month;

  -- 不到5次就可以继续
  RETURN COALESCE(usage_count, 0) < 5;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. 函数：记录一次创作
CREATE OR REPLACE FUNCTION record_generation(
  user_id UUID,
  idea TEXT,
  platform TEXT,
  content TEXT
) RETURNS VOID AS $$
DECLARE
  current_month TEXT;
BEGIN
  -- 插入创作记录
  INSERT INTO generations (user_id, idea, platform, content) VALUES (user_id, idea, platform, content);

  -- 更新当月用量
  current_month := to_char(now(), 'YYYY-MM');
  INSERT INTO usage (user_id, month, count) VALUES (user_id, current_month, 1)
  ON CONFLICT (user_id, month) DO UPDATE SET count = usage.count + 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
