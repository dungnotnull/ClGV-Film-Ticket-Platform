# RULE.md - Quy tắc phát triển Backend & Core Directives (ClGV Project)

Tài liệu này định nghĩa các nguyên tắc **bắt buộc và tối thượng** khi AI Sub-Agents hoặc lập trình viên thực hiện bất kỳ task phát triển, chỉnh sửa code hoặc refactor trong thư mục `backend/` của dự án **ClGV Film Ticket Platform**.

---

## 🌟 1. BA NGUYÊN LÝ NỀN TẢNG (CORE PRINCIPLES)

Mọi thay đổi trong mã nguồn phải đi qua lăng kính của 3 nguyên lý này:

1. **Tối giản (Minimalist)**: Chỉ thay đổi những gì cần thiết. Code càng đơn giản càng tốt. Đừng nhồi nhét xử lý không mang lại giá trị thực tế.
2. **Triệt để (Thorough)**: Giải quyết vấn đề từ gốc rễ, tuyệt đối không chắp vá tạm bợ (workaround/hack) nếu biết nó sẽ gây rắc rối sau này. Tuy nhiên, cũng không "over-engineering" (làm quá mức) cho một lỗi nhỏ. Biết khi nào tối ưu, khi nào dừng lại.
3. **Vô hình (Invisible)**: Sửa đúng chỗ, thay đổi phải mượt mà và không làm phát sinh lỗi mới (no regressions).

---

## 📋 2. QUY TRÌNH PHÁT TRIỂN 6 BƯỚC (BẮT BUỘC)

Không bỏ qua bất kỳ bước nào dưới đây. Đi sai hướng thì dừng lại chỉnh kế hoạch, đừng cố làm tiếp để sinh ra nợ kỹ thuật.

1. **Lập kế hoạch công việc**: Phân tích yêu cầu, xác định mục tiêu và chia nhỏ bài toán lớn trước khi viết code để quản lý tốt ngữ cảnh (context).
2. **Kiểm tra lại kế hoạch**: Đảm bảo luồng xử lý hợp lý, bám sát hợp đồng [API-CONTRACT.md](../API-CONTRACT.md) và kiến trúc hệ thống.
3. **Thực thi và Đánh dấu**: Thực thi mã nguồn dứt điểm từng phần, cập nhật trạng thái vào file [DEVELOPMENT-TASK-BY-PHASES-TRACKING-LOGS.md](./DEVELOPMENT-TASK-BY-PHASES-TRACKING-LOGS.md).
4. **Giải thích thay đổi**: Mỗi dòng code viết ra, mỗi cấu trúc bị thay đổi đều phải có giải thích rõ ràng (thông qua comment Tiếng Việt hoặc commit log).
5. **Ghi nhận kết quả vào DEVELOPMENT-TASK-BY-PHASES-TRACKING-LOGS.md**: Cập nhật trạng thái hoàn thành (`[x]`) kèm bằng chứng. Chỉ được coi là "Xong" khi có bằng chứng rõ ràng (compile/test pass, log sạch, thay đổi hợp lý).
6. **Tổng kết bài học & Theo dõi sự cố**: Ghi nhận nguyên nhân lỗi và phương án xử lý vào [ISSUES-LIST-TRACKING.md](./ISSUES-LIST-TRACKING.md) hoặc [CHANGELOG.md](../CHANGELOG.md).

---

## 🚨 3. BẮT BUỘC ĐỌC NGUỒN DỮ LIỆU CHUẨN (SOURCE OF TRUTH)

Trước khi bắt đầu bất kỳ thao tác nào, BẮT BUỘC phải đọc và tuân thủ 5 tài liệu nguồn sau:

