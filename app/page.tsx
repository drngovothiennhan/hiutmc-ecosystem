import EcosystemMap from "@/components/EcosystemMap";
import { ecosystemApps } from "@/data/apps";
import { ecosystemPrinciples, learningPaths } from "@/data/community";

const portalCards = [
  { href: "#about", eyebrow: "Giới thiệu", title: "Về HIU YHCT", body: "Không gian chung của câu lạc bộ và hệ sinh thái học tập." },
  { href: "#ecosystem", eyebrow: "Ứng dụng nổi bật", title: "Khám phá hệ sinh thái", body: "Đi trực tiếp đến Study OS, Thiệt Chẩn, Trung Y Văn và 3D Atlas." },
  { href: "#community", eyebrow: "Tin tức / Hoạt động", title: "Hành trình phát triển", body: "Theo dõi định hướng học thuật, cộng đồng và các sản phẩm đang xây dựng." },
  { href: "#community", eyebrow: "Liên hệ", title: "Kết nối & đồng hành", body: "Trở lại cổng chung để tiếp tục khám phá và tham gia cộng đồng." },
];

export default function Home() {
  return (
    <main className="tmcHome">
      <a className="skipLink" href="#ecosystem">Bỏ qua đến nội dung chính</a>

      <section className="heritageMasthead" aria-label="HIU Y học cổ truyền">
        <div className="heritageBrand">
          <span className="heritageHIU">HIU</span>
          <span className="heritageClub">Câu lạc bộ<br />Y học cổ truyền</span>
        </div>
        <p className="heritageSlogan">Kết nối tinh hoa Y học cổ truyền<br />trong kỷ nguyên số</p>
        <div className="heritagePlaque">
          <strong>CON NGƯỜI</strong>
          <span>THIÊN NHIÊN · TRI THỨC</span>
          <small>Vì một cộng đồng khỏe mạnh hơn</small>
        </div>
      </section>

      <header className="heritageNav">
        <a className="navBrand" href="#top">
          <img className="navLeaf" src="/favicon.svg" width="38" height="38" alt="" />
          <span>HIU TMC ECOSYSTEM</span>
        </a>
        <nav className="desktopNav" aria-label="Điều hướng chính">
          <a href="#top">Trang chủ</a>
          <a href="#ecosystem">Ứng dụng</a>
          <a href="#about">Giới thiệu</a>
          <a href="#community">Liên hệ</a>
        </nav>
        <a className="communityBadge" href="#community">Vì sức khỏe cộng đồng</a>
        <details className="mobileMenu">
          <summary aria-label="Mở điều hướng">☰</summary>
          <div className="mobileMenuPanel">
            <a href="#top">Trang chủ</a>
            <a href="#ecosystem">Ứng dụng</a>
            <a href="#about">Giới thiệu</a>
            <a href="#community">Liên hệ</a>
          </div>
        </details>
      </header>

      <section id="top" className="heritageHeroFrame">
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
              <a href={`/ecosystem/${app.slug}/`}>Bước vào khu vực →</a>
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
        <p>Trang chủ là điểm quay về chung của các ứng dụng, hoạt động học thuật và những sản phẩm số đang phát triển trong câu lạc bộ.</p>
        <a className="heroCta" href="#top">Trở lại bản đồ ↑</a>
      </section>

      <footer className="heritageFooter">
        <strong>HIU TMC Ecosystem</strong>
        <span>TRI THỨC CỔ TRUYỀN · CÔNG NGHỆ HIỆN ĐẠI · VÌ MỘT CỘNG ĐỒNG KHỎE MẠNH HƠN</span>
      </footer>
    </main>
  );
}
