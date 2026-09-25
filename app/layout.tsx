import type { Metadata } from "next";
import "./globals.css";
import PwaInstall from "@/components/PwaInstall";
import SeamlessAppFrame from "@/components/SeamlessAppFrame";

const SOCIAL_TITLE = "HIU YHCT Ecosystem – Cổng học tập Y học cổ truyền HIU";
const SOCIAL_DESCRIPTION = "Study OS · Atlas 3D · A.I Thiệt Chẩn · Trung Y Văn · cộng đồng học thuật dành cho sinh viên Y học cổ truyền HIU.";
const SOCIAL_IMAGE = "/icons/icon-512.png?share=cp22";

export const viewport = {
  themeColor: "#981b36",
  colorScheme: "light",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://hiutmc.com"),
  applicationName: "HIU YHCT Ecosystem",
  title: {
    default: SOCIAL_TITLE,
    template: "%s | HIU YHCT Ecosystem",
  },
  description: SOCIAL_DESCRIPTION,
  keywords: [
    "HIU YHCT",
    "Y học cổ truyền",
    "Study OS",
    "Atlas 3D",
    "A.I Thiệt Chẩn",
    "Trung Y Văn",
  ],
  alternates: { canonical: "/" },
  manifest: "/manifest.webmanifest",
  icons: { icon: "/icons/icon-192.png", apple: "/icons/apple-touch-icon.png" },
  appleWebApp: { capable: true, title: "HIU TMC", statusBarStyle: "default" },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  openGraph: {
    type: "website",
    locale: "vi_VN",
    url: "https://hiutmc.com",
    siteName: "HIU YHCT Ecosystem",
    title: SOCIAL_TITLE,
    description: SOCIAL_DESCRIPTION,
    images: [
      {
        url: SOCIAL_IMAGE,
        width: 512,
        height: 512,
        type: "image/png",
        alt: "HIU YHCT Ecosystem – Cổng học tập Y học cổ truyền HIU",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: SOCIAL_TITLE,
    description: SOCIAL_DESCRIPTION,
    images: [SOCIAL_IMAGE],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi">
      <body>{children}<SeamlessAppFrame /><PwaInstall /></body>
    </html>
  );
}
