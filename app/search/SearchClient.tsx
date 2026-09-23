"use client";

import { useEffect, useMemo, useState } from "react";
import { searchResources } from "@/data/search-index";
import styles from "./search.module.css";

const normalize = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

export default function SearchClient() {
  const [query, setQuery] = useState("");

  useEffect(() => {
    const value = new URLSearchParams(window.location.search).get("q") || "";
    setQuery(value);
  }, []);

  const results = useMemo(() => {
    const needle = normalize(query);
    if (!needle) return searchResources;
    return searchResources.filter((item) => {
      const haystack = [
        item.title,
        item.category,
        item.description,
        item.status,
        ...item.keywords
      ].map(normalize).join(" ");
      return haystack.includes(needle);
    });
  }, [query]);

  return (
    <>
      <div className={styles.searchBox}>
        <label htmlFor="hub-search">Tìm trong hệ sinh thái</label>
        <div>
          <input
            id="hub-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Ví dụ: huyệt, thiệt chẩn, quiz, dược liệu..."
            autoComplete="off"
          />
          <span aria-live="polite">{results.length} kết quả</span>
        </div>
      </div>

      <div className={styles.results}>
        {results.map((item) => (
          <a className={styles.card} href={item.href} key={item.id}>
            <div className={styles.meta}>
              <span>{item.category}</span>
              <small>{item.status}</small>
            </div>
            <h2>{item.title}</h2>
            <p>{item.description}</p>
            <b>Mở nội dung ↗</b>
          </a>
        ))}
        {results.length === 0 && (
          <div className={styles.empty}>
            <strong>Chưa có kết quả đã xác thực.</strong>
            <p>Hệ thống không tự tạo nội dung thay thế. Hãy thử từ khóa rộng hơn hoặc quay lại Learning Center.</p>
            <a href="/learn/">Mở Learning Center →</a>
          </div>
        )}
      </div>
    </>
  );
}
