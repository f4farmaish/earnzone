import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Tasks from './pages/Tasks';
import Wallet from './pages/Wallet';
import Plans from './pages/Plans';
import Referrals from './pages/Referrals';
import EarnExtra from './pages/EarnExtra';
import Contact from './pages/Contact';
import Notifications from './pages/Notifications';
import AdminPanel from './pages/AdminPanel';
import Layout from './components/Layout';
import './App.css';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-screen"><div className="spinner"></div></div>;
  return user ? children : <Navigate to="/login" />;
};

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-screen"><div className="spinner"></div></div>;
  return user?.isAdmin ? children : <Navigate to="/dashboard" />;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-screen"><div className="spinner"></div></div>;
  return !user ? children : <Navigate to="/dashboard" />;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" />} />
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
      <Route path="/dashboard" element={<PrivateRoute><Layout><Dashboard /></Layout></PrivateRoute>} />
      <Route path="/tasks" element={<PrivateRoute><Layout><Tasks /></Layout></PrivateRoute>} />
      <Route path="/wallet" element={<PrivateRoute><Layout><Wallet /></Layout></PrivateRoute>} />
      <Route path="/plans" element={<PrivateRoute><Layout><Plans /></Layout></PrivateRoute>} />
      <Route path="/referrals" element={<PrivateRoute><Layout><Referrals /></Layout></PrivateRoute>} />
      <Route path="/earn-extra" element={<PrivateRoute><Layout><EarnExtra /></Layout></PrivateRoute>} />
      <Route path="/contact" element={<PrivateRoute><Layout><Contact /></Layout></PrivateRoute>} />
      <Route path="/notifications" element={<PrivateRoute><Layout><Notifications /></Layout></PrivateRoute>} />
      <Route path="/admin" element={<AdminRoute><AdminPanel /></AdminRoute>} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
        <ToastContainer position="top-right" autoClose={3000} theme="dark" />
      </Router>
    </AuthProvider>
  );
}
