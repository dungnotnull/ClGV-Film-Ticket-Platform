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

---

## [0.1.0] - 2026-08-06

### Added
- **Project Structure & Rules**: Created unified multi-agent governance and system architecture file [CLAUDE.md](file:///d:/ClGV-Film-Ticket-Platform/CLAUDE.md).
- **Detailed Specification**: Authored comprehensive project specifications in [PROJECT-DETAIL.md](file:///d:/ClGV-Film-Ticket-Platform/PROJECT-DETAIL.md), detailing customer booking workflows, admin tools, two-tier Redlock concurrency engines, and HMAC-SHA256 QR ticket generation.
- **API Contract (Source of Truth)**: Defined strict REST endpoints and Socket.io protocol payload specifications in [API-CONTRACT.md](file:///d:/ClGV-Film-Ticket-Platform/API-CONTRACT.md).
- **Product Roadmap**: Created 6-phase development roadmap in [docs/ROADMAP.md](file:///d:/ClGV-Film-Ticket-Platform/docs/ROADMAP.md).
- **Backend Developer Guidelines**: Created backend sub-agent context in [backend/CLAUDE.md](file:///d:/ClGV-Film-Ticket-Platform/backend/CLAUDE.md).
- **Backend Tracking Logs**: Established phase task tracking log [backend/DEVELOPMENT-TASK-BY-PHASES-TRACKING-LOGS.md](file:///d:/ClGV-Film-Ticket-Platform/backend/DEVELOPMENT-TASK-BY-PHASES-TRACKING-LOGS.md).
- **Backend Issues Tracking**: Created issue log [backend/ISSUES-LIST-TRACKING.md](file:///d:/ClGV-Film-Ticket-Platform/backend/ISSUES-LIST-TRACKING.md).
