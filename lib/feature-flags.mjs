// Feature flags for HIU TMC — shared by worker.mjs (server), the client hook and the validator.
//
// Purpose: ship code for an upgrade while it stays invisible, then widen the audience in steps
// without a redeploy. Flags are a UI/rollout control, NOT a security control: anything that must be
// protected still has to be enforced server-side (see CLAUDE.md "Rules that protect the live product").
//
// Everything here is pure and fails closed: unknown flag, bad config, bad JSON or any error => OFF.
// The approved homepage must not depend on a flag; nothing in app/layout.tsx or app/page.tsx uses them.

/** Rollout ladder, narrowest to widest. Each stage includes everyone in the stages before it. */
export const FLAG_STAGES = Object.freeze(["off", "admin", "staff", "testers", "percent", "all"]);

/** Roles the Worker already treats as staff (mirrors STAFF_ROLES in worker.mjs). */
export const STAFF_ROLE_SET = Object.freeze(["mod", "super_mod", "admin"]);

/**
 * Registered flags. Every flag ships OFF; the stage is raised at runtime through the
 * FEATURE_FLAGS Worker secret (see docs/RELEASE_PLAYBOOK.md), never by editing this default.
 * Add a flag here in the same PR that adds the code behind it.
 */
export const FEATURE_FLAG_REGISTRY = Object.freeze({
  "assistant-context": Object.freeze({
    description: "Linh thú đồng hành hiểu bối cảnh người học (tiến độ, chủ đề đến hạn, nhiệm vụ) và gợi ý việc nên làm.",
    default: Object.freeze({ stage: "off" }),
  }),
  "assistant-quick-ask": Object.freeze({
    description: "Ô hỏi nhanh trong Linh thú: chỉ đường tới đúng ứng dụng/học liệu (không dùng AI, không tốn tín dụng).",
    default: Object.freeze({ stage: "off" }),
  }),
  "assistant-nudges": Object.freeze({
    description: "Nhắc học chủ động, tiết chế (tối đa một lần mỗi loại mỗi ngày, có thể tắt).",
    default: Object.freeze({ stage: "off" }),
  }),
});

export const FEATURE_FLAG_IDS = Object.freeze(Object.keys(FEATURE_FLAG_REGISTRY));

const MAX_TESTERS = 200;
const MAX_ID_LENGTH = 64;

/** FNV-1a 32-bit. Stable across runtimes; used only for rollout bucketing, never for security. */
function fnv1a(text) {
  let hash = 0x811c9dc5;
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash >>> 0;
}

/** Bucket in [0, 100). Fixed per (flag, member), so raising the percentage only ever adds people. */
export function rolloutBucket(flagId, memberId) {
  return (fnv1a(`${flagId}:${memberId}`) % 10000) / 100;
}

/** Normalizes one flag config; anything invalid becomes { stage: "off" }. */
export function normalizeFlagConfig(raw) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return { stage: "off" };
  const stage = typeof raw.stage === "string" && FLAG_STAGES.includes(raw.stage) ? raw.stage : "off";
  const config = { stage };
  const percent = Number(raw.percent);
  config.percent = Number.isFinite(percent) ? Math.min(100, Math.max(0, percent)) : 0;
  config.testers = Array.isArray(raw.testers)
    ? raw.testers
        .filter((id) => typeof id === "string" && id.length > 0 && id.length <= MAX_ID_LENGTH)
        .slice(0, MAX_TESTERS)
    : [];
  return config;
}

/**
 * Parses the FEATURE_FLAGS secret: a JSON object { "<flag-id>": { stage, percent?, testers? } }.
 * Unknown flag ids are ignored. Invalid JSON returns {} (every flag keeps its default OFF).
 */
export function parseFlagOverrides(raw) {
  if (typeof raw !== "string" || raw.trim() === "") return {};
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return {};
  }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
  const overrides = {};
  for (const id of FEATURE_FLAG_IDS) {
    if (Object.prototype.hasOwnProperty.call(parsed, id)) overrides[id] = normalizeFlagConfig(parsed[id]);
  }
  return overrides;
}

/**
 * viewer: { role?: string, memberId?: string }. Only a server-verified viewer should be passed in
 * (the Worker derives it from the Supabase session, never from a client claim).
 */
export function isStaffViewer(viewer) {
  return Boolean(viewer && typeof viewer.role === "string" && STAFF_ROLE_SET.includes(viewer.role));
}

export function evaluateFlag(flagId, config, viewer = {}) {
  const normalized = normalizeFlagConfig(config);
  const staff = isStaffViewer(viewer);
  const memberId = typeof viewer.memberId === "string" ? viewer.memberId : "";
  switch (normalized.stage) {
    case "off":
      return false;
    case "admin":
      return viewer.role === "admin";
    case "staff":
      return staff;
    case "testers":
      return staff || (memberId !== "" && normalized.testers.includes(memberId));
    case "percent":
      return (
        staff ||
        (memberId !== "" &&
          (normalized.testers.includes(memberId) || rolloutBucket(flagId, memberId) < normalized.percent))
      );
    case "all":
      return true;
    default:
      return false;
  }
}

/**
 * Resolves every registered flag to a boolean for one viewer.
 * - disabled: kill switch (FEATURE_FLAGS_DISABLED) — everything OFF regardless of config.
 * - preview: flag ids a verified staff member asked to see ahead of rollout (own session only).
 */
export function resolveFlags({ overrides = {}, viewer = {}, disabled = false, preview = [] } = {}) {
  const result = {};
  const staff = isStaffViewer(viewer);
  for (const id of FEATURE_FLAG_IDS) {
    if (disabled) {
      result[id] = false;
      continue;
    }
    const config = overrides[id] ?? FEATURE_FLAG_REGISTRY[id].default;
    result[id] = evaluateFlag(id, config, viewer) || (staff && preview.includes(id));
  }
  return result;
}

/** Parses ?preview=a,b into known flag ids only. */
export function parsePreviewIds(raw) {
  if (typeof raw !== "string") return [];
  return raw
    .split(",")
    .map((part) => part.trim())
    .filter((part) => FEATURE_FLAG_IDS.includes(part));
}

/** True when the Worker kill switch is set (any non-empty value except "0" / "false"). */
export function flagsDisabled(value) {
  if (typeof value !== "string") return false;
  const text = value.trim().toLowerCase();
  return text !== "" && text !== "0" && text !== "false";
}
