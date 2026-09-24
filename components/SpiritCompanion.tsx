"use client";

import { type CSSProperties, useEffect, useMemo, useState } from "react";
import {
  localDayKey,
  normalizeProgress,
  selectMissionsForDay,
  type LearningProgress,
} from "@/data/learning-progress";
import ChuTuocMascot, { chuTuocStageFromLevel, chuTuocStages, type ChuTuocStage } from "./ChuTuocMascot";
import styles from "./SpiritCompanion.module.css";

type PetKind = "dragon" | "phoenix" | "sphinx" | "qilin" | "peacock" | "fox";
type PetSpecies = {
  kind: PetKind;
  name: string;
  title: string;
  primary: string;
  secondary: string;
  motion: string;
};

const PET_STORAGE_KEY = "hiutmc-spirit-pet-v1";
const PROGRESS_STORAGE_KEY = "hiutmc-learning-progress-v1";
const PROGRESS_EVENT = "hiutmc:learning-progress-changed";

const species: PetSpecies[] = [
  { kind: "dragon", name: "Thanh Long", title: "Rồng · Nghị lực", primary: "#2f8e8a", secondary: "#d5b260", motion: "float" },
  { kind: "phoenix", name: "Chu Tước", title: "Phụng Hoàng · Tái sinh", primary: "#c64b3d", secondary: "#f0b44d", motion: "flare" },
  { kind: "sphinx", name: "Kim Sư", title: "Nhân Sư · Trí tuệ", primary: "#b97b35", secondary: "#e3c57a", motion: "breathe" },
  { kind: "qilin", name: "Kỳ Lân", title: "Kỳ Lân · Cát tường", primary: "#d06d5f", secondary: "#f1d9a7", motion: "hop" },
  { kind: "peacock", name: "Khổng Tước", title: "Khổng Tước · Thanh cao", primary: "#237a77", secondary: "#73bfc5", motion: "sway" },
  { kind: "fox", name: "Hồ Ly", title: "Hồ Ly · Linh hoạt", primary: "#d97c64", secondary: "#f7ded0", motion: "bounce" },
];

function readLocalProgress(): LearningProgress {
  if (typeof window === "undefined") return { completions: [] };
  try {
    const raw = window.localStorage.getItem(PROGRESS_STORAGE_KEY);
    return raw ? normalizeProgress(JSON.parse(raw)) : { completions: [] };
  } catch {
    return { completions: [] };
  }
}

function GenericPetArt({ pet }: { pet: PetSpecies }) {
  return (
    <svg viewBox="0 0 96 96" role="img" aria-label={pet.name} className={styles.petSvg}>
      <defs>
        <linearGradient id={"pet-" + pet.kind} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={pet.secondary} />
          <stop offset="1" stopColor={pet.primary} />
        </linearGradient>
      </defs>
      {pet.kind === "peacock" && (
        <g opacity=".34">
          <circle cx="48" cy="39" r="31" fill="none" stroke={pet.primary} strokeWidth="7" strokeDasharray="4 7" />
          <circle cx="48" cy="39" r="22" fill="none" stroke={pet.secondary} strokeWidth="5" strokeDasharray="3 6" />
        </g>
      )}
      {pet.kind === "phoenix" && (
        <path d="M20 54C7 43 9 26 23 22c-2 13 7 18 16 22M76 54c13-11 11-28-3-32 2 13-7 18-16 22" fill="none" stroke={pet.primary} strokeWidth="8" strokeLinecap="round" />
      )}
      <ellipse cx="48" cy="63" rx="24" ry="19" fill={"url(#pet-" + pet.kind + ")"} />
      <circle cx="48" cy="38" r="20" fill={"url(#pet-" + pet.kind + ")"} />
      {pet.kind === "fox" && (
        <>
          <path d="M32 25 25 8 43 21Z" fill={pet.primary} />
          <path d="m64 25 7-17-18 13Z" fill={pet.primary} />
          <path d="M69 63c22-6 21 19 5 20-7 0-11-4-13-7 13 2 16-7 8-13Z" fill={pet.secondary} />
        </>
      )}
      {pet.kind === "dragon" && (
        <>
          <path d="m34 23-5-14 12 10M62 23l5-14-12 10" fill="none" stroke={pet.secondary} strokeWidth="5" strokeLinecap="round" />
          <path d="M70 60c18-6 22 10 12 18-5 4-12 3-16 0" fill="none" stroke={pet.primary} strokeWidth="7" strokeLinecap="round" />
        </>
      )}
      {pet.kind === "sphinx" && <path d="M27 34c2-18 40-18 42 0l-5 11H32Z" fill={pet.secondary} opacity=".72" />}
      {pet.kind === "qilin" && (
        <>
          <path d="M48 20 54 5l5 18" fill={pet.secondary} />
          <path d="M33 26 28 15l12 7M63 26l5-11-12 7" fill={pet.primary} />
        </>
      )}
      {pet.kind === "peacock" && <path d="M48 20 43 9M48 20 53 9M48 20 48 7" stroke={pet.secondary} strokeWidth="3" strokeLinecap="round" />}
      {pet.kind === "phoenix" && <path d="M48 19 43 8l5 5 5-5-5 11Z" fill={pet.secondary} />}
      <circle cx="41" cy="38" r="2.6" fill="#1b2735" />
      <circle cx="55" cy="38" r="2.6" fill="#1b2735" />
      <path d="M44 47c2.5 2.5 5.5 2.5 8 0" fill="none" stroke="#7d3443" strokeWidth="2.4" strokeLinecap="round" />
      <ellipse cx="39" cy="46" rx="4" ry="2" fill="#f1a8a2" opacity=".55" />
      <ellipse cx="57" cy="46" rx="4" ry="2" fill="#f1a8a2" opacity=".55" />
      <path d="M34 79c8 5 20 5 28 0" fill="none" stroke="#fff7e8" strokeWidth="4" strokeLinecap="round" opacity=".78" />
    </svg>
  );
}

