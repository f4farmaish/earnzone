import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

const EXTRA_TASKS = [
  { id: 1, title: 'Watch a Short Ad', description: 'Watch a 30-second advertisement to earn your reward', icon: '📺', reward: 0.40, link: 'https://gplinks.co/G5UZuv7' },
  { id: 2, title: 'Complete a Quick Survey', description: 'Answer a few questions and get paid instantly', icon: '📋', reward: 0.40, link: 'https://pubnotepad.com/aFGhAj' },
  { id: 3, title: 'Visit Sponsored Page', description: 'Visit our sponsor page for a few seconds', icon: '🌐', reward: 0.40, link: 'https://gplinks.co/SUBZNRb' },
];

export default function EarnExtra() {
  const { API, refreshUser } = useAuth();
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(null);
  const [linkClicked, setLinkClicked] = useState({});
  const adRef1 = useRef(null);
  const adRef2 = useRef(null);

  useEffect(() => { fetchStatus(); }, []);

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
      setStatus(res.data);
    } catch {}
  };

  const handleLinkClick = (taskId) => {
    setLinkClicked(prev => ({ ...prev, [taskId]: true }));
  };

  const completeExtra = async (taskId) => {
    if (!linkClicked[taskId]) {
      toast.error('Please click the link first!');
      return;
    }
    setLoading(taskId);
    try {
      const res = await axios.post(`${API}/tasks/complete-extra`);
      toast.success(res.data.message);
      fetchStatus();
      refreshUser();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div style={{maxWidth: 700}}>
      <div style={{marginBottom: 28}}>
        <h2 style={{fontSize:24, fontWeight:700}}>Earn Extra 💎</h2>
        <p style={{color:'var(--text2)', marginTop:6}}>3 bonus tasks available for ALL users — completely free!</p>
      </div>

      {/* AD 1 */}
      <div ref={adRef1} style={{marginBottom:20, minHeight:60, borderRadius:12, overflow:'hidden'}} />

      {status && (
        <div className="card" style={{marginBottom:24}}>
          <div style={{display:'flex', alignItems:'center', justifyContent:'space-between'}}>
            <div>
              <div style={{fontSize:13, color:'var(--text2)'}}>Extra Tasks Today</div>
              <div style={{fontFamily:'Syne', fontSize:28, fontWeight:800, color:'var(--green)', marginTop:4}}>
                {status.extraTasksCompleted}/{status.extraTasksTotal}
              </div>
            </div>
            <div style={{textAlign:'right'}}>
              <div style={{fontSize:13, color:'var(--text2)'}}>Earn per task</div>
              <div style={{fontFamily:'Syne', fontSize:28, fontWeight:800, color:'var(--gold)', marginTop:4}}>
                $0.40
              </div>
            </div>
          </div>
          <div className="progress-bar" style={{marginTop:16}}>
            <div className="progress-fill"
              style={{width:`${(status.extraTasksCompleted/status.extraTasksTotal)*100}%`, background:'linear-gradient(90deg, var(--green), var(--gold))'}} />
          </div>
        </div>
      )}

      <div style={{display:'flex', flexDirection:'column', gap:16}}>
        {EXTRA_TASKS.map((task, i) => {
          const completed = status && i < (status.extraTasksCompleted || 0);
          const isThisAvailable = status && i === (status.extraTasksCompleted || 0);
          const hasClickedLink = linkClicked[task.id];

          return (
            <div key={task.id} className="card" style={{
              border: isThisAvailable ? '1px solid var(--green)' : '1px solid var(--border)',
              opacity: completed ? 0.6 : 1
            }}>
              <div style={{display:'flex', alignItems:'center', gap:16}}>
                <div style={{
                  width:56, height:56, borderRadius:16,
                  background: completed ? 'rgba(0,229,160,0.1)' : 'rgba(245,200,66,0.1)',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  fontSize:26, flexShrink:0
                }}>
                  {completed ? '✅' : task.icon}
                </div>
                <div style={{flex:1}}>
                  <div style={{fontFamily:'Syne', fontWeight:700, fontSize:16}}>{task.title}</div>
                  <div style={{fontSize:13, color:'var(--text2)', marginTop:4}}>{task.description}</div>
                </div>
                <div style={{textAlign:'right', flexShrink:0}}>
                  <div style={{fontFamily:'Syne', fontWeight:800, fontSize:18, color:'var(--gold)'}}>
                    +${task.reward}
                  </div>
                  {!completed ? (
                    <button
                      className="btn btn-green btn-sm"
                      style={{marginTop:8}}
                      disabled={!isThisAvailable || loading === task.id || !hasClickedLink}
                      onClick={() => completeExtra(task.id)}
                      title={!hasClickedLink ? 'Click the link below first!' : ''}
                    >
                      {loading === task.id ? '...' : !hasClickedLink ? '🔒 Locked' : 'Claim'}
                    </button>
                  ) : (
                    <span className="badge badge-green" style={{marginTop:8, display:'block'}}>Done</span>
                  )}
                </div>
              </div>

              {/* SHRINKLINK */}
              {isThisAvailable && (
                <div style={{
                  marginTop:16, padding:'12px 16px',
                  background: hasClickedLink ? 'rgba(0,229,160,0.08)' : 'var(--bg3)',
                  borderRadius:10, fontSize:13, color:'var(--text2)',
                  borderLeft: hasClickedLink ? '3px solid var(--green)' : '3px solid var(--gold)'
                }}>
                  {hasClickedLink ? (
                    <p style={{color:'var(--green)', fontWeight:600}}>
                      ✅ Done! Now click Claim above to get your reward
                    </p>
                  ) : (
                    <>
                      <p style={{marginBottom:8, color:'var(--gold)', fontWeight:600}}>
                        ⚡ Step 1: Click the link below to unlock your reward:
                      </p>
                      <a
                        href={task.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-green btn-sm"
                        onClick={() => handleLinkClick(task.id)}
                      >
                        👉 Click Here to Continue
                      </a>
                    </>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* AD 2 */}
      <div ref={adRef2} style={{marginTop:20, minHeight:60, borderRadius:12, overflow:'hidden'}} />
    </div>
  );
}
