"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "@/app/admin/admin.module.css";

type MemberRow = { id: string; fullName: string; studentCode: string | null; role: string; status: string; loginEnabled: boolean };

const ROLE_LABEL: Record<string, string> = {
  guest: "Khách", member: "Thành viên", mod: "Mod", super_mod: "Super Mod", leader: "Leader", admin: "Admin",
};
const STATUS_LABEL: Record<string, string> = { pending: "Chờ duyệt", approved: "Đã duyệt", suspended: "Tạm khóa" };
const PAGE_SIZE = 25;

async function memberRequest(path: string, body?: unknown) {
  const response = await fetch(path, {
    method: body ? "POST" : "GET",
    cache: "no-store",
    headers: body ? { "content-type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await response.json().catch(() => null) as { error?: string; data?: unknown } | null;
  if (!response.ok) {
    const detail = data?.data && typeof data.data === "object" ? Object.values(data.data as Record<string, unknown>).filter((value) => typeof value === "string").join(" ") : "";
    throw new Error([data?.error, detail].filter(Boolean).join(" · ") || `Yêu cầu thất bại (${response.status}).`);
  }
  return data;
}

/** Admin-only: review members and grant or withdraw the Mod role. Only Member <-> Mod is offered. */
export default function StaffMembers({ ownMemberId }: { ownMemberId?: string }) {
  const [rows, setRows] = useState<MemberRow[] | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busyId, setBusyId] = useState("");
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [page, setPage] = useState(0);
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    let live = true;
    setError("");
    void memberRequest("/api/staff/members").then((result) => {
      const list = result?.data;
      if (live) setRows(Array.isArray(list) ? list as MemberRow[] : []);
    }).catch((reason: unknown) => {
      if (live) setError(reason instanceof Error ? reason.message : "Không tải được danh sách thành viên.");
    });
    return () => { live = false; };
  }, [refresh]);

  const counts = useMemo(() => {
    const result: Record<string, number> = {};
    for (const row of rows ?? []) result[row.role] = (result[row.role] ?? 0) + 1;
    return result;
  }, [rows]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return (rows ?? []).filter((row) => (roleFilter === "all" || row.role === roleFilter)
      && (!needle || row.fullName.toLowerCase().includes(needle) || (row.studentCode ?? "").toLowerCase().includes(needle)));
  }, [rows, query, roleFilter]);
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount - 1);
  const visible = filtered.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE);

  const changeRole = async (row: MemberRow, role: "mod" | "member") => {
    const verb = role === "mod" ? "cấp quyền Mod cho" : "gỡ quyền Mod của";
    if (!window.confirm(`Xác nhận ${verb} ${row.fullName}${row.studentCode ? ` (${row.studentCode})` : ""}?`)) return;
    setBusyId(row.id); setNotice(""); setError("");
    try {
      await memberRequest("/api/staff/members/role", { memberId: row.id, role });
      setRows((current) => (current ?? []).map((item) => item.id === row.id ? { ...item, role } : item));
      setNotice(`Đã ${role === "mod" ? "cấp quyền Mod cho" : "gỡ quyền Mod của"} ${row.fullName}. Thao tác được ghi vào nhật ký máy chủ.`);
    } catch (reason) {
      setError(reason instanceof Error ? `Không đổi được vai trò: ${reason.message}` : "Không đổi được vai trò.");
    } finally { setBusyId(""); }
  };

  return <section className={styles.panel} aria-labelledby="staff-members-title">
    <div className={styles.intro}>
      <h2 id="staff-members-title">Kiểm tra thành viên và xét quyền Mod</h2>
      <p>Chỉ Admin thấy khu vực này. Bạn có thể cấp hoặc gỡ quyền Mod cho thành viên đã được duyệt. Vai trò Admin, Leader và Super Mod không đổi được ở đây, và bạn không thể tự đổi vai trò của mình. Mọi thay đổi được kiểm tra lại tại máy chủ và ghi nhật ký.</p>
    </div>
    <div className={styles.metrics}>
      <article><small>TỔNG THÀNH VIÊN</small><strong>{rows ? rows.length.toLocaleString("vi-VN") : "—"}</strong><span>Hồ sơ trong hệ thống</span></article>
      <article><small>MOD</small><strong>{rows ? (counts.mod ?? 0) : "—"}</strong><span>Đang có quyền Mod</span></article>
      <article><small>SUPER MOD · LEADER</small><strong>{rows ? (counts.super_mod ?? 0) + (counts.leader ?? 0) : "—"}</strong><span>Không đổi tại đây</span></article>
      <article><small>ADMIN</small><strong>{rows ? (counts.admin ?? 0) : "—"}</strong><span>Quản trị hệ thống</span></article>
    </div>
    <div className={styles.fields}>
      <label>Tìm theo tên hoặc mã sinh viên<input type="search" value={query} onChange={(e) => { setQuery(e.target.value); setPage(0); }} placeholder="Nhập tên hoặc MSSV…" /></label>
      <label>Lọc theo vai trò<select value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value); setPage(0); }}>
        <option value="all">Tất cả vai trò</option>
        {Object.entries(ROLE_LABEL).map(([value, label]) => <option key={value} value={value}>{label}{counts[value] !== undefined ? ` (${counts[value]})` : ""}</option>)}
      </select></label>
    </div>
    {error && <p className={styles.statusMessage} role="alert">{error}</p>}
    {notice && <p className={styles.statusMessage} role="status">{notice}</p>}
    {!rows && !error && <p role="status">Đang tải danh sách thành viên…</p>}
    {rows && <div className={styles.memberList} role="list">
      {visible.length === 0 && <div className={styles.empty}><span>✓</span><strong>Không có thành viên phù hợp</strong><p>Thử đổi từ khóa hoặc bộ lọc vai trò.</p></div>}
      {visible.map((row) => {
        const changeable = (row.role === "member" || row.role === "mod") && row.id !== ownMemberId;
        const canPromote = row.role === "member" && row.status === "approved" && row.loginEnabled;
        return <article className={styles.memberRow} role="listitem" key={row.id}>
          <div><strong>{row.fullName}</strong><small>{row.studentCode || "Chưa có MSSV"} · {STATUS_LABEL[row.status] ?? row.status}{row.loginEnabled ? "" : " · Chưa bật đăng nhập"}</small></div>
          <span className={styles.statusPill}>{ROLE_LABEL[row.role] ?? row.role}</span>
          <div className={styles.memberActions}>
            {row.role === "member" && <button className={styles.primary} disabled={!changeable || !canPromote || busyId === row.id} title={canPromote ? undefined : "Chỉ cấp Mod cho thành viên đã duyệt và bật đăng nhập"} onClick={() => void changeRole(row, "mod")}>Cấp Mod</button>}
            {row.role === "mod" && <button className={styles.secondary} disabled={!changeable || busyId === row.id} onClick={() => void changeRole(row, "member")}>Gỡ Mod</button>}
          </div>
        </article>;
      })}
    </div>}
    {rows && filtered.length > PAGE_SIZE && <div className={styles.actions}>
      <button className={styles.secondary} disabled={safePage === 0} onClick={() => setPage(safePage - 1)}>← Trước</button>
      <span role="status">Trang {safePage + 1} / {pageCount} · {filtered.length} kết quả</span>
      <button className={styles.secondary} disabled={safePage >= pageCount - 1} onClick={() => setPage(safePage + 1)}>Sau →</button>
    </div>}
    <div className={styles.actions}><button className={styles.secondary} onClick={() => setRefresh((value) => value + 1)}>Làm mới danh sách</button></div>
  </section>;
}
