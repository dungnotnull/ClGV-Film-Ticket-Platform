# PROJECT-DETAIL.md - ClGV Film Ticket Platform Comprehensive Specification

---

## 1. Executive Summary

**ClGV** is a modern, high-concurrency, multi-role film ticket booking platform inspired by CGV. The system is engineered to solve real-world problems in movie ticketing infrastructure:
1. **High-concurrency flash-sales**: Handling thousands of simultaneous seat selections when popular blockbuster tickets drop.
2. **Double-booking prevention**: Guaranteeing atomic seat locks across micro-seconds without database deadlocks.
3. **Dynamic hall matrix configuration**: Supporting irregular seating layouts (varying rows, columns, aisles, VIP/Couple seating tiers, accessible seats).
4. **Dynamic Multi-Cinema & Multi-City Architecture**: Managing multiple cinema clusters across various cities (TP.HCM, Hà Nội, Đà Nẵng, Cần Thơ, etc.), allowing users to easily switch cities and find nearest cinema locations.
5. **Admin CMS Dynamic Publishing**: Full backoffice CMS enabling admins to create and publish movies, cinema clusters, cities, halls, showtimes, banners, combos, and promotions. All admin entries immediately and dynamically reflect on the user-facing Homepage (`/home`) in real-time.
6. **Mock VNPAY & QR Generation**: Streamlined checkout using a **Mock VNPAY Payment Gateway** sandbox flow and a **Mock QR Code generation library** (`qrcode` / `qrcode.react`) for payment QR codes and stateless HMAC ticket validation.
7. **Polished CGV-Inspired UI**: Built with **Next.js 15 (App Router)**, featuring a premium dark-themed interface, interactive seat matrix, micro-animations, and responsive design.

---

## 2. Functional Requirements Matrix

