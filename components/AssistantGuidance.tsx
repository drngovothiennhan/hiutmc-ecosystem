"use client";

import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import { ecosystemApps } from "@/data/apps";
import {
  buildContextCards, chooseNudge, greetingFor, routeQuestion,
  type GuidanceInput, type QuickAskResult,
} from "@/data/assistant-guidance";
import { StudyOsLink, useMemberAuth } from "./MemberAuthBridge";
import { useFeatureFlag } from "./useFeatureFlag";
import styles from "./AssistantGuidance.module.css";

/**
 * Smarter companion guidance, three independent capabilities behind three feature flags that all ship OFF:
 *   assistant-context   -> "what to do next" cards from the member's real progress
 *   assistant-quick-ask -> a typed question is routed to the right app (no AI, no credits)
 *   assistant-nudges    -> one calm reminder per kind per day
 * With every flag OFF this renders nothing, so the approved companion is unchanged.
 * `mode="chip"` is the small reminder above the launcher; `mode="panel"` lives inside the open panel.
 */
type Props = {
  mode: "chip" | "panel";
  total: number;
  remaining: number;
  nextMission: { title: string; hubSlug: string } | null;
  streak: number;
  weeklyCount: number;
  onOpenPanel?: () => void;
};

const SEEN_KEY = "hiutmc-assistant-nudges-v1";
const SEEN_EVENT = "hiutmc:assistant-nudge-seen";

function todayKey(now: Date) {
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

function readSeen(day: string): string[] {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(SEEN_KEY) || "null") as { day?: string; kinds?: unknown } | null;
    if (parsed?.day === day && Array.isArray(parsed.kinds)) return parsed.kinds.filter((kind): kind is string => typeof kind === "string");
  } catch {}
  return [];
}

function markSeen(day: string, kind: string) {
  try {
    const kinds = [...new Set([...readSeen(day), kind])];
    window.localStorage.setItem(SEEN_KEY, JSON.stringify({ day, kinds }));
  } catch {}
  window.dispatchEvent(new Event(SEEN_EVENT));
}

function AppLink({ href, className, children }: { href: string; className?: string; children: ReactNode }) {
  const isStudy = href === ecosystemApps.find((app) => app.slug === "study-os")?.launchUrl;
  return isStudy
    ? <StudyOsLink href={href} className={className}>{children}</StudyOsLink>
    : <a href={href} className={className} data-app-transition>{children}</a>;
}

export default function AssistantGuidance({ mode, total, remaining, nextMission, streak, weeklyCount, onOpenPanel }: Props) {
  const { personalLearningSnapshot, accessToken } = useMemberAuth();
  const context = useFeatureFlag("assistant-context", { accessToken });
  const quickAsk = useFeatureFlag("assistant-quick-ask", { accessToken });
  const nudges = useFeatureFlag("assistant-nudges", { accessToken });
  const [now, setNow] = useState<Date | null>(null);
  const [seen, setSeen] = useState<string[]>([]);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<QuickAskResult | null>(null);

  useEffect(() => {
    const tick = () => setNow(new Date());
    tick();
    const timer = window.setInterval(tick, 5 * 60_000);
    return () => window.clearInterval(timer);
  }, []);

  const day = now ? todayKey(now) : "";
  useEffect(() => {
    if (!day) return;
    const sync = () => setSeen(readSeen(day));
    sync();
    window.addEventListener(SEEN_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(SEEN_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, [day]);

  const input: GuidanceInput | null = useMemo(() => now ? {
    now, total, remaining, nextMission, streak, weeklyCount, snapshot: personalLearningSnapshot,
  } : null, [now, total, remaining, nextMission, streak, weeklyCount, personalLearningSnapshot]);

  const cards = useMemo(() => (context && input ? buildContextCards(input, ecosystemApps) : []), [context, input]);
  const nudge = useMemo(() => (nudges && input ? chooseNudge(input, seen, ecosystemApps) : null), [nudges, input, seen]);

  // Opening the panel counts as having seen today's reminder, so it never nags a second time.
  useEffect(() => {
    if (mode === "panel" && nudge && day) markSeen(day, nudge.kind);
  }, [mode, nudge?.kind, day]);

  if (!context && !quickAsk && !nudges) return null;

  if (mode === "chip") {
    if (!nudge) return null;
    return (
      <div className={styles.chip} role="status" aria-live="polite">
        <button type="button" className={styles.chipText} onClick={onOpenPanel}>{nudge.text}</button>
        {nudge.href && <AppLink href={nudge.href} className={styles.chipGo}>Mở</AppLink>}
        <button type="button" className={styles.chipClose} aria-label="Để sau" onClick={() => markSeen(day, nudge.kind)}>×</button>
      </div>
    );
  }

  const submit = (event: FormEvent) => {
    event.preventDefault();
    setAnswer(routeQuestion(question, ecosystemApps));
  };

  return (
    <div className={styles.block}>
      {context && now && (cards.length > 0) && (
        <section aria-label="Gợi ý cho bạn">
          <h3 className={styles.title}>{greetingFor(now)} · gợi ý cho bạn</h3>
          <ul className={styles.cards}>
            {cards.map((card) => (
              <li key={card.id}>
                <div><strong>{card.title}</strong><small>{card.detail}</small></div>
                {card.href && <AppLink href={card.href} className={styles.go}>Mở</AppLink>}
              </li>
            ))}
          </ul>
        </section>
      )}
      {quickAsk && (
        <section aria-label="Hỏi nhanh">
          <h3 className={styles.title}>Hỏi nhanh: bạn muốn tìm gì?</h3>
          <form className={styles.ask} onSubmit={submit}>
            <input
              type="text"
              value={question}
              maxLength={120}
              placeholder="Ví dụ: huyệt Hợp Cốc, vị thuốc nhân sâm…"
              aria-label="Câu hỏi hoặc từ khóa"
              onChange={(event) => { setQuestion(event.target.value); if (!event.target.value.trim()) setAnswer(null); }}
            />
            <button type="submit" disabled={!question.trim()}>Tìm</button>
          </form>
          {answer && (
            <ul className={styles.cards} aria-live="polite">
              {answer.routes.map((route) => (
                <li key={route.slug}>
                  <div><strong>{route.title}</strong><small>Phù hợp để {route.why}.</small></div>
                  <AppLink href={route.href} className={styles.go}>Mở</AppLink>
                </li>
              ))}
              <li>
                <div><strong>Tìm trong toàn hệ sinh thái</strong><small>Xem mọi kết quả khớp với “{question.trim().slice(0, 40)}”.</small></div>
                <a href={answer.searchHref} className={styles.go}>Tìm</a>
              </li>
            </ul>
          )}
          <small className={styles.note}>Ô này chỉ chỉ đường tới đúng ứng dụng; không phải lời khuyên y khoa.</small>
        </section>
      )}
    </div>
  );
}
