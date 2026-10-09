// Shared utility functions used across pages
import { AppState, IslandState, PersonId, ScheduleItem, personMeta, uid } from "./data";
import { DEFAULT_START_HOUR } from "./constants";

export function rewardIsland(island: IslandState, gain: number, reason = "阳光变化"): IslandState {
  const lifetimeSunlight = island.lifetimeSunlight + Math.max(0, gain);
  return {
    ...island,
    sunlight: Math.max(0, island.sunlight + gain),
    lifetimeSunlight,
    level: Math.max(island.level, Math.floor(lifetimeSunlight / 100) + 1),
    flowerPlots: [...island.flowerPlots],
    sunlightLog: gain === 0 ? (island.sunlightLog ?? []) : [{ id: uid("sun"), amount: gain, reason, createdAt: `今天 ${shanghaiTime()}` }, ...(island.sunlightLog ?? [])].slice(0, 80),
  };
}

export function dateFromIso(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

export function mondayOf(date: Date) {
  const next = new Date(date);
  const day = next.getDay() || 7;
  next.setDate(next.getDate() - day + 1);
  next.setHours(0, 0, 0, 0);
  return next;
}

export function timeToMinutes(value = "08:00") {
  const [hour, minute] = value.split(":").map(Number);
  return hour * 60 + minute;
}

export function minutesToTime(minutes: number) {
  const hour = Math.floor(minutes / 60);
  const minute = minutes % 60;
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

export function plannerStartHour(wakeTime: string) {
  if (!wakeTime) return DEFAULT_START_HOUR;
  const hour = Math.floor(timeToMinutes(wakeTime) / 60);
  return Math.max(5, Math.min(DEFAULT_START_HOUR, hour));
}

export function plannerHours(startHour: number) {
  const hours: number[] = [];
  for (let hour = startHour; hour <= 23; hour++) hours.push(hour);
  return hours;
}

export function eventStyle(start: string, duration: number, startHour = DEFAULT_START_HOUR) {
  const top = (timeToMinutes(start) - startHour * 60) / 60;
  return { top: `${top * 72 + 8}px`, height: `${duration * 72 / 60}px` };
}

export function scheduleDuration(item: ScheduleItem) {
  return timeToMinutes(item.end) - timeToMinutes(item.start);
}

export function classOccurrenceKey(item: ScheduleItem, date: string) {
  return `${item.id}:${date}`;
}

export function sleepDuration(sleepTime: string, wakeTime: string) {
  const sleepTotal = timeToMinutes(sleepTime);
  const wakeTotal = timeToMinutes(wakeTime);
  const raw = wakeTotal > sleepTotal ? wakeTotal - sleepTotal : 24 * 60 - sleepTotal + wakeTotal;
  return `${Math.floor(raw / 60)} 小时 ${raw % 60} 分钟`;
}

export function sleepDurationMinutes(sleepTime: string, wakeTime: string) {
  const sleepTotal = timeToMinutes(sleepTime);
  const wakeTotal = timeToMinutes(wakeTime);
  return wakeTotal > sleepTotal ? wakeTotal - sleepTotal : 24 * 60 - sleepTotal + wakeTotal;
}

export function shanghaiTime(value = new Date()) {
  return new Intl.DateTimeFormat("zh-CN", { timeZone: "Asia/Shanghai", hour: "2-digit", minute: "2-digit" }).format(value);
}

export function automaticBrotherStatus(state: AppState, now = new Date()) {
  const today = now.toISOString().slice(0, 10);
  const activeTask = state.tasks.find((task) => task.owner === "brother" && task.scheduledDate === today && task.start && task.start <= shanghaiTime(now) && !task.completed);
  if (activeTask) return { key: `task-${activeTask.id}`, status: `正在做「${activeTask.title}」`, note: `专注中，预计 ${activeTask.start} 开始` };
  const activeClass = state.schedule.find((item) => {
    const dayNum = weekdayNumber(now);
    return item.days.includes(dayNum) && today <= item.until && item.start <= shanghaiTime(now) && item.end > shanghaiTime(now);
  });
  if (activeClass) return { key: `class-${activeClass.id}`, status: `正在上「${activeClass.title}」`, note: `${activeClass.start}—${activeClass.end}` };
  return null;
}

export function weekdayNumber(date: Date) {
  return date.getDay() || 7;
}

export function readableDate(date: Date) {
  return `${date.getMonth() + 1} 月 ${date.getDate()} 日`;
}
