import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import './Layout.css';

const navItems = [
  { path: '/dashboard', icon: '⬡', label: 'Dashboard' },
  { path: '/tasks', icon: '◈', label: 'Tasks' },
  { path: '/earn-extra', icon: '◆', label: 'Earn Extra' },
  { path: '/wallet', icon: '◎', label: 'Wallet' },
  { path: '/plans', icon: '▲', label: 'Plans' },
  { path: '/referrals', icon: '◉', label: 'Referrals' },
  { path: '/notifications', icon: '◌', label: 'Updates' },
  { path: '/contact', icon: '◍', label: 'Contact' },
];

export default function Layout({ children }) {
  const { user, logout, API } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchUnread();
  }, []);

  const fetchUnread = async () => {
    try {
      const res = await axios.get(`${API}/notifications`);
      const unread = res.data.filter(n => !n.read.includes(user?._id)).length;
      setUnreadCount(unread);
    } catch {}
  };

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="layout">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <span className="logo-icon">⬡</span>
          <span className="logo-text">EarnZone</span>
        </div>

        <div className="sidebar-user">
          <div className="user-avatar">{user?.username?.[0]?.toUpperCase()}</div>
          <div>
            <div className="user-name">{user?.username}</div>
            <div className="user-level">Level {user?.level}</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
              {item.path === '/notifications' && unreadCount > 0 && (
                <span className="nav-badge">{unreadCount}</span>
              )}
            </Link>
          ))}
          {user?.isAdmin && (
            <Link to="/admin" className={`nav-item ${location.pathname === '/admin' ? 'active' : ''}`} onClick={() => setSidebarOpen(false)}>
              <span className="nav-icon">⬟</span>
              <span className="nav-label">Admin</span>
            </Link>
          )}
        </nav>

        <div className="sidebar-bottom">
          <div className="balance-display">
            <div className="balance-label">Balance</div>
            <div className="balance-amount">${(user?.balance || 0).toFixed(2)}</div>
          </div>
          <button className="btn btn-outline btn-sm btn-full" onClick={handleLogout} style={{marginTop: 12}}>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

      {/* Main */}
      <main className="main-content">
        <header className="topbar">
          <button className="menu-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
            <span></span><span></span><span></span>
          </button>
          <div className="topbar-logo">
            <span className="logo-icon">⬡</span> EarnZone
          </div>
          <div className="topbar-right">
            <div className="topbar-balance">${(user?.balance || 0).toFixed(2)}</div>
          </div>
        </header>

        <div className="page-content">
          {children}
        </div>
      </main>
    </div>
  );
}
