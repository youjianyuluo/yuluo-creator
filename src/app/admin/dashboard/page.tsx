"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";

interface PaymentRecord {
  id: string;
  user_id: string;
  email?: string;
  amount: number;
  method: string;
  status: string;
  created_at: string;
}

interface Stats {
  totalUsers: number;
  pendingPayments: number;
  totalGenerations: number;
}

export default function AdminDashboard() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [recentGens, setRecentGens] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      router.push("/admin/login");
      return;
    }
    // 检查是否是 admin（简化检查：只有创始人邮箱）
    if (user.email !== "271312499@qq.com") {
      router.push("/");
      return;
    }
    loadDashboard();
  }, [user]);

  async function loadDashboard() {
    try {
      const res = await fetch("/admin/api/stats");
      const data = await res.json();
      if (res.status === 401 || res.status === 403) {
        router.push("/admin/login");
        return;
      }
      setStats(data.stats);
      setPayments(data.payments);
      setRecentGens(data.recentGens);
    } catch (err) {
      console.error("Failed to load dashboard:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handlePaymentAction(recordId: string, action: "approve" | "reject") {
    setActionLoading(recordId);
    try {
      const res = await fetch("/admin/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recordId, action }),
      });
      if (res.ok) {
        loadDashboard();
      }
    } catch (err) {
      console.error("Action failed:", err);
    } finally {
      setActionLoading(null);
    }
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 text-center">
        <div className="animate-spin text-4xl mb-4">⏳</div>
        <p className="text-slate-500">加载中...</p>
      </div>
    );
  }

  const methodLabel: Record<string, string> = { wechat: "微信支付", alipay: "支付宝" };
  const statusLabel: Record<string, string> = {
    pending: "待审核",
    approved: "已通过",
    rejected: "已拒绝",
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">🛡️ 管理后台</h1>
          <p className="text-slate-500 text-sm mt-1">{user?.email}</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
          >
            ← 返回前台
          </Link>
          <button
            onClick={signOut}
            className="text-sm text-slate-400 hover:text-red-500 transition-colors"
          >
            退出登录
          </button>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <p className="text-sm text-slate-400">总用户数</p>
          <p className="text-3xl font-extrabold text-slate-900 mt-1">
            {stats?.totalUsers || 0}
          </p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <p className="text-sm text-slate-400">待审核支付</p>
          <p className="text-3xl font-extrabold text-amber-600 mt-1">
            {stats?.pendingPayments || 0}
          </p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <p className="text-sm text-slate-400">总创作次数</p>
          <p className="text-3xl font-extrabold text-slate-900 mt-1">
            {stats?.totalGenerations || 0}
          </p>
        </div>
      </div>

      {/* 待审核支付 */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden mb-8">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-bold text-slate-900">💰 待审核支付</h2>
          {stats && stats.pendingPayments > 0 && (
            <span className="bg-amber-100 text-amber-700 text-xs px-2 py-0.5 rounded-full font-medium">
              {stats.pendingPayments} 条待处理
            </span>
          )}
        </div>
        {payments.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-4xl mb-2">✅</p>
            <p className="text-slate-500 text-sm">暂无待审核支付</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {payments.map((p) => (
              <div key={p.id} className="px-5 py-4 hover:bg-slate-50">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium bg-slate-100 px-2 py-0.5 rounded">
                        {methodLabel[p.method] || p.method}
                      </span>
                      <span className="text-xs text-slate-400">
                        ¥{p.amount}
                      </span>
                      <span className="text-xs text-slate-500 truncate">
                        {p.email || p.user_id}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      {new Date(p.created_at).toLocaleString("zh-CN")}
                    </p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => handlePaymentAction(p.id, "approve")}
                      disabled={actionLoading === p.id}
                      className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-green-700 disabled:bg-green-300 transition-colors"
                    >
                      {actionLoading === p.id ? "处理中..." : "✓ 通过"}
                    </button>
                    <button
                      onClick={() => handlePaymentAction(p.id, "reject")}
                      disabled={actionLoading === p.id}
                      className="bg-slate-200 text-slate-600 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-slate-300 disabled:bg-slate-100 transition-colors"
                    >
                      {actionLoading === p.id ? "处理中..." : "✕ 拒绝"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 最近创作 */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h2 className="font-bold text-slate-900">📝 最近创作</h2>
        </div>
        {recentGens.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-slate-500 text-sm">暂无创作记录</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {recentGens.map((g) => {
              const platformNames: Record<string, string> = {
                wechat: "公众号",
                xiaohongshu: "小红书",
                douyin: "抖音",
                toutiao: "头条",
              };
              return (
                <div key={g.id} className="px-5 py-3 hover:bg-slate-50">
                  <div className="flex items-center gap-3 text-sm">
                    <span className="text-slate-400 text-xs shrink-0">
                      {new Date(g.created_at).toLocaleDateString("zh-CN")}
                    </span>
                    <span className="text-xs bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded">
                      {platformNames[g.platform] || g.platform}
                    </span>
                    <span className="text-slate-600 truncate">
                      {g.idea}
                    </span>
                    <span className="text-xs text-slate-400 shrink-0">
                      {g.users?.email}
                    </span>
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
