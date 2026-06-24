import Link from "next/link";

const platforms = [
  { icon: "📱", name: "公众号", desc: "深度长文 · 知识型内容 · 1500-3000字" },
  { icon: "📕", name: "小红书", desc: "种草笔记 · 口语化 · 300-800字" },
  { icon: "🎵", name: "抖音", desc: "短视频脚本 · 30-60秒 · 高完播率" },
  { icon: "📰", name: "今日头条", desc: "资讯风格 · 观点鲜明 · 800-1500字" },
];

const features = [
  {
    title: "🎯 一个idea，四平台输出",
    desc: "不用再为每个平台单独写文案。输入你的想法，自动生成公众号、小红书、抖音、头条四个平台的原生文案。",
  },
  {
    title: "🧠 不是翻译，是真本地化",
    desc: "每个平台独立prompt优化。公众号有深度、小红书有温度、抖音有节奏、头条有观点——不是一套文案改改就发。",
  },
  {
    title: "⚡ 5分钟 = 4篇高质量文案",
    desc: "过去花2小时写一篇，现在5分钟出4篇。把时间花在创意上，别花在重复劳动上。",
  },
  {
    title: "💰 省钱模式",
    desc: "免费用户每月5篇。Pro版只要¥29/月，无限创作。一杯奶茶的钱，换一个月的文案自由。",
  },
];

export default function Home() {
  return (
    <div>
      {/* Hero */}
      <section className="max-w-4xl mx-auto px-4 pt-20 pb-16 text-center">
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 mb-6">
          一个 idea，
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
            四平台原生文案
          </span>
          一键生成
        </h1>
        <p className="text-lg sm:text-xl text-slate-500 mb-8 max-w-2xl mx-auto leading-relaxed">
          公众号 · 小红书 · 抖音 · 今日头条 —— 每个平台独立创作，不是翻译，是真正的本地化文案。
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/create"
            className="bg-indigo-600 text-white px-8 py-3 rounded-full text-lg font-semibold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
          >
            开始创作 → 免费
          </Link>
          <Link
            href="/pricing"
            className="border border-slate-300 text-slate-700 px-8 py-3 rounded-full text-lg font-medium hover:bg-slate-50 transition-colors"
          >
            查看定价
          </Link>
        </div>
      </section>

      {/* 平台支持 */}
      <section className="max-w-5xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold text-center mb-8">支持四大内容平台</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {platforms.map((p) => (
            <div
              key={p.name}
              className="bg-white border border-slate-200 rounded-xl p-5 text-center hover:shadow-md hover:border-indigo-200 transition-all"
            >
              <div className="text-3xl mb-2">{p.icon}</div>
              <div className="font-semibold text-slate-900">{p.name}</div>
              <div className="text-xs text-slate-400 mt-1">{p.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* 为什么选我们 */}
      <section className="max-w-5xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold text-center mb-8">为什么选雨洛？</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {features.map((f) => (
            <div
              key={f.title}
              className="bg-white border border-slate-200 rounded-xl p-6 hover:shadow-md transition-all"
            >
              <h3 className="font-bold text-lg mb-2">{f.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl p-10 text-white">
          <h2 className="text-3xl font-bold mb-4">准备好让你的创作飞起来？</h2>
          <p className="text-indigo-100 mb-6 text-lg">
            免费开始，5篇/月。觉得好用再升级。
          </p>
          <Link
            href="/create"
            className="inline-block bg-white text-indigo-600 px-10 py-3 rounded-full text-lg font-bold hover:bg-indigo-50 transition-colors shadow-lg"
          >
            免费开始创作 →
          </Link>
        </div>
      </section>
    </div>
  );
}
