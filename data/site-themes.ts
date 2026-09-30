// Site-wide themes chosen by an Admin in Admin Center -> "Giao diện".
// The default design has no variables at all: every stylesheet reads `var(--st-*, <original colour>)`,
// so with no theme (or an unknown id, or a failed request) the site is pixel-identical to the approved design.

export type ThemeGroup = "default" | "season" | "festival" | "auto";
export type ThemeMotion = "fall" | "rise" | "float";

export type ThemeVars = {
  wine: string;      // main accent (buttons, links, badges)
  wine2: string;     // deep accent
  wineHi: string;    // bright end of accent gradients
  navy: string;      // sidebar / headings
  navy2: string;
  navyDeep: string;
  paper: string;     // page surface
  cream: string;
  bg1: string;       // page background gradient stops
  bg2: string;
  bg3: string;
  body: string;      // outer body background
};

export type SiteTheme = {
  id: string;
  name: string;
  group: ThemeGroup;
  description: string;
  icon: string;
  vars: ThemeVars | null;
  decor: { glyphs: string[]; motion: ThemeMotion; count: number } | null;
};

export const DEFAULT_THEME_ID = "default";
export const AUTO_THEME_ID = "auto";

export const siteThemes: SiteTheme[] = [
  {
    id: "default", name: "Mặc định HIU TMC", group: "default", icon: "◈",
    description: "Giao diện đã duyệt, rượu vang và xanh navy. Không thêm hiệu ứng.",
    vars: null, decor: null,
  },
  {
    id: "auto", name: "Tự động theo mùa và lễ", group: "auto", icon: "◐",
    description: "Tự đổi theo ngày: lễ hội gần nhất, nếu không có thì theo mùa (giờ Việt Nam).",
    vars: null, decor: null,
  },
  {
    id: "xuan", name: "Xuân · Hoa anh đào", group: "season", icon: "🌸",
    description: "Hồng đào tươi và xanh non, cánh hoa rơi nhẹ.",
    vars: { wine: "#b0306a", wine2: "#7d1d4a", wineHi: "#c9457f", navy: "#1f4d3a", navy2: "#2b6a4f", navyDeep: "#163a2b", paper: "#f8f6ee", cream: "#f1ead6", bg1: "#fffef8", bg2: "#f7f5ea", bg3: "#eaf0dc", body: "#f1f0e2" },
    decor: { glyphs: ["🌸", "🌸", "🌿"], motion: "fall", count: 14 },
  },
  {
    id: "ha", name: "Hạ · Biển nắng", group: "season", icon: "☀️",
    description: "Cam nắng và xanh đại dương, cảm giác mát và sáng.",
    vars: { wine: "#c2410c", wine2: "#8a2c0a", wineHi: "#ea580c", navy: "#0c4a6e", navy2: "#0e6a94", navyDeep: "#082f49", paper: "#f4f8fa", cream: "#e6f0f4", bg1: "#fdfeff", bg2: "#f1f7fa", bg3: "#e0eef5", body: "#eaf3f7" },
    decor: { glyphs: ["☀️", "🪷", "🌊"], motion: "float", count: 9 },
  },
  {
    id: "thu", name: "Thu · Lá vàng", group: "season", icon: "🍂",
    description: "Nâu hổ phách và vàng đất, lá thu bay.",
    vars: { wine: "#b45309", wine2: "#78350f", wineHi: "#d97706", navy: "#4a2c17", navy2: "#6b4423", navyDeep: "#35200f", paper: "#faf3e3", cream: "#f2e3c2", bg1: "#fffaf0", bg2: "#faf1dc", bg3: "#f0e0bd", body: "#f3e8cc" },
    decor: { glyphs: ["🍂", "🍁", "🍂"], motion: "fall", count: 14 },
  },
  {
    id: "dong", name: "Đông · Băng tuyết", group: "season", icon: "❄️",
    description: "Xanh lam lạnh và xám đá, tuyết rơi.",
    vars: { wine: "#1d4ed8", wine2: "#1e3a8a", wineHi: "#3b82f6", navy: "#1e293b", navy2: "#334155", navyDeep: "#0f172a", paper: "#f3f6fa", cream: "#e2e8f0", bg1: "#ffffff", bg2: "#f1f5f9", bg3: "#e2e8f0", body: "#e9eef5" },
    decor: { glyphs: ["❄️", "❄️", "✦"], motion: "fall", count: 16 },
  },
  {
    id: "tet", name: "Tết Nguyên Đán", group: "festival", icon: "🧧",
    description: "Đỏ son và vàng kim, hoa đào và bao lì xì.",
    vars: { wine: "#b91c1c", wine2: "#7f1d1d", wineHi: "#dc2626", navy: "#6b1d1d", navy2: "#8b2a2a", navyDeep: "#4a1212", paper: "#fff7e6", cream: "#fbe8bf", bg1: "#fffbea", bg2: "#fff3d1", bg3: "#fbe3a6", body: "#fbeecb" },
    decor: { glyphs: ["🌸", "🧧", "🏮", "🌼"], motion: "fall", count: 14 },
  },
  {
    id: "trung-thu", name: "Tết Trung thu", group: "festival", icon: "🏮",
    description: "Đêm trăng rằm: chàm sâu, vàng đèn lồng.",
    vars: { wine: "#a16207", wine2: "#713f12", wineHi: "#ca8a04", navy: "#1e1b4b", navy2: "#312e81", navyDeep: "#14123a", paper: "#fefce8", cream: "#fef3c7", bg1: "#fffef5", bg2: "#fefce8", bg3: "#fdf3c4", body: "#fbf3cf" },
    decor: { glyphs: ["🏮", "🌕", "⭐"], motion: "float", count: 10 },
  },
  {
    id: "quoc-khanh", name: "Quốc khánh 2/9", group: "festival", icon: "⭐",
    description: "Đỏ cờ và vàng sao, trang trọng.",
    vars: { wine: "#c8102e", wine2: "#8a0b20", wineHi: "#e11d48", navy: "#7a0f1f", navy2: "#9b1b30", navyDeep: "#570a15", paper: "#fffbe8", cream: "#fdf0b8", bg1: "#fffdef", bg2: "#fff8d6", bg3: "#fdeb9c", body: "#fbf0bb" },
    decor: { glyphs: ["⭐", "✨"], motion: "rise", count: 12 },
  },
  {
    id: "nha-giao", name: "Ngày Nhà giáo 20/11", group: "festival", icon: "🌻",
    description: "Xanh ngọc và hồng hoa, tri ân thầy cô.",
    vars: { wine: "#be123c", wine2: "#881337", wineHi: "#e11d48", navy: "#134e4a", navy2: "#0f766e", navyDeep: "#0b3b38", paper: "#f6faf7", cream: "#e3efe8", bg1: "#fdfffd", bg2: "#f1f8f4", bg3: "#dcece3", body: "#e9f2ed" },
    decor: { glyphs: ["🌻", "🌷", "📖"], motion: "float", count: 10 },
  },
  {
    id: "phu-nu", name: "Ngày Phụ nữ 8/3 · 20/10", group: "festival", icon: "🌷",
    description: "Hồng tím dịu và hoa tươi.",
    vars: { wine: "#be185d", wine2: "#831843", wineHi: "#db2777", navy: "#4a1d3f", navy2: "#6b2b5a", navyDeep: "#33142c", paper: "#fdf5f8", cream: "#f8e4ee", bg1: "#fffafd", bg2: "#fdf2f7", bg3: "#f8dcea", body: "#f8e8f0" },
    decor: { glyphs: ["🌷", "🌹", "💐"], motion: "rise", count: 10 },
  },
  {
    id: "giang-sinh", name: "Giáng sinh", group: "festival", icon: "🎄",
    description: "Đỏ và xanh thông, tuyết rơi.",
    vars: { wine: "#b91c1c", wine2: "#7f1d1d", wineHi: "#dc2626", navy: "#14532d", navy2: "#166534", navyDeep: "#0d3b1f", paper: "#f8fbf7", cream: "#e6efe4", bg1: "#ffffff", bg2: "#f4f9f3", bg3: "#e1eddd", body: "#ecf3e9" },
    decor: { glyphs: ["❄️", "🎄", "❄️", "⭐"], motion: "fall", count: 15 },
  },
];

