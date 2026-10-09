"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  AppState,
  FlowerKind,
  FishKind,
  HouseDecoration,
  PageId,
  PersonId,
  loadState,
  localDate,
  navItems,
  personMeta,
  saveState,
  seedState,
  uid,
} from "./data";
import { cloudConfigured, loadCloudState, saveCloudState, watchCloudState } from "./cloudSync";
import {
  CLASS_SUNLIGHT,
  FLOWER_OPTIONS,
  FISH_OPTIONS,
  HOUSE_OPTIONS,
  SHOP_ITEMS,
  statusOptions,
  type TaskDraft,
  type TaskPatch,
  type SharedPostOptions,
} from "./constants";
import {
  automaticBrotherStatus,
  classOccurrenceKey,
  dateFromIso,
  minutesToTime,
  rewardIsland,
  scheduleDuration,
  shanghaiTime,
  timeToMinutes,
  weekdayNumber,
} from "./utils";
import { SunValue, PersonMark, StatusModal, SunlightLedger } from "./components/SharedUI";
import { demoRoomLink } from "./demoRoom";
import { HomePage } from "./pages/HomePage";
import { TodayPage } from "./pages/TodayPage";
import { PlannerPage } from "./pages/PlannerPage";
import { GrowthIslandPage } from "./pages/GrowthIslandPage";
import { MailPage } from "./pages/MailPage";

