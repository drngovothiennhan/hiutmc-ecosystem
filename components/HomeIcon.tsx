import type { SVGProps } from "react";

export type HomeIconName =
  | "study-os"
  | "ai-tongue"
  | "trung-y-van"
  | "atlas-3d"
  | "herbal-function"
  | "pathology-yhct"
  | "acupuncture"
  | "nav-home"
  | "nav-study"
  | "nav-atlas"
  | "nav-ai"
  | "nav-community";

type Props = SVGProps<SVGSVGElement> & {
  name: HomeIconName;
};

const common = {
  fill: "none",
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export default function HomeIcon({ name, ...props }: Props) {
  const nav = name.startsWith("nav-");

  return (
    <svg
      viewBox="0 0 64 64"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {!nav && <rect width="64" height="64" rx="15" fill={background[name]} />}

      {name === "study-os" && (
        <g {...common} stroke="#9F1C3B" strokeWidth="2.5">
          <path d="M14 22.5c5.8-1.7 10.9-.7 15.5 2.7v23.1c-4.5-3.1-9.8-4.1-15.5-2.6V22.5Z" />
          <path d="M50 22.5c-5.8-1.7-10.9-.7-15.5 2.7v23.1c4.5-3.1 9.8-4.1 15.5-2.6V22.5Z" />
          <path d="M32 26v22" />
          <path d="M22 29.5c2.6.2 4.8.9 6.8 2.1M22 34.5c2.6.2 4.8.9 6.8 2.1M42 29.5c-2.6.2-4.8.9-6.8 2.1M42 34.5c-2.6.2-4.8.9-6.8 2.1" />
          <path d="M32 20c.1-4.4 2.7-7 7-8.3-.2 4.2-2.7 6.9-7 8.3Z" fill="#9F1C3B" stroke="none" />
          <path d="M31.6 20.2c-3.8-.4-6.1-2.7-7.2-6.3 3.7.2 6.1 2.3 7.2 6.3Z" fill="#9F1C3B" stroke="none" />
          <path d="M31.9 19.8v5.1" />
        </g>
      )}

      {name === "ai-tongue" && (
        <g {...common} stroke="#2F6E3B" strokeWidth="2.7">
          <path d="M14 23v-7h7M50 23v-7h-7M14 41v7h7M50 41v7h-7" />
          <path d="M24 24.5c0-3.7 3.1-6.5 8-6.5s8 2.8 8 6.5v9.8c0 8.2-3.3 12.7-8 12.7s-8-4.5-8-12.7v-9.8Z" fill="#2F6E3B" stroke="none" />
          <path d="M26.5 24.5c2.3 1 4 1.4 5.5 1.4s3.2-.4 5.5-1.4" stroke="#E8F3E7" strokeWidth="2.2" />
          <path d="M32 30v10" stroke="#E8F3E7" strokeWidth="2.1" />
          <path d="M28.5 39.5c1.1.8 2.3 1.2 3.5 1.2s2.4-.4 3.5-1.2" stroke="#E8F3E7" strokeWidth="2.1" />
        </g>
      )}

      {name === "trung-y-van" && (
        <g {...common} stroke="#9A6A32" strokeWidth="2.35">
          <path d="M15 19h27c3.4 0 6 2.6 6 6v19H21c-3.4 0-6-2.6-6-6V19Z" />
          <path d="M15 19c4.5 0 6.3 2.8 6.3 6.2V44M48 25c-4.5 0-6.3 2.8-6.3 6.2V44" />
          <path d="M26 27h11M26 32h11M26 37h8" />
          <path d="M13 19c-2.4 0-4 1.7-4 4s1.6 4 4 4h2M50 44c2.4 0 4 1.7 4 4s-1.6 4-4 4H24" />
          <path d="M42.5 21.5c2.8-4 6.1-5.4 9.9-4.2-1 3.7-3.9 6-9.9 4.2Z" fill="#9A6A32" stroke="none" />
          <path d="M43 22c3.8 1.5 6 3.9 6.5 7.2-3.5.2-6.2-2.1-6.5-7.2Z" fill="#9A6A32" stroke="none" />
        </g>
      )}

      {name === "atlas-3d" && (
        <g {...common} stroke="#2A6D9A" strokeWidth="2.1">
          <circle cx="32" cy="18" r="4.8" fill="#2A6D9A" stroke="none" />
          <path d="M27 24.2c1.8-1.8 8.2-1.8 10 0l2.3 9.4-3.5 4.7-1.4 12.4h-4.8l-1.4-12.4-3.5-4.7 2.3-9.4Z" fill="#2A6D9A" stroke="none" />
          <path d="M27 27.5 20 34M37 27.5 44 34M29.3 36.5l-5.8 12M34.7 36.5l5.8 12" />
          <path d="M13.5 31.8c4.7-9.6 11-14.5 18.5-14.5s13.8 4.9 18.5 14.5M13.5 31.8c4.7 9.6 11 14.5 18.5 14.5s13.8-4.9 18.5-14.5" opacity=".8" />
          <circle cx="16" cy="31.8" r="2.2" fill="#2A6D9A" stroke="none" />
          <circle cx="48" cy="31.8" r="2.2" fill="#2A6D9A" stroke="none" />
          <circle cx="32" cy="44.5" r="1.8" fill="#E4F1F8" stroke="#2A6D9A" />
        </g>
      )}

      {name === "herbal-function" && (
        <g {...common} stroke="#8A5A28" strokeWidth="2.4">
          <path d="M16 31h32l-3.3 12.2c-.7 2.6-3 4.3-5.7 4.3H25c-2.7 0-5-1.7-5.7-4.3L16 31Z" fill="#8A5A28" stroke="none" />
          <path d="M20 29c2.2-2 5.6-3 12-3 5.9 0 9.5 1 12 3" />
          <path d="M38.5 13.5 30 31" strokeWidth="4.2" />
          <path d="M41 18c2.4-4.3 5.7-6.1 9.6-5.2-.6 4.1-3.7 6.6-9.6 5.2Z" fill="#8A5A28" stroke="none" />
          <path d="M39.8 19.8c-3.8-.4-6.4-2.5-7.8-6.3 3.9-.2 6.7 1.8 7.8 6.3Z" fill="#8A5A28" stroke="none" />
        </g>
      )}

      {name === "pathology-yhct" && (
        <g {...common} stroke="#173A5E" strokeWidth="2.25">
          <circle cx="32" cy="31" r="15" />
          <path d="M32 16c8.3 0 15 6.7 15 15-8.3 0-15-6.7-15-15Z" fill="#173A5E" stroke="none" />
          <path d="M32 46c-8.3 0-15-6.7-15-15 8.3 0 15 6.7 15 15Z" fill="#173A5E" stroke="none" />
          <circle cx="31.8" cy="23.5" r="3.3" fill="#E9F3F9" stroke="none" />
          <circle cx="32.2" cy="38.5" r="3.3" fill="#E9F3F9" stroke="none" />
          <path d="M9.5 45.5c3.6-4.5 7.3-4.6 10.9-.3 3-3 6.1-3 9.1.2M36 49c3.7-4.8 7.5-4.9 11.2-.4 2.2-2.3 4.6-2.4 7.2-.4" opacity=".72" />
        </g>
      )}

      {name === "acupuncture" && (
        <g {...common} stroke="#9F1C3B" strokeWidth="2.35">
          <path d="M21 14v29M29 11v32" strokeWidth="3.1" />
          <path d="M18.5 14h5M26.5 11h5" strokeWidth="3.6" />
          <path d="M21 43l-2 8M29 43l-1 8" />
          <path d="M33 46c4.6-9.4 9-14.4 13.2-15.2 3.5-.7 5.9 1.1 7.3 5.5" />
          <path d="M46 14v8M42 18h8M43.2 15.2l5.6 5.6M48.8 15.2l-5.6 5.6" strokeWidth="1.9" />
        </g>
      )}

      {name === "nav-home" && (
        <g {...common} stroke="currentColor" strokeWidth="2.8">
          <path d="M14 31 32 16l18 15" />
          <path d="M20 28v21h24V28M28 49V37h8v12" />
        </g>
      )}

      {name === "nav-study" && (
        <g {...common} stroke="currentColor" strokeWidth="2.6">
          <path d="M12 19c7-2 13.5-.5 20 4.4V49c-6.1-4.4-12.7-5.7-20-3.7V19Z" />
          <path d="M52 19c-7-2-13.5-.5-20 4.4V49c6.1-4.4 12.7-5.7 20-3.7V19Z" />
          <path d="M32 24v25" />
        </g>
      )}

      {name === "nav-atlas" && (
        <g {...common} stroke="currentColor" strokeWidth="2.5">
          <ellipse cx="32" cy="20" rx="15" ry="5.5" />
          <path d="M17 20v8.5c0 3 6.7 5.5 15 5.5s15-2.5 15-5.5V20" />
          <path d="M17 28.5V37c0 3 6.7 5.5 15 5.5S47 40 47 37v-8.5" />
          <path d="M17 37v7c0 3 6.7 5.5 15 5.5S47 47 47 44v-7" />
        </g>
      )}

      {name === "nav-ai" && (
        <g {...common} stroke="currentColor" strokeWidth="2.5">
          <path d="M32 11c2.1 9.3 7.2 14.4 16.5 16.5C39.2 29.6 34.1 34.7 32 44c-2.1-9.3-7.2-14.4-16.5-16.5C24.8 25.4 29.9 20.3 32 11Z" />
          <path d="M47 41c1 4.4 3.4 6.8 7.8 7.8C50.4 49.8 48 52.2 47 56.6c-1-4.4-3.4-6.8-7.8-7.8C43.6 47.8 46 45.4 47 41Z" />
        </g>
      )}

      {name === "nav-community" && (
        <g {...common} stroke="currentColor" strokeWidth="2.45">
          <circle cx="32" cy="22" r="7" />
          <circle cx="16.5" cy="27" r="5.2" />
          <circle cx="47.5" cy="27" r="5.2" />
          <path d="M20 49c.5-9 5-14 12-14s11.5 5 12 14" />
          <path d="M7 49c.4-7.2 3.7-11 9.5-11 3 0 5.5 1 7.3 3M57 49c-.4-7.2-3.7-11-9.5-11-3 0-5.5 1-7.3 3" />
        </g>
      )}
    </svg>
  );
}

const background: Partial<Record<HomeIconName, string>> = {
  "study-os": "#F7E4E7",
  "ai-tongue": "#E8F3E7",
  "trung-y-van": "#F6E7D2",
  "atlas-3d": "#E4F1F8",
  "herbal-function": "#F8ECD8",
  "pathology-yhct": "#E9F3F9",
  "acupuncture": "#F9E5E8",
};