1. 📄 **[API-CONTRACT.md](../API-CONTRACT.md)**
   * Hợp đồng giao tiếp chính thức giữa Frontend và Backend (Single Source of Truth).
   * Mọi Endpoint, Payload Request, Response Data và HTTP Status Code phải khớp **100%**.
   * 🚨 **QUY TẮC CẬP NHẬT BẮT BUỘC**: Khi có bất kỳ sự thay đổi, thêm mới hoặc điều chỉnh nào về Endpoint path, Query params, Request DTO, Response data wrapper hoặc WebSocket event, người thực thi **BẮT BUỘC phải đọc và cập nhật file API-CONTRACT.md trước hoặc ngay sau khi có thay đổi**, đảm bảo hợp đồng luôn phản ánh chính xác trạng thái mã nguồn hiện tại.
   * Toàn bộ giá trị tiền tệ (vé, bắp nước, tổng đơn) phải là **VND (Việt Nam Đồng)** dưới dạng **số nguyên (Integer)**, không có thập phân.

2. 📄 **[PROJECT-DETAIL.md](../PROJECT-DETAIL.md)**
   * Nắm vững cơ chế chống bán lố/đặt trùng ghế hai tầng (**Redis Redlock** + **PostgreSQL `SELECT ... FOR UPDATE`**).
   * Nắm rõ cấu trúc sơ đồ ma trận ghế động JSON (`SeatNode`, `RoomMatrix`) và thuật toán ký mã hóa **HMAC-SHA256 QR Ticket Token**.

3. 📄 **[CLAUDE.md](../CLAUDE.md)** & **[CLAUDE.md](./CLAUDE.md)**
   * Nắm vững Tech Stack: Backend sử dụng **Node.js** (NestJS / Express TypeScript, Prisma/TypeORM, PostgreSQL 16, Redis 7, Socket.io); Frontend sử dụng **Next.js 15 (App Router)** với giao diện chỉn chu, hiện đại lấy cảm hứng từ CGV.
   * Thanh toán sử dụng cổng **Mock VNPAY Gateway** và thư viện **tạo mã QR giả lập** (`qrcode` cho BE, `qrcode.react` cho FE).
   * Nắm rõ các câu lệnh DB Migration, Seeding, Dev server và Test commands.

4. 📄 **[CHANGELOG.md](../CHANGELOG.md)**
   * Đọc để nắm được lịch sử cập nhật kiến trúc, tính năng hoặc breaking changes gần nhất.
   * Cập nhật nhật ký mỗi khi hoàn thành tính năng hoặc thay đổi kiến trúc lớn.

5. 📄 **[Skills Directory](../.agents/skills)**
   * BẮT BUỘC đọc file `SKILL.md` tương ứng trong `.agents/skills/` (như `brainstorming`, `systematic-debugging`, `writing-plans`, `test-driven-development`, `subagent-driven-development`) trước khi thực hiện task.

---

## 🛑 4. QUY TẮC THAO TÁC TỐI THƯỢNG (SUPREME RULES)

