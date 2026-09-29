export const SPIRIT_VISUAL_VERSION = "spirit-visual-v2-20260927" as const;

export type SpiritVisualSpecies = "dragon" | "phoenix" | "sphinx" | "qilin" | "peacock" | "fox";
export type SpiritEvolutionStage = 1 | 2 | 3 | 4;
export type SpiritVisualVariant = "full" | "icon";

export type SpiritVisualAsset = {
  visual_version: typeof SPIRIT_VISUAL_VERSION;
  species: SpiritVisualSpecies;
  stage: SpiritEvolutionStage;
  full: string;
  icon: string;
  alt: string;
};

const asset = (
  species: SpiritVisualSpecies,
  stage: SpiritEvolutionStage,
  alt: string,
): SpiritVisualAsset => ({
  visual_version: SPIRIT_VISUAL_VERSION,
  species,
  stage,
  full: `/spirit-pets/visual-v2/${species}-stage-${stage}-full.webp`,
  icon: `/spirit-pets/visual-v2/${species}-stage-${stage}-icon.webp`,
  alt,
});

export const SPIRIT_VISUAL_ASSETS: Record<
  SpiritVisualSpecies,
  Record<SpiritEvolutionStage, SpiritVisualAsset>
> = {
  dragon: {
    1: asset("dragon", 1, "Thanh Long · hình thái preview 1"),
    2: asset("dragon", 2, "Thanh Long · hình thái preview 2"),
    3: asset("dragon", 3, "Thanh Long · hình thái preview 3"),
    4: asset("dragon", 4, "Thanh Long · hình thái preview 4"),
  },
  phoenix: {
    1: asset("phoenix", 1, "Chu Tước · Ấu Điểu"),
    2: asset("phoenix", 2, "Chu Tước · Hỏa Vũ"),
    3: asset("phoenix", 3, "Chu Tước · Phượng Linh"),
    4: asset("phoenix", 4, "Chu Tước · Thánh Điểu"),
  },
  qilin: {
    1: asset("qilin", 1, "Kỳ Lân · Mầm linh"),
    2: asset("qilin", 2, "Kỳ Lân · Thành hình"),
    3: asset("qilin", 3, "Kỳ Lân · Linh thể"),
    4: asset("qilin", 4, "Kỳ Lân · Viên mãn"),
  },
  fox: {
    1: asset("fox", 1, "Hồ Ly · Mầm linh"),
    2: asset("fox", 2, "Hồ Ly · Thành hình"),
    3: asset("fox", 3, "Hồ Ly · Linh thể"),
    4: asset("fox", 4, "Hồ Ly · Viên mãn"),
  },
  peacock: {
    1: asset("peacock", 1, "Khổng Tước · Mầm linh"),
    2: asset("peacock", 2, "Khổng Tước · Thành hình"),
    3: asset("peacock", 3, "Khổng Tước · Linh thể"),
    4: asset("peacock", 4, "Khổng Tước · Viên mãn"),
  },
  sphinx: {
    1: asset("sphinx", 1, "Kim Sư · hình thái preview 1"),
    2: asset("sphinx", 2, "Kim Sư · hình thái preview 2"),
    3: asset("sphinx", 3, "Kim Sư · hình thái preview 3"),
    4: asset("sphinx", 4, "Kim Sư · hình thái preview 4"),
  },
};

export function resolveSpiritPetVisual(
  species: string,
  stage: SpiritEvolutionStage,
): SpiritVisualAsset | null {
  if (!(species in SPIRIT_VISUAL_ASSETS)) return null;
  return SPIRIT_VISUAL_ASSETS[species as SpiritVisualSpecies][stage] ?? null;
}
