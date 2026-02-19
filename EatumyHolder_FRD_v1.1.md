# EatumyHolder — FRD/SRS (v1.1)

## 1. Goal
Build a white-label investor app where shareholders can:
- **Sign up / sign in** securely
- **See investments** across multiple hotels
- **See hotel-wise shareholding** (Percentage or Units)
- **See Orders Metrics** (Today / Yesterday / Monthly)
- **See Profit & Payouts** (Total earned, paid, pending)
- **Request profit withdrawal** (Capital always locked)

**Admin can:**
- Manage hotels & investors
- Create investments & input orders/profit
- Run monthly profit allocation
- Approve withdrawals & generate statements

---

## 2. Roles & Permissions

### 2.1 Investor (Mobile App)
- **Auth**: Mobile OTP + Session Token (JWT).
- **View**: Portfolio dashboard, hotel details, orders metrics, profit ledger.
- **Action**: Create withdrawal request.
- **KYC**: Optional phase 1.1.

### 2.2 Admin (Web Panel)
- **Manage**: Hotels, Investors, Investments.
- **Operations**: Upload daily orders, enter monthly net profit, run allocation.
- **Finance**: Approve/Reject withdrawals, mark payouts as PAID (RTGS/NEFT/UTR).
- **Reports**: Download CSV/PDF statements.

### 2.3 Super Admin (Optional)
- Manage admins, system settings (global fees, rules).

---

## 3. Core Business Rules

### 3.1 Capital Lock
- **Principal is locked** (no withdrawal in v1).
- Only **Available Profit** is withdrawable.

### 3.2 Shareholding Models
- **Percentage**: Investor owns `0.25%` of the hotel.
- **Units**: Investor owns `250` units out of `100,000`.
- *System supports both, configurable per hotel.*

### 3.3 Profit Allocation Strategy
- **Frequency**: Monthly per hotel.
- **Input**: Admin enters `Net Profit` (or Revenue - Expense).
- **Formula**: `InvestorProfit = HotelNetProfit × InvestorShare`
- **Rounding Strategy**: 
    - All calculations in **PAISA** (Integer).
    - `Net Profit` (₹10,000.00) -> `1000000` paisa.
    - If rounding remainder exists (e.g., 1 paisa left over), allocate to **system/admin account** or first investor to reconcile.

### 3.4 Withdrawal Workflow
- **Mode**: Monthly Window (e.g., 1st–5th) OR Anytime (Configurable).
- **Validation**: `Amount <= Available Profit`.
- **Concurrency**: Database locks (`SELECT FOR UPDATE`) prevent double-spending.
- **Status Flow**: `PENDING` → `APPROVED` → `PAID` (with UTR) OR `REJECTED`.

### 3.5 Currency & Precision
- **Storage**: All monetary values stored as **BIGINT** (Paisa).
    - ₹100.50 stored as `10050`.
- **Display**: Frontend divides by 100 to show `₹100.50`.

---

## 4. Investor App — Feature Specs

### 4.1 Onboarding & Auth
- **Splash**: Brand Logo.
- **Login**: Mobile + OTP (6 digits, 5 min expiry).
- **Signup**: Name, Mobile, Email, Bank Details (Encrypted).

### 4.2 Home Dashboard (Portfolio)
- **Widgets**:
    - Total Invested (₹)
    - Total Profit Earned (₹)
    - **Available Profit** (₹) (Cached for performance)
- **My Hotels**: List with individual performance.

### 4.3 Hotel Details
- Invested Amount, Shareholding.
- Orders (Today/Yesterday/Month).
- Profit (Allocated vs Paid).

### 4.4 Withdraw Profit
- Input Amount.
- Select Bank Account (masked display: `XXXX1234`).
- **Validation**: Check `Available Balance >= Amount`.
- **Idempotency**: Prevent duplicate requests on network lag.

---

## 5. Admin Panel — Feature Specs

### 5.1 Operations
- **Dashboard**: High-level KPIs (Total Invested, Total Hotels, Pending Withdrawals).
- **Hotels**: Add/Edit with Timezone (e.g., `Asia/Kolkata` for accurate "Today" orders).
- **Investors**: Manage profiles, Freeze accounts.

