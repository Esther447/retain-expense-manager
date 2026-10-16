import type { FormEvent } from 'react';
import { useCallback, useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { apiGet, apiPost, apiPut, apiDelete } from '../services/api';

interface BudgetInfo {
  id: number;
  month: string;
  amount: number;
}

interface DashboardData {
  summary: { total_spending: number; total_expenses: number; average_expense: number };
  budget: BudgetInfo | null;
  budget_remaining: number | null;
}

interface BudgetsResponse {
  budgets: BudgetInfo[];
}

function Budget() {
  const [budgetInput, setBudgetInput] = useState('');
  const [data, setData] = useState<DashboardData | null>(null);
  const [allBudgets, setAllBudgets] = useState<BudgetInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const loadData = useCallback(() => {
    setLoading(true);
    Promise.all([
      apiGet<DashboardData>('/dashboard/insights'),
      apiGet<BudgetsResponse>('/budgets'),
    ])
      .then(([insights, budgetsRes]) => {
        setData(insights);
        setAllBudgets(budgetsRes.budgets);
        if (insights.budget) setBudgetInput(String(insights.budget.amount));
      })
      .catch((err: unknown) =>
        setError(err instanceof Error ? err.message : 'Failed to load budget'),
      )
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setSuccessMsg('');
    setSaving(true);

    const now = new Date();
    const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;

    try {
      if (data?.budget) {
        await apiPut(`/budgets/${data.budget.id}`, { month, amount: Number(budgetInput) });
      } else {
        await apiPost('/budgets', { month, amount: Number(budgetInput) });
      }
      setSuccessMsg('Budget saved successfully.');
      loadData();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save budget');
    } finally {
      setSaving(false);
    }
  };

  async function handleDeleteBudget(id: number) {
    if (!window.confirm('Delete this budget?')) return;
    try {
      await apiDelete(`/budgets/${id}`);
      loadData();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to delete budget');
    }
  }

  const totalSpent = data?.summary.total_spending ?? 0;
  const totalExpenses = data?.summary.total_expenses ?? 0;
  const averageExpense = data?.summary.average_expense ?? 0;
  const budgetAmount = data?.budget ? Number(data.budget.amount) : 0;
  const budgetRemaining = data?.budget_remaining ?? null;

  let budgetStatus = 'No Budget Set';
  if (budgetAmount > 0) {
    if (totalSpent > budgetAmount) {
      budgetStatus = 'Over Budget';
    } else if (totalSpent >= budgetAmount * 0.8) {
      budgetStatus = 'Approaching Budget';
    } else {
      budgetStatus = 'Within Budget';
    }
  }

  return (
    <>
      <Navbar />

      <main className="budget-page">
        <header className="page-header">
          <div>
            <h1>Monthly Budget</h1>
            <p>Set and manage your budget for the current month.</p>
          </div>
        </header>

        {loading ? (
          <p>Loading...</p>
        ) : (
          <section className="budget-grid">
            <div className="budget-card">
              <h2>Set Monthly Budget</h2>

              {error && <p className="error-message">{error}</p>}
              {successMsg && <p className="success-message">{successMsg}</p>}

              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="budget">Budget Amount (RWF)</label>
                  <input
                    id="budget"
                    type="number"
                    min="1"
                    step="1"
                    value={budgetInput}
                    onChange={(e) => setBudgetInput(e.target.value)}
                    placeholder="Enter your monthly budget"
                    required
                  />
                </div>
                <button type="submit" disabled={saving}>
                  {saving ? 'Saving...' : data?.budget ? 'Update Budget' : 'Save Budget'}
                </button>
              </form>
            </div>

            <div className="budget-card">
              <h2>Budget Overview</h2>

              <div className="budget-stat">
                <span>Monthly Budget</span>
                <strong>RWF {budgetAmount.toLocaleString()}</strong>
              </div>

              <div className="budget-stat">
                <span>Total Spent</span>
                <strong>RWF {Number(totalSpent).toLocaleString()}</strong>
              </div>

              <div className="budget-stat">
                <span>Total Expenses</span>
                <strong>{totalExpenses}</strong>
              </div>

              <div className="budget-stat">
                <span>Average Expense</span>
                <strong>{averageExpense > 0 ? `RWF ${Number(averageExpense).toLocaleString()}` : '—'}</strong>
              </div>

              <div className="budget-stat">
                <span>Remaining Budget</span>
                <strong>
                  {budgetRemaining !== null
                    ? `RWF ${Math.max(budgetRemaining, 0).toLocaleString()}`
                    : '—'}
                </strong>
              </div>

              <div className="budget-status">
                <span>Status</span>
                <strong>{budgetStatus}</strong>
              </div>
            </div>
          </section>

          {allBudgets.length > 0 && (
            <section className="budget-card" style={{ marginTop: '24px' }}>
              <h2>Budget History</h2>
              <div className="expenses-table-wrapper">
                <table className="expenses-table">
                  <thead>
                    <tr>
                      <th>Month</th>
                      <th>Amount</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allBudgets.map((b) => (
                      <tr key={b.id}>
                        <td>{new Date(b.month).toLocaleDateString(undefined, { year: 'numeric', month: 'long' })}</td>
                        <td>RWF {Number(b.amount).toLocaleString()}</td>
                        <td>
                          <button
                            type="button"
                            className="action-button delete-button"
                            onClick={() => handleDeleteBudget(b.id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        )}
      </main>
    </>
  );
}

export default Budget;
