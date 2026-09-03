import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const location = useLocation();
  const token = localStorage.getItem('token');
  const role = (localStorage.getItem('role') || '').toLowerCase();

  if (!token) {
    return <Navigate to="/portal/login" state={{ from: location }} replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    return <Navigate to="/portal" replace />;
  }

  return children;
}
