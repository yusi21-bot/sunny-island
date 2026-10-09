"use client";

import { useState } from "react";
import { analyzeMealWithCloudbase, mealAiEnabled, MealAnalysis } from "../cloudSync";
import { prepareMealImage } from "../mealImage";
import { SharedPostOptions } from "../constants";

export function BrotherLifeJournal({ onShare }: { onShare: (text: string, options?: SharedPostOptions) => void }) {
  const [mealText, setMealText] = useState("");
  const [mealPreview, setMealPreview] = useState<string | null>(null);
  const [mealImageData, setMealImageData] = useState<string | null>(null);
  const [mealAnalysis, setMealAnalysis] = useState<MealAnalysis | null>(null);
  const [mealBusy, setMealBusy] = useState(false);
  const [mealError, setMealError] = useState("");
  const [momentText, setMomentText] = useState("");
  const [momentPreview, setMomentPreview] = useState<string | null>(null);

  const pickImage = async (file: File, kind: "meal" | "moment") => {
    try {
      const dataUrl = await prepareMealImage(file);
      if (kind === "meal") { setMealPreview(dataUrl); setMealImageData(dataUrl); setMealAnalysis(null); }
      else setMomentPreview(dataUrl);
    } catch (error) { setMealError(error instanceof Error ? error.message : "图片处理失败"); }
  };
  const analyzeMeal = async () => {
    if (!mealText.trim() && !mealImageData) return;
    setMealBusy(true); setMealError("");
    try { setMealAnalysis(await analyzeMealWithCloudbase({ description: mealText, imageDataUrl: mealImageData })); }
    catch (error) { setMealError(error instanceof Error ? error.message : "稍后再试一次"); }
    finally { setMealBusy(false); }
  };
  const shareMeal = () => {
    const detail = mealAnalysis?.familyNote || mealText.trim() || "记录了一顿饭";
    onShare(`今天吃了：${detail}`, { kind: "meal", image: mealPreview ?? undefined }); setMealText(""); setMealPreview(null); setMealImageData(null); setMealAnalysis(null);
  };
  const shareMoment = () => {
    if (!momentText.trim() && !momentPreview) return;
    onShare(momentText.trim() || "记录了今天这一刻", { kind: "photo", image: momentPreview ?? undefined }); setMomentText(""); setMomentPreview(null);
  };

  return <section className="brother-life-journal">
    <article className="brother-record-card meal-record-card">
      <header><span>🍽️</span><div><small>餐食记录</small><b>今天吃了什么</b></div><label>{mealPreview ? "换一张" : "上传"}<input type="file" accept="image/*" onChange={(event) => { const file = event.target.files?.[0]; if (file) void pickImage(file, "meal"); }} /></label></header>
      <div className="brother-record-body">{mealPreview ? <img src={mealPreview} alt="餐食预览" /> : <span className="record-placeholder">一张照片<br />就能开始</span>}<textarea value={mealText} onChange={(event) => setMealText(event.target.value)} placeholder="写下菜名或份量" maxLength={120} /></div>
      {mealAnalysis && <p className="brother-analysis"><b>{mealAnalysis.estimatedCalories}</b>{mealAnalysis.suggestion}</p>}{mealError && <p className="meal-error">{mealError}</p>}
      {!mealAiEnabled && <p className="meal-demo-note">公开演示未开放 AI 分析，可直接分享餐食。</p>}
      <footer>{mealAnalysis && <button className="quiet" onClick={() => setMealAnalysis(null)}>重写</button>}<button onClick={mealAnalysis || !mealAiEnabled ? shareMeal : analyzeMeal} disabled={mealBusy || (!mealText.trim() && !mealImageData)}>{mealBusy ? "分析中…" : mealAnalysis || !mealAiEnabled ? "分享给家人" : "AI 看一看"}</button></footer>
    </article>
    <article className="brother-record-card moment-record-card">
      <header><span>📷</span><div><small>个人记录</small><b>留下这一刻</b></div><label>{momentPreview ? "换一张" : "上传"}<input type="file" accept="image/*" onChange={(event) => { const file = event.target.files?.[0]; if (file) void pickImage(file, "moment"); }} /></label></header>
      <div className="brother-record-body">{momentPreview ? <img src={momentPreview} alt="今日自拍预览" /> : <span className="record-placeholder">自拍、风景<br />都可以</span>}<textarea value={momentText} onChange={(event) => setMomentText(event.target.value)} placeholder="一句话记住今天" maxLength={80} /></div>
      <footer><button onClick={shareMoment} disabled={!momentText.trim() && !momentPreview}>留在家庭足迹</button></footer>
    </article>
  </section>;
}
