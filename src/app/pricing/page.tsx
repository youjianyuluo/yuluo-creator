"use client";

import { useState } from "react";
import Link from "next/link";

const plans = [
  {
    name: "免费版",
    price: "¥0",
    period: "永久免费",
    desc: "试试看，够用就好",
    features: [
      "每月5篇创作",
      "四平台全支持",
      "基础文案风格",
      "复制导出",
    ],
    missing: ["无历史记录", "不支持批量生成"],
    cta: "免费开始",
    href: "/create",
    highlight: false,
    isPro: false,
  },
  {
    name: "Pro版",
    price: "¥29",
    period: "/月",
    desc: "一人公司/自媒体博主首选",
    features: [
      "无限创作次数",
      "四平台全支持",
      "优化文案风格",
      "历史记录永久保存",
      "批量四平台一键生成",
      "优先客服支持",
      "提前体验新功能",
    ],
    missing: [],
    cta: "升级 Pro",
    href: "#",
    highlight: true,
    isPro: true,
  },
];

const faqs = [
  {
    q: "免费版真的免费吗？",
    a: "是的，免费版永久免费，每月5篇创作额度。不需要绑卡，注册即可使用。",
  },
  {
    q: "Pro版可以随时取消吗？",
    a: "当然，随时取消，不会有额外费用。取消后当前订阅周期内仍可正常使用。",
  },
  {
    q: "生成的文案能直接发布吗？",
    a: "可以。我们的AI针对每个平台独立优化了文案风格，生成后可以直接复制发布。建议根据个人风格微调一下更好。",
  },
  {
    q: "支持哪些平台？",
    a: "目前支持：微信公众号、小红书、抖音（脚本）、今日头条。更多平台持续加入中。",
  },
];

export default function PricingPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleProUpgrade = async () => {
    setLoading(true);
    setMessage(null);

    try {
      const stripePriceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_ID;
      if (!stripePriceId) {
        setMessage({ type: "error", text: "支付系统暂未配置，请稍后再试" });
        return;
      }

      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId: stripePriceId }),
      });

      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || "创建支付会话失败");
      }
    } catch (err: unknown) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "操作失败，请稍后重试",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-center mb-2">定价方案</h1>
      <p className="text-slate-500 text-center mb-10">
        一杯奶茶钱，换一个月的文案自由 🧋
      </p>

      {/* 定价卡片 */}
      <div className="grid md:grid-cols-2 gap-6 mb-16">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`bg-white border-2 rounded-2xl p-8 ${
              plan.highlight
                ? "border-indigo-600 shadow-lg shadow-indigo-100 relative"
                : "border-slate-200"
            }`}
          >
            {plan.highlight && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white px-4 py-0.5 rounded-full text-xs font-bold">
                🔥 推荐
              </div>
            )}
            <div className="text-xl font-bold text-slate-900 mb-1">{plan.name}</div>
            <div className="text-sm text-slate-400 mb-4">{plan.desc}</div>
            <div className="mb-4">
              <span className="text-4xl font-extrabold text-slate-900">{plan.price}</span>
              <span className="text-slate-400">{plan.period}</span>
            </div>
            {plan.isPro ? (
              <button
                onClick={handleProUpgrade}
                disabled={loading}
                className={`block w-full text-center py-2.5 rounded-xl font-semibold transition-colors mb-6 bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50`}
              >
                {loading ? "正在跳转..." : plan.cta}
              </button>
            ) : (
              <Link
                href={plan.href}
                className="block text-center py-2.5 rounded-xl font-semibold transition-colors mb-6 bg-slate-100 text-slate-700 hover:bg-slate-200"
              >
                {plan.cta}
              </Link>
            )}
            <ul className="space-y-2">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-slate-700">
                  <span className="text-green-500 mt-0.5">✓</span> {f}
                </li>
              ))}
              {plan.missing.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-slate-400">
                  <span className="text-slate-300 mt-0.5">—</span> {f}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {message && (
        <div
          className={`max-w-md mx-auto mb-8 text-center text-sm py-2 rounded-lg ${
            message.type === "success"
              ? "bg-green-50 text-green-700"
              : "bg-red-50 text-red-600"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* FAQ */}
      <h2 className="text-2xl font-bold text-center mb-6">常见问题</h2>
      <div className="space-y-3 max-w-2xl mx-auto">
        {faqs.map((faq) => (
          <details
            key={faq.q}
            className="bg-white border border-slate-200 rounded-xl p-4 group"
          >
            <summary className="font-medium text-slate-900 cursor-pointer group-open:text-indigo-600 transition-colors">
              {faq.q}
            </summary>
            <p className="mt-2 text-sm text-slate-500 leading-relaxed">{faq.a}</p>
          </details>
        ))}
      </div>
    </div>
  );
}
