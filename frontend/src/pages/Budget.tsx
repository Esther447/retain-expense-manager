import type { FormEvent } from 'react';
import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { apiGet, apiPost, apiPut } from '../services/api';

interface BudgetInfo {
  id: number;
  month: string;
  amount: number;
}

interface DashboardData {
  summary: { total_spending: number };
  budget: BudgetInfo | null;
  budget_remaining: number | null;
}

function Budget() {
  const [budgetInput, setBudgetInput] = useState('');
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  function loadData() {
    setLoading(true);
    apiGet<DashboardData>('/dashboard/insights')
      .then((d) => {
        setData(d);
        if (d.budget) {
          setBudgetInput(String(d.budget.amount));
        }
      })
      .catch((err: unknown) =>
        setError(err instanceof Error ? err.message : 'Failed to load budget'),
      )
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setSuccessMsg('');
    setSaving(true);

    // Budget month is always the current month (YYYY-MM-01)
    const now = new Date();
    const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;

    try {
      if (data?.budget) {
        // Budget already exists for this month — update it
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

  const totalSpent = data?.summary.total_spending ?? 0;
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
        )}
      </main>
    </>
  );
}

export default Budget;
