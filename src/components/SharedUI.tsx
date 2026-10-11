"use client";

import Image from "../components/DemoImage";
import type { FormEvent } from "react";
import { useState } from "react";
import { AppState, IslandState, PersonId, ScheduleItem, Task, personMeta } from "../data";
import { SUBJECT_ASSETS, type TaskDraft, type TaskPatch } from "../constants";
import { SunValue } from "../components/SunValue";
import { PersonMark } from "../components/PersonMark";

export { SunValue, PersonMark };

export function PlaceButton({ className, title, subtitle, selected, onClick }: { className: string; title: string; subtitle: string; selected: boolean; onClick: () => void }) {
  return <button className={`place-button ${className} ${selected ? "selected" : ""}`} onClick={onClick}><span className="place-dot" /><span className="place-label"><b>{title}</b><small>{subtitle}</small></span></button>;
}

export function PageIntro({ eyebrow, title, text, action }: { eyebrow: string; title: string; text: string; action?: React.ReactNode }) {
  return <header className="page-intro"><div><span className="overline">{eyebrow}</span><h1>{title}</h1><p>{text}</p></div>{action}</header>;
}

export function ModalShell({ title, overline, onClose, children }: { title: string; overline: string; onClose: () => void; children: React.ReactNode }) {
  return <div className="modal-backdrop" onMouseDown={onClose}><section className="modal-sheet" onMouseDown={(event) => event.stopPropagation()}><button className="modal-close" onClick={onClose} aria-label="关闭">×</button><span className="overline">{overline}</span><h2>{title}</h2>{children}</section></div>;
}

export function WeeklySeed({ label, value, goal, asset, onChange }: { label: string; value: number; goal: number; asset: string; onChange: (delta: number) => void }) {
  return <article className="weekly-seed"><div className="weekly-asset"><Image src={asset} alt={`${label}黏土图标`} width={140} height={120} unoptimized /></div><div className="weekly-copy"><b>本周{label}</b><small>{value} / {goal} 次</small><span>{Array.from({ length: goal }).map((_, index) => <i className={index < value ? "grown" : ""} key={index} />)}</span></div><div className="weekly-action"><button onClick={() => onChange(1)} disabled={value >= goal}>{value >= goal ? "本周完成" : "记录一次"}</button><small>☀ 每次 ＋4 阳光</small></div></article>;
}

