"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";

const platforms = [
  { id: "wechat", name: "公众号", icon: "📱", color: "border-green-400 hover:border-green-500 bg-green-50" },
  { id: "xiaohongshu", name: "小红书", icon: "📕", color: "border-red-300 hover:border-red-400 bg-red-50" },
  { id: "douyin", name: "抖音", icon: "🎵", color: "border-cyan-300 hover:border-cyan-400 bg-cyan-50" },
  { id: "toutiao", name: "今日头条", icon: "📰", color: "border-orange-300 hover:border-orange-400 bg-orange-50" },
];

export default function CreatePage() {
  const { user, supabase } = useAuth();
  const [idea, setIdea] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [results, setResults] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<string>("");
  const [copied, setCopied] = useState<string>("");
  const [usage, setUsage] = useState({ count: 0, limit: 5, plan: "free" });

  const resultRef = useRef<HTMLDivElement>(null);

  // Load usage data if logged in
  useEffect(() => {
    if (!user) return;
    loadUsage();
  }, [user]);

  async function loadUsage() {
    if (!user) return;
    const { data: sub } = await supabase
      .from("subscriptions")
      .select("plan")
      .eq("user_id", user.id)
      .single();
    const plan = sub?.plan || "free";
    const limit = plan === "pro" ? Infinity : 5;
    const month = new Date().toISOString().slice(0, 7);
    const { data: usageData } = await supabase
      .from("usage")
      .select("count")
      .eq("user_id", user.id)
      .eq("month", month)
      .single();
    setUsage({ count: usageData?.count || 0, limit, plan });
  }

  const togglePlatform = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const handleGenerate = async () => {
    if (!idea.trim()) return;
    if (selected.length === 0) return;

    // Check usage limit for free users
    if (user && usage.plan === "free" && usage.count >= usage.limit) {
      setError("本月免费额度已用完，请升级 Pro 版继续创作");
      return;
    }

    setLoading(true);
    setError("");
    setResults({});

    try {
      const res = await fetch("/api/generate", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea: idea.trim(), platforms: selected }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "生成失败");
      }

      const resultMap: Record<string, string> = {};
      for (const plat of selected) {
        const r = data.results[plat];
        if (r && r.content) {
          resultMap[plat] = r.content;
          // Save to database if logged in
          if (user) {
            supabase.rpc("record_generation", {
              gen_user_id: user.id,
              gen_idea: idea.trim(),
              gen_platform: plat,
              gen_content: r.content,
            }).then(() => {
              // Refresh usage
              loadUsage();
            });
          }
        } else if (r && r.error) {
          resultMap[plat] = `❌ 生成失败: ${r.error}`;
        }
      }
      setResults(resultMap);
      if (selected.length > 0) {
        setActiveTab(selected[0]);
      }
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 200);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "生成失败，请稍后重试");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, platform: string) => {
    navigator.clipboard.writeText(text);
    setCopied(platform);
    setTimeout(() => setCopied(""), 2000);
  };

  const atLimit = !!(user && usage.plan === "free" && usage.count >= usage.limit);

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-center mb-2">开始创作</h1>
      <p className="text-slate-500 text-center mb-2">
        输入你的idea，选择平台，一键生成原生文案
      </p>
      {user && (
        <p className="text-center text-xs text-slate-400 mb-6">
          本月已用 {usage.count}/{usage.plan === "pro" ? "∞" : usage.limit} 篇
          {usage.plan === "free" && (
            <Link href="/pricing" className="text-indigo-600 ml-2 hover:text-indigo-700">
              升级Pro →
            </Link>
          )}
        </p>
      )}

      {/* 输入区 */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-8 shadow-sm">
        <label className="block font-semibold mb-2 text-slate-700">
          💡 你的创作 idea
        </label>
        <textarea
          placeholder="例如：如何用AI提高工作效率、春天养生小知识、创业3年我踩过的5个坑……"
          className="w-full border border-slate-300 rounded-xl p-4 text-slate-900 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
          rows={3}
          value={idea}
          onChange={(e) => setIdea(e.target.value)}
          disabled={loading}
        />

        {/* 平台选择 */}
        <div className="mt-4 mb-2">
          <p className="text-sm font-medium text-slate-600 mb-3">选择发布平台（可多选）：</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {platforms.map((p) => (
              <button
                key={p.id}
                onClick={() => togglePlatform(p.id)}
                disabled={loading}
                className={`border-2 rounded-xl p-3 text-center transition-all ${
                  selected.includes(p.id)
                    ? `${p.color} border-2 shadow-sm scale-[1.02]`
                    : "border-slate-200 text-slate-400 hover:border-slate-300"
                }`}
              >
                <span className="text-2xl block mb-1">{p.icon}</span>
                <span className="text-sm font-medium">{p.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 生成按钮 */}
        <button
          onClick={handleGenerate}
          disabled={loading || !idea.trim() || selected.length === 0 || atLimit}
          className="mt-4 w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold text-lg hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
        >
          {atLimit ? (
            "本月额度已用完，请升级 Pro"
          ) : loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="animate-spin">⏳</span> AI正在为{selected.length}个平台创作中...
            </span>
          ) : (
            `✨ 一键生成${selected.length > 0 ? `（${selected.length}个平台）` : ""}`
          )}
        </button>

        {error && (
          <p className="mt-3 text-red-500 text-sm text-center bg-red-50 py-2 rounded-lg">
            ⚠️ {error}
          </p>
        )}
      </div>

      {/* 结果区 */}
      {Object.keys(results).length > 0 && (
        <div ref={resultRef} className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="flex border-b border-slate-200 bg-slate-50 overflow-x-auto">
            {selected
              .filter((id) => results[id])
              .map((id) => {
                const p = platforms.find((x) => x.id === id);
                return (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id)}
                    className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
                      activeTab === id
                        ? "border-indigo-600 text-indigo-600 bg-white"
                        : "border-transparent text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    {p?.icon} {p?.name}
                  </button>
                );
              })}
          </div>
          <div className="p-6">
            {activeTab && results[activeTab] && (
              <>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm text-slate-400">
                    共 {results[activeTab].length} 字
                  </p>
                  <button
                    onClick={() => copyToClipboard(results[activeTab], activeTab)}
                    className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
                  >
                    {copied === activeTab ? "✅ 已复制" : "📋 复制全文"}
                  </button>
                </div>
                <div className="prose prose-slate max-w-none whitespace-pre-wrap text-slate-800 leading-relaxed">
                  {results[activeTab]}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {Object.keys(results).length > 0 && (
        <div className="text-center mt-8">
          <button
            onClick={() => {
              setResults({});
              setError("");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="text-indigo-600 hover:text-indigo-700 font-medium text-sm"
          >
            ← 重新创作
          </button>
        </div>
      )}

      {/* 未登录提示 */}
      {!user && (
        <div className="mt-12 p-6 bg-amber-50 border border-amber-200 rounded-xl text-center">
          <p className="text-amber-800 text-sm">
            🔒 <strong>预览模式</strong>：登录后可保存历史记录，免费用户每月5篇创作额度。
          </p>
          <Link
            href="/login"
            className="inline-block mt-2 text-indigo-600 font-medium text-sm hover:text-indigo-700"
          >
            注册 / 登录 →
          </Link>
        </div>
      )}
    </div>
  );
}
