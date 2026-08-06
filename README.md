# ClGV - A Simulator Film Ticket Platform 🎬

**ClGV** is a high-concurrency, multi-role film ticket booking platform inspired by CGV. Built on Node.js, PostgreSQL, Redis, and Next.js, it solves real-time seat synchronization, distributed race conditions during flash-sale booking spikes, dynamic theater layout rendering, and secure HMAC-signed QR ticket check-in workflows.

---

## 🌟 Key Features

### 🎟️ User Experience

* **Real-time Seat Matrix:** Dynamic seat grid (A–Z rows, 1–N columns) rendered instantly. Real-time state synchronization via WebSockets shows when other users hold or select seats.
* **Transient Seat Reservation:** Selected seats are locked with a 10-minute Redis TTL timer.
* **F&B Add-ons & Combos:** Select popcorn and beverage combos alongside ticket purchases.
* **HMAC QR Ticket Generation:** Encrypted, tamper-proof QR code tickets generated immediately upon successful booking for scanner validation at the theater.
* **Interactive Booking History:** View past/upcoming tickets, live QR codes, and invoice receipts.

### 🛡️ Administration & Theater Operations

* **Multi-Cinema & Hall Management:** Configure theater clusters, screening rooms, seat layouts, and projection/sound capabilities (2D, 3D, IMAX, 4DX).
* **Showtime Scheduler Matrix:** Schedule movies across halls with automated conflict detection (overlapping projection times and maintenance buffers).
* **Ticket Check-in Scanner API:** Fast QR validation endpoint using HMAC signature verification to prevent ticket counterfeiting and double entry.
* **Financial & Occupancy Analytics:** Visual dashboards tracking daily revenue, hall occupancy rates, and peak booking hours.

---

## ⚡ Technical Architecture & Concurrency Control

### 1. High-Concurrency Lock Flow (Double Booking Prevention)

To ensure no two users can book the exact same seat during high-demand release spikes, **ClGV** uses a two-tier locking strategy combining distributed Redis locks (**Redlock**) with PostgreSQL pessimistic transactions (`SELECT ... FOR UPDATE`).

```
[ User A / User B ]
        │ (Socket.io Select Seat)
        ▼
[ Redis Pub/Sub ] ──── Broadcast state ("HOLDING") to all connected clients
        │
        │ (Proceeds to Payment)
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

### 2. Dynamic Matrix Data Structure

Theater rooms vary in dimensions, aisle locations, and seat tiers (Standard, VIP, Couple). Seat layouts are stored as a structured JSON document in PostgreSQL and transformed into an indexable coordinate map at runtime:

```typescript
type SeatType = 'STANDARD' | 'VIP' | 'COUPLE' | 'ACCESSIBLE' | 'EMPTY_SPACE';

interface SeatNode {
  id: string;            // e.g., "H12"
  row: string;           // "A" .. "Z"
  col: number;           // 1 .. N
  type: SeatType;
  priceModifier: number; // e.g., 1.0 for Standard, 1.25 for VIP
  isBlocked: boolean;    // Maintenance or reserved for physical venue needs
}

interface RoomMatrix {
  dimensions: { rows: number; cols: number };
  aisles: { vertical: number[]; horizontal: number[] };
  grid: SeatNode[][];
}

```

### 3. HMAC-SHA256 Encrypted Ticket Tokens

Tickets generate a cryptographic payload to allow fast, stateless check-in validation at theater turnstiles without hitting the primary database on every scan..

---

## 🛠️ Tech Stack

| Domain | Technology |
| --- | --- |
| **Frontend** | Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, Shadcn UI |
| **Backend API** | Node.js, Express.js / NestJS, TypeScript, Prisma ORM / TypeORM |
| **Database** | PostgreSQL 16 |
| **Caching & Locks** | Redis 7 (Redlock for distributed locking, Pub/Sub for WebSockets) |
| **Real-Time** | Socket.io / Native WebSockets |
| **Authentication** | JWT (Access + Refresh tokens), Passport.js, OAuth 2.0 |
| **Testing** | Vitest, Supertest, K6 (Load testing concurrency limits) |

---

## 📂 Repository Structure

```
clgv-platform/
├── backend/
│   ├── src/
│   │   ├── modules/
│   │   │   ├── auth/            # JWT & OAuth flows
│   │   │   ├── cinema/          # Cinema clusters & halls
│   │   │   ├── showtime/        # Matrix scheduling & conflict checks
│   │   │   ├── booking/         # Redlock concurrency & transaction engine
│   │   │   ├── ticket/          # HMAC QR generation & check-in
│   │   │   └── websocket/       # Redis PubSub seat matrix synchronization
│   │   ├── common/              # Guards, interceptors, dynamic matrix helpers
│   │   └── database/            # Prisma/TypeORM migrations & seeders
│   └── test/                    # Unit, integration, and K6 concurrency tests
├── frontend/
│   ├── src/
│   │   ├── app/                 # Next.js App Router (pages & layouts)
│   │   ├── components/
│   │   │   ├── seat-matrix/     # Canvas / HTML SVG dynamic seat picker
│   │   │   ├── checkout/        # Timer, F&B selection, payment gateway
│   │   │   └── admin/           # Showtime matrix grid editor
│   │   ├── hooks/               # WebSocket real-time seat sync hooks
│   │   └── lib/                 # API client & matrix transformation utils
└── docker-compose.yml           # Local dev stack (Postgres, Redis, Adminer)

```

---

## 🚀 Getting Started

### Prerequisites

* **Node.js**: `v20.x` or higher
* **npm** / **pnpm**: `v9.x`+
* **Docker & Docker Compose** (for PostgreSQL and Redis)

### Setup Instructions

1. **Clone the Repository**
```bash
git clone https://github.com/your-username/clgv-ticket-platform.git
cd clgv-ticket-platform

```


2. **Start Local Infrastructure**
```bash
docker-compose up -d

```


3. **Backend Configuration & Setup**
```bash
cd backend
cp .env.example .env
npm install
npm run db:migrate
npm run db:seed
npm run start:dev

```


4. **Frontend Configuration & Setup**
```bash
cd ../frontend
cp .env.example .env.local
npm install
npm run dev

```


5. **Access Application**
* **Web App:** `http://localhost:3000`
* **Backend API Docs (Swagger):** `http://localhost:4000/api/docs`
