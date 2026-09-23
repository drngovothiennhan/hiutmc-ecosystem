"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import { ecosystemApps } from "@/data/apps";
import styles from "./AvatarCampus.module.css";

type AvatarOptions = {
  presentation: "Nữ" | "Nam";
  hair: "Tóc búi dài" | "Tóc dài" | "Tóc ngắn" | "Tóc layer";
  hairColor: "Đen" | "Nâu" | "Hạt dẻ";
  skin: "Sáng" | "Trung bình" | "Nâu ấm";
  outfit: "Blouse YHCT" | "Đồng phục CLB" | "Áo dài YHCT";
  accessory: "Không" | "Thẻ sinh viên" | "Túi thảo dược" | "Balo";
  expression: "Tươi" | "Cười" | "Điềm tĩnh";
};

type Point = { x: number; y: number };
type Facing = "left" | "right";

const STORAGE_KEY = "hiutmc-avatar-preview-v2";
const initialOptions: AvatarOptions = {
  presentation: "Nữ",
  hair: "Tóc búi dài",
  hairColor: "Đen",
  skin: "Sáng",
  outfit: "Blouse YHCT",
  accessory: "Thẻ sinh viên",
  expression: "Tươi",
};

const destinations = [
  { id: "study-os", label: "Study OS", place: "Thư viện", x: 24, y: 34, icon: "▤" },
  { id: "atlas", label: "Atlas 3D", place: "Vườn kinh lạc", x: 76, y: 33, icon: "◇" },
  { id: "ai-thiet-chan", label: "AI Lab", place: "Phòng thực hành", x: 25, y: 57, icon: "✳" },
  { id: "trung-y-van", label: "Trung Y Văn", place: "Nhà học thuật", x: 75, y: 57, icon: "⌕" },
].map((item) => ({ ...item, app: ecosystemApps.find((app) => app.slug === item.id)! }));

const skinColors: Record<AvatarOptions["skin"], string> = {
  "Sáng": "#f4c9ad",
  "Trung bình": "#dca37d",
  "Nâu ấm": "#ad7052",
};

const hairColors: Record<AvatarOptions["hairColor"], string> = {
  "Đen": "#2c2528",
  "Nâu": "#594039",
  "Hạt dẻ": "#83503d",
};

