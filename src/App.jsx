import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';

import DashboardLayout from './components/layouts/DashboardLayout.jsx';

// Public & Shared Pages
import LandingPage from './pages/LandingPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';

// Landlord Pages
import LandlordDashboard from './pages/landlord/LandlordDashboard.jsx';
import PropertiesPage from './pages/landlord/PropertiesPage.jsx';
import PropertyDetailPage from './pages/landlord/PropertyDetailPage.jsx';
import RoomsPage from './pages/landlord/RoomsPage.jsx';
import TenantManagementPage from './pages/landlord/TenantManagementPage.jsx';
import RentManagementPage from './pages/landlord/RentManagementPage.jsx';
import LandlordPaymentsPage from './pages/landlord/LandlordPaymentsPage.jsx';
import LandlordComplaintsPage from './pages/landlord/LandlordComplaintsPage.jsx';

// Tenant Pages
import TenantDashboard from './pages/tenant/TenantDashboard.jsx';
import TenantRentPaymentsPage from './pages/tenant/TenantRentPaymentsPage.jsx';
import TenantComplaintsPage from './pages/tenant/TenantComplaintsPage.jsx';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard.jsx';
import AdminUsersPage from './pages/admin/AdminUsersPage.jsx';
import AdminPropertiesPage from './pages/admin/AdminPropertiesPage.jsx';
import AdminComplaintsPage from './pages/admin/AdminComplaintsPage.jsx';

function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] dark:bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-7 h-7 border-2 border-teal-700 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-medium text-slate-500">Loading RentWise...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    if (user.role === 'admin') return <Navigate to="/admin" replace />;
    if (user.role === 'landlord') return <Navigate to="/landlord" replace />;
    return <Navigate to="/tenant" replace />;
  }

  return children;
}

export default function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Profile */}
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <DashboardLayout breadcrumbs={[{ name: 'Profile', path: '/profile' }]} />
          </ProtectedRoute>
        }
      >
        <Route index element={<ProfilePage />} />
      </Route>

      {/* Landlord Portal */}
      <Route
        path="/landlord"
        element={
          <ProtectedRoute allowedRoles={['landlord', 'admin']}>
            <DashboardLayout breadcrumbs={[{ name: 'Landlord', path: '/landlord' }]} />
          </ProtectedRoute>
        }
      >
        <Route index element={<LandlordDashboard />} />
        <Route path="properties" element={<PropertiesPage />} />
        <Route path="properties/:id" element={<PropertyDetailPage />} />
        <Route path="rooms" element={<RoomsPage />} />
        <Route path="tenants" element={<TenantManagementPage />} />
        <Route path="rent" element={<RentManagementPage />} />
        <Route path="payments" element={<LandlordPaymentsPage />} />
        <Route path="complaints" element={<LandlordComplaintsPage />} />
      </Route>

      {/* Tenant Portal */}
      <Route
        path="/tenant"
        element={
          <ProtectedRoute allowedRoles={['tenant', 'admin']}>
            <DashboardLayout breadcrumbs={[{ name: 'Tenant', path: '/tenant' }]} />
          </ProtectedRoute>
        }
      >
        <Route index element={<TenantDashboard />} />
        <Route path="payments" element={<TenantRentPaymentsPage />} />
        <Route path="complaints" element={<TenantComplaintsPage />} />
      </Route>

      {/* Admin Portal */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <DashboardLayout breadcrumbs={[{ name: 'Admin', path: '/admin' }]} />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<AdminUsersPage />} />
        <Route path="properties" element={<AdminPropertiesPage />} />
        <Route path="complaints" element={<AdminComplaintsPage />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