export default function FamilyIslandApp() {
  const [page, setPage] = useState<PageId>("home");
  const [state, setState] = useState<AppState>(seedState);
  const [hydrated, setHydrated] = useState(false);
  const [statusEditor, setStatusEditor] = useState<PersonId | null>(null);
  const [sunlightLedgerOpen, setSunlightLedgerOpen] = useState(false);
  const [toast, setToast] = useState("");
  const [cloudStatus, setCloudStatus] = useState<"connecting" | "connected" | "error">("connecting");
  const cloudReadyRef = useRef(false);
  const applyingRemoteRef = useRef(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const localState = loadState();
    let stopped = false;
    let stopWatching: (() => void) | undefined;
    setState(localState);
    setHydrated(true);

    const connectCloud = async () => {
      try {
        const remoteState = await loadCloudState();
        if (stopped) return;
        if (remoteState) {
          applyingRemoteRef.current = true;
          setState((current) => ({ ...remoteState, currentUser: current.currentUser }));
        } else {
          await saveCloudState(localState);
        }
        cloudReadyRef.current = true;
        setCloudStatus("connected");
        stopWatching = await watchCloudState(
          (remote) => {
            if (stopped) return;
            setCloudStatus("connected");
            applyingRemoteRef.current = true;
            setState((current) => ({ ...remote, currentUser: current.currentUser }));
          },
          (message) => {
            console.warn("CloudBase realtime sync failed:", message);
            if (!stopped) setCloudStatus("error");
          },
        );
      } catch (error) {
        console.warn("CloudBase sync unavailable:", error);
        if (!stopped) {
          setCloudStatus("error");
          setToast("云同步暂未连接，本机继续可用");
        }
      }
    };

    if (cloudConfigured) void connectCloud();
    return () => {
      stopped = true;
      stopWatching?.();
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    saveState(state);
    if (applyingRemoteRef.current) {
      applyingRemoteRef.current = false;
      return;
    }
    if (!cloudReadyRef.current) return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      saveCloudState({ ...state, currentUser: "brother" }).then(() => setCloudStatus("connected")).catch((error) => {
        console.warn("CloudBase save failed:", error);
        setCloudStatus("error");
        setToast(error instanceof Error ? error.message : "云端保存失败，已先保存在本机");
      });
    }, 650);
  }, [state, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    const syncStatus = () => setState((current) => {
      const automatic = automaticBrotherStatus(current);
      const brother = current.statuses.find((item) => item.person === "brother");
      if (!brother) return current;
      if (automatic) {
        if (brother.statusSource === "schedule" && brother.note === automatic.note) return current;
        const startedAt = shanghaiTime();
        return {
          ...current,
          statuses: current.statuses.map((item) => item.person === "brother" ? { ...item, status: automatic.status, note: automatic.note, updatedAt: "按日程同步", statusSince: new Date().toISOString(), statusSource: "schedule", manualStatus: item.statusSource === "schedule" ? item.manualStatus : item.status, manualNote: item.statusSource === "schedule" ? item.manualNote : item.note } : item),
          statusHistory: [...current.statusHistory, { id: uid(automatic.key), person: "brother" as const, status: automatic.status, startedAt }].slice(-40),
        };
      }
      if (brother.statusSource !== "schedule") return current;
      return { ...current, statuses: current.statuses.map((item) => item.person === "brother" ? { ...item, status: item.manualStatus ?? "休息一下", note: item.manualNote ?? "当前没有安排中的任务", updatedAt: "刚刚", statusSince: new Date().toISOString(), statusSource: "manual" } : item) };
    });
    syncStatus();
    const timer = window.setInterval(syncStatus, 60_000);
    return () => window.clearInterval(timer);
  }, [hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    const completeFinishedClasses = () => setState((current) => {
      const date = localDate();
      const day = dateFromIso(date);
      const now = shanghaiTime();
      const newlyFinished = current.schedule.filter((item) => item.days.includes(weekdayNumber(day)) && date <= item.until && item.end <= now && !current.completedClasses.includes(classOccurrenceKey(item, date)));
      if (!newlyFinished.length) return current;
      const gain = newlyFinished.length * CLASS_SUNLIGHT;
      return {
        ...current,
        completedClasses: [...current.completedClasses, ...newlyFinished.map((item) => classOccurrenceKey(item, date))],
        island: rewardIsland(current.island, gain, `完成固定课程：${newlyFinished.map((item) => item.title).join("、")}`),
        activity: [...newlyFinished.map((item) => `弟弟完成了「${item.title}」，小岛获得 ${CLASS_SUNLIGHT} 点阳光`), ...current.activity].slice(0, 8),
      };
    });
    completeFinishedClasses();
    const timer = window.setInterval(completeFinishedClasses, 60_000);
    return () => window.clearInterval(timer);
  }, [hydrated]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 2300);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const mutate = (updater: (current: AppState) => AppState, message?: string) => {
    setState(updater);
    if (message) setToast(message);
  };

  const updateStatus = (person: PersonId, statusText: string, note: string) => {
    if (person !== state.currentUser) {
      setToast(`当前是${personMeta[state.currentUser].name}，只能更新自己的状态`);
      return;
    }
    const changedAt = new Date();
    const startedAt = changedAt.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" });
    mutate((current) => ({
      ...current,
      statuses: current.statuses.map((item) => item.person === person ? { ...item, status: statusText, note, updatedAt: "刚刚", statusSince: changedAt.toISOString(), statusSource: "manual", manualStatus: statusText, manualNote: note } : item),
      statusHistory: [...current.statusHistory, { id: uid("status"), person, status: statusText, startedAt }].slice(-40),
      messages: [...current.messages, { id: uid("post"), author: person, kind: "status" as const, text: `${statusText}${note ? ` · ${note}` : ""}`, createdAt: changedAt.toISOString() }].slice(-24),
      island: person === "brother" ? current.island : rewardIsland(current.island, 2, `${personMeta[person].name}更新了状态`),
      activity: [`${personMeta[person].name}更新了状态`, ...current.activity].slice(0, 8),
    }), "状态已更新");
    setStatusEditor(null);
  };

  const openOwnStatusEditor = (person: PersonId) => {
    if (person !== state.currentUser) {
      setToast(`可以查看${personMeta[person].name}的状态，但不能替对方修改`);
      return;
    }
    setStatusEditor(person);
  };

  const addTask = (draft: TaskDraft) => {
    const sunlight = draft.owner === "brother" ? (draft.kind === "fixed" ? 20 : 15) : 5;
    mutate((current) => ({
      ...current,
      tasks: [...current.tasks, { id: uid("task"), ...draft, creator: current.currentUser, date: localDate(), completed: false, sunlight }],
    }), "任务已加入待排期");
  };

  const updateTask = (id: string, patch: TaskPatch, message = "任务已更新") => {
    mutate((current) => ({ ...current, tasks: current.tasks.map((task) => task.id === id ? { ...task, ...patch } : task) }), message);
  };

  const deleteTask = (id: string) => {
    mutate((current) => ({ ...current, tasks: current.tasks.filter((task) => task.id !== id) }), "任务已删除");
  };

  const scheduleTask = (id: string, scheduledDate: string, start: string) => {
    updateTask(id, { scheduledDate, start, duration: state.tasks.find((task) => task.id === id)?.duration ?? 60 }, "任务已排进日程");
  };

  const toggleTask = (task: import("./data").Task) => {
    const gain = task.completed ? -task.sunlight : task.sunlight;
    mutate((current) => ({
      ...current,
      tasks: current.tasks.map((item) => item.id === task.id ? { ...item, completed: !item.completed } : item),
      messages: task.completed ? current.messages : [...current.messages, { id: uid("post"), author: task.owner, kind: "task" as const, text: `完成了「${task.title}」`, createdAt: new Date().toISOString() }].slice(-24),
      island: rewardIsland(current.island, gain, task.completed ? `撤销任务完成：${task.title}` : `完成任务：${task.title}`),
      activity: task.completed ? current.activity : [`${personMeta[task.owner].name}完成了「${task.title}」`, ...current.activity].slice(0, 8),
    }), task.completed ? "已恢复为待完成" : `完成啦，小岛获得 ${task.sunlight} 点阳光`);
  };

  const updateSchedule = (id: string, patch: Partial<import("./data").ScheduleItem>) => {
    mutate((current) => ({ ...current, schedule: current.schedule.map((item) => item.id === id ? { ...item, ...patch } : item) }), "固定日程已更新");
  };

  const moveSchedule = (id: string, sourceDay: number, targetDay: number, start: string) => {
    const item = state.schedule.find((entry) => entry.id === id);
    if (!item) return;
    const duration = scheduleDuration(item);
    const days = Array.from(new Set(item.days.map((day) => day === sourceDay ? targetDay : day))).sort();
    updateSchedule(id, { days, start, end: minutesToTime(timeToMinutes(start) + duration) });
  };

  const deleteSchedule = (id: string) => {
    mutate((current) => ({ ...current, schedule: current.schedule.filter((item) => item.id !== id) }), "固定日程已删除");
  };

  const changeHabit = (key: "water" | "weeklyReading" | "weeklyExercise", delta: number, max: number) => {
    const label = key === "water" ? "喝水" : key === "weeklyReading" ? "阅读" : "运动";
    mutate((current) => {
      const value = Math.max(0, Math.min(max, current.habits[key] + delta));
      if (value === current.habits[key]) return current;
      const gain = (key === "water" ? 3 : 8) * Math.sign(value - current.habits[key]);
      return {
        ...current,
        habits: { ...current.habits, [key]: value },
        island: rewardIsland(current.island, gain, `${delta > 0 ? "记录" : "撤销"}${label}`),
        activity: delta > 0 ? [`弟弟完成了${label}记录`, ...current.activity].slice(0, 8) : current.activity,
      };
    }, delta > 0 ? `${label}记录成功` : `已调整${label}记录`);
  };

  const addMessage = (text: string, options: SharedPostOptions = {}) => {
    mutate((current) => ({
      ...current,
      messages: [...current.messages, { id: uid("message"), author: current.currentUser, text, kind: options.kind ?? "note", image: options.image, createdAt: new Date().toISOString() }].slice(-24),
      activity: [`${personMeta[current.currentUser].name}更新了家人动态`, ...current.activity].slice(0, 8),
    }), "已加入家人动态");
  };

  const reactMessage = (id: string) => {
    mutate((current) => ({ ...current, messages: current.messages.map((message) => message.id === id ? { ...message, reaction: (message.reaction ?? 0) + 1 } : message) }));
  };

  const growFlower = (kind?: FlowerKind) => {
    const growingPlot = state.island.flowerPlots.findIndex((stage) => stage >= 0 && stage < 3);
    const emptyPlot = state.island.flowerPlots.findIndex((stage) => stage < 0);
    const target = growingPlot >= 0 ? growingPlot : emptyPlot;
    if (target < 0) { setToast("三块花圃都已经盛开啦"); return false; }
    const planting = state.island.flowerPlots[target] < 0;
    const cost = planting ? 10 : 8;
    if (state.island.sunlight < cost) { setToast(`还差 ${cost - state.island.sunlight} 点阳光`); return false; }
    const chosenKind = planting ? kind ?? "sunflower" : state.island.flowerKinds[target] || "sunflower";
    const flowerName = FLOWER_OPTIONS.find((item) => item.id === chosenKind)?.name ?? "小花";
    const text = planting ? `种下了一株${flowerName}` : `${flowerName}长大了一步`;
    mutate((current) => {
      const flowerPlots = [...current.island.flowerPlots];
      const flowerKinds = [...current.island.flowerKinds];
      flowerPlots[target] = planting ? 0 : Math.min(3, flowerPlots[target] + 1);
      flowerKinds[target] = chosenKind;
      const island = rewardIsland(current.island, -cost, planting ? `种下${flowerName}` : `培育${flowerName}`);
      return { ...current, island: { ...island, flowerPlots, flowerKinds, growthLog: [{ id: uid("grow"), text, createdAt: `今天 ${shanghaiTime()}` }, ...current.island.growthLog].slice(0, 12) }, activity: [text, ...current.activity].slice(0, 8) };
    }, planting ? `${flowerName}已经种下` : `${flowerName}长大了一步`);
    return true;
  };

  const adoptFish = (kind: FishKind) => {
    const option = FISH_OPTIONS.find((item) => item.id === kind)!;
    if (state.island.fishCollection.includes(kind)) { setToast(`${option.name}已经住在池塘里啦`); return false; }
    if (state.island.sunlight < option.cost) { setToast(`还差 ${option.cost - state.island.sunlight} 点阳光`); return false; }
    const text = `把新朋友${option.name}带回了清清池塘`;
    mutate((current) => { const island = rewardIsland(current.island, -option.cost, `领养${option.name}`); return { ...current, island: { ...island, fishCollection: [...current.island.fishCollection, kind], growthLog: [{ id: uid("fish"), text, createdAt: `今天 ${shanghaiTime()}` }, ...current.island.growthLog].slice(0, 12) }, activity: [text, ...current.activity].slice(0, 8) }; }, `${option.name}开始在池塘里游泳啦`);
    return true;
  };

  const unlockHouseDecoration = (decoration: HouseDecoration) => {
    const option = HOUSE_OPTIONS.find((item) => item.id === decoration)!;
    if (state.island.houseDecorations.includes(decoration)) { setToast(`${option.name}已经布置好了`); return false; }
    if (state.island.sunlight < option.cost) { setToast(`还差 ${option.cost - state.island.sunlight} 点阳光`); return false; }
    const text = `为温暖木屋添上了${option.name}`;
    mutate((current) => { const island = rewardIsland(current.island, -option.cost, `布置木屋：${option.name}`); return { ...current, island: { ...island, houseDecorations: [...current.island.houseDecorations, decoration], growthLog: [{ id: uid("home"), text, createdAt: `今天 ${shanghaiTime()}` }, ...current.island.growthLog].slice(0, 12) }, activity: [text, ...current.activity].slice(0, 8) }; }, `${option.name}已经出现在木屋旁`);
    return true;
  };

  const buyShopItem = (itemId: string) => {
    const item = SHOP_ITEMS.find((entry) => entry.id === itemId);
    if (!item) return false;
    if (state.island.unlocked.includes(itemId)) { setToast("这件物品已经收藏啦"); return false; }
    if (state.island.sunlight < item.cost) { setToast(`还差 ${item.cost - state.island.sunlight} 点阳光`); return false; }
    const text = `兑换了${item.name}，收入家庭收藏`;
    mutate((current) => { const island = rewardIsland(current.island, -item.cost, `阳光商店：${item.name}`); return { ...current, island: { ...island, unlocked: [...current.island.unlocked, itemId], growthLog: [{ id: uid("shop"), text, createdAt: `今天 ${shanghaiTime()}` }, ...current.island.growthLog].slice(0, 12) }, activity: [text, ...current.activity].slice(0, 8) }; }, `${item.name}已经收藏`);
    return true;
  };

  return (
    <div className={`family-app page-${page} role-${state.currentUser}`}>
      <aside className="demo-banner">公开演示 · 虚构家庭 · {cloudConfigured ? cloudStatus === "connected" ? "云同步已连接" : cloudStatus === "connecting" ? "正在连接云同步" : "云同步未连接，本机可用" : "本机预览，云端待配置"}<button className="room-link" disabled={!cloudConfigured || cloudStatus !== "connected"} title={cloudStatus === "connected" && cloudConfigured ? "分享给另一台设备" : "云同步连接成功后开放"} onClick={() => navigator.clipboard.writeText(demoRoomLink()).then(() => setToast("演示空间链接已复制；另一台设备打开后可查看同一份内容")).catch(() => setToast("当前浏览器无法复制链接"))}>复制同岛链接</button></aside>
      <Header state={state} onHome={() => setPage("home")} onSetUser={(currentUser) => setState({ ...state, currentUser })} onEditStatus={() => setStatusEditor(state.currentUser)} onOpenSunlight={() => setSunlightLedgerOpen(true)} />
      <main>
        {page === "home" && <HomePage state={state} onEditStatus={openOwnStatusEditor} onNavigate={setPage} />}
        {page === "today" && <TodayPage state={state} onToggle={toggleTask} onHabit={changeHabit} onNavigate={setPage} onShareMeal={addMessage} onQuickStatus={(person, status) => updateStatus(person, status, status === "玩耍中" ? "正在自由安排休息时间" : "已记入演示动态")} onSleep={(key, value) => setState({ ...state, habits: { ...state.habits, [key]: value } })} />}
        {page === "planner" && <PlannerPage state={state} onAdd={addTask} onUpdateTask={updateTask} onDeleteTask={deleteTask} onScheduleTask={scheduleTask} onToggle={toggleTask} onUpdateSchedule={updateSchedule} onMoveSchedule={moveSchedule} onDeleteSchedule={deleteSchedule} />}
        {page === "island" && <GrowthIslandPage state={state} onGrow={growFlower} onAdoptFish={adoptFish} onDecorate={unlockHouseDecoration} onShopBuy={buyShopItem} />}
        {page === "mail" && <MailPage state={state} onSend={addMessage} onReact={reactMessage} />}
      </main>
      <LiquidNav page={page} onNavigate={setPage} />
      {statusEditor && <StatusModal status={state.statuses.find((item) => item.person === statusEditor)!} onClose={() => setStatusEditor(null)} onSave={updateStatus} />}
      {sunlightLedgerOpen && <SunlightLedger island={state.island} onClose={() => setSunlightLedgerOpen(false)} />}
      {toast && <div className="toast" role="status">{toast}</div>}
    </div>
  );
}

