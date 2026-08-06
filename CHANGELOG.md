# CHANGELOG.md

All notable changes to the **ClGV Film Ticket Platform** project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Planned
- Complete Phase 1 Database migrations (Prisma/TypeORM) for Users, Cinemas, Halls, Movies, Showtimes, Seats, Bookings, Tickets.
- Implement Authentication Module (JWT Access + Refresh tokens, OAuth 2.0).
- Construct Socket.io WebSocket server & Redis Pub/Sub integration.

## [0.4.0] - 2026-08-06

### Added
- **Phase 3 Real-time Seat Sync & Distributed Redlock Engine**:
  - Implemented `RedisService` (`src/modules/redis`) for Redlock transient seat locking (`lock:seat:{showtimeId}:{seatId}`) with 10-minute TTL and Keyspace Expiration listeners.
  - Implemented `WebsocketGateway` (`src/modules/websocket`) for real-time room streaming (`join:showtime`, `seat:select`, `seat:deselect`, `seat:state_changed`).
- **Phase 4 F&B Combos, CGV Vouchers, E-Wallet & Checkout Engine**:
  - Implemented `ComboModule` (`POST /api/v1/admin/combos`, `GET /api/v1/combos`, `PUT /admin/combos/:id`, `DELETE /admin/combos/:id`).
  - Implemented `VoucherModule` (`POST /api/v1/admin/vouchers`, `GET /api/v1/vouchers/wallet`, `POST /api/v1/vouchers/claim`).
  - Implemented `CGVCardModule` (`POST /api/v1/cgv-card/topup`, `GET /api/v1/cgv-card/balance`).
  - Implemented `BookingModule` (`POST /api/v1/bookings/hold-seat`, `POST /api/v1/bookings/release-seat`, `POST /api/v1/bookings/checkout`) with Pessimistic Locking (`SELECT ... FOR UPDATE`), voucher discounts, CGV Rewards points deduction/accumulation.
  - Implemented `PaymentModule` (`POST /api/v1/payments/vnpay/create-url`, `GET /api/v1/payments/vnpay/callback`).
  - Implemented `TicketModule` (`GET /api/v1/tickets/my-tickets`, `GET /api/v1/tickets/:id`, `POST /api/v1/tickets/verify-qr`) with cryptographic HMAC-SHA256 QR tokens.

---

## [0.3.0] - 2026-08-06

### Added
- **Phase 5 Implementation: Turnstile QR Scanner, Loyalty & Admin Analytics APIs**:
  - **Admin Dashboard & Operational Analytics (`src/modules/analytics`)**: Implemented `GET /api/v1/admin/analytics/dashboard` (summary stats), `GET /api/v1/admin/analytics/revenue` (revenue breakdown by cinema, movie, timeline), `GET /api/v1/admin/analytics/occupancy` (occupancy rate % stats), and `GET /api/v1/admin/analytics/members` (membership tier distribution stats).
  - **Turnstile QR Scanner & Ticket Check-in (`src/modules/ticket`)**: Implemented `POST /api/v1/tickets/verify-qr` (stateless HMAC verification with `X-Scanner-Key` auth header) and `GET /api/v1/tickets/my-tickets` (customer E-Ticket list).
  - **CGV Cultureplex Loyalty & Member Rewards (`src/modules/membership`)**: Implemented `GET /api/v1/membership/history` (view CGV Rewards points history & tier evaluation) and `POST /api/v1/membership/redeem` (redeem rewards points for tickets/combos).
  - Updated [API-CONTRACT.md](file:///d:/ClGV-Film-Ticket-Platform/API-CONTRACT.md) and [DEVELOPMENT-TASK-BY-PHASES-TRACKING-LOGS.md](file:///d:/ClGV-Film-Ticket-Platform/backend/DEVELOPMENT-TASK-BY-PHASES-TRACKING-LOGS.md).

---

## [0.2.0] - 2026-08-06

### Added
- **Backend Architecture Setup (Phase 1 & Phase 2)**: Built NestJS TypeScript backend in `/backend`.
- **Database Prisma Models & Seeder**: Created complete PostgreSQL schema for `User`, `City`, `Cinema`, `Hall`, `Movie`, `Showtime`, `ShowtimeSeat`, `Banner`, `Booking`, `Ticket`, `MovieReview`. Included database seeder `prisma/seed.ts`.
- **Authentication & Roles Module**: Implemented JWT Access/Refresh tokens, Password hashing with bcrypt, Passport JWT strategy, `@Roles()` decorator, and `RolesGuard`.
- **Cities & Location Management Module**: Implemented `POST /api/v1/admin/cities`, `GET /api/v1/cities`, `PUT /api/v1/admin/cities/:id`, `DELETE /api/v1/admin/cities/:id`.
- **Cinemas & Halls Matrix Module**: Implemented `POST /api/v1/cinemas`, `GET /api/v1/cinemas`, `POST /api/v1/halls`, `PUT /api/v1/halls/:id/matrix`, `GET /api/v1/halls/:id/matrix`.
- **Movie Catalog Module**: Implemented `POST /api/v1/admin/movies`, `GET /api/v1/movies`, `GET /api/v1/movies/:id`.
- **Banners CMS Module**: Implemented `POST /api/v1/admin/banners`, `GET /api/v1/admin/banners`, `GET /api/v1/banners/active`.
- **Showtime Scheduler Module**: Implemented `POST /api/v1/admin/showtimes` with 15-minute inter-session conflict detection and automatic seat matrix initialization.
- **Dynamic Home Aggregator Module**: Implemented `GET /api/v1/home` dynamically aggregating active banners, now-showing movies, coming-soon movies, cities, and cinemas per selected city.
- **Global Standards**: Added `AllExceptionsFilter` and `TransformInterceptor` matching `API-CONTRACT.md` JSON output format.
- **Swagger Documentation**: Configured OpenAPI Swagger UI on `/api/docs`.
