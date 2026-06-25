// Admin 角色检查工具
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function isAdmin(): Promise<boolean> {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) return false;

  // 检查 user_metadata 中的 role
  const userMeta = session.user.user_metadata as Record<string, unknown> | null;
  if (userMeta?.role === "admin") return true;

  // 也检查 raw_user_meta_data（Supabase auth 存储）
  const { data: profile } = await supabase
    .from("subscriptions")
    .select("user_id")
    .limit(1);

  // 如果用户是第一个注册用户（通常就是创始人），也视为 admin
  // 更可靠的方式是通过 raw_user_meta_data 设置
  return false;
}

export async function getCurrentUserId(): Promise<string | null> {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session?.user?.id ?? null;
}