function Character({ options, walking, facing }: { options: AvatarOptions; walking: boolean; facing: Facing }) {
  const skin = skinColors[options.skin];
  const hair = hairColors[options.hairColor];
  const female = options.presentation === "Nữ";
  const bodyWidth = female ? 34 : 39;

  const hairBack = options.hair === "Tóc búi dài"
    ? <><ellipse cx="50" cy="18" rx="13" ry="10" fill={hair}/><path d="M24 34Q21 13 50 12Q79 13 77 39L73 97Q65 107 60 76L40 76Q35 107 27 97Z" fill={hair}/></>
    : options.hair === "Tóc dài"
      ? <path d="M23 38Q20 13 50 12Q80 13 78 40L73 95Q63 104 61 72L39 72Q37 104 27 95Z" fill={hair}/>
      : options.hair === "Tóc layer"
        ? <path d="M22 39Q18 12 50 12Q82 13 79 39L72 67Q66 59 62 47Q46 53 29 44L26 68Q21 61 22 39Z" fill={hair}/>
        : <path d="M23 39Q19 12 50 12Q81 13 78 40L70 56Q64 46 62 36Q47 45 29 36L26 57Z" fill={hair}/>;

  const mouth = options.expression === "Cười"
    ? <><path d="M42 58q8 8 16 0" fill="#fff" stroke="#9c4f58" strokeWidth="1.6" strokeLinecap="round"/><path d="M45 60h10" stroke="#e7a6aa" strokeWidth="1"/></>
    : options.expression === "Điềm tĩnh"
      ? <path d="M45 59q5 1 10 0" fill="none" stroke="#98505a" strokeWidth="1.6" strokeLinecap="round"/>
      : <path d="M44 58q6 5 12 0" fill="none" stroke="#9c4f58" strokeWidth="1.7" strokeLinecap="round"/>;

  const outfitFill = options.outfit === "Blouse YHCT" ? "#fafcff" : options.outfit === "Áo dài YHCT" ? "#5b745a" : "#8d1f36";
  const innerFill = options.outfit === "Blouse YHCT" ? "#647960" : "#f4e3cc";

  return (
    <svg className={`${styles.avatarFigure} ${walking ? styles.isWalking : ""} ${facing === "left" ? styles.faceLeft : ""}`} viewBox="0 0 100 164" role="img" aria-label={`Nhân vật ${options.presentation}, ${options.hair.toLowerCase()}, ${options.outfit.toLowerCase()}`}>
      <ellipse cx="50" cy="157" rx="30" ry="5" fill="#203747" opacity=".16"/>
      <g className={styles.legGroup} fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d="M41 112Q40 130 37 150" stroke="#30333b" strokeWidth="11"/>
        <path d="M59 112Q60 130 63 150" stroke="#30333b" strokeWidth="11"/>
        <path d="M34 151h15M56 151h15" stroke="#fbfbf8" strokeWidth="8"/>
        <path d="M34 153h15M56 153h15" stroke="#59725e" strokeWidth="2"/>
      </g>
      {hairBack}
      <path d={`M${50-bodyWidth/2} 67Q50 58 ${50+bodyWidth/2} 67L69 114Q50 122 31 114Z`} fill={outfitFill} stroke="#fff" strokeOpacity=".75" strokeWidth="2"/>
      <path d="M44 66l6 8 6-8 6 43H38z" fill={innerFill}/>
      {options.outfit === "Blouse YHCT" && <>
        <path d="M34 70l10-5 6 10 6-10 10 5-4 45H38z" fill="#fbfdff" opacity=".92"/>
        <path d="M44 67l6 10 6-10" fill="none" stroke="#dce5e9" strokeWidth="1.4"/>
        <rect x="55" y="78" width="11" height="9" rx="1.6" fill="#fff" stroke="#d9dfe4"/>
        <text x="60.5" y="83" textAnchor="middle" fontSize="4.2" fontWeight="900" fill="#9b1832">HIU</text>
      </>}
      {options.outfit === "Áo dài YHCT" && <><path d="M49 72h2l5 43H44z" fill="#d5bd83"/><path d="M45 71h10" stroke="#e5d6b9" strokeWidth="2"/></>}
      {options.outfit === "Đồng phục CLB" && <><path d="M45 72h10v10H45z" fill="#f8e8e7"/><text x="50" y="79" textAnchor="middle" fontSize="5" fontWeight="900" fill="#8c1832">HIU</text></>}
      <path d="M34 72 24 96M66 72l10 24" stroke={skin} strokeWidth="8" strokeLinecap="round"/>
      <path d="M24 96l-2 8M76 96l2 8" stroke={skin} strokeWidth="6" strokeLinecap="round"/>
      <path d="M42 58v11Q50 77 58 69V58" fill={skin}/>
      <ellipse cx="50" cy="41" rx="22" ry="27" fill={skin}/>
      <path d="M30 34Q45 12 71 28Q61 27 56 21Q45 33 30 34Z" fill={hair}/>
      {female && options.hair === "Tóc búi dài" && <path d="M67 25l4-5 3 6-5 3z" fill="#d5c39c"/>}
      <path d="M31 43q4-3 8 0M61 43q4-3 8 0" stroke="#473239" strokeWidth="1.8" strokeLinecap="round"/>
      <ellipse cx="39" cy="48" rx="2.4" ry="3.2" fill="#263044"/>
      <ellipse cx="61" cy="48" rx="2.4" ry="3.2" fill="#263044"/>
      <circle cx="39.7" cy="47.3" r=".7" fill="#fff"/><circle cx="61.7" cy="47.3" r=".7" fill="#fff"/>
      <path d="M49 49q-2 5 1 7" fill="none" stroke="#ad735e" strokeWidth="1.2" strokeLinecap="round"/>
      {mouth}
      <ellipse cx="31" cy="55" rx="4" ry="2" fill="#e99ca0" opacity=".22"/><ellipse cx="69" cy="55" rx="4" ry="2" fill="#e99ca0" opacity=".22"/>
      {options.accessory === "Thẻ sinh viên" && <g><path d="M50 78v17" stroke="#355c55" strokeWidth="1.8"/><rect x="43" y="91" width="14" height="16" rx="2" fill="#f9faf8" stroke="#cfd5d3"/><rect x="46" y="94" width="8" height="5" rx="1" fill="#9d2039"/><text x="50" y="104" textAnchor="middle" fontSize="3.5" fontWeight="900" fill="#8e1c34">HIU</text></g>}
      {options.accessory === "Túi thảo dược" && <g><path d="M30 79q-12 17-9 35" stroke="#765d42" strokeWidth="2.2" fill="none"/><path d="M15 102q9-6 17 0l-2 23q-10 4-19-2z" fill="#66765c"/><path d="M18 109q6-4 10 0" stroke="#d7d6b3" strokeWidth="1.4"/></g>}
      {options.accessory === "Balo" && <g><path d="M31 71q-7 18-5 40M69 71q7 18 5 40" fill="none" stroke="#31363a" strokeWidth="4"/><path d="M27 77h46v34H27z" fill="#2f3438" opacity=".16"/></g>}
      <path d="M45 114v15M55 114v15" stroke="#ffffff" strokeOpacity=".65" strokeWidth="1.5"/>
    </svg>
  );
}