### 5.2 Finance
- **Daily Orders**: Manual entry or CSV import.
- **Monthly Profit**: Enter Net Profit → Click "Allocate".
    - System calculates shares, updates `profit_ledger`, updates `balance_cache`.
- **Withdrawals**: Queue of pending requests.
    - Action: Approve / Reject (with remark).
    - Action: Mark Paid (Input UTR/Ref #).

---

## 6. Database Schema (PostgreSQL)

### 6.1 Users & Auth
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    role VARCHAR(20) CHECK (role IN ('INVESTOR', 'ADMIN', 'SUPERADMIN')),
    mobile VARCHAR(15) UNIQUE NOT NULL,
    name VARCHAR(100),
    status VARCHAR(20) DEFAULT 'ACTIVE', -- ACTIVE, FROZEN
    deleted_at TIMESTAMPTZ DEFAULT NULL, -- Soft Delete
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 6.2 Hotels
```sql
CREATE TABLE hotels (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    status VARCHAR(20) DEFAULT 'ACTIVE', -- ACTIVE, INACTIVE
    timezone VARCHAR(50) DEFAULT 'Asia/Kolkata', -- For daily order cutoffs
    share_model VARCHAR(20) CHECK (share_model IN ('PERCENT', 'UNITS')),
    total_units BIGINT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 6.3 Financials (The Core)
**Money stored as BIGINT (Paisa)**

```sql
CREATE TABLE investments (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id),
    hotel_id INT REFERENCES hotels(id),
    invested_amount BIGINT NOT NULL, -- Paisa
    share_percent DECIMAL(10,4), -- 25.5000%
    share_units BIGINT,
    status VARCHAR(20) DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE profit_ledger (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id),
    hotel_id INT REFERENCES hotels(id),
    month DATE NOT NULL, -- First day of month (2023-10-01)
    profit_allocated BIGINT NOT NULL, -- Paisa (Immutable share)
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, hotel_id, month) -- 1 entry per user-hotel-month
);

CREATE TABLE withdrawals (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id),
    amount BIGINT NOT NULL, -- Paisa
    status VARCHAR(20) CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'PAID', 'CANCELLED')),
    idempotency_key VARCHAR(64) UNIQUE, -- Prevent double-submit
    utr VARCHAR(100), -- Bank Ref ID
    remark TEXT,
    requested_at TIMESTAMPTZ DEFAULT NOW(),
    reviewed_at TIMESTAMPTZ,
    paid_at TIMESTAMPTZ
);
```

### 6.4 Performance Cache
```sql
CREATE TABLE balance_cache (
    user_id INT PRIMARY KEY REFERENCES users(id),
    total_allocated BIGINT DEFAULT 0,
    total_paid BIGINT DEFAULT 0,
    total_pending BIGINT DEFAULT 0,
    available_profit BIGINT DEFAULT 0, -- (Allocated - Paid - Pending)
    last_updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 6.5 Banks (Security)
```sql
CREATE TABLE banks (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id),
    account_name VARCHAR(100),
    bank_name VARCHAR(100),
    ifsc VARCHAR(20),
    account_number_encrypted BYTEA NOT NULL, -- AES-256-GCM
    account_number_mask VARCHAR(20), -- "XXXX1234"
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 7. API Design (REST)

### 7.1 Common
- **Prefix**: `/api/v1`
- **Response**: Standard JSON envelope `{ success: true, data: ..., error: ... }`

### 7.2 Auth
- `POST /auth/send-otp` (Rate limited)
- `POST /auth/verify-otp` -> returns JWT

### 7.3 Investor
- `GET /portfolio/summary` (Reads `balance_cache`)
- `GET /hotels/{id}`
- `POST /withdrawals` (Idempotent, transactional check)
- `GET /withdrawals` (Pagination support)

### 7.4 Admin
- `POST /admin/allocations` (Trigger monthly profit split)
- `POST /admin/withdrawals/{id}/{approve|reject|pay}` 
- `POST /admin/orders` (Bulk upload)

---

## 8. Non-Functional Requirements
1.  **Concurrency**: Use `SELECT ... FOR UPDATE` on `balance_cache` during withdrawal requests.
2.  **Encryption**: Bank account numbers encrypted at app level before DB insert.
3.  **Audit Logs**: Trigger-based or app-level logging for all Admin actions.
4.  **Backups**: Daily automated snapshots (e.g., AWS RDS).
