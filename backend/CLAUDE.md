# CLAUDE.md - Backend Agent Specific Guidelines & Architecture

This document provides isolated context, development conventions, directory layout, database locking protocols, and command cheat sheets for AI sub-agents and developers working specifically inside the `/backend` directory.

---

## 1. Tech Stack Overview

| Layer | Technology |
| --- | --- |
| **Framework** | Node.js (NestJS / Express), TypeScript (Strict Mode) |
| **Database** | PostgreSQL 16 |
| **ORM** | Prisma ORM / TypeORM |
| **Distributed Caching & Locks** | Redis 7 (`ioredis`, Redlock algorithm) |
| **Payment Gateway** | Mock VNPAY Payment Gateway (Sandbox simulation flow) |
| **QR Code Library** | `qrcode` (Mock QR Payload & Image Generation) |
| **Real-time Gateway** | WebSockets via Socket.io Server |
| **Testing** | Vitest (Unit/Integration), Supertest (HTTP), K6 (Concurrency Load Testing) |
| **Security & Crypto** | JWT (Access + Refresh tokens), Passport.js, `crypto` (HMAC-SHA256) |

---

## 2. Directory Architecture

```
backend/
├── src/
│   ├── modules/
│   │   ├── auth/            # JWT authentication, OAuth 2.0, passport strategies, user roles
│   │   ├── cinema/          # Cinema clusters, halls, dynamic layout matrix generator
│   │   ├── showtime/        # Movie showtime scheduling & automated conflict detection
│   │   ├── booking/         # Redlock distributed locking & PostgreSQL pessimistic transactions
│   │   ├── ticket/          # HMAC-SHA256 QR code ticket generation & turnstile validation
│   │   └── websocket/       # Socket.io gateway & Redis Pub/Sub seat matrix sync
│   ├── common/              # Guards, interceptors, dynamic matrix helpers, error filters
│   └── database/            # Schema migrations, seeders, Prisma/TypeORM connection pools
├── test/                    # Unit tests, integration tests, Supertest, K6 load test scripts
├── DEVELOPMENT-TASK-BY-PHASES-TRACKING-LOGS.md # Backend task tracking log (BE-agent maintains this!)
└── ISSUES-LIST-TRACKING.md                      # Backend issue tracking & resolution log
```

---

## 3. Mandatory Backend Conventions

### 3.1 API Contract Rules (CRITICAL)
- The single source of truth for all API routes, payload structures, HTTP status codes, and WebSocket events is [API-CONTRACT.md](file:///d:/ClGV-Film-Ticket-Platform/API-CONTRACT.md).
- **RULE**: Before making any code change that affects endpoint paths, DTO structures, status codes, or Socket events, you **MUST** first update `API-CONTRACT.md` at the project root.

### 3.2 Double-Booking Concurrency Implementation Rules
When writing or modifying seat booking logic in `booking.service.ts`:
1. **Tier 1 - Redlock Key Format**: `lock:seat:{showtime_id}:{seat_id}` with a 10-minute TTL (600 seconds).
2. **Tier 2 - Database Transaction**: Always execute `SELECT ... FOR UPDATE` inside a PostgreSQL transaction (`prisma.$transaction` or `queryRunner`).
3. **Conflict Response**: If Redlock fails to acquire the key, throw an HTTP 409 Conflict exception with code `SEAT_ALREADY_HELD`. Do NOT execute the database query if the Redis lock is unavailable.
4. **Clean Expiration**: Ensure Redis key expiration events (`notify-keyspace-events Ex`) emit a WebSocket broadcast resetting the seat state to `AVAILABLE`.

### 3.3 HMAC QR Ticket Generation Rules
- HMAC Algorithm: `HMAC-SHA256`.
- Token Signature Data: `ticket_id + user_id + showtime_id + created_at`.
- Validation Endpoint (`POST /api/v1/tickets/verify-qr`): Must operate statelessly without performing unnecessary joins on user/movie tables to keep check-in latency under 50ms.

---

## 4. Backend Workflow & Log Maintenance

When working inside `/backend`:
1. **Check Log**: Read [DEVELOPMENT-TASK-BY-PHASES-TRACKING-LOGS.md](file:///d:/ClGV-Film-Ticket-Platform/backend/DEVELOPMENT-TASK-BY-PHASES-TRACKING-LOGS.md) to identify the next pending task.
2. **Mark In Progress**: Update the task status to `IN_PROGRESS`.
3. **Implement & Test**: Write code and verify with Vitest/Supertest.
4. **Log Issues**: If bugs or race conditions are found, log them in [ISSUES-LIST-TRACKING.md](file:///d:/ClGV-Film-Ticket-Platform/backend/ISSUES-LIST-TRACKING.md).
5. **Mark Completed**: Update `DEVELOPMENT-TASK-BY-PHASES-TRACKING-LOGS.md` with status `COMPLETED`, date, and implementation notes.

---

## 5. Development Command Cheat Sheet

```bash
# Dependencies & Setup
npm install                    # Install packages
cp .env.example .env          # Copy environment template

# Database Commands
npm run db:migrate             # Run database migrations
npm run db:seed                # Seed initial cinema, hall & showtime test data
npm run db:reset               # Reset database & re-run seeders

# Development Server
npm run start:dev              # Start dev server with hot reload (http://localhost:4000)

# Testing
npm run test                   # Run unit & integration tests with Vitest
npm run test:e2e               # Run E2E tests with Supertest
npm run test:k6                # Run K6 high-concurrency load test script
```
