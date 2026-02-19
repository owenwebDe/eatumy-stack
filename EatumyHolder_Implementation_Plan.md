# Implementation Plan - EatumyHolder

## Goal
Build a production-grade, white-label investor application with strict financial controls, catering to scaling needs (10k+ investors) and multi-tier access (Admin, Branch, Shareholder).

## Core Technologies
- **Backend:** NestJS (TypeScript) - Strict architecture, dependency injection.
- **Database:** PostgreSQL - Essential for JSON types, concurrency locking (`SELECT FOR UPDATE`), relational integrity.
- **ORM:** Prisma (Recommended for type safety).
- **Admin Frontend:** Next.js (App Router) + TailwindCSS + Shadcn/UI.
- **Shareholder Frontend:** Next.js (Mobile-First PWA) + Mainstack/Vaul (Drawer).
- **Branch Frontend:** Next.js (Tablet Optimized) + React Hook Form.

## User Review Required
> [!IMPORTANT]
> **Branch Manager Access**: Branch Managers will have a separate login (Email/Password) and are strictly scoped to a single `hotel_id`. They **cannot** see investor data or overall system financials.

> [!IMPORTANT]
> **Rounding Strategy**: In the "Split Profit" logic, if ₹100 is split 3 ways (33.333...), there is a remainder. We will implement "Accumulate Dust" strategy where fractional paisa remains in the system account or is allocated to a specific 'Dust' user to keep the ledger zero-sum.

> [!WARNING]
> **Encryption**: We will use AES-256-GCM for bank account numbers. The encryption key must be managed securely via environment variables (e.g., `BANK_ENCRYPTION_KEY`). If this key is lost, bank account data is irretrievable.

## Proposed Changes / Architecture

### 1. Project Structure (Monorepo)
We will use a standard monorepo structure (Turborepo):
```
/apps
  /api (NestJS)
  /admin (Next.js - Desktop)
  /shareholder (Next.js - Mobile PWA)
  /branch (Next.js - Tablet)
/packages
  /database (Prisma schema)
  /shared (Types, DTOs, UI Kit)
```

### 2. Database Schema Implementation
Refining the tables defined in FRD v1.2:
- `users`: Added `role` enum (`BRANCH`) and `hotel_id` for scoping.
- `daily_metrics`: Validated input from Branch Manager (Revenue/Expense).
- `money`: **ALWAYS** `BigInt` in Prisma/DB.
- `concurrency`: Explicit use of `$queryRaw` or transactions with locking in NestJS services.

### 3. Financial Logic Implementation

#### Profit Allocation Service
1.  **Input**: `hotel_id`, `month`, `net_profit` (in paisa).
2.  **Process**:
    - Fetch all `ACTIVE` investments for `hotel_id`.
    - **Total Shares Verification**: Ensure sum of shares <= 100% (or total units match).
    - **Loop**:
        - `investor_share = (net_profit * investment.percentage) / 10000` (handling basis points).
        - `total_distributed += investor_share`.
    - **Ledger Write**: Bulk insert into `profit_ledger`.
    - **Balance Update**: Atomic increment of `balance_cache`.
3.  **Safety**: Wrapped in a single Serializable transaction.

#### Withdrawal Service
1.  **Request**: `user_id`, `amount`.
2.  **Process**:
    - Start Transaction.
    - **Lock**: `SELECT * FROM balance_cache WHERE user_id = ... FOR UPDATE`.
    - **Check**: `available_profit >= amount`.
    - **Deduct**: Update `balance_cache` (move from `available` to `pending`).
    - **Record**: Insert into `withdrawals`.
    - Commit.

### 4. Application Components
- **Admin Panel**: AuthGuard strict protection. Data tables for deep filtering.
- **Shareholder App**: Mobile-first design. Focus on "Trust" (Animations, smooth transitions).
- **Branch App**: High-contrast, large touch targets for ease of data entry.

## Verification Plan

### Automated Tests
- **Unit Tests**: For Profit Calculation Logic (checking rounding/dust).
- **Integration Tests**:
    - "Double Spend" test: Fire 10 concurrent withdrawal requests for the same user. Ensure only valid ones succeed.
    - "Flow" test: Create User -> Invest -> Allocate Profit -> Withdraw -> Approve -> Verify Balance.

### Manual Verification
- Review Audit Logs after operations.
- Verify "Total System Liability" matches "Total Wallet Balances".
