# Frontend System Prompt & Core Directives (ClGV-Film-Ticket-Platform)

## 🚨 MANDATORY INSTRUCTIONS FOR FRONTEND AI AGENTS & DEVELOPERS

Mỗi khi bắt đầu bất kỳ thao tác phát triển, chỉnh sửa code hoặc tư vấn về **Frontend** trong dự án **ClGV-Film-Ticket-Platform**, BẮT BUỘC phải đọc và tham chiếu các file quan trọng thuộc **Source of Truth** sau đây:

---

### 1. 📄 [API-CONTRACT.md](file:///d:/ClGV-Film-Ticket-Platform/API-CONTRACT.md)
- **Vai trò:** Hợp đồng giao tiếp chính thức với Backend.
- **Yêu cầu:** 
  - Gọi đúng Endpoint, cấu trúc Payload Request và xử lý Response Data chính xác 100%.
  - Lắng nghe và xử lý đúng các sự kiện WebSocket (Socket.io) để render trạng thái Seat Matrix (Ghế ngồi) theo thời gian thực.
  - Không tự ý giả định API. Nếu thấy API chưa có trong tài liệu, phải dừng lại và yêu cầu Backend bổ sung.

---

### 2. 📄 [frontend/CLAUDE.md](file:///d:/ClGV-Film-Ticket-Platform/frontend/CLAUDE.md)
- **Vai trò:** Ngữ cảnh hệ thống và hướng dẫn chuyên biệt cho Frontend.
- **Yêu cầu:** 
  - Nắm vững Tech Stack: **Next.js 15 (App Router)**, **React 19**, **Tailwind CSS**, **Shadcn UI**.
  - Hiểu rõ cách thức tổ chức Component, State Management và Routing của ứng dụng.
  - Lệnh khởi chạy: `npm install`, `npm run dev` (thực hiện tại thư mục `frontend/`).

---

### 3. 📄 [frontend/SCREENS-BY-PHASES.md](file:///d:/ClGV-Film-Ticket-Platform/frontend/SCREENS-BY-PHASES.md) & [PROJECT-DETAIL.md](file:///d:/ClGV-Film-Ticket-Platform/PROJECT-DETAIL.md)
- **Vai trò:** Bản thiết kế giao diện & luồng nghiệp vụ.
- **Yêu cầu:**
  - Code UI bám sát yêu cầu giao diện (Premium CGV-inspired, Dark mode, Micro-animations).
  - Nắm vững logic hiển thị Dynamic Room Matrix (Seat picker), Đếm ngược 10 phút khóa vé, QR Code Check-in (`qrcode.react`).

---

### 4. 📄 [frontend/DEVELOPMENT-TASK-BY-PHASES-TRACKING-LOGS.md](file:///d:/ClGV-Film-Ticket-Platform/frontend/DEVELOPMENT-TASK-BY-PHASES-TRACKING-LOGS.md) & [frontend/ISSUES-LIST-TRACKING.md](file:///d:/ClGV-Film-Ticket-Platform/frontend/ISSUES-LIST-TRACKING.md)
- **Vai trò:** Theo dõi tiến độ và quản lý lỗi phía Frontend.
- **Yêu cầu:** 
  - Cập nhật tiến độ task (`[ ]` -> `[x]`) mỗi khi hoàn thành xong tính năng.
  - Ghi nhận lại các lỗi (Issues) liên quan đến giao diện, DOM, hoặc State vào danh sách.

---

### 5. 📄 [Skills Directory](file:///d:/ClGV-Film-Ticket-Platform/.agents/skills)
- **Vai trò:** Thư viện Kỹ năng & Quy chuẩn (`.agents/skills/`).
- **Yêu cầu:**
  - BẮT BUỘC phải đọc và tuân thủ nội dung các file `SKILL.md` tương ứng trong `.agents/skills/` (ví dụ: `frontend-design`, `react-best-practices`, `building-components`) trước khi code.

---

## 🛑 QUY TẮC THAO TÁC TỐI THƯỢNG CỦA FRONTEND (SUPREME RULES)

1. **Phạm vi thư mục:** CHỈ ĐƯỢC PHÉP chỉnh sửa code và thao tác bên trong thư mục `frontend/`. **Tuyệt đối KHÔNG can thiệp, không đọc/ghi sang thư mục `backend/`** dưới mọi hình thức.
2. **Tiêu chuẩn UI/UX:** Giao diện bắt buộc phải đạt tiêu chuẩn Cao Cấp (Premium), mang phong cách CGV, màu sắc hài hòa (Dark theme chủ đạo), và phải có hiệu ứng tương tác (Micro-animations, Hover states). Giao diện sơ sài là KHÔNG THỂ CHẤP NHẬN.
3. **Giữ Code Sạch Sẽ (Clean Code):** Tuyệt đối KHÔNG để lại code thừa bị comment-out, không để lại `console.log` hoặc thẻ HTML rác.
4. **Comment Tiếng Việt:** Tất cả comment giải thích code BẮT BUỘC viết bằng Tiếng Việt ngắn gọn, súc tích, giải thích LÝ DO (Why) thay vì CÁI GÌ (What).
5. **Kiểm thử trước khi xác nhận:** Bắt buộc phải chạy thành công lệnh `npm run build` ở thư mục `frontend/` để đảm bảo code Next.js không có lỗi Type/ESLint trước khi bàn giao.
6. **Xác nhận trước khi Git Push:** AI Agent CHỈ được thực hiện `git commit` mã nguồn cục bộ. Tuyệt đối KHÔNG tự ý thực hiện `git push` lên GitHub remote trừ khi người dùng trực tiếp yêu cầu.
7. **Tách biệt Backend & Báo cáo Lỗi:** Khi tích hợp API, nếu API trả về lỗi 500, sai payload, hoặc chưa được Backend cung cấp: Tuyệt đối KHÔNG tự ý sửa code Backend. Bắt buộc phải **tổng hợp log lỗi, thông tin request/response chi tiết** và báo lại cho người dùng để chuyển cho team Backend xử lý.
