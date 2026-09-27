export type ReviewCardProgress = {
  id: string;
  subject: string;
  topic: string;
  due: number;
  interval: number;
  streak: number;
  lastAttempt: string;
};

export type PersonalLearningSnapshot = {
  journey: {
    updatedAt: string;
    lastActiveDate: string;
    lastModule: string;
  };
  reviewCards: ReviewCardProgress[];
};

export type LearningPlan = {
  nextTitle: string;
  nextDetail: string;
  nextReason: "recent-activity" | "weak-topic" | "standard-path";
  summary: string[];
  summaryState: "ready" | "empty";
};

const text = (value: unknown, max = 180) => typeof value === "string" ? value.trim().slice(0, max) : "";

export function normalizePersonalLearningSnapshot(value: unknown): PersonalLearningSnapshot | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const raw = value as Record<string, unknown>;
  const journey = raw.journey && typeof raw.journey === "object" && !Array.isArray(raw.journey)
    ? raw.journey as Record<string, unknown>
    : {};
  const cards = Array.isArray(raw.reviewCards) ? raw.reviewCards : [];
  const reviewCards = cards.flatMap((item): ReviewCardProgress[] => {
    if (!item || typeof item !== "object" || Array.isArray(item)) return [];
    const card = item as Record<string, unknown>;
    const id = text(card.id, 160);
    const topic = text(card.topic, 180);
    const due = Number(card.due);
    const interval = Number(card.interval);
    const streak = Number(card.streak);
    if (!id || !topic || !Number.isFinite(due) || due < 0 || !Number.isFinite(interval) || interval < 0 || !Number.isInteger(streak) || streak < 0) return [];
    return [{
      id,
      subject: text(card.subject, 180),
      topic,
      due,
      interval,
      streak,
      lastAttempt: text(card.lastAttempt, 180),
    }];
  }).slice(0, 500);

  return {
    journey: {
      updatedAt: text(journey.updatedAt, 80),
      lastActiveDate: text(journey.lastActiveDate, 10),
      lastModule: text(journey.lastModule, 40),
    },
    reviewCards,
  };
}

function recentActivity(snapshot: PersonalLearningSnapshot, now: number): boolean {
  const updatedAt = Date.parse(snapshot.journey.updatedAt);
  return Boolean(snapshot.journey.lastModule && Number.isFinite(updatedAt) && updatedAt <= now && now - updatedAt <= 7 * 86_400_000);
}

function cardLabel(card: ReviewCardProgress): string {
  return card.subject ? `${card.subject} · ${card.topic}` : card.topic;
}

export function createLearningPlan(snapshot: PersonalLearningSnapshot | null, now = Date.now()): LearningPlan {
  if (!snapshot) {
    return {
      nextTitle: "Mở Study OS để tiếp tục lộ trình học",
      nextDetail: "Chưa có dữ liệu chi tiết để chỉ định bài học kế tiếp.",
      nextReason: "standard-path",
      summary: [],
      summaryState: "empty",
    };
  }

  const dueSoon = snapshot.reviewCards
    .filter((card) => card.due <= now + 3 * 86_400_000)
    .sort((a, b) => a.due - b.due);
  const weakest = snapshot.reviewCards
    .filter((card) => card.streak === 0 && Boolean(card.lastAttempt))
    .sort((a, b) => a.due - b.due);
  const active = recentActivity(snapshot, now);

  let nextTitle = "Mở Study OS để tiếp tục lộ trình học";
  let nextDetail = "Không có chủ đề cần củng cố hoặc hoạt động gần đây trong dữ liệu đã đồng bộ.";
  let nextReason: LearningPlan["nextReason"] = "standard-path";

  if (active) {
    nextTitle = "Tiếp tục hoạt động Study OS gần nhất";
    nextDetail = `Lần cập nhật tiến độ gần nhất: ${new Date(snapshot.journey.updatedAt).toLocaleString("vi-VN", { dateStyle: "medium", timeStyle: "short" })}. Dữ liệu hiện có chưa xác định bài học dở cụ thể.`;
    nextReason = "recent-activity";
  } else if (weakest[0]) {
    nextTitle = `Củng cố ${cardLabel(weakest[0])}`;
    nextDetail = "Thẻ ôn tập được đồng bộ ghi nhận streak 0 sau lượt gần nhất; mở Study OS để ôn lại nội dung nguồn.";
    nextReason = "weak-topic";
  }

  if (!snapshot.reviewCards.length) {
    return {
      nextTitle,
      nextDetail,
      nextReason,
      summary: [],
      summaryState: "empty",
    };
  }

  const dueTopics = [...new Set(dueSoon.map(cardLabel))].slice(0, 3);
  const weakTopics = [...new Set(weakest.map(cardLabel))].slice(0, 2);
  const summary: string[] = [];
  if (dueTopics.length) {
    summary.push(`Theo lịch ôn đã đồng bộ, các chủ đề đến hạn hoặc sắp đến hạn là: ${dueTopics.join(", ")}.`);
  }
  if (weakTopics.length) {
    summary.push(`Củng cố ${weakTopics.join(", ")}; thẻ ôn gần nhất đang có streak 0.`);
  }
  if (summary.length === 1 && dueTopics.length) {
    summary.push(weakTopics.length ? `Chủ đề cần củng cố: ${weakTopics.join(", ")}.` : "Dữ liệu thẻ ôn hiện chưa ghi nhận chủ đề có streak 0 sau lượt gần nhất.");
  } else if (summary.length === 1) {
    summary.push("Chưa có thẻ nào đến hạn trong 3 ngày tới theo lịch ôn đã đồng bộ.");
  }
  if (!summary.length) {
    summary.push("Các thẻ ôn đã đồng bộ chưa đến hạn trong 3 ngày tới và không ghi nhận chủ đề có streak 0.");
    summary.push("Bạn có thể tiếp tục lộ trình học trong Study OS; chưa có căn cứ để chỉ định một chủ đề ôn hôm nay.");
  }

  return { nextTitle, nextDetail, nextReason, summary, summaryState: "ready" };
}
