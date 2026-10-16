import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { apiGet } from '../services/api';

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
}

interface DashboardData {
  summary: DashboardSummary;
  budget: BudgetInfo | null;
  budget_remaining: number | null;
  spending_by_category: CategorySpending[];
  highest_expense: HighestExpense | null;
  recent_expenses: RecentExpense[];
}

function fmt(n: number) {
  return `RWF ${Number(n).toLocaleString()}`;
}

function Dashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    apiGet<DashboardData>('/dashboard/insights')
      .then(setData)
      .catch((err: unknown) =>
        setError(err instanceof Error ? err.message : 'Failed to load dashboard'),
      )
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="dashboard"><p>Loading...</p></main>
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

  const totalSpent = data?.summary.total_spending ?? 0;
  const budgetAmount = data?.budget ? Number(data.budget.amount) : 0;
  const budgetRemaining = data?.budget_remaining ?? null;
  const highestExpense = data?.highest_expense ?? null;
  const recentExpenses = data?.recent_expenses ?? [];
  const spendingByCategory = data?.spending_by_category ?? [];

  const budgetStatus = useMemo(() => {
    if (budgetAmount <= 0) return 'No Budget Set';
    if (totalSpent > budgetAmount) return 'Over Budget';
    if (totalSpent >= budgetAmount * 0.8) return 'Approaching Budget';
    return 'Within Budget';
  }, [totalSpent, budgetAmount]);

  return (
    <>
      <Navbar />

      <main className="dashboard">
        <header className="dashboard-header">
          <div>
            <h1>Dashboard</h1>
            <p>Welcome to your Retain expense manager.</p>
          </div>
          <button type="button" onClick={() => navigate('/expenses/add')}>
            + Add Expense
          </button>
        </header>

        <section className="overview">
          <div className="summary-card">
            <h2>Total Spent</h2>
            <p>{fmt(totalSpent)}</p>
          </div>

          <div className="summary-card">
            <h2>Remaining Budget</h2>
            <p>{budgetRemaining !== null ? fmt(Math.max(budgetRemaining, 0)) : '—'}</p>
          </div>

          <div className="summary-card">
            <h2>Highest Expense</h2>
            <p>{highestExpense ? fmt(highestExpense.amount) : '—'}</p>
            {highestExpense && (
              <small>{highestExpense.title}</small>
            )}
          </div>

          <div className="summary-card">
            <h2>Budget Status</h2>
            <p>{budgetStatus}</p>
          </div>
        </section>

        <section className="dashboard-section">
          <div className="section-header">
            <h2>Recent Expenses</h2>
            <button type="button" onClick={() => navigate('/expenses')}>
              View All
            </button>
          </div>

          <table className="expenses-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Category</th>
                <th>Amount</th>
                <th>Date</th>
                <th>Payment</th>
              </tr>
            </thead>
            <tbody>
              {recentExpenses.length === 0 ? (
                <tr>
                  <td colSpan={5}>No expenses yet.</td>
                </tr>
              ) : (
                recentExpenses.map((expense) => (
                  <tr key={expense.id}>
                    <td>{expense.title}</td>
                    <td>{expense.category_name}</td>
                    <td>{fmt(expense.amount)}</td>
                    <td>{new Date(expense.expense_date).toLocaleDateString()}</td>
                    <td>{expense.payment_method}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </section>

        <section className="dashboard-section">
          <h2>Spending by Category</h2>
          <div className="category-breakdown">
            {spendingByCategory.filter((c) => Number(c.total_amount) > 0).length === 0 ? (
              <p style={{ color: '#6b7280' }}>No spending data yet.</p>
            ) : (
              spendingByCategory
                .filter((c) => Number(c.total_amount) > 0)
                .map((cat) => (
                  <div key={cat.category_id} className="category-row">
                    <span>{cat.category_name}</span>
                    <strong>{fmt(cat.total_amount)}</strong>
                  </div>
                ))
            )}
          </div>
        </section>
      </main>
    </>
  );
}

export default Dashboard;