export function TimeSelect({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  const [hour = "00", minute = "00"] = value.split(":");
  const minuteOptions = Array.from(new Set(["00", "05", "10", "15", "20", "25", "30", "35", "40", "45", "50", "55", minute])).sort();
  return <span className="time-select" aria-label={label}>
    <select aria-label={`${label}小时`} value={hour} onChange={(event) => onChange(`${event.target.value}:${minute}`)}>{Array.from({ length: 24 }, (_, index) => <option key={index} value={String(index).padStart(2, "0")}>{String(index).padStart(2, "0")}</option>)}</select>
    <i>:</i>
    <select aria-label={`${label}分钟`} value={minute} onChange={(event) => onChange(`${hour}:${event.target.value}`)}>{minuteOptions.map((item) => <option key={item} value={item}>{item}</option>)}</select>
  </span>;
}

export function TaskComposer({ currentUser, onAdd }: { currentUser: PersonId; onAdd: (draft: TaskDraft) => void }) {
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("数学");
  const [kind, setKind] = useState<import("../data").TaskKind>("temporary");
  const [owner, setOwner] = useState<PersonId>(currentUser === "brother" ? "brother" : currentUser);
  const submit = (event: FormEvent) => { event.preventDefault(); if (!title.trim()) return; onAdd({ title: title.trim(), subject, kind, owner }); setTitle(""); };
  return <form className="task-composer task-composer-simple" onSubmit={submit}><label className="quick-task-input"><span>新任务</span><div><input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="例如：订正三道错题" required /><button type="submit" aria-label="添加到待排期">＋</button></div></label><div className="task-quick-choices"><select value={subject} aria-label="任务科目" onChange={(event) => setSubject(event.target.value)}><option>数学</option><option>语文</option><option>英语</option><option>阅读</option><option>生活</option><option>工作</option></select><select value={owner} aria-label="任务执行人" onChange={(event) => setOwner(event.target.value as PersonId)}><option value="brother">弟弟</option><option value="sister">姐姐</option><option value="mom">妈妈</option></select><button type="button" className={kind === "fixed" ? "selected" : ""} onClick={() => setKind(kind === "fixed" ? "temporary" : "fixed")}>{kind === "fixed" ? "固定任务" : "临时任务"}</button></div><p>添加后直接拖到右侧合适的日期和时间。</p></form>;
}

export function DraggableTask({ task, onClick }: { task: Task; onClick: () => void }) {
  return <button className={`pool-task backpack-card subject-card-${task.subject} owner-${task.owner}`} draggable onDragStart={(event) => event.dataTransfer.setData("application/x-family-task", task.id)} onClick={onClick}><span className="backpack-card-art"><Image src={SUBJECT_ASSETS[task.subject] ?? SUBJECT_ASSETS.生活} alt={`${task.subject}黏土物件`} width={72} height={64} unoptimized /></span><span><b>{task.title}</b><small>{task.subject} · {personMeta[task.owner].name}</small></span><SunValue value={task.sunlight} /></button>;
}

export function TaskEditor({ task, onClose, onSave, onDelete, onToggle }: { task: Task; onClose: () => void; onSave: (patch: TaskPatch) => void; onDelete: () => void; onToggle: () => void }) {
  const [title, setTitle] = useState(task.title);
  const [subject, setSubject] = useState(task.subject);
  const [owner, setOwner] = useState(task.owner);
  const [scheduledDate, setScheduledDate] = useState(task.scheduledDate ?? "");
  const [start, setStart] = useState(task.start ?? "09:00");
  const [duration, setDuration] = useState(task.duration ?? 60);
  const hours = Math.floor(duration / 60);
  const minutes = duration % 60;

  return <ModalShell title="编辑任务" overline="任务详情" onClose={onClose}><div className="editor-form"><label><span>任务名称</span><input value={title} onChange={(event) => setTitle(event.target.value)} /></label><div><label><span>类型</span><select value={subject} onChange={(event) => setSubject(event.target.value)}><option>数学</option><option>语文</option><option>英语</option><option>阅读</option><option>生活</option><option>工作</option></select></label><label><span>执行人</span><select value={owner} onChange={(event) => setOwner(event.target.value as PersonId)}><option value="brother">弟弟</option><option value="sister">姐姐</option><option value="mom">妈妈</option></select></label></div><div><label><span>日期</span><input type="date" value={scheduledDate} onChange={(event) => setScheduledDate(event.target.value)} /></label><label><span>开始时间</span><input type="time" value={start} onChange={(event) => setStart(event.target.value)} /></label><label className="duration-field"><span>任务时长</span><div className="duration-editor"><span><input aria-label="任务时长小时" type="number" min={0} max={12} value={hours} onChange={(event) => setDuration(Math.max(1, Math.min(12, Number(event.target.value) || 0) * 60 + minutes))} /><small>小时</small></span><span><input aria-label="任务时长分钟" type="number" min={0} max={59} value={minutes} onChange={(event) => setDuration(Math.max(1, hours * 60 + Math.min(59, Math.max(0, Number(event.target.value) || 0))))} /><small>分钟</small></span></div></label></div><button className={`complete-toggle ${task.completed ? "done" : ""}`} onClick={onToggle}><i />{task.completed ? "已完成，点击恢复" : "标记为已完成"}</button><div className="editor-actions"><button className="delete-action" onClick={onDelete}>删除任务</button><button className="save-action" onClick={() => onSave({ title, subject, owner, scheduledDate: scheduledDate || undefined, start: scheduledDate ? start : undefined, duration: Math.max(1, duration) })}>保存修改</button></div></div></ModalShell>;
}

export function ScheduleEditor({ item, onClose, onSave, onDelete }: { item: ScheduleItem; onClose: () => void; onSave: (patch: Partial<ScheduleItem>) => void; onDelete: () => void }) {
  const [title, setTitle] = useState(item.title);
  const [days, setDays] = useState(item.days);
  const [start, setStart] = useState(item.start);
  const [end, setEnd] = useState(item.end);
  const [until, setUntil] = useState(item.until);
  const toggleDay = (day: number) => setDays((current) => current.includes(day) ? current.filter((value) => value !== day) : [...current, day].sort());
  return <ModalShell title="编辑固定日程" overline="重复课程" onClose={onClose}><div className="editor-form"><label><span>日程名称</span><input value={title} onChange={(event) => setTitle(event.target.value)} /></label><div className="day-picker"><span>每周重复</span><div>{["一", "二", "三", "四", "五", "六", "日"].map((label, index) => <button key={label} className={days.includes(index + 1) ? "selected" : ""} onClick={() => toggleDay(index + 1)}>周{label}</button>)}</div></div><div><label><span>开始</span><input type="time" value={start} onChange={(event) => setStart(event.target.value)} /></label><label><span>结束</span><input type="time" value={end} onChange={(event) => setEnd(event.target.value)} /></label><label><span>截止日期</span><input type="date" value={until} onChange={(event) => setUntil(event.target.value)} /></label></div><div className="editor-actions"><button className="delete-action" onClick={onDelete}>删除日程</button><button className="save-action" onClick={() => onSave({ title, days, start, end, until })}>保存修改</button></div></div></ModalShell>;
}

export function SunlightLedger({ island, onClose }: { island: IslandState; onClose: () => void }) {
  const sunlightLog = island.sunlightLog ?? [];
  const earned = sunlightLog.filter((entry) => entry.amount > 0).reduce((sum, entry) => sum + entry.amount, 0);
  const spent = sunlightLog.filter((entry) => entry.amount < 0).reduce((sum, entry) => sum + Math.abs(entry.amount), 0);
  return <ModalShell title="阳光都去了哪里？" overline="阳光记录" onClose={onClose}><div className="sunlight-ledger-summary"><div><span>当前阳光</span><strong>{island.sunlight}</strong></div><div><span>最近获得</span><strong className="positive">＋{earned}</strong></div><div><span>最近使用</span><strong className="negative">－{spent}</strong></div></div>{sunlightLog.length ? <ol className="sunlight-ledger-list">{sunlightLog.map((entry) => <li key={entry.id} className={entry.amount > 0 ? "income" : "expense"}><i /><span><b>{entry.reason}</b><small>{entry.createdAt}</small></span><strong>{entry.amount > 0 ? "+" : ""}{entry.amount}</strong></li>)}</ol> : <div className="sunlight-ledger-empty"><i /><b>还没有阳光记录</b><p>完成任务、记录习惯或在商店收藏物品后，这里会留下明细。</p></div>}</ModalShell>;
}

export function StatusModal({ status, onClose, onSave }: { status: import("../data").FamilyStatus; onClose: () => void; onSave: (person: PersonId, statusText: string, note: string) => void }) {
  const statusOptions: Record<PersonId, string[]> = {
    brother: ["正在学数学", "正在写作业", "休息一下", "出去玩耍", "准备睡觉"],
    sister: ["实习中", "下班啦", "做饭中", "写论文", "自主学习", "准备睡觉"],
    mom: ["工作中", "下班啦", "正在回家", "外出办事", "到家啦", "准备睡觉"],
  };
  const [choice, setChoice] = useState(status.status);
  const [customChoice, setCustomChoice] = useState(statusOptions[status.person].includes(status.status) ? "" : status.status);
  const [note, setNote] = useState(status.note);
  return <ModalShell title={`${status.name}现在在做什么？`} overline="更新状态" onClose={onClose}><div className="status-person"><PersonMark person={status.person} /><span><b>{status.city}</b><small>{status.updatedAt}更新</small></span></div><div className="status-options">{statusOptions[status.person].map((option) => <button key={option} className={choice === option ? "selected" : ""} onClick={() => { setChoice(option); setCustomChoice(""); }}>{option}</button>)}</div><label className="status-custom"><span>或者自己写一个状态</span><input value={customChoice} maxLength={16} placeholder="例如：正在逛商场" onChange={(event) => { setCustomChoice(event.target.value); setChoice(event.target.value); }} /></label><label className="status-note"><span>顺便留一句话</span><input value={note} maxLength={36} onChange={(event) => setNote(event.target.value)} /></label><button className="save-action wide" disabled={!choice.trim()} onClick={() => onSave(status.person, choice.trim(), note)}>同步给家人</button></ModalShell>;
}
