import { demoRoomToken } from "./demoRoom";
export type PersonId = "brother" | "sister" | "mom";
export type PageId = "home" | "today" | "planner" | "island" | "mail";
export type TaskKind = "fixed" | "temporary";
export type FlowerKind = "sunflower" | "coral" | "bluebell";
export type FishKind = "orange" | "blue" | "koi" | "silver";
export type HouseDecoration = "window" | "lamp" | "fence" | "bench";

export type GrowthEntry = {
  id: string;
  text: string;
  createdAt: string;
};

export type SunlightEntry = {
  id: string;
  amount: number;
  reason: string;
  createdAt: string;
};

export type FamilyStatus = {
  person: PersonId;
  name: string;
  role: string;
  city: string;
  status: string;
  note: string;
  updatedAt: string;
  statusSince?: string;
  statusSource?: "manual" | "schedule";
  manualStatus?: string;
  manualNote?: string;
  color: string;
};

export type StatusEntry = {
  id: string;
  person: PersonId;
  status: string;
  startedAt: string;
};

export type Task = {
  id: string;
  title: string;
  subject: string;
  kind: TaskKind;
  owner: PersonId;
  creator: PersonId;
  date: string;
  completed: boolean;
  sunlight: number;
  scheduledDate?: string;
  start?: string;
  duration?: number;
};

export type ScheduleItem = {
  id: string;
  title: string;
  days: number[];
  start: string;
  end: string;
  until: string;
  tone: "blue" | "orange" | "green";
};

export type HabitState = {
  water: number;
  sleepTime: string;
  wakeTime: string;
  weeklyReading: number;
  weeklyExercise: number;
};

export type Message = {
  id: string;
  author: PersonId;
  text: string;
  createdAt: string;
  kind?: "note" | "meal" | "photo" | "status" | "task";
  image?: string;
  reaction?: number;
};

export type IslandState = {
  level: number;
  sunlight: number;
  lifetimeSunlight: number;
  unlocked: string[];
  flowerPlots: number[];
  flowerKinds: (FlowerKind | "")[];
  gardenProgress: number;
  fishMeals: number;
  fishCollection: FishKind[];
  houseDecorations: HouseDecoration[];
  growthLog: GrowthEntry[];
  sunlightLog: SunlightEntry[];
};

export type AppState = {
  currentUser: PersonId;
  statuses: FamilyStatus[];
  tasks: Task[];
  schedule: ScheduleItem[];
  completedClasses: string[];
  habits: HabitState;
  statusHistory: StatusEntry[];
  messages: Message[];
  island: IslandState;
  activity: string[];
};

export const STORAGE_KEY = `sunny-island-public-v2-${demoRoomToken()}`;
const SUNLIGHT_RESET_KEY = `sunny-island-demo-reset-v2-${demoRoomToken()}`;

export function localDate(value = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(value);
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find((item) => item.type === type)?.value ?? "";
  return `${part("year")}-${part("month")}-${part("day")}`;
}

const today = localDate();

export const personMeta: Record<PersonId, { name: string; initial: string }> = {
  brother: { name: "弟弟", initial: "弟" },
  sister: { name: "姐姐", initial: "姐" },
  mom: { name: "妈妈", initial: "妈" },
};

