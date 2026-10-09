// Shared constants and assets used across pages
import type { FlowerKind, FishKind, HouseDecoration, PageId, PersonId, TaskKind } from "./data";

export const DEFAULT_START_HOUR = 8;
export const ROW_HEIGHT = 72;
export const CLASS_SUNLIGHT = 20;

export const WEEKDAY_NAMES = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];

export const HABIT_ASSETS = {
  water: "./assets/clay/habits/items/water-spirit-cup.png",
  sleep: "./assets/clay/habits/items/webp/sleep-moon.webp",
  reading: "./assets/clay/habits/items/webp/reading-book.webp",
  exercise: "./assets/clay/habits/items/webp/exercise-shoes.webp",
};

export const SUBJECT_ASSETS: Record<string, string> = {
  数学: "./assets/clay/subjects/items/webp/math-blocks.webp",
  语文: "./assets/clay/subjects/items/webp/chinese-scroll.webp",
  英语: "./assets/clay/subjects/items/webp/english-headphones.webp",
  阅读: "./assets/clay/subjects/items/webp/reading-books.webp",
  生活: "./assets/clay/subjects/items/webp/life-sprout.webp",
  工作: "./assets/clay/subjects/items/webp/work-briefcase.webp",
};

export const FLOWER_ASSETS = ["./assets/clay/sunflower/webp/sunflower-seed.webp", "./assets/clay/sunflower/webp/sunflower-sprout.webp", "./assets/clay/sunflower/webp/sunflower-bud.webp", "./assets/clay/sunflower/webp/sunflower-bloom.webp"];

export const FLOWER_OPTIONS: { id: FlowerKind; name: string; className: string }[] = [
  { id: "sunflower", name: "阳光向日葵", className: "sunflower" },
  { id: "coral", name: "珊瑚小花", className: "coral" },
  { id: "bluebell", name: "蓝铃花", className: "bluebell" },
];

export const FISH_OPTIONS: { id: FishKind; name: string; cost: number; asset: string }[] = [
  { id: "orange", name: "橘子鱼", cost: 12, asset: "./assets/clay/environment/webp/fish-orange.webp" },
  { id: "blue", name: "蓝斑鱼", cost: 16, asset: "./assets/clay/environment/webp/fish-spotted-blue.webp" },
  { id: "silver", name: "银鳞鱼", cost: 14, asset: "./assets/clay/environment/webp/fish-silver.webp" },
  { id: "koi", name: "红白锦鲤", cost: 20, asset: "./assets/clay/environment/webp/koi-red.webp" },
];

export const HOUSE_OPTIONS: { id: HouseDecoration; name: string; cost: number; asset: string }[] = [
  { id: "window", name: "暖黄窗灯", cost: 12, asset: "./assets/clay/environment/webp/cottage.webp" },
  { id: "lamp", name: "花园路灯", cost: 15, asset: "./assets/clay/environment/webp/garden-lamp.webp" },
  { id: "fence", name: "奶油木栅栏", cost: 18, asset: "./assets/clay/environment/webp/picket-fence.webp" },
  { id: "bench", name: "树下长椅", cost: 20, asset: "./assets/clay/environment/webp/garden-bench.webp" },
];

