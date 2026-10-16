# Retain — Frontend

React + TypeScript + Vite frontend for the Retain expense manager.

---

## Tech Stack

- **React 19** with functional components and hooks
- **TypeScript** for type safety throughout
- **Vite** for fast development and builds
- **React Router v7** for client-side routing
- **React Context** for authentication state and protected routes
- **Redux Toolkit** for expense filtering, searching, and sorting state
- **Custom CSS** with responsive layouts (no UI library dependency)

---

## Setup

```bash
npm install
npm run dev
```

Runs on `http://localhost:5173`. Requires the backend running on `http://localhost:5000`.

---

## Project Structure

```
src/
├── components/
│   ├── Navbar.tsx          # Top navigation, shows Admin link for admin users
│   └── ProtectedRoute.tsx  # Auth guard, supports adminOnly prop
├── context/
│   └── AuthContext.tsx     # Auth state: user, isAuthenticated, login, logout
├── pages/
│   ├── Login.tsx           # Sign in → POST /auth/signin
│   ├── Signup.tsx          # Register → POST /auth/signup
│   ├── Dashboard.tsx       # User dashboard → GET /dashboard/insights
│   ├── Expenses.tsx        # Expense list with filters → GET /expenses
│   ├── AddExpense.tsx      # Create expense → POST /expenses
│   ├── EditExpense.tsx     # Update expense → PUT /expenses/:id
│   ├── Budget.tsx          # Budget management → GET+POST+PUT /budgets
│   ├── Profile.tsx         # User profile from AuthContext
│   └── AdminDashboard.tsx  # Admin insights + category CRUD
├── redux/
│   ├── store.ts            # Redux store
│   ├── hooks.ts            # Typed useAppDispatch / useAppSelector
│   └── expenseFilterSlice.ts  # search, category, paymentMethod, sortBy, startDate, endDate
├── services/
│   └── api.ts              # apiGet, apiPost, apiPut, apiDelete with Bearer token
├── types/
│   └── Expense.ts          # Expense and Category TypeScript interfaces
├── App.tsx                 # Routes — all protected except /login and /signup
├── App.css                 # All page styles with responsive breakpoints
└── index.css               # Global reset and base styles
```

---

## Authentication

Authentication is implemented entirely with **React Context** (`AuthContext.tsx`):

- `login(user)` — stores user in state after successful API sign-in/sign-up
- `logout()` — clears user state, JWT removed from localStorage
- `isAuthenticated` — derived from `user !== null`
- `user.role` — `'user'` or `'admin'`

The JWT token is stored in `localStorage` and sent automatically on every API request via `api.ts`.

### Protected Routes

`ProtectedRoute` wraps all authenticated pages:
- Unauthenticated users → redirected to `/login`
- `adminOnly` prop → non-admin users redirected to `/`

```tsx
<ProtectedRoute adminOnly>
  <AdminDashboard />
</ProtectedRoute>
```

---

## Filtering & Sorting (Redux)

All expense filtering state lives in `expenseFilterSlice`:

| State field     | Description                          |
|-----------------|--------------------------------------|
| `search`        | Text search on title and notes       |
| `category`      | Filter by category ID                |
| `paymentMethod` | Filter by payment method             |
| `startDate`     | Show expenses on or after this date  |
| `endDate`       | Show expenses on or before this date |
| `sortBy`        | `date-desc`, `date-asc`, `amount-desc`, `amount-asc` |

Filtering and sorting are applied client-side on the fetched expense list in `Expenses.tsx`.

---

## Pages

### Dashboard (`/`)
Fetches `GET /dashboard/insights` and displays:
- Total spending, remaining budget, highest expense, budget status
- Recent expenses table
- Spending breakdown by category

### Expenses (`/expenses`)
- Fetches all user expenses from `GET /expenses?limit=100`
- Full filter toolbar connected to Redux state
- Edit navigates to `/expenses/edit` passing expense via `location.state`
- Delete calls `DELETE /expenses/:id` with confirmation

### Add / Edit Expense
- Categories loaded dynamically from `GET /categories`
- Add → `POST /expenses`
- Edit → `PUT /expenses/:id`

### Budget (`/budget`)
- Loads current budget and total spent from `GET /dashboard/insights`
- Creates new budget with `POST /budgets`
- Updates existing budget with `PUT /budgets/:id`
- Displays within / approaching / over budget status

### Admin Dashboard (`/admin`)
Accessible only to users with `role === 'admin'`. Two tabs:

**Insights tab** — fetches `GET /dashboard/admin-insights`:
- Summary cards: total users, total expenses, total value, this-month count
- Spending per category table
- Top 5 most-used categories
- Bottom 5 least-used categories
- Recently added expenses (all users)
- Recently registered users

**Categories tab** — full CRUD:
- Create via `POST /categories`
- Edit inline via `PUT /categories/:id`
- Delete via `DELETE /categories/:id` (expenses reassigned to Uncategorized)
- Uncategorized category is protected from deletion

---

## Responsive Design

Breakpoints in `App.css`:
- `≤ 900px` — dashboard overview grid collapses from 4 to 2 columns; toolbar wraps to 3 columns
- `≤ 700px` — budget grid collapses to single column
- `≤ 600px` — all pages switch to single-column layout; navbar stacks vertically
