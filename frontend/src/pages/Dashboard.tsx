import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, Wallet, ArrowUpCircle, BarChart2, Plus, Target, List, Pencil, Trash2, ShieldAlert } from 'lucide-react';
import Navbar from '../components/Navbar';
import { apiGet, apiDelete } from '../services/api';

interface DashboardSummary {
  total_spending: number;
  total_expenses: number;
  average_expense: number;
}

interface BudgetInfo {
  id: number;
  month: string;
  amount: number;
}

interface CategorySpending {
  category_id: number;
  category_name: string;
  total_amount: number;
  expense_count: number;
}

interface HighestExpense {
  id: number;
  title: string;
  amount: number;
  category_name: string;
  expense_date: string;
}

interface RecentExpense {
  id: number;
  title: string;
  amount: number;
  category_name: string;
  expense_date: string;
  payment_method: string;
  category_id: number;
  notes?: string;
  updated_at?: string;
  created_at?: string;
}

interface DashboardData {
  summary: DashboardSummary;
  budget: BudgetInfo | null;
  budget_remaining: number | null;
  spending_by_category: CategorySpending[];
  highest_expense: HighestExpense | null;
  recent_expenses: RecentExpense[];
}

const CHART_COLORS = [
  '#06B6D4', '#8B5CF6', '#34D399', '#FBBF24',
  '#F87171', '#60A5FA', '#A78BFA', '#2DD4BF',
];

function fmt(n: number) {
  return `RWF ${Number(n).toLocaleString()}`;
}

function Dashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);

  function loadDashboard() {
    apiGet<DashboardData>('/dashboard/insights')
      .then(setData)
      .catch((err: unknown) =>
        setError(err instanceof Error ? err.message : 'Failed to load dashboard'),
      )
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  async function handleDelete(id: number) {
    try {
      await apiDelete(`/expenses/${id}`);
      setDeleteTargetId(null);
      loadDashboard();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to delete expense');
    }
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="dashboard">
          <div className="dash-loading">
            <div className="dash-spinner" />
            <p>Loading dashboard…</p>
          </div>
        </main>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <main className="dashboard"><p className="error-message">{error}</p></main>
      </>
    );
  }

  const currentMonthLabel = new Date().toLocaleDateString(undefined, { month: 'long', year: 'numeric' });

  const totalSpent     = data?.summary.total_spending ?? 0;
  const totalExpenses  = data?.summary.total_expenses ?? 0;
  const avgExpense     = data?.summary.average_expense ?? 0;
  const budgetAmount   = data?.budget ? Number(data.budget.amount) : 0;
  const budgetRemaining = data?.budget_remaining ?? null;
  const highestExpense = data?.highest_expense ?? null;
  const recentExpenses = data?.recent_expenses ?? [];
  const spendingByCategory = (data?.spending_by_category ?? []).filter(
    (c) => Number(c.total_amount) > 0,
  );

  const pct = budgetAmount > 0 ? Math.min((totalSpent / budgetAmount) * 100, 100) : 0;
  let budgetStatus = 'No Budget Set';
  let progressClass = 'within';
  if (budgetAmount > 0) {
    if (totalSpent > budgetAmount)            { budgetStatus = 'Over Budget';        progressClass = 'over'; }
    else if (totalSpent >= budgetAmount * 0.8) { budgetStatus = 'Approaching Budget'; progressClass = 'approach'; }
    else                                       { budgetStatus = 'Within Budget';      progressClass = 'within'; }
  }

  const chartData = spendingByCategory.map((c) => ({
    name: c.category_name,
    value: Number(c.total_amount),
  }));

  return (
    <>
      <Navbar />

      {deleteTargetId !== null && (
        <div className="modal-overlay" onClick={() => setDeleteTargetId(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-icon"><ShieldAlert size={28} /></div>
            <h3>Delete Expense</h3>
            <p>Are you sure you want to delete this expense? This action cannot be undone.</p>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setDeleteTargetId(null)}>Cancel</button>
              <button className="btn-delete" onClick={() => handleDelete(deleteTargetId)}>Delete</button>
            </div>
          </div>
        </div>
      )}

      <main className="dashboard">
        <header className="dashboard-header">
          <div>
            <h1>Dashboard</h1>
            <p>Spending summary for <strong style={{ color: 'var(--text)' }}>{currentMonthLabel}</strong></p>
          </div>
          <button type="button" className="btn-primary" onClick={() => navigate('/expenses/add')}>
            <Plus size={15} style={{ marginRight: 6, verticalAlign: 'middle' }} />
            Add Expense
          </button>
        </header>

        {/* ── KPI Cards ── */}
        <section className="overview">
          <div className="summary-card">
            <div className="kpi-icon kpi-cyan"><TrendingUp size={18} /></div>
            <h2>Total Spent</h2>
            <p>{fmt(totalSpent)}</p>
            <small>{totalExpenses} expense{totalExpenses !== 1 ? 's' : ''} this month</small>
          </div>

          <div className="summary-card">
            <div className="kpi-icon kpi-violet"><Wallet size={18} /></div>
            <h2>Remaining Budget</h2>
            <p>{budgetRemaining !== null ? fmt(Math.max(budgetRemaining, 0)) : '—'}</p>
            {budgetAmount > 0 ? (
              <div className="budget-progress-wrap">
                <div className="budget-progress-bar">
                  <div className={`budget-progress-fill ${progressClass}`} style={{ width: `${pct}%` }} />
                </div>
                <div className="budget-progress-label">
                  <span>{budgetStatus}</span>
                  <span>{Math.round(pct)}%</span>
                </div>
              </div>
            ) : (
              <small>No budget set</small>
            )}
          </div>

          <div className="summary-card">
            <div className="kpi-icon kpi-amber"><ArrowUpCircle size={18} /></div>
            <h2>Highest Expense</h2>
            <p>{highestExpense ? fmt(highestExpense.amount) : '—'}</p>
            {highestExpense && <small>{highestExpense.title}</small>}
          </div>

          <div className="summary-card">
            <div className="kpi-icon kpi-green"><BarChart2 size={18} /></div>
            <h2>Avg. Expense</h2>
            <p>{avgExpense ? fmt(avgExpense) : '—'}</p>
            <small>per transaction</small>
          </div>
        </section>

        {/* ── Middle: Donut Chart + Quick Actions ── */}
        <div className="dashboard-middle">
          <section className="dashboard-section">
            <div className="section-header">
              <h2>Spending by Category</h2>
            </div>

            {chartData.length === 0 ? (
              <p style={{ color: 'var(--muted)', fontSize: '14px' }}>No spending data yet.</p>
            ) : (
              <div className="chart-layout">
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={110}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {chartData.map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => [fmt(Number(value ?? 0)), 'Spent']}
                      contentStyle={{
                        background: 'rgba(30,41,59,0.95)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: 8,
                        color: '#F8FAFC',
                        fontSize: 13,
                      }}
                    />
                    <Legend
                      iconType="circle"
                      iconSize={8}
                      formatter={(value) => (
                        <span style={{ color: '#94A3B8', fontSize: 12 }}>{value}</span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </section>

          <div className="quick-actions">
            <h2>Quick Actions</h2>
            <button type="button" className="quick-action-btn" onClick={() => navigate('/expenses/add')}>
              <span className="qa-icon"><Plus size={16} /></span>
              Add New Expense
            </button>
            <button type="button" className="quick-action-btn" onClick={() => navigate('/budget')}>
              <span className="qa-icon"><Target size={16} /></span>
              Set Monthly Budget
            </button>
            <button type="button" className="quick-action-btn" onClick={() => navigate('/expenses')}>
              <span className="qa-icon"><List size={16} /></span>
              View All Expenses
            </button>
          </div>
        </div>

        {/* ── Recent Expenses ── */}
        <section className="dashboard-section">
          <div className="section-header">
            <h2>Recent Expenses</h2>
            <button type="button" onClick={() => navigate('/expenses')}>View All</button>
          </div>

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
                {recentExpenses.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ color: 'var(--muted)' }}>No expenses yet.</td>
                  </tr>
                ) : (
                  recentExpenses.map((expense) => (
                    <tr key={expense.id}>
                      <td>{expense.title}</td>
                      <td><span className="cat-badge">{expense.category_name}</span></td>
                      <td>{fmt(expense.amount)}</td>
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
                          onClick={() => setDeleteTargetId(expense.id)}
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
        </section>
      </main>
    </>
  );
}

export default Dashboard;
