# Frontend Conventions & Guidelines

## 1. Context Isolation
You are operating within the `/frontend` context of the ClGV platform. Claude Code will automatically read this file when working in this subdirectory to provide isolated context without mixing with backend logic.

## 2. Tech Stack
- **Framework**: Next.js 15 (App Router)
- **UI/Components**: React 19, Tailwind CSS, Shadcn UI
- **Language**: TypeScript

## 3. Development Guidelines
- **Server vs Client Components**: Use React Server Components by default. Opt into Client Components (`"use client"`) only when interactivity, hooks, or WebSockets are necessary (e.g., Seat Matrix).
- **Styling**: Stick to Tailwind CSS and Shadcn UI conventions.
- **Type Safety**: Enforce strict typing for all props, states, and API responses.

## 4. Cross-Agent Coordination
- **API Contract**: ALWAYS refer to `../API-CONTRACT.md` (Source of Truth) for type definitions, payloads, and endpoints. Do NOT guess the API structure. Before changing endpoint calls, read and update that file first.
- **Task Tracking**: Log detailed progress in `DEVELOPMENT-TASK-BY-PHASES-TRACKING-LOGS.md`.
- **Issue Tracking**: Log and manage frontend-specific bugs in `ISSUES-LIST-TRACKING.md`.
