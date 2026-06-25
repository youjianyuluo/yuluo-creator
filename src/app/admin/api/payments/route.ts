import { getSupabaseAdmin } from "@/lib/supabase";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export async function POST(request: Request) {
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
      return Response.json({ error: "无权限" }, { status: 403 });
    }

    const { recordId, action } = await request.json();

    if (!recordId || !action || !["approve", "reject"].includes(action)) {
      return Response.json({ error: "参数错误" }, { status: 400 });
    }

    const admin = getSupabaseAdmin();

    if (action === "approve") {
      // 调用数据库函数 approve_payment
      await admin.rpc("approve_payment", {
        p_record_id: recordId,
        p_admin_id: session.user.id,
      });
    } else {
      await admin.rpc("reject_payment", {
        p_record_id: recordId,
        p_admin_id: session.user.id,
      });
      // 拒绝时退款用量（如果已扣减）
      // 这里暂不实现自动退款，因为手动支付流程不自动扣用量
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error("Payment action error:", error);
    return Response.json(
      { error: "操作失败" },
      { status: 500 }
    );
  }
}