export const SHOP_FEATURED_ITEMS = [
  { id: "shop-pavilion", name: "花园小亭子", category: "建筑", cost: 32, asset: "./assets/clay/shop/透明泥塑素材包/01_房屋与建筑/可爱的小亭子景观.webp" },
  { id: "shop-dream-house", name: "梦幻小屋", category: "建筑", cost: 45, asset: "./assets/clay/shop/透明泥塑素材包/01_房屋与建筑/梦幻小屋与花园.webp" },
  { id: "shop-birdhouse", name: "手工小鸟屋", category: "建筑", cost: 18, asset: "./assets/clay/shop/透明泥塑素材包/01_房屋与建筑/手工粘土小鸟屋.webp" },
  { id: "shop-bench", name: "花园长椅", category: "户外", cost: 18, asset: "./assets/clay/shop/透明泥塑素材包/02_花园设施与户外家具/可爱花园长椅装饰模型.webp" },
  { id: "shop-hammock", name: "温馨吊床", category: "户外", cost: 24, asset: "./assets/clay/shop/透明泥塑素材包/02_花园设施与户外家具/温馨吊床装饰设计.webp" },
  { id: "shop-bridge", name: "花园小木桥", category: "户外", cost: 28, asset: "./assets/clay/shop/透明泥塑素材包/02_花园设施与户外家具/可爱小木桥与花卉.webp" },
  { id: "shop-tulip", name: "陶土郁金香", category: "花草", cost: 12, asset: "./assets/clay/shop/透明泥塑素材包/03_花草植物/可爱陶土郁金香花束.webp" },
  { id: "shop-rose", name: "玫瑰小雕塑", category: "花草", cost: 16, asset: "./assets/clay/shop/透明泥塑素材包/03_花草植物/可爱陶土玫瑰植物雕塑.webp" },
  { id: "shop-sunflower", name: "向日葵小景", category: "花草", cost: 20, asset: "./assets/clay/shop/透明泥塑素材包/03_花草植物/可爱向日葵泥雕小景.webp" },
  { id: "shop-garden-kit", name: "园艺工具包", category: "园艺", cost: 14, asset: "./assets/clay/shop/透明泥塑素材包/04_水果蔬菜与园艺工具/清新园艺工具包.webp" },
  { id: "shop-strawberry", name: "草莓盆栽", category: "园艺", cost: 16, asset: "./assets/clay/shop/透明泥塑素材包/04_水果蔬菜与园艺工具/草莓盆栽的可爱3d插画.webp" },
  { id: "shop-pumpkin", name: "南瓜藤蔓", category: "园艺", cost: 18, asset: "./assets/clay/shop/透明泥塑素材包/04_水果蔬菜与园艺工具/柔软玩具风格的南瓜与藤蔓.webp" },
  { id: "shop-waterfall", name: "小巧瀑布池塘", category: "水景", cost: 24, asset: "./assets/clay/shop/透明泥塑素材包/05_池塘景观与水生伙伴/可爱小巧的瀑布池塘.webp" },
  { id: "shop-koi", name: "彩绘锦鲤", category: "水景", cost: 16, asset: "./assets/clay/shop/透明泥塑素材包/05_池塘景观与水生伙伴/可爱彩绘锦鲤鱼模型.webp" },
  { id: "shop-frog", name: "青蛙与睡莲", category: "水景", cost: 20, asset: "./assets/clay/shop/透明泥塑素材包/05_池塘景观与水生伙伴/可爱的青蛙与睡莲叶.webp" },
  { id: "shop-bookcase", name: "小书架与盆栽", category: "室内", cost: 26, asset: "./assets/clay/shop/透明泥塑素材包/06_室内家具/手工小书架与盆栽植物.webp" },
  { id: "shop-sofa", name: "陶土沙发椅", category: "室内", cost: 30, asset: "./assets/clay/shop/透明泥塑素材包/06_室内家具/温馨陶土沙发椅.webp" },
  { id: "shop-bedside", name: "夜灯床头柜", category: "室内", cost: 22, asset: "./assets/clay/shop/透明泥塑素材包/06_室内家具/陶土风格夜灯与床头柜.webp" },
  { id: "shop-clock", name: "陶瓷小闹钟", category: "装饰", cost: 12, asset: "./assets/clay/shop/透明泥塑素材包/07_温馨装饰/可爱陶瓷风闹钟.webp" },
  { id: "shop-music-box", name: "月亮音乐盒", category: "装饰", cost: 24, asset: "./assets/clay/shop/透明泥塑素材包/07_温馨装饰/月亮音乐盒与星星玩具.webp" },
  { id: "shop-vase", name: "爱心陶瓷花瓶", category: "装饰", cost: 18, asset: "./assets/clay/shop/透明泥塑素材包/07_温馨装饰/粉色爱心花卉陶瓷花瓶.webp" },
  { id: "shop-snail", name: "水晶蜗牛宝宝", category: "稀有", cost: 50, asset: "./assets/clay/shop/透明泥塑素材包/08_稀有收藏/可爱水晶蜗牛宝宝.webp" },
  { id: "shop-treehouse", name: "梦幻树屋", category: "稀有", cost: 70, asset: "./assets/clay/shop/透明泥塑素材包/08_稀有收藏/梦幻树屋场景模型.webp" },
  { id: "shop-balloon", name: "云朵热气球", category: "稀有", cost: 60, asset: "./assets/clay/shop/透明泥塑素材包/08_稀有收藏/可爱云朵热气球装饰.webp" },
  { id: "shop-water-spirit", name: "补水小精灵", category: "生活", cost: 20, asset: "./assets/clay/shop/透明泥塑素材包/09_功能角色与健康/left_card_hydration_clay_asset_transparent.webp" },
];

