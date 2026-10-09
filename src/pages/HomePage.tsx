"use client";

import Image from "../components/DemoImage";
import { type PointerEvent as ReactPointerEvent, useState } from "react";
import { AppState, PersonId, PageId, personMeta, localDate } from "../data";
import { WEEKDAY_NAMES } from "../constants";
import { dateFromIso, readableDate } from "../utils";
import { PlaceButton, PersonMark } from "../components/SharedUI";

type SceneSpot = "house" | "pond" | "mailbox" | "garden" | null;

export function HomePage({ state, onEditStatus, onNavigate }: { state: AppState; onEditStatus: (person: PersonId) => void; onNavigate: (page: PageId) => void }) {
  const [spot, setSpot] = useState<SceneSpot>(null);
  const now = dateFromIso(localDate());
  const today = localDate();
  const ownTasks = state.tasks.filter((task) => task.owner === state.currentUser && task.scheduledDate === today);
  const brotherTasks = state.tasks.filter((task) => task.owner === "brother" && task.scheduledDate === today);
  const complete = brotherTasks.filter((task) => task.completed).length;
  const ownComplete = ownTasks.filter((task) => task.completed).length;
  const nextOwnTask = ownTasks.filter((task) => !task.completed).sort((a, b) => (a.start ?? "23:59").localeCompare(b.start ?? "23:59"))[0];
  const nextBrotherTask = brotherTasks.filter((task) => !task.completed).sort((a, b) => (a.start ?? "23:59").localeCompare(b.start ?? "23:59"))[0];
  const brotherStatus = state.statuses.find((item) => item.person === "brother")!;
  const latest = state.messages[state.messages.length - 1];
  const roleHome = {
    brother: { eyebrow: "我的晴日岛", title: "看清今天，\n慢慢发光。", text: "一步一步，把今天过好。" },
    sister: { eyebrow: "姐姐的家庭首页", title: "看见彼此，\n也照顾自己。", text: "隔着城市，也在同一片晴天里。" },
    mom: { eyebrow: "妈妈的家庭首页", title: "照顾好自己，\n也轻轻陪伴。", text: "不必时时在身边，也能彼此惦念。" },
  }[state.currentUser];

  const moveScene = (event: ReactPointerEvent<HTMLElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty("--scene-x", `${((event.clientX - bounds.left) / bounds.width - .5) * 2}`);
    event.currentTarget.style.setProperty("--scene-y", `${((event.clientY - bounds.top) / bounds.height - .5) * 2}`);
  };

  return (
    <section className="home-world" onPointerMove={moveScene} onPointerLeave={(event) => { event.currentTarget.style.setProperty("--scene-x", "0"); event.currentTarget.style.setProperty("--scene-y", "0"); }}>
      <div className="home-image"><Image src="./images/family-island-home-hero-v3.png" alt="爸爸、妈妈、姐姐和弟弟在温柔海岛上的家" fill priority unoptimized sizes="100vw" /><div className="home-light" /></div>
      <div className="home-command">
        <span className="date-line">{readableDate(now)} · {WEEKDAY_NAMES[now.getDay()]}</span>
        <span className="home-role-eyebrow">{roleHome.eyebrow}</span>
        <h1>{roleHome.title.split("\n").map((line) => <span key={line}>{line}</span>)}</h1>
        <p>{roleHome.text}</p>
        <div className="home-command-actions"><button className="primary-action" onClick={() => onNavigate("today")}>打开我的今天 <i>→</i></button><button className="quiet-action" onClick={() => onNavigate("planner")}>查看家庭计划</button></div>

        <section className="home-focus-card">
          <header><span>{state.currentUser === "brother" ? "我的下一步" : "弟弟今天的进度"}</span><button onClick={() => onNavigate(state.currentUser === "brother" ? "today" : "planner")}>查看全部</button></header>
          {state.currentUser === "brother" ? <div className="focus-task"><time>{nextOwnTask?.start ?? "今天"}</time><span><b>{nextOwnTask?.title ?? "今天的任务已经完成"}</b><small>{ownTasks.length ? `${ownComplete} / ${ownTasks.length} 项已完成` : "去家庭计划安排第一项任务"}</small></span></div> : <div className="focus-task"><span className="focus-live-dot" style={{ background: brotherStatus.color }} /><span><b>{brotherStatus.status}</b><small>{nextBrotherTask ? `下一项：${nextBrotherTask.start ?? "待安排"} ${nextBrotherTask.title}` : brotherTasks.length ? "今天的任务已经完成" : "今天还没有排入任务"}</small></span><strong>{complete}/{brotherTasks.length}</strong></div>}
        </section>

        <section className="family-live-board" aria-label="家人实时状态"><header><span>家人此刻</span><small>点击自己的状态可以更新</small></header>{state.statuses.map((item) => <button key={item.person} onClick={() => item.person === state.currentUser ? onEditStatus(item.person) : onNavigate("today")}><i style={{ background: item.color }} /><span><b>{item.name}</b><small>{item.status}</small></span><em>{item.updatedAt}</em></button>)}</section>
        {latest && <button className="home-latest-message" onClick={() => onNavigate("mail")}><span>家人动态</span><p>{personMeta[latest.author].name}：{latest.text}</p><i>→</i></button>}
      </div>

      <PlaceButton className="home-house" title="木屋" subtitle="家人此刻" selected={spot === "house"} onClick={() => setSpot(spot === "house" ? null : "house")} />
      <PlaceButton className="home-pond" title="池塘" subtitle={`${state.habits.water} / 8 杯水`} selected={spot === "pond"} onClick={() => setSpot(spot === "pond" ? null : "pond")} />
      <PlaceButton className="home-mailbox" title="家人动态" subtitle="看看家里刚发生什么" selected={false} onClick={() => onNavigate("mail")} />
      <PlaceButton className="home-garden" title="花园" subtitle={`${complete} / ${brotherTasks.length} 完成`} selected={spot === "garden"} onClick={() => setSpot(spot === "garden" ? null : "garden")} />

      {spot && <aside className="home-sheet">
        <button className="sheet-close" onClick={() => setSpot(null)} aria-label="关闭">×</button>
        {spot === "house" && <><span className="overline">家人此刻</span><h2>三座城市，三盏灯</h2><div className="presence-list">{state.statuses.map((item) => <button key={item.person} onClick={() => onEditStatus(item.person)}><PersonMark person={item.person} /><span><b>{item.name} · {item.city}</b><small>{item.status}</small><em>{item.note}</em></span><i>{item.updatedAt}</i></button>)}</div></>}
        {spot === "pond" && <><span className="overline">今日喝水</span><h2>池塘已经涨到一半</h2><div className="mini-water"><div><i style={{ height: `${state.habits.water / 8 * 100}%` }} /></div><p><strong>{state.habits.water}</strong><span>杯</span><small>每一次记录，水面都会升高一点。</small></p></div><button className="text-action" onClick={() => onNavigate("today")}>去今天记录 →</button></>}
        {spot === "garden" && <><span className="overline">弟弟今日进度</span><h2>完成一点，花园就亮一点</h2><div className="garden-progress"><div><i style={{ width: `${brotherTasks.length ? complete / brotherTasks.length * 100 : 0}%` }} /></div><b>{complete} / {brotherTasks.length}</b></div><ul className="sheet-tasks">{brotherTasks.slice(0, 3).map((task) => <li key={task.id} className={task.completed ? "done" : ""}><span />{task.title}</li>)}</ul><button className="text-action" onClick={() => onNavigate("planner")}>查看家庭计划 →</button></>}
      </aside>}
    </section>
  );
}
