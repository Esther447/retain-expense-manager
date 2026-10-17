# Esther's API Test Checklist

Base URL: `http://localhost:5000/api`
Replace `TOKEN` with the JWT from signin. Replace `ADMIN_TOKEN` with the JWT from an admin account signin.

---

## BEFORE YOU START

Start the backend:
```bash
cd backend && npm run dev
```

Start the frontend:
```bash
cd frontend && npm run dev
```

Open the frontend at: http://localhost:5173
Open a tool like **Postman**, **Thunder Client** (VS Code), or **curl** for API tests.

---

## 1. SERVER HEALTH

| # | Test | Method | URL | Expected |
|---|------|--------|-----|----------|
| 1 | Server is running | GET | `http://localhost:5000/` | `200` — "Welcome to the Retain API" |
| 2 | Database connected | GET | `http://localhost:5000/api/health` | `200` — message + databaseTime |

---

## 2. AUTHENTICATION — `/api/auth`

### 2a. Sign Up (no token needed)
```
POST /api/auth/signup
Content-Type: application/json

{
  "name": "Esther Test",
  "email": "esther@test.com",
  "password": "secret123"
}
```
| # | Test | Expected |
|---|------|----------|
| 3 | Sign up new user | `201` — user object + token |
| 4 | Sign up duplicate email | `409` — "Email is already registered" |
| 5 | Sign up missing name | `400` — validation error |
| 6 | Sign up password < 6 chars | `400` — "Password must be at least 6 characters" |

---

### 2b. Sign In (no token needed)
```
POST /api/auth/signin
Content-Type: application/json

{
  "email": "esther@test.com",
  "password": "secret123"
}
```
| # | Test | Expected |
|---|------|----------|
| 7 | Sign in valid credentials | `200` — user object + token (save this token!) |
| 8 | Sign in wrong password | `401` — "Invalid email or password" |
| 9 | Sign in unknown email | `401` — "Invalid email or password" |

---

### 2c. Get Current User (token required)
```
GET /api/auth/me
Authorization: Bearer TOKEN
```
| # | Test | Expected |
|---|------|----------|
| 10 | Get own profile | `200` — user object (no password_hash) |
| 11 | No token | `401` — "Authentication token is required" |
| 12 | Invalid/fake token | `403` — "Invalid or expired authentication token" |

---

## 3. CATEGORIES — `/api/categories`

> GET is available to all users. POST/PUT/DELETE require admin token.

### 3a. List Categories (user token)
```
GET /api/categories
Authorization: Bearer TOKEN
```
| # | Test | Expected |
|---|------|----------|
| 13 | List all categories | `200` — array of categories |

---

### 3b. Create Category (admin token required)
```
POST /api/categories
Authorization: Bearer ADMIN_TOKEN
Content-Type: application/json

{ "name": "Transport" }
```
| # | Test | Expected |
|---|------|----------|
| 14 | Create category as admin | `201` — new category object |
| 15 | Create duplicate category | `409` — "Category already exists" |
| 16 | Create category as regular user | `403` — "Admin access required" |
| 17 | Create category with no name | `400` — validation error |

---

### 3c. Update Category (admin token required)
```
PUT /api/categories/1
Authorization: Bearer ADMIN_TOKEN
Content-Type: application/json

{ "name": "Transport Updated" }
```
| # | Test | Expected |
|---|------|----------|
| 18 | Update category as admin | `200` — updated category |
| 19 | Update non-existent category | `404` — "Category not found" |
| 20 | Update as regular user | `403` — "Admin access required" |

---

### 3d. Delete Category (admin token required)
```
DELETE /api/categories/1
Authorization: Bearer ADMIN_TOKEN
```
| # | Test | Expected |
|---|------|----------|
| 21 | Delete category as admin | `200` — "Category deleted successfully" |
| 22 | Expenses reassigned to Uncategorized | Check GET /expenses — category_name should be "Uncategorized" |
| 23 | Delete non-existent category | `404` — "Category not found" |
| 24 | Delete "Uncategorized" category | `400` — "Cannot delete the Uncategorized fallback category" |
| 25 | Delete as regular user | `403` — "Admin access required" |

---

## 4. EXPENSES — `/api/expenses`

