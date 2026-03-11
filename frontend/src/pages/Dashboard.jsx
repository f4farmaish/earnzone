import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import './Dashboard.css';

export default function Dashboard() {
  const { user, API, refreshUser } = useAuth();
  const [taskStatus, setTaskStatus] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    fetchTaskStatus();
    fetchTransactions();
    // Show referral popup after 2 seconds if not dismissed
    const dismissed = localStorage.getItem('referral_popup_dismissed');
    if (!dismissed) {
      setTimeout(() => setShowPopup(true), 2000);
    }
  }, []);

  const fetchTaskStatus = async () => {
    try {
      const res = await axios.get(`${API}/tasks/status`);
      setTaskStatus(res.data);
    } catch {}
  };

  const fetchTransactions = async () => {
    try {
      const res = await axios.get(`${API}/wallet/info`);
      setTransactions(res.data.transactions?.slice(0, 5) || []);
    } catch {}
  };

  const dismissPopup = () => {
    setShowPopup(false);
    localStorage.setItem('referral_popup_dismissed', 'true');
  };

  const copyReferral = () => {
    const link = `${window.location.origin}/register?ref=${user?.referralCode}`;
    navigator.clipboard.writeText(link);
    toast.success('Referral link copied!');
  };

  const LEVEL_CONFIG = {
    1: { dailyTasks: 5, dailyEarning: 1 },
    2: { dailyTasks: 10, dailyEarning: 2 },
    3: { dailyTasks: 15, dailyEarning: 4 },
    4: { dailyTasks: 20, dailyEarning: 8 },
    5: { dailyTasks: 25, dailyEarning: 14 },
  };

  const levelConf = LEVEL_CONFIG[user?.level] || LEVEL_CONFIG[1];

  return (
    <div className="dashboard">
      {/* Referral Popup */}
      {showPopup && (
        <div className="popup-overlay">
          <div className="popup-box">
            <div className="popup-icon">🎁</div>
            <h3>Get Level 2 FREE!</h3>
            <p>Invite <strong>20 valid members</strong> who stay active for at least <strong>2 days</strong> and unlock Level 2 absolutely free!</p>
            <div className="popup-ref">
              <span>{window.location.origin}/register?ref={user?.referralCode}</span>
            </div>
            <div style={{display:'flex', gap:12, marginTop:20}}>
              <button className="btn btn-gold btn-full" onClick={copyReferral}>Copy Link</button>
              <button className="btn btn-outline" onClick={dismissPopup}>Later</button>
            </div>
          </div>
        </div>
      )}

      {/* Welcome */}
      <div className="dash-header">
        <div>
          <h2>Welcome back, {user?.username}! 👋</h2>
          <p style={{color:'var(--text2)', marginTop:4}}>Keep earning every day</p>
        </div>
        <span className="badge badge-gold" style={{fontSize:13}}>Level {user?.level}</span>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{background:'rgba(245,200,66,0.1)', color:'var(--gold)'}}>💰</div>
          <div>
            <div className="stat-num">${(user?.balance || 0).toFixed(2)}</div>
            <div className="stat-label">Current Balance</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{background:'rgba(0,229,160,0.1)', color:'var(--green)'}}>📈</div>
          <div>
            <div className="stat-num">${(user?.totalEarned || 0).toFixed(2)}</div>
            <div className="stat-label">Total Earned</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{background:'rgba(124,92,252,0.1)', color:'var(--purple)'}}>📤</div>
          <div>
            <div className="stat-num">${(user?.totalWithdrawn || 0).toFixed(2)}</div>
            <div className="stat-label">Total Withdrawn</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{background:'rgba(0,229,160,0.1)', color:'var(--green)'}}>👥</div>
          <div>
            <div className="stat-num">{user?.referralCount || 0}</div>
            <div className="stat-label">Referrals</div>
          </div>
        </div>
      </div>

      {/* Task Progress */}
      {taskStatus && (
        <div className="card dash-tasks">
          <div className="dash-tasks-header">
            <h3>Today's Progress</h3>
            <Link to="/tasks" className="btn btn-gold btn-sm">Do Tasks →</Link>
          </div>
          <div className="task-progress-row">
            <div>
              <div style={{fontSize:13, color:'var(--text2)'}}>Daily Tasks</div>
              <div style={{fontSize:20, fontFamily:'Syne', fontWeight:700, color:'var(--gold)', marginTop:4}}>
                {taskStatus.tasksCompleted}/{taskStatus.tasksTotal}
              </div>
            </div>
            <div>
              <div style={{fontSize:13, color:'var(--text2)'}}>Earn per task</div>
              <div style={{fontSize:20, fontFamily:'Syne', fontWeight:700, color:'var(--green)', marginTop:4}}>
                ${taskStatus.taskEarning?.toFixed(2)}
              </div>
            </div>
            <div>
              <div style={{fontSize:13, color:'var(--text2)'}}>Daily max</div>
              <div style={{fontSize:20, fontFamily:'Syne', fontWeight:700, color:'var(--purple)', marginTop:4}}>
                ${levelConf.dailyEarning}
              </div>
            </div>
          </div>
          <div className="progress-bar" style={{marginTop:16}}>
            <div className="progress-fill" style={{width: `${(taskStatus.tasksCompleted/taskStatus.tasksTotal)*100}%`}} />
          </div>
          <div style={{fontSize:12, color:'var(--text3)', marginTop:8}}>
            {taskStatus.tasksTotal - taskStatus.tasksCompleted} tasks remaining today
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="quick-actions">
        <Link to="/tasks" className="quick-card">
          <div className="qc-icon">◈</div>
          <div className="qc-label">Daily Tasks</div>
        </Link>
        <Link to="/earn-extra" className="quick-card">
          <div className="qc-icon" style={{color:'var(--green)'}}>◆</div>
          <div className="qc-label">Earn Extra</div>
        </Link>
        <Link to="/wallet" className="quick-card">
          <div className="qc-icon" style={{color:'var(--purple)'}}>◎</div>
          <div className="qc-label">Withdraw</div>
        </Link>
        <Link to="/referrals" className="quick-card">
          <div className="qc-icon" style={{color:'var(--gold)'}}>◉</div>
          <div className="qc-label">Referrals</div>
        </Link>
      </div>

      {/* ADS PLACEHOLDER TOP */}
      <div className="ad-placeholder" id="ad-top">
        {/* Adsterra ad code will go here */}
      </div>

      {/* Recent Transactions */}
      {transactions.length > 0 && (
        <div className="card">
          <h3 style={{marginBottom:16}}>Recent Activity</h3>
          <div className="tx-list">
            {transactions.map(tx => (
              <div className="tx-item" key={tx._id}>
                <div className="tx-info">
                  <div className="tx-type">{tx.type.replace('_', ' ')}</div>
                  <div className="tx-date">{new Date(tx.createdAt).toLocaleDateString()}</div>
                </div>
                <div style={{display:'flex', alignItems:'center', gap:10}}>
                  <span className={`badge ${tx.status === 'completed' ? 'badge-green' : tx.status === 'rejected' ? 'badge-red' : 'badge-gold'}`}>
                    {tx.status}
                  </span>
                  <div className={`tx-amount ${tx.amount > 0 ? 'positive' : 'negative'}`}>
                    {tx.amount > 0 ? '+' : ''}${Math.abs(tx.amount).toFixed(2)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ADS PLACEHOLDER BOTTOM */}
      <div className="ad-placeholder" id="ad-bottom">
        {/* Adsterra ad code will go here */}
      </div>
    </div>
  );
}
