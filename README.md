# Clean & Scrub Inventory System — How It All Works

A complete walkthrough of the application: what each piece does, and how data flows from the moment you click something in the browser to the moment it lands in Postgres and comes back.

---

## 1. The Big Picture

```
┌─────────────────────┐         ┌──────────────────────┐         ┌─────────────────┐
│   React Frontend     │  HTTP   │   FastAPI Backend     │  SQL    │   PostgreSQL     │
│   (ui/)              │ ──────► │   (api/)               │ ──────► │   (Docker)       │
│   Vite + Tailwind     │ ◄────── │   SQLAlchemy + Alembic │ ◄────── │                  │
│   Zustand + Recharts  │  JSON   │   JWT + TOTP           │  rows   │                  │
└─────────────────────┘         └──────────────────────┘         └─────────────────┘
```

- **Frontend** (`ui/`): everything you see and click. Talks to the backend only through `src/services/*.js` files — no page ever calls the database directly.
- **Backend** (`api/`): the only thing allowed to touch the database. Organized into **routers** (the URLs/endpoints), **models** (the database tables), **schemas** (what a valid request/response looks like), and **services** (reusable logic like password hashing and TOTP).
- **Database**: PostgreSQL running in Docker, containing 6 tables: `users`, `otp_secrets`, `recovery_codes`, `products`, `customers`, `transactions`.

Every piece of data you see in the app — every product, every stock movement, every customer — is a row in one of those 6 tables. Nothing is mock data anymore.

---

## 2. Naming convention across the boundary

Python convention is `snake_case` (`unit_price`), JavaScript convention is `camelCase` (`unitPrice`). Rather than break either language's convention, the boundary between them auto-translates:

- `src/utils/normalize.js` — `camelize()` converts backend responses to camelCase before your components ever see them; `snakeize()` converts your form data back to snake_case before it's sent.
- Every service file (`productStore.js`, `transactionStore.js`, etc.) applies this automatically — you never have to think about it page-to-page.

---

## 3. Authentication & Security — the most involved flow

This is the part with the most moving pieces, so here's the exact sequence.

### Sign-up
1. You fill the signup form → `POST /auth/signup`
2. Backend (`app/routers/auth.py`): creates a `User` row with a **bcrypt-hashed** password (never plain text — `app/services/security.py`), generates a brand-new TOTP secret (`app/services/otp.py`), stores it in `otp_secrets` with `is_active = False`.
3. Backend returns a **pending token** (`scope: "otp_pending"`, valid 15 minutes) — this token can *only* be used on the OTP endpoints, nothing else. This is what actually enforces "must complete OTP before doing anything," not just the UI hiding buttons.
4. Frontend (`VerifyOtp.jsx`) shows the QR code built from the `otpauth://` URI the backend generated.

### OTP setup (first time only)
5. You scan the QR with an authenticator app, type the 6-digit code → `POST /auth/otp/verify-setup`
6. Backend verifies the code against the real secret using `pyotp` (allows ±30s clock drift). If correct: flips `otp_secrets.is_active = True`, generates 8 recovery codes, **hashes each one** the same way as passwords, stores them, and issues a real **access token** (`scope: "access"`, valid 60 minutes).
7. You see the recovery codes once (`RecoveryCodes.jsx`) — copy/download them — then land on the Dashboard, now genuinely logged in.

### Every login after that
8. `POST /auth/login` → password checked → since `otp_secrets.is_active` is already `True`, backend skips straight to asking for the 6-digit code (no QR this time) → `POST /auth/otp/verify-login` → real access token issued.
9. **Lost your device?** "Use a recovery code instead" → `POST /auth/otp/verify-recovery` → each code works exactly once (`recovery_codes.used` flips to `True` on use).

### Brute-force protection
- `app/services/rate_limit.py` locks out an email or user after **5 failed attempts** for **15 minutes** — applies to password login and every OTP-verification endpoint separately.

### Session handling
- The access token is stored in `authStore.js` (Zustand, persisted) and auto-attached to every request by `src/services/api.js`.
- If a token is ever rejected (expired, invalid), `api.js` automatically logs you out and bounces to `/login` — **except** during the login/OTP flow itself, where a 401 is just "wrong code," not "session expired."

---

## 4. Products — the base of everything else