export default function AvatarCampus() {
  const [options, setOptions] = useState<AvatarOptions>(initialOptions);
  const [position, setPosition] = useState<Point>({ x: 50, y: 69 });
  const [walking, setWalking] = useState(false);
  const [activeId, setActiveId] = useState(destinations[0].id);
  const [facing, setFacing] = useState<Facing>("right");
  const [ready, setReady] = useState(false);
  const walkTimer = useRef<number | null>(null);
  const active = useMemo(() => destinations.find((destination) => destination.id === activeId)!, [activeId]);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) setOptions({ ...initialOptions, ...JSON.parse(saved) });
    } catch {}
    setReady(true);
    return () => { if (walkTimer.current) window.clearTimeout(walkTimer.current); };
  }, []);

  useEffect(() => {
    if (!ready) return;
    try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(options)); } catch {}
  }, [options, ready]);

  const moveTo = (point: Point, destinationId?: string) => {
    setFacing(point.x < position.x ? "left" : point.x > position.x ? "right" : facing);
    setPosition(point);
    setWalking(true);
    if (destinationId) setActiveId(destinationId);
    if (walkTimer.current) window.clearTimeout(walkTimer.current);
    walkTimer.current = window.setTimeout(() => setWalking(false), 540);
  };

  const handleMovement = (event: KeyboardEvent<HTMLDivElement>) => {
    const directions: Record<string, Point> = {
      ArrowUp: { x: 0, y: -7 }, ArrowDown: { x: 0, y: 7 },
      ArrowLeft: { x: -7, y: 0 }, ArrowRight: { x: 7, y: 0 },
    };
    const direction = directions[event.key];
    if (!direction) return;
    event.preventDefault();
    moveTo({ x: Math.max(9, Math.min(91, position.x + direction.x)), y: Math.max(27, Math.min(79, position.y + direction.y)) });
  };

  const update = <K extends keyof AvatarOptions>(key: K, value: AvatarOptions[K]) => setOptions((current) => ({ ...current, [key]: value }));
  const reset = () => { setOptions(initialOptions); setPosition({ x: 50, y: 69 }); setFacing("right"); };

  return (
    <section className={styles.avatarStudio} aria-labelledby="avatar-studio-title">
      <div className={styles.avatarStudioHead}>
        <div><span className={styles.avatarKicker}>NHÂN VẬT HIU YHCT</span><h2 id="avatar-studio-title">Tạo nhân vật của bạn</h2></div>
        <span className={styles.avatarPreviewBadge}>CP9</span>
      </div>

      <div className={styles.avatarCampus} tabIndex={0} onKeyDown={handleMovement} aria-label="Không gian HIU YHCT. Dùng phím mũi tên hoặc cụm nút điều khiển để di chuyển.">
        <div className={styles.campusSky}/>
        <div className={styles.sunHalo}/>
        <div className={`${styles.campusHill} ${styles.campusHillBack}`}/>
        <div className={`${styles.campusHill} ${styles.campusHillFront}`}/>
        <div className={styles.campusPath}/>
        <div className={styles.campusPond} aria-hidden="true"/>
        {destinations.map((destination, index) => (
          <button className={`${styles.campusPlace} ${styles[`campusPlace${index + 1}`]}`} type="button" key={destination.id} onClick={() => moveTo({ x: destination.x, y: destination.y + 9 }, destination.id)} aria-label={`Đi tới ${destination.place}`}>
            <span>{destination.icon}</span><small>{destination.place}</small>
          </button>
        ))}
        <div className={`${styles.campusTree} ${styles.campusTreeOne}`} aria-hidden="true">✦</div>
        <div className={`${styles.campusTree} ${styles.campusTreeTwo}`} aria-hidden="true">✦</div>
        <div className={`${styles.campusAvatar} ${walking ? styles.campusAvatarWalking : ""}`} style={{ left: `${position.x}%`, top: `${position.y}%` } as CSSProperties}>
          <Character options={options} walking={walking} facing={facing}/>
          <span className={styles.avatarNameplate}>Bạn</span>
        </div>
        <div className={styles.avatarMovePad} aria-label="Điều khiển di chuyển">
          <button type="button" aria-label="Đi lên" onClick={() => moveTo({ x: position.x, y: Math.max(27, position.y - 7) })}>↑</button>
          <button type="button" aria-label="Đi sang trái" onClick={() => moveTo({ x: Math.max(9, position.x - 7), y: position.y })}>←</button>
          <button type="button" aria-label="Đi xuống" onClick={() => moveTo({ x: position.x, y: Math.min(79, position.y + 7) })}>↓</button>
          <button type="button" aria-label="Đi sang phải" onClick={() => moveTo({ x: Math.min(91, position.x + 7), y: position.y })}>→</button>
        </div>
      </div>

      <div className={styles.avatarDestinationBar}>
        <span>Đang ở gần: <strong>{active.place}</strong></span>
        <a href={active.app.currentUpstreamUrl}>Mở {active.label} <b aria-hidden="true">↗</b></a>
      </div>

      <div className={styles.avatarOptions} aria-label="Tùy chỉnh nhân vật">
        <label>Giới tính<select value={options.presentation} onChange={(e) => update("presentation", e.target.value as AvatarOptions["presentation"])}><option>Nữ</option><option>Nam</option></select></label>
        <label>Kiểu tóc<select value={options.hair} onChange={(e) => update("hair", e.target.value as AvatarOptions["hair"])}><option>Tóc búi dài</option><option>Tóc dài</option><option>Tóc layer</option><option>Tóc ngắn</option></select></label>
        <label>Màu tóc<select value={options.hairColor} onChange={(e) => update("hairColor", e.target.value as AvatarOptions["hairColor"])}><option>Đen</option><option>Nâu</option><option>Hạt dẻ</option></select></label>
        <label>Màu da<select value={options.skin} onChange={(e) => update("skin", e.target.value as AvatarOptions["skin"])}><option>Sáng</option><option>Trung bình</option><option>Nâu ấm</option></select></label>
        <label>Trang phục<select value={options.outfit} onChange={(e) => update("outfit", e.target.value as AvatarOptions["outfit"])}><option>Blouse YHCT</option><option>Đồng phục CLB</option><option>Áo dài YHCT</option></select></label>
        <label>Phụ kiện<select value={options.accessory} onChange={(e) => update("accessory", e.target.value as AvatarOptions["accessory"])}><option>Thẻ sinh viên</option><option>Túi thảo dược</option><option>Balo</option><option>Không</option></select></label>
        <label>Biểu cảm<select value={options.expression} onChange={(e) => update("expression", e.target.value as AvatarOptions["expression"])}><option>Tươi</option><option>Cười</option><option>Điềm tĩnh</option></select></label>
        <button className={styles.resetAvatar} type="button" onClick={reset}>Đặt lại</button>
      </div>
      <p className={styles.avatarStorageNote}>Thiết kế bám theo bản thảo nhân vật HIU YHCT: blouse trắng, lớp áo xanh truyền thống, thẻ sinh viên và phụ kiện học tập. Tùy chọn đang lưu cục bộ; đồng bộ theo tài khoản sẽ được nối sau khi SSO hoàn tất.</p>
    </section>
  );
}
