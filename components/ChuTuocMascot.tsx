"use client";

import styles from "./ChuTuocMascot.module.css";

export type ChuTuocStage = 1 | 2 | 3 | 4;

export function chuTuocStageFromLevel(level: number): ChuTuocStage {
  if (level >= 61) return 4;
  if (level >= 31) return 3;
  if (level >= 11) return 2;
  return 1;
}

export const chuTuocStages = [
  { stage: 1 as const, min: 1, max: 10, name: "Chu Tước Ấu Điểu", short: "Ấu Điểu", description: "Chim lửa non tròn nhỏ, cánh ngắn, mắt lớn và mào lửa vàng." },
  { stage: 2 as const, min: 11, max: 30, name: "Hỏa Vũ Điểu", short: "Hỏa Vũ", description: "Thân thanh hơn, cánh mở rộng, đuôi hỏa vũ dài và aura ấm." },
  { stage: 3 as const, min: 31, max: 60, name: "Phượng Hoàng Linh", short: "Phượng Linh", description: "Dáng phượng thanh thoát, sải cánh rộng, linh quang và vũ lửa rõ nét." },
  { stage: 4 as const, min: 61, max: 100, name: "Chu Tước Thánh Điểu", short: "Thánh Điểu", description: "Thánh điểu uy nghi với cánh tầng, thần hỏa, kim sức và hào quang linh khí." },
];

type Props = {
  level?: number;
  stage?: ChuTuocStage;
  className?: string;
  compact?: boolean;
  title?: string;
};

function StageOne({ id }: { id: string }) {
  return <>
    <g className={styles.tail}>
      <path d="M88 111c14 7 27 6 38-2-5 12-14 19-29 20 10 5 17 12 20 22-13-3-24-11-33-24Z" fill={`url(#ct-tail-${id})`} />
      <path d="M102 105c9 2 18 0 26-7-2 10-8 17-19 21Z" fill="#ffd664" opacity=".92" />
    </g>
    <g className={styles.wings}>
      <g className={styles.leftWing}>
        <path d="M66 78C48 64 31 65 21 79c11-2 18 1 24 8-8-1-14 2-19 8 13 1 24 6 34 15Z" fill={`url(#ct-wing-${id})`} />
        <path d="M58 86c-9-6-17-7-24-3 8 2 15 6 21 12Z" fill="#ffd86e" opacity=".9" />
      </g>
      <g className={styles.rightWing}>
        <path d="M94 78c18-14 35-13 45 1-11-2-18 1-24 8 8-1 14 2 19 8-13 1-24 6-34 15Z" fill={`url(#ct-wing-${id})`} />
        <path d="M102 86c9-6 17-7 24-3-8 2-15 6-21 12Z" fill="#ffd86e" opacity=".9" />
      </g>
    </g>
    <g className={styles.body}>
      <ellipse cx="80" cy="99" rx="27" ry="30" fill={`url(#ct-body-${id})`} />
      <ellipse cx="80" cy="103" rx="16" ry="20" fill="#fff1d3" />
    </g>
    <g className={styles.head}>
      <circle cx="80" cy="61" r="25" fill={`url(#ct-body-${id})`} />
      <ellipse cx="80" cy="68" rx="16" ry="13" fill="#fff0d1" />
      <g className={styles.crest}>
        <path d="M67 43c2-12 9-20 14-27 0 9 4 16 10 21-1-14 5-23 12-29 0 14 5 23 14 29-12-2-22 2-29 12Z" fill={`url(#ct-tail-${id})`} />
        <path d="M78 41c2-8 5-13 8-18 0 7 2 12 6 16Z" fill="#ffe47d" />
      </g>
      <g className={styles.face}>
        <ellipse cx="70.5" cy="59.5" rx="5.8" ry="7.1" fill="#172634" />
        <ellipse cx="89.5" cy="59.5" rx="5.8" ry="7.1" fill="#172634" />
        <circle cx="72" cy="57" r="1.9" fill="#fff" />
        <circle cx="91" cy="57" r="1.9" fill="#fff" />
        <path d="M76 68 80 64l4 4-4 4Z" fill="#e6a43a" />
        <ellipse cx="63" cy="69" rx="5" ry="2.4" fill="#ef927d" opacity=".55" />
        <ellipse cx="97" cy="69" rx="5" ry="2.4" fill="#ef927d" opacity=".55" />
      </g>
    </g>
  </>;
}