const byId = new Map(siteThemes.map((theme) => [theme.id, theme]));
const ID_PATTERN = /^[a-z0-9-]{1,32}$/;

export function isKnownThemeId(id: unknown): id is string {
  return typeof id === "string" && ID_PATTERN.test(id) && byId.has(id);
}

export function getSiteTheme(id: unknown): SiteTheme {
  return (isKnownThemeId(id) ? byId.get(id) : undefined) ?? siteThemes[0];
}

const VAR_NAMES: Array<[keyof ThemeVars, string]> = [
  ["wine", "--st-wine"], ["wine2", "--st-wine2"], ["wineHi", "--st-wine-hi"],
  ["navy", "--st-navy"], ["navy2", "--st-navy2"], ["navyDeep", "--st-navy-deep"],
  ["paper", "--st-paper"], ["cream", "--st-cream"],
  ["bg1", "--st-bg1"], ["bg2", "--st-bg2"], ["bg3", "--st-bg3"], ["body", "--st-body"],
];
export const THEME_CSS_VARIABLES = VAR_NAMES.map(([, name]) => name);

/** CSS custom properties for a theme. Empty for the default design and for `auto` (resolve it first). */
export function themeCssVariables(theme: SiteTheme): Record<string, string> {
  if (!theme.vars) return {};
  return Object.fromEntries(VAR_NAMES.map(([key, name]) => [name, theme.vars![key]]));
}

