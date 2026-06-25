import { getSupabaseAdmin } from "@/lib/supabase";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export async function GET() {
  try {
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

    if (!session) {
      return Response.json({ error: "未登录" }, { status: 401 });
    }

    const isAdminUser =
      session.user.user_metadata?.role === "admin" ||
      session.user.email === "271312499@qq.com";

    if (!isAdminUser) {
      return Response.json({ error: "无权限访问" }, { status: 403 });
    }

    const admin = getSupabaseAdmin();

    const { count: totalUsers } = await admin
      .from("subscriptions")
      .select("*", { count: "exact", head: true });

    const { count: pendingPayments } = await admin
      .from("payment_records")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending");

    const { count: totalGenerations } = await admin
      .from("generations")
      .select("*", { count: "exact", head: true });

    const { data: payments } = await admin
      .from("payment_records")
      .select("*, users:user_id(email)")
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .limit(20);

    const { data: recentGens } = await admin
      .from("generations")
      .select("*, users:user_id(email)")
      .order("created_at", { ascending: false })
      .limit(10);

    return Response.json({
      stats: {
        totalUsers: totalUsers || 0,
        pendingPayments: pendingPayments || 0,
        totalGenerations: totalGenerations || 0,
      },
      payments: payments || [],
      recentGens: recentGens || [],
    });
  } catch (error) {
    console.error("Admin dashboard error:", error);
    return Response.json(
      { error: "获取数据失败" },
      { status: 500 }
    );
  }
}
