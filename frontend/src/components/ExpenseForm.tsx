import { useState } from 'react';
import type { FormEvent } from 'react';
import type { Category } from '../types/Expense';

export interface ExpenseFormValues {
  title: string;
  amount: string;
  categoryId: string;
  date: string;
  paymentMethod: string;
  notes: string;
}

interface ExpenseFormProps {
  initialValues?: Partial<ExpenseFormValues>;
  categories: Category[];
  loading: boolean;
  error: string;
  submitLabel: string;
  onSubmit: (values: ExpenseFormValues) => void;
  onCancel: () => void;
}

const defaultValues: ExpenseFormValues = {
  title: '',
  amount: '',
  categoryId: '',
  date: '',
  paymentMethod: '',
  notes: '',
};

function ExpenseForm({
  initialValues,
  categories,
  loading,
  error,
  submitLabel,
  onSubmit,
  onCancel,
}: ExpenseFormProps) {
  const [values, setValues] = useState<ExpenseFormValues>({
    ...defaultValues,
    ...initialValues,
  });

  const set = (field: keyof ExpenseFormValues) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setValues((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit(values);
  };

  return (
    <>
      {error && <p className="error-message">{error}</p>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Title</label>
          <input
            id="title"
            type="text"
            value={values.title}
            onChange={set('title')}
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
            value={values.amount}
            onChange={set('amount')}
            placeholder="Enter amount"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="category">Category</label>
          <select
            id="category"
            value={values.categoryId}
            onChange={set('categoryId')}
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
            value={values.date}
            onChange={set('date')}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="paymentMethod">Payment Method</label>
          <select
            id="paymentMethod"
            value={values.paymentMethod}
            onChange={set('paymentMethod')}
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
            value={values.notes}
            onChange={set('notes')}
            placeholder="Add any additional notes"
            rows={3}
          />
        </div>

        <div className="form-actions">
          <button type="button" className="cancel-button" onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" className="save-button" disabled={loading}>
            {loading ? 'Saving...' : submitLabel}
          </button>
        </div>
      </form>
    </>
  );
}

export default ExpenseForm;