function StageTwo({ id }: { id: string }) {
  return <>
    <g className={styles.tail}>
      <path d="M84 111c19 3 35-5 46-21 1 15-5 27-19 36 15-1 28 4 36 14-17 3-34-1-49-11Z" fill={`url(#ct-tail-${id})`} />
      <path d="M91 116c10 8 17 19 19 32-11-5-21-14-29-24Z" fill="#ff9432" />
      <path d="M101 108c15-6 25-16 30-29 4 13 0 27-12 38Z" fill="#ffe374" opacity=".92" />
    </g>
    <g className={styles.wings}>
      <g className={styles.leftWing}>
        <path d="M68 80C47 57 24 53 10 72c15-2 27 3 36 13-11-2-20 1-28 8 18 4 33 12 46 25Z" fill={`url(#ct-wing-${id})`} />
        <path d="M59 82C45 71 31 69 21 76c12 2 23 8 32 19Z" fill="#ffd668" />
      </g>
      <g className={styles.rightWing}>
        <path d="M92 80c21-23 44-27 58-8-15-2-27 3-36 13 11-2 20 1 28 8-18 4-33 12-46 25Z" fill={`url(#ct-wing-${id})`} />
        <path d="M101 82c14-11 28-13 38-6-12 2-23 8-32 19Z" fill="#ffd668" />
      </g>
    </g>
    <g className={styles.body}>
      <ellipse cx="80" cy="97" rx="23" ry="31" fill={`url(#ct-body-${id})`} />
      <ellipse cx="80" cy="101" rx="14" ry="21" fill="#fff0cf" />
    </g>
    <g className={styles.head}>
      <circle cx="80" cy="58" r="22" fill={`url(#ct-body-${id})`} />
      <ellipse cx="80" cy="64" rx="14" ry="12" fill="#fff0d1" />
      <g className={styles.crest}>
        <path d="M68 41c3-14 10-22 15-29 0 10 4 17 10 21 0-13 6-22 13-28 0 14 5 24 13 31-13-3-23 1-31 11Z" fill={`url(#ct-tail-${id})`} />
        <path d="M81 39c2-8 5-13 8-18 0 7 2 12 6 16Z" fill="#ffe47d" />
      </g>
      <ellipse cx="72" cy="56" rx="4.6" ry="5.8" fill="#172634" />
      <ellipse cx="88" cy="56" rx="4.6" ry="5.8" fill="#172634" />
      <circle cx="73.3" cy="54.2" r="1.5" fill="#fff" />
      <circle cx="89.3" cy="54.2" r="1.5" fill="#fff" />
      <path d="M77 65 81 61l4 4-4 4Z" fill="#e2a13a" />
    </g>
    <g className={styles.featherFlames}>
      <path d="M48 101c-8-9-9-18-4-26 3 7 8 12 15 16Z" fill="#ffb540" opacity=".7" />
      <path d="M112 101c8-9 9-18 4-26-3 7-8 12-15 16Z" fill="#ffb540" opacity=".7" />
    </g>
  </>;
}

function MatureWing({ side, id, sacred = false }: { side: "left" | "right"; id: string; sacred?: boolean }) {
  const flip = side === "right";
  return <g className={flip ? styles.rightWing : styles.leftWing} transform={flip ? "translate(160 0) scale(-1 1)" : undefined}>
    <path d={sacred
      ? "M74 83C56 49 28 31 4 41c20 5 35 16 46 32-17-9-33-10-48-3 20 11 38 25 53 43-16-8-31-8-44-1 18 9 35 19 50 32Z"
      : "M73 85C55 56 30 42 8 51c17 5 31 15 42 29-15-7-29-8-42-2 18 9 34 22 47 38-13-5-26-5-38 1 15 7 30 16 43 27Z"} fill={`url(#ct-wing-${id})`} />
    <path d="M64 78C49 58 32 49 17 53c14 7 27 17 37 30Z" fill="#ffd86a" opacity=".92" />
    <path d="M59 91C43 78 29 74 16 78c13 7 25 17 35 28Z" fill="#ff9b37" opacity=".88" />
    {sacred && <>
      <path d="M56 104C40 96 27 95 16 100c12 7 23 15 33 24Z" fill="#c3233e" opacity=".9" />
      <path d="M39 55c7 2 13 6 18 11" fill="none" stroke="#ffe784" strokeWidth="2.3" strokeLinecap="round" />
    </>}
  </g>;
}