/** Lunar month/day in Vietnam time via the browser's Chinese calendar; null if unavailable. */
export function lunarMonthDay(date: Date): { month: number; day: number } | null {
  try {
    const parts = new Intl.DateTimeFormat("en-u-ca-chinese-nu-latn", { timeZone: "Asia/Ho_Chi_Minh", month: "numeric", day: "numeric" }).formatToParts(date);
    const month = parseInt(parts.find((part) => part.type === "month")?.value ?? "", 10);
    const day = parseInt(parts.find((part) => part.type === "day")?.value ?? "", 10);
    return Number.isFinite(month) && Number.isFinite(day) ? { month, day } : null;
  } catch {
    return null;
  }
}

function vietnamCalendarDate(date: Date): { month: number; day: number } {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Ho_Chi_Minh", month: "numeric", day: "numeric" }).formatToParts(date);
  return {
    month: Number(parts.find((part) => part.type === "month")?.value),
    day: Number(parts.find((part) => part.type === "day")?.value),
  };
}

/** Which theme "Tự động" shows on a given day: a nearby festival wins, otherwise the season. */
export function resolveThemeForDate(date: Date): string {
  const { month, day } = vietnamCalendarDate(date);
  const md = month * 100 + day;
  const lunar = lunarMonthDay(date);
  if (lunar) {
    if ((lunar.month === 12 && lunar.day >= 20) || (lunar.month === 1 && lunar.day <= 10)) return "tet";
    if (lunar.month === 8 && lunar.day <= 16) return "trung-thu";
  }
  if (md >= 828 && md <= 903) return "quoc-khanh";
  if (md >= 1113 && md <= 1121) return "nha-giao";
  if ((md >= 304 && md <= 309) || (md >= 1015 && md <= 1021)) return "phu-nu";
  if (md >= 1215 && md <= 1227) return "giang-sinh";
  if (month >= 2 && month <= 4) return "xuan";
  if (month >= 5 && month <= 7) return "ha";
  if (month >= 8 && month <= 10) return "thu";
  return "dong";
}

/** The concrete theme to paint for a stored id (resolves `auto`). */
export function effectiveTheme(id: unknown, now: Date = new Date()): SiteTheme {
  const theme = getSiteTheme(id);
  return theme.id === AUTO_THEME_ID ? getSiteTheme(resolveThemeForDate(now)) : theme;
}
