import type { Metadata } from "next";

export const metadata: Metadata = { title: "Admin Center", description: "Bảng điều khiển bản nháp nội dung Hub HIU TMC.", robots: { index: false, follow: false } };

export default function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) { return children; }
