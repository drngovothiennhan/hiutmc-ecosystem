"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { MemberAccount, MemberAuthProvider, useMemberAuth } from "@/components/MemberAuthBridge";
import { useHubRegistry } from "@/components/hub-registry";
import styles from "./library.module.css";

const DEFAULT_STUDYOS_API = "https://study.hiutmc.com/api/knowledge";
const PDFJS_VERSION = "3.11.174";
const PDFJS_SCRIPT = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS_VERSION}/pdf.min.js`;
const PDFJS_WORKER = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS_VERSION}/pdf.worker.min.js`;

type Resource = {
  resourceKey: string;
  title: string;
  resourceType: string;
  mimeType: string;
  updatedAt: string;
};
type PdfDocument = {
  numPages: number;
  getPage: (number: number) => Promise<{
    getViewport: (options: { scale: number }) => { width: number; height: number };
    render: (options: { canvasContext: CanvasRenderingContext2D; viewport: { width: number; height: number } }) => { promise: Promise<void>; cancel: () => void };
  }>;
  destroy: () => Promise<void>;
};
type PdfLoadingTask = { promise: Promise<PdfDocument>; destroy: () => void };
type PdfJs = {
  GlobalWorkerOptions: { workerSrc: string };
  getDocument: (options: Record<string, unknown>) => PdfLoadingTask;
};
declare global {
  interface Window { pdfjsLib?: PdfJs; }
}

let pdfJsLoad: Promise<PdfJs> | null = null;
function loadPdfJs(): Promise<PdfJs> {
  if (window.pdfjsLib) return Promise.resolve(window.pdfjsLib);
  if (!pdfJsLoad) {
    pdfJsLoad = new Promise((resolve, reject) => {
      const existing = document.querySelector<HTMLScriptElement>('script[data-pdfjs="true"]');
      const script = existing || document.createElement("script");
      const fail = () => { pdfJsLoad = null; reject(new Error("Không tải được trình đọc PDF.")); };
      script.addEventListener("load", () => window.pdfjsLib ? resolve(window.pdfjsLib) : fail(), { once: true });
      script.addEventListener("error", fail, { once: true });
      if (!existing) {
        script.src = PDFJS_SCRIPT;
        script.async = true;
        script.dataset.pdfjs = "true";
        document.head.appendChild(script);
      }
    });
  }
  return pdfJsLoad;
}

