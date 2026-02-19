# Task: Shareholder Frontend (Mobile-First Web/PWA)

## Goal
Build a "Premium Fintech" experience. Users should feel safe and impressed.
**Tech**: Next.js (App Router), TailwindCSS, Shadcn/UI, Framer Motion.

## Phase 1: Setup & UI Kit <!-- id: 0 -->
- [ ] **Project Init**: `create-next-app` with TypeScript & Tailwind <!-- id: 1 -->
- [ ] **Design System**: Setup `fonts` (Inter/Outfit), Colors (Brand Gold/Dark), and Radius. <!-- id: 2 -->
- [ ] **Components**: Install Shadcn Cards, Buttons, Inputs, Drawers (Vaul). <!-- id: 3 -->
- [ ] **Layout**: Mobile-first storage/viewport configuration. <!-- id: 4 -->

## Phase 2: Auth Flow (Secure & Sleek) <!-- id: 5 -->
- [ ] **Landing/Splash**: Animated logo entry. <!-- id: 6 -->
- [ ] **Login Screen**: Mobile number input with country code picker. <!-- id: 7 -->
- [ ] **OTP Screen**: Auto-focus digit inputs, countdown timer. <!-- id: 8 -->
- [ ] **Session Handling**: JWT storage in HttpOnly cookie (via Server Actions). <!-- id: 9 -->

## Phase 3: Dashboard (The "Wow" Factor) <!-- id: 10 -->
- [ ] **Hero Widget**: 
    - Gradient card showing "Total Asset Value".
    - "Available to Withdraw" with a prominent action button.
- [ ] **Portfolio List**: 
    - Scrollable list of Hotel cards.
    - Mini-sparkline (recharts) showing profit trend.
- [ ] **Bottom Nav**: Home, Portfolio, Wallet, Profile. <!-- id: 11 -->

## Phase 4: Hotel Details & Ledger <!-- id: 12 -->
- [ ] **Detail Page**: Hero image of hotel, location pin, share certificate view. <!-- id: 13 -->
- [ ] **Metrics Tab**: Monthly profit bar chart. <!-- id: 14 -->
- [ ] **Ledger Tab**: Infinite scroll list of "Credit" (Profit) and "Debit" (Payouts). <!-- id: 15 -->

## Phase 5: Withdrawal Flow (Critical) <!-- id: 16 -->
- [ ] **Request Drawer**: Slide-up panel. <!-- id: 17 -->
- [ ] **Bank Select**: Horizontal carousel of linked accounts with "Add New" option. <!-- id: 18 -->
- [ ] **Confirmation**: "Slide to Confirm" interaction (prevents accidental clicks). <!-- id: 19 -->
- [ ] **Success State**: Confetti/Checkmark animation -> Redirect to History. <!-- id: 20 -->

## Phase 6: Polish <!-- id: 21 -->
- [ ] **Loading States**: Skeletons for all data fetches. <!-- id: 22 -->
- [ ] **Transitions**: Page transitions using Framer Motion. <!-- id: 23 -->
- [ ] **PWA Manifest**: Icons, splash screens for "Add to Home Screen". <!-- id: 24 -->
