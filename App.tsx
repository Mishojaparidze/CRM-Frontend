
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './hooks/useAuth';
import AuthPage from './components/AuthPage';
import DashboardPage from './components/DashboardPage';
import CustomerDetailView from './components/admin/CustomerDetailView';
import ResetPasswordPage from './components/ResetPasswordPage';
import SupportTicketDetailView from './components/admin/SupportTicketDetailView';
import ErrorBoundary from './components/ErrorBoundary';

// FIX: Moved the Main component definition before the App component.
// This resolves a potential TypeScript issue where the component was used before its declaration was fully processed.
const Main: React.FC = () => {
  const { isAuthenticated, isAdmin } = useAuth();
  
  return (
    <Routes>
      <Route path="/auth" element={!isAuthenticated ? <AuthPage /> : <Navigate to="/" />} />
      <Route path="/reset-password/:token" element={!isAuthenticated ? <ResetPasswordPage /> : <Navigate to="/" />} />
      <Route path="/" element={isAuthenticated ? <DashboardPage /> : <Navigate to="/auth" />} />
      <Route 
        path="/admin/user/:userId" 
        element={isAuthenticated && isAdmin ? <CustomerDetailView /> : <Navigate to="/" />} 
      />
      <Route 
        path="/admin/support/ticket/:ticketId" 
        element={isAuthenticated && isAdmin ? <SupportTicketDetailView /> : <Navigate to="/" />} 
      />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <HashRouter>
        <ErrorBoundary>
          <Main />
        </ErrorBoundary>
      </HashRouter>
    </AuthProvider>
  );
};

export default App;