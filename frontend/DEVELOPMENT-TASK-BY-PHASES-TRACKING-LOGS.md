# Frontend Development Task Logs

> **Note:** This log is strictly for the Frontend Agent to track detailed progress on frontend tasks according to CGV Standards.

## Phase 1: Foundation, Authentication & CGV Membership UI
- [x] Initialize Next.js 15 project (App Router) with TypeScript.
- [x] Setup Tailwind CSS, Shadcn UI, and React 19.
- [x] Configure Global State (Zustand/Redux) & API Client (Axios/Fetch with interceptors).
- [x] **Global UI:** Main Header (Logo, Navigation, User Menu, City Selector) & Footer.
- [x] **Authentication:** Login (Email/Password), Register UI, Forgot Password, Verify U22/FanC.

## Phase 2: Core Browsing & Discovery (Home, Movie, Cinema)
- [x] **Home Page (`/`)**:
  - [x] Dynamic Hero Banner Carousel (Promotions/Featured Movies).
  - [x] Tabbed Widget: "Phim Đang Chiếu" vs "Phim Sắp Chiếu".
  - [x] Promotional Sliders (CGV Promotions, Happy Wednesday, etc.).
- [x] **Movie Pages (`/movies`)**:
  - [x] Movie List with filters (Status, Genre, Format, Rating).
  - `[x]` Movie Detail (Poster, Trailer Modal, Synopsis, Cast, Duration, Reviews section).
  - `[x]` Integrated showtimes section.
- [x] **Cinema Pages (`/cinemas`)**:
  - [x] Cinema List grouped by City/Region.
  - `[x]` Cinema Detail (Info, Map, Facilities like IMAX, 4DX, Sweetbox, L'Amour).

## Phase 3: Real-time Seat Sync & Transient Locking
- [ ] **Step 1: Showtime Selection:** Date Picker & Format Filter.
- [ ] **Step 2: Real-time Seat Matrix:**
  - [ ] Integrate Socket.io client for real-time status sync (Available, Holding, Reserved, Sold, Blocked).
  - [ ] Render Interactive Dynamic Seat Grid (Standard, VIP, Couple/Sweetbox, L'Amour Bed).
  - [ ] Visually differentiate Seat Statuses in real-time.
  - [ ] Implement 10-minute countdown timer (Transient Reservation / Redlock).
  - [ ] Bottom Summary Bar (Selected Seats, Total Price).

## Phase 4: F&B Combos, Vouchers & Mock VNPAY Checkout
- [ ] **Step 3: F&B & Vouchers (`/booking/fb`)**:
  - [ ] Combos List UI (Popcorn, Drinks, Movie Merchandise) with Quantity Selectors.
  - [ ] CGV Vouchers / Promo Code Input & Validation.
  - [ ] CGV Card Balance / Points Redemption UI.
- [ ] **Step 4: Payment & Checkout (`/booking/checkout`)**:
  - [ ] Order Summary Panel (Tickets, Combos, Discounts).
  - [ ] Payment Method Selector (Mock VNPAY, CGV Card, etc.).
  - [ ] Redirect to Mock VNPAY URL / Show Mock VNPAY QR Code.

## Phase 5: Ticketing, User Dashboard & Admin CMS
- [x] **Ticketing & Dashboard (`/user`)**:
  - [x] Post-Payment Success Page with HMAC-SHA256 Encrypted E-Ticket (QR Code via `qrcode.react`).
  - [x] User Dashboard: Profile Settings, CGV Membership Tier (MEMBER, VIP, VVIP), CGV Card Wallet.
  - [x] Booking History & E-Ticket Viewer (Live QR Code display for turnstile scanner).
- [x] **Admin CMS & Cinema Operations (`/admin`)**:
  - [x] Admin Layout: Separate Route, Sidebar & Header.
  - [x] General CMS: Manage Movies, Banners, Cities, Cinemas, Combos, Vouchers.
  - `[x]` **Cinema Management**: Dynamic Room Matrix Layout Builder (Drag & Drop seat grid config).
  - `[x]` **Showtime Scheduler**: Matrix Visual Schedule Grid with Automated Conflict detection UI.
  - `[x]` **Analytics Dashboard**: Revenue Charts, Occupancy Rates, Member Analytics.

## Phase 6: Optimization, Polish & E2E Testing
- [ ] Implement SEO metadata (Title, Description) for Movie/Cinema pages.
- [ ] Mobile-First Responsive Polish (especially Booking flow & Seat Matrix).
- [ ] Add Micro-animations (Hover effects, skeleton loaders, premium CGV dark-theme aesthetics).
- [ ] E2E Integration: Ensure seamless flow from Auth -> Socket Seat Hold -> VNPAY -> QR Verify.
