import { useCallback, useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { apiGet, apiPost, apiPut, apiDelete } from '../services/api';
import Navbar from '../components/Navbar';
import './AdminDashboard.css';

// ── Types ────────────────────────────────────────────────────────────────────

interface AdminSummary {
  total_users: number;
  total_expenses: number;
  total_spending: number;
  current_month_expenses: number;
}

interface CategoryStat {
  id: number;
  category_name: string;
  total_amount: number;
  expense_count: number;
}

interface CategoryUsage {
  category_name: string;
  expense_count: number;
}

interface RecentExpense {
  id: number;
  title: string;
  amount: number;
  user_name: string;
  category_name: string;
  expense_date: string;
}

interface RecentUser {
  id: number;
  name: string;
  email: string;
  role: 'user' | 'admin';
  created_at: string;
}

interface AdminInsights {
  summary: AdminSummary;
  spending_by_category: CategoryStat[];
  top_categories: CategoryUsage[];
  bottom_categories: CategoryUsage[];
  recent_expenses: RecentExpense[];
  recent_users: RecentUser[];
}

interface Category {
  id: number;
  name: string;
}

interface CategoriesResponse {
  categories: Category[];
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function fmt(amount: number) {
  return `RWF ${Number(amount).toLocaleString()}`;
}

// ── Sub-components ───────────────────────────────────────────────────────────

function InsightsTab({ insights }: { insights: AdminInsights }) {
  const { summary, spending_by_category, top_categories, bottom_categories, recent_expenses, recent_users } = insights;

  return (
    <>
      <section className="admin-summary">
        <div className="admin-stat-card">
          <span className="stat-label">Total Users</span>
          <span className="stat-value">{summary.total_users}</span>
        </div>
        <div className="admin-stat-card">
          <span className="stat-label">Total Expenses</span>
          <span className="stat-value">{summary.total_expenses}</span>
        </div>
        <div className="admin-stat-card">
          <span className="stat-label">Total Value</span>
          <span className="stat-value">{fmt(summary.total_spending)}</span>
        </div>
        <div className="admin-stat-card">
          <span className="stat-label">This Month</span>
          <span className="stat-value">{summary.current_month_expenses}</span>
        </div>
      </section>

      <section className="admin-card">
        <h2>Spending per Category</h2>
        {spending_by_category.length === 0 ? (
          <p className="empty-msg">No expenses recorded yet.</p>
        ) : (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Expenses</th>
                  <th>Total Spent</th>
                </tr>
              </thead>
              <tbody>
                {spending_by_category.map((cat) => (
                  <tr key={cat.id}>
                    <td>{cat.category_name}</td>
                    <td>{cat.expense_count}</td>
                    <td>{fmt(cat.total_amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <div className="admin-grid">
        <section className="admin-card">
          <h2>Top 5 Most-Used Categories</h2>
          {top_categories.length === 0 ? (
            <p className="empty-msg">No data yet.</p>
          ) : (
            <ol className="rank-list">
              {top_categories.map((cat, i) => (
                <li key={cat.category_name} className="rank-item">
                  <span className="rank-num">{i + 1}</span>
                  <span className="rank-name">{cat.category_name}</span>
                  <span className="rank-count">{cat.expense_count} expenses</span>
                </li>
              ))}
            </ol>
          )}
        </section>

        <section className="admin-card">
          <h2>Bottom 5 Least-Used Categories</h2>
          {bottom_categories.length === 0 ? (
            <p className="empty-msg">No data yet.</p>
          ) : (
            <ol className="rank-list">
              {bottom_categories.map((cat, i) => (
                <li key={cat.category_name} className="rank-item">
                  <span className="rank-num">{i + 1}</span>
                  <span className="rank-name">{cat.category_name}</span>
                  <span className="rank-count">{cat.expense_count} expenses</span>
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>

      <div className="admin-grid">
        <section className="admin-card">
          <h2>Recently Added Expenses</h2>
          {recent_expenses.length === 0 ? (
            <p className="empty-msg">No expenses yet.</p>
          ) : (
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>User</th>
                    <th>Category</th>
                    <th>Amount</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recent_expenses.map((exp) => (
                    <tr key={exp.id}>
                      <td>{exp.title}</td>
                      <td>{exp.user_name}</td>
                      <td>{exp.category_name}</td>
                      <td>{fmt(exp.amount)}</td>
                      <td>{new Date(exp.expense_date).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="admin-card">
          <h2>Recently Registered Users</h2>
          {recent_users.length === 0 ? (
            <p className="empty-msg">No users yet.</p>
          ) : (
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {recent_users.map((u) => (
                    <tr key={u.id}>
                      <td>{u.name}</td>
                      <td>{u.email}</td>
                      <td>
                        <span className={`role-badge role-${u.role}`}>{u.role}</span>
                      </td>
                      <td>{new Date(u.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </>
  );
}

function CategoriesTab() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const loadCategories = useCallback(() => {
    setLoading(true);
    apiGet<CategoriesResponse>('/categories')
      .then((data) => setCategories(data.categories))
      .catch((err: unknown) =>
        setError(err instanceof Error ? err.message : 'Failed to load categories')
      )
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  async function handleCreate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    try {
      await apiPost('/categories', { name: newName.trim() });
      setNewName('');
      loadCategories();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create category');
    }
  }

  function startEdit(cat: Category) {
    setEditingId(cat.id);
    setEditingName(cat.name);
    setError('');
  }

  function cancelEdit() {
    setEditingId(null);
    setEditingName('');
  }

  async function handleUpdate(id: number) {
    setError('');
    try {
      await apiPut(`/categories/${id}`, { name: editingName.trim() });
      setEditingId(null);
      loadCategories();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update category');
    }
  }

  async function handleDelete(id: number, name: string) {
    if (!window.confirm(`Delete "${name}"? Any expenses in this category will be moved to Uncategorized.`)) return;
    setError('');
    try {
      await apiDelete(`/categories/${id}`);
      loadCategories();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to delete category');
    }
  }

  if (loading) return <p>Loading categories...</p>;

  return (
    <section className="admin-card">
      <h2>Manage Categories</h2>

      {error && <p className="admin-error">{error}</p>}

      <form className="category-form" onSubmit={handleCreate}>
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="New category name"
          required
        />
        <button type="submit" className="btn-primary">Add</button>
      </form>

      <div className="admin-table-wrapper">
        <table className="admin-table category-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((cat) => (
            <tr key={cat.id}>
              <td>
                {editingId === cat.id ? (
                  <input
                    className="inline-edit"
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    autoFocus
                  />
                ) : (
                  cat.name
                )}
              </td>
              <td className="action-cell">
                {editingId === cat.id ? (
                  <>
                    <button className="btn-save" onClick={() => handleUpdate(cat.id)}>Save</button>
                    <button className="btn-cancel" onClick={cancelEdit}>Cancel</button>
                  </>
                ) : (
                  <>
                    <button className="btn-edit" onClick={() => startEdit(cat)}>Edit</button>
                    {cat.name !== 'Uncategorized' && (
                      <button className="btn-delete" onClick={() => handleDelete(cat.id, cat.name)}>Delete</button>
                    )}
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </section>
  );
}

// ── Main component ───────────────────────────────────────────────────────────

type Tab = 'insights' | 'categories';

function AdminDashboard() {
  const [tab, setTab] = useState<Tab>('insights');
  const [insights, setInsights] = useState<AdminInsights | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet<AdminInsights>('/dashboard/admin-insights')
      .then(setInsights)
      .catch((err: unknown) =>
        setError(err instanceof Error ? err.message : 'Failed to load admin insights')
      )
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Navbar />
      <main className="admin-page">
        <h1>Admin Dashboard</h1>

      <div className="admin-tabs">
        <button
          className={`tab-btn ${tab === 'insights' ? 'active' : ''}`}
          onClick={() => setTab('insights')}
        >
          Insights
        </button>
        <button
          className={`tab-btn ${tab === 'categories' ? 'active' : ''}`}
          onClick={() => setTab('categories')}
        >
          Categories
        </button>
      </div>

      {tab === 'insights' && (
        loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p className="admin-error">{error}</p>
        ) : insights ? (
          <InsightsTab insights={insights} />
        ) : null
      )}

      {tab === 'categories' && <CategoriesTab />}
      </main>
    </>
  );
}

export default AdminDashboard;
