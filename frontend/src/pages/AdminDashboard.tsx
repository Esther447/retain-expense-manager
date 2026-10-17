import { useCallback, useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import {
  Users, Receipt, DollarSign, CalendarDays,
  Plus, Pencil, Trash2, Check, X, ShieldAlert,
} from 'lucide-react';
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

const CHART_COLORS = [
  '#06B6D4', '#8B5CF6', '#34D399', '#FBBF24',
  '#F87171', '#60A5FA', '#A78BFA', '#2DD4BF',
];

// ── Delete Confirmation Modal ─────────────────────────────────────────────────

interface DeleteModalProps {
  name: string;
  onConfirm: () => void;
  onCancel: () => void;
}

function DeleteModal({ name, onConfirm, onCancel }: DeleteModalProps) {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-icon"><ShieldAlert size={28} /></div>
        <h3>Delete Category</h3>
        <p>
          Are you sure you want to delete <strong>"{name}"</strong>?
          All expenses in this category will be re-assigned to{' '}
          <strong>Uncategorized</strong>.
        </p>
        <div className="modal-actions">
          <button className="btn-cancel" onClick={onCancel}>Cancel</button>
          <button className="btn-delete" onClick={onConfirm}>Delete</button>
        </div>
      </div>
    </div>
  );
}

// ── InsightsTab ───────────────────────────────────────────────────────────────

function InsightsTab({ insights }: { insights: AdminInsights }) {
  const {
    summary, spending_by_category, top_categories,
    bottom_categories, recent_expenses, recent_users,
  } = insights;

  const chartData = spending_by_category
    .filter((c) => Number(c.total_amount) > 0)
    .slice(0, 8)
    .map((c) => ({ name: c.category_name, value: Number(c.total_amount) }));

  return (
    <>
      {/* KPI cards */}
      <section className="admin-summary">
        <div className="admin-stat-card">
          <div className="admin-kpi-icon kpi-cyan"><Users size={18} /></div>
          <span className="stat-label">Total Users</span>
          <span className="stat-value">{summary.total_users}</span>
        </div>
        <div className="admin-stat-card">
          <div className="admin-kpi-icon kpi-violet"><Receipt size={18} /></div>
          <span className="stat-label">Total Expenses</span>
          <span className="stat-value">{summary.total_expenses}</span>
        </div>
        <div className="admin-stat-card">
          <div className="admin-kpi-icon kpi-green"><DollarSign size={18} /></div>
          <span className="stat-label">Total Value</span>
          <span className="stat-value">{fmt(summary.total_spending)}</span>
        </div>
        <div className="admin-stat-card">
          <div className="admin-kpi-icon kpi-amber"><CalendarDays size={18} /></div>
          <span className="stat-label">This Month</span>
          <span className="stat-value">{summary.current_month_expenses}</span>
        </div>
      </section>

      {/* Bar chart */}
      {chartData.length > 0 && (
        <section className="admin-card">
          <h2>Spending per Category</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
              <XAxis
                dataKey="name"
                tick={{ fill: '#94A3B8', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis hide />
              <Tooltip
                formatter={(value) => [fmt(Number(value ?? 0)), 'Spent']}
                contentStyle={{
                  background: 'rgba(30,41,59,0.95)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 8,
                  color: '#F8FAFC',
                  fontSize: 12,
                }}
                cursor={{ fill: 'rgba(255,255,255,0.04)' }}
              />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {chartData.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </section>
      )}

      {/* Top / Bottom categories */}
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

      {/* Recent feeds */}
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
                      <td style={{ color: 'var(--muted)' }}>{exp.user_name}</td>
                      <td><span className="cat-badge">{exp.category_name}</span></td>
                      <td>{fmt(exp.amount)}</td>
                      <td style={{ color: 'var(--muted)' }}>{new Date(exp.expense_date).toLocaleDateString()}</td>
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
                      <td style={{ color: 'var(--muted)', fontSize: 12 }}>{u.email}</td>
                      <td><span className={`role-badge role-${u.role}`}>{u.role}</span></td>
                      <td style={{ color: 'var(--muted)' }}>{new Date(u.created_at).toLocaleDateString()}</td>
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

// ── CategoriesTab ─────────────────────────────────────────────────────────────

function CategoriesTab() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const loadCategories = useCallback(() => {
    setLoading(true);
    apiGet<CategoriesResponse>('/categories')
      .then((data) => setCategories(data.categories))
      .catch((err: unknown) =>
        setError(err instanceof Error ? err.message : 'Failed to load categories'),
      )
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { loadCategories(); }, [loadCategories]);

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

  async function confirmDelete() {
    if (!deleteTarget) return;
    setError('');
    try {
      await apiDelete(`/categories/${deleteTarget.id}`);
      setDeleteTarget(null);
      loadCategories();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to delete category');
      setDeleteTarget(null);
    }
  }

  if (loading) return <p style={{ color: 'var(--muted)', padding: '16px 0' }}>Loading categories…</p>;

  return (
    <>
      {deleteTarget && (
        <DeleteModal
          name={deleteTarget.name}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

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
          <button type="submit" className="btn-primary">
            <Plus size={14} style={{ marginRight: 4, verticalAlign: 'middle' }} />
            Add
          </button>
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
                        <button className="btn-save" onClick={() => handleUpdate(cat.id)}>
                          <Check size={13} />
                        </button>
                        <button className="btn-cancel" onClick={() => { setEditingId(null); setEditingName(''); }}>
                          <X size={13} />
                        </button>
                      </>
                    ) : (
                      <>
                        <button className="btn-edit" onClick={() => { setEditingId(cat.id); setEditingName(cat.name); setError(''); }}>
                          <Pencil size={13} />
                        </button>
                        {cat.name !== 'Uncategorized' && (
                          <button className="btn-delete" onClick={() => setDeleteTarget(cat)}>
                            <Trash2 size={13} />
                          </button>
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
    </>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

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
        setError(err instanceof Error ? err.message : 'Failed to load admin insights'),
      )
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Navbar />
      <main className="admin-page">
        <h1>Admin Dashboard</h1>

        <div className="admin-tabs">
          <button className={`tab-btn ${tab === 'insights' ? 'active' : ''}`} onClick={() => setTab('insights')}>
            Insights
          </button>
          <button className={`tab-btn ${tab === 'categories' ? 'active' : ''}`} onClick={() => setTab('categories')}>
            Categories
          </button>
        </div>

        {tab === 'insights' && (
          loading ? (
            <div className="dash-loading">
              <div className="dash-spinner" />
              <p>Loading insights…</p>
            </div>
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
