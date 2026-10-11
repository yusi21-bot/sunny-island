import { ArrowRight, CalendarDays, Check, Heart, MessageCircle, Sprout, Sun } from "lucide-react";
import { AppState, PersonId, PageId, personMeta, localDate } from "../data";
import { SHOP_ITEMS, WEEKDAY_NAMES } from "../constants";
import { classOccurrenceKey, dateFromIso, readableDate, weekdayNumber } from "../utils";
import { PersonMark } from "../components/SharedUI";

export function HomePage({ state, onEditStatus, onNavigate }: { state: AppState; onEditStatus: (person: PersonId) => void; onNavigate: (page: PageId) => void }) {
  const today = localDate();
  const now = dateFromIso(today);
  const tasks = state.tasks.filter(task => task.owner === state.currentUser && task.scheduledDate === today);
  const classes = state.currentUser === "brother" ? state.schedule.filter(item => item.days.includes(weekdayNumber(now)) && today <= item.until) : [];
  const events = [
    ...tasks.map(task => ({ id: task.id, title: task.title, time: task.start ?? "待安排", done: task.completed, reward: task.sunlight, duration: task.duration, kind: task.subject })),
    ...classes.map(item => ({ id: item.id, title: item.title, time: item.start, done: state.completedClasses.includes(classOccurrenceKey(item, today)), reward: 20, duration: undefined, kind: "固定课程" })),
  ].sort((a, b) => a.time.localeCompare(b.time));
  const done = events.filter(event => event.done).length;
  const next = events.find(event => !event.done);
  const latest = state.messages[state.messages.length - 1];
  const reward = SHOP_ITEMS.filter(item => !state.island.unlocked.includes(item.id)).sort((a,b) => a.cost - b.cost)[0];
  const remaining = reward ? Math.max(0, reward.cost - state.island.sunlight) : 0;
  const headline = state.currentUser === "brother" ? "今天，从一件小事开始。" : "各自忙碌，也彼此惦记。";
  return <section className="island-home">
    <header className="home-welcome">
      <div><span className="section-kicker">{readableDate(now)} · {WEEKDAY_NAMES[now.getDay()]}</span><h1>{headline}</h1><p>{state.currentUser === "brother" ? "安排自己的节奏，让每一点努力都被看见。" : "照顾自己的日常，也给远方的家人留一点关心。"}</p></div>
      <button className="home-soft-button" onClick={() => onNavigate("planner")}><CalendarDays size={17}/> 家庭计划 <ArrowRight size={16}/></button>
    </header>
    <div className="home-overview-grid">
      <article className="home-action-card">
        <header><span className="section-kicker"><Sun size={16}/> {personMeta[state.currentUser].name}的今天</span><span className="home-count">{done} / {events.length} 已完成</span></header>
        <div className="home-progress" role="progressbar" aria-label="今日行程完成进度" aria-valuenow={done} aria-valuemin={0} aria-valuemax={Math.max(events.length,1)}><span style={{width: `${events.length ? done / events.length * 100 : 0}%`}}/></div>
        <div className="home-next-task">
          <span className="home-task-label">{next ? "接下来，专心做这一件" : events.length ? "今天的安排都完成了" : "今天还没有安排"}</span>
          <h2>{next?.title ?? (events.length ? "做得很好，休息一下吧。" : "给今天定一个小目标")}</h2>
          <p>{next ? `${next.time} · ${next.kind}${next.duration ? ` · ${next.duration} 分钟` : ""}` : events.length ? "每一步都算数，去看看阳光能换来什么。" : state.currentUser === "brother" ? "从一道题、十分钟阅读，或一件想做的小事开始。" : "散步、读书，或把今天最重要的一件事安排好。"}</p>
          {next && <span className="home-reward-tag"><Sun size={15}/> {next.kind === "固定课程" ? "课程结束后" : "完成后"} +{next.reward} 阳光</span>}
        </div>
        <button className="home-main-button" onClick={() => onNavigate(next ? "today" : events.length ? "island" : "planner")}>{next ? "去我的今天" : events.length ? "看看阳光收藏" : "安排第一件事"}<ArrowRight size={18}/></button>
        <div className="home-action-foot"><Check size={15}/><span>{state.currentUser === "brother" ? "自己安排，慢慢完成。家人会为你加油。" : "照顾自己的节奏，也留一点时间给家人。"}</span></div>
      </article>
      <article className="home-island-card">
        <img src="./images/family-island-home-hero-v3.png" alt="被海水和花园环绕的家庭小岛" className="home-island-art"/>
        <div className="home-scene-label"><span/><b>我们的晴日岛</b><small>不同的城市，同一个家</small></div>
        <button className="home-island-caption" onClick={() => onNavigate("island")}><span className="home-sun-icon"><Sun size={24}/></span><span><b>{state.island.sunlight} 点阳光，来自每一天的积累</b><small>完成安排 · 记录生活 · 收藏小惊喜</small></span><ArrowRight size={20}/></button>
      </article>
    </div>
    <section className="home-family-section" aria-label="家人近况">
      <header className="home-section-heading"><div><h2>家人近况</h2><span>不用时时在线，留一句话就好。</span></div><button onClick={() => onNavigate("mail")}>看看家人动态 <ArrowRight size={15}/></button></header>
      <div className="home-family-grid">{state.statuses.map(item => <article className={`home-person-card person-${item.person}`} key={item.person}>
        <header><PersonMark person={item.person}/><div><b>{item.name}{item.person === state.currentUser && <small>我</small>}</b><span>{item.city}</span></div><i style={{background:item.color}}/></header>
        <strong>{item.status}</strong><p>{item.note || "还没有留下近况，晚点再来看看。"}</p>
        <footer><span>{item.updatedAt}</span><button onClick={() => item.person === state.currentUser ? onEditStatus(item.person) : onNavigate("mail")}>{item.person === state.currentUser ? "更新我的状态" : "给句关心"}{item.person === state.currentUser ? <ArrowRight size={14}/> : <Heart size={14}/>}</button></footer>
      </article>)}</div>
    </section>
    <div className="home-bottom-grid">
      <button className="home-news-card" onClick={() => onNavigate("mail")}><span className="home-small-icon"><MessageCircle size={22}/></span><span><small>{latest ? `${personMeta[latest.author].name}留下的新动态` : "家庭留言板"}</small><b>{latest?.text || "今天有什么想和家人分享？"}</b></span><ArrowRight size={18}/></button>
      <button className="home-milestone-card" onClick={() => onNavigate("island")}><span className="home-small-icon"><Sprout size={24}/></span><span><small>{reward ? "下一个小惊喜" : "阳光收藏"}</small><b>{reward ? remaining ? `再攒 ${remaining} 点，就能收藏${reward.name}` : `已经可以收藏${reward.name}啦` : `已收藏 ${state.island.unlocked.length} 件小惊喜`}</b></span><ArrowRight size={18}/></button>
    </div>
  </section>;
}
