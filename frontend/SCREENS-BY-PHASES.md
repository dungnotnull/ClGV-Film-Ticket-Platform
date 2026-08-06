# Frontend Screens by Phases

Tài liệu này liệt kê chi tiết các màn hình (screens/pages) sẽ được thiết kế và phát triển trong từng giai đoạn (Phase) của phần Frontend, đồng bộ với kiến trúc và backend (CGV Standards). Sử dụng các checkbox để đánh dấu tiến độ hoàn thành.

## Phase 1: Foundation, Authentication & CGV Membership UI
*Tập trung vào bộ khung giao diện, xác thực người dùng và thông tin thẻ hội viên CGV.*

- [ ] **Màn hình Đăng nhập** (`/login`)
- [ ] **Màn hình Đăng ký** (`/register`) - Tích hợp khởi tạo thẻ CGV.
- [ ] **Màn hình Quên mật khẩu** (`/forgot-password`)
- [ ] *(Thành phần Global: Main Header (có chọn City), Main Footer, User Dropdown Menu)*

## Phase 2: Core Browsing & Discovery (Home, Movie, Cinema)
*Giao diện phục vụ khách hàng lướt xem phim, rạp và các chương trình khuyến mãi.*

- [ ] **Màn hình Trang chủ** (`/`) - Hero Banner động, danh sách Phim đang/sắp chiếu, Slider Khuyến mãi.
- [ ] **Màn hình Danh sách Phim** (`/movies`) - Bộ lọc theo trạng thái, thể loại, định dạng, độ tuổi.
- [ ] **Màn hình Chi tiết Phim** (`/movies/[id]`) - Trailer, Thông hiện, Review và Lịch chiếu.
- [ ] **Màn hình Danh sách Rạp** (`/cinemas`) - Gom nhóm rạp theo Thành phố/Khu vực.
- [ ] **Màn hình Chi tiết Rạp** (`/cinemas/[id]`) - Bản đồ, cơ sở vật chất (IMAX, 4DX, L'Amour...) và lịch chiếu.

## Phase 3: Real-time Seat Sync & Transient Locking
*Luồng đặt vé cốt lõi - Chọn suất chiếu và ghế realtime qua WebSocket.*

- [ ] **Màn hình Chọn Suất Chiếu** (`/booking/showtimes`) - Chọn ngày, định dạng phim và suất chiếu.
- [ ] **Màn hình Chọn Ghế Ngồi** (`/booking/seats`) - Sơ đồ ma trận ghế động (Standard, VIP, Couple), đồng bộ trạng thái realtime (Socket.io), hiển thị đồng hồ đếm ngược 10 phút.

## Phase 4: F&B Combos, Vouchers & Mock VNPAY Checkout
*Xử lý bắp nước, khuyến mãi, điểm thưởng và thanh toán.*

- [ ] **Màn hình Chọn Bắp Nước & Voucher** (`/booking/fb`) - Chọn combo bắp nước, áp dụng CGV Voucher / Điểm thưởng.
- [ ] **Màn hình Thanh toán** (`/booking/checkout`) - Tóm tắt đơn hàng, chọn phương thức (Mock VNPAY, Ví CGV) và hiển thị URL/QR VNPAY.

## Phase 5: Ticketing, User Dashboard & Admin CMS
*Quản lý vé điện tử, thông tin hội viên và Hệ thống Quản trị (Admin CMS).*

- [ ] **Màn hình Vé điện tử (Thành công)** (`/booking/success`) - Hiển thị E-Ticket chứa QR Code HMAC (qrcode.react).
- [ ] **Màn hình Dashboard Cá nhân** (`/user/profile`) - Quản lý tài khoản, hạng thẻ (MEMBER/VIP), Ví CGV Card.
- [ ] **Màn hình Lịch sử Giao dịch** (`/user/history`) - Xem danh sách vé đã mua và vé chờ Check-in.
- [ ] **Màn hình Tổng quan Admin** (`/admin`) - Layout Admin (Sidebar, Header), Thống kê doanh thu & lấp đầy (Analytics).
- [ ] **Màn hình Quản trị CMS** (`/admin/cms`) - Quản lý Phim, Rạp, Banner, Bắp nước, Voucher.
- [ ] **Màn hình Quản lý Sơ đồ Phòng chiếu** (`/admin/halls/[id]/matrix`) - Trình kéo thả (Drag & Drop Editor) cấu hình ma trận ghế động.
- [ ] **Màn hình Quản lý Lịch chiếu** (`/admin/showtimes`) - Lịch biểu lưới, tự động cảnh báo xung đột giờ chiếu.

## Phase 6: Optimization, Polish & E2E Testing
*(Giai đoạn tối ưu hóa trải nghiệm, hiệu năng và thẩm mỹ)*

- [ ] Tối ưu Responsive (chuẩn Mobile-first, đặc biệt cho Sơ đồ ghế).
- [ ] Cải thiện SEO (Meta tags, OpenGraph) cho các trang public.
- [ ] Bổ sung hiệu ứng Micro-animations, Skeleton loaders và giao diện Dark-theme chuẩn CGV.
- [ ] Kiểm thử E2E giao diện toàn bộ luồng Booking -> Thanh toán -> Validate QR.
