import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import Navbar from '../components/Navbar';
import type { Expense } from '../types/Expense';
import {
  setSearch,
  setCategory,
  setPaymentMethod,
  setSortBy,
} from '../redux/expenseFilterSlice';

function Expenses() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { search, category, paymentMethod, sortBy } = useAppSelector(
    (state) => state.expenseFilter,
  );

  const expenses: Expense[] = [
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

  const filteredExpenses = expenses
    .filter((expense) => {
      const searchMatches =
        expense.title.toLowerCase().includes(search.toLowerCase()) ||
        expense.description.toLowerCase().includes(search.toLowerCase());

      const categoryMatches =
        category === '' || expense.category === category;

      const paymentMethodMatches =
        paymentMethod === '' ||
        expense.paymentMethod === paymentMethod;

      return searchMatches && categoryMatches && paymentMethodMatches;
    })
    .sort((a, b) => {
      if (sortBy === 'date-asc') {
        return a.date.localeCompare(b.date);
      }

      if (sortBy === 'amount-desc') {
        return b.amount - a.amount;
      }

      if (sortBy === 'amount-asc') {
        return a.amount - b.amount;
      }

      return b.date.localeCompare(a.date);
    });

  return (
    <>
      <Navbar />

      <main className="expenses-page">
        <header className="page-header">
          <div>
            <h1>Expenses</h1>
            <p>View and manage your personal expenses.</p>
          </div>

          <button
            type="button"
            onClick={() => navigate('/expenses/add')}
          >
            + Add Expense
          </button>
        </header>

        <section className="expenses-section">
          <div className="expenses-toolbar">
            <input
              type="search"
              placeholder="Search expenses..."
              aria-label="Search expenses"
              value={search}
              onChange={(event) => dispatch(setSearch(event.target.value))}
            />

            <select
              value={category}
              onChange={(event) => dispatch(setCategory(event.target.value))}
            >
              <option value="">All Categories</option>
              <option value="food">Food</option>
              <option value="transport">Transport</option>
              <option value="education">Education</option>
              <option value="housing">Housing</option>
              <option value="health">Health</option>
              <option value="other">Other</option>
            </select>

            <select
              value={paymentMethod}
              onChange={(event) =>
                dispatch(setPaymentMethod(event.target.value))
              }
            >
              <option value="">All Payment Methods</option>
              <option value="cash">Cash</option>
              <option value="mobile-money">Mobile Money</option>
              <option value="card">Card</option>
              <option value="bank">Bank Transfer</option>
            </select>

            <select
              value={sortBy}
              onChange={(event) => dispatch(setSortBy(event.target.value))}
            >
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
                {filteredExpenses.length === 0 ? (
                  <tr>
                    <td colSpan={6}>No expenses found.</td>
                  </tr>
                ) : (
                  filteredExpenses.map((expense) => (
                    <tr key={expense.id}>
                      <td>{expense.title}</td>
                      <td>{expense.category}</td>
                      <td>RWF {expense.amount.toLocaleString()}</td>
                      <td>{expense.date}</td>
                      <td>{expense.paymentMethod}</td>
                      <td>
                        <button type="button">View</button>
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

export default Expenses;
