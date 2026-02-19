# Task: Admin Panel Frontend (Desktop/Web)

## Goal
The "Control Tower". Needs to handle large datasets, complex filtering, and sensitive financial approvals.
**Tech**: Next.js, TanStack Table, Recharts.

## Phase 1: Layout & Nav <!-- id: 0 -->
- [ ] **Shell**: Sidebar navigation (collapsible). <!-- id: 1 -->
- [ ] **Breadcrumbs**: Deep navigation support. <!-- id: 2 -->
- [ ] **Global Search**: Find investor by mobile/name instantly. <!-- id: 3 -->

## Phase 2: Operations Management <!-- id: 4 -->
- [ ] **Hotel Grid**: Status toggles, assign Branch Managers. <!-- id: 5 -->
- [ ] **Investor Grid**: 
    - Server-side sorting/filtering.
    - "Impersonate" button (view portfolio as them) - *Strictly logged*. <!-- id: 6 -->
- [ ] **Investment Wizard**: 
    - Form to link Investor <-> Hotel.
    - Percentage/Unit calculator helper. <!-- id: 7 -->

## Phase 3: Financial Command Center <!-- id: 8 -->
- [ ] **Profit Allocation UI**: 
    - Select Month -> Show Candidates.
    - Input Net Profit -> Preview Split (Table showing each investor's cut).
    - "Commit Allocation" Button (Double confirmation). <!-- id: 9 -->
- [ ] **Withdrawal Queue**:
    - Kanban or List view: Pending | Approved | Paid.
    - Bulk Actions: "Approve Selected".
    - "Mark Paid" Modal: Input UTR number. <!-- id: 10 -->

## Phase 4: Reports <!-- id: 11 -->
- [ ] **Export Center**: Date range picker -> Download CSV/PDF. <!-- id: 12 -->
- [ ] **Audit Log Viewer**: Read-only stream of who did what. <!-- id: 13 -->