function MatureHead({ id, sacred = false }: { id: string; sacred?: boolean }) {
  return <g className={styles.head}>
    <path d={sacred
      ? "M83 30c10-8 23-4 28 5 3 7 0 14-6 18-7 5-15 5-22 2-5-3-8-8-7-13 1-5 3-9 7-12Z"
      : "M80 35c9-7 20-4 25 4 3 6 1 12-5 16-6 4-14 4-20 1-5-2-7-7-6-11 1-4 3-7 6-10Z"} fill={`url(#ct-body-${id})`} />
    <path d={sacred
      ? "M80 38c-3 13-2 23 4 31 8 11 9 23 3 34l-15-4c4-10 3-19-3-29-8-13-6-25 4-35Z"
      : "M78 42c-2 12-1 21 5 29 7 10 8 20 3 30l-14-3c4-9 3-17-3-26-7-12-5-22 4-32Z"} fill={`url(#ct-body-${id})`} />
    <path d={sacred ? "M78 25c2-12 9-20 17-25-1 10 3 18 10 23-2-13 5-20 13-24-2 14 4 24 14 30-14-3-27 1-39 13Z" : "M76 31c2-11 8-18 15-23 0 9 3 16 9 21-1-11 5-18 12-22-1 12 4 21 12 27-12-3-23 0-33 10Z"} fill={`url(#ct-tail-${id})`} className={styles.crest} />
    <path d={sacred ? "M111 39l13 3-13 5Z" : "M104 44l11 3-11 4Z"} fill="#e8ad3d" />
    <path d={sacred ? "M96 39c4-3 9-3 13 0-5 1-8 3-11 6Z" : "M92 44c4-3 8-3 12 0-4 1-7 3-10 5Z"} fill="#172634" />
    <circle cx={sacred ? "102" : "97"} cy={sacred ? "39" : "44"} r="1.5" fill="#fff" />
  </g>;
}

function StageThree({ id }: { id: string }) {
  return <>
    <g className={styles.tail}>
      <path d="M80 108c-7 15-19 29-35 42 18-5 34-14 47-27 5 14 4 27-1 37 14-12 22-26 23-43Z" fill={`url(#ct-tail-${id})`} />
      <path d="M84 111c15 8 31 11 48 7-10 10-22 16-37 17 11 7 20 15 26 25-17-6-31-16-44-30Z" fill="#e93636" />
      <path d="M77 112c-12 9-23 20-31 34 14-5 26-12 37-22Z" fill="#ffd55f" />
    </g>
    <g className={styles.wings}>
      <MatureWing side="left" id={id} />
      <MatureWing side="right" id={id} />
    </g>
    <g className={styles.body}>
      <path d="M67 86c5-13 18-18 28-10 9 7 11 21 5 34-5 11-13 18-22 20-11-4-18-12-20-24-1-8 2-15 9-20Z" fill={`url(#ct-body-${id})`} />
      <path d="M71 86c2 14 5 26 11 35 6-9 9-20 8-34-5-5-12-6-19-1Z" fill="#fff0cf" opacity=".92" />
    </g>
    <MatureHead id={id} />
    <g className={styles.featherFlames}>
      <path d="M61 99c-9-6-14-15-14-25 6 5 12 10 20 12Z" fill="#ffb540" opacity=".7" />
      <path d="M103 99c9-6 14-15 14-25-6 5-12 10-20 12Z" fill="#ffb540" opacity=".7" />
    </g>
  </>;
}

function StageFour({ id }: { id: string }) {
  return <>
    <g className={styles.tail}>
      <path d="M78 106c-15 15-32 30-52 45 21-5 40-14 55-28-2 14-8 26-18 37 18-9 31-22 39-39Z" fill={`url(#ct-tail-${id})`} />
      <path d="M86 108c18 10 38 14 60 10-12 10-26 17-43 19 15 7 27 15 36 25-20-5-38-15-54-30Z" fill="#d6203e" />
      <path d="M82 111c-4 17-3 33 4 49 7-15 11-30 9-45Z" fill="#ff9631" />
      <path d="M70 113c-12 10-23 22-31 36 15-4 29-12 41-23Z" fill="#ffe06a" />
      <path d="M99 115c13 7 26 17 37 31-15-4-29-11-42-21Z" fill="#ffb63f" />
      <ellipse cx="46" cy="144" rx="5" ry="2.8" fill="#8f1a3b" stroke="#ffd768" strokeWidth="1.5" />
      <ellipse cx="126" cy="141" rx="5" ry="2.8" fill="#8f1a3b" stroke="#ffd768" strokeWidth="1.5" />
    </g>
    <g className={styles.wings}>
      <MatureWing side="left" id={id} sacred />
      <MatureWing side="right" id={id} sacred />
    </g>
    <g className={styles.body}>
      <path d="M66 82c6-15 22-20 34-10 11 9 13 25 6 40-6 13-15 21-26 23-13-5-21-15-23-29-1-10 2-18 9-24Z" fill={`url(#ct-body-${id})`} />
      <path d="M70 82c3 17 7 31 12 42 7-11 10-24 9-40-6-6-14-7-21-2Z" fill="#fff1d5" />
    </g>
    <MatureHead id={id} sacred />
    <g className={styles.sacredDetails}>
      <path d="M62 86c11 6 27 6 38 0l-4 10c-10 6-21 7-31 1Z" fill={`url(#ct-gold-${id})`} />
      <circle cx="81" cy="91" r="5" fill="#941a3a" stroke="#ffe78d" strokeWidth="2" />
      <path d="M59 79 48 65M105 76l13-16" stroke="#f5c452" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M68 101c8 4 17 4 25 0" fill="none" stroke="#e7b145" strokeWidth="2" />
    </g>
  </>;
}

