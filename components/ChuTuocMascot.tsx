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

export default function ChuTuocMascot({ level = 1, stage, className = "", compact = false, title }: Props) {
  const active = stage ?? chuTuocStageFromLevel(level);
  const label = title ?? chuTuocStages[active - 1].name;

  return (
    <svg
      viewBox="0 0 160 160"
      role="img"
      aria-label={label}
      className={[styles.root, styles["stage" + active], compact ? styles.compact : "", className].filter(Boolean).join(" ")}
    >
      <defs>
        <radialGradient id={"ct-aura-" + active} cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#fff4b8" stopOpacity=".9" />
          <stop offset=".45" stopColor="#ff9b35" stopOpacity=".34" />
          <stop offset="1" stopColor="#ff5d2a" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={"ct-body-" + active} x1=".18" y1=".05" x2=".82" y2=".95">
          <stop offset="0" stopColor="#ffcf62" />
          <stop offset=".35" stopColor="#ff742d" />
          <stop offset="1" stopColor="#b71938" />
        </linearGradient>
        <linearGradient id={"ct-wing-" + active} x1=".1" y1=".1" x2=".9" y2=".9">
          <stop offset="0" stopColor="#ffdc73" />
          <stop offset=".28" stopColor="#ff8e32" />
          <stop offset=".72" stopColor="#e33f2f" />
          <stop offset="1" stopColor="#8f1738" />
        </linearGradient>
        <linearGradient id={"ct-tail-" + active} x1=".15" y1=".2" x2=".9" y2=".8">
          <stop offset="0" stopColor="#ffe27a" />
          <stop offset=".33" stopColor="#ff8c2f" />
          <stop offset=".72" stopColor="#e33534" />
          <stop offset="1" stopColor="#94163b" />
        </linearGradient>
        <linearGradient id={"ct-gold-" + active} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff0a0" />
          <stop offset=".5" stopColor="#e7ae3e" />
          <stop offset="1" stopColor="#9b5a1d" />
        </linearGradient>
        <filter id={"ct-glow-" + active} x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation={active >= 3 ? "3.8" : "2.2"} result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      <g className={styles.aura}>
        <circle cx="80" cy="78" r={active === 4 ? 69 : active === 3 ? 61 : active === 2 ? 52 : 43} fill={"url(#ct-aura-" + active + ")"} />
        {active >= 3 && <circle cx="80" cy="77" r={active === 4 ? 54 : 48} fill="none" stroke="#f2b84b" strokeWidth={active === 4 ? "2.2" : "1.5"} strokeDasharray="3 8" opacity=".72" />}
      </g>

      <g className={styles.particles} filter={"url(#ct-glow-" + active + ")"}>
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

      <g className={styles.tail}>
        {active === 1 && <>
          <path d="M88 110c13 8 27 9 37 3-5 11-15 17-30 16 10 6 18 14 20 23-12-3-23-11-31-24Z" fill={"url(#ct-tail-" + active + ")"} />
          <path d="M101 105c10 3 19 1 27-5-2 9-9 16-19 19Z" fill="#ffd15f" opacity=".9" />
        </>}
        {active === 2 && <>
          <path d="M85 111c18 2 33-5 43-20 1 14-5 26-18 35 14-2 27 2 36 12-16 3-33 0-48-10Z" fill={"url(#ct-tail-" + active + ")"} />
          <path d="M91 116c9 8 16 18 18 31-10-6-19-13-27-24Z" fill="#ff9736" />
          <path d="M100 108c15-6 24-15 29-28 4 13 0 26-12 37Z" fill="#ffe171" opacity=".9" />
        </>}
        {active >= 3 && <>
          <path d="M83 108c21 3 41-7 57-29-1 18-9 33-25 45 14 2 27 9 36 21-20 2-40-3-59-16Z" fill={"url(#ct-tail-" + active + ")"} />
          <path d="M91 114c11 9 21 23 26 39-14-6-28-16-39-31Z" fill="#ff8b2e" />
          <path d="M96 111c17-8 31-21 39-38 5 16 0 31-13 44Z" fill="#ffd75f" />
          {active === 4 && <>
            <path d="M75 111c-2 15-8 29-20 41 2-17 8-32 19-44Z" fill="#c91e3d" />
            <path d="M104 116c16 5 29 15 38 30-15-2-29-8-43-19Z" fill="#ffbb43" />
          </>}
        </>}
      </g>

      <g className={styles.wings}>
        <g className={styles.leftWing}>
          <path d={active === 1
            ? "M66 76C48 63 31 64 21 78c11-2 18 1 24 8-8-1-14 2-19 8 13 1 24 6 34 15Z"
            : active === 2
              ? "M67 79C47 56 24 53 10 71c15-2 26 3 35 13-10-2-19 1-27 8 17 4 32 12 45 25Z"
              : "M70 82C48 50 19 43 3 64c18-2 33 4 46 17-13-4-25-1-36 8 20 5 39 16 54 33Z"} fill={"url(#ct-wing-" + active + ")"} />
          {active >= 2 && <path d="M60 82C45 70 31 68 21 75c12 2 22 8 31 19Z" fill="#ffd368" opacity=".9" />}
        </g>
        <g className={styles.rightWing}>
          <path d={active === 1
            ? "M94 76c18-13 35-12 45 2-11-2-18 1-24 8 8-1 14 2 19 8-13 1-24 6-34 15Z"
            : active === 2
              ? "M93 79c20-23 43-26 57-8-15-2-26 3-35 13 10-2 19 1 27 8-17 4-32 12-45 25Z"
              : "M90 82c22-32 51-39 67-18-18-2-33 4-46 17 13-4 25-1 36 8-20 5-39 16-54 33Z"} fill={"url(#ct-wing-" + active + ")"} />
          {active >= 2 && <path d="M100 82c15-12 29-14 39-7-12 2-22 8-31 19Z" fill="#ffd368" opacity=".9" />}
        </g>
      </g>

      <g className={styles.body}>
        <ellipse cx="80" cy={active === 1 ? "98" : "96"} rx={active === 1 ? "26" : active === 2 ? "24" : "22"} ry={active === 1 ? "29" : "31"} fill={"url(#ct-body-" + active + ")"} />
        <ellipse cx="80" cy="101" rx={active === 1 ? "15" : "14"} ry={active === 1 ? "19" : "22"} fill="#fff0cf" opacity=".96" />
        <path d="M63 115c4 8 10 13 17 16 7-3 13-8 17-16-7 4-12 5-17 5s-10-1-17-5Z" fill="#ffcf6c" opacity=".72" />
      </g>

      <g className={styles.head}>
        <circle cx="80" cy={active === 1 ? "62" : "58"} r={active === 1 ? "25" : active === 2 ? "23" : "21"} fill={"url(#ct-body-" + active + ")"} />
        <ellipse cx="80" cy={active === 1 ? "68" : "64"} rx="15" ry="13" fill="#fff0d1" />
        <g className={styles.crest}>
          <path d="M69 41c2-12 9-20 13-26 0 9 4 16 10 21-2-14 5-22 11-28 0 13 5 22 13 28-12-2-21 3-28 12Z" fill={"url(#ct-tail-" + active + ")"} />
          <path d="M78 39c2-8 5-13 8-17 0 6 2 11 6 15Z" fill="#ffe27b" />
        </g>
        <g className={styles.face}>
          <ellipse cx="70.5" cy={active === 1 ? "59.5" : "56"} rx={active === 1 ? "5.7" : "4.8"} ry={active === 1 ? "7" : "6"} fill="#1b2733" />
          <ellipse cx="89.5" cy={active === 1 ? "59.5" : "56"} rx={active === 1 ? "5.7" : "4.8"} ry={active === 1 ? "7" : "6"} fill="#1b2733" />
          <circle cx="72" cy={active === 1 ? "57" : "54"} r="1.8" fill="#fff" />
          <circle cx="91" cy={active === 1 ? "57" : "54"} r="1.8" fill="#fff" />
          <path d="M77 67 80 64l3 3-3 4Z" fill="#e8a537" />
          {active === 1 && <>
            <ellipse cx="63" cy="68" rx="5" ry="2.4" fill="#f19782" opacity=".55" />
            <ellipse cx="97" cy="68" rx="5" ry="2.4" fill="#f19782" opacity=".55" />
          </>}
        </g>
        {active >= 3 && <path d="M60 48c8-10 31-13 42-2-8-2-14 1-19 5-8-3-15-4-23-3Z" fill="#b71c35" opacity=".65" />}
      </g>

      {active >= 2 && <g className={styles.featherFlames}>
        <path d="M48 100c-8-8-9-17-4-25 3 7 8 12 15 15Z" fill="#ffb43f" opacity=".68" />
        <path d="M112 101c8-8 9-17 4-25-3 7-8 12-15 15Z" fill="#ffb43f" opacity=".68" />
      </g>}

      {active === 4 && <g className={styles.sacredDetails}>
        <path d="M62 88c10 5 26 5 36 0l-4 9c-9 5-19 6-28 0Z" fill={"url(#ct-gold-" + active + ")"} opacity=".92" />
        <circle cx="80" cy="91" r="4.5" fill="#9a183a" stroke="#ffe693" strokeWidth="2" />
        <path d="M52 76 43 62M108 76l9-14" stroke="#f5c452" strokeWidth="2.2" strokeLinecap="round" />
      </g>}
    </svg>
  );
}
