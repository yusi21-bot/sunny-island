import cloudbase from "@cloudbase/js-sdk";
import { AppState, normalizeState } from "./data";
import { demoRoomToken } from "./demoRoom";

// Use the CloudBase environment that contains the configured collection and auth settings.
const CLOUD_ENV_ID = import.meta.env.VITE_CLOUDBASE_ENV_ID || "";
export const cloudConfigured = Boolean(CLOUD_ENV_ID);
const CLOUD_REGION = import.meta.env.VITE_CLOUDBASE_REGION || "ap-shanghai";
type CloudbaseApp = {
  auth: () => { signInAnonymously: () => Promise<{ error?: { message?: string } | null }> };
  callFunction: (options: { name: string; data: Record<string, unknown> }) => Promise<{ result?: unknown }>;
};

export type MealAnalysis = {
  dishes: string[];
  nutrition: { name: string; level: "充足" | "适中" | "偏少" | "偏多"; note: string }[];
  strengths: string[];
  cautions: string[];
  suggestion: string;
  familyNote: string;
  estimatedCalories?: string;
};

let appPromise: Promise<CloudbaseApp> | null = null;

async function getCloudbaseApp() {
  if (!cloudConfigured) throw new Error("尚未配置独立演示环境；本机预览仍可使用");
  if (!appPromise) {
    appPromise = (async () => {
      const app = cloudbase.init({ env: CLOUD_ENV_ID, region: CLOUD_REGION }) as unknown as CloudbaseApp;
      const { error } = await app.auth().signInAnonymously();
      if (error) throw new Error(error.message || "CloudBase 匿名登录失败");
      return app;
    })();
  }
  return appPromise;
}

let revision = 0;
let syncPaused = false;
let writePending = 0;
let writeQueue = Promise.resolve();
type StateResponse = {ok:boolean;state?:Partial<AppState>;revision:number;message?:string;conflict?:boolean};
async function stateCall(data:Record<string,unknown>) {
  const app = await getCloudbaseApp();
  const response = await app.callFunction({name:"islandState",data:{...data,roomToken:demoRoomToken()}});
  const payload = response.result as StateResponse;
  if (!payload?.ok) {
    if (payload?.conflict) syncPaused = true;
    throw new Error(payload?.message || "云同步暂时不可用");
  }
  return payload;
}
export async function loadCloudState() {
  const result = await stateCall({action:"load"});
  revision = result.revision;
  return result.state ? normalizeState(result.state) : null;
}
export async function saveCloudState(state:AppState) {
  if (syncPaused) throw new Error("云端存在更新，本机内容已保存，请刷新后再同步");
  writePending += 1;
  const write = writeQueue.then(async () => {
    if (syncPaused) throw new Error("云端同步已暂停，本机内容已保留");
    const result = await stateCall({action:"save",state,revision});
    revision = result.revision;
  });
  writeQueue = write.catch(()=>{});
  try { await write; } finally { writePending -= 1; }
}

export async function analyzeMealWithCloudbase(input: { description: string; imageDataUrl?: string | null }) {
  const app = await getCloudbaseApp();
  const response = await app.callFunction({
    name: "analyzeMeal",
    data: {
      description: input.description.trim(),
      imageDataUrl: input.imageDataUrl || undefined,
    },
  });
  const payload = response.result as { ok?: boolean; analysis?: MealAnalysis; message?: string } | undefined;
  if (!payload?.ok || !payload.analysis) throw new Error(payload?.message || "饮食分析暂时不可用");
  return payload.analysis;
}

export async function watchCloudState(onState:(state:AppState)=>void,onError:(message:string)=>void) {
  let stopped = false;
  let polling = false;
  const poll = async () => {
    if (stopped || polling || writePending || syncPaused || document.hidden) return;
    polling = true;
    const observedRevision = revision;
    try {
      const result = await stateCall({action:"load"});
      if (stopped || writePending || revision !== observedRevision) return;
      if (result.state && result.revision > revision) {
        revision = result.revision;
        onState(normalizeState(result.state));
      }
    } catch (error) { onError(error instanceof Error ? error.message : "云同步暂时不可用"); }
    finally { polling = false; }
  };
  const timer = window.setInterval(()=>void poll(),6000);
  const refresh = () => void poll();
  window.addEventListener("focus",refresh);
  window.addEventListener("online",refresh);
  return () => { stopped=true;clearInterval(timer);window.removeEventListener("focus",refresh);window.removeEventListener("online",refresh); };
}
