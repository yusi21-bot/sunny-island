"use client";

import { useEffect, useState } from "react";
import { AppState, PageId, PersonId, Task, localDate, personMeta, uid } from "../data";
import { brotherQuickStatuses, HABIT_ASSETS, SUBJECT_ASSETS, SharedPostOptions, statusOptions } from "../constants";
import { WEEKDAY_NAMES } from "../constants";
import { dateFromIso, readableDate, weekdayNumber, classOccurrenceKey, sleepDurationMinutes, timeToMinutes, minutesToTime } from "../utils";
import { WeeklySeed, TimeSelect, PersonMark } from "../components/SharedUI";
import { BrotherLifeJournal } from "../pages/BrotherLifeJournal";
import { AdultTodayPanel } from "../pages/AdultTodayPanel";


export function TodayPage({ state, onToggle, onHabit, onNavigate, onShareMeal, onQuickStatus, onSleep }: { state: AppState; onToggle: (task: Task) => void; onHabit: (key: "water" | "weeklyReading" | "weeklyExercise", delta: number, max: number) => void; onNavigate: (page: PageId) => void; onShareMeal: (text: string, options?: SharedPostOptions) => void; onQuickStatus: (person: PersonId, status: string) => void; onSleep: (key: "sleepTime" | "wakeTime", value: string) => void }) {
  const [statusOpen, setStatusOpen] = useState(false);
  const [statusPickerOpen, setStatusPickerOpen] = useState(false);
  const [statusPerson, setStatusPerson] = useState<PersonId>(state.currentUser);
  const [footprintOpen, setFootprintOpen] = useState(false);
  useEffect(() => { setStatusPerson(state.currentUser); setStatusOpen(false); setStatusPickerOpen(false); }, [state.currentUser]);
  const today = localDate();
  const day = dateFromIso(today);
  const scheduledTasks = state.tasks.filter((task) => task.owner === state.currentUser && task.scheduledDate === today).sort((a, b) => (a.start ?? "23:59").localeCompare(b.start ?? "23:59"));
  const classes = state.currentUser === "brother" ? state.schedule.filter((item) => item.days.includes(weekdayNumber(day)) && today <= item.until) : [];
  const CLASS_SUNLIGHT = 20;
  const timeline = [
    ...classes.map((item) => ({ id: item.id, title: item.title, time: item.start, end: item.end, type: "class" as const, source: item })),
    ...scheduledTasks.map((task) => ({ id: task.id, title: task.title, time: task.start ?? "待安排", end: task.start ? minutesToTime(timeToMinutes(task.start) + (task.duration ?? 60)) : "", type: "task" as const, source: task })),
  ].sort((a, b) => a.time.localeCompare(b.time));
  const completedTasks = scheduledTasks.filter((task) => task.completed);
  const eventIsDone = (event: (typeof timeline)[number]) => event.type === "task" ? (event.source as Task).completed : state.completedClasses.includes(classOccurrenceKey(event.source as import("../data").ScheduleItem, today));
  const completedEvents = timeline.filter(eventIsDone);
  const taskProgress = timeline.length ? completedEvents.length / timeline.length * 100 : 0;
  const earnedSunlight = completedTasks.reduce((total, task) => total + task.sunlight, 0) + classes.filter((item) => state.completedClasses.includes(classOccurrenceKey(item, today))).length * CLASS_SUNLIGHT;
  const nextEvent = timeline.find((event) => !eventIsDone(event));
  const selectedStatus = state.statuses.find((item) => item.person === statusPerson)!;
  const statusIsAutomatic = statusPerson === "brother" && selectedStatus.statusSource === "schedule";
  const canEditStatus = statusPerson === state.currentUser && !statusIsAutomatic;
  const footprints = state.statusHistory.filter((item) => item.person === statusPerson).slice(-6).reverse();
  const quickStatuses = statusPerson === "brother" ? brotherQuickStatuses : statusOptions[statusPerson];
  const lastSleepMinutes = sleepDurationMinutes(state.habits.sleepTime, state.habits.wakeTime);
  const sleepGoalReached = lastSleepMinutes >= 8 * 60 && lastSleepMinutes <= 10 * 60;
  const supplyCompleted = [state.habits.water >= 8, sleepGoalReached, state.habits.weeklyReading >= 3, state.habits.weeklyExercise >= 3].filter(Boolean).length;
  const supplySunlight = (state.habits.water >= 8 ? 2 : 0) + (sleepGoalReached ? 3 : 0) + (state.habits.weeklyReading >= 3 ? 4 : 0) + (state.habits.weeklyExercise >= 3 ? 4 : 0);

  return <section className="product-page today-page">
    <header className="today-compact-header"><div><b>{personMeta[state.currentUser].name}的今天</b><span>{readableDate(day)} · {WEEKDAY_NAMES[day.getDay()]}</span></div><button onClick={() => onNavigate("planner")}>整理今天</button></header>
    <section className={`now-status-bar today-status-legacy ${statusOpen ? "open" : ""}`}>
      <div className="now-status-main"><button className="status-person-picker-trigger" type="button" onClick={() => setStatusPickerOpen((open) => !open)} aria-label="选择查看哪位家人"><PersonMark person={statusPerson} /></button><span><small>{personMeta[statusPerson].name}现在</small><strong>{selectedStatus.status}</strong><em>{selectedStatus.note}</em></span><i className="live-status-dot" style={{ background: selectedStatus.color }} /><button className="status-edit-trigger" type="button" disabled={!canEditStatus} onClick={() => setStatusOpen((open) => !open)}>{statusIsAutomatic ? "日程自动同步" : canEditStatus ? statusOpen ? "收起" : "更新我的状态" : "仅查看"}</button></div>
      {statusPickerOpen && <div className="status-person-picker">{state.statuses.map((item) => <button type="button" className={statusPerson === item.person ? "selected" : ""} key={item.person} onClick={() => { setStatusPerson(item.person); setStatusPickerOpen(false); setStatusOpen(false); setFootprintOpen(false); }}><PersonMark person={item.person} small /><span><b>{item.name}</b><small>{item.status}</small></span></button>)}</div>}
      {statusOpen && canEditStatus && <div className="quick-status-panel"><span>我现在正在……</span><div>{quickStatuses.map((status) => <button className={selectedStatus.status === status ? "selected" : ""} type="button" key={status} onClick={() => { onQuickStatus(statusPerson, status); setStatusOpen(false); }}>{status}</button>)}</div><button className="footprint-toggle" type="button" onClick={() => setFootprintOpen((open) => !open)}>今天做过什么 {footprintOpen ? "收起" : "展开"}</button>{footprintOpen && <ol className="status-footprints">{footprints.length ? footprints.map((item) => <li key={item.id}><time>{item.startedAt}</time><i /><span>{item.status}</span></li>) : <li className="empty">今天还没有状态记录</li>}</ol>}</div>}
    </section>
    <div className="journey-layout">
      <section className="journey-map" style={{ "--journey-progress": `${taskProgress}%` } as React.CSSProperties}>
        <header className="journey-summary"><div><span>今日旅程</span><strong>{completedEvents.length}<small> / {timeline.length} 项行程完成</small></strong></div><div className="sunlight-pouch"><i /><span>阳光口袋</span><b>{earnedSunlight}</b></div></header>
        <div className="journey-start"><i /><span>早晨</span></div>
        <div className="journey-road" />
        <div className="journey-stops">
          {timeline.length ? timeline.map((event, index) => {
            const task = event.type === "task" ? event.source as Task : null;
            const isDone = eventIsDone(event);
            const isCurrent = nextEvent?.id === event.id && nextEvent?.type === event.type;
            return <article className={`journey-stop ${event.type} ${isDone ? "done" : ""} ${isCurrent ? "current" : ""}`} key={`${event.type}-${event.id}`}>
              <span className="journey-pin"><i>{isDone ? "✓" : index + 1}</i></span>
              <time>{event.time}<small>{event.end}</small></time>
          <div className="journey-card"><span className="event-kind">{event.type === "class" ? "课程" : task?.subject ?? "任务"}</span><h3>{event.title}</h3>{task ? <button aria-label={`${isDone ? "撤销完成" : "完成任务"}：${task.title}`} onClick={() => onToggle(task)}>{isDone ? "已完成 · 撤销" : `完成 · ＋${task.sunlight} 阳光`}<i /></button> : <p>{isDone ? `已结束 · ＋${CLASS_SUNLIGHT} 阳光` : "固定安排"}</p>}</div>
            </article>;
          }) : <div className="journey-empty"><span className="empty-map-mark">＋</span><h3>今天的小路还没有站点</h3><p>先把一个任务放进今天，旅程就会开始。</p><button onClick={() => onNavigate("planner")}>添加第一个站点</button></div>}
        </div>
        <div className="journey-finish"><i /><span>夜晚</span></div>
      </section>
      {state.currentUser === "brother" ? <aside className="habit-garden supply-station supply-station-v2">
        <header className="supply-header">
          <div className="habit-title"><span className="overline"><img src={SUBJECT_ASSETS.生活} alt="" width={24} height={24} />生活补给站</span><h2>把今天照顾好</h2><p>喝水、睡好，也留一点时间给自己。</p></div>
          <div className="supply-overview"><i className="supply-sun" /><span>今日补给概览</span><strong>已完成 <b>{supplyCompleted}</b> / 4 <em>· ＋{supplySunlight} 阳光</em></strong></div>
        </header>
        <div className="supply-primary-grid">
          <section className="water-ritual supply-card">
            <div className="habit-clay-visual water"><img className="water-spirit-character" src={HABIT_ASSETS.water} alt="抱着水杯的蓝色泥塑水滴精灵" width={180} height={180} /></div>
            <div className="water-summary"><span>💧 今日补水</span><strong>{state.habits.water}<small> / 8 杯</small></strong><small className="water-note">每杯约 250 ml</small><div className="water-actions"><button onClick={() => onHabit("water", 1, 8)} disabled={state.habits.water >= 8}>＋1 杯</button><button onClick={() => onHabit("water", -1, 8)} disabled={state.habits.water <= 0}>−1 杯</button></div></div>
            <div className="water-ring" style={{ "--water-progress": `${state.habits.water / 8 * 360}deg` } as React.CSSProperties}><span>{Math.round(state.habits.water / 8 * 100)}%</span></div>
            <footer>☀ 达标可获得 <b>＋2 阳光</b></footer>
          </section>
          <section className="sleep-ritual supply-card">
            <div className="habit-clay-visual sleep"><img src={HABIT_ASSETS.sleep} alt="月亮与枕头" width={180} height={150} /></div>
            <div className="sleep-summary"><span>☾ 昨晚睡眠</span>{sleepGoalReached && <em className="goal-badge">已达标 ✓</em>}<div className="sleep-duration"><strong>{lastSleepMinutes ? Math.floor(lastSleepMinutes / 60) : "--"}</strong><small>小时</small><strong>{lastSleepMinutes ? lastSleepMinutes % 60 : "--"}</strong><small>分钟</small></div><small className="sleep-target">13–18 岁建议 8–10 小时</small><div className="sleep-times"><label><small>入睡</small><TimeSelect label="昨晚入睡时间" value={state.habits.sleepTime} onChange={(value) => onSleep("sleepTime", value)} /></label><label><small>起床</small><TimeSelect label="今天起床时间" value={state.habits.wakeTime} onChange={(value) => onSleep("wakeTime", value)} /></label></div></div>
            <footer>☀ 达标可获得 <b>＋3 阳光</b></footer>
          </section>
        </div>
        <section className="weekly-supply"><h3>▣ 本周习惯</h3><div className="weekly-rituals"><WeeklySeed label="阅读" value={state.habits.weeklyReading} goal={3} asset={HABIT_ASSETS.reading} onChange={(delta) => onHabit("weeklyReading", delta, 3)} /><WeeklySeed label="运动" value={state.habits.weeklyExercise} goal={3} asset={HABIT_ASSETS.exercise} onChange={(delta) => onHabit("weeklyExercise", delta, 3)} /></div></section>
        <BrotherLifeJournal onShare={onShareMeal} />
        <footer className="supply-reward-guide"><span><img src={SUBJECT_ASSETS.生活} alt="" width={28} height={28} />完成生活补给，也会为小岛收集阳光。</span><div><b>💧 补水 ＋2</b><i /> <b>☾ 睡眠 ＋3</b><i /> <b>📖 阅读 ＋4</b><i /> <b>👟 运动 ＋4</b></div></footer>
      </aside> : <AdultTodayPanel state={state} onNavigate={onNavigate} onShareMeal={onShareMeal} />}
    </div>
  </section>;
}