> All require user token. Users can only see/edit their own expenses.

### 4a. Create Expense
```
POST /api/expenses
Authorization: Bearer TOKEN
Content-Type: application/json

{
  "title": "Lunch",
  "amount": 5000,
  "category_id": 1,
  "expense_date": "2025-01-15",
  "payment_method": "cash",
  "notes": "Team lunch"
}
```
| # | Test | Expected |
|---|------|----------|
| 26 | Create valid expense | `201` — expense object |
| 27 | Missing required field (e.g. no title) | `400` — validation error |
| 28 | Amount = 0 or negative | `400` — "Amount must be a positive number" |
| 29 | Invalid payment_method | `400` — "Invalid payment method" |
| 30 | Non-existent category_id | `400` — "Category not found" |
| 31 | No token | `401` |

---

### 4b. List Expenses (with filters)
```
GET /api/expenses
Authorization: Bearer TOKEN
```
| # | Test | Expected |
|---|------|----------|
| 32 | List all expenses | `200` — expenses array + pagination object |
| 33 | Search: `?search=lunch` | `200` — only matching expenses |
| 34 | Filter by category: `?category_id=1` | `200` — filtered results |
| 35 | Filter by payment: `?payment_method=cash` | `200` — filtered results |
| 36 | Date range: `?start_date=2025-01-01&end_date=2025-01-31` | `200` — filtered results |
| 37 | Sort by amount: `?sort_by=amount&sort_order=ASC` | `200` — sorted results |
| 38 | Pagination: `?page=1&limit=5` | `200` — max 5 results, pagination info |
| 39 | Cannot see another user's expenses | Sign in as user B — their GET /expenses should NOT return user A's data |

---

### 4c. Get Single Expense
```
GET /api/expenses/1
Authorization: Bearer TOKEN
```
| # | Test | Expected |
|---|------|----------|
| 40 | Get own expense by ID | `200` — expense object |
| 41 | Get non-existent ID | `404` — "Expense not found" |
| 42 | Get another user's expense ID | `404` — "Expense not found" (ownership enforced) |

---

### 4d. Update Expense
```
PUT /api/expenses/1
Authorization: Bearer TOKEN
Content-Type: application/json

{
  "title": "Dinner",
  "amount": 8000,
  "category_id": 1,
  "expense_date": "2025-01-16",
  "payment_method": "card",
  "notes": "Updated"
}
```
| # | Test | Expected |
|---|------|----------|
| 43 | Update own expense | `200` — updated expense |
| 44 | Update non-existent expense | `404` — "Expense not found" |
| 45 | Update another user's expense | `404` — "Expense not found" (ownership enforced) |
| 46 | Invalid amount | `400` — validation error |

---

### 4e. Delete Expense
```
DELETE /api/expenses/1
Authorization: Bearer TOKEN
```
| # | Test | Expected |
|---|------|----------|
| 47 | Delete own expense | `200` — "Expense deleted successfully" |
| 48 | Delete non-existent expense | `404` — "Expense not found" |
| 49 | Delete another user's expense | `404` — "Expense not found" (ownership enforced) |

---

## 5. BUDGETS — `/api/budgets`

> All require user token. Users can only see/edit their own budgets.

### 5a. Create Budget
```
POST /api/budgets
Authorization: Bearer TOKEN
Content-Type: application/json

{ "month": "2025-01-01", "amount": 150000 }
```
| # | Test | Expected |
|---|------|----------|
| 50 | Create budget | `201` — budget object |
| 51 | Create duplicate month | `409` — "A budget already exists for this month" |
| 52 | Missing amount | `400` — validation error |
| 53 | Amount = 0 or negative | `400` — "Amount must be a positive number" |

---

### 5b. List Budgets
```
GET /api/budgets
Authorization: Bearer TOKEN
```
| # | Test | Expected |
|---|------|----------|
| 54 | List own budgets | `200` — budgets array (ordered by month DESC) |
| 55 | Cannot see another user's budgets | Sign in as user B — should only see their own |

---

### 5c. Update Budget
```
PUT /api/budgets/1
Authorization: Bearer TOKEN
Content-Type: application/json

{ "month": "2025-01-01", "amount": 200000 }
```
| # | Test | Expected |
|---|------|----------|
| 56 | Update own budget | `200` — updated budget |
| 57 | Update non-existent budget | `404` — "Budget not found" |
| 58 | Update another user's budget | `404` — "Budget not found" (ownership enforced) |

