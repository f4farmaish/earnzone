import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import './Tasks.css';

export default function Tasks() {
  const { user, API, refreshUser } = useAuth();
  const [taskStatus, setTaskStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchStatus(); }, []);

  const fetchStatus = async () => {
    try {
      const res = await axios.get(`${API}/tasks/status`);
      setTaskStatus(res.data);
    } catch {}
  };

  const completeTask = async () => {
    setLoading(true);
    try {
      const res = await axios.post(`${API}/tasks/complete`);
      toast.success(res.data.message);
      fetchStatus();
      refreshUser();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error');
    } finally {
      setLoading(false);
    }
  };

  const LEVEL_NAMES = { 1: 'Starter', 2: 'Basic', 3: 'Advanced', 4: 'Pro', 5: 'Elite' };

  return (
    <div className="tasks-page">
      <div className="page-header">
        <h2>Daily Tasks</h2>
        <span className="badge badge-gold">Level {user?.level} — {LEVEL_NAMES[user?.level]}</span>
      </div>

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
                ${taskStatus.taskEarning?.toFixed(2)}
              </div>
              <div className="task-stat-label">Per Task</div>
            </div>
          </div>
          <div className="progress-bar" style={{marginTop:20}}>
            <div className="progress-fill"
              style={{width:`${(taskStatus.tasksCompleted/taskStatus.tasksTotal)*100}%`}} />
          </div>
          <div className="task-remaining">
            {taskStatus.tasksTotal - taskStatus.tasksCompleted > 0
              ? `${taskStatus.tasksTotal - taskStatus.tasksCompleted} tasks remaining`
              : '✅ All tasks done for today!'}
          </div>
        </div>
      )}

      {/* CPX Research Survey Section */}
      <div className="card survey-section">
        <div className="survey-header">
          <h3>📋 Complete a Survey</h3>
          <p>Complete surveys below to earn your task reward. Each survey = 1 task completed.</p>
        </div>

        {/* AD/SURVEY PLACEHOLDER - CPX Research iframe goes here */}
<div id="cpx-research-container">
  <iframe
    src={`https://offers.cpx-research.com/index.php?app_id=31846&ext_user_id=${user?._id}`}
    style={{width:'100%', height:'500px', border:'none', borderRadius:'12px'}}
    title="Surveys"
  />
</div>
        <button
          className="btn btn-gold btn-full"
          onClick={completeTask}
          disabled={loading || (taskStatus && taskStatus.tasksCompleted >= taskStatus.tasksTotal)}
          style={{marginTop: 16}}
        >
          {loading ? 'Processing...' :
            taskStatus?.tasksCompleted >= taskStatus?.tasksTotal
              ? '✅ Daily Limit Reached'
              : `✓ Mark Task Complete (+$${taskStatus?.taskEarning?.toFixed(2)})`}
        </button>
      </div>

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
