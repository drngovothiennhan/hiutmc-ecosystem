"use client";

import { type CSSProperties, useEffect, useMemo, useState } from "react";
import {
  localDayKey,
  normalizeProgress,
  selectMissionsForDay,
  type LearningProgress,
} from "@/data/learning-progress";
import {
  SPIRIT_VISUAL_VERSION,
  resolveSpiritPetVisual,
  type SpiritEvolutionStage,
} from "@/data/spirit-pet-visuals";
import styles from "./SpiritCompanion.module.css";
import { useMemberAuth } from "./MemberAuthBridge";

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
const DATABASE_SPECIES_TO_KIND: Record<string, PetKind> = {
  thanh_long: "dragon",
  chu_tuoc: "phoenix",
  kim_su: "sphinx",
  ky_lan: "qilin",
  khong_tuoc: "peacock",
  ho_ly: "fox",
};
const PROGRESS_STORAGE_KEY = "hiutmc-learning-progress-v1";
const PROGRESS_EVENT = "hiutmc:learning-progress-changed";
const BASELINE_VISUAL_STAGE: SpiritEvolutionStage = 1;

const genericPreviewStages: Array<{
  stage: SpiritEvolutionStage;
  short: string;
  description: string;
}> = [
  { stage: 1, short: "Mầm linh", description: "Hình thái đầu tiên, giữ các dấu hiệu nhận diện cốt lõi của loài." },
  { stage: 2, short: "Thành hình", description: "Silhouette rõ hơn, tư thế và các chi tiết đặc trưng bắt đầu hoàn thiện." },
  { stage: 3, short: "Linh thể", description: "Dáng trưởng thành hơn, chi tiết loài và nhịp chuyển động nổi bật hơn." },
  { stage: 4, short: "Viên mãn", description: "Artwork hoàn thiện nhất trong bộ preview visual hiện tại." },
];

const phoenixPreviewStages: Array<{
  stage: SpiritEvolutionStage;
  short: string;
  description: string;
}> = [
  { stage: 1, short: "Ấu Điểu", description: "Chim lửa non tròn nhỏ, cánh ngắn, mắt lớn và mào lửa vàng." },
  { stage: 2, short: "Hỏa Vũ", description: "Thân thanh hơn, cánh mở rộng, đuôi hỏa vũ dài và aura ấm." },
  { stage: 3, short: "Phượng Linh", description: "Dáng phượng thanh thoát, sải cánh rộng, linh quang và vũ lửa rõ nét." },
  { stage: 4, short: "Thánh Điểu", description: "Thánh điểu uy nghi với cánh tầng, thần hỏa, kim sức và hào quang linh khí." },
];

const peacockPreviewStages: Array<{
  stage: SpiritEvolutionStage;
  short: string;
  description: string;
}> = [
  { stage: 1, short: "Mầm linh", description: "Khổng Tước non đứng thẳng, thân nhỏ, mào lông vừa nhú và vài lông đuôi ngắn." },
  { stage: 2, short: "Thành hình", description: "Mào lông rõ hơn; những vệt lông đầu tiên bắt đầu mở ra phía sau." },
  { stage: 3, short: "Linh thể", description: "Đuôi dài hơn, các lông mắt công hiện rõ và đường nét chim trưởng thành." },
  { stage: 4, short: "Viên mãn", description: "Khổng Tước đứng uy nghi với đuôi xòe hoàn chỉnh, họa tiết lông và linh quang." },
];

