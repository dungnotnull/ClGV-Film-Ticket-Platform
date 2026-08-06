# Backend Development Task & Phase Tracking Log (CGV Standards)

> **NOTICE FOR BE-AGENT**:
> File này là log theo dõi tiến độ chi tiết từng Phase và từng API/Task nhỏ dựa trên tiêu chuẩn các tính năng của **CGV Việt Nam (cgv.vn)**.
> Mỗi khi làm xong một task/endpoint, BE-agent hãy đánh dấu `[x]` vào ô check-box tương ứng.

---

## Phase 1: Database & Core Setup

- [x] **Project Setup & Infrastructure:**
  - [x] Khởi tạo dự án Node.js (NestJS CLI / Express TypeScript strict mode).
  - [x] Thiết lập Docker Compose cho PostgreSQL 16 & Redis 7.
  - [x] Cấu hình Prisma ORM / TypeORM kết nối PostgreSQL & ioredis client.
  - [x] Cấu hình Swagger UI cho API Documentation (`/api/docs`).
  - [x] Xây dựng Global Exception Filter và Response Interceptor (theo chuẩn `API-CONTRACT.md`).

- [x] **Auth, User & CGV Membership (`src/modules/auth`, `src/modules/users`, `src/modules/membership`):**
  - [x] Định nghĩa entities/schema `User`, `Role` (`CUSTOMER`, `ADMIN`, `SCANNER`), `MembershipTier` (`MEMBER`, `U22_FANC`, `VIP`, `VVIP`), `PointHistory`, `CGVCard` (Ví/Thẻ hội viên CGV).
  - [x] Cấu hình chiến lược JWT Authentication (Access Token & Refresh Token) & OAuth 2.0 (Google/Facebook Login).
  - [x] Tạo decorator `@Roles()` và `RolesGuard` phân quyền người dùng và quản trị rạp.
  - [x] `POST /api/v1/auth/register`: API đăng ký tài khoản (tự động khởi tạo thẻ hội viên CGV Card).
  - [x] `POST /api/v1/auth/login`: API đăng nhập (trả về Access Token, Refresh Token và thông tin User).
  - [x] `POST /api/v1/auth/refresh`: API cấp lại Access Token mới từ Refresh Token.
  - [x] `GET /api/v1/auth/me`: API lấy thông tin cá nhân, hạng hội viên CGV, số điểm CGV Rewards & số dư thẻ CGV Card.
  - [x] `PUT /api/v1/auth/profile`: API cập nhật thông tin cá nhân (Họ tên, SĐT, Ngày sinh để nhận quà sinh nhật).
  - [x] `POST /api/v1/auth/verify-u22`: API xác minh độ tuổi U22/FanC (12-22 tuổi) để hưởng giá vé ưu đãi HSSV.

---

## Phase 2: Core Cinema, Showtime & Catalog API (CGV Standards)

- [x] **Cities & Location Management (`src/modules/city`):**
  - [x] Định nghĩa schema `City` (tên thành phố/khu vực: TP.HCM, Hà Nội, Đà Nẵng, Cần Thơ..., mã code, thứ tự hiển thị).
  - [x] `POST /api/v1/admin/cities`: API Admin tạo thành phố/khu vực mới.
  - [x] `GET /api/v1/cities`: API lấy danh sách toàn bộ thành phố/khu vực kèm số lượng rạp.
  - [x] `PUT /api/v1/admin/cities/:id`: API Admin cập nhật thông tin thành phố.
  - [x] `DELETE /api/v1/admin/cities/:id`: API Admin xóa thành phố.

