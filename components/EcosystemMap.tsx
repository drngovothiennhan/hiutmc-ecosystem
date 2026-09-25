"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { useHubRegistry } from "@/components/hub-registry";

export default function EcosystemMap() {
  const ecosystemApps = useHubRegistry();
  const [paused, setPaused] = useState(false);
  const [wind, setWind] = useState(0);
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
  useEffect(() => {
    if (paused) return;
    const changeWind = () => setWind(Math.round((Math.random() - 0.5) * 80));
    changeWind();
    const timer = window.setInterval(changeWind, 8200);
    return () => window.clearInterval(timer);
  }, [paused]);
  return (
    <div className="heritageMapWrap">
      <div className="mapStage heritageMapStage" aria-label="Bản đồ học viện HIU: bốn khu vực học tập">
        <picture><source media="(max-width: 700px)" srcSet="/academy-mobile.webp" type="image/webp" /><source srcSet="/academy-world.webp" type="image/webp" /><img className="mapArtwork" src="/ecosystem-map-art.svg" alt="Học viện giữa núi mây: bốn đảo học tập nối bằng cầu đá quanh quảng trường âm dương, thác nước và vườn hoa" fetchPriority="high" /></picture>
        <div className="mapAtmosphere" aria-hidden="true"><i className="mist mistOne" /><i className="mist mistTwo" /><i className="cloud cloudOne" /><i className="cloud cloudTwo" /><i className="lightPool lightAI" /><i className="lightPool lightAtlas" />{Array.from({length:16},(_,i)=><i key={i} className={i%3===0?"fallingLeaf":"petal"} style={{left:`${5+i*5.8}%`,animationDelay:`${-i*2.1}s`,animationDuration:`${17+i%5*3}s`,["--wind-x" as string]:`${wind+(i%3-1)*22}px`} as CSSProperties} />)}</div>
        <aside className="mapScroll mapScrollLeft" aria-hidden="true"><span>Y<br />học<br />cổ<br />truyền</span><small>Gìn giữ tinh hoa<br />Lan tỏa giá trị<br />Kiến tạo tương lai</small></aside>
        <aside className="mapScroll mapScrollRight" aria-hidden="true"><span>ÂM DƯƠNG<br />HÒA HỢP</span><small>CON NGƯỜI<br />VỚI THIÊN NHIÊN</small><em>Đông y<br />dưỡng sinh<br />Sống khỏe<br />Sống đẹp<br />cùng HIU</em></aside>
        <span className="plazaLabel"><img src="/hiu-club-logo.webp" alt="Logo Câu lạc bộ Y học cổ truyền HIU" /></span>
        {ecosystemApps.map((app) => (
          <div className={`districtMarker district-${app.slug}`} key={app.slug} style={{left:`${app.x}%`,top:`${app.y}%`,["--accent" as string]:app.accent}}>
            <a className="districtBanner" href={app.launchUrl} aria-label={`Mở ${app.name}`}><strong>{app.name}</strong><small>{app.tagline}</small></a>
          </div>
        ))}
        <div className="heroStatement"><p className="heroEyebrow">HỌC · HIỂU · KẾT NỐI</p><h1>Khám phá hệ sinh thái số của<br />Câu lạc bộ Y học cổ truyền HIU</h1><a className="heroCta" href="#ecosystem">Khám phá ngay →</a></div>
        <button className="motionToggle" onClick={()=>setPaused(!paused)} aria-pressed={paused}>{paused?"▷ Bật chuyển động":"Ⅱ Tạm dừng chuyển động"}</button>
      </div>
      <nav className="quickDock heritageQuickDock" aria-label="Vào nhanh bốn ứng dụng">{ecosystemApps.map(app=><a href={app.launchUrl} key={app.slug}>{app.shortName} <span aria-hidden="true">↗</span></a>)}</nav>
    </div>
  );
}
