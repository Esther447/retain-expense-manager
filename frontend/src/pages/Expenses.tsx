import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

function Expenses() {
  const navigate = useNavigate();
  return (
    <>
      <Navbar />

      <main className="expenses-page">
        <header className="page-header">
          <div>
            <h1>Expenses</h1>
            <p>View and manage your personal expenses.</p>
          </div>

          <button type="button" onClick={() => navigate('/expenses/add')}>
            + Add Expense
          </button>
        </header>

        <section className="expenses-section">
          <div className="expenses-toolbar">
            <input
              type="search"
              placeholder="Search expenses..."
              aria-label="Search expenses"
            />

            <select defaultValue="">
              <option value="">All Categories</option>
              <option value="food">Food</option>
              <option value="transport">Transport</option>
              <option value="education">Education</option>
              <option value="housing">Housing</option>
              <option value="other">Other</option>
            </select>

            <select defaultValue="">
              <option value="">All Payment Methods</option>
              <option value="cash">Cash</option>
              <option value="mobile-money">Mobile Money</option>
              <option value="card">Card</option>
              <option value="bank">Bank Transfer</option>
            </select>

            <select defaultValue="date-desc">
              <option value="date-desc">Newest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="amount-desc">Highest Amount</option>
              <option value="amount-asc">Lowest Amount</option>
            </select>
          </div>

          <div className="expenses-table-wrapper">
            <table className="expenses-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Amount</th>
                  <th>Date</th>
                  <th>Payment Method</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                <tr>
                  <td colSpan={6}>No expenses yet.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </>
  );
}

export default Expenses;