1. **Phạm vi thư mục tuyệt đối**:
   * Chỉ chỉnh sửa mã nguồn trong thư mục **backend/**.
   * **Tuyệt đối KHÔNG** tự ý chỉnh sửa bất kỳ code nào trong thư mục **frontend/**.

2. **Khi cần Frontend phối hợp**:
   * Không tự sửa code frontend. Thay vào đó, tổng hợp nguyên nhân và tài liệu chi tiết:
     * Endpoint & Method (ví dụ: `POST /api/v1/bookings/hold-seat`).
     * Request Body & Response DTOs chuẩn.
     * Field cần thêm hoặc sửa.
     * Cập nhật UI / Socket event (`seat:state_changed`) cần thực hiện.

3. **Comment bằng Tiếng Việt & Clean Code**:
   * Tất cả comment giải thích code BẮT BUỘC viết bằng **Tiếng Việt** ngắn gọn, súc tích và tập trung vào lý do xử lý (why, không chỉ what).
   * Không để lại code chết (dead code), code bị comment-out.
   * Tuyệt đối KHÔNG để lại `console.log`, `debugger` hoặc code debug tạm (sử dụng NestJS Logger/Pino service).

4. **Xử lý Bug & Debugging**:
   * Khi có bug, phải đọc log trước. Không đặt câu hỏi về những thứ có thể tự kiểm tra trong vài phút. Tôn trọng thời gian của cả team.

5. **Xác nhận trước khi Git Push (Push Approval)**:
   * AI Agent CHỈ được phép thực hiện `git commit` mã nguồn cục bộ.
   * **Tuyệt đối KHÔNG** tự ý chạy `git push` lên GitHub remote trừ khi người dùng trực tiếp yêu cầu hoặc xác nhận đồng ý.

6. **Đơn vị Tiền tệ**:
   * Toàn bộ giá tiền vé, combo bắp nước, voucher giảm giá giao tiếp API đều sử dụng đơn vị **VND (số nguyên)**.

---

## 🏗️ 5. QUY CHUẨN KIẾN TRÚC & PHÁT TRIỂN BACKEND

1. **Tuân thủ kiến trúc hiện tại**:
   * Không tự ý đổi cấu trúc thư mục `src/modules/` (`auth`, `cinema`, `showtime`, `booking`, `ticket`, `combo`, `websocket`, `membership`, `analytics`).
   * Tuân thủ naming convention TypeScript (camelCase cho variables/methods, PascalCase cho Classes/DTOs/Entities).

2. **Concurrency & Double-Booking Control**:
   * **Tier 1 (Redis Redlock)**: Distributed lock key `lock:seat:{showtime_id}:{seat_id}` với TTL 10 phút (600s). Trả về HTTP 409 `SEAT_ALREADY_HELD` ngay lập tức nếu Redlock thất bại.
   * **Tier 2 (Postgres Transaction)**: Lock hàng dữ liệu `SELECT ... FOR UPDATE` khi checkout thanh toán.

3. **Bảo mật & Validation**:
   * Validate 100% dữ liệu đầu vào sử dụng DTO `class-validator` / `zod`.
   * Tuyệt đối không expose stack trace, SQL query hoặc credentials trong API Response.
   * Không hard-code API Key, Secret hay Password. Tất cả lưu trong `.env` và gọi qua `ConfigService`.

4. **Quản lý Database**:
   * Không sửa schema hoặc tạo migration mới nếu task không yêu cầu.
   * Không thực thi các câu lệnh nguy hại (`DROP`, `TRUNCATE`). Giữ tương thích ngược với dữ liệu hiện có.

---

## 🧪 6. KIỂM THỬ VÀ HOÀN THÀNH TASK (EVIDENCE OF DONE)

Code chạy trong đầu chưa đủ. Nếu người khó tính nhất trong team chưa chắc sẽ duyệt, nghĩa là chưa xong. Trước khi kết thúc task, phải đảm bảo:

1. **Vượt qua Kiểm thử (Proof of Done)**: Đảm bảo code compile sạch sẽ, không có lỗi TypeScript hay ESLint (`npm run build` / `npm test`). Log hệ thống sạch.
2. **Đồng bộ Tài liệu API**: Cập nhật chính xác 100% mọi thay đổi vào [API-CONTRACT.md](../API-CONTRACT.md).
3. **Cập nhật Hệ thống Tracking Logs**:
   * Đánh dấu `[x]` vào file [DEVELOPMENT-TASK-BY-PHASES-TRACKING-LOGS.md](./DEVELOPMENT-TASK-BY-PHASES-TRACKING-LOGS.md).
   * Ghi chú các thay đổi lớn vào [CHANGELOG.md](../CHANGELOG.md).
4. **Đóng gói Bài học & Sự cố**: Hoàn tất ghi log lỗi và phương án xử lý vào [ISSUES-LIST-TRACKING.md](./ISSUES-LIST-TRACKING.md) hoặc [CHANGELOG.md](../CHANGELOG.md).