function LibraryReader({ resource, apiBase, onClose }: { resource: Resource; apiBase: string; onClose: () => void }) {
  const { getMemberAccessToken } = useMemberAuth();
  const frameRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [pdfDocument, setPdfDocument] = useState<PdfDocument | null>(null);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let live = true;
    let loadingTask: PdfLoadingTask | null = null;
    let loaded: PdfDocument | null = null;
    setBusy(true);
    setError("");
    setPage(1);
    setPdfDocument(null);
    void (async () => {
      try {
        const token = await getMemberAccessToken();
        if (!token) throw new Error("Phiên đăng nhập đã hết hạn. Hãy đăng nhập lại để tiếp tục đọc.");
        const pdfjs = await loadPdfJs();
        pdfjs.GlobalWorkerOptions.workerSrc = PDFJS_WORKER;
        const url = `${apiBase}/resources?action=reader&key=${encodeURIComponent(resource.resourceKey)}`;
        loadingTask = pdfjs.getDocument({
          url,
          httpHeaders: { Authorization: `Bearer ${token}` },
          withCredentials: false,
          disableStream: true,
          disableAutoFetch: true,
          rangeChunkSize: 65536,
        });
        loaded = await loadingTask.promise;
        if (live) {
          setPdfDocument(loaded);
          setPages(loaded.numPages);
        } else {
          await loaded.destroy();
        }
      } catch (cause) {
        if (live) setError(cause instanceof Error ? cause.message : "Không mở được tài liệu.");
      } finally {
        if (live) setBusy(false);
      }
    })();
    return () => {
      live = false;
      loadingTask?.destroy();
      if (loaded) void loaded.destroy();
    };
  }, [resource.resourceKey, getMemberAccessToken]);

  useEffect(() => {
    if (!pdfDocument || !canvasRef.current) return;
    let live = true;
    let task: { promise: Promise<void>; cancel: () => void } | null = null;
    void (async () => {
      try {
        const pdfPage = await pdfDocument.getPage(page);
        if (!live || !canvasRef.current) return;
        const viewport = pdfPage.getViewport({ scale: zoom });
        const canvas = canvasRef.current;
        const context = canvas.getContext("2d");
        if (!context) throw new Error("Không thể hiển thị trang PDF.");
        const ratio = Math.max(1, Math.min(window.devicePixelRatio || 1, 2));
        canvas.width = Math.floor(viewport.width * ratio);
        canvas.height = Math.floor(viewport.height * ratio);
        canvas.style.width = `${viewport.width}px`;
        canvas.style.height = `${viewport.height}px`;
        context.setTransform(ratio, 0, 0, ratio, 0, 0);
        task = pdfPage.render({ canvasContext: context, viewport });
        await task.promise;
      } catch (cause) {
        if (live && !(cause instanceof Error && cause.name === "RenderingCancelledException")) {
          setError("Không thể kết xuất trang PDF.");
        }
      }
    })();
    return () => { live = false; task?.cancel(); };
  }, [pdfDocument, page, zoom]);

  const fullscreen = async () => {
    if (!frameRef.current) return;
    if (window.document.fullscreenElement) await window.document.exitFullscreen().catch(() => {});
    else await frameRef.current.requestFullscreen?.().catch(() => {});
  };

  return (
    <section className={styles.reader} ref={frameRef} aria-label={`Trình đọc ${resource.title}`}>
      <header className={styles.readerHeader}>
        <div><strong>{resource.title}</strong><small>Chỉ xem trực tuyến · Quyền truy cập được kiểm tra trên StudyOS</small></div>
        <button type="button" onClick={onClose} aria-label="Đóng trình đọc">Đóng</button>
      </header>
      <nav className={styles.controls} aria-label="Điều khiển tài liệu">
        <button type="button" onClick={() => setPage(value => Math.max(1, value - 1))} disabled={page <= 1 || busy}>Trang trước</button>
        <span>{pages ? `Trang ${page} / ${pages}` : "—"}</span>
        <button type="button" onClick={() => setPage(value => Math.min(pages, value + 1))} disabled={!pages || page >= pages || busy}>Trang sau</button>
        <button type="button" onClick={() => setZoom(value => Math.max(0.6, Math.round((value - 0.1) * 10) / 10))} disabled={busy} aria-label="Thu nhỏ">−</button>
        <span>{Math.round(zoom * 100)}%</span>
        <button type="button" onClick={() => setZoom(value => Math.min(2, Math.round((value + 0.1) * 10) / 10))} disabled={busy} aria-label="Phóng to">+</button>
        <button type="button" onClick={() => void fullscreen()}>Toàn màn hình</button>
      </nav>
      <div className={styles.canvasViewport}>
        {busy && <p role="status">Đang mở tài liệu…</p>}
        {error && <p className={styles.error} role="alert">{error}</p>}
        {!error && <canvas ref={canvasRef} aria-label={`Trang ${page} của ${resource.title}`} />}
      </div>
    </section>
  );
}

