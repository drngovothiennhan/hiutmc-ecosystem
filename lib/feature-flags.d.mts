export type FlagStage = "off" | "admin" | "staff" | "testers" | "percent" | "all";
export type FlagConfig = { stage: FlagStage; percent?: number; testers?: string[] };
export type FlagViewer = { role?: string; memberId?: string };
export type FlagId = "assistant-context" | "assistant-quick-ask" | "assistant-nudges" | "search-shared-library" | "search-herb-names" | "search-google-link";

export const FLAG_STAGES: readonly FlagStage[];
export const STAFF_ROLE_SET: readonly string[];
export const FEATURE_FLAG_REGISTRY: Readonly<Record<FlagId, { description: string; default: FlagConfig }>>;
export const FEATURE_FLAG_IDS: readonly FlagId[];

export function rolloutBucket(flagId: string, memberId: string): number;
export function normalizeFlagConfig(raw: unknown): Required<FlagConfig>;
export function parseFlagOverrides(raw: unknown): Partial<Record<FlagId, Required<FlagConfig>>>;
export function isStaffViewer(viewer: FlagViewer | null | undefined): boolean;
export function evaluateFlag(flagId: string, config: unknown, viewer?: FlagViewer): boolean;
export function resolveFlags(options?: {
  overrides?: Partial<Record<FlagId, FlagConfig>>;
  viewer?: FlagViewer;
  disabled?: boolean;
  preview?: string[];
}): Record<FlagId, boolean>;
export function parsePreviewIds(raw: unknown): FlagId[];
export function flagsDisabled(value: unknown): boolean;