function Header({ state, onHome, onSetUser, onEditStatus, onOpenSunlight }: { state: AppState; onHome: () => void; onSetUser: (person: PersonId) => void; onEditStatus: () => void; onOpenSunlight: () => void }) {
  return (
    <header className="site-header">
      <button className="brand" onClick={onHome} aria-label="返回晴日岛首页"><span className="brand-sun" /><span><b>晴日岛</b><small>把每一天，养成会发光的样子</small></span></button>
      <div className="header-family">
        <button className="header-sunlight-ledger" type="button" onClick={onOpenSunlight} aria-label={`查看阳光记录，当前 ${state.island.sunlight} 点`}><SunValue value={state.island.sunlight} /><span>查看记录</span></button>
        <label><span>现在是</span><select value={state.currentUser} onChange={(event) => onSetUser(event.target.value as PersonId)}><option value="brother">弟弟</option><option value="sister">姐姐</option><option value="mom">妈妈</option></select></label>
        <button className="header-avatar" onClick={onEditStatus} aria-label="更新我的状态"><PersonMark person={state.currentUser} /></button>
      </div>
    </header>
  );
}

function LiquidNav({ page, onNavigate }: { page: PageId; onNavigate: (page: PageId) => void }) {
  const activeIndex = navItems.findIndex((item) => item.id === page);
  return <nav className="liquid-nav" aria-label="主要页面" style={{ "--active-index": activeIndex } as React.CSSProperties}><span className="liquid-selection" />{navItems.map((item) => <button key={item.id} className={page === item.id ? "active" : ""} onClick={() => onNavigate(item.id)}><i /><span>{item.label}</span></button>)}</nav>;
}
