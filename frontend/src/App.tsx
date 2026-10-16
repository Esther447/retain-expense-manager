import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';

import Expenses from './pages/Expenses';
import AddExpense from './pages/AddExpense';
import Profile from './pages/Profile';
import Dashboard from './pages/Dashboard';
import EditExpense from './pages/EditExpense';
import Budget from './pages/Budget';
import Login from './pages/Login';
import Signup from './pages/Signup';
import AdminDashboard from './pages/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <Routes>
          <Route
  path="/"
  element={
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  }
/>

          <Route
  path="/expenses"
  element={
    <ProtectedRoute>
      <Expenses />
    </ProtectedRoute>
  }
/>

          <Route
  path="/expenses/add"
  element={
    <ProtectedRoute>
      <AddExpense />
    </ProtectedRoute>
  }
/>

          <Route
  path="/expenses/edit"
  element={
    <ProtectedRoute>
      <EditExpense />
    </ProtectedRoute>
  }
/>

          <Route
  path="/profile"
  element={
    <ProtectedRoute>
      <Profile />
    </ProtectedRoute>
  }
/>

          <Route
  path="/budget"
  element={
    <ProtectedRoute>
      <Budget />
    </ProtectedRoute>
  }
/>

          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute adminOnly>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;