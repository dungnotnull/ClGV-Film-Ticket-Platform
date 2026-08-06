# Frontend Development Task & Phase Tracking Log (CGV Standards)

> **NOTICE FOR FE-AGENT**:
> File này là log theo dõi tiến độ chi tiết từng Phase và từng Feature/Task nhỏ dựa trên tiêu chuẩn các tính năng của **CGV Việt Nam (cgv.vn)**.
> Mỗi khi làm xong một task/feature, FE-agent hãy đánh dấu `[x]` vào ô check-box tương ứng.

---

## Phase 1: Foundation, Authentication & CGV Membership UI

- [x] **Project Setup & Architecture:**
  - [x] Khởi tạo dự án Next.js 15 (App Router) với TypeScript.
  - [x] Setup Tailwind CSS, Shadcn UI, và React 19.
  - [x] Cấu hình Global State (Zustand) & API Client (Axios interceptors để xử lý Refresh Token).
  - [x] **Global UI:** Xây dựng Main Header (Logo, Navigation, User Menu, City Selector) & Footer theo chuẩn CGV.

- [x] **Auth, User & CGV Membership (`/login`, `/register`, `/user/profile`):**
  - [x] Giao diện đăng ký tài khoản (Register UI).
  - [x] Giao diện đăng nhập (Login UI - Email/Password).
  - [x] Quản lý state đăng nhập, lưu trữ Access Token & xử lý luồng Refresh Token.
  - [x] Giao diện xem/cập nhật thông tin cá nhân (Profile Settings, ngày sinh, SĐT).
  - [x] Giao diện xác minh độ tuổi U22/FanC (Upload giấy tờ).
  - [x] Hiển thị thông tin hạng hội viên CGV (MEMBER, VIP, VVIP) và số điểm CGV Rewards.

---

## Phase 2: Core Browsing, Discovery & Cinema Matrix

- [x] **Dynamic Home Page (`/`):**
  - [x] Dynamic Hero Banner Carousel (Tích hợp API Banner/Slider khuyến mãi).
  - [x] Tabbed Widget "Phim Đang Chiếu" vs "Phim Sắp Chiếu".
  - [x] Khối hiển thị chương trình khuyến mãi (CGV Promotions, Happy Wednesday, etc.).

- [x] **Movie Catalog & Reviews (`/movies`, `/movies/[id]`):**
  - [x] Trang danh sách phim kèm bộ lọc (Status, Genre, Format, Rating, Text Search).
  - [x] Trang chi tiết phim (Poster, Trailer Modal, Tóm tắt, Diễn viên, Thời lượng).
  - [x] Tích hợp section xem lịch chiếu (Showtimes) trực tiếp trên trang chi tiết phim.
  - [x] Giao diện xem đánh giá và form gửi review/đánh giá sao cho phim.

