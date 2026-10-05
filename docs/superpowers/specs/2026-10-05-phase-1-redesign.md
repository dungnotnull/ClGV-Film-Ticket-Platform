# Design Specification: Phase 1 - Foundation, Global Layout, Home & Auth UI Redesign

**Project:** ClGV - Film Ticket Booking Platform  
**Target:** 100% Figma Fidelity (Collection: *ClGV / Midnight Rose*) while preserving 100% backend API logic  
**Date:** 2026-10-05  

---

## 1. Objectives & Scope (Phase 1)
- **Foundations & Design Tokens**: Configure CSS variables and typography tokens in `globals.css` and Next.js fonts (`Inter`, `Oswald`, `Instrument Serif`).
- **Global Header**: Implement `Navbar / Floating Liquid Glass` (Figma ID `3328:15424`) with glassmorphism, responsive behavior, city picker, and auth state integration.
- **Global Footer**: Implement cinema-themed footer matching Figma guidelines.
- **Homepage (`/`)**: Reconstruct the entire homepage matching `WEB / Home / Success / 1440` (Figma ID `3274:12125`):
  - Ambient glow background / video layer
  - Live screening badge with green pulse indicator
  - Hero typographic display ("Một chuẩn mực trải nghiệm điện ảnh hoàn toàn mới...")
  - Primary & Secondary CTAs
  - Now Showing & Coming Soon sections with exact Figma `Movie Card` (Figma ID `3328:15468`)
- **Authentication Pages**:
  - `/login`: Matching `WEB / Login / Success / 1440` (Figma ID `3274:12389`)
  - `/register`: Matching `WEB / Register / Success / 1440` (Figma ID `3274:12416`)
  - `/forgot-password`: Matching `WEB / Forgot Password / Success / 1440` (Figma ID `3274:12449`)

---

## 2. Design System Tokens (Midnight Rose)
```css
:root {
  --cinema-canvas: #1f1a18;
  --cinema-surface: #27211f;
  --cinema-surface-raised: #302927;
  --cinema-surface-overlay: #3b3230;
  --cinema-border: #4a423d;
  
  --cinema-text-primary: #faf8f5;
  --cinema-text-secondary: #d1c7ba;
  --cinema-text-muted: #afa49b;
  
  --brand-rose: #ff4b72;
  --brand-rose-bright: #ff6584;
  --brand-rose-soft: #ff8fa3;
  --brand-rose-light: #ffd5de;
  --brand-rose-bg: #fff0f3;
  
  --semantic-success: #10b981;
  --semantic-warning: #f59e0b;
  --semantic-error: #ef4444;
  --semantic-info: #3b82f6;
}
```

---

## 3. Component Details & Preservation of Logic

### A. Floating Liquid Glass Navbar
- **Structure**:
  - Logo `ClGV Cinema` with rose icon
  - Menu: Phim (`/movies`), Lịch Chiếu (`/booking/showtimes`), Cụm Rạp (`/cinemas`), Ưu Đãi (`#`), Phòng Chiếu (`#`)
  - Right: City Selector Dropdown (fetches from `/api/v1/cities` or uses cached cities), Auth Buttons (Đăng ký -> `/register`, Đăng nhập -> `/login` OR User Dropdown with Avatar, Point balance, and Logout).
- **Styling**:
  - `bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-full shadow-[0_10px_30px_rgba(0,0,0,0.5)]`

### B. Homepage (`/`)
- Preserves Server Side / Client data fetching from `http://localhost:4000/api/v1/home`.
- Displays dynamic banners, now showing movies, coming soon movies from backend.
- Movie Card component:
  - Poster with subtle red/rose layer blur
  - Format/room tag (`PHÒNG IMAX LASER`)
  - Age badge (`P`, `T13`, `T16`, `T18`)
  - Title & duration
  - Pill CTA "Đặt Vé" redirecting to booking flow.

### C. Auth Screens (`/login`, `/register`, `/forgot-password`)
- Left side: Cinema backdrop visual with radial glow (`#ff4b72`), slogan in Oswald font.
- Right side: Card panel (`bg-[#27211f] border border-[#4a423d] rounded-[28px]`).
- Inputs: `#302927` background, clear focus ring rose, validation error handling.
- Integrated with `useAuthStore` and Axios auth endpoints (`/auth/login`, `/auth/register`).
