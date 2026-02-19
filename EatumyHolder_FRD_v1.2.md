# EatumyHolder — FRD/SRS (v1.2)

## 1. Goal
Build a white-label shareholder app where shareholders can:
- **Sign up / sign in** securely
- **See shares** across multiple cloud kitchens
- **See kitchen-wise shareholding** (Percentage or Units)
- **See Orders Metrics** (Today / Yesterday / Monthly)
- **See Profit & Payouts** (Total earned, paid, pending)
- **Request profit withdrawal** (Capital always locked)

**Admin can:**
- Manage hotels & investors
- Create investments & input orders/profit
- Run monthly profit allocation
- Approve withdrawals & generate statements

**Branch Manager can:**
- Login to their specific kitchen dashboard
- Enter/Verify Daily Orders & Expenses
- View real-time performance of their branch
- **Cannot** access shareholder data or financial allocations

---

## 2. Roles & Permissions

### 2.1 Shareholder (Mobile App / Web)
- **Auth**: Mobile OTP + Session Token (JWT).
- **View**: Portfolio dashboard, kitchen details, orders metrics, profit ledger.
- **Action**: Create withdrawal request.
- **KYC**: Internal verification.

### 2.2 Admin (Web Panel)
- **Manage**: Kitchens, Shareholders, Share Holdings.
- **Operations**: Upload daily orders (bulk), enter monthly net profit, run allocation.
- **Finance**: Approve/Reject withdrawals, mark payouts as PAID.
- **Reports**: Download CSV/PDF statements.

### 2.3 Branch Manager (Web / Tablet Panel)
- **Auth**: Email/ID + Password (Created by Admin).
- **Scope**: Restricted 1:1 to a specific Kitchen ID.
- **Operations**: 
    - Daily Order Entry (Revenue, Count, Expenses).
    - View "Today's Live Metrics".
- **Restriction**: No access to Shareholder PII or overall system financials.

---

## 3. Core Business Rules

### 3.1 Capital Lock
- **Principal is locked** (no withdrawal in v1).
- Only **Available Profit** is withdrawable.

### 3.2 Shareholding Models
- **Percentage**: Shareholder owns `0.25%` of the kitchen.
- **Units**: Shareholder owns `250` units out of `100,000`.
- *System supports both, configurable per kitchen.*

### 3.3 Profit Allocation Strategy
- **Frequency**: Monthly per kitchen.
- **Input**: Admin enters `Net Profit` (or computed from Branch params).
- **Formula**: `ShareholderProfit = KitchenNetProfit × ShareholderShare`
- **Rounding Strategy**: All calculations in **PAISA** (Integer).

### 3.4 Withdrawal Workflow
- **Mode**: Monthly Window (e.g., 1st–5th) OR Anytime (Configurable).
- **Validation**: `Amount <= Available Profit`.
- **Status Flow**: `PENDING` → `APPROVED` → `PAID` (with UTR) OR `REJECTED`.

### 3.5 Currency & Precision
- **Storage**: All monetary values stored as **BIGINT** (Paisa).
- **Display**: Frontend divides by 100 to show `₹100.50`.

---

## 4. Shareholder Frontend Specs (Mobile First)
*High-End, Premium "Fintech" Aesthetic.*

### 4.1 Onboarding & Auth
- **Splash**: Animated Brand Logo.
- **Login**: Mobile + OTP (6 digits).
- **Signup**: Name, Mobile, Email, Bank Details (Encrypted).

### 4.2 Home Dashboard (Portfolio)
- **Hero Card**: Total Value, Total Profit, **Available for Withdrawal**.
- **Portfolio List**: Card per kitchen with mini-sparkline of performance.

### 4.3 Withdraw Flow
- **Clean UI**: Input field with "Max" button.
- **Bank Select**: Carousel of linked accounts.
- **Success**: Lottie animation on request submission.

---

## 5. Admin Panel Specs (Desktop)
*Data-Dense, Control Center.*

### 5.1 Operations
- **Dashboard**: Global map of kitchens, live ticker of total withdrawals.
- **Allocations**: Wizard-style flow for Monthly Profit Distribution.

### 5.2 Management
- **User Grid**: Sortable, filterable list of 10k+ shareholders.
- **Kitchen Config**: Add Branch Managers here.

---

## 6. Branch Login Specs (Tablet/Desktop)
*Simple, Operational, POS-like.*

### 6.1 Dashboard
- **Live Feed**: Today's Orders, Revenue vs Target.
- **Action**: "End of Day" Entry Form.

### 6.2 Entry Form
- Date (Auto-selected today).
- Total Orders (Int).
- Total Revenue (₹).
- Total Expense (₹).
- **Upload**: Photo of Z-Report/Bill (Optional).

---

## 7. Database Schema (Updates)

### 7.1 Users
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    role VARCHAR(20) CHECK (role IN ('SHAREHOLDER', 'ADMIN', 'BRANCH', 'SUPERADMIN')), -- Added BRANCH
    kitchen_id INT REFERENCES kitchens(id), -- For BRANCH role only (1:1 mapping)
    mobile VARCHAR(15) UNIQUE NOT NULL,
    password_hash VARCHAR(255), -- For Admin/Branch password login
    name VARCHAR(100),
    status VARCHAR(20) DEFAULT 'ACTIVE',
    ...
);
```

### 7.2 Daily Metrics
```sql
CREATE TABLE daily_metrics (
    id SERIAL PRIMARY KEY,
    kitchen_id INT REFERENCES kitchens(id),
    date DATE NOT NULL,
    orders_count INT DEFAULT 0,
    revenue BIGINT DEFAULT 0, -- Paisa
    expense BIGINT DEFAULT 0, -- Paisa
    submitted_by INT REFERENCES users(id), -- Branch Manager ID
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(kitchen_id, date)
);
```
