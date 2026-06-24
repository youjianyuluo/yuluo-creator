import Link from "next/link";
import "./globals.css";

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
        <header className="border-b border-slate-200 bg-white/80 backdrop-blur sticky top-0 z-50">
          <nav className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
            <Link href="/" className="font-bold text-lg text-indigo-600 hover:text-indigo-700 transition-colors">
              🌧️ 雨洛创作助手
            </Link>
            <div className="flex items-center gap-4 text-sm">
              <Link href="/create" className="hover:text-indigo-600 transition-colors">
                开始创作
              </Link>
              <Link href="/pricing" className="hover:text-indigo-600 transition-colors">
                定价
              </Link>
              <Link
                href="/login"
                className="bg-indigo-600 text-white px-4 py-1.5 rounded-full hover:bg-indigo-700 transition-colors text-sm font-medium"
              >
                登录
              </Link>
            </div>
          </nav>
        </header>
        <main>{children}</main>
        <footer className="border-t border-slate-200 bg-white py-8 mt-20">
          <div className="max-w-6xl mx-auto px-4 text-center text-sm text-slate-500">
            <p>© 2026 佑见雨洛公司 · 雨洛创作助手</p>
            <p className="mt-1">让每个创作者都有AI队友 🤝</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
