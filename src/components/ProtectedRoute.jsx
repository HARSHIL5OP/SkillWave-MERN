import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

export const ProtectedRoute = ({ children, allowedRoles = [], layout: Layout }) => {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
          <p className="text-gray-400 text-sm">Authenticating session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    const defaultRedirect =
      user.role === 'admin'
        ? '/admin'
        : user.role === 'teacher'
        ? '/teacher/dashboard'
        : '/learner/videos';
    return <Navigate to={defaultRedirect} replace />;
  }

  const content = children || <Outlet />;

  if (Layout) {
    return <Layout>{content}</Layout>;
  }

  return content;
};

export default ProtectedRoute;
