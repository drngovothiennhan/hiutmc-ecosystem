"use client";

import { useEffect, useState } from "react";
import { ecosystemApps } from "@/data/apps";

export default function EcosystemMap() {
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setPaused(media.matches);
    update(); media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  useEffect(() => {
    document.documentElement.dataset.motion = paused ? "off" : "on";
    return () => { delete document.documentElement.dataset.motion; };
  }, [paused]);
  return (
    <div className="heritageMapWrap">
      <div className="mapStage heritageMapStage" aria-label="Bản đồ học viện HIU: bốn khu vực học tập">
        <picture><source media="(max-width: 700px)" srcSet="/academy-mobile.webp" type="image/webp" /><source srcSet="/academy-world.webp" type="image/webp" /><img className="mapArtwork" src="/ecosystem-map-art.svg" alt="Học viện giữa núi mây: bốn đảo học tập nối bằng cầu đá quanh quảng trường âm dương, thác nước và vườn hoa" fetchPriority="high" /></picture>
        <div className="mapAtmosphere" aria-hidden="true"><i className="mist mistOne" /><i className="mist mistTwo" /><i className="lightPool lightAI" /><i className="lightPool lightAtlas" />{Array.from({length:12},(_,i)=><i key={i} className="petal" style={{left:`${8+i*7.5}%`,animationDelay:`${-i*2.7}s`,animationDuration:`${18+i%4*3}s`}} />)}</div>
        <aside className="mapScroll mapScrollLeft" aria-hidden="true"><span>Y<br />học<br />cổ<br />truyền</span><small>Gìn giữ tinh hoa<br />Lan tỏa giá trị<br />Kiến tạo tương lai</small></aside>
        <aside className="mapScroll mapScrollRight" aria-hidden="true"><span>ÂM DƯƠNG<br />HÒA HỢP</span><small>CON NGƯỜI<br />VỚI THIÊN NHIÊN</small><em>Đông y<br />dưỡng sinh<br />Sống khỏe<br />Sống đẹp<br />cùng HIU</em></aside>
        <span className="plazaLabel" aria-hidden="true">HIU</span>
        {ecosystemApps.map((app) => (
          <div className={`districtMarker district-${app.slug}`} key={app.slug} style={{left:`${app.x}%`,top:`${app.y}%`,["--accent" as string]:app.accent}}>
            <a className="districtBanner" href={app.currentUpstreamUrl} aria-label={`Mở ${app.name}`}><strong>{app.name}</strong><small>{app.tagline}</small></a>
          </div>
        ))}
        <div className="heroStatement"><p className="heroEyebrow">HỌC · HIỂU · KẾT NỐI</p><h1>Khám phá hệ sinh thái số của<br />Câu lạc bộ Y học cổ truyền HIU</h1><a className="heroCta" href="#ecosystem">Khám phá ngay →</a></div>
        <button className="motionToggle" onClick={()=>setPaused(!paused)} aria-pressed={paused}>{paused?"▷ Bật chuyển động":"Ⅱ Tạm dừng chuyển động"}</button>
      </div>
      <nav className="quickDock heritageQuickDock" aria-label="Vào nhanh bốn ứng dụng">{ecosystemApps.map(app=><a href={app.currentUpstreamUrl} key={app.slug}>{app.shortName} <span aria-hidden="true">↗</span></a>)}</nav>
    </div>
  );
}
