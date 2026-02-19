# Task: Branch Manager Frontend (Tablet/Desktop)

## Goal
Build a strictly operational tool. Needs to be robust, large touch targets (for tablets), and fast.
**Tech**: Next.js, React Hook Form, Zod.

## Phase 1: Setup & Auth <!-- id: 0 -->
- [ ] **Project Init**: Can share repo with Shareholder app (Monorepo) or separate. <!-- id: 1 -->
- [ ] **Login**: Email/ID + Password screen. Simple, clean. <!-- id: 2 -->
- [ ] **Context**: On login, fetch assigned `hotel_id` and store in context. <!-- id: 3 -->

## Phase 2: Dashboard (Today's Pulse) <!-- id: 4 -->
- [ ] **Live Cards**: 
    - "Orders So Far" (Big number)
    - "Revenue Estimate"
- [ ] **Action Bar**: Big button "Enter End-of-Day Report". <!-- id: 5 -->

## Phase 3: Daily Entry Form <!-- id: 6 -->
- [ ] **Form Layout**: Single page, large inputs. <!-- id: 7 -->
    - Date Picker (Defaults to Today).
    - Total Orders (Number).
    - Total Revenue (Currency input).
    - Expenses (Dynamic list: Amount + Note).
- [ ] **Validation**: Warn if Revenue is 0 or unreasonably high. <!-- id: 8 -->
- [ ] **Submission**: Optimistic UI update. <!-- id: 9 -->

## Phase 4: History & Corrections <!-- id: 10 -->
- [ ] **Calendar View**: See past days with status (Submitted/Pending). <!-- id: 11 -->
- [ ] **Edit Window**: Allow edits only for 24h (configurable). <!-- id: 12 -->
