import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pencil, Trash2, Plus, Search, X, ShieldAlert, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import Navbar from '../components/Navbar';
import type { Expense, Category, ExpensesResponse, CategoriesResponse } from '../types/Expense';
import type { SortBy } from '../redux/expenseFilterSlice';
import { apiGet, apiDelete } from '../services/api';
import {
  setSearch,
  setCategory,
  setPaymentMethod,
  setSortBy,
  setStartDate,
  setEndDate,
} from '../redux/expenseFilterSlice';

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

const SORT_MAP: Record<SortBy, { sort_by: string; sort_order: string }> = {
  'date-desc':   { sort_by: 'expense_date', sort_order: 'DESC' },
  'date-asc':    { sort_by: 'expense_date', sort_order: 'ASC' },
  'amount-desc': { sort_by: 'amount',       sort_order: 'DESC' },
  'amount-asc':  { sort_by: 'amount',       sort_order: 'ASC' },
};

const PAGE_LIMIT = 10;

function Expenses() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { search, category, paymentMethod, sortBy, startDate, endDate } =
    useAppSelector((state) => state.expenseFilter);

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 1 });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Expense | null>(null);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Single effect: debounce search input, reset to page 1 on filter change
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    const delay = search ? 350 : 0;
    debounceRef.current = setTimeout(() => {
      setLoading(true);
      const { sort_by, sort_order } = SORT_MAP[sortBy];
      const params = new URLSearchParams({
        page: String(page),
        limit: String(PAGE_LIMIT),
        sort_by,
        sort_order,
      });
      if (search)        params.set('search', search);
      if (category)      params.set('category_id', category);
      if (paymentMethod) params.set('payment_method', paymentMethod);
      if (startDate)     params.set('start_date', startDate);
      if (endDate)       params.set('end_date', endDate);

      apiGet<ExpensesResponse>(`/expenses?${params.toString()}`)
        .then((data) => {
          setExpenses(data.expenses);
          setPagination(data.pagination);
          setError('');
        })
        .catch((err: unknown) =>
          setError(err instanceof Error ? err.message : 'Failed to load expenses'),
        )
        .finally(() => setLoading(false));
    }, delay);

    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [search, category, paymentMethod, sortBy, startDate, endDate, page]);

  // Load categories once
  useEffect(() => {
    apiGet<CategoriesResponse>('/categories').then((data) => setCategories(data.categories));
  }, []);

  // Reset to page 1 when filters change (not page itself)
  const prevFiltersRef = useRef({ search, category, paymentMethod, sortBy, startDate, endDate });
  useEffect(() => {
    const prev = prevFiltersRef.current;
    if (
      prev.search !== search || prev.category !== category ||
      prev.paymentMethod !== paymentMethod || prev.sortBy !== sortBy ||
      prev.startDate !== startDate || prev.endDate !== endDate
    ) {
      setPage(1);
      prevFiltersRef.current = { search, category, paymentMethod, sortBy, startDate, endDate };
    }
  }, [search, category, paymentMethod, sortBy, startDate, endDate]);

  async function confirmDelete() {
    if (!deleteTarget) return;
    try {
      await apiDelete(`/expenses/${deleteTarget.id}`);
      setDeleteTarget(null);
      // Refresh current page
      setPage((p) => p);
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

          {/* ── Filter toolbar ── */}
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

            <select
              value={sortBy}
              onChange={(e) => dispatch(setSortBy(e.target.value as SortBy))}
            >
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
              {pagination.total} expense{pagination.total !== 1 ? 's' : ''}
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
                  {expenses.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ color: 'var(--muted)', textAlign: 'center', padding: '32px' }}>
                        No expenses found.
                      </td>
                    </tr>
                  ) : (
                    expenses.map((expense) => (
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

          {/* ── Pagination ── */}
          {pagination.totalPages > 1 && (
            <div className="pagination">
              <button
                className="page-btn"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                aria-label="Previous page"
              >
                <ChevronLeft size={15} />
              </button>
              <span className="page-info">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                className="page-btn"
                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                disabled={page === pagination.totalPages}
                aria-label="Next page"
              >
                <ChevronRight size={15} />
              </button>
            </div>
          )}
        </section>
      </main>
    </>
  );
}

export default Expenses;
