import type { FormEvent } from 'react';
import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import type { Expense, Category } from '../types/Expense';
import { apiGet, apiPut } from '../services/api';

interface CategoriesResponse {
  categories: Category[];
}

function EditExpense() {
  const navigate = useNavigate();
  const location = useLocation();
  const expense = location.state as Expense | undefined;

  const [title, setTitle] = useState(expense?.title ?? '');
  const [amount, setAmount] = useState(String(expense?.amount ?? ''));
  const [categoryId, setCategoryId] = useState(String(expense?.category_id ?? ''));
  const [date, setDate] = useState(expense?.expense_date?.slice(0, 10) ?? '');
  const [paymentMethod, setPaymentMethod] = useState(expense?.payment_method ?? '');
  const [notes, setNotes] = useState(expense?.notes ?? '');
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!expense) {
      navigate('/expenses');
      return;
    }
    apiGet<CategoriesResponse>('/categories').then((data) =>
      setCategories(data.categories),
    );
  }, []);

  if (!expense) return null;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      await apiPut(`/expenses/${expense.id}`, {
        title,
        amount: Number(amount),
        category_id: Number(categoryId),
        expense_date: date,
        payment_method: paymentMethod,
        notes: notes || undefined,
      });
      navigate('/expenses');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update expense');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />

      <main className="form-page">
        <div className="form-card">
          <h1>Edit Expense</h1>
          <p>Update the details of this expense.</p>

          {error && <p className="error-message">{error}</p>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="title">Title</label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Lunch"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="amount">Amount (RWF)</label>
              <input
                id="amount"
                type="number"
                min="1"
                step="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="category">Category</label>
              <select
                id="category"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                required
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={String(cat.id)}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="date">Date</label>
              <input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="paymentMethod">Payment Method</label>
              <select
                id="paymentMethod"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                required
              >
                <option value="">Select a payment method</option>
                <option value="cash">Cash</option>
                <option value="mobile-money">Mobile Money</option>
                <option value="card">Card</option>
                <option value="bank">Bank Transfer</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="notes">Notes (Optional)</label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any additional notes"
                rows={3}
              />
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="cancel-button"
                onClick={() => navigate('/expenses')}
              >
                Cancel
              </button>
              <button type="submit" className="save-button" disabled={loading}>
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </>
  );
}

export default EditExpense;
