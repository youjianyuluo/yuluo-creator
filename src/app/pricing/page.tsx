"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/lib/auth-context";

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
    cta: "微信扫码升级",
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
    q: "Pro版怎么升级？",
    a: "目前通过微信支付手动升级。点击升级按钮后扫码付款，付款后联系我们开通Pro权限，1小时内生效。后续会上线自动开通。",
  },
  {
    q: "Pro版可以随时取消吗？",
    a: "当然，联系客服随时取消，当月仍可正常使用到周期结束。",
  },
  {
    q: "生成的文案能直接发布吗？",
    a: "可以。我们的AI针对每个平台独立优化了文案风格，生成后可以直接复制发布。建议根据个人风格微调一下更好。",
  },
];

export default function PricingPage() {
  const { user } = useAuth();
  const [showPayModal, setShowPayModal] = useState(false);
  const [payMethod, setPayMethod] = useState<"wechat" | "alipay" | null>(null);
  const [copied, setCopied] = useState(false);

  const handleProUpgrade = () => {
    if (!user) {
      window.location.href = "/login";
      return;
    }
    setShowPayModal(true);
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText("271312499@qq.com");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
                className="block w-full text-center py-2.5 rounded-xl font-semibold transition-colors mb-6 bg-indigo-600 text-white hover:bg-indigo-700"
              >
                {plan.cta}
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

      {/* 支付弹窗 */}
      {showPayModal && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setShowPayModal(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">升级 Pro 版 · ¥29/月</h3>
              <button
                onClick={() => setShowPayModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xl"
              >
                ✕
              </button>
            </div>

            {/* 支付方式选择 */}
            {!payMethod ? (
              <div className="space-y-3">
                <p className="text-sm text-slate-500 mb-2">选择支付方式：</p>
                <button
                  onClick={() => setPayMethod("wechat")}
                  className="w-full border-2 border-green-400 rounded-xl p-4 text-left hover:bg-green-50 transition-colors flex items-center gap-3"
                >
                  <span className="text-2xl">💚</span>
                  <div>
                    <div className="font-semibold">微信支付</div>
                    <div className="text-xs text-slate-400">扫码付款，手动开通</div>
                  </div>
                </button>
                <button
                  onClick={() => setPayMethod("alipay")}
                  className="w-full border-2 border-blue-400 rounded-xl p-4 text-left hover:bg-blue-50 transition-colors flex items-center gap-3"
                >
                  <span className="text-2xl">💙</span>
                  <div>
                    <div className="font-semibold">支付宝</div>
                    <div className="text-xs text-slate-400">扫码付款，手动开通</div>
                  </div>
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <button
                  onClick={() => setPayMethod(null)}
                  className="text-sm text-indigo-600 hover:text-indigo-700"
                >
                  ← 返回选择
                </button>
                <div className="text-center p-4 bg-slate-50 rounded-xl">
                  <div className="text-8xl mb-2">{payMethod === "wechat" ? "💚" : "💙"}</div>
                  <p className="text-sm text-slate-500 mb-3">
                    {payMethod === "wechat" ? "微信扫码支付 ¥29" : "支付宝扫码支付 ¥29"}
                  </p>
                  {/* 付款码占位 — 后续换成真实收款码 */}
                  <div className="w-48 h-48 mx-auto bg-white border-2 border-dashed border-slate-300 rounded-xl flex items-center justify-center">
                    <div className="text-center text-slate-400">
                      <p className="text-4xl mb-1">📱</p>
                      <p className="text-xs">收款码</p>
                      <p className="text-xs">即将上传</p>
                    </div>
                  </div>
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm text-amber-800">
                  <p className="font-semibold mb-1">📌 付款后操作：</p>
                  <p>1. 截图付款凭证</p>
                  <p>
                    2. 发送至邮箱：{" "}
                    <button
                      onClick={handleCopyEmail}
                      className="text-indigo-600 font-medium hover:text-indigo-700"
                    >
                      271312499@qq.com {copied ? "✅已复制" : "📋复制"}
                    </button>
                  </p>
                  <p>3. 附上你的注册邮箱，1小时内开通Pro</p>
                </div>
              </div>
            )}
          </div>
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
