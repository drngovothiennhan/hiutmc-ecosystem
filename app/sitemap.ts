export const dynamic = "force-static";

import type { MetadataRoute } from "next";
import { ecosystemApps } from "@/data/apps";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://hiutmc.com";
  const publicRoutes = [
    "/",
    "/discover/",
    "/learn/",
    "/ai/",
    "/community/",
    "/search/",
    "/apps/study/",
    "/apps/atlas/",
    "/apps/thietchan/",
    "/apps/trungyvan/",
    "/apps/game-hub/",
    "/apps/game-hub/y-quan-live/interview/?trial=1",
  ];

  return [
    ...publicRoutes.map((route, index) => ({
      url: `${base}${route}`,
      changeFrequency: "weekly" as const,
      priority: index === 0 ? 1 : 0.8,
    })),
    ...ecosystemApps.map((app) => ({
      url: `${base}/ecosystem/${app.slug}/`,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];
}