export const SHOP_EXTRA_ITEMS = [
  { id: "shop-clay-cottage", name: "陶土小屋", category: "建筑", cost: 38, asset: "./assets/clay/shop/透明泥塑素材包/01_房屋与建筑/可爱陶土小屋模型.webp" },
  { id: "shop-handmade-gazebo", name: "手工小亭子", category: "建筑", cost: 28, asset: "./assets/clay/shop/透明泥塑素材包/01_房屋与建筑/手工粘土小亭子模型.webp" },
  { id: "shop-garden-cart", name: "花卉木车", category: "户外", cost: 20, asset: "./assets/clay/shop/透明泥塑素材包/02_花园设施与户外家具/可爱花卉木车.webp" },
  { id: "shop-garden-mailbox", name: "花朵小邮筒", category: "户外", cost: 18, asset: "./assets/clay/shop/透明泥塑素材包/02_花园设施与户外家具/可爱小邮筒与花朵.webp" },
  { id: "shop-garden-lamp", name: "梦幻灯柱", category: "户外", cost: 22, asset: "./assets/clay/shop/透明泥塑素材包/02_花园设施与户外家具/梦幻花园灯柱.webp" },
  { id: "shop-garden-swing", name: "玩具秋千", category: "户外", cost: 26, asset: "./assets/clay/shop/透明泥塑素材包/02_花园设施与户外家具/可爱玩具风格秋千摆设.webp" },
  { id: "shop-garden-fountain", name: "鸟浴喷泉", category: "户外", cost: 30, asset: "./assets/clay/shop/透明泥塑素材包/02_花园设施与户外家具/陶土风鸟bath喷泉.webp" },
  { id: "shop-lily", name: "睡眼铃兰", category: "花草", cost: 14, asset: "./assets/clay/shop/透明泥塑素材包/03_花草植物/睡眼朦胧的铃兰花.webp" },
  { id: "shop-hydrangea", name: "绣球花盆栽", category: "花草", cost: 18, asset: "./assets/clay/shop/透明泥塑素材包/03_花草植物/清新可爱绣球花盆栽.webp" },
  { id: "shop-lavender", name: "陶土薰衣草", category: "花草", cost: 16, asset: "./assets/clay/shop/透明泥塑素材包/03_花草植物/陶土薰衣草花卉摆设.webp" },
  { id: "shop-mushroom", name: "蘑菇小盆栽", category: "花草", cost: 12, asset: "./assets/clay/shop/透明泥塑素材包/03_花草植物/萌趣小蘑菇盆栽.webp" },
  { id: "shop-succulent", name: "多肉小盆栽", category: "花草", cost: 13, asset: "./assets/clay/shop/透明泥塑素材包/03_花草植物/可爱小清新多肉盆栽.webp" },
  { id: "shop-pear-tree", name: "梨树草地", category: "园艺", cost: 24, asset: "./assets/clay/shop/透明泥塑素材包/04_水果蔬菜与园艺工具/卡通风格的梨树与草地.webp" },
  { id: "shop-corn", name: "玉米植株", category: "园艺", cost: 12, asset: "./assets/clay/shop/透明泥塑素材包/04_水果蔬菜与园艺工具/可爱卡通玉米植株.webp" },
  { id: "shop-eggplant", name: "紫茄盆栽", category: "园艺", cost: 13, asset: "./assets/clay/shop/透明泥塑素材包/04_水果蔬菜与园艺工具/可爱紫茄植物插图.webp" },
  { id: "shop-watering-can", name: "软陶浇水壶", category: "园艺", cost: 15, asset: "./assets/clay/shop/透明泥塑素材包/04_水果蔬菜与园艺工具/可爱软陶浇水壶.webp" },
  { id: "shop-fruit-basket", name: "编织果篮", category: "园艺", cost: 18, asset: "./assets/clay/shop/透明泥塑素材包/04_水果蔬菜与园艺工具/手工编织果篮与水果.webp" },
  { id: "shop-water-grass", name: "迷你水草", category: "水景", cost: 12, asset: "./assets/clay/shop/透明泥塑素材包/05_池塘景观与水生伙伴/迷你水草装饰盆景.webp" },
  { id: "shop-lotus-pond", name: "莲花小池塘", category: "水景", cost: 28, asset: "./assets/clay/shop/透明泥塑素材包/05_池塘景观与水生伙伴/可爱池塘与莲花.webp" },
  { id: "shop-tadpole", name: "小蝌蚪玩偶", category: "水景", cost: 13, asset: "./assets/clay/shop/透明泥塑素材包/05_池塘景观与水生伙伴/可爱的小蝌蚪玩偶.webp" },
  { id: "shop-duck-family", name: "小鸭家庭", category: "水景", cost: 20, asset: "./assets/clay/shop/透明泥塑素材包/05_池塘景观与水生伙伴/可爱的小鸭家庭团聚.webp" },
  { id: "shop-lotus-leaf", name: "粉色莲花荷叶", category: "水景", cost: 15, asset: "./assets/clay/shop/透明泥塑素材包/05_池塘景观与水生伙伴/粉色莲花与绿荷叶组合.webp" },
  { id: "shop-table-lamp", name: "陶瓷台灯", category: "室内", cost: 18, asset: "./assets/clay/shop/透明泥塑素材包/06_室内家具/温暖的陶瓷台灯.webp" },
  { id: "shop-clock-cabinet", name: "小木钟柜", category: "室内", cost: 25, asset: "./assets/clay/shop/透明泥塑素材包/06_室内家具/可爱的小木钟柜.webp" },
  { id: "shop-round-bookcase", name: "圆形书架", category: "室内", cost: 26, asset: "./assets/clay/shop/透明泥塑素材包/06_室内家具/可爱圆形书架模型.webp" },
  { id: "shop-toy-bed", name: "粉色玩偶床", category: "室内", cost: 32, asset: "./assets/clay/shop/透明泥塑素材包/06_室内家具/温馨粉色玩偶床.webp" },
  { id: "shop-rocking-chair", name: "粉色摇椅", category: "室内", cost: 28, asset: "./assets/clay/shop/透明泥塑素材包/06_室内家具/可爱粉色摇椅设计.webp" },
  { id: "shop-desk-items", name: "桌面小物", category: "装饰", cost: 12, asset: "./assets/clay/shop/透明泥塑素材包/07_温馨装饰/温馨的桌面小物件.webp" },
  { id: "shop-plaque", name: "木质牌匾", category: "装饰", cost: 14, asset: "./assets/clay/shop/透明泥塑素材包/07_温馨装饰/可爱手工风格木质牌匾.webp" },
  { id: "shop-snow-globe", name: "雪景雪花球", category: "装饰", cost: 22, asset: "./assets/clay/shop/透明泥塑素材包/07_温馨装饰/雪景小屋雪花球.webp" },
  { id: "shop-heart-pillow", name: "爱心抱枕", category: "装饰", cost: 10, asset: "./assets/clay/shop/透明泥塑素材包/07_温馨装饰/柔软爱心枕头装饰图案.webp" },
  { id: "shop-star-lamp", name: "星星夜灯", category: "装饰", cost: 16, asset: "./assets/clay/shop/透明泥塑素材包/07_温馨装饰/可爱星星夜灯.webp" },
  { id: "shop-wind-chime", name: "星辰风铃", category: "稀有", cost: 46, asset: "./assets/clay/shop/透明泥塑素材包/08_稀有收藏/梦幻星辰风铃挂饰.webp" },
  { id: "shop-mushroom-house", name: "梦幻蘑菇屋", category: "稀有", cost: 62, asset: "./assets/clay/shop/透明泥塑素材包/08_稀有收藏/梦幻蘑菇小屋.webp" },
  { id: "shop-telescope", name: "星空望远镜", category: "稀有", cost: 54, asset: "./assets/clay/shop/透明泥塑素材包/08_稀有收藏/可爱星空望远镜玩具.webp" },
  { id: "shop-star-fish", name: "星形小鱼", category: "稀有", cost: 44, asset: "./assets/clay/shop/透明泥塑素材包/08_稀有收藏/可爱星形小鱼.webp" },
  { id: "shop-moon-swing", name: "月亮秋千", category: "稀有", cost: 58, asset: "./assets/clay/shop/透明泥塑素材包/08_稀有收藏/温柔的月亮秋千装饰.webp" },
  { id: "shop-water-companion", name: "水滴陪伴", category: "生活", cost: 18, asset: "./assets/clay/shop/透明泥塑素材包/09_功能角色与健康/a_clay_style_digital_illustration_features_a_water.webp" },
  { id: "shop-wellness-friend", name: "健康小伙伴", category: "生活", cost: 24, asset: "./assets/clay/shop/透明泥塑素材包/09_功能角色与健康/a_3d_rendered_digital_illustration_features_a_clay.webp" },
];

export const SHOP_ITEMS = [...SHOP_FEATURED_ITEMS, ...SHOP_EXTRA_ITEMS].map((item) => ({
  ...item,
  cost: item.cost * (item.category === "稀有" ? 4 : 2),
}));

export const SHOP_CATEGORIES = ["全部", ...Array.from(new Set(SHOP_ITEMS.map((item) => item.category)))];

export const statusOptions: Record<PersonId, string[]> = {
  brother: ["正在学数学", "正在写作业", "休息一下", "出去玩耍", "准备睡觉"],
  sister: ["实习中", "下班啦", "做饭中", "写论文", "自主学习", "准备睡觉"],
  mom: ["工作中", "下班啦", "正在回家", "外出办事", "到家啦", "准备睡觉"],
};

export const brotherQuickStatuses = ["学习中", "上课中", "写作业", "阅读", "运动", "玩耍中", "休息中", "吃饭", "外出", "准备睡觉"];

export type TaskDraft = { title: string; subject: string; kind: TaskKind; owner: PersonId };
export type TaskPatch = Partial<Omit<import("./data").Task, "id">>;
export type SharedPostOptions = { kind?: "note" | "meal" | "photo" | "status" | "task"; image?: string };
