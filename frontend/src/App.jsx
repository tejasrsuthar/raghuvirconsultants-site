import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Header from './components/Header';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import ProtectedRoute from './components/ProtectedRoute';

// Public pages
import Home from './pages/Home';
import About from './pages/About';
import Services from './pages/Services';
import Contact from './pages/Contact';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import Smallcase from './pages/Smallcase';
import NewsAnnouncements from './pages/NewsAnnouncements';

// Auth pages
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import NotFound from './pages/NotFound';

// Investor portal
import InvestorDashboard from './investor/InvestorDashboard';
import InvestorSettings from './investor/InvestorSettings';
import SubscriptionPage from './investor/SubscriptionPage';
import InvestorResearchReports from './pages/InvestorResearchReports';
import InvestorModelPortfolio from './pages/InvestorModelPortfolio';
import InvestorSupport from './pages/InvestorSupport';

// Admin portal (Lazy loaded)
const AdminApp = React.lazy(() => import('./admin/AdminApp'));

export default function App() {
  return (
    <Router>
      <ScrollToTop />
      <Toaster 
        position="bottom-center"
        toastOptions={{
          duration: 3500,
          style: {
            background: '#18181B',
            color: '#FFFFFF',
            borderRadius: '14px',
            fontSize: '12px',
            fontWeight: '600',
            padding: '12px 18px',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)'
          }
        }}
      />
      <div className="flex flex-col min-h-screen">
        <Routes>
          <Route path="/portal/admin/*" element={null} />
          <Route path="*" element={<Header />} />
        </Routes>
        <main className="flex-grow">
          <Routes>
            {/* Public */}
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/services" element={<Services />} />
            <Route path="/smallcase" element={<Smallcase />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/news" element={<NewsAnnouncements />} />

            {/* Auth */}
            <Route path="/portal/login" element={<Login />} />
            <Route path="/portal/signup" element={<Signup />} />
            <Route path="/portal/forgot-password" element={<ForgotPassword />} />
            <Route path="/portal/reset-password" element={<ResetPassword />} />

            {/* Investor Portal */}
            <Route path="/portal" element={<ProtectedRoute><InvestorDashboard /></ProtectedRoute>} />
            <Route path="/portal/services/reports" element={<ProtectedRoute><InvestorResearchReports /></ProtectedRoute>} />
            <Route path="/portal/services/portfolio" element={<ProtectedRoute><InvestorModelPortfolio /></ProtectedRoute>} />
            <Route path="/portal/reports" element={<ProtectedRoute><InvestorResearchReports /></ProtectedRoute>} />
            <Route path="/portal/portfolio" element={<ProtectedRoute><InvestorModelPortfolio /></ProtectedRoute>} />
            <Route path="/portal/billing" element={<ProtectedRoute><SubscriptionPage /></ProtectedRoute>} />
            <Route path="/portal/support" element={<ProtectedRoute><InvestorSupport /></ProtectedRoute>} />
            <Route path="/portal/settings" element={<ProtectedRoute><InvestorSettings /></ProtectedRoute>} />

            {/* Admin Portal */}
            <Route 
              path="/portal/admin/*" 
              element={
                <ProtectedRoute allowedRoles={['super_admin', 'admin']}>
                  <React.Suspense fallback={<div className="flex justify-center items-center h-screen">Loading Admin...</div>}>
                    <AdminApp />
                  </React.Suspense>
                </ProtectedRoute>
              } 
            />

            {/* 404 Fallback */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Routes>
          <Route path="/portal/admin/*" element={null} />
          <Route path="*" element={<Footer />} />
        </Routes>
      </div>
    </Router>
  );
}