### 2.1 Customer Facing Experience (Next.js 15 Polished UI)
* **Movie Discovery & Catalog**: Filter movies by status (`NOW_SHOWING`, `COMING_SOON`), genres, age rating (`P`, `K`, `T13`, `T16`, `T18`), format (`2D`, `3D`, `IMAX`, `4DX`), and language (`SUB`, `DUB`).
* **Interactive Dynamic Seat Picker**:
  * Real-time canvas/SVG rendering of hall layouts (Rows A–Z, Columns 1–N).
  * Color-coded status markers: `AVAILABLE` (selectable), `HOLDING` (held by current user or another user in real time), `RESERVED` (pending payment), `SOLD` (booked), `BLOCKED` (maintenance/venue restricted).
  * Seat types: Standard, VIP, Sweetbox (Couple / double width), Accessible.
  * Real-time WebSocket synchronization (shows other users' live selections with minimal latency).
* **Transient 10-Minute Lock Timer**:
  * Upon selecting seats, a 10-minute lock is assigned in Redis.
  * Live countdown timer displayed in the UI checkout bar.
  * Automatic release of seats back to `AVAILABLE` status if timer expires without completed payment.
* **F&B Add-ons & Combos**:
  * Select popcorn, beverage, and candy combos alongside ticket purchase.
  * Dynamic price calculation (Seat Prices * Modifiers + F&B Items in VND integer).
* **Mock VNPAY Payment & QR Ticket Generation**:
  * **Mock VNPAY Gateway integration**: User redirected to Mock VNPAY sandbox page or presented with VNPAY payment QR generated via mock QR library.
  * Instant generation of HMAC-SHA256 encrypted QR ticket tokens rendered via `qrcode.react`.
* **User Dashboard & Booking History**:
  * Active tickets view with live renderable QR codes.
  * Historical receipts, invoice download, and booking status tracking.

### 2.2 Admin & Theater Operations (Backoffice)
* **Cinema Cluster & Hall Management**:
  * Configure cinema locations, hall names, screen types (IMAX, 4DX, Standard, Gold Class), projection equipment.
  * **Dynamic Matrix Layout Builder**: Drag-and-drop or grid tool to define rows, columns, aisle gaps, seat types, and price modifiers.
* **Showtime Scheduler Matrix**:
  * Visual schedule grid mapping movies to specific halls and time slots.
  * **Automated Conflict Detection Engine**: Rejects showtime schedules that overlap with existing movies or violate cleaning/maintenance buffers (e.g. 15-minute inter-session buffer).
* **QR Ticket Check-in Scanner API**:
  * High-speed validation endpoint for handheld turnstile devices (`POST /api/v1/tickets/verify-qr`).
  * Validates HMAC signature, checks ticket usage status (`UNUSED` -> `CHECKED_IN`), prevents ticket reuse and counterfeiting.
* **Analytics & Reporting Dashboard**:
  * Daily/Monthly revenue breakdowns per cinema cluster.
  * Occupancy rate metrics (%) per showtime, hall, and movie.
  * Peak booking hours and popular seating tier analytics.

---

## 3. Technical Architecture & Engineering Solutions

### 3.1 Concurrency & Distributed Locking Workflow

```
[ User A / User B ]
        │ (Socket.io Select Seat)
        ▼
[ Redis Pub/Sub ] ──── Broadcast state ("HOLDING") to all connected clients
        │
        │ (Proceeds to Mock VNPAY Payment)
        ▼
[ Distributed Redlock ] ──► Key: `lock:seat:{showtime_id}:{seat_id}`
   ├──► Lock acquired?  ── Yes ──► [ Postgres Transaction ]
   │                                   │
   └──► Lock failed?                   ├──► SELECT ... FOR UPDATE
          │                            ├──► Create Reservation & Invoice
          ▼                            └──► COMMIT & Release Redlock
      (Return HTTP 409                  │
       "Seat Already Held")             ▼
                                [ Redis Pub/Sub ] ──► Broadcast "SOLD"
```

1. **Step 1 (Transient Socket Selection)**: User clicks seat on matrix -> Frontend emits `seat:select` via Socket.io -> Backend attempts Redis `SET lock:seat:{showtime_id}:{seat_id} {user_id} NX EX 600`.
2. **Step 2 (Conflict Handling)**: If key already exists in Redis, server emits error to client and HTTP 409 `SEAT_ALREADY_HELD` if called via REST.
3. **Step 3 (Mock VNPAY Payment Checkout Transaction)**:
   * System generates Mock VNPAY payment URL & QR code payload.
   * Backend executes Redlock algorithm to ensure multi-node locking across Redis cluster.
   * Opens PostgreSQL SQL Transaction (`BEGIN`).
   * Queries seat rows with `SELECT status FROM showtime_seats WHERE showtime_id = $1 AND seat_id = $2 FOR UPDATE`.
   * Verifies status is not `SOLD`.
   * Inserts booking record, updates seat status to `SOLD`, commits SQL transaction (`COMMIT`).
   * Releases Redlock key and publishes `SOLD` event to Redis Pub/Sub.

### 3.2 Dynamic Room Matrix JSON Schema

```typescript
type SeatType = 'STANDARD' | 'VIP' | 'COUPLE' | 'ACCESSIBLE' | 'EMPTY_SPACE';

interface SeatNode {
  id: string;            // e.g., "H12"
  row: string;           // "A" .. "Z"
  col: number;           // 1 .. N
  type: SeatType;
  priceModifier: number; // e.g., 1.0 for Standard, 1.25 for VIP, 1.8 for Couple
  isBlocked: boolean;    // Maintenance or reserved for physical venue needs
}

interface RoomMatrix {
  dimensions: { rows: number; cols: number };
  aisles: { vertical: number[]; horizontal: number[] };
  grid: SeatNode[][];
}
```

### 3.3 HMAC-SHA256 Encrypted Ticket Token Format

To support ultra-fast, stateless check-ins at theater turnstiles without causing database read spikes:
* **Token Structure**: `HEADER.PAYLOAD.SIGNATURE`
* **Payload**:
  ```json
  {
    "ticketId": "tkt_89f3a12b",
    "showtimeId": "st_456",
    "cinemaId": "cin_01",
    "hallId": "hall_03",
    "seatIds": ["H12", "H13"],
    "iat": 1754438400,
    "exp": 1754449200
  }
  ```
* **Signature**: `Base64URL(HMAC-SHA256(Base64URL(Payload), TICKET_HMAC_SECRET))`
* **Turnstile Check-in Flow**:
  1. Turnstile scanner reads QR code string rendered via mock QR library (`qrcode.react`).
  2. Server verifies `HMAC-SHA256` signature using `TICKET_HMAC_SECRET`.
  3. If signature matches and `exp` is valid, server performs quick atomic update on ticket check-in status (`status = 'CHECKED_IN'`).
  4. Access granted in < 50ms.

---

## 4. Environment & Stack Specifications

* **Backend**: Node.js (`v20.x` LTS), NestJS / Express, TypeScript, Prisma ORM / TypeORM, `qrcode` mock library
* **Frontend**: Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, Shadcn UI, `qrcode.react` (Polished CGV-inspired dark mode UI)
* **Database**: PostgreSQL 16
* **Cache & Distributed Lock**: Redis 7 (ioredis, Redlock)
* **Payment Gateway**: Mock VNPAY Payment Gateway (Sandbox simulation flow)
* **Real-time Protocol**: WebSockets / Socket.io
* **Testing & Quality Assurance**: Vitest (Unit/Integration), Supertest (API HTTP tests), K6 (Concurrency load testing)
