import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import AdminAppLayout from './modules/AdminAppLayout';

export default function AdminApp() {
  return (
    <Routes>
      <Route path="login" element={<Login />} />
      <Route path="*" element={<AdminAppLayout />} />
    </Routes>
  );
}
