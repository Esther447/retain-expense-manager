import type { FormEvent } from 'react';
import { useState } from 'react';
import Navbar from '../components/Navbar';

function Budget() {
  const [budget, setBudget] = useState('');
  const [savedBudget, setSavedBudget] = useState(0);

  const totalSpent = 0;
  const remainingBudget = savedBudget - totalSpent;

  let budgetStatus = 'No Budget Set';

  if (savedBudget > 0) {
    if (totalSpent > savedBudget) {
      budgetStatus = 'Over Budget';
    } else if (totalSpent >= savedBudget * 0.8) {
      budgetStatus = 'Approaching Budget';
    } else {
      budgetStatus = 'Within Budget';
    }
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setSavedBudget(Number(budget));
  };

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

        <section className="budget-grid">
          <div className="budget-card">
            <h2>Set Monthly Budget</h2>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="budget">Budget Amount (RWF)</label>

                <input
                  id="budget"
                  type="number"
                  min="0"
                  step="1"
                  value={budget}
                  onChange={(event) => setBudget(event.target.value)}
                  placeholder="Enter your monthly budget"
                  required
                />
              </div>

              <button type="submit">Save Budget</button>
            </form>
          </div>

          <div className="budget-card">
            <h2>Budget Overview</h2>

            <div className="budget-stat">
              <span>Monthly Budget</span>
              <strong>RWF {savedBudget.toLocaleString()}</strong>
            </div>

            <div className="budget-stat">
              <span>Total Spent</span>
              <strong>RWF {totalSpent.toLocaleString()}</strong>
            </div>

            <div className="budget-stat">
              <span>Remaining Budget</span>
              <strong>
                RWF {Math.max(remainingBudget, 0).toLocaleString()}
              </strong>
            </div>

            <div className="budget-status">
              <span>Status</span>
              <strong>{budgetStatus}</strong>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

export default Budget;
