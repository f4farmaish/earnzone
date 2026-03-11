import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './Tasks.css';

export default function Tasks() {
  const { user, API, refreshUser } = useAuth();
  const [taskStatus, setTaskStatus] = useState(null);
  const adRef1 = useRef(null);
  const adRef2 = useRef(null);

  useEffect(() => { 
    fetchStatus(); 
    // Refresh every 30 seconds to catch postback updates
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  // Load ads
  useEffect(() => {
    [adRef1, adRef2].forEach(ref => {
      if (ref.current && !ref.current.querySelector('script')) {
        const s = document.createElement('script');
        s.src = 'https://pl28894695.effectivegatecpm.com/9a/c1/fa/9ac1faacb32a3fa971ad9e4ac7331291.js';
        s.async = true;
        ref.current.appendChild(s);
      }
    });
  }, []);

  const fetchStatus = async () => {
    try {
      const res = await axios.get(`${API}/tasks/status`);
      setTaskStatus(res.data);
    } catch {}
  };

  const LEVEL_NAMES = { 1: 'Starter', 2: 'Basic', 3: 'Advanced', 4: 'Pro', 5: 'Elite' };

  return (
    <div className="tasks-page">
      <div className="page-header">
        <h2>Daily Tasks</h2>
        <span className="badge badge-gold">Level {user?.level} — {LEVEL_NAMES[user?.level]}</span>
      </div>

      {/* AD TOP */}
      <div ref={adRef1} style={{minHeight:60, borderRadius:12, overflow:'hidden', marginBottom:8}} />

      {taskStatus && (
        <div className="task-overview card">
          <div className="task-stats-row">
            <div className="task-stat">
              <div className="task-stat-num">{taskStatus.tasksCompleted}</div>
              <div className="task-stat-label">Completed</div>
            </div>
            <div className="task-divider" />
            <div className="task-stat">
              <div className="task-stat-num">{taskStatus.tasksTotal}</div>
              <div className="task-stat-label">Daily Limit</div>
            </div>
            <div className="task-divider" />
            <div className="task-stat">
              <div className="task-stat-num" style={{color:'var(--green)'}}>
                Auto
              </div>
              <div className="task-stat-label">Per Survey</div>
            </div>
          </div>
          <div className="progress-bar" style={{marginTop:20}}>
            <div className="progress-fill"
              style={{width:`${(taskStatus.tasksCompleted/taskStatus.tasksTotal)*100}%`}} />
          </div>
          <div className="task-remaining">
            {taskStatus.tasksTotal - taskStatus.tasksCompleted > 0
              ? `${taskStatus.tasksTotal - taskStatus.tasksCompleted} surveys remaining today`
              : '✅ All tasks done for today!'}
          </div>
        </div>
      )}

      {/* CPX Research Survey Section */}
      <div className="card survey-section">
        <div className="survey-header">
          <h3>📋 Complete a Survey</h3>
          <p>Complete a survey below — your balance updates <strong>automatically</strong> after completion!</p>
          <div style={{
            marginTop:10, padding:'10px 14px',
            background:'rgba(0,229,160,0.08)',
            border:'1px solid rgba(0,229,160,0.2)',
            borderRadius:10, fontSize:13, color:'var(--green)'
          }}>
            💡 No need to click anything — just complete the survey and your balance updates!
          </div>
        </div>

        <div id="cpx-research-container">
          {taskStatus?.tasksCompleted >= taskStatus?.tasksTotal ? (
            <div style={{
              textAlign:'center', padding:'60px 20px',
              background:'var(--bg3)', borderRadius:12
            }}>
              <div style={{fontSize:48, marginBottom:16}}>✅</div>
              <h3 style={{marginBottom:8}}>All Done for Today!</h3>
              <p style={{color:'var(--text2)'}}>Come back tomorrow for more surveys</p>
            </div>
          ) : (
            <iframe
              src={`https://offers.cpx-research.com/index.php?app_id=31846&ext_user_id=${user?._id}`}
              style={{width:'100%', height:'500px', border:'none', borderRadius:'12px'}}
              title="Surveys"
            />
          )}
        </div>
      </div>

      {/* AD BOTTOM */}
      <div ref={adRef2} style={{minHeight:60, borderRadius:12, overflow:'hidden'}} />

      {/* Level info */}
      <div className="card">
        <h3 style={{marginBottom:16}}>Level Benefits</h3>
        <div className="level-benefits">
          {[1,2,3,4,5].map(lvl => {
            const config = {
              1:{tasks:5,earning:1,price:'Free'},
              2:{tasks:10,earning:2,price:'$20'},
              3:{tasks:15,earning:4,price:'$40'},
              4:{tasks:20,earning:8,price:'$80'},
              5:{tasks:25,earning:14,price:'$100'}
            }[lvl];
            return (
              <div key={lvl} className={`level-row ${user?.level === lvl ? 'current' : ''} ${user?.level > lvl ? 'done' : ''}`}>
                <div className="level-badge">L{lvl}</div>
                <div className="level-info">
                  <div className="level-name">{['Starter','Basic','Advanced','Pro','Elite'][lvl-1]}</div>
                  <div className="level-details">{config.tasks} tasks/day · ${config.earning}/day</div>
                </div>
                <div className="level-price">{config.price}</div>
                {user?.level === lvl && <span className="badge badge-gold">Current</span>}
                {user?.level > lvl && <span className="badge badge-green">✓</span>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
