import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

function getStripe() {
  const { default: Stripe } = require("stripe");
  return new Stripe(process.env.STRIPE_SECRET_KEY!);
}

// 必须禁用 body 解析，Stripe 需要原始 body
export async function POST(request: NextRequest) {
  const body = await request.text();
  const sig = request.headers.get("stripe-signature")!;

  try {
    const stripe = getStripe();
    const event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    // 处理订阅事件
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const userId = session.metadata?.user_id;
        const subscriptionId = session.subscription as string;

        if (userId && subscriptionId) {
          // 获取 subscription 详情
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);

          await supabaseAdmin
            .from("subscriptions")
            .upsert({
              user_id: userId,
              plan: "pro",
              stripe_subscription_id: subscriptionId,
              current_period_start: new Date(
                subscription.current_period_start * 1000
              ).toISOString(),
              current_period_end: new Date(
                subscription.current_period_end * 1000
              ).toISOString(),
              status: subscription.status,
              updated_at: new Date().toISOString(),
            });
        }
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object;
        const subscriptionId = invoice.subscription as string;

        if (subscriptionId) {
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          const userId = subscription.metadata?.user_id;

          if (userId) {
            await supabaseAdmin
              .from("subscriptions")
              .update({
                current_period_start: new Date(
                  subscription.current_period_start * 1000
                ).toISOString(),
                current_period_end: new Date(
                  subscription.current_period_end * 1000
                ).toISOString(),
                status: "active",
                updated_at: new Date().toISOString(),
              })
              .eq("user_id", userId);
          }
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        const userId = subscription.metadata?.user_id;

        if (userId) {
          await supabaseAdmin
            .from("subscriptions")
            .update({
              plan: "free",
              status: "canceled",
              updated_at: new Date().toISOString(),
            })
            .eq("user_id", userId);
        }
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: unknown) {
    console.error("Stripe webhook 错误:", error);
    const message =
      error instanceof Error ? error.message : "Webhook 处理失败";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
