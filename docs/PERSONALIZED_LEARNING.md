# Cá nhân hóa học tập — Bước 5

## Phần đã triển khai trong Ecosystem

- Trang chủ đọc snapshot theo phiên thành viên từ endpoint hiện hữu `GET /functions/v1/learning-sync?snapshot=1`. Endpoint xác thực thành viên, giải mã snapshot phía server và trả `journey`, `reviewCards`, `dailyHistory`; không gửi `member_id` do client tự chọn.
- `data/personalized-learning.ts` xác thực và giới hạn các trường snapshot được dùng. Gợi ý ưu tiên hoạt động Study OS gần đây nếu có `journey.updatedAt` và `journey.lastModule` trong 7 ngày; tiếp theo là thẻ có `streak=0` và `lastAttempt`; sau đó là lối vào lộ trình Study OS. Gợi ý gần nhất không khẳng định người dùng còn dở một bài cụ thể, vì schema hiện tại không có cờ/ID bài học đang dở.
- Tóm tắt hiển thị tối đa ba chủ đề đến hạn hoặc đến hạn trong ba ngày theo `reviewCards.due`, cùng chủ đề có streak 0 khi có. Không có thẻ ôn hợp lệ thì hiển thị trạng thái thiếu dữ liệu thay vì câu tóm tắt chung giả dạng cá nhân hóa.
- Snapshot chỉ tải khi đăng nhập, khi mở trang, khi quay lại tab bằng focus và khi người dùng chủ động làm mới tiến độ. Aggregate stats hiện tại vẫn được tải định kỳ riêng; snapshot không bị tải mỗi phút.
- Trạng thái giao diện tách đang tải, tải lỗi, chưa có snapshot và snapshot đã tải nhưng chưa đủ dữ liệu theo chủ đề; lỗi mạng không bị trình bày thành lịch sử học rỗng.

## Dữ liệu có và giới hạn

Study OS `src/services/learningCloudSyncService.ts` hiện lưu snapshot phiên bản 1 với `journey`, `reviewCards` và `dailyHistory`. `src/services/adaptiveReview.ts` lưu chủ đề, hạn ôn, interval, streak và mã lượt thử gần nhất. Streak 0 sau một attempt được dùng làm tín hiệu cần củng cố; nó không phải điểm phần trăm quiz.

Snapshot hiện chưa chứa trạng thái bài học đang mở/chưa hoàn tất, cũng chưa có lịch sử điểm theo chủ đề qua nhiều ngày. Aggregate `learning_sync_stats.lastExamScore` chỉ là điểm bài thi gần nhất, không chỉ ra chủ đề yếu. Vì vậy UI chỉ tuyên bố những gì dữ liệu hiện tại chứng minh được. Các RPC `daily_study_review_today_v1` của Study OS chỉ trả bộ ôn hôm nay; không cung cấp lịch sử theo chủ đề cho Ecosystem.

## Đánh giá liên kết Y Quán

Chưa khả thi để gợi ý theo kết quả Y Quán từ mã nguồn Ecosystem: `MemberAuthBridge` chuyển phiên đăng nhập tới Game Hub nhưng không nhận bản ghi tiến độ, kết quả ca, chủ đề sai hoặc lịch sử hoạt động ngược về. Hai ứng dụng không có contract hoạt động học chung mà repo này có thể đọc. Bước này không suy diễn điểm yếu của Y Quán từ việc đăng nhập hoặc lượt mở app.

### Lộ trình hợp nhất đề xuất

Tạo luồng sự kiện do backend xác thực trước khi bật gợi ý xuyên hub. Hợp đồng tối thiểu dự kiến:

```ts
type LearnerActivityV1 = {
  eventId: string; // UUID idempotency key
  memberId: string; // derived from verified session on server
  sourceHub: "study-os" | "y-quan";
  eventType: "lesson_completed" | "quiz_submitted" | "case_completed";
  contentId: string;
  subject: string;
  topic?: string;
  correct?: number;
  total?: number;
  scorePercent?: number;
  occurredAt: string; // server timestamp, UTC
  schemaVersion: 1;
};
```

Backend phải tự lấy member từ token, kiểm tra quyền thành viên, áp dụng idempotency trên `eventId`, giới hạn kích thước/enum, và chỉ cho thành viên đọc activity của chính họ. Study OS và Y Quán lần lượt phát sự kiện bài học/quiz và hoàn thành ca; Ecosystem tổng hợp score có đủ số câu trước khi hiển thị gợi ý. Cần triển khai migration/RPC và kiểm thử quyền trước khi bật nguồn Y Quán.

## Kiểm thử

`npm run validate:personalization` kiểm tra việc chỉ dùng snapshot hợp lệ, chọn chủ đề theo dữ liệu cá nhân, gợi ý lộ trình khi thiếu tín hiệu ưu tiên và trạng thái rỗng khi chưa có history theo chủ đề.