---

### 5d. Delete Budget
```
DELETE /api/budgets/1
Authorization: Bearer TOKEN
```
| # | Test | Expected |
|---|------|----------|
| 59 | Delete own budget | `200` — "Budget deleted successfully" |
| 60 | Delete non-existent budget | `404` — "Budget not found" |
| 61 | Delete another user's budget | `404` — "Budget not found" (ownership enforced) |

---

## 6. DASHBOARD — `/api/dashboard`

### 6a. User Dashboard Insights
```
GET /api/dashboard/insights
Authorization: Bearer TOKEN
```
| # | Test | Expected |
|---|------|----------|
| 62 | Get own dashboard | `200` — summary, budget, budget_remaining, spending_by_category, highest_expense, recent_expenses |
| 63 | summary has total_spending, total_expenses, average_expense | All three fields present and numeric |
| 64 | budget_remaining is correct | budget.amount minus total_spending |
| 65 | No token | `401` |

---

### 6b. Admin Dashboard Insights
```
GET /api/dashboard/admin-insights
Authorization: Bearer ADMIN_TOKEN
```
| # | Test | Expected |
|---|------|----------|
| 66 | Get admin insights as admin | `200` — summary, spending_by_category, top_categories, bottom_categories, recent_expenses, recent_users |
| 67 | summary has total_users, total_expenses, total_spending, current_month_expenses | All four fields present |
| 68 | Access as regular user | `403` — "Admin access required" |
| 69 | No token | `401` |

---

## 7. FRONTEND CHECKLIST

Open http://localhost:5173 and test these flows manually:

| # | Test | Expected |
|---|------|----------|
| 70 | Sign up new account | Redirects to dashboard |
| 71 | Sign in existing account | Redirects to dashboard |
| 72 | Dashboard shows summary cards | total_spending, total_expenses, average_expense visible |
| 73 | Dashboard shows recent expenses table | Last 5 expenses listed |
| 74 | Dashboard shows spending by category | Category breakdown visible |
| 75 | Navigate to Expenses page | List of expenses with pagination |
| 76 | Search expenses | Results filter as you type |
| 77 | Filter by category | Dropdown filters results |
| 78 | Filter by payment method | Dropdown filters results |
| 79 | Filter by date range | Date inputs filter results |
| 80 | Sort expenses | Sort by amount/date/title works |
| 81 | Add new expense | Form submits, expense appears in list |
| 82 | Edit expense | Pre-filled form, saves correctly |
| 83 | Delete expense | Expense removed from list |
| 84 | Navigate to Budget page | Shows current budget + history table |
| 85 | Set a budget | Budget saved, remaining balance shown |
| 86 | Edit budget | Updated amount reflected |
| 87 | Delete budget from history | Budget removed from history table |
| 88 | Sign out | Redirected to login, token cleared |
| 89 | Access /dashboard without login | Redirected to /login |
| 90 | Access /admin without login | Redirected to /login |
| 91 | Access /admin as regular user | Redirected to / (home) |
| 92 | Sign in as admin | Admin Dashboard link visible in nav |
| 93 | Admin Dashboard loads | Platform summary, categories table, recent users visible |
| 94 | Admin creates category | Category appears in list |
| 95 | Admin edits category | Name updated |
| 96 | Admin deletes category | Category removed, affected expenses show "Uncategorized" |
| 97 | Responsive layout on mobile (resize browser to 375px) | No horizontal overflow, nav usable |

---

## QUICK REFERENCE — Payment Method Values

Only these 4 are valid:
- `cash`
- `mobile-money`
- `card`
- `bank`

## QUICK REFERENCE — Sort Fields

Only these 4 are valid for `sort_by`:
- `expense_date` (default)
- `amount`
- `title`
- `created_at`

## QUICK REFERENCE — Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK |
| 201 | Created |
| 400 | Bad request / validation error |
| 401 | No token |
| 403 | Invalid token or not admin |
| 404 | Not found |
| 409 | Conflict (duplicate) |
| 500 | Server error |