export const seedState: AppState = {
  currentUser: "brother",
  statuses: [
    { person: "brother", name: "弟弟", role: "小岛探险员", city: "家", status: "正在学数学", note: "练习题还剩最后两道", updatedAt: "刚刚", color: "#53a9cf" },
    { person: "sister", name: "姐姐", role: "小岛联络员", city: "示例城市 A", status: "忙碌中", note: "午休会来岛上看看", updatedAt: "18 分钟前", color: "#e27b64" },
    { person: "mom", name: "妈妈", role: "小岛补给官", city: "示例城市 B", status: "工作中", note: "晚上回家再聊", updatedAt: "32 分钟前", color: "#d6a341" },
  ],
  tasks: [
    { id: "t1", title: "完成数学练习册第 6 页", subject: "数学", kind: "fixed", owner: "brother", creator: "mom", date: today, scheduledDate: today, start: "10:30", duration: 60, completed: false, sunlight: 20 },
    { id: "t2", title: "修改作文《我的暑假》", subject: "语文", kind: "fixed", owner: "brother", creator: "mom", date: today, scheduledDate: today, start: "14:00", duration: 60, completed: false, sunlight: 20 },
    { id: "t3", title: "整理英语课堂笔记", subject: "英语", kind: "temporary", owner: "brother", creator: "brother", date: today, completed: false, sunlight: 15 },
    { id: "t4", title: "整理本周计划", subject: "工作", kind: "temporary", owner: "sister", creator: "sister", date: today, completed: false, sunlight: 5 },
    { id: "t5", title: "晚饭后散步", subject: "生活", kind: "temporary", owner: "mom", creator: "mom", date: today, completed: false, sunlight: 5 },
  ],
  schedule: [
    { id: "s1", title: "数学拓展课", days: [1, 3, 5], start: "08:30", end: "09:30", until: localDate(new Date(Date.now() + 30 * 86400000)), tone: "blue" },
    { id: "s2", title: "英语课", days: [1, 3, 5], start: "16:00", end: "17:00", until: localDate(new Date(Date.now() + 30 * 86400000)), tone: "orange" },
  ],
  completedClasses: [],
  habits: { water: 4, sleepTime: "22:30", wakeTime: "07:00", weeklyReading: 2, weeklyExercise: 1 },
  statusHistory: [],
  messages: [
    { id: "m1", author: "mom", text: "今天的作文完成得很认真，给你留了一颗橘子糖。", createdAt: "09:42", reaction: 2 },
    { id: "m2", author: "sister", text: "我也开始读书啦，我们隔着城市一起专注一会儿。", createdAt: "10:08", reaction: 1 },
  ],
  island: {
    level: 1,
    sunlight: 0,
    lifetimeSunlight: 0,
    unlocked: [],
    flowerPlots: [-1, -1, -1],
    flowerKinds: ["", "", ""],
    gardenProgress: 0,
    fishMeals: 0,
    fishCollection: [],
    houseDecorations: [],
    growthLog: [],
    sunlightLog: [],
  },
  activity: ["妈妈更新了状态", "姐姐在信箱里留了一句话"],
};

export const navItems: { id: PageId; label: string }[] = [
  { id: "home", label: "家庭首页" },
  { id: "today", label: "我的今天" },
  { id: "planner", label: "家庭计划" },
  { id: "island", label: "阳光收藏" },
  { id: "mail", label: "家人动态" },
];

export function normalizeState(stored: Partial<AppState> | null | undefined): AppState {
  return {
    ...seedState,
    ...(stored ?? {}),
    statuses: stored?.statuses ?? seedState.statuses,
    tasks: stored?.tasks ?? seedState.tasks,
    schedule: stored?.schedule ?? seedState.schedule,
    messages: stored?.messages ?? seedState.messages,
    activity: stored?.activity ?? seedState.activity,
    habits: { ...seedState.habits, ...stored?.habits },
    completedClasses: stored?.completedClasses ?? seedState.completedClasses,
    statusHistory: stored?.statusHistory ?? seedState.statusHistory,
    island: {
      ...seedState.island,
      ...stored?.island,
      unlocked: stored?.island?.unlocked ?? seedState.island.unlocked,
      flowerPlots: stored?.island?.flowerPlots ?? seedState.island.flowerPlots,
      flowerKinds: stored?.island?.flowerKinds ?? seedState.island.flowerKinds,
      fishCollection: stored?.island?.fishCollection ?? seedState.island.fishCollection,
      houseDecorations: stored?.island?.houseDecorations ?? seedState.island.houseDecorations,
      growthLog: stored?.island?.growthLog ?? seedState.island.growthLog,
      sunlightLog: stored?.island?.sunlightLog ?? seedState.island.sunlightLog,
    },
  };
}

export function loadState(): AppState {
  if (typeof window === "undefined") return seedState;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      window.localStorage.setItem(SUNLIGHT_RESET_KEY, "done");
      return seedState;
    }
    const stored = JSON.parse(raw) as Partial<AppState>;
    const hydrated = normalizeState(stored);
    if (window.localStorage.getItem(SUNLIGHT_RESET_KEY) !== "done") {
      hydrated.island.sunlight = 0;
      hydrated.island.sunlightLog = [];
      window.localStorage.setItem(SUNLIGHT_RESET_KEY, "done");
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(hydrated));
    }
    return hydrated;
  } catch {
    return seedState;
  }
}

export function saveState(state: AppState) {
  if (typeof window !== "undefined") window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function uid(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}
