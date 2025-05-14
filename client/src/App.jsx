import { Route, Routes, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Spinner from './components/Spinner';
import React, { Suspense, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';

// Lazy-loaded pages for better performance
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const Login = React.lazy(() => import('./pages/Login'));
const Users = React.lazy(() => import('./pages/Users'));
const Settings = React.lazy(() => import('./pages/Settings'));
const Orders = React.lazy(() => import('./pages/Orders'));
const Profile = React.lazy(() => import('./pages/Profile'));
const CustomerDetail = React.lazy(() => import('./pages/CustomerDetail'));
const CampaignCreation = React.lazy(() => import('./pages/CampaignCreate'));
const CampaignHistory = React.lazy(() => import('./pages/CampaignHistory'));
const NotFound = React.lazy(() => import('./pages/NotFound'));
const LandingPage = React.lazy(() => import('./pages/LandingPage'));

function App() {
  const { loading, isAuthenticated, isAdmin } = useAuth();
  const location = useLocation();

  // Track page views
  useEffect(() => {
    const knownRoutes = [
      '/',
      '/login',
      '/dashboard',
      '/profile',
      '/settings',
      '/users',
      '/orders',
      '/customers/:id',
      '/campaigns/new',
      '/campaigns/history'
    ];

    const isKnownRoute = knownRoutes.some(route => 
      new RegExp(`^${route.replace(':id', '[^/]+')}$`).test(location.pathname)
    );

    if (!isKnownRoute) {
      console.warn(`Undefined route accessed: ${location.pathname}`);
    }
  }, [location]);

  const ProtectedRoute = ({ children, adminOnly = false, requireAuth = true }) => {
    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <Spinner size="lg" />
        </div>
      );
    }

    if (requireAuth && !isAuthenticated) {
      return <Navigate to="/login" replace state={{ from: location }} />;
    }

    if (adminOnly && (!isAdmin || !isAuthenticated)) {
      return <Navigate to="/dashboard" replace />;
    }

    return children;
  };

  const PublicRoute = ({ children }) => {
    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <Spinner size="lg" />
        </div>
      );
    }

    if (isAuthenticated) {
      return <Navigate to="/dashboard" replace />;
    }

    return children;
  };

  return (
    <>
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 5000,
          style: {
            background: '#1f2937',
            color: '#f3f4f6',
            border: '1px solid #374151'
          }
        }}
      />
      
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-screen">
          <Spinner size="lg" />
        </div>
      }>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<LandingPage />} />
          
          <Route path="/login" element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } />

          {/* Protected routes */}
          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/settings" element={<Settings />} />
            
            {/* Admin-only routes */}
            <Route path="/users" element={
              <ProtectedRoute adminOnly>
                <Users />
              </ProtectedRoute>
            } />
            
            <Route path="/orders" element={
              <ProtectedRoute adminOnly>
                <Orders />
              </ProtectedRoute>
            } />
            
            <Route path="/customers/:id" element={
              <ProtectedRoute adminOnly>
                <CustomerDetail />
              </ProtectedRoute>
            } />
            
            <Route path="/campaigns/new" element={
              <ProtectedRoute adminOnly>
                <CampaignCreation />
              </ProtectedRoute>
            } />
            
            <Route path="/campaigns/history" element={
              <ProtectedRoute adminOnly>
                <CampaignHistory />
              </ProtectedRoute>
            } />
          </Route>

          {/* 404 handler */}
          <Route path="*" element={
            <NotFound />
            } />
        </Routes>
      </Suspense>
    </>
  );
}

export default App;