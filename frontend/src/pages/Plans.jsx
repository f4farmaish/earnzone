import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import './Plans.css';

const PLANS = [
  { level: 1, name: 'Starter', price: 0, tasks: 5, daily: 1.00, monthly: 30, color: '#888', free: true },
  { level: 2, name: 'Basic', price: 20, tasks: 10, daily: 2.00, monthly: 60, color: '#00e5a0' },
  { level: 3, name: 'Advanced', price: 40, tasks: 15, daily: 4.00, monthly: 120, color: '#7c5cfc' },
  { level: 4, name: 'Pro', price: 80, tasks: 20, daily: 8.00, monthly: 240, color: '#f5c842' },
  { level: 5, name: 'Elite', price: 100, tasks: 25, daily: 14.00, monthly: 420, color: '#ff6b35' },
];

export default function Plans() {
  const { user, API, refreshUser } = useAuth();
  const [loading, setLoading] = useState(null);

  const upgrade = async (level) => {
    setLoading(level);
    try {
      const res = await axios.post(`${API}/user/upgrade-level`, { targetLevel: level });
      toast.success(res.data.message);
      refreshUser();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="plans-page">
      <div style={{marginBottom:28}}>
        <h2 style={{fontSize:24, fontWeight:700}}>Upgrade Your Plan 🚀</h2>
        <p style={{color:'var(--text2)', marginTop:6}}>Higher plans = more tasks = more daily earnings</p>
      </div>

      <div className="plans-grid">
        {PLANS.map(plan => {
          const isCurrent = user?.level === plan.level;
          const isOwned = user?.level >= plan.level;
          const canUpgrade = user?.level < plan.level;
          const canAfford = user?.balance >= plan.price;

          return (
            <div key={plan.level} className={`plan-card ${isCurrent ? 'current' : ''} ${plan.level === 5 ? 'elite' : ''}`}
              style={{'--plan-color': plan.color}}>
              {isCurrent && <div className="plan-badge">Current Plan</div>}
              {plan.level === 4 && !isCurrent && <div className="plan-badge popular">Most Popular</div>}

              <div className="plan-level" style={{color: plan.color}}>Level {plan.level}</div>
              <div className="plan-name">{plan.name}</div>

              <div className="plan-price">
                {plan.free ? <span className="price-free">FREE</span> : (
                  <><span className="price-dollar">$</span><span className="price-num">{plan.price}</span></>
                )}
              </div>

              <div className="plan-features">
                <div className="plan-feature">
                  <span>📋</span> {plan.tasks} tasks per day
                </div>
                <div className="plan-feature">
                  <span>💰</span> ${plan.daily.toFixed(2)} daily earning
                </div>
                <div className="plan-feature">
                  <span>📅</span> ~${plan.monthly}/month
                </div>
                {plan.level === 2 && (
                  <div className="plan-feature highlight">
                    <span>🎁</span> Free on 2nd withdrawal!
                  </div>
                )}
              </div>

              {isOwned ? (
                <button className="btn btn-outline btn-full" disabled>
                  {isCurrent ? '✓ Active Plan' : '✓ Owned'}
                </button>
              ) : (
                <button
                  className="btn btn-full"
                  style={{background: plan.color, color: '#000'}}
                  disabled={loading === plan.level || !canAfford}
                  onClick={() => upgrade(plan.level)}
                >
                  {loading === plan.level ? 'Upgrading...' :
                    !canAfford ? `Need $${(plan.price - user?.balance).toFixed(2)} more` :
                    `Upgrade for $${plan.price}`}
                </button>
              )}
            </div>
          );
        })}
      </div>

      <div className="card" style={{marginTop:8}}>
        <h3 style={{marginBottom:12}}>💡 How to get Level 2 FREE</h3>
        <div style={{display:'flex', flexDirection:'column', gap:10}}>
          <div style={{display:'flex', alignItems:'center', gap:12, padding:'12px 16px', background:'var(--bg3)', borderRadius:10}}>
            <span style={{fontSize:20}}>1️⃣</span>
            <span style={{fontSize:14, color:'var(--text2)'}}>Invite 20 friends using your referral link</span>
          </div>
          <div style={{display:'flex', alignItems:'center', gap:12, padding:'12px 16px', background:'var(--bg3)', borderRadius:10}}>
            <span style={{fontSize:20}}>2️⃣</span>
            <span style={{fontSize:14, color:'var(--text2)'}}>Each friend must stay active for at least 2 days</span>
          </div>
          <div style={{display:'flex', alignItems:'center', gap:12, padding:'12px 16px', background:'var(--bg3)', borderRadius:10}}>
            <span style={{fontSize:20}}>3️⃣</span>
            <span style={{fontSize:14, color:'var(--text2)'}}>OR make your 2nd withdrawal and Level 2 unlocks automatically!</span>
          </div>
        </div>
      </div>
    </div>
  );
}