- [x] **Cinema Pages (`/cinemas`, `/cinemas/[id]`):**
  - [x] Trang danh sách rạp, nhóm theo Thành phố/Khu vực.
  - [x] Trang chi tiết rạp (Thông tin địa chỉ, Bản đồ, Hotline, Tiện ích rạp như IMAX, 4DX, Sweetbox, L'Amour).

---

## Phase 3: Showtime Selection, Real-time Seat Sync & Transient Locking

- [x] **Showtime Selection & Filters (`/booking/showtime` hoặc tích hợp trên `/movies`):**
  - [x] Date Picker & Format Filter (2D, 3D, IMAX, 4DX).
  - [x] Hiển thị danh sách khung giờ chiếu nhóm theo Rạp.

- [x] **Real-time Dynamic Seat Matrix (`/booking/seat`):**
  - [x] Tích hợp Socket.io client để sync trạng thái ghế real-time.
  - [x] Xây dựng UI Dynamic Seat Grid dựa trên cấu hình ma trận phòng chiếu (Render chuẩn xác các hàng, cột, lối đi - Aisle).
  - [x] Hiển thị trực quan các loại ghế (Standard, VIP, Couple/Sweetbox, L'Amour Bed).
  - [x] Cập nhật UI theo trạng thái ghế (Available, Holding, Reserved, Sold, Blocked) real-time.
  - [x] Xử lý sự kiện click chọn ghế (Gửi API Hold Seat) và bắt lỗi Conflict (ghế đã bị người khác chọn).
  - [x] Giao diện đồng hồ đếm ngược 10 phút giữ ghế.
  - [x] Bottom Summary Bar (Danh sách ghế đã chọn, Tạm tính tiền).

---

## Phase 4: F&B Combos, CGV Vouchers, E-Wallet & Checkout

- [x] **F&B Concessions (`/booking/fb`):**
  - [x] Giao diện danh sách Combos bắp nước & quà tặng (Popcorn, Drinks, Movie Merchandise).
  - [x] Input chọn số lượng từng loại combo, tính tổng tiền.

- [x] **CGV Vouchers, Coupons & E-Wallet (`/booking/checkout`, `/user/wallet`):**
  - [x] Giao diện ví voucher (User Wallet) trong trang quản lý cá nhân.
  - [x] Input nhập Promo code để claim voucher.
  - [x] UI áp dụng voucher giảm giá vào đơn hàng đặt vé.
  - [x] UI hiển thị số dư CGV Card và chọn thanh toán/đổi điểm (CGV Rewards).
  - [x] Chức năng Top-up tiền vào thẻ CGV Card.

- [x] **Payment & Checkout (`/booking/checkout`):**
  - [x] Order Summary Panel (Tổng hợp Vé, Combos, Khuyến mãi, Thành tiền).
  - [x] Payment Method Selector (Mock VNPAY, Ví CGV Card).
  - [x] Hiển thị Mock VNPAY QR Code hoặc Redirect tới Mock VNPAY URL để thanh toán.
  - [x] Xử lý màn hình Success (Post-payment) / Error (Thanh toán thất bại).

---

## Phase 5: E-Ticketing, Turnstile QR Scanner & Admin CMS

- [x] **User Dashboard & E-Ticketing (`/user/tickets`):**
  - [x] Giao diện danh sách vé điện tử đã mua (Lịch sử đặt vé).
  - [x] E-Ticket Viewer: Hiển thị chi tiết vé (Tên phim, Rạp, Ghế, Combo) kèm Live QR Code (sử dụng thư viện `qrcode.react`) cho Turnstile scanner.

- [x] **Admin CMS & Cinema Operations (`/admin`):**
  - [x] Admin Layout: Separate Route, Sidebar & Header, Phân quyền truy cập.
  - [x] Quản lý danh mục chung: Quản lý Phim, Banner, Thành phố, Rạp, Combos, Vouchers.
  - [x] **Cinema Management (Room Matrix Builder):** Công cụ xây dựng sơ đồ phòng chiếu trực quan (Kéo thả cấu hình Seat Grid, Aisle gaps, loại ghế).
  - [x] **Showtime Scheduler:** Giao diện lập lịch suất chiếu dạng Visual Schedule Grid, có cảnh báo Conflict (Trùng lịch chiếu).
  - [x] **Analytics Dashboard:** Hiển thị biểu đồ thống kê (Doanh thu, Tỷ lệ lấp đầy - Occupancy Rates, Hành vi khách hàng).

---

## Phase 6: Optimization, Polish & E2E Testing

- [ ] **SEO & Metadata:**
  - [ ] Implement SEO metadata (Title, Description, Open Graph) cho các trang quan trọng (Phim, Rạp, Trang chủ).

- [ ] **UI/UX Polish & Aesthetics:**
  - [ ] Mobile-First Responsive: Tối ưu UI cho màn hình di động, đặc biệt là luồng Đặt vé (Booking flow) và Seat Matrix.
  - [ ] Thêm Micro-animations (Hover effects, Skeleton loaders, Framer Motion/CSS transitions).
  - [ ] Áp dụng chuẩn Premium CGV dark-theme aesthetics (Dark mode UI, vibrant accents).

- [ ] **E2E Integration & Performance:**
  - [ ] Kiểm tra E2E xuyên suốt luồng: Auth -> Chọn ghế (Socket Hold) -> Bắp nước -> Thanh toán VNPAY -> Verify QR Code.
  - [ ] Tối ưu hóa API Client (Caching, Pagination, Error Handling).
