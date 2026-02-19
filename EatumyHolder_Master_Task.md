# Tasks: EatumyHolder (Production Build)

## Phase 1: Foundation & Architecture
- [ ] Initialize Monorepo (Turborepo) or Project Structure <!-- id: 0 -->
    - [ ] Setup Backend (NestJS + TypeORM/Prisma) <!-- id: 1 -->
    - [ ] Setup Admin Web (Next.js) <!-- id: 2 -->
    - [ ] Setup Database (PostgreSQL) <!-- id: 3 -->
- [ ] Implement Database Schema & Migrations <!-- id: 4 -->
    - [ ] Users, Kitchens, Shares <!-- id: 5 -->
    - [ ] Financial Tables (ProfitLedger, Withdrawals, BalanceCache) <!-- id: 6 -->
    - [ ] Security Tables (Banks, AuditLogs) <!-- id: 7 -->

## Phase 2: Core Backend - Identity & Management
- [ ] **Auth Module** <!-- id: 8 -->
    - [ ] OTP Login Flow (Mock/Real Provider integration) <!-- id: 9 -->
    - [ ] JWT Session Management <!-- id: 10 -->
    - [ ] RBAC (Investor vs Admin) <!-- id: 11 -->
- [ ] **Kitchen & Shareholder Management** <!-- id: 12 -->
    - [ ] CRUD Kitchens (Timezones, Share Models) <!-- id: 13 -->
    - [ ] CRUD Shareholders (Profiles, Bank Details Encryption) <!-- id: 14 -->
    - [ ] CRUD Branch Managers (Assign to Kitchen + Passwords) <!-- id: 15 -->
- [ ] **Branch Operations API** <!-- id: 16 -->
    - [ ] Daily Metrics Entry Endpoint (Rev/Exp) <!-- id: 17 -->
    - [ ] Dashboard KPI Endpoint (Today's Pulse) <!-- id: 18 -->
- [ ] **Share Management** <!-- id: 15 -->
    - [ ] Create Share Holding (Link User <-> Kitchen) <!-- id: 16 -->
    - [ ] Validation (Units vs %) <!-- id: 17 -->

## Phase 3: Financial Engine (The Core)
- [ ] **Profit Allocation System** <!-- id: 18 -->
    - [ ] Monthly Profit Entry API <!-- id: 19 -->
    - [ ] Allocation Logic (Calculate shares, handle rounding dust) <!-- id: 20 -->
    - [ ] Immutable Ledger Creation <!-- id: 21 -->
    - [ ] Update Balance Cache <!-- id: 22 -->
- [ ] **Withdrawal System** <!-- id: 23 -->
    - [ ] Withdrawal Request API (with Idempotency & Locking) <!-- id: 24 -->
    - [ ] Available Balance Check Rule <!-- id: 25 -->
    - [ ] Admin Approval Workflow <!-- id: 26 -->
    - [ ] Payout Processing (Mark Paid + UTR) <!-- id: 27 -->

## Phase 4: Frontend Implementation (Parallel Tracks)
- [ ] **Admin Panel** (See `task_frontend_admin.md`) <!-- id: 28 -->
    - [ ] Setup Shell & Auth <!-- id: 29 -->
    - [ ] Operations & Finance UI <!-- id: 30 -->
    - [ ] **Admin Control Verification** <!-- id: 39 -->
        - [ ] Verify Kitchen Creation Sync <!-- id: 40 -->
        - [ ] Verify Investment Flow Control <!-- id: 41 -->
        - [ ] Verify Withdrawal Approval Flow <!-- id: 42 -->
- [ ] **Shareholder App** (See `task_frontend_shareholder.md`) <!-- id: 31 -->
    - [ ] Setup Mobile Layout & Auth <!-- id: 32 -->
    - [ ] Dashboard & Withdrawals <!-- id: 33 -->
- [ ] **Branch App** (See `task_frontend_branch.md`) <!-- id: 34 -->
    - [ ] Setup Tablet Layout & Auth <!-- id: 35 -->
    - [ ] Daily Entry Form <!-- id: 36 -->

## Phase 6: Production Hardening
- [ ] Audit Logging Implementation <!-- id: 35 -->
- [ ] Rate Limiting (Throttler) <!-- id: 36 -->
- [ ] Input Validation Pipes <!-- id: 37 -->
- [ ] End-to-End Testing of Financial Flows <!-- id: 38 -->
