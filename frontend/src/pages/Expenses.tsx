import { useEffect, useMemo, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pencil, Trash2, Plus, Search, X, ShieldAlert } from 'lucide-react';
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

interface ExpensesResponse { expenses: Expense[]; }
interface CategoriesResponse { categories: Category[]; }

// ── Delete modal ──────────────────────────────────────────────────────────────
function DeleteExpenseModal({
  title,
  onConfirm,
  onCancel,
}: {
  title: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-icon"><ShieldAlert size={28} /></div>
        <h3>Delete Expense</h3>
        <p>
          Are you sure you want to delete <strong>"{title}"</strong>?
          This action cannot be undone.
        </p>
        <div className="modal-actions">
          <button className="btn-cancel" onClick={onCancel}>Cancel</button>
          <button className="btn-delete" onClick={onConfirm}>Delete</button>
        </div>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
function Expenses() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { search, category, paymentMethod, sortBy, startDate, endDate } =
    useAppSelector((state) => state.expenseFilter);

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Expense | null>(null);

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

  async function confirmDelete() {
    if (!deleteTarget) return;
    try {
      await apiDelete(`/expenses/${deleteTarget.id}`);
      setExpenses((prev) => prev.filter((e) => e.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to delete expense');
      setDeleteTarget(null);
    }
  }

  const hasActiveFilters = search || category || paymentMethod || startDate || endDate;

  function clearFilters() {
    dispatch(setSearch(''));
    dispatch(setCategory(''));
    dispatch(setPaymentMethod(''));
    dispatch(setStartDate(''));
    dispatch(setEndDate(''));
    dispatch(setSortBy('date-desc'));
  }

  const filteredExpenses = useMemo(() =>
    expenses
      .filter((expense) => {
        const sl = search.toLowerCase();
        return (
          (expense.title.toLowerCase().includes(sl) ||
            (expense.notes ?? '').toLowerCase().includes(sl)) &&
          (category === '' || String(expense.category_id) === category) &&
          (paymentMethod === '' || expense.payment_method === paymentMethod) &&
          (startDate === '' || expense.expense_date >= startDate) &&
          (endDate === '' || expense.expense_date <= endDate)
        );
      })
      .sort((a, b) => {
        if (sortBy === 'date-asc')     return a.expense_date.localeCompare(b.expense_date);
        if (sortBy === 'amount-desc')  return b.amount - a.amount;
        if (sortBy === 'amount-asc')   return a.amount - b.amount;
        return b.expense_date.localeCompare(a.expense_date);
      }),
    [expenses, search, category, paymentMethod, sortBy, startDate, endDate],
  );

  return (
    <>
      <Navbar />

      {deleteTarget && (
        <DeleteExpenseModal
          title={deleteTarget.title}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      <main className="expenses-page">
        <header className="page-header">
          <div>
            <h1>Expenses</h1>
            <p>View and manage your personal expenses.</p>
          </div>
          <button type="button" className="btn-primary" onClick={() => navigate('/expenses/add')}>
            <Plus size={14} style={{ marginRight: 5, verticalAlign: 'middle' }} />
            Add Expense
          </button>
        </header>

        <section className="expenses-section">
          {error && <p className="error-message">{error}</p>}

          {/* ── Sticky filter toolbar ── */}
          <div className="expenses-toolbar">
            <div className="toolbar-search">
              <Search size={14} className="toolbar-search-icon" />
              <input
                type="search"
                placeholder="Search by title or notes…"
                aria-label="Search expenses"
                value={search}
                onChange={(e) => dispatch(setSearch(e.target.value))}
              />
            </div>

            <select value={category} onChange={(e) => dispatch(setCategory(e.target.value))}>
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={String(cat.id)}>{cat.name}</option>
              ))}
            </select>

            <select value={paymentMethod} onChange={(e) => dispatch(setPaymentMethod(e.target.value))}>
              <option value="">All Methods</option>
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

            <select value={sortBy} onChange={(e) => dispatch(setSortBy(e.target.value))}>
              <option value="date-desc">Newest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="amount-desc">Highest Amount</option>
              <option value="amount-asc">Lowest Amount</option>
            </select>

            {hasActiveFilters && (
              <button type="button" className="toolbar-clear" onClick={clearFilters} title="Clear all filters">
                <X size={13} style={{ marginRight: 4, verticalAlign: 'middle' }} />
                Clear
              </button>
            )}
          </div>

          {/* ── Results count ── */}
          {!loading && (
            <p className="results-count">
              {filteredExpenses.length} expense{filteredExpenses.length !== 1 ? 's' : ''}
              {hasActiveFilters ? ' matching filters' : ' total'}
            </p>
          )}

          {/* ── Table ── */}
          {loading ? (
            <div className="dash-loading">
              <div className="dash-spinner" />
              <p>Loading expenses…</p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="expenses-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Category</th>
                    <th>Amount</th>
                    <th>Date</th>
                    <th>Payment</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredExpenses.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ color: 'var(--muted)', textAlign: 'center', padding: '32px' }}>
                        No expenses found.
                      </td>
                    </tr>
                  ) : (
                    filteredExpenses.map((expense) => (
                      <tr key={expense.id}>
                        <td>{expense.title}</td>
                        <td><span className="cat-badge">{expense.category_name}</span></td>
                        <td>RWF {Number(expense.amount).toLocaleString()}</td>
                        <td style={{ color: 'var(--muted)' }}>{new Date(expense.expense_date).toLocaleDateString()}</td>
                        <td style={{ color: 'var(--muted)', fontSize: '13px' }}>{expense.payment_method}</td>
                        <td>
                          <button
                            type="button"
                            className="action-button edit-button"
                            onClick={() => navigate('/expenses/edit', { state: expense })}
                            title="Edit"
                          >
                            <Pencil size={13} />
                          </button>
                          <button
                            type="button"
                            className="action-button delete-button"
                            onClick={() => setDeleteTarget(expense)}
                            title="Delete"
                          >
                            <Trash2 size={13} />
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
