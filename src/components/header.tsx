"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";

export function Header() {
  const { user, loading, signOut } = useAuth();

  return (
    <header className="border-b border-slate-200 bg-white/80 backdrop-blur sticky top-0 z-50">
      <nav className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link
          href="/"
          className="font-bold text-lg text-indigo-600 hover:text-indigo-700 transition-colors"
        >
          🌧️ 雨洛创作助手
        </Link>
        <div className="flex items-center gap-4 text-sm">
          <Link href="/create" className="hover:text-indigo-600 transition-colors">
            开始创作
          </Link>
          <Link href="/pricing" className="hover:text-indigo-600 transition-colors">
            定价
          </Link>
          {loading ? (
            <span className="text-slate-400 text-xs">...</span>
          ) : user ? (
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard"
                className="text-slate-600 hover:text-indigo-600 transition-colors text-xs"
              >
                📊 仪表盘
              </Link>
              <span className="text-xs text-slate-400 truncate max-w-[120px]">
                {user.email}
              </span>
              <button
                onClick={signOut}
                className="text-slate-400 hover:text-red-500 transition-colors text-xs"
              >
                退出
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="bg-indigo-600 text-white px-4 py-1.5 rounded-full hover:bg-indigo-700 transition-colors text-sm font-medium"
            >
              登录
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
