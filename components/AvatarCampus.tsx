"use client";

import { useEffect, useState, type CSSProperties, type KeyboardEvent } from "react";
import { ecosystemApps } from "@/data/apps";
import styles from "./AvatarCampus.module.css";

type AvatarOptions = {
  presentation: "Nữ" | "Nam" | "Trung tính";
  hair: "Tóc dài" | "Tóc ngắn" | "Tóc ngang vai";
  hairColor: "Đen" | "Nâu" | "Hạt dẻ";
  skin: "Sáng" | "Trung bình" | "Nâu ấm";
  outfit: "Áo blouse" | "Áo dài" | "Áo CLB";
};

type Point = { x: number; y: number };

const STORAGE_KEY = "hiutmc-avatar-preview-v1";
const initialOptions: AvatarOptions = {
  presentation: "Trung tính",
  hair: "Tóc ngang vai",
  hairColor: "Đen",
  skin: "Trung bình",
  outfit: "Áo CLB",
};

const isAvatarOptions = (value: unknown): value is Partial<AvatarOptions> => {
  if (!value || typeof value !== "object") return false;
  const options = value as Record<string, unknown>;
  return ["presentation", "hair", "hairColor", "skin", "outfit"].every((key) => options[key] === undefined || typeof options[key] === "string");
};

const destinations = [
  { id: "study-os", label: "Study OS", place: "Thư viện", x: 23, y: 34, icon: "▤" },
  { id: "atlas", label: "Atlas 3D", place: "Vườn kinh lạc", x: 76, y: 33, icon: "◇" },
  { id: "ai-thiet-chan", label: "AI Lab", place: "Phòng thực hành", x: 24, y: 56, icon: "✳" },
  { id: "trung-y-van", label: "Trung Y Văn", place: "Nhà học thuật", x: 76, y: 56, icon: "⌕" },
].map((item) => ({ ...item, app: ecosystemApps.find((app) => app.slug === item.id)! }));

const skinColors: Record<AvatarOptions["skin"], string> = {
  "Sáng": "#f6d2b7",
  "Trung bình": "#d9a27f",
  "Nâu ấm": "#a9684e",
};

const hairColors: Record<AvatarOptions["hairColor"], string> = {
  "Đen": "#252432",
  "Nâu": "#59382f",
  "Hạt dẻ": "#925538",
};

function Character({ options, walking }: { options: AvatarOptions; walking: boolean }) {
  const skin = skinColors[options.skin];
  const hair = hairColors[options.hairColor];
  const bodyWidth = options.presentation === "Nam" ? 37 : options.presentation === "Nữ" ? 32 : 34;
  const hairShape = options.hair === "Tóc dài"
    ? "M22 37 Q17 13 50 12 Q83 13 78 39 L76 90 Q66 100 62 75 L38 75 Q34 100 24 90 Z"
    : options.hair === "Tóc ngắn"
      ? "M22 40 Q17 12 50 12 Q82 13 78 40 L72 54 Q65 43 63 34 Q48 45 29 35 L26 55 Z"
      : "M21 40 Q18 12 50 12 Q82 13 79 40 L73 72 Q65 79 63 55 Q45 46 29 54 L27 74 Q21 71 21 40 Z";

  return (
    <svg className={`${styles.avatarFigure} ${walking ? styles.isWalking : ""}`} viewBox="0 0 100 154" role="img" aria-label={`Nhân vật YHCT, kiểu ${options.presentation}, ${options.hair.toLowerCase()}, ${options.outfit.toLowerCase()}`}>
      <ellipse cx="50" cy="148" rx="28" ry="5" fill="#243747" opacity=".17" />
      <g className="avatarLegs" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d="M42 105 Q40 124 37 142" stroke="#26314a" strokeWidth="10" />
        <path d="M58 105 Q60 124 63 142" stroke="#26314a" strokeWidth="10" />
        <path d="M35 143h12M58 143h12" stroke="#f7f4ef" strokeWidth="7" />
      </g>
      <path d={`M${50 - bodyWidth / 2} 64 Q50 56 ${50 + bodyWidth / 2} 64 L68 108 Q50 119 32 108 Z`} fill={options.outfit === "Áo blouse" ? "#f8fbff" : options.outfit === "Áo dài" ? "#9b2440" : "#365d86"} stroke="#ffffff" strokeOpacity=".62" strokeWidth="2" />
      {options.outfit === "Áo blouse" && <path d="M44 63l6 8 6-8 6 42H38z" fill="#e5eef4" />}
      {options.outfit === "Áo dài" && <path d="M49 70h2l4 38h-10z" fill="#f2cf8e" />}
      {options.outfit === "Áo CLB" && <><path d="M45 68h10v9H45z" fill="#f6e8e7" /><text x="50" y="75" textAnchor="middle" fontSize="5" fontWeight="800" fill="#8c1832">HIU</text></>}
      <path d="M35 69 25 91M65 69l10 22" stroke={skin} strokeWidth="8" strokeLinecap="round" />
      <path d="M25 91l-2 7M75 91l2 7" stroke={skin} strokeWidth="6" strokeLinecap="round" />
      <path d="M43 57v10Q50 74 57 67V57" fill={skin} />
      <ellipse cx="50" cy="39" rx="22" ry="26" fill={skin} />
      <path d={hairShape} fill={hair} />
      <path d="M30 45q3-3 7 0M63 45q3-3 7 0" stroke="#422e31" strokeWidth="2" strokeLinecap="round" />
      <ellipse cx="39" cy="49" rx="2.2" ry="3" fill="#263044" />
      <ellipse cx="61" cy="49" rx="2.2" ry="3" fill="#263044" />
      <path d="M46 59q4 3 8 0" fill="none" stroke="#9a4c50" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M49 50q-2 5 1 6" fill="none" stroke="#a96f5c" strokeWidth="1.2" strokeLinecap="round" />
      <circle cx="28" cy="53" r="3" fill={skin} /><circle cx="72" cy="53" r="3" fill={skin} />
      <path d="M45 108v19M55 108v19" stroke="#ffffff" strokeOpacity=".7" strokeWidth="1.5" />
    </svg>
  );
}