- **List/filter**: `GET /products?search=...&category=...&low_stock_only=true` — all filtering happens server-side in Postgres (`app/routers/products.py`), not in the browser.
- **Create/Edit**: SKU uniqueness is enforced by the database and checked explicitly in the router — you get a real "SKU already exists" error, not a silent failure.
- **Delete**: straightforward row deletion. (Note: if a product has transaction history, deleting it doesn't delete those transactions — they keep their own copy of the product name/category, same principle as customers below.)
- Every product page fetch, add, edit, delete goes through `src/store/productStore.js`, which is the single source of truth the rest of the app reads from.

---

## 5. Stock In / Stock Out — where the real business logic lives

This is the most "alive" part of the system — every action here has a side effect on `products.quantity`.

**Stock In** (`POST /transactions/stock-in`):
- Increases the product's quantity by the entered amount.
- Records a `Transaction` row with `type = "in"`.

**Stock Out** (`POST /transactions/stock-out`):
- Validates quantity requested ≤ quantity available — rejects with a clear error otherwise.
- Resolves the customer: either an existing `customer_id`, or creates a brand-new `Customer` row inline if you chose "New customer."
- Decreases the product's quantity.
- Records a `Transaction` with `type = "out"`, storing a **copy** of the customer's name/phone/type directly on the transaction (not just a reference) — so if that customer is ever deleted later, the historical record still reads correctly.

**Editing an entry** (`PUT /transactions/stock-in/{id}` or `/stock-out/{id}`):
- Reverses the *original* quantity effect first, then applies the *new* one — this is what makes editing safe even if you change which product or how much.

**Deleting an entry** (single or bulk):
- Reverses whatever effect it had (adds back if it was a stock-in, subtracts if it was a stock-out) before removing the row — so stock counts never drift from reality no matter how many edits/deletes happen.

All of this logic lives in `app/routers/transactions.py` on the backend, and is called through `src/store/transactionStore.js` on the frontend, which also automatically refreshes the Products list afterward so quantities stay in sync on screen.

---

## 6. Customers

- Customers themselves are simple CRUD (`app/routers/customers.py`).
- The interesting part is derived, not stored: **order count, total spent, last purchase date** are computed by scanning that customer's `Transaction` rows (`app/routers/dashboard.py` does the same kind of aggregation) — not columns sitting on the `Customer` table, so they're always accurate without any manual syncing.

---

## 7. Dashboard — one endpoint, everything aggregated server-side

`GET /dashboard/summary` (`app/routers/dashboard.py`) does all of this in one call:
- Total products, total stock value, low-stock count, total customers
- Today vs. yesterday stock in/out, with % change
- 30-day trend (zero-filled, so the chart never has gaps)
- Value by category, units by client type
- Last 8 transactions, top 6 lowest-stock items

The frontend's **Inventory Health score** (the big ring on the dashboard) is calculated client-side from that response: `(total products − low-stock products) ÷ total products × 100` — a real, meaningful number, not decoration.

---

## 8. Reports

`GET /reports` (`app/routers/reports.py`) takes the same transaction data but with heavier filtering: date range, type, category, search, min/max amount — and returns a summary + daily trend + the full matching transaction list, all computed server-side so pagination on screen never affects what gets exported.

**Exports** (PDF via `jspdf`, Excel via `xlsx`) always run against the *full filtered dataset*, never just the current visible page.

---

## 9. Profile & Settings

- **Profile edits** (name/email/phone/avatar) → `PUT /users/me`. Email changes are checked for uniqueness against other accounts.
- **Change password** → `POST /users/me/change-password` — requires your current password, rejects reusing the same one.
- **Reset authenticator** → wipes the old TOTP secret and recovery codes, generates a fresh inactive secret — you'll see the QR setup screen again on next login.
- **Regenerate recovery codes** → invalidates all old codes immediately, issues 8 new ones.

---

## 10. Cross-cutting things you'll notice everywhere

- **Dark/light mode** and **language (EN/FR/RW)** — both stored in Zustand with `persist`, so your choice survives a refresh (`themeStore.js`, `languageStore.js`).
- **Responsive pattern** — every data page renders a sortable/paginated table on desktop and switches to swipeable cards on mobile, using the *same* filtered data (`DataTable.jsx` / `DataCardList.jsx`).
- **Loading states** — skeleton placeholders while real data is in flight, not blank screens.
- **Toasts** (`sonner`) confirm every save/delete/error — separate from loading spinners, which just show "in progress."

---

## 11. Known limitations (by design, not oversights)

- **"Forgot password" doesn't send a real email** — would need an SMTP/transactional email service, intentionally skipped to avoid recurring cost. The UI flow exists but is stubbed.
- **JWTs can't be forcibly revoked** — resetting your authenticator logs you out client-side immediately, but a still-valid token technically works until it expires (max 60 min). Fine at this scale; a refresh-token/blacklist system would be the proper fix if this ever needs tightening.
- **Rate limiting is in-memory** — resets if the backend restarts, and wouldn't share state if you ever ran multiple backend instances. Fine for Render's free tier (single instance); would need Redis if that changes.
- **Avatar photos are stored as base64 text** in the database rather than proper file storage (e.g. S3) — simple, but not space-efficient at scale.

---

## 12. What's left before this is "done"

- **Deployment**: frontend → Netlify, backend + Postgres → Render (free tiers, as planned from the start).
- **Full end-to-end testing pass** — the natural next step now that every page is wired to real data.