function PetArtwork({ pet, stage, compact = false }: { pet: PetSpecies; stage?: ChuTuocStage; compact?: boolean }) {
  if (pet.kind === "phoenix") {
    return <ChuTuocMascot stage={stage} compact={compact} />;
  }
  return <GenericPetArt pet={pet} />;
}

export default function SpiritCompanion() {
  const [pet, setPet] = useState<PetSpecies | null>(null);
  const [open, setOpen] = useState(false);
  const [isNew, setIsNew] = useState(false);
  const [progress, setProgress] = useState<LearningProgress>({ completions: [] });
  const [dayKey, setDayKey] = useState("");
  const [showEvolution, setShowEvolution] = useState(false);
  const [previewStage, setPreviewStage] = useState<ChuTuocStage | null>(null);
  const petLevel = 1;

  useEffect(() => {
    setDayKey(localDayKey(new Date()));
    setProgress(readLocalProgress());

    try {
      const saved = window.localStorage.getItem(PET_STORAGE_KEY);
      if (saved) {
        const found = species.find((item) => item.kind === saved);
        if (found) {
          setPet(found);
          return;
        }
      }
      const next = species[Math.floor(Math.random() * species.length)];
      window.localStorage.setItem(PET_STORAGE_KEY, next.kind);
      setPet(next);
      setIsNew(true);
    } catch {
      setPet(species[3]);
    }
  }, []);

  useEffect(() => {
    const sync = () => setProgress(readLocalProgress());
    window.addEventListener("storage", sync);
    window.addEventListener(PROGRESS_EVENT, sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener(PROGRESS_EVENT, sync);
    };
  }, []);

  const missions = useMemo(() => selectMissionsForDay(dayKey), [dayKey]);
  const completedToday = useMemo(
    () => new Set(progress.completions.filter((item) => item.day === dayKey).map((item) => item.missionId)),
    [progress, dayKey],
  );
  const remaining = Math.max(0, missions.length - completedToday.size);
  const nextMission = missions.find((mission) => !completedToday.has(mission.id));

  const message = useMemo(() => {
    if (isNew) return "Bạn vừa gặp linh thú đồng hành đầu tiên. Mình sẽ nhắc các nhiệm vụ học tập đang lưu trên thiết bị này.";
    if (!dayKey) return "Mình đang đồng bộ nhiệm vụ học tập trên thiết bị.";
    if (remaining === 0) return "Ba nhiệm vụ hôm nay đã được đánh dấu hoàn thành. Tiến độ này hiện chỉ lưu trên thiết bị.";
    if (nextMission) return `Bạn còn ${remaining} nhiệm vụ hôm nay. Gợi ý tiếp theo: ${nextMission.title}.`;
    return "Mình ở đây để gom nhắc học và hoạt động quan trọng vào một góc nhỏ.";
  }, [dayKey, isNew, nextMission, remaining]);

  if (!pet) return <button className={styles.placeholder} aria-label="Linh thú đồng hành" type="button">✦</button>;

  const theme = { "--pet-a": pet.primary, "--pet-b": pet.secondary } as CSSProperties;
  const badgeText = dayKey ? String(remaining) : "…";
  const actualChuTuocStage = chuTuocStageFromLevel(petLevel);
  const renderedChuTuocStage = previewStage ?? actualChuTuocStage;
  const chuTuocStageMeta = chuTuocStages[renderedChuTuocStage - 1];

  return (
    <aside className={styles.wrap} style={theme} aria-label="Linh thú đồng hành">
      {open && (
        <section className={styles.panel}>
          <button className={styles.close} onClick={() => setOpen(false)} type="button" aria-label="Đóng">×</button>
          <div className={styles.panelTop}>
            <div className={styles.avatarSmall}><PetArtwork pet={pet} stage={pet.kind === "phoenix" ? renderedChuTuocStage : undefined} /></div>
            <div>
              <small>Linh thú đồng hành · Preview</small>
              <strong>{pet.name}</strong>
              <span>{pet.kind === "phoenix" ? `Lv.${petLevel} · ${chuTuocStageMeta.name}` : pet.title}</span>
            </div>
          </div>
          <p>{message}</p>

          <div className={styles.localState}>
            <span>Nhiệm vụ hôm nay</span>
            <b>{dayKey ? `${completedToday.size} / ${missions.length}` : "Đang tải"}</b>
          </div>

          <div className={styles.actions}>
            <a href="#missions" onClick={() => setOpen(false)}><span>✓</span>Nhiệm vụ</a>
            <a href="/community/" onClick={() => setOpen(false)}><span>🔔</span>Cộng đồng</a>
            <button
              type="button"
              disabled={pet.kind !== "phoenix"}
              aria-pressed={showEvolution}
              onClick={() => {
                if (pet.kind !== "phoenix") return;
                setShowEvolution((value) => !value);
                setPreviewStage(null);
              }}
              title={pet.kind === "phoenix" ? "Xem trước 4 hình thái Chu Tước" : "Chưa thiết kế riêng cho linh thú này"}
            ><span>✦</span>Xem tiến hóa</button>
          </div>

          {pet.kind === "phoenix" && showEvolution && (
            <section className={styles.evolutionPreview} aria-label="Xem trước tiến hóa Chu Tước">
              <div className={styles.evolutionHeader}>
                <strong>Tiến hóa Chu Tước</strong>
                <small>Chỉ xem trước artwork · không thay đổi cấp thật</small>
              </div>
              <div className={styles.evolutionStages}>
                {chuTuocStages.map((item) => (
                  <button
                    key={item.stage}
                    type="button"
                    className={renderedChuTuocStage === item.stage ? styles.stageActive : ""}
                    onClick={() => setPreviewStage(item.stage)}
                    aria-pressed={renderedChuTuocStage === item.stage}
                  >
                    <span className={styles.stageThumb}><ChuTuocMascot stage={item.stage} compact /></span>
                    <b>Bậc {item.stage}</b>
                    <small>{item.short}</small>
                    <em>Lv.{item.min}–{item.max}</em>
                  </button>
                ))}
              </div>
            </section>
          )}

          <small className={styles.note}>Chu Tước đã dùng artwork SVG riêng theo 4 giai đoạn. Preview tiến hóa chỉ phục vụ thẩm định; cấp, thân mật, vật phẩm và đồng bộ tài khoản vẫn FROZEN/REVIEW.</small>
        </section>
      )}
      <button type="button" className={styles.launcher} onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-label={"Mở linh thú " + pet.name}>
        <span className={styles.bubble}>{remaining === 0 ? "Hoàn thành hôm nay!" : remaining + " việc đang chờ"}</span>
        <span className={styles.petStage + " " + styles[pet.motion]}><PetArtwork pet={pet} stage={pet.kind === "phoenix" ? actualChuTuocStage : undefined} compact /></span>
        <span className={styles.level}>BẠN ĐỒNG HÀNH</span>
        <i className={styles.dot}>{badgeText}</i>
      </button>
    </aside>
  );
}