export default function AvatarCampus() {
  const [options, setOptions] = useState(initialOptions);
  const [position, setPosition] = useState<Point>({ x: 50, y: 69 });
  const [walking, setWalking] = useState(false);
  const [activeId, setActiveId] = useState(destinations[0].id);
  const [ready, setReady] = useState(false);
  const active = destinations.find((destination) => destination.id === activeId)!;

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed: unknown = JSON.parse(saved);
        if (isAvatarOptions(parsed)) {
          const candidate = { ...initialOptions, ...parsed };
          setOptions({
            presentation: ["Nữ", "Nam", "Trung tính"].includes(candidate.presentation) ? candidate.presentation : initialOptions.presentation,
            hair: ["Tóc dài", "Tóc ngắn", "Tóc ngang vai"].includes(candidate.hair) ? candidate.hair : initialOptions.hair,
            hairColor: ["Đen", "Nâu", "Hạt dẻ"].includes(candidate.hairColor) ? candidate.hairColor : initialOptions.hairColor,
            skin: ["Sáng", "Trung bình", "Nâu ấm"].includes(candidate.skin) ? candidate.skin : initialOptions.skin,
            outfit: ["Áo blouse", "Áo dài", "Áo CLB"].includes(candidate.outfit) ? candidate.outfit : initialOptions.outfit,
          });
        }
      }
    } catch {
      // Keep the default character when browser storage is unavailable.
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(options));
    } catch {
      // Customization still works for this visit if browser storage is disabled.
    }
  }, [options, ready]);

  const moveTo = (point: Point, destinationId?: string) => {
    setPosition(point);
    setWalking(true);
    if (destinationId) setActiveId(destinationId);
    window.setTimeout(() => setWalking(false), 520);
  };

  const handleMovement = (event: KeyboardEvent<HTMLDivElement>) => {
    const directions: Record<string, Point> = {
      ArrowUp: { x: 0, y: -7 }, ArrowDown: { x: 0, y: 7 },
      ArrowLeft: { x: -7, y: 0 }, ArrowRight: { x: 7, y: 0 },
    };
    const direction = directions[event.key];
    if (!direction) return;
    event.preventDefault();
    moveTo({ x: Math.max(9, Math.min(91, position.x + direction.x)), y: Math.max(27, Math.min(78, position.y + direction.y)) });
  };

  const update = <K extends keyof AvatarOptions>(key: K, value: AvatarOptions[K]) => setOptions((current) => ({ ...current, [key]: value }));

  return (
    <section className={styles.avatarStudio} aria-labelledby="avatar-studio-title">
      <div className={styles.avatarStudioHead}>
        <div><span className={styles.avatarKicker}>GÓC NHÂN VẬT 2D</span><h2 id="avatar-studio-title">Bước vào thế giới YHCT</h2></div>
        <span className={styles.avatarPreviewBadge}>Bản thử</span>
      </div>
      <div className={styles.avatarCampus} tabIndex={0} onKeyDown={handleMovement} aria-label="Sân học thuật. Dùng các nút mũi tên để di chuyển nhân vật.">
        <div className={styles.campusSky} />
        <div className={`${styles.campusHill} ${styles.campusHillBack}`} />
        <div className={`${styles.campusHill} ${styles.campusHillFront}`} />
        <div className={styles.campusPath} />
        {destinations.map((destination, index) => (
          <button className={`${styles.campusPlace} ${styles[`campusPlace${index + 1}`]}`} type="button" key={destination.id} onClick={() => moveTo({ x: destination.x, y: destination.y + 9 }, destination.id)} aria-label={`Đi tới ${destination.place}`}>
            <span>{destination.icon}</span><small>{destination.place}</small>
          </button>
        ))}
        <div className={`${styles.campusTree} ${styles.campusTreeOne}`} aria-hidden="true">✦</div><div className={`${styles.campusTree} ${styles.campusTreeTwo}`} aria-hidden="true">✦</div>
        <div className={`${styles.campusAvatar} ${walking ? styles.campusAvatarWalking : ""}`} style={{ left: `${position.x}%`, top: `${position.y}%` } as CSSProperties}>
          <Character options={options} walking={walking} />
          <span className={styles.avatarNameplate}>Bạn</span>
        </div>
        <div className={styles.avatarMovePad} aria-label="Điều khiển di chuyển">
          <button type="button" aria-label="Đi lên" onClick={() => moveTo({ x: position.x, y: Math.max(27, position.y - 7) })}>↑</button>
          <button type="button" aria-label="Đi sang trái" onClick={() => moveTo({ x: Math.max(9, position.x - 7), y: position.y })}>←</button>
          <button type="button" aria-label="Đi xuống" onClick={() => moveTo({ x: position.x, y: Math.min(78, position.y + 7) })}>↓</button>
          <button type="button" aria-label="Đi sang phải" onClick={() => moveTo({ x: Math.min(91, position.x + 7), y: position.y })}>→</button>
        </div>
      </div>
      <div className={styles.avatarDestinationBar}>
        <span>Đang ở gần: <strong>{active.place}</strong></span>
        <a href={active.app.currentUpstreamUrl}>Mở {active.label} <b aria-hidden="true">↗</b></a>
      </div>
      <div className={styles.avatarOptions} aria-label="Tùy chỉnh nhân vật">
        <label>Giới tính nhân vật<select value={options.presentation} onChange={(event) => update("presentation", event.target.value as AvatarOptions["presentation"])}><option>Nữ</option><option>Nam</option><option>Trung tính</option></select></label>
        <label>Kiểu tóc<select value={options.hair} onChange={(event) => update("hair", event.target.value as AvatarOptions["hair"])}><option>Tóc dài</option><option>Tóc ngắn</option><option>Tóc ngang vai</option></select></label>
        <label>Màu tóc<select value={options.hairColor} onChange={(event) => update("hairColor", event.target.value as AvatarOptions["hairColor"])}><option>Đen</option><option>Nâu</option><option>Hạt dẻ</option></select></label>
        <label>Màu da<select value={options.skin} onChange={(event) => update("skin", event.target.value as AvatarOptions["skin"])}><option>Sáng</option><option>Trung bình</option><option>Nâu ấm</option></select></label>
        <label className={styles.avatarOptionWide}>Trang phục<select value={options.outfit} onChange={(event) => update("outfit", event.target.value as AvatarOptions["outfit"])}><option>Áo CLB</option><option>Áo blouse</option><option>Áo dài</option></select></label>
      </div>
      <p className={styles.avatarStorageNote}>Tùy chọn hiện lưu trên trình duyệt này. Đồng bộ theo tài khoản thành viên sẽ cần hoàn thiện SSO và backend.</p>
    </section>
  );
}