- [x] **Cinema Clusters & Special Experience Rooms (`src/modules/cinema`):**
  - [x] Định nghĩa schema `Cinema`, `Hall`, `FormatType` (`2D`, `3D`, `IMAX`, `4DX`, `SCREENX`, `GOLD_CLASS`, `LAMOUR_BED`).
  - [x] `POST /api/v1/cinemas`: API tạo mới cụm rạp CGV (gắn với `cityId`, tên cụm rạp, địa chỉ, GPS location, hotline, tiện ích rạp như Parking, Popcorn Bar, L'Amour).
  - [x] `GET /api/v1/cinemas`: API lấy danh sách cụm rạp (hỗ trợ filter động theo `cityId`, `format`, `amenities`, pagination).
  - [x] `GET /api/v1/cinemas/:id`: API lấy chi tiết cụm rạp và các tiện ích.
  - [x] `PUT /api/v1/cinemas/:id`: API cập nhật thông tin cụm rạp.
  - [x] `DELETE /api/v1/cinemas/:id`: API xóa cụm rạp.

- [x] **Halls & Dynamic CGV Room Matrix Builder (`src/modules/cinema`):**
  - [x] Xây dựng data structure ma trận ghế JSON (`SeatNode`, `RoomMatrix`: dimensions, aisles, grid của các loại ghế: Standard, VIP, Sweetbox/Couple, GoldClass/L'Amour Bed).
  - [x] `POST /api/v1/halls`: API tạo phòng chiếu mới cho cụm rạp.
  - [x] `GET /api/v1/halls`: API lấy danh sách phòng chiếu theo cinema ID.
  - [x] `GET /api/v1/halls/:id`: API chi tiết phòng chiếu.
  - [x] `PUT /api/v1/halls/:id/matrix`: API cấu hình ma trận sơ đồ ghế (Hàng A-Z, Cột 1-N, Aisle gaps, loại ghế, priceModifier, isBlocked).
  - [x] `GET /api/v1/halls/:id/matrix`: API lấy sơ đồ ma trận ghế phòng chiếu.
  - [x] `DELETE /api/v1/halls/:id`: API xóa phòng chiếu.

- [x] **Admin Promotional Banners & CMS (`src/modules/banner`):**
  - [x] Định nghĩa schema `Banner` (tiêu đề, hình ảnh, link liên kết, thứ tự hiển thị, status `ACTIVE`/`INACTIVE`).
  - [x] `POST /api/v1/admin/banners`: API Admin tạo banner/slider mới.
  - [x] `GET /api/v1/admin/banners`: API Admin quản lý danh sách banner.
  - [x] `PUT /api/v1/admin/banners/:id`: API Admin sửa thông tin banner.
  - [x] `DELETE /api/v1/admin/banners/:id`: API Admin xóa banner.

- [x] **Movie Catalog & Special Formats (`src/modules/movie`):**
  - [x] Định nghĩa schema `Movie` (Tiêu đề tiếng Việt/Anh, đạo diễn, diễn viên, thể loại, thời lượng, ngày khởi chiếu, posterUrl, trailerUrl, ageRating `P`/`K`/`T13`/`T16`/`T18`, language `SUB`/`DUB`/`THUYT_MINH`, status `NOW_SHOWING`/`COMING_SOON`/`SNEAK_SHOW`).
  - [x] `POST /api/v1/admin/movies`: API Admin tạo phim mới (hiển thị ngay lên trang chủ).
  - [x] `PUT /api/v1/admin/movies/:id`: API Admin sửa thông tin phim.
  - [x] `DELETE /api/v1/admin/movies/:id`: API Admin xóa/ngừng chiếu phim.

- [x] **Showtime Scheduler Matrix & Conflict Detection (`src/modules/showtime`):**
  - [x] Định nghĩa schema `Showtime`, `ShowtimeSeat` (`AVAILABLE`, `HOLDING`, `RESERVED`, `SOLD`, `BLOCKED`), `PricingPolicy` (Quy tắc tính giá theo khung giờ sáng/tối, ngày thường/cuối tuần/ngày lễ, định dạng 2D/3D/IMAX/4DX).
  - [x] Xây dựng **Automated Conflict Detection Engine** (kiểm tra trùng lịch chiếu phòng + 15 phút dọn dẹp vệ sinh).
  - [x] `POST /api/v1/admin/showtimes`: API Admin tạo suất chiếu mới (tự động validate conflict & áp dụng giá).
  - [x] `GET /api/v1/admin/showtimes`: API Admin xem lịch chiếu toàn bộ hệ thống rạp.
  - [x] `PUT /api/v1/admin/showtimes/:id`: API Admin điều chỉnh suất chiếu.
  - [x] `DELETE /api/v1/admin/showtimes/:id`: API Admin hủy suất chiếu.

### 2.2. Discovery & Shopping (Role Customer)

- [x] **Dynamic Home Page & Promotional Sliders (`src/modules/home`):**
  - [x] `GET /api/v1/home`: API tổng hợp dữ liệu trang chủ động (tự động lấy danh sách Banner active, Phim đang chiếu, Phim sắp chiếu, Cụm rạp nổi bật theo `cityId`, và các chương trình khuyến mãi do Admin đăng).
  - [x] `GET /api/v1/home/banners`: API lấy danh sách banner khuyến mãi / phim hot slider trang chủ.
  - [x] `GET /api/v1/home/now-showing`: API lấy danh sách phim đang chiếu nổi bật.
  - [x] `GET /api/v1/home/coming-soon`: API lấy danh sách phim sắp chiếu.
  - [x] `GET /api/v1/home/promotions`: API lấy danh sách ưu đãi CGV (Happy Wednesday, Culture Day, U22, Sinh nhật).

- [x] **Movie Catalog & Reviews (`src/modules/movie`):**
  - [x] `GET /api/v1/movies`: API lấy danh sách phim (lọc theo `status`, `genre`, `format`, `rating`, `search`).
  - [x] `GET /api/v1/movies/:id`: API chi tiết phim, trailer video, đánh giá sao & suất chiếu khả dụng.
  - [x] `GET /api/v1/movies/:id/reviews`: API xem danh sách nhận xét & đánh giá từ khán giả.
  - [x] `POST /api/v1/movies/:id/reviews`: API gửi đánh giá & nhận xét phim (chỉ áp dụng cho user đã mua vé và xem phim này).

- [x] **Showtime & Dynamic Seat Picker (`src/modules/showtime`):**
  - [x] `GET /api/v1/showtimes`: API lấy suất chiếu theo `movieId`, `cinemaId`, `date`, `format`.
  - [x] `GET /api/v1/showtimes/:id/seats`: API lấy sơ đồ ma trận ghế và trạng thái thời gian thực (`AVAILABLE`, `HOLDING`, `SOLD`).

---

## Phase 3: Real-time Seat Sync & Distributed Redlock Engine

- [x] **WebSocket Gateway & Redis Pub/Sub (`src/modules/websocket`):**
  - [x] Cấu hình ioredis client và Pub/Sub event channels (`showtime:{id}:seats`).
  - [x] Khởi tạo Socket.io Gateway server (xử lý kết nối client & handshake JWT auth).
  - [x] Client join room Socket: `join:showtime` (Payload `{ showtimeId }`).

- [x] **Distributed Redlock & Transient Seat Holding (`src/modules/booking`):**
  - [x] Cấu hình thuật toán Redlock giải quyết giữ ghế phân tán.
  - [x] Định nghĩa Redis Key Format: `lock:seat:{showtime_id}:{seat_id}` với 10-minute TTL (600 giây).
  - [x] `POST /api/v1/bookings/hold-seat` & Socket Event `seat:select`:
    - [x] Đặt Redis lock `SET lock:seat:... NX EX 600`.
    - [x] Broadcast sự kiện Socket `seat:state_changed` (`HOLDING`, `heldByUserId`, `expiresAt`) tới toàn room.
    - [x] Trả về HTTP 409 `SEAT_ALREADY_HELD` nếu ghế bị giữ bởi user khác.
  - [x] `POST /api/v1/bookings/release-seat` & Socket Event `seat:deselect`:
    - [x] Giải phóng Redis lock key và broadcast Socket `seat:state_changed` (`AVAILABLE`).

- [x] **Redis Key Expiration Listener:**
  - [x] Thiết lập Redis Keyspace Notifications listener (`notify-keyspace-events Ex`).
  - [x] Tự động catch sự kiện key Redis hết hạn 10 phút, cập nhật trạng thái ghế về `AVAILABLE` và broadcast Socket real-time.

---

## Phase 4: F&B Combos, CGV Vouchers, E-Wallet & Checkout

- [x] **F&B Concession & Movie Licensing Combos (`src/modules/combo`):**
  - [x] Định nghĩa schema `Combo`, `ComboItem` (My Combo, CGV Combo, Super Saver, ly giữ nhiệt/đồ chơi phim bản quyền).
  - [x] `POST /api/v1/admin/combos`: API Admin tạo combo mới.
  - [x] `PUT /api/v1/admin/combos/:id`: API Admin cập nhật combo.
  - [x] `DELETE /api/v1/admin/combos/:id`: API Admin xóa combo.
  - [x] `GET /api/v1/combos`: API Customer xem danh sách bắp nước & quà tặng bắp nước phim.

- [x] **CGV Vouchers, Coupons & E-Wallet (`src/modules/voucher`, `src/modules/cgv-card`):**
  - [x] Định nghĩa schema `Voucher`, `UserVoucherWallet`, `CGVCard` (Thẻ thành viên / Ví CGV Card).
  - [x] `POST /api/v1/admin/vouchers`: API Admin tạo e-voucher / mã giảm giá mới.
  - [x] `GET /api/v1/vouchers/wallet`: API User xem ví voucher cá nhân.
  - [x] `POST /api/v1/vouchers/claim`: API User nhập mã promo code để lưu voucher vào ví.
  - [x] `POST /api/v1/cgv-card/topup`: API nạp tiền vào thẻ thành viên CGV Card (qua ATM/Visa/Momo).
  - [x] `GET /api/v1/cgv-card/balance`: API xem số dư và lịch sử giao dịch thẻ CGV Card.

- [x] **Mock VNPAY Payment & Checkout Engine (`src/modules/payment`, `src/modules/booking`):**
  - [x] Định nghĩa schema `Booking`, `BookingDetail`, `Payment`, `Invoice`.
  - [x] `POST /api/v1/bookings/checkout`: API tạo đơn đặt vé & khởi tạo giao dịch thanh toán.
  - [x] `POST /api/v1/payments/vnpay/create-url`: API tạo Mock VNPAY Sandbox URL & chuỗi payload mã QR thanh toán (sử dụng thư viện `qrcode`).
  - [x] `GET /api/v1/payments/vnpay/callback`: API xử lý IPN callback từ Mock VNPAY và hoàn tất vé.
  - [x] **Pessimistic Lock & SQL Transaction (`BookingProcessor`):**
    - [x] Mở PostgreSQL SQL Transaction (`prisma.$transaction`).
    - [x] Thực thi `SELECT ... FOR UPDATE` lock hàng ghế trong `ShowtimeSeat`.
    - [x] Validate trạng thái ghế chưa bị `SOLD`.
    - [x] Tính toán giảm giá: Áp dụng Voucher, Điểm thưởng CGV Rewards, Ưu đãi HSSV/U22.
    - [x] Xử lý cổng thanh toán **Mock VNPAY** & Ví CGV Card.
    - [x] Chuyển trạng thái ghế sang `SOLD`.
    - [x] Cộng điểm thưởng CGV Rewards (1 điểm = 1.000 VNĐ) dựa vào hạng hội viên.
    - [x] Xóa Redis Redlock key và broadcast Socket `seat:state_changed` (`SOLD`).
    - [x] Commit Transaction.

- [x] **HMAC-SHA256 Ticket Cryptography & Mock QR (`src/modules/ticket`):**
  - [x] Định nghĩa schema `Ticket` (`ticketId`, `showtimeId`, `seatId`, `qrToken`, `status`).
  - [x] Mã hóa & ký số HMAC-SHA256 QR Token (`Base64URL(HMAC-SHA256(Payload, TICKET_HMAC_SECRET))`) và tạo QR image/payload bằng thư viện `qrcode`.
  - [x] `GET /api/v1/tickets/my-tickets`: API xem danh sách vé điện tử đã mua (kèm token QR để FE render bằng `qrcode.react`).
  - [x] `GET /api/v1/tickets/:id`: API xem chi tiết vé điện tử & hóa đơn thanh toán.

---

## Phase 5: QR Check-in Scanner API, Loyalty & Admin Analytics

- [ ] **Turnstile QR Scanner API (`src/modules/ticket`):**
  - [ ] `POST /api/v1/tickets/verify-qr`: API soát vé cho máy quét cổng rạp CGV.
    - [ ] Authenticate qua header `X-Scanner-Key`.
    - [ ] Giải mã & kiểm tra HMAC signature statelessly (<50ms).
    - [ ] Kiểm tra thời hạn hết hạn suất chiếu `exp`.
    - [ ] Cập nhật trạng thái vé `UNUSED` -> `CHECKED_IN` atomic.
    - [ ] Trả về thông tin xác thực (Tên phim, rạp, phòng chiếu, số ghế, thông tin combo bắp nước đính kèm).

- [ ] **CGV Cultureplex Loyalty & Member Rewards (`src/modules/membership`):**
  - [ ] Engine tự động xét duyệt nâng hạng hội viên hằng năm (`MEMBER` -> `VIP` -> `VVIP`).
  - [ ] Engine tự động tặng quà sinh nhật (CGV Birthday Combo + Vé 2D/3D miễn phí) vào tài khoản hội viên có sinh nhật trong tháng.
  - [ ] `GET /api/v1/membership/history`: API xem lịch sử tích điểm và đổi điểm CGV Rewards.
  - [ ] `POST /api/v1/membership/redeem`: API đổi điểm CGV Rewards lấy vé xem phim hoặc bắp nước.

- [ ] **Admin Dashboard & Operational Analytics (`src/modules/analytics`):**
  - [ ] `GET /api/v1/admin/analytics/dashboard`: View thống kê tổng quan (Doanh thu vé + bắp nước, tỷ lệ lấp đầy rạp, số vé bán trong ngày).
  - [ ] `GET /api/v1/admin/analytics/revenue`: API thống kê doanh thu theo cụm rạp, theo bộ phim, theo khoảng thời gian.
  - [ ] `GET /api/v1/admin/analytics/occupancy`: API thống kê tỷ lệ lấp đầy phòng chiếu (Occupancy %).
  - [ ] `GET /api/v1/admin/analytics/members`: API thống kê số lượng & hành vi tiêu dùng của hội viên theo hạng.

---

## Phase 6: E2E Concurrency Load Testing & Security Hardening

- [ ] **Automated Testing Suite:**
  - [ ] Viết Vitest unit test cho `BookingService`, `ShowtimeService`, `MembershipService`, `TicketService`.
  - [ ] Viết Supertest E2E integration tests cho toàn bộ luồng Auth -> Chọn ghế -> Áp Voucher -> Thanh toán -> Verify QR.

- [ ] **K6 High-Concurrency Load Testing:**
  - [ ] Viết K6 script giả lập 1,000+ Virtual Users (VUs) cùng lúc đặt mua vé ngày công chiếu phim bom tấn CGV.
  - [ ] Kiểm tra và xác nhận 0% double-booking, dữ liệu tài chính & điểm thưởng hoàn toàn nhất quán.

- [ ] **Security & Rate Limiting:**
  - [ ] Cấu hình NestJS Throttler / Rate limiting chống spam endpoints.
  - [ ] Cấu hình Helmet security headers & CORS policy.
  - [ ] Xây dựng cơ chế xoay key (Key Rotation) cho `TICKET_HMAC_SECRET`.
