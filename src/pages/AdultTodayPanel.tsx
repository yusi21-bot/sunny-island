"use client";

import { useState } from "react";
import { AppState, PageId, localDate } from "../data";
import { analyzeMealWithCloudbase, MealAnalysis } from "../cloudSync";
import { prepareMealImage } from "../mealImage";
import { SharedPostOptions } from "../constants";
import { PersonMark } from "../components/SharedUI";

export function AdultTodayPanel({ state, onNavigate, onShareMeal }: { state: AppState; onNavigate: (page: PageId) => void; onShareMeal: (text: string, options?: SharedPostOptions) => void }) {
  const [mealText, setMealText] = useState("");
  const [mealPreview, setMealPreview] = useState<string | null>(null);
  const [mealImageData, setMealImageData] = useState<string | null>(null);
  const [mealAnalysis, setMealAnalysis] = useState<MealAnalysis | null>(null);
  const [mealBusy, setMealBusy] = useState(false);
  const [mealError, setMealError] = useState("");
  const today = localDate();
  const ownTasks = state.tasks.filter((task) => task.owner === state.currentUser && task.scheduledDate === today);
  const brotherTasks = state.tasks.filter((task) => task.owner === "brother" && task.scheduledDate === today);
  const ownDone = ownTasks.filter((task) => task.completed).length;
  const brotherDone = brotherTasks.filter((task) => task.completed).length;
  const brotherStatus = state.statuses.find((item) => item.person === "brother")!;
  const isMom = state.currentUser === "mom";
  const roleSuggestion = isMom ? "吃好、走一走，心也松一点。" : "做完重要的事，也给自己留点空。";
  const focusItems = isMom ? ["饭后走走", "心情舒展"] : ["完成重点", "留点空白"];
  const momCheckins = [{ id: "walk", label: "饭后走一走", note: "身体轻一点" }, { id: "mood", label: "心情舒畅", note: "今天也松弛" }];
  const [momCheckinState, setMomCheckinState] = useState<Record<string, boolean>>({});
  const momCheckinDone = momCheckins.filter((item) => momCheckinState[item.id]).length;

  const submitMeal = () => {
    const detail = mealAnalysis?.familyNote || mealText.trim() || (mealPreview ? "一张今天的餐食照片" : "");
    if (!detail) return;
    onShareMeal(`今天吃了：${detail}`, { kind: "meal", image: mealPreview ?? undefined });
    setMealText("");
    setMealPreview(null);
    setMealImageData(null);
    setMealAnalysis(null);
  };

  const analyzeMeal = async () => {
    if (!mealText.trim() && !mealImageData) return;
    setMealBusy(true);
    setMealError("");
    try {
      setMealAnalysis(await analyzeMealWithCloudbase({ description: mealText, imageDataUrl: mealImageData }));
    } catch (error) {
      setMealError(error instanceof Error ? error.message : "分析失败，请稍后重试");
    } finally {
      setMealBusy(false);
    }
  };

  return <aside className={`adult-today-panel ${isMom ? "mom-layout" : ""}`}>
    <header className="adult-panel-heading"><span className="overline">{isMom ? "妈妈的生活节奏" : "姐姐的工作日"}</span><h2>{isMom ? "今天也照顾好自己" : "工作与生活不挤在一起"}</h2><p>{roleSuggestion}</p><div className="role-focus-list">{focusItems.map((item) => <span key={item}>{item}</span>)}</div></header>
    <div className={`adult-panel-grid ${isMom ? "mom-only" : ""}`}>
      {!isMom && <section className="adult-progress-card own"><div><span>我的安排</span><strong>{ownDone}<small> / {ownTasks.length}</small></strong></div><div className="adult-progress"><i style={{ width: `${ownTasks.length ? ownDone / ownTasks.length * 100 : 0}%` }} /></div><button onClick={() => onNavigate("planner")}>{ownTasks.length ? "整理今天的安排" : "添加第一项安排"}</button></section>}
      {isMom ? <section className="adult-progress-card mom-checkins"><header><div><small>妈妈今日打卡</small><b>{momCheckinDone} / {momCheckins.length}</b></div><em>生活记录</em></header><div className="mom-checkin-list">{momCheckins.map((item) => <button type="button" key={item.id} className={momCheckinState[item.id] ? "done" : ""} onClick={() => setMomCheckinState((prev) => ({ ...prev, [item.id]: !prev[item.id] }))}><i /><span><b>{item.label}</b><small>{item.note}</small></span></button>)}</div><footer><button type="button" onClick={() => onNavigate("planner")}>布置任务</button><small>把弟弟的学习安排好，也记得照顾自己。</small></footer></section> : <section className="adult-progress-card family"><header><div><i style={{ background: brotherStatus.color }} /><span><small>弟弟现在</small><b>{brotherStatus.status}</b></span></div><em>{brotherStatus.updatedAt}</em></header><p>{brotherStatus.note}</p><div className="brother-progress-line"><span>今日任务</span><strong>{brotherDone} / {brotherTasks.length}</strong><div><i style={{ width: `${brotherTasks.length ? brotherDone / brotherTasks.length * 100 : 0}%` }} /></div></div><button onClick={() => onNavigate("planner")}>查看家庭计划</button></section>}
    </div>
    <section className={`meal-journal-card ${mealAnalysis ? "analyzed" : ""}`}>
      <header><span><small>今日饮食</small><b>拍下餐食，获得一份温和的营养建议</b></span><label className="meal-photo-button">{mealPreview ? "更换照片" : "选择照片"}<input type="file" accept="image/*" onChange={async (event) => { const file = event.target.files?.[0]; if (!file) return; setMealAnalysis(null); setMealError(""); try { const dataUrl = await prepareMealImage(file); setMealPreview(dataUrl); setMealImageData(dataUrl); } catch (error) { setMealError(error instanceof Error ? error.message : "图片处理失败"); } }} /></label></header>
      {!mealAnalysis ? <div className="meal-compose">{mealPreview ? <img src={mealPreview} alt="今天的餐食预览" /> : <div className="meal-photo-empty"><i /><span>拍照或上传</span></div>}<textarea value={mealText} onChange={(event) => setMealText(event.target.value)} placeholder="可补充菜名和份量，例如：一碗米饭、番茄牛肉和青菜……" maxLength={160} /></div> : <div className="meal-analysis-result"><div className="meal-analysis-top"><span>{mealAnalysis.dishes.slice(0, 4).map((dish) => <b key={dish}>{dish}</b>)}</span><em>{mealAnalysis.estimatedCalories}</em></div><div className="nutrition-tags">{mealAnalysis.nutrition.slice(0, 4).map((item) => <span className={item.level} key={item.name}><b>{item.name}</b><small>{item.level}</small></span>)}</div><p>{mealAnalysis.suggestion}</p></div>}
      {mealError && <p className="meal-error">{mealError}</p>}
      <footer><span>{mealAnalysis ? "分析仅供日常参考，不代替专业医疗建议。" : "图片会先压缩，再通过安全的云函数分析。"}</span><div>{mealAnalysis && <button className="meal-secondary" onClick={() => setMealAnalysis(null)}>重新编辑</button>}<button onClick={mealAnalysis ? submitMeal : analyzeMeal} disabled={mealBusy || (!mealText.trim() && !mealImageData)}>{mealBusy ? "正在分析…" : mealAnalysis ? "分享给家人" : "AI 分析营养"}</button></div></footer>
    </section>
    {isMom && <section className="mom-mood-card"><div><small>今日心情</small><h3>给自己留一点轻松</h3><p>记录一句心情，也可以同步给家人。</p></div><div className="mom-mood-actions"><button type="button" onClick={() => onShareMeal("今天心情舒展，照顾好自己啦。", { kind: "note" })}>同步好心情</button><button type="button" onClick={() => onShareMeal("饭后走一走，身体轻一点。", { kind: "note" })}>记录走走</button></div></section>}
  </aside>;
}
