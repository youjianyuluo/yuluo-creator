-- 雨洛创作助手 - Supabase 数据库 Schema v2
-- 在 Supabase SQL Editor 中执行此文件

-- ============================================
-- 1. 用户创作记录表
-- ============================================
CREATE TABLE IF NOT EXISTS generations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  idea TEXT NOT NULL,
  platform TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);
CREATE INDEX idx_generations_user_date ON generations (user_id, created_at DESC);

-- ============================================
-- 2. 用户订阅表
-- ============================================
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

-- ============================================
-- 3. 用量表（用户每月创作次数）
-- ============================================
CREATE TABLE IF NOT EXISTS usage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  month TEXT NOT NULL,
  count INTEGER DEFAULT 0,
  UNIQUE (user_id, month)
);
CREATE INDEX idx_usage_user_month ON usage (user_id, month);

-- ============================================
-- 4. 支付记录表（手动支付流程）
-- ============================================
CREATE TABLE IF NOT EXISTS payment_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount NUMERIC(10,2) NOT NULL DEFAULT 29.00,
  currency TEXT NOT NULL DEFAULT 'CNY',
  method TEXT NOT NULL CHECK (method IN ('wechat', 'alipay')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  proof_image_url TEXT,
  notes TEXT,
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX idx_payment_records_user ON payment_records (user_id, created_at DESC);
CREATE INDEX idx_payment_records_status ON payment_records (status);

-- ============================================
-- 5. RLS 策略
-- ============================================
ALTER TABLE generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_records ENABLE ROW LEVEL SECURITY;

-- generations: 用户可读可写自己的记录
CREATE POLICY "Users can manage own generations"
  ON generations FOR ALL
  USING (auth.uid() = user_id);

-- subscriptions: 用户只读自己的；admin 可读写全部
CREATE POLICY "Users can read own subscription"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admin can manage all subscriptions"
  ON subscriptions FOR ALL
  USING (auth.uid() IN (SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'));

-- usage: 用户只读自己的；admin 可读全部
CREATE POLICY "Users can read own usage"
  ON usage FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admin can read all usage"
  ON usage FOR SELECT
  USING (auth.uid() IN (SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'));

-- payment_records: 用户只读自己的；admin 可读全部并可更新
CREATE POLICY "Users can manage own payment records"
  ON payment_records FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own payment records"
  ON payment_records FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admin can read all payment records"
  ON payment_records FOR SELECT
  USING (auth.uid() IN (SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'));

CREATE POLICY "Admin can update payment records"
  ON payment_records FOR UPDATE
  USING (auth.uid() IN (SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'));

-- ============================================
-- 6. 触发器：新用户自动创建免费订阅和用量
-- ============================================
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

-- ============================================
-- 7. 函数：检查用量限制
-- ============================================
CREATE OR REPLACE FUNCTION check_usage_limit(user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  user_plan TEXT;
  current_month TEXT;
  usage_count INTEGER;
BEGIN
  SELECT plan INTO user_plan FROM subscriptions WHERE user_id = check_usage_limit.user_id;
  IF user_plan = 'pro' THEN
    RETURN TRUE;
  END IF;
  current_month := to_char(now(), 'YYYY-MM');
  SELECT count INTO usage_count FROM usage
  WHERE user_id = check_usage_limit.user_id AND month = current_month;
  RETURN COALESCE(usage_count, 0) < 5;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 8. 函数：记录创作
-- ============================================
CREATE OR REPLACE FUNCTION record_generation(
  user_id UUID,
  idea TEXT,
  platform TEXT,
  content TEXT
) RETURNS VOID AS $$
DECLARE
  current_month TEXT;
BEGIN
  INSERT INTO generations (user_id, idea, platform, content) VALUES (user_id, idea, platform, content);
  current_month := to_char(now(), 'YYYY-MM');
  INSERT INTO usage (user_id, month, count) VALUES (user_id, current_month, 1)
  ON CONFLICT (user_id, month) DO UPDATE SET count = usage.count + 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 9. 函数：管理员批准支付并升级用户
-- ============================================
CREATE OR REPLACE FUNCTION approve_payment(
  p_record_id UUID,
  p_admin_id UUID
) RETURNS VOID AS $$
DECLARE
  v_user_id UUID;
  v_plan RECORD;
BEGIN
  -- 获取支付记录的用户ID
  SELECT user_id INTO v_user_id FROM payment_records WHERE id = p_record_id;

  -- 更新支付记录状态
  UPDATE payment_records
  SET status = 'approved', approved_by = p_admin_id, approved_at = now()
  WHERE id = p_record_id;

  -- 升级用户订阅
  UPDATE subscriptions
  SET plan = 'pro', updated_at = now()
  WHERE user_id = v_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 10. 函数：管理员拒绝支付
-- ============================================
CREATE OR REPLACE FUNCTION reject_payment(
  p_record_id UUID,
  p_admin_id UUID
) RETURNS VOID AS $$
BEGIN
  UPDATE payment_records
  SET status = 'rejected', approved_by = p_admin_id, approved_at = now()
  WHERE id = p_record_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