export default function ChuTuocMascot({ level = 1, stage, className = "", compact = false, title }: Props) {
  const active = stage ?? chuTuocStageFromLevel(level);
  const id = String(active);
  const label = title ?? chuTuocStages[active - 1].name;

  return (
    <svg
      viewBox="0 0 160 160"
      role="img"
      aria-label={label}
      className={[styles.root, styles["stage" + active], compact ? styles.compact : "", className].filter(Boolean).join(" ")}
    >
      <defs>
        <radialGradient id={"ct-aura-" + id} cx="50%" cy="48%" r="52%">
          <stop offset="0" stopColor="#fff5bc" stopOpacity=".95" />
          <stop offset=".44" stopColor="#ff9a35" stopOpacity=".34" />
          <stop offset="1" stopColor="#ff5d2a" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={"ct-body-" + id} x1=".18" y1=".05" x2=".82" y2=".95">
          <stop offset="0" stopColor="#ffd56a" />
          <stop offset=".34" stopColor="#ff7b30" />
          <stop offset=".72" stopColor="#e43a34" />
          <stop offset="1" stopColor="#9b183b" />
        </linearGradient>
        <linearGradient id={"ct-wing-" + id} x1=".1" y1=".1" x2=".9" y2=".9">
          <stop offset="0" stopColor="#ffe379" />
          <stop offset=".27" stopColor="#ff9635" />
          <stop offset=".68" stopColor="#e43d34" />
          <stop offset="1" stopColor="#8e173a" />
        </linearGradient>
        <linearGradient id={"ct-tail-" + id} x1=".15" y1=".2" x2=".9" y2=".8">
          <stop offset="0" stopColor="#ffe77c" />
          <stop offset=".31" stopColor="#ff9130" />
          <stop offset=".7" stopColor="#e33038" />
          <stop offset="1" stopColor="#8e173d" />
        </linearGradient>
        <linearGradient id={"ct-gold-" + id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff2a4" />
          <stop offset=".5" stopColor="#e9b03e" />
          <stop offset="1" stopColor="#9a5b1c" />
        </linearGradient>
        <filter id={"ct-glow-" + id} x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation={active >= 3 ? "3.7" : "2.1"} result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      <g className={styles.aura}>
        <circle cx="80" cy="78" r={active === 4 ? 70 : active === 3 ? 62 : active === 2 ? 53 : 44} fill={"url(#ct-aura-" + id + ")"} />
        {active >= 3 && <circle cx="80" cy="77" r={active === 4 ? 55 : 49} fill="none" stroke="#f2b84b" strokeWidth={active === 4 ? "2.2" : "1.5"} strokeDasharray="3 8" opacity=".74" />}
      </g>

      <g className={styles.particles} filter={"url(#ct-glow-" + id + ")"}>
        <circle cx="31" cy="51" r="2.1" fill="#ffbd46" />
        <circle cx="127" cy="56" r="1.8" fill="#ffe481" />
        <circle cx="39" cy="104" r="1.5" fill="#ff6e31" />
        <circle cx="119" cy="111" r="2" fill="#ffb13e" />
        {active >= 2 && <>
          <path d="M22 80c7-4 9-10 6-16 7 4 10 11 6 18-3 5-8 7-12 8 3-3 3-6 0-10Z" fill="#ff8730" opacity=".8" />
          <path d="M134 92c-5-5-5-11-1-16 5 6 6 12 2 18-3 4-7 5-10 5 4-2 7-4 9-7Z" fill="#ffb53c" opacity=".72" />
        </>}
        {active === 4 && <>
          <circle cx="81" cy="18" r="2.2" fill="#fff0a0" />
          <circle cx="143" cy="77" r="1.7" fill="#fff0a0" />
          <circle cx="18" cy="112" r="1.6" fill="#ffd76c" />
        </>}
      </g>

      {active === 1 && <StageOne id={id} />}
      {active === 2 && <StageTwo id={id} />}
      {active === 3 && <StageThree id={id} />}
      {active === 4 && <StageFour id={id} />}
    </svg>
  );
}
