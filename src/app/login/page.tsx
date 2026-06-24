"use client";

import { useState } from "react";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    // 模拟登录/注册 — 后续接 Supabase Auth
    try {
      await new Promise((r) => setTimeout(r, 1000));
      setMessage({
        type: "success",
        text: isRegister ? "注册成功！跳转中..." : "登录成功！跳转中...",
      });
    } catch {
      setMessage({
        type: "error",
        text: "操作失败，请稍后再试",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-center mb-2">
          {isRegister ? "注册" : "登录"}
        </h1>
        <p className="text-slate-500 text-center text-sm mb-6">
          {isRegister ? "创建账号，免费开始创作" : "欢迎回来，继续你的创作之旅"}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              邮箱
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-4 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="your@email.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              密码
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-4 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="至少6位"
            />
          </div>

          {message && (
            <div
              className={`text-sm text-center py-2 rounded-lg ${
                message.type === "success"
                  ? "bg-green-50 text-green-700"
                  : "bg-red-50 text-red-600"
              }`}
            >
              {message.text}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-2.5 rounded-lg font-semibold hover:bg-indigo-700 disabled:bg-slate-300 transition-colors"
          >
            {loading ? "请稍候..." : isRegister ? "注册" : "登录"}
          </button>
        </form>

        <div className="mt-4 text-center text-sm text-slate-500">
          {isRegister ? (
            <>
              已有账号？{" "}
              <button
                onClick={() => setIsRegister(false)}
                className="text-indigo-600 font-medium hover:text-indigo-700"
              >
                去登录
              </button>
            </>
          ) : (
            <>
              没有账号？{" "}
              <button
                onClick={() => setIsRegister(true)}
                className="text-indigo-600 font-medium hover:text-indigo-700"
              >
                注册
              </button>
            </>
          )}
        </div>
      </div>

      <p className="text-center text-sm text-slate-400 mt-6">
        <Link href="/" className="hover:text-slate-600 transition-colors">
          ← 返回首页
        </Link>
      </p>
    </div>
  );
}
