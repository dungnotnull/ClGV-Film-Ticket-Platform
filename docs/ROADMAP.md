# ROADMAP.md - ClGV Development Roadmap & Milestones

This document outlines the multi-phase engineering roadmap for building, scaling, and verifying the **ClGV Film Ticket Platform**.

---

## 🚩 Phase Overview

```
[ Phase 1 ] ──► [ Phase 2 ] ──► [ Phase 3 ] ──► [ Phase 4 ] ──► [ Phase 5 ] ──► [ Phase 6 ]
 Foundation      Cinema/Hall     Seat Sync &     F&B, Checkout   Scanner API &   Load Testing
 & DB Schema     Scheduler       Redlock Engine  & HMAC QR       Admin Analytics & Hardening
```

---

## 📋 Phase 1: Core Foundation & Infrastructure Setup
* **Goal**: Establish local development environment, database models, and authentication services.
* **Tasks**:
  * [ ] Docker Compose setup for PostgreSQL 16 & Redis 7.
  * [ ] Database Schema Design & Migrations (Users, Roles, Cinemas, Halls, Movies, Showtimes, Seats, Bookings, Tickets, F&B Combos).
  * [ ] User Auth Module (Register, Login, JWT Access/Refresh tokens, Password Hashing, Passport.js, OAuth 2.0).
  * [ ] Base API Infrastructure (Global DTO validation filters, standard JSON HTTP response wrappers, Swagger OpenAPI specs).

---

## 🎬 Phase 2: Cinema Cluster, Hall Matrix & Showtime Scheduler
* **Goal**: Enable cinema administrators to configure halls, seat layouts, and manage showtime schedules.
* **Tasks**:
  * [ ] Cinema & Hall CRUD Endpoints (`/api/v1/cinemas`, `/api/v1/halls`).
  * [ ] Dynamic Room Matrix Builder API & Data Structure (Storing `dimensions`, `aisles`, and `grid` of `SeatNode`).
  * [ ] Movie Management Module (`/api/v1/movies`).
  * [ ] Showtime Scheduler Module (`/api/v1/showtimes`).
  * [ ] Automated Showtime Conflict Detection Engine (Checking overlap against existing projections & cleaning buffers).

---

## ⚡ Phase 3: Real-time Seat Matrix Synchronization & Distributed Redlock Engine
* **Goal**: Implement low-latency real-time seat status synchronization and prevent concurrent seat double-booking.
* **Tasks**:
  * [ ] Redis Setup: ioredis integration, Redis Pub/Sub channels for seat updates.
  * [ ] Socket.io WebSocket Server (`join:showtime`, `seat:select`, `seat:deselect`).
  * [ ] Redlock Distributed Locking Strategy (`lock:seat:{showtime_id}:{seat_id}`).
  * [ ] 10-minute Redis TTL transient seat holding key & countdown state.
  * [ ] Automatic expiration listener (releasing held seats back to `AVAILABLE` on TTL expiration).

---

## 🍿 Phase 4: F&B Combos, Mock VNPAY Checkout & HMAC QR Generation
* **Goal**: Allow users to select concession items, finalize payments via Mock VNPAY Sandbox Gateway, and receive secure, encrypted tickets rendered via mock QR code libraries (`qrcode` / `qrcode.react`).
* **Tasks**:
  * [ ] F&B Combo Catalog Endpoints (`/api/v1/combos`).
  * [ ] Mock VNPAY Payment Integration (`/api/v1/payments/vnpay/create-url`, `/api/v1/payments/vnpay/callback`).
  * [ ] Checkout & Booking Transaction Module (`/api/v1/bookings/checkout`).
  * [ ] PostgreSQL Pessimistic Transaction Engine (`SELECT ... FOR UPDATE` on seat rows).
  * [ ] Cryptographic Ticket Token Generator (`HMAC-SHA256` token signing & mock QR library rendering).
  * [ ] User Booking History & Interactive Ticket QR Code View.

---

## 🎟️ Phase 5: QR Check-in Scanner API & Admin Dashboard Analytics
* **Goal**: Support turnstile check-in hardware validation and executive operational reporting.
* **Tasks**:
  * [ ] Turnstile Check-in Validation API (`POST /api/v1/tickets/verify-qr`).
  * [ ] Stateless HMAC signature verification & single-use ticket check-in state update.
  * [ ] Admin Dashboard Endpoints:
    * Real-time cinema revenue summaries.
    * Occupancy percentage metrics per showtime/hall.
    * Peak booking hour charts.

---

## 🧪 Phase 6: E2E Concurrency Load Testing & Security Hardening
* **Goal**: Validate high-concurrency resilience under extreme simulated ticket drop surges.
* **Tasks**:
  * [ ] Vitest unit & integration test suites for backend modules.
  * [ ] Supertest API end-to-end regression tests.
  * [ ] **K6 Concurrency Load Scripts**: Simulate 1,000+ virtual users attempting to book the exact same high-demand seats simultaneously.
  * [ ] Zero double-booking verification.
  * [ ] Security Audit (Rate limiting, CORS, JWT expiration policies, HMAC key rotation setup).
