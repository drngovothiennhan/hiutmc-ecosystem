"use client";

import EcosystemMap from "@/components/EcosystemMap";
import DailyMissions from "@/components/DailyMissions";
import DisplayModeToggle from "@/components/DisplayModeToggle";
import { useHubRegistry } from "@/components/hub-registry";
import { ecosystemPrinciples, learningPaths } from "@/data/community";

const portalCards = [
  { href: "#about", eyebrow: "Giới thiệu", title: "Về HIU YHCT", body: "Không gian chung của câu lạc bộ và hệ sinh thái học tập." },
  { href: "#ecosystem", eyebrow: "Ứng dụng nổi bật", title: "Khám phá hệ sinh thái", body: "Đi trực tiếp đến Study OS, Thiệt Chẩn, Trung Y Văn và 3D Atlas." },
  { href: "#community", eyebrow: "Tin tức / Hoạt động", title: "Hành trình phát triển", body: "Theo dõi định hướng học thuật, cộng đồng và các sản phẩm đang xây dựng." },
  { href: "#community", eyebrow: "Liên hệ", title: "Kết nối & đồng hành", body: "Trở lại cổng chung để tiếp tục khám phá và tham gia cộng đồng." },
];

export default function Home() {
  const ecosystemApps = useHubRegistry();
  const studyOsUrl = ecosystemApps.find((app) => app.slug === "study-os")?.currentUpstreamUrl ?? "/learn/";
  const atlasUrl = ecosystemApps.find((app) => app.slug === "atlas")?.currentUpstreamUrl ?? "/ecosystem/atlas/";
  return (
    <main className="tmcHome">
      <a className="skipLink" href="#ecosystem">Bỏ qua đến nội dung chính</a>

      <section id="top" className="heritageMasthead approvedHero" aria-label="HIU Y học cổ truyền">
        <div className="approvedHeroCopy">
          <div className="approvedHeroBrand"><span className="approvedHeroDot" /> CÂU LẠC BỘ Y HỌC CỔ TRUYỀN HIU</div>
          <h1>Học tinh hoa YHCT.<br /><em>Kết nối tương lai số.</em></h1>
          <p>Một cổng chung để sinh viên khám phá không gian học tập, công cụ và học liệu của HIU YHCT.</p>
          <div className="approvedHeroActions">
            <a className="approvedHeroPrimary" href="#ecosystem">Khám phá ứng dụng <span aria-hidden="true">→</span></a>
            <a className="approvedHeroLight" href={studyOsUrl}>Đăng nhập thành viên <span aria-hidden="true">↗</span></a>
            <a className="approvedHeroOutline" href="#community">Kết nối CLB <span aria-hidden="true">↗</span></a>
          </div>
          <small className="approvedHeroNote">Dùng tài khoản HIU YHCT Study OS hiện có để đăng nhập thành viên.</small>
        </div>
        <div className="approvedHeroArt" aria-hidden="true">
          <div className="heroOrbit heroOrbitOne" /><div className="heroOrbit heroOrbitTwo" />
          <div className="heroSeal"><span>陰</span><i>☯</i><span>陽</span></div>
          <div className="heroBotanical"><span>草木</span><b>本草 · 經絡 · 養生</b><small>TRI THỨC · THIÊN NHIÊN · CON NGƯỜI</small></div>
          <span className="heroSpark heroSparkOne">✦</span><span className="heroSpark heroSparkTwo">✧</span>
        </div>
      </section>

      <header className="heritageNav">
        <a className="navBrand" href="#top">
          <img className="navLeaf" src="/hiu-club-logo.webp" width="68" height="46" alt="Logo Câu lạc bộ Y học cổ truyền HIU" />
          <span>HIU TMC ECOSYSTEM</span>
        </a>
        <nav className="desktopNav" aria-label="Điều hướng chính">
          <a href="#top">Trang chủ</a>
          <a href="#ecosystem">Ứng dụng</a>
          <a href="#about">Giới thiệu</a>
          <a href="#community">Liên hệ</a>
          <a href="/admin/">Admin Center</a>
        </nav>
        <div className="heritageNavActions"><a className="heritageMemberLogin" href={studyOsUrl}>Đăng nhập thành viên ↗</a><DisplayModeToggle /><a className="communityBadge" href="#community">Vì sức khỏe cộng đồng</a></div>
        <details className="mobileMenu">
          <summary aria-label="Mở điều hướng">☰</summary>
          <div className="mobileMenuPanel">
            <a href="#top">Trang chủ</a>
            <a href="#ecosystem">Ứng dụng</a>
            <a href="#about">Giới thiệu</a>
            <a href="#community">Liên hệ</a>
            <a href="/admin/">Admin Center</a>
          </div>
        </details>
      </header>

      <section id="map" className="heritageHeroFrame">
        <div className="heroTitleRow">
          <span className="brushMark">✦</span>
          <strong>BẢN ĐỒ HỆ SINH THÁI HIU Y HỌC CỔ TRUYỀN</strong>
          <span className="heroWhisper">Bản đồ nhỏ, những giá trị lớn</span>
        </div>

        <EcosystemMap />

        <div className="portalCards" aria-label="Khám phá nhanh">
          {portalCards.map((card, index) => (
            <a className="portalCard" href={card.href} key={card.eyebrow}>
              <span className={`portalThumb portalThumb${index}`} aria-hidden="true" />
              <span>
                <small>{card.eyebrow}</small>
                <strong>{card.title}</strong>
                <em>{card.body}</em>
              </span>
              <b aria-hidden="true">→</b>
            </a>
          ))}
        </div>
      </section>

      <DailyMissions apps={ecosystemApps} />

      <section id="ecosystem" className="heritageSection">
        <div className="sectionHeading">
          <p className="sectionKicker">Bốn địa danh học tập</p>
          <h2>Mỗi khu vực là một cánh cửa vào hệ sinh thái HIU TMC.</h2>
        </div>
        <div className="appGrid heritageAppGrid">
          {ecosystemApps.map((app, index) => (
            <article className="appCard heritageAppCard" key={app.slug}>
              <div className={`districtThumbnail districtThumbnail${index}`} aria-hidden="true" />
              <span>{app.status}</span>
              <h3>{app.name}</h3>
              <p>{app.description}</p>
              <a href={app.currentUpstreamUrl}>Mở ứng dụng →</a>
            </article>
          ))}
        </div>
      </section>

      <section id="about" className="heritageStory">
        <div>
          <p className="sectionKicker">Tinh thần chung</p>
          <h2>Từ cội nguồn Y học dân tộc đến tương lai số.</h2>
          <p>HIU TMC Ecosystem được xây như một “bản đồ học tập” để sinh viên nhìn thấy toàn cảnh trước khi đi sâu vào từng công cụ chuyên biệt.</p>
        </div>
        <ul className="principleList">
          {ecosystemPrinciples.map((item) => <li key={item}>{item}</li>)}
        </ul>
      </section>

      <section id="journey" className="heritageJourney">
        <div className="sectionHeading">
          <p className="sectionKicker">Hành trình học</p>
          <h2>Học – quan sát – tra cứu – trực quan hóa.</h2>
        </div>
        <div className="journeyGrid heritageJourneyGrid">
          {learningPaths.map((path, index) => (
            <article className="journeyCard heritageJourneyCard" key={path.title}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <h3>{path.title}</h3>
              <p>{path.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="community" className="heritageCommunity">
        <div className="communitySeal">☯</div>
        <p className="sectionKicker">Cộng đồng HIU YHCT</p>
        <h2>Học cùng nhau. Chia sẻ kinh nghiệm. Cùng xây dựng.</h2>
        <p className="communityLead">Chọn một cách tham gia phù hợp với bạn.</p>
        <div className="communityActionGrid">
          <a href={studyOsUrl}><small>01 · HỌC MỖI NGÀY</small><strong>Tiếp tục nhiệm vụ học tập</strong><span>Mở Study OS để vào học liệu và luyện tập.</span><b>Mở Study OS ↗</b></a>
          <a href="mailto:clb.yhoccotruyen.hiu@gmail.com?subject=Trao%20%C4%91%E1%BB%95i%20h%E1%BB%8Dc%20thu%E1%BA%ADt%20YHCT"><small>02 · TRAO ĐỔI HỌC THUẬT</small><strong>Gửi đề xuất cho Câu lạc bộ</strong><span>Chia sẻ câu hỏi, chủ đề hoặc tài liệu với CLB.</span><b>clb.yhoccotruyen.hiu@gmail.com ↗</b></a>
          <a href="https://www.tiktok.com/@hiu.clb.yhoccotruyen" target="_blank" rel="noreferrer"><small>03 · CẬP NHẬT HOẠT ĐỘNG</small><strong>Theo dõi kênh TikTok CLB</strong><span>Xem thông tin và nội dung hoạt động mới.</span><b>@hiu.clb.yhoccotruyen ↗</b></a>
        </div>
        <p className="clubLocation">CLB Y học cổ truyền · Trường Đại học Quốc tế Hồng Bàng (HIU) · 215 Điện Biên Phủ, phường Gia Định, Thành phố Hồ Chí Minh</p>
        <a className="heroCta" href="#map">Trở lại bản đồ ↑</a>
      </section>

      <footer className="heritageFooter">
        <strong>HIU TMC Ecosystem</strong>
        <span>TRI THỨC CỔ TRUYỀN · CÔNG NGHỆ HIỆN ĐẠI · VÌ MỘT CỘNG ĐỒNG KHỎE MẠNH HƠN</span>
      </footer>

      <nav className="approvedMobileTaskbar" aria-label="Điều hướng nhanh trên điện thoại">
        <a href="#top"><span aria-hidden="true">⌂</span><small>Trang chủ</small></a>
        <a href="#ecosystem"><span aria-hidden="true">▤</span><small>Ứng dụng</small></a>
        <a href="#journey"><span aria-hidden="true">◇</span><small>Nhiệm vụ</small></a>
        <a href={atlasUrl}><span aria-hidden="true">◎</span><small>Atlas 3D</small></a>
        <a href="#community"><span aria-hidden="true">◉</span><small>Cộng đồng</small></a>
      </nav>
    </main>
  );
}
