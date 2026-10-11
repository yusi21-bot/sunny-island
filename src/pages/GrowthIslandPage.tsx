"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { AppState, FlowerKind, FishKind, HouseDecoration } from "../data";
import { FLOWER_OPTIONS, FISH_OPTIONS, HOUSE_OPTIONS, SHOP_CATEGORIES, SHOP_ITEMS } from "../constants";

export function GrowthIslandPage({ state, onGrow, onAdoptFish, onDecorate, onShopBuy }: { state: AppState; onGrow: (kind?: FlowerKind) => boolean; onAdoptFish: (kind: FishKind) => boolean; onDecorate: (decoration: HouseDecoration) => boolean; onShopBuy: (itemId: string) => boolean }) {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const [sceneReady, setSceneReady] = useState(false);
  const shopCategories = SHOP_CATEGORIES.filter((category) => category !== "全部" && category !== "生活");
  const [shopCategory, setShopCategory] = useState(shopCategories[0]);
  const [shopPage, setShopPage] = useState(0);
  const shopItems = SHOP_ITEMS.filter((item) => item.category === shopCategory);
  const shopPages = Math.max(1, Math.ceil(shopItems.length / 2));
  const visibleItems = shopItems.slice(shopPage * 2, shopPage * 2 + 2);
  const selectCategory = (category: string) => { setShopCategory(category); setShopPage(0); };
  const turnPage = (direction: 1 | -1) => setShopPage((page) => (page + direction + shopPages) % shopPages);
  const focusScene = () => {
    frameRef.current?.contentWindow?.postMessage({ type: "growth-focus", focus: "overview" }, window.location.origin);
  };
  useEffect(() => {
    let idle: number;
    if ("requestIdleCallback" in window) {
      idle = requestIdleCallback(() => setSceneReady(true), { timeout: 900 });
    } else {
      idle = setTimeout(() => setSceneReady(true), 320) as unknown as number;
    }
    return () => {
      clearTimeout(idle);
    };
  }, []);
  return <section className="growth-page growth-play-page growth-layout-reset">
    <div className="growth-scene growth-game-scene growth-3d-pane">
      {!sceneReady && <div className="growth-webgl-placeholder"><i /><span>正在准备晴日岛</span></div>}
      {sceneReady && <iframe ref={frameRef} className="growth-webgl-frame" src="./growth-island-webgl-demo.html?embed=1&scene=0715162737-v3&model=draco" title="家庭成长小岛三维场景" loading="lazy" />}
      <nav className="growth-view-controls" aria-label="小岛视图">
        <button className="active" aria-pressed="true" onClick={focusScene}>全岛视角</button>
      </nav>
    </div>
    <aside className="growth-sun-shop" aria-label="阳光收藏册">
      <header className="sun-shop-header">
        <span className="shop-overline"><i />阳光收藏册</span>
        <div><h2>今天想带谁回家？</h2><p>完成任务得到的阳光，可以换成小岛上的新惊喜。</p></div>
      </header>
      <nav className="shop-series-index" aria-label="收藏系列">
        {shopCategories.map((category, index) => <button key={category} className={shopCategory === category ? "active" : ""} onClick={() => selectCategory(category)}><span>{String(index + 1).padStart(2, "0")}</span><b>{category}</b><small>{SHOP_ITEMS.filter((item) => item.category === category).length} 件</small></button>)}
      </nav>
      <section className="shop-book-page" aria-live="polite">
        <div className="shop-page-heading"><div><span>第 {shopPage + 1} / {shopPages} 页</span><h3>{shopCategory}系列</h3></div><p>点击未收藏的卡片，即可用阳光收藏。</p></div>
        <AnimatePresence mode="wait">
          <motion.div key={`${shopCategory}-${shopPage}`} className="shop-card-spread" initial={{ opacity: 0, rotateY: -16, x: 26 }} animate={{ opacity: 1, rotateY: 0, x: 0 }} exit={{ opacity: 0, rotateY: 14, x: -26 }} transition={{ type: "spring", stiffness: 240, damping: 25 }}>
            {visibleItems.map((item) => {
              const owned = state.island.unlocked.includes(item.id);
              const affordable = state.island.sunlight >= item.cost;
              return <motion.article key={item.id} className={`sun-shop-card ${owned ? "owned" : "locked"}`} role={!owned ? "button" : undefined} tabIndex={!owned ? 0 : undefined} aria-label={!owned ? `花费 ${item.cost} 点阳光收藏${item.name}` : undefined} onClick={() => { if (!owned) onShopBuy(item.id); }} onKeyDown={(event) => { if (!owned && (event.key === "Enter" || event.key === " ")) { event.preventDefault(); onShopBuy(item.id); } }} whileHover={{ y: -5, rotate: owned ? 0 : -1 }}>
                <div className="sun-shop-art"><img src={item.asset} alt={item.name} /><span className="card-glimmer" />{!owned && <span className="shop-lock"><i>⌁</i><b>等待收藏</b></span>}</div>
                <div className="sun-shop-copy"><span>{item.category} · 独立泥塑收藏</span><div className="sun-shop-title-row"><h4>{item.name}</h4><span className="sun-shop-price-stack"><span className={`sun-shop-buy ${owned ? "owned" : ""}`}><i />{owned ? "已收藏" : `${item.cost} 阳光`}</span>{!owned && !affordable && <small className="shop-shortage">还差 {item.cost - state.island.sunlight} 点阳光</small>}</span></div></div>
              </motion.article>;
            })}
          </motion.div>
        </AnimatePresence>
        <div className="shop-turning"><button type="button" onClick={() => turnPage(-1)} aria-label="上一页">←</button><span><i />{shopPage + 1} / {shopPages}<i /></span><button type="button" onClick={() => turnPage(1)} aria-label="下一页">→</button></div>
      </section>
      <footer className="sun-shop-footer"><span>✦</span><p>每次只翻开两件小收藏，给明天留一点期待。</p></footer>
    </aside>
  </section>;
}
