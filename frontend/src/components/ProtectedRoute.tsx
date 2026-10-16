import { Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
  adminOnly?: boolean;
}

function ProtectedRoute({ children, adminOnly = false }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && user?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoute;