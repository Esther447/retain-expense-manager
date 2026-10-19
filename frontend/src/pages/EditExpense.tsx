import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ExpenseForm from '../components/ExpenseForm';
import type { ExpenseFormValues } from '../components/ExpenseForm';
import type { Expense, Category, CategoriesResponse } from '../types/Expense';
import { apiGet, apiPut } from '../services/api';

function EditExpense() {
  const navigate = useNavigate();
  const location = useLocation();
  const expense = location.state as Expense | undefined;

  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!expense) {
      navigate('/expenses', { replace: true });
      return;
    }
    apiGet<CategoriesResponse>('/categories').then((data) =>
      setCategories(data.categories),
    );
  }, [expense, navigate]);

  if (!expense) return null;

  const initialValues: ExpenseFormValues = {
    title: expense.title,
    amount: String(expense.amount),
    categoryId: String(expense.category_id),
    date: expense.expense_date.slice(0, 10),
    paymentMethod: expense.payment_method,
    notes: expense.notes ?? '',
  };

  const handleSubmit = async (values: ExpenseFormValues) => {
    setError('');
    setLoading(true);
    try {
      await apiPut(`/expenses/${expense.id}`, {
        title: values.title,
        amount: Number(values.amount),
        category_id: Number(values.categoryId),
        expense_date: values.date,
        payment_method: values.paymentMethod,
        notes: values.notes || undefined,
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
          <ExpenseForm
            initialValues={initialValues}
            categories={categories}
            loading={loading}
            error={error}
            submitLabel="Save Changes"
            onSubmit={handleSubmit}
            onCancel={() => navigate('/expenses')}
          />
        </div>
      </main>
    </>
  );
}

export default EditExpense;
