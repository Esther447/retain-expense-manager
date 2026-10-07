import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';

import Expenses from './pages/Expenses';
import AddExpense from './pages/AddExpense';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <Routes>
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
  path="/profile"
  element={
    <ProtectedRoute>
      <Profile />
    </ProtectedRoute>
  }
/>

          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;