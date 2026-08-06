# CLAUDE.md - Root Project Instructions & Guidelines

Welcome to **ClGV - Film Ticket Platform**. This document serves as the global single-source-of-truth for project structure, module communication conventions, overall system architecture, and developer guidelines for both human developers and AI sub-agents.

---

## 1. Project Overview

**ClGV** is a high-concurrency, multi-role film ticket booking platform inspired by CGV. The system addresses critical distributed systems challenges:
* Real-time seat matrix state synchronization using WebSockets & Redis Pub/Sub.
* High-concurrency seat locking and double-booking prevention using a two-tier locking model (**Redlock** + **PostgreSQL pessimistic locking** `SELECT ... FOR UPDATE`).
* Dynamic theater seat layout rendering (flexible JSON seat matrix).
* Secure, tamper-proof check-in verification via **HMAC-SHA256 encrypted QR codes**.

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
├── frontend/                                                   # Next.js 15 (App Router), React 19, Tailwind CSS, Shadcn UI
└── backend/                                                    # Node.js (NestJS / Express), TypeScript, Prisma/TypeORM, PostgreSQL 16, Redis 7
    ├── CLAUDE.md                                               # Isolated Backend-agent context & conventions
    ├── DEVELOPMENT-TASK-BY-PHASES-TRACKING-LOGS.md            # Backend-only phase tracking log
    └── ISSUES-LIST-TRACKING.md                                 # Backend issues & bug fix tracking
```

### Agent Responsibilities & Rules
1. **Root Context**: Reads `CLAUDE.md`, `PROJECT-DETAIL.md`, `API-CONTRACT.md`, and `docs/ROADMAP.md`.
2. **Frontend Agent**: Works in `/frontend`. Must adhere strictly to `API-CONTRACT.md`.
3. **Backend Agent**: Works in `/backend`. Automatically reads `backend/CLAUDE.md` and updates `DEVELOPMENT-TASK-BY-PHASES-TRACKING-LOGS.md` and `ISSUES-LIST-TRACKING.md`.
4. **API-CONTRACT Rules**: **CRITICAL**. Before modifying any endpoint, payload schema, error code, or WebSocket event, you MUST update [API-CONTRACT.md](file:///d:/ClGV-Film-Ticket-Platform/API-CONTRACT.md) first.

---

## 3. High-Level System Workflows & Concurrency Control

### Double-Booking Prevention Algorithm
To handle sudden booking traffic spikes:
1. **Tier 1 (Transient Lock)**: Distributed Redis Lock (**Redlock**) with key pattern `lock:seat:{showtime_id}:{seat_id}` and a 10-minute TTL. Returns HTTP 409 `SEAT_ALREADY_HELD` immediately on failure.
2. **Tier 2 (Postgres Transaction)**: Database pessimistic lock via `SELECT ... FOR UPDATE` within an isolated SQL transaction during payment processing.
3. **Real-time Synchronization**: Socket.io broadcasts seat status transitions (`AVAILABLE` -> `HOLDING` -> `RESERVED` -> `SOLD`) across all connected clients via Redis Pub/Sub.

### HMAC QR Code Generation & Turnstile Check-in
* QR Payload: Encrypted token signed with `HMAC-SHA256(ticket_id + user_id + showtime_id + timestamp, SECRET_KEY)`.
* Validation: Scanner turnstile calls `/api/v1/tickets/verify-qr` for stateless, fast signature verification without unnecessary database joins.

---

## 4. Coding & Tech Stack Conventions

| Domain | Stack |
| --- | --- |
| **Language** | TypeScript (Strict mode enabled across FE & BE) |
| **Frontend** | Next.js 15 (App Router), React 19, Tailwind CSS, Shadcn UI, Socket.io-client |
| **Backend** | Node.js (NestJS / Express), TypeScript, Prisma ORM / TypeORM |
| **Database** | PostgreSQL 16 |
| **Caching/Locking** | Redis 7 (ioredis, Redlock, Pub/Sub) |
| **Testing** | Vitest, Supertest, K6 (Concurrency Load Scripts) |

### Universal Guidelines
* **Type Safety**: No `any` types. Shared DTOs and types must align 1:1 with [API-CONTRACT.md](file:///d:/ClGV-Film-Ticket-Platform/API-CONTRACT.md).
* **Git & Versioning**: Log all major changes in [CHANGELOG.md](file:///d:/ClGV-Film-Ticket-Platform/CHANGELOG.md).
* **Error Handling**: Use standard JSON error wrappers (`{ success: false, error: { code, message, details } }`).

---

## 5. Helpful Commands

### Infrastructure (Docker)
```bash
docker-compose up -d           # Start PostgreSQL 16 & Redis 7
docker-compose down            # Stop infrastructure containers
```

### Backend
```bash
cd backend
npm install                    # Install dependencies
npm run db:migrate             # Run database migrations
npm run db:seed                # Seed initial cinema, hall & showtime data
npm run start:dev              # Start dev server (http://localhost:4000)
npm run test                   # Run backend tests
```

### Frontend
```bash
cd frontend
npm install                    # Install dependencies
npm run dev                    # Start Next.js dev server (http://localhost:3000)
npm run build                  # Build production bundle
```
