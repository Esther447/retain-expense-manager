import { useEffect, useMemo, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import Navbar from '../components/Navbar';
import type { Expense, Category } from '../types/Expense';
import { apiGet, apiDelete } from '../services/api';
import {
  setSearch,
  setCategory,
  setPaymentMethod,
  setSortBy,
  setStartDate,
  setEndDate,
} from '../redux/expenseFilterSlice';

interface ExpensesResponse {
  expenses: Expense[];
}

interface CategoriesResponse {
  categories: Category[];
}

function Expenses() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { search, category, paymentMethod, sortBy, startDate, endDate } =
    useAppSelector((state) => state.expenseFilter);

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadExpenses = useCallback(() => {
    apiGet<ExpensesResponse>('/expenses?limit=100')
      .then((data) => setExpenses(data.expenses))
      .catch((err: unknown) =>
        setError(err instanceof Error ? err.message : 'Failed to load expenses'),
      )
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadExpenses();
    apiGet<CategoriesResponse>('/categories').then((data) =>
      setCategories(data.categories),
    );
  }, [loadExpenses]);

  async function handleDelete(id: number) {
    if (!window.confirm('Are you sure you want to delete this expense?')) return;
    try {
      await apiDelete(`/expenses/${id}`);
      setExpenses((prev) => prev.filter((e) => e.id !== id));
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to delete expense');
    }
  }

  const filteredExpenses = useMemo(() => expenses
    .filter((expense) => {
      const searchLower = search.toLowerCase();
      const matchesSearch =
        expense.title.toLowerCase().includes(searchLower) ||
        (expense.notes ?? '').toLowerCase().includes(searchLower);
      const matchesCategory =
        category === '' || String(expense.category_id) === category;
      const matchesPayment =
        paymentMethod === '' || expense.payment_method === paymentMethod;
      const matchesStart = startDate === '' || expense.expense_date >= startDate;
      const matchesEnd = endDate === '' || expense.expense_date <= endDate;
      return matchesSearch && matchesCategory && matchesPayment && matchesStart && matchesEnd;
    })
    .sort((a, b) => {
      if (sortBy === 'date-asc') return a.expense_date.localeCompare(b.expense_date);
      if (sortBy === 'amount-desc') return b.amount - a.amount;
      if (sortBy === 'amount-asc') return a.amount - b.amount;
      return b.expense_date.localeCompare(a.expense_date);
    }), [expenses, search, category, paymentMethod, sortBy, startDate, endDate]);

  return (
    <>
      <Navbar />

      <main className="expenses-page">
        <header className="page-header">
          <div>
            <h1>Expenses</h1>
            <p>View and manage your personal expenses.</p>
          </div>
          <button type="button" onClick={() => navigate('/expenses/add')}>
            + Add Expense
          </button>
        </header>

        <section className="expenses-section">
          {error && <p className="error-message">{error}</p>}

          <div className="expenses-toolbar">
            <input
              type="search"
              placeholder="Search expenses..."
              aria-label="Search expenses"
              value={search}
              onChange={(e) => dispatch(setSearch(e.target.value))}
            />

            <select
              value={category}
              onChange={(e) => dispatch(setCategory(e.target.value))}
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={String(cat.id)}>
                  {cat.name}
                </option>
              ))}
            </select>

            <select
              value={paymentMethod}
              onChange={(e) => dispatch(setPaymentMethod(e.target.value))}
            >
              <option value="">All Payment Methods</option>
              <option value="cash">Cash</option>
              <option value="mobile-money">Mobile Money</option>
              <option value="card">Card</option>
              <option value="bank">Bank Transfer</option>
            </select>

            <input
              type="date"
              value={startDate}
              onChange={(e) => dispatch(setStartDate(e.target.value))}
              aria-label="Start date"
            />

            <input
              type="date"
              value={endDate}
              onChange={(e) => dispatch(setEndDate(e.target.value))}
              aria-label="End date"
            />

            <select
              value={sortBy}
              onChange={(e) => dispatch(setSortBy(e.target.value))}
            >
              <option value="date-desc">Newest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="amount-desc">Highest Amount</option>
              <option value="amount-asc">Lowest Amount</option>
            </select>
          </div>

          {loading ? (
            <p>Loading expenses...</p>
          ) : (
            <div className="expenses-table-wrapper">
              <table className="expenses-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Category</th>
                    <th>Amount</th>
                    <th>Date</th>
                    <th>Payment Method</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredExpenses.length === 0 ? (
                    <tr>
                      <td colSpan={6}>No expenses found.</td>
                    </tr>
                  ) : (
                    filteredExpenses.map((expense) => (
                      <tr key={expense.id}>
                        <td>{expense.title}</td>
                        <td>{expense.category_name}</td>
                        <td>RWF {Number(expense.amount).toLocaleString()}</td>
                        <td>{new Date(expense.expense_date).toLocaleDateString()}</td>
                        <td>{expense.payment_method}</td>
                        <td>
                          <button
                            type="button"
                            className="action-button edit-button"
                            onClick={() =>
                              navigate('/expenses/edit', { state: expense })
                            }
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="action-button delete-button"
                            onClick={() => handleDelete(expense.id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </>
  );
}

export default Expenses;
