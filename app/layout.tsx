import type { Metadata } from "next";
import "./globals.css";
import PwaInstall from "@/components/PwaInstall";

export const viewport = {
  themeColor: "#1f5d49",
  colorScheme: "light",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://hiutmc.com"),
  title: {
    default: "HIU TMC Ecosystem",
    template: "%s | HIU TMC Ecosystem",
  },
  description: "Cổng học tập và kết nối của Câu lạc bộ Y học cổ truyền HIU: Study OS, AI Lab, Cộng đồng và thế giới học thuật tương tác.",
  alternates: { canonical: "/" },
  manifest: "/manifest.webmanifest",
  icons: { icon: "/favicon.svg", apple: "/icons/apple-touch-icon.png" },
  appleWebApp: { capable: true, title: "HIU TMC", statusBarStyle: "default" },
  openGraph: {
    type: "website",
    locale: "vi_VN",
    url: "https://hiutmc.com",
    siteName: "HIU TMC Ecosystem",
    title: "HIU TMC Ecosystem",
    description: "Học tập, kết nối và khám phá thế giới học thuật YHCT cùng HIU.",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi">
      <body>{children}<PwaInstall /></body>
    </html>
  );
}
