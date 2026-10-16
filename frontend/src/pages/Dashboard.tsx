import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import type { Expense } from '../types/Expense';

const TEMP_EXPENSES: Expense[] = [
  {
    id: 1,
    title: 'Lunch',
    description: 'Lunch at campus',
    amount: 5000,
    category: 'food',
    date: '2026-10-07',
    paymentMethod: 'mobile-money',
    notes: 'Regular lunch',
  },
  {
    id: 2,
    title: 'Bus Transport',
    description: 'Transport to campus',
    amount: 2500,
    category: 'transport',
    date: '2026-10-06',
    paymentMethod: 'cash',
  },
  {
    id: 3,
    title: 'Internet',
    description: 'Monthly internet payment',
    amount: 15000,
    category: 'other',
    date: '2026-10-05',
    paymentMethod: 'mobile-money',
  },
  {
    id: 4,
    title: 'Programming Course',
    description: 'Online learning course',
    amount: 20000,
    category: 'education',
    date: '2026-10-03',
    paymentMethod: 'card',
  },
];

const TEMP_BUDGET = 100000;

function Dashboard() {
  const navigate = useNavigate();

  const totalSpent = TEMP_EXPENSES.reduce((sum, e) => sum + e.amount, 0);
  const remainingBudget = TEMP_BUDGET - totalSpent;

  const highestExpense = TEMP_EXPENSES.reduce(
    (max, e) => (e.amount > max.amount ? e : max),
    TEMP_EXPENSES[0],
  );

  const recentExpenses = [...TEMP_EXPENSES]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5);

  const spendingByCategory = TEMP_EXPENSES.reduce<Record<string, number>>(
    (acc, e) => {
      acc[e.category] = (acc[e.category] ?? 0) + e.amount;
      return acc;
    },
    {},
  );

  let budgetStatus = 'Within Budget';
  if (totalSpent > TEMP_BUDGET) {
    budgetStatus = 'Over Budget';
  } else if (totalSpent >= TEMP_BUDGET * 0.8) {
    budgetStatus = 'Approaching Budget';
  }

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
            <p>RWF {totalSpent.toLocaleString()}</p>
          </div>

          <div className="summary-card">
            <h2>Remaining Budget</h2>
            <p>RWF {Math.max(remainingBudget, 0).toLocaleString()}</p>
          </div>

          <div className="summary-card">
            <h2>Highest Expense</h2>
            <p>RWF {highestExpense?.amount.toLocaleString() ?? 0}</p>
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
              </tr>
            </thead>
            <tbody>
              {recentExpenses.length === 0 ? (
                <tr>
                  <td colSpan={4}>No expenses yet.</td>
                </tr>
              ) : (
                recentExpenses.map((expense) => (
                  <tr key={expense.id}>
                    <td>{expense.title}</td>
                    <td>{expense.category}</td>
                    <td>RWF {expense.amount.toLocaleString()}</td>
                    <td>{expense.date}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </section>

        <section className="dashboard-section">
          <h2>Spending by Category</h2>

          <div className="category-breakdown">
            {Object.entries(spendingByCategory).map(([cat, amount]) => (
              <div key={cat} className="category-row">
                <span>{cat}</span>
                <strong>RWF {amount.toLocaleString()}</strong>
              </div>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}

export default Dashboard;
