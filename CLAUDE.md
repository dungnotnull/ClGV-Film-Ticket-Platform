# CLAUDE.md - Root Project Instructions & Guidelines

Welcome to **ClGV - Film Ticket Platform**. This document serves as the global single-source-of-truth for project structure, module communication conventions, overall system architecture, and developer guidelines for both human developers and AI sub-agents.

---

## 1. Project Overview & Core Requirements

**ClGV** is a high-concurrency, multi-role film ticket booking platform inspired by CGV. The system addresses critical distributed systems challenges:
* **Dynamic Multi-Cinema & Multi-City Architecture**: Flexible catalog structure supporting multiple cinema chains/clusters categorized by cities/regions (e.g., TP.HCM, Hà Nội, Đà Nẵng, Cần Thơ). Each cinema contains multiple screening halls with dynamic room matrix layouts.
* **Admin CMS Dynamic Publishing**: Complete Admin CMS where administrators create, edit, delete, and publish movies, cinema clusters, cities, halls, showtimes, banners, combos, and promotions. All Admin modifications dynamically update and reflect in real-time on the user-facing Homepage (`/home`) and discovery pages.
* **Frontend Architecture**: Built on **Next.js 15 (App Router)**, React 19, Tailwind CSS, and Shadcn UI. Features a highly polished, premium CGV-inspired UI/UX design system with dark mode aesthetics, interactive seat picker grid, micro-animations, and responsive layouts.
* **Backend Architecture**: Built on **Node.js** (NestJS / Express TypeScript), PostgreSQL 16, Prisma/TypeORM, and Redis 7.
* **Payment Integration**: Uses **Mock VNPAY Payment Gateway** (Sandbox flow) and a **Mock QR Code Generation Library** (`qrcode` / `qrcode.react`) for payment QR codes and ticket verification.
* **Real-time Synchronization**: Live seat matrix status updates via WebSockets (Socket.io) & Redis Pub/Sub.
* **Double-Booking Prevention**: Two-tier concurrency locking model (**Redlock** + **PostgreSQL pessimistic locking** `SELECT ... FOR UPDATE`).
* **Stateless Turnstile Check-in**: Secure, tamper-proof check-in verification via **HMAC-SHA256 encrypted QR code tokens**.

---

## 2. Directory Architecture & Agent Scope

```
clgv-platform/
├── CLAUDE.md                                                   # Global project conventions & guidelines (Root)
├── PROJECT-DETAIL.md                                           # Detailed functional & technical spec
├── CHANGELOG.md                                                # Version history & execution state log
├── API-CONTRACT.md                                             # Source of truth API contract (FE & BE contract)
├── docs/
│   └── ROADMAP.md                                              # Multi-phase product roadmap
├── frontend/                                                   # Next.js 15 (App Router), React 19, Tailwind CSS, Shadcn UI, qrcode.react
└── backend/                                                    # Node.js (NestJS / Express), TypeScript, Prisma/TypeORM, PostgreSQL 16, Redis 7, qrcode
    ├── CLAUDE.md                                               # Isolated Backend-agent context & conventions
    ├── RULE.md                                                 # Strict backend rules & system directives
    ├── DEVELOPMENT-TASK-BY-PHASES-TRACKING-LOGS.md            # Backend-only phase tracking log
    └── ISSUES-LIST-TRACKING.md                                 # Backend issues & bug fix tracking
```

### Agent Responsibilities & Rules
1. **Root Context**: Reads `CLAUDE.md`, `PROJECT-DETAIL.md`, `API-CONTRACT.md`, and `docs/ROADMAP.md`.
2. **Frontend Agent**: Works in `/frontend`. Must build a highly polished, CGV-inspired UI in **Next.js 15** and adhere strictly to `API-CONTRACT.md`.
3. **Backend Agent**: Works in `/backend`. Built on **Node.js**, reads `backend/CLAUDE.md` and `backend/RULE.md`, and maintains `DEVELOPMENT-TASK-BY-PHASES-TRACKING-LOGS.md` and `ISSUES-LIST-TRACKING.md`.
4. **API-CONTRACT Rules**: **CRITICAL**. Before modifying any endpoint, payload schema, error code, or WebSocket event, you MUST update [API-CONTRACT.md](file:///d:/ClGV-Film-Ticket-Platform/API-CONTRACT.md) first.

---

## 3. High-Level System Workflows & Concurrency Control

### 1. Double-Booking Prevention Algorithm
To handle sudden booking traffic spikes:
1. **Tier 1 (Transient Lock)**: Distributed Redis Lock (**Redlock**) with key pattern `lock:seat:{showtime_id}:{seat_id}` and a 10-minute TTL. Returns HTTP 409 `SEAT_ALREADY_HELD` immediately on failure.
2. **Tier 2 (Postgres Transaction)**: Database pessimistic lock via `SELECT ... FOR UPDATE` within an isolated SQL transaction during payment processing.
3. **Real-time Synchronization**: Socket.io broadcasts seat status transitions (`AVAILABLE` -> `HOLDING` -> `RESERVED` -> `SOLD`) across all connected clients via Redis Pub/Sub.

### 2. Mock VNPAY Payment & QR Code Generation
* **Payment Flow**: User selects seats -> System locks seats (10-min TTL) -> System invokes `/api/v1/payments/vnpay/create-url` -> Returns Mock VNPAY payment URL & QR code payload generated via mock QR library (`qrcode`) -> User completes mock payment -> Callback `/api/v1/payments/vnpay/callback` triggers ticket issuance.
* **HMAC QR Ticket Validation**: Signed with `HMAC-SHA256(ticket_id + user_id + showtime_id + timestamp, SECRET_KEY)` and rendered via mock QR library (`qrcode.react` / `qrcode`) for fast turnstile check-in validation.

---

## 4. Coding & Tech Stack Conventions

| Domain | Stack |
| --- | --- |
| **Language** | TypeScript (Strict mode enabled across FE & BE) |
| **Frontend** | Next.js 15 (App Router), React 19, Tailwind CSS, Shadcn UI, Socket.io-client, qrcode.react (CGV-inspired polished UI) |
| **Backend** | Node.js (NestJS / Express), TypeScript, Prisma ORM / TypeORM, qrcode |
| **Database** | PostgreSQL 16 |
| **Caching/Locking** | Redis 7 (ioredis, Redlock, Pub/Sub) |
| **Payment & QR** | Mock VNPAY Payment Gateway + Mock QR Code Library |
| **Testing** | Vitest, Supertest, K6 (Concurrency Load Scripts) |

---

## 5. Helpful Commands

### Infrastructure (Docker)
```bash
docker-compose up -d           # Start PostgreSQL 16 & Redis 7
docker-compose down            # Stop infrastructure containers
```

### Backend (Node.js)
```bash
cd backend
npm install                    # Install dependencies
npm run db:migrate             # Run database migrations
npm run db:seed                # Seed initial cinema, hall & showtime data
npm run start:dev              # Start dev server (http://localhost:4000)
npm run test                   # Run backend tests
```

### Frontend (Next.js)
```bash
cd frontend
npm install                    # Install dependencies
npm run dev                    # Start Next.js dev server (http://localhost:3000)
npm run build                  # Build production bundle
```