const species: PetSpecies[] = [
  { kind: "dragon", name: "Thanh Long", title: "Rồng · Nghị lực", primary: "#2f8e8a", secondary: "#d5b260", motion: "float" },
  { kind: "phoenix", name: "Chu Tước", title: "Phụng Hoàng · Tái sinh", primary: "#c64b3d", secondary: "#f0b44d", motion: "flare" },
  { kind: "sphinx", name: "Kim Sư", title: "Kim Sư · Kiên định", primary: "#b97b35", secondary: "#e3c57a", motion: "breathe" },
  { kind: "qilin", name: "Kỳ Lân", title: "Kỳ Lân · Cát tường", primary: "#568c80", secondary: "#e9dfbd", motion: "hop" },
  { kind: "peacock", name: "Khổng Tước", title: "Khổng Tước · Thanh cao", primary: "#237a77", secondary: "#73bfc5", motion: "sway" },
  { kind: "fox", name: "Hồ Ly", title: "Hồ Ly · Linh hoạt", primary: "#b85d34", secondary: "#f1d7ab", motion: "bounce" },
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

const VISUAL_V2_ACTIVE_SPECIES = new Set<PetKind>(["dragon", "phoenix", "sphinx", "qilin", "peacock", "fox"]);

const qilinPreviewStages: Array<{
  stage: SpiritEvolutionStage;
  short: string;
  description: string;
}> = [
  { stage: 1, short: "Mầm linh", description: "Kỳ Lân non nhỏ, sừng mới nhú, bờm ngắn trên dáng bốn chân thanh mảnh." },
  { stage: 2, short: "Thành hình", description: "Sừng và bờm rõ hơn; thân Kỳ Lân bắt đầu hiện các vệt vảy ngọc." },
  { stage: 3, short: "Linh thể", description: "Dáng chạy linh hoạt với bờm dài, đuôi bay và vảy xếp lớp." },
  { stage: 4, short: "Viên mãn", description: "Kỳ Lân trưởng thành với sừng hoàn chỉnh, bờm lượn và hoa văn ngọc kim tinh xảo." },
];

const foxPreviewStages: Array<{
  stage: SpiritEvolutionStage;
  short: string;
  description: string;
}> = [
  { stage: 1, short: "Mầm linh", description: "Hồ Ly con với tai vểnh, mõm cáo và một chiếc đuôi bông nhỏ." },
  { stage: 2, short: "Thành hình", description: "Hồ Ly trẻ linh hoạt, hai chiếc đuôi riêng biệt bắt đầu xòe sau thân." },
  { stage: 3, short: "Linh thể", description: "Cáo trưởng thành đang bật nhảy, nhiều đuôi dài mở thành quạt." },
  { stage: 4, short: "Viên mãn", description: "Hồ Ly chín đuôi múa giữa không trung với bộ lông và đuôi hoàn chỉnh." },
];

function PetArtwork({
  pet,
  stage = BASELINE_VISUAL_STAGE,
  compact = false,
}: {
  pet: PetSpecies;
  stage?: SpiritEvolutionStage;
  compact?: boolean;
}) {


  const visual = resolveSpiritPetVisual(pet.kind, stage);
  if (!visual) return null;

  return (
    <img
      src={compact ? visual.icon : visual.full}
      alt={visual.alt}
      width={compact ? 64 : 128}
      height={compact ? 64 : 128}
      draggable={false}
      decoding="async"
      loading={compact ? "eager" : "lazy"}
      style={{
        display: "block",
        width: "100%",
        height: "100%",
        objectFit: "contain",
        objectPosition: "center",
        pointerEvents: "none",
        userSelect: "none",
      }}
      data-visual-version={visual.visual_version}
      data-preview-stage={stage}
    />
  );
}

export default function SpiritCompanion() {
  const { member, ready: authReady, spiritPetSpecies, spiritPetReady } = useMemberAuth();
  const [pet, setPet] = useState<PetSpecies | null>(null);
  const [open, setOpen] = useState(false);
  const [isNew, setIsNew] = useState(false);
  const [progress, setProgress] = useState<LearningProgress>({ completions: [] });
  const [dayKey, setDayKey] = useState("");
  const [showEvolution, setShowEvolution] = useState(false);
  const [previewStage, setPreviewStage] = useState<SpiritEvolutionStage | null>(null);

  useEffect(() => {
    if (!authReady || (member && !spiritPetReady)) return;
    setDayKey(localDayKey(new Date()));
    setProgress(readLocalProgress());

    if (member && spiritPetSpecies) {
      const kind = DATABASE_SPECIES_TO_KIND[spiritPetSpecies];
      const found = species.find((item) => item.kind === kind);
      if (found) {
        try { window.localStorage.setItem(PET_STORAGE_KEY, found.kind); } catch {}
        setPet(found);
        setIsNew(false);
        return;
      }
    }

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
  }, [authReady, member?.id, spiritPetReady, spiritPetSpecies]);

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
  const renderedStage = previewStage ?? BASELINE_VISUAL_STAGE;
  const stageMeta = pet.kind === "phoenix"
    ? phoenixPreviewStages[renderedStage - 1]
    : pet.kind === "peacock"
      ? peacockPreviewStages[renderedStage - 1]
      : pet.kind === "qilin"
        ? qilinPreviewStages[renderedStage - 1]
        : pet.kind === "fox"
          ? foxPreviewStages[renderedStage - 1]
          : genericPreviewStages[renderedStage - 1];
  const visualVersion = VISUAL_V2_ACTIVE_SPECIES.has(pet.kind) ? SPIRIT_VISUAL_VERSION : "legacy-frozen";

  return (
    <aside className={styles.wrap} style={theme} aria-label="Linh thú đồng hành">
      {open && (
        <section className={styles.panel}>
          <button className={styles.close} onClick={() => setOpen(false)} type="button" aria-label="Đóng">×</button>
          <div className={styles.panelTop}>
            <div className={styles.avatarSmall}>
              <PetArtwork pet={pet} stage={renderedStage} />
            </div>
            <div>
              <small>Linh thú đồng hành · Visual preview</small>
              <strong>{pet.name}</strong>
              <span>{previewStage ? `Preview hình thái ${previewStage} · ${stageMeta.short}` : pet.title}</span>
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
              aria-pressed={showEvolution}
              onClick={() => {
                setShowEvolution((value) => !value);
                setPreviewStage(null);
              }}
              title={`Xem trước 4 hình thái ${pet.name}`}
            ><span>✦</span>Xem tiến hóa</button>
          </div>

          {showEvolution && (
            <section className={styles.evolutionPreview} aria-label={`Xem trước tiến hóa ${pet.name}`}>
              <div className={styles.evolutionHeader}>
                <strong>Hình thái {pet.name}</strong>
                <small>Chỉ đổi artwork preview · không thay đổi cấp thật</small>
              </div>
              <div className={styles.evolutionHero}>
                <span className={styles.evolutionHeroArt}><PetArtwork pet={pet} stage={renderedStage} /></span>
                <div>
                  <small>Preview {renderedStage} / 4</small>
                  <strong>{stageMeta.short}</strong>
                  <p>{stageMeta.description}</p>
                </div>
              </div>
              <div className={styles.evolutionStages}>
                {genericPreviewStages.map((item) => {
                  const meta = pet.kind === "phoenix"
                    ? phoenixPreviewStages[item.stage - 1]
                    : pet.kind === "peacock"
                      ? peacockPreviewStages[item.stage - 1]
                      : pet.kind === "qilin"
                        ? qilinPreviewStages[item.stage - 1]
                        : pet.kind === "fox"
                          ? foxPreviewStages[item.stage - 1]
                          : item;
                  return (
                    <button
                      key={item.stage}
                      type="button"
                      className={renderedStage === item.stage ? styles.stageActive : ""}
                      onClick={() => setPreviewStage(item.stage)}
                      aria-pressed={renderedStage === item.stage}
                    >
                      <span className={styles.stageThumb}><PetArtwork pet={pet} stage={item.stage} compact /></span>
                      <b>Preview {item.stage}</b>
                      <small>{meta.short}</small>
                      <em>Artwork</em>
                    </button>
                  );
                })}
              </div>
            </section>
          )}

          <small className={styles.note}>
            Visual {visualVersion}. Preview chỉ thay asset hiển thị; progression, cấp thật, XP, thân mật, vật phẩm và đồng bộ tài khoản vẫn FROZEN/REVIEW.
          </small>
        </section>
      )}
      <button type="button" className={styles.launcher} onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-label={"Mở linh thú " + pet.name}>
        <span className={styles.bubble}>{remaining === 0 ? "Hoàn thành hôm nay!" : remaining + " việc đang chờ"}</span>
        <span className={styles.petStage + " " + styles[pet.motion]}>
          <PetArtwork pet={pet} stage={BASELINE_VISUAL_STAGE} compact />
        </span>
        <span className={styles.level}>BẠN ĐỒNG HÀNH</span>
        <i className={styles.dot}>{badgeText}</i>
      </button>
    </aside>
  );
}
