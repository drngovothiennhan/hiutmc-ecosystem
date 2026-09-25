export const aiTools = [
  {
    title: "Trợ lý học tập",
    role: "Học tập tổng quát",
    body: "Dùng Study OS cho hỏi đáp học tập, luyện tập và các tác vụ học tập tổng quát đang được hệ thống hỗ trợ.",
    href: "https://hiutmc.com/apps/study/",
    action: "Mở Study OS"
  },
  {
    title: "A.I Thiệt Chẩn",
    role: "Công cụ chuyên biệt",
    body: "Hỗ trợ học quan sát và đối chiếu đặc điểm lưỡi trong bối cảnh giáo dục Y học cổ truyền.",
    href: "https://hiutmc.com/apps/thietchan/",
    action: "Mở A.I Thiệt Chẩn"
  },
  {
    title: "Trung Y Văn",
    role: "Tra cứu học liệu",
    body: "Mở kho học liệu khi cần đọc, đối chiếu hoặc tra cứu nội dung Trung y văn từ nguồn đang có.",
    href: "https://hiutmc.com/apps/trungyvan/",
    action: "Mở Trung Y Văn"
  },
  {
    title: "3D Atlas",
    role: "Trực quan hóa",
    body: "Chuyển sang mô hình 3D khi câu hỏi học tập cần quan sát kinh lạc, huyệt vị hoặc mốc giải phẫu.",
    href: "https://hiutmc.com/apps/atlas/",
    action: "Mở Atlas"
  }
];

export const aiRouting = [
  { need: "Hỏi bài, ôn tập, luyện câu hỏi", target: "Trợ lý học tập / Study OS" },
  { need: "Học quan sát đặc điểm lưỡi", target: "A.I Thiệt Chẩn" },
  { need: "Tra cứu học liệu Trung y", target: "Trung Y Văn" },
  { need: "Xem vị trí kinh lạc – huyệt vị", target: "3D Atlas" }
];