function LibraryGateway() {
  const apps = useHubRegistry();
  const { member, ready, openStudyOs, getMemberAccessToken } = useMemberAuth();
  const [items, setItems] = useState<Resource[]>([]);
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<Resource | null>(null);
  const [revision, setRevision] = useState(0);
  const studyOs = apps.find((app) => app.slug === "study-os");
  const apiBase = (() => {
    try { return new URL(studyOs?.currentUpstreamUrl || "https://study.hiutmc.com/").origin + "/api/knowledge"; }
    catch { return DEFAULT_STUDYOS_API; }
  })();
  const studyOsUrl = (() => {
    try {
      const target = new URL(studyOs?.currentUpstreamUrl || "https://study.hiutmc.com/");
      target.pathname = "/research";
      target.search = "";
      target.hash = "";
      return target.toString();
    } catch {
      return "https://study.hiutmc.com/research";
    }
  })();

  useEffect(() => {
    let live = true;
    if (!member) { setItems([]); setBusy(false); setError(""); return; }
    const controller = new AbortController();
    setBusy(true);
    setError("");
    void (async () => {
      try {
        const token = await getMemberAccessToken();
        if (!token) throw new Error("Phiên đăng nhập đã hết hạn. Hãy đăng nhập lại.");
        const response = await fetch(`${apiBase}/resources?limit=100`, {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
          signal: controller.signal,
        });
        const body = await response.json().catch(() => null) as { ok?: boolean; data?: Resource[]; error?: string } | null;
        if (!response.ok || !body?.ok || !Array.isArray(body.data)) throw new Error(body?.error || "Chưa tải được danh mục tài liệu.");
        if (live) setItems(body.data.filter(row => row?.resourceType === "document" && row?.mimeType === "application/pdf"));
      } catch (cause) {
        if (live && !controller.signal.aborted) setError(cause instanceof Error ? cause.message : "Chưa tải được danh mục tài liệu.");
      } finally {
        if (live) setBusy(false);
      }
    })();
    return () => { live = false; controller.abort(); };
  }, [member?.id, getMemberAccessToken, revision]);

  const visible = useMemo(() => items.filter(item => item.title.toLocaleLowerCase("vi").includes(query.trim().toLocaleLowerCase("vi"))), [items, query]);

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <a href="/" className={styles.back}>← HIU TMC Ecosystem</a>
        <MemberAccount studyOsUrl={studyOsUrl} />
      </header>
      <section className={styles.panel}>
        <span className={styles.kicker}>HIU TMC · STUDY OS</span>
        <h1>Thư viện học liệu</h1>
        <p className={styles.lead}>Danh mục chỉ hiển thị tài liệu PDF đã phát hành cho thành viên. StudyOS kiểm tra phiên, quyền truy cập và trạng thái xuất bản mỗi lần mở tài liệu.</p>
        {!member ? (
          <div className={styles.info}>
            <span aria-hidden="true">▤</span>
            <div><strong>Đăng nhập thành viên</strong><p>Thư viện dùng phiên thành viên hiện có giữa Hub và StudyOS.</p></div>
            <button className={styles.primary} type="button" onClick={() => void openStudyOs(studyOsUrl)} disabled={!ready}>Đăng nhập hoặc mở StudyOS →</button>
          </div>
        ) : (
          <>
            <div className={styles.libraryTools}>
              <label>Tìm tài liệu<input value={query} onChange={event => setQuery(event.target.value)} placeholder="Nhập tên tài liệu…" maxLength={200} /></label>
              <button type="button" onClick={() => setRevision(value => value + 1)} disabled={busy}>Làm mới</button>
            </div>
            {busy ? <p role="status">Đang tải danh mục…</p> : error ? <p className={styles.error} role="alert">{error}</p> : visible.length ? (
              <ul className={styles.list}>{visible.map(item => (
                <li key={item.resourceKey}>
                  <div><strong>{item.title}</strong><small>{item.mimeType}{item.updatedAt && !Number.isNaN(Date.parse(item.updatedAt)) ? ` · ${new Date(item.updatedAt).toLocaleDateString("vi-VN")}` : ""}</small></div>
                  <button type="button" onClick={() => setSelected(item)}>Mở để xem</button>
                </li>
              ))}</ul>
            ) : <p>{items.length ? "Không tìm thấy tài liệu phù hợp." : "Chưa có tài liệu PDF được phát hành cho thành viên."}</p>}
            {selected && <LibraryReader resource={selected} apiBase={apiBase} onClose={() => setSelected(null)} />}
          </>
        )}
      </section>
    </main>
  );
}

export default function LibraryPage() {
  return <MemberAuthProvider><LibraryGateway /></MemberAuthProvider>;
}
