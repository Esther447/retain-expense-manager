import type { FormEvent } from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

function AddExpense() {
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    console.log({
      title,
      description,
      amount,
      category,
      date,
      paymentMethod,
      notes,
    });

    navigate('/expenses');
  };

  return (
    <>
      <Navbar />

      <main className="form-page">
        <div className="form-card">
          <h1>Add Expense</h1>
          <p>Record a new expense in your Retain account.</p>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="title">Title</label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="e.g. Lunch"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Describe this expense"
                rows={3}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="amount">Amount (RWF)</label>
              <input
                id="amount"
                type="number"
                min="0"
                step="1"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                placeholder="Enter amount"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="category">Category</label>
              <select
                id="category"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                required
              >
                <option value="">Select a category</option>
                <option value="food">Food</option>
                <option value="transport">Transport</option>
                <option value="education">Education</option>
                <option value="housing">Housing</option>
                <option value="health">Health</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="date">Date</label>
              <input
                id="date"
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="paymentMethod">Payment Method</label>
              <select
                id="paymentMethod"
                value={paymentMethod}
                onChange={(event) => setPaymentMethod(event.target.value)}
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
                onChange={(event) => setNotes(event.target.value)}
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

              <button type="submit" className="save-button">
                Save Expense
              </button>
            </div>
          </form>
        </div>
      </main>
    </>
  );
}

export default AddExpense;
