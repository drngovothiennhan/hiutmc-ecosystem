"use client";

import { useEffect, useMemo, useState } from "react";
import type { EcosystemApp } from "@/data/apps";
import {
  currentStreak,
  earnedPoints,
  localDayKey,
  longestStreak,
  missionCatalog,
  normalizeProgress,
  selectMissionsForDay,
  weeklyMissionCount,
  type LearningProgress,
} from "@/data/learning-progress";

const STORAGE_KEY = "hiutmc-learning-progress-v1";

export default function DailyMissions({ apps }: { apps: EcosystemApp[] }) {
  const [progress, setProgress] = useState<LearningProgress>({ completions: [] });
  const [dayKey, setDayKey] = useState("");
  const [savedLocally, setSavedLocally] = useState(true);

  useEffect(() => {
    setDayKey(localDayKey(new Date()));
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setProgress(normalizeProgress(JSON.parse(raw)));
    } catch {
      setSavedLocally(false);
    }
  }, []);

  const missions = useMemo(() => selectMissionsForDay(dayKey), [dayKey]);
  const completedIds = useMemo(() => new Set(progress.completions.filter((item) => item.day === dayKey).map((item) => item.missionId)), [progress, dayKey]);
  const doneToday = completedIds.size;
  const streak = currentStreak(progress.completions, dayKey);
  const weeklyCount = weeklyMissionCount(progress.completions, dayKey);
  const points = earnedPoints(progress.completions);
  const visitedHubs = new Set(progress.completions.map((item) => missionCatalog.find((mission) => mission.id === item.missionId)?.hubSlug).filter(Boolean)).size;
  const badges = [
    { title: "Bước đầu tiên", detail: "Hoàn thành nhiệm vụ đầu tiên", earned: progress.completions.length > 0 },
    { title: "Bền bỉ 3 ngày", detail: "Từng giữ chuỗi học liên tục 3 ngày", earned: longestStreak(progress.completions) >= 3 },
    { title: "Thử thách tuần", detail: "Hoàn thành 5 nhiệm vụ trong tuần", earned: weeklyCount >= 5 },
    { title: "Khám phá đa Hub", detail: "Học qua ít nhất 3 Hub", earned: visitedHubs >= 3 },
  ];

  const toggleMission = (missionId: string) => {
    if (!dayKey) return;
    const key = `${dayKey}|${missionId}`;
    const exists = progress.completions.some((item) => `${item.day}|${item.missionId}` === key);
    const next: LearningProgress = {
      completions: exists
        ? progress.completions.filter((item) => `${item.day}|${item.missionId}` !== key)
        : [...progress.completions, { day: dayKey, missionId }].slice(-1200),
    };
    setProgress(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      window.dispatchEvent(new CustomEvent("hiutmc:learning-progress-changed", { detail: next }));
      setSavedLocally(true);
    } catch {
      setSavedLocally(false);
    }
  };

  return <section className="dailyMissions" aria-labelledby="daily-missions-title">
    <header className="missionHeader">
      <div><p className="sectionKicker">HỌC MỘT CHÚT MỖI NGÀY</p><h2 id="daily-missions-title">Nhiệm vụ hôm nay</h2><p>Chọn việc nhỏ, hoàn thành đều đặn, khám phá thêm một Hub.</p></div>
      <span className="localProgressLabel">Tiến độ cá nhân · lưu trên thiết bị</span>
    </header>

    <div className="missionStats" aria-label="Tiến độ học tập cá nhân">
      <article><span aria-hidden="true">✦</span><small>ĐIỂM TRẢI NGHIỆM</small><strong>{points}</strong><em>chỉ số tự theo dõi</em></article>
      <article><span aria-hidden="true">♨</span><small>CHUỖI NGÀY HỌC</small><strong>{streak}<i> ngày</i></strong><em>hoàn thành ít nhất một nhiệm vụ</em></article>
      <article><span aria-hidden="true">✓</span><small>HÔM NAY</small><strong>{doneToday}<i> / 3</i></strong><em>{missions.length ? "nhiệm vụ đã đánh dấu" : "đang tải nhiệm vụ"}</em></article>
    </div>

    <div className="missionGrid">
      {missions.map((mission, index) => {
        const app = apps.find((item) => item.slug === mission.hubSlug);
        const done = completedIds.has(mission.id);
        return <article className={`missionCard${done ? " isDone" : ""}`} key={mission.id}>
          <div className="missionNumber">0{index + 1}</div>
          <div className="missionCopy"><div className="missionNameRow"><h3>{mission.title}</h3><span>+{mission.points} XP</span></div><p>{mission.detail}</p><div className="missionActions">
            <a href={app?.launchUrl ?? "/ecosystem/"} target="_blank" rel="noreferrer">Mở {app?.shortName ?? "Hub"} ↗</a>
            <button type="button" onClick={() => toggleMission(mission.id)} disabled={!dayKey} aria-pressed={done}>{done ? "✓ Đã hoàn thành" : "Đánh dấu hoàn tất"}</button>
          </div></div>
        </article>;
      })}
    </div>

    <div className="missionLowerGrid">
      <section className="weeklyChallenge" aria-labelledby="weekly-challenge-title">
        <div className="weeklyChallengeTop"><div><p className="sectionKicker">MỤC TIÊU 7 NGÀY</p><h3 id="weekly-challenge-title">Thử thách tuần</h3></div><span>{Math.min(weeklyCount, 5)} / 5</span></div>
        <p>Hoàn thành 5 nhiệm vụ bất kỳ trong tuần để mở huy hiệu “Thử thách tuần”.</p>
        <progress value={Math.min(weeklyCount, 5)} max={5} aria-label={`${Math.min(weeklyCount, 5)} trên 5 nhiệm vụ tuần`} />
      </section>
      <section className="badgePanel" aria-labelledby="badge-panel-title">
        <div className="weeklyChallengeTop"><div><p className="sectionKicker">GHI NHẬN HÀNH TRÌNH</p><h3 id="badge-panel-title">Huy hiệu khám phá</h3></div><span>{badges.filter((badge) => badge.earned).length} / {badges.length}</span></div>
        <div className="badgeList">{badges.map((badge) => <div className={`badgeItem${badge.earned ? " earned" : ""}`} key={badge.title}><span aria-hidden="true">{badge.earned ? "✦" : "◇"}</span><div><strong>{badge.title}</strong><small>{badge.detail}</small></div></div>)}</div>
      </section>
    </div>

    <p className="missionDisclosure" role="status">{savedLocally ? "Nhiệm vụ, điểm và huy hiệu chỉ lưu trên trình duyệt đang dùng; chưa đồng bộ với tài khoản thành viên." : "Trình duyệt không cho phép lưu dữ liệu; tiến độ chỉ còn trong phiên này."} Điểm trải nghiệm không phải điểm môn học. Bảng thi đua nhóm sẽ chỉ mở khi có dữ liệu thành viên đã xác thực; hiện không hiển thị tên hoặc điểm giả.</p>
  </section>;
}
