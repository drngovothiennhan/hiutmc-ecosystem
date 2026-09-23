"use client";

import { useState } from "react";
import Link from "next/link";
import { ecosystemApps } from "@/data/apps";

export default function EcosystemMap() {
  const [active, setActive] = useState<string | null>(null);

  return (
    <div className="heritageMapWrap" aria-label="Bản đồ hệ sinh thái HIU Y học cổ truyền">
      <aside className="mapScroll mapScrollLeft" aria-hidden="true">
        <span>Y<br />học<br />cổ<br />truyền</span>
        <small>Gìn giữ tinh hoa<br />Lan tỏa giá trị<br />Kiến tạo tương lai</small>
      </aside>

      <div className="mapStage heritageMapStage">
        <img className="mapArtwork" src="/ecosystem-map-art.svg" alt="Bản đồ anime 2D hệ sinh thái HIU Y học cổ truyền" />
        <div className="mapShade" />

        <div className="centralSeal" aria-hidden="true">
          <span>☯</span>
          <strong>HIU</strong>
        </div>

        {ecosystemApps.map((app) => (
          <div
            className={`districtMarker ${active === app.slug ? "isActive" : ""}`}
            style={{ left: `${app.x}%`, top: `${app.y}%`, ["--accent" as string]: app.accent }}
            key={app.slug}
            onMouseEnter={() => setActive(app.slug)}
            onMouseLeave={() => setActive(null)}
          >
            <button
              className="districtPulse"
              onClick={() => setActive(active === app.slug ? null : app.slug)}
              onFocus={() => setActive(app.slug)}
              aria-expanded={active === app.slug}
              aria-label={`Xem khu vực ${app.name}`}
            />
            <Link className="districtBanner" href={`/ecosystem/${app.slug}/`}>
              <strong>{app.name}</strong>
              <small>{app.tagline}</small>
            </Link>
          </div>
        ))}
      </div>

      <aside className="mapScroll mapScrollRight" aria-hidden="true">
        <span>ÂM DƯƠNG<br />HÒA HỢP</span>
        <small>CON NGƯỜI<br />VỚI THIÊN NHIÊN</small>
        <em>Đông y dưỡng sinh<br />Sống khỏe · Sống đẹp<br />Cùng HIU</em>
      </aside>

      <nav className="quickDock heritageQuickDock" aria-label="Khám phá nhanh">
        {ecosystemApps.map((app) => (
          <Link href={`/ecosystem/${app.slug}/`} key={app.slug}>{app.shortName}</Link>
        ))}
      </nav>
    </div>
  );
}
