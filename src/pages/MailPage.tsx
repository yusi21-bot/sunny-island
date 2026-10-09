"use client";

import { FormEvent, useState } from "react";
import { AppState, PersonId, personMeta } from "../data";
import { SharedPostOptions } from "../constants";
import { prepareMealImage } from "../mealImage";
import { PersonMark } from "../components/SharedUI";

export function MailPage({ state, onSend, onReact }: { state: AppState; onSend: (text: string, options?: SharedPostOptions) => void; onReact: (id: string) => void }) {
  const [text, setText] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [imageError, setImageError] = useState("");
  const [kind, setKind] = useState<"note" | "photo">("note");
  const posts = [...state.messages].reverse();
  const kindMeta = {
    note: { label: "随手说", icon: "✦" }, meal: { label: "今日餐食", icon: "🍽" }, photo: { label: "今日一刻", icon: "◉" }, status: { label: "状态更新", icon: "●" }, task: { label: "完成任务", icon: "✓" },
  } as const;
  const formatPostTime = (value: string) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return new Intl.DateTimeFormat("zh-CN", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" }).format(date);
  };
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!text.trim() && !image) return;
    onSend(text.trim() || "分享了今天这一刻", { kind, image: image ?? undefined });
    setText(""); setImage(null); setKind("note"); setImageError("");
  };
  const chooseImage = async (file?: File) => {
    if (!file) return;
    setImageError("");
    try { setImage(await prepareMealImage(file)); setKind("photo"); }
    catch (error) { setImageError(error instanceof Error ? error.message : "图片处理失败"); }
  };
  return <section className="product-page family-feed-page">
    <div className="family-feed-shell">
      <aside className="family-feed-compose">
        <span className="feed-overline">家人动态</span>
        <h1>把这一刻<br />告诉家人</h1>
        <p>一句话、一顿饭或一张照片，让家人看见你的日常。</p>
        <form onSubmit={submit}>
          <div className="feed-author"><PersonMark person={state.currentUser} /><span><small>现在以</small><b>{personMeta[state.currentUser].name}</b></span></div>
          <textarea value={text} onChange={(event) => setText(event.target.value)} maxLength={160} placeholder="比如：我下班啦，正在回家……" aria-label="发布一条家人动态" />
          {image && <div className="feed-image-preview"><img src={image} alt="即将分享的照片" /><button type="button" onClick={() => setImage(null)} aria-label="移除照片">×</button></div>}
          {imageError && <small className="feed-image-error">{imageError}</small>}
          <div className="feed-compose-actions"><label><span>＋ 照片</span><input type="file" accept="image/*" onChange={(event) => void chooseImage(event.target.files?.[0])} /></label><small>{text.length} / 160</small><button type="submit" disabled={!text.trim() && !image}>发布到动态</button></div>
        </form>
        <div className="feed-quick-lines"><button type="button" onClick={() => setText("我下班啦，正在回家。")}>我下班啦</button><button type="button" onClick={() => setText("今天也辛苦啦，晚点聊。")}>给句关心</button></div>
      </aside>
      <section className="family-feed-stream" aria-label="家人最近动态">
        <header><div><span>今天的家里</span><h2>最近发生的小事</h2></div><b>{posts.length} 条动态</b></header>
        <div className="family-feed-list">
          {posts.length ? posts.map((message) => {
            const meta = kindMeta[message.kind ?? "note"];
            return <article className={`family-post kind-${message.kind ?? "note"}${message.image ? " has-image" : ""}`} key={message.id}>
              <header><PersonMark person={message.author} /><span><b>{personMeta[message.author].name}</b><small>{formatPostTime(message.createdAt)}</small></span><em>{meta.icon} {meta.label}</em></header>
              {message.image && <img className="family-post-image" src={message.image} alt={`${personMeta[message.author].name}分享的照片`} />}
              <p>{message.text}</p>
              <footer><button type="button" onClick={() => onReact(message.id)}><i />送一束光{message.reaction ? ` · ${message.reaction}` : ""}</button></footer>
            </article>;
          }) : <div className="family-feed-empty"><span>☁</span><b>今天还很安静</b><p>分享第一件小事吧。</p></div>}
        </div>
      </section>
    </div>
  </section>;
}
