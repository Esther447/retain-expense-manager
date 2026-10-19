# Retain — Expense Manager

A full-stack personal expense management web application built with React + TypeScript (frontend) and Node.js + Express + PostgreSQL (backend).

**Live Demo:** [https://retain-expense-manager.vercel.app](https://retain-expense-manager.vercel.app)

**API Base URL:** [https://retain-expense-manager-api.onrender.com/api](https://retain-expense-manager-api.onrender.com/api)

---

## Features

- **User Authentication** — Sign up, sign in, and JWT-protected sessions
- **Expense Management** — Create, view, edit, and delete personal expenses with full filtering (search, category, payment method, date range), sorting, and pagination
- **Budget Tracking** — Set monthly budgets, track remaining balance, and view budget history
- **Dashboard** — Summary cards (total spending, expense count, average), spending by category, highest expense, and recent expenses
- **Admin Dashboard** — Platform-wide insights: total users, total spending, top/bottom categories, recent expenses and users across all accounts
- **Category Management** — Admin-only create, edit, and delete categories; deleted categories safely reassign expenses to "Uncategorized"
- **Role-Based Access Control** — `user` and `admin` roles enforced on both frontend (protected routes) and backend (middleware)
- **Responsive UI** — Mobile-friendly layout with accessible focus styles and smooth transitions

---

## Project Structure

```
retain-expense-manager/
├── frontend/   # React + TypeScript + Vite
└── backend/    # Node.js + Express + PostgreSQL
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 14+

---

### Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file (use `.env.example` as a template):

```env
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=retain_db
DB_USER=retain_user
DB_PASSWORD=your_database_password
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:5173
```

Create the database and run the schema:

```bash
psql -U postgres -c "CREATE DATABASE retain_db;"
psql -U postgres -d retain_db -f src/db/schema.sql
```

Start the server:

```bash
# Development (auto-restart on file changes)
npm run dev

# Production
npm start
```

The API runs on `http://localhost:5000`.

---

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The app runs on `http://localhost:5173`.

---

## API Reference

Base URL: `http://localhost:5000/api`

All protected endpoints require the header:
```
Authorization: Bearer <token>
```

---

### Authentication — `/api/auth`

| Method | Endpoint       | Auth | Description              |
|--------|----------------|------|--------------------------|
| POST   | `/auth/signup` | No   | Register a new user      |
| POST   | `/auth/signin` | No   | Sign in, returns JWT     |
| GET    | `/auth/me`     | Yes  | Get current user profile |

**POST `/auth/signup`**
```json
{ "name": "Jane Doe", "email": "jane@example.com", "password": "secret123" }
```
Response `201`:
```json
{ "message": "Account created successfully", "user": { "id": 1, "name": "Jane Doe", "email": "jane@example.com", "role": "user" }, "token": "<jwt>" }
```

**POST `/auth/signin`**
```json
{ "email": "jane@example.com", "password": "secret123" }
```
Response `200`:
```json
{ "message": "Login successful", "user": { ... }, "token": "<jwt>" }
```

---

### Expenses — `/api/expenses`

All endpoints require authentication. Users can only access their own expenses.

| Method | Endpoint         | Auth  | Description                        |
|--------|------------------|-------|------------------------------------|
| POST   | `/expenses`      | User  | Create a new expense               |
| GET    | `/expenses`      | User  | List expenses (filter, sort, page) |
| GET    | `/expenses/:id`  | User  | Get a single expense               |
| PUT    | `/expenses/:id`  | User  | Update an expense                  |
| DELETE | `/expenses/:id`  | User  | Delete an expense                  |

**GET `/expenses` — Query Parameters**

| Parameter        | Type   | Description                                      |
|------------------|--------|--------------------------------------------------|
| `search`         | string | Search by title or notes (case-insensitive)      |
| `category_id`    | number | Filter by category                               |
| `payment_method` | string | Filter by payment method                         |
| `start_date`     | date   | Filter expenses on or after this date (YYYY-MM-DD) |
| `end_date`       | date   | Filter expenses on or before this date           |
| `sort_by`        | string | `expense_date` (default), `amount`, `title`, `created_at` |
| `sort_order`     | string | `DESC` (default) or `ASC`                        |
| `page`           | number | Page number (default: 1)                         |
| `limit`          | number | Results per page, max 100 (default: 10)          |

Response includes a `pagination` object:
```json
{
  "expenses": [...],
  "pagination": { "page": 1, "limit": 10, "total": 42, "totalPages": 5 }
}
```

**POST / PUT `/expenses` — Request Body**
```json
{
  "title": "Lunch",
  "amount": 5000,
  "category_id": 1,
  "expense_date": "2025-01-15",
  "payment_method": "mobile-money",
  "notes": "Optional notes"
}
```

Payment method values: `cash`, `mobile-money`, `card`, `bank`

---

### Budgets — `/api/budgets`

All endpoints require authentication. Users can only access their own budgets.

| Method | Endpoint        | Auth | Description           |
|--------|-----------------|------|-----------------------|
| POST   | `/budgets`      | User | Create a monthly budget |
| GET    | `/budgets`      | User | List all budgets      |
| PUT    | `/budgets/:id`  | User | Update a budget       |
| DELETE | `/budgets/:id`  | User | Delete a budget       |

**POST / PUT `/budgets` — Request Body**
```json
{ "month": "2025-01-01", "amount": 150000 }
```

Each user can have one budget per month (enforced by unique constraint).

---

### Categories — `/api/categories`

| Method | Endpoint           | Auth       | Description                                      |
|--------|--------------------|------------|--------------------------------------------------|
| GET    | `/categories`      | User       | List all categories                              |
| POST   | `/categories`      | Admin only | Create a new category                            |
| PUT    | `/categories/:id`  | Admin only | Update a category name                           |
| DELETE | `/categories/:id`  | Admin only | Delete a category (expenses moved to Uncategorized) |

When a category is deleted, all expenses assigned to it are automatically reassigned to an "Uncategorized" fallback category (created if it doesn't exist). The Uncategorized category itself cannot be deleted.

---

### Dashboard — `/api/dashboard`

| Method | Endpoint                    | Auth       | Description                    |
|--------|-----------------------------|------------|--------------------------------|
| GET    | `/dashboard/insights`       | User       | Personal dashboard data        |
| GET    | `/dashboard/admin-insights` | Admin only | Platform-wide admin insights   |

**GET `/dashboard/insights`** — Response:
```json
{
  "summary": { "total_spending": 42500, "total_expenses": 8, "average_expense": 5312.50 },
  "budget": { "id": 1, "month": "2025-01-01", "amount": 150000 },
  "budget_remaining": 107500,
  "spending_by_category": [...],
  "highest_expense": { "id": 4, "title": "Rent", "amount": 30000, ... },
  "recent_expenses": [...]
}
```

**GET `/dashboard/admin-insights`** — Response:
```json
{
  "summary": {
    "total_users": 25,
    "total_expenses": 312,
    "total_spending": 4850000,
    "current_month_expenses": 47
  },
  "spending_by_category": [...],
  "top_categories": [...],
  "bottom_categories": [...],
  "recent_expenses": [...],
  "recent_users": [...]
}
```

---

## Authentication & Authorization

- Passwords are hashed with **bcryptjs** (10 salt rounds)
- Authentication uses **JWT** tokens (1-day expiry)
- Token is sent as `Authorization: Bearer <token>` on every protected request
- Two roles: `user` (default) and `admin`
- User-owned resources (expenses, budgets) enforce `WHERE user_id = req.user.id` — users cannot access other users' data
- Admin-only endpoints are protected by the `requireAdmin` middleware which checks `req.user.role === 'admin'`

---

## Database Schema

```
users         — id, name, email, password_hash, role, created_at
categories    — id, name, created_at
expenses      — id, user_id, title, amount, category_id, expense_date, payment_method, notes, created_at, updated_at
budgets       — id, user_id, month, amount, created_at, updated_at
```

Key constraints:
- `expenses.user_id` → `users.id` ON DELETE CASCADE
- `expenses.category_id` → `categories.id` (no cascade — handled in application layer)
- `budgets` has a UNIQUE constraint on `(user_id, month)`
- `categories.name` is UNIQUE

---

## Error Handling

All error responses follow this shape:
```json
{ "message": "Human-readable error description" }
```

| Status | Meaning                                      |
|--------|----------------------------------------------|
| 400    | Validation error — missing or invalid fields |
| 401    | Missing or no authentication token           |
| 403    | Invalid token or insufficient role           |
| 404    | Resource not found                           |
| 409    | Conflict — duplicate email, category, or budget month |
| 500    | Internal server error                        |
