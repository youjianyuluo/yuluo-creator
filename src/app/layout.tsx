import Link from "next/link";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { Header } from "@/components/header";

export const metadata = {
  title: "雨洛创作助手 - 一个idea，四平台原生文案一键生成",
  description:
    "输入一个idea，自动生成公众号、小红书、抖音、今日头条的独立原创文案。每平台独立优化，不是翻译，是真正的本地化创作。",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen bg-gradient-to-b from-slate-50 to-white text-slate-900 antialiased">
        <AuthProvider>
          <Header />
          <main>{children}</main>
          <footer className="border-t border-slate-200 bg-white py-8 mt-20">
            <div className="max-w-6xl mx-auto px-4 text-center text-sm text-slate-500">
              <p>© 2026 佑见雨洛公司 · 雨洛创作助手</p>
              <p className="mt-1">让每个创作者都有AI队友 🤝</p>
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
