import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ExpenseForm from '../components/ExpenseForm';
import type { ExpenseFormValues } from '../components/ExpenseForm';
import { apiGet, apiPost } from '../services/api';
import type { Category } from '../types/Expense';

interface CategoriesResponse {
  categories: Category[];
}

function AddExpense() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    apiGet<CategoriesResponse>('/categories').then((data) =>
      setCategories(data.categories),
    );
  }, []);

  const handleSubmit = async (values: ExpenseFormValues) => {
    setError('');
    setLoading(true);
    try {
      await apiPost('/expenses', {
        title: values.title,
        amount: Number(values.amount),
        category_id: Number(values.categoryId),
        expense_date: values.date,
        payment_method: values.paymentMethod,
        notes: values.notes || undefined,
      });
      navigate('/expenses');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save expense');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="form-page">
        <div className="form-card">
          <h1>Add Expense</h1>
          <p>Record a new expense in your Retain account.</p>
          <ExpenseForm
            categories={categories}
            loading={loading}
            error={error}
            submitLabel="Save Expense"
            onSubmit={handleSubmit}
            onCancel={() => navigate('/expenses')}
          />
        </div>
      </main>
    </>
  );
}

export default AddExpense;
