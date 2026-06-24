"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Generation {
  id: string;
  idea: string;
  platform: string;
  content: string;
  created_at: string;
}

const platformMap: Record<string, { icon: string; name: string }> = {
  wechat: { icon: "📱", name: "公众号" },
  xiaohongshu: { icon: "📕", name: "小红书" },
  douyin: { icon: "🎵", name: "抖音" },
  toutiao: { icon: "📰", name: "今日头条" },
};

export default function DashboardPage() {
  const [history, setHistory] = useState<Generation[]>([]);
  const [loading, setLoading] = useState(true);
  const [usage, setUsage] = useState({ count: 0, limit: 5, plan: "free" });

  useEffect(() => {
    // 模拟加载 —— 后续接 Supabase
    const timer = setTimeout(() => {
      setHistory([]);
      setUsage({ count: 0, limit: 5, plan: "free" });
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="animate-spin text-4xl mb-4">⏳</div>
        <p className="text-slate-500">加载中...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">我的仪表盘</h1>
          <p className="text-slate-500 mt-1">管理你的创作和订阅</p>
        </div>
        <Link
          href="/create"
          className="inline-flex items-center justify-center bg-indigo-600 text-white px-6 py-2.5 rounded-full font-semibold hover:bg-indigo-700 transition-colors text-sm"
        >
          ✨ 开始创作
        </Link>
      </div>

      {/* 用量卡片 */}
      <div className="grid sm:grid-cols-2 gap-4 mb-8">
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <p className="text-sm text-slate-400 mb-1">本月用量</p>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-extrabold text-slate-900">
              {usage.count}
            </span>
            <span className="text-slate-400 mb-1">/ {usage.limit} 篇</span>
          </div>
          <div className="mt-3 w-full bg-slate-100 rounded-full h-2">
            <div
              className="bg-indigo-600 h-2 rounded-full transition-all"
              style={{ width: `${Math.min((usage.count / usage.limit) * 100, 100)}%` }}
            />
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <p className="text-sm text-slate-400 mb-1">当前方案</p>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-slate-900">
              {usage.plan === "pro" ? "Pro版" : "免费版"}
            </span>
            {usage.plan === "free" && (
              <span className="bg-amber-100 text-amber-700 text-xs px-2 py-0.5 rounded-full font-medium">
                限5篇/月
              </span>
            )}
          </div>
          {usage.plan === "free" && (
            <Link
              href="/pricing"
              className="inline-block mt-3 text-sm text-indigo-600 font-medium hover:text-indigo-700"
            >
              升级到 Pro →
            </Link>
          )}
        </div>
      </div>

      {/* 历史记录 */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <h2 className="px-5 py-4 font-bold text-slate-900 border-b border-slate-100">
          📝 历史创作
        </h2>
        {history.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-4xl mb-3">📝</p>
            <p className="text-slate-500 text-sm">还没有创作记录</p>
            <Link
              href="/create"
              className="inline-block mt-2 text-indigo-600 font-medium text-sm hover:text-indigo-700"
            >
              开始你的第一次创作 →
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {history.map((item) => {
              const p = platformMap[item.platform];
              return (
                <div key={item.id} className="px-5 py-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">
                        {item.idea}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs">
                          {p?.icon} {p?.name}
                        </span>
                        <span className="text-xs text-slate-400">
                          {new Date(item.created_at).toLocaleDateString("zh-CN")}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => navigator.clipboard.writeText(item.content)}
                      className="text-xs text-indigo-600 hover:text-indigo-700 font-medium shrink-0"
                    >
                      复制
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
