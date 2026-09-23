import { ecosystemApps } from "./apps";

export type SearchResource = {
  id: string;
  title: string;
  category: "Ứng dụng" | "Học tập" | "Chủ đề";
  description: string;
  href: string;
  keywords: string[];
  status: "Đang hoạt động" | "Đang chuẩn hóa";
};

const appResources: SearchResource[] = ecosystemApps.map((app) => ({
  id: `app-${app.slug}`,
  title: app.name,
  category: "Ứng dụng",
  description: app.description,
  href: app.currentUpstreamUrl,
  keywords: [app.name, app.shortName, app.tagline, app.slug],
  status: "Đang hoạt động"
}));

export const searchResources: SearchResource[] = [
  ...appResources,
  {
    id: "learning-center",
    title: "Learning Center",
    category: "Học tập",
    description: "Điểm bắt đầu cho hành trình học, luyện tập, Atlas, AI và thư viện.",
    href: "/learn/",
    keywords: ["học tập", "learning", "quiz", "flashcard", "ôn tập", "học 15 phút"],
    status: "Đang hoạt động"
  },
  {
    id: "ai-lab",
    title: "AI Lab",
    category: "Học tập",
    description: "Điều hướng tới trợ lý học tập và các công cụ AI chuyên biệt đang hoạt động.",
    href: "/ai/",
    keywords: ["ai", "trợ lý", "hỏi đáp", "thiệt chẩn"],
    status: "Đang hoạt động"
  },
  {
    id: "subject-kinh-lac",
    title: "Kinh lạc – Huyệt học",
    category: "Chủ đề",
    description: "Đi từ Learning Center tới Atlas 3D và các công cụ học liên quan.",
    href: "https://drngovothiennhan.github.io/human-atlas/",
    keywords: ["kinh lạc", "huyệt", "huyệt vị", "atlas", "châm cứu"],
    status: "Đang chuẩn hóa"
  },
  {
    id: "subject-cham-cuu",
    title: "Châm cứu",
    category: "Chủ đề",
    description: "Chủ đề học tập liên kết với Learning Center và Atlas 3D.",
    href: "/learn/",
    keywords: ["châm cứu", "huyệt", "kinh lạc"],
    status: "Đang chuẩn hóa"
  },
  {
    id: "subject-duoc-lieu",
    title: "Dược liệu",
    category: "Chủ đề",
    description: "Chủ đề học tập; học liệu chi tiết chỉ được mở khi có nguồn thật.",
    href: "/learn/",
    keywords: ["dược liệu", "thuốc", "dược học cổ truyền"],
    status: "Đang chuẩn hóa"
  },
  {
    id: "subject-phuong-te",
    title: "Phương tễ",
    category: "Chủ đề",
    description: "Chủ đề học tập; chưa công bố nội dung chi tiết khi chưa có nguồn chuẩn hóa.",
    href: "/learn/",
    keywords: ["phương tễ", "bài thuốc", "phương thuốc"],
    status: "Đang chuẩn hóa"
  },
  {
    id: "subject-thiet-chan",
    title: "Thiệt chẩn",
    category: "Chủ đề",
    description: "Học kiến thức quan sát lưỡi và chuyển sang A.I Thiệt Chẩn khi cần.",
    href: "https://ai-thiet-chan-hiu-yhct.vercel.app/",
    keywords: ["thiệt chẩn", "lưỡi", "tongue", "ai"],
    status: "Đang hoạt động"
  },
  {
    id: "subject-noi-khoa",
    title: "Nội khoa YHCT",
    category: "Chủ đề",
    description: "Khung chủ đề học tập; không hiển thị case chưa được kiểm chứng.",
    href: "/learn/",
    keywords: ["nội khoa", "y học cổ truyền", "yhct"],
    status: "Đang chuẩn hóa"
  }
];
