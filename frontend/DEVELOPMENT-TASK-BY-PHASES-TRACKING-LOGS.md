# Frontend Development Task Logs

> **Note:** This log is strictly for the Frontend Agent to track detailed progress on frontend tasks according to CGV Standards.

## Phase 1: Foundation, Authentication & CGV Membership UI
- [ ] Initialize Next.js 15 project (App Router) with TypeScript.
- [ ] Setup Tailwind CSS, Shadcn UI, and React 19.
- [ ] Configure Global State (Zustand/Redux) & API Client (Axios/Fetch with interceptors).
- [ ] **Global UI:** Main Header (Logo, Navigation, User Menu, City Selector) & Footer.
- [ ] **Authentication:** Login (Email/Password), Register UI, Forgot Password, Verify U22/FanC.

## Phase 2: Core Browsing & Discovery (Home, Movie, Cinema)
- [ ] **Home Page (`/`)**:
  - [ ] Dynamic Hero Banner Carousel (Promotions/Featured Movies).
  - [ ] Tabbed Widget: "Phim Đang Chiếu" vs "Phim Sắp Chiếu".
  - [ ] Promotional Sliders (CGV Promotions, Happy Wednesday, etc.).
- [ ] **Movie Pages (`/movies`)**:
  - [ ] Movie List with filters (Status, Genre, Format, Rating).
  - [ ] Movie Detail (Poster, Trailer Modal, Synopsis, Cast, Duration, Reviews section).
  - [ ] Integrated showtimes section.
- [ ] **Cinema Pages (`/cinemas`)**:
  - [ ] Cinema List grouped by City/Region.
  - [ ] Cinema Detail (Info, Map, Facilities like IMAX, 4DX, Sweetbox, L'Amour).

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
- [ ] **Ticketing & Dashboard (`/user`)**:
  - [ ] Post-Payment Success Page with HMAC-SHA256 Encrypted E-Ticket (QR Code via `qrcode.react`).
  - [ ] User Dashboard: Profile Settings, CGV Membership Tier (MEMBER, VIP, VVIP), CGV Card Wallet.
  - [ ] Booking History & E-Ticket Viewer (Live QR Code display for turnstile scanner).
- [ ] **Admin CMS & Cinema Operations (`/admin`)**:
  - [ ] Admin Layout: Separate Route, Sidebar & Header.
  - [ ] General CMS: Manage Movies, Banners, Cities, Cinemas, Combos, Vouchers.
  - [ ] **Cinema Management**: Dynamic Room Matrix Layout Builder (Drag & Drop seat grid config).
  - [ ] **Showtime Scheduler**: Matrix Visual Schedule Grid with Automated Conflict detection UI.
  - [ ] **Analytics Dashboard**: Revenue Charts, Occupancy Rates, Member Analytics.

## Phase 6: Optimization, Polish & E2E Testing
- [ ] Implement SEO metadata (Title, Description) for Movie/Cinema pages.
- [ ] Mobile-First Responsive Polish (especially Booking flow & Seat Matrix).
- [ ] Add Micro-animations (Hover effects, skeleton loaders, premium CGV dark-theme aesthetics).
- [ ] E2E Integration: Ensure seamless flow from Auth -> Socket Seat Hold -> VNPAY -> QR Verify.
