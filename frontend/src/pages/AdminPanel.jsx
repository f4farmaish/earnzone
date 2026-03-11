import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

export default function AdminPanel() {
  const { user, API, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('stats');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [chatMsgs, setChatMsgs] = useState([]);
  const [replyInput, setReplyInput] = useState('');
  const [notifForm, setNotifForm] = useState({ title: '', content: '', userId: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (tab === 'stats') fetchStats();
    if (tab === 'users') fetchUsers();
    if (tab === 'messages') fetchConversations();
  }, [tab]);

  const fetchStats = async () => {
    try { const r = await axios.get(`${API}/admin/stats`); setStats(r.data); } catch {}
  };
  const fetchUsers = async () => {
    try { const r = await axios.get(`${API}/admin/users`); setUsers(r.data); } catch {}
  };
  const fetchConversations = async () => {
    try { const r = await axios.get(`${API}/chat/admin/conversations`); setConversations(r.data); } catch {}
  };

  const openChat = async (userId) => {
    setSelectedUser(userId);
    try { const r = await axios.get(`${API}/chat/admin/messages/${userId}`); setChatMsgs(r.data); } catch {}
  };

  const sendReply = async () => {
    if (!replyInput.trim()) return;
    try {
      await axios.post(`${API}/chat/admin/reply`, { userId: selectedUser, content: replyInput });
      setReplyInput('');
      openChat(selectedUser);
    } catch { toast.error('Failed to send'); }
  };

  const toggleBlock = async (id) => {
    try {
      const r = await axios.put(`${API}/admin/users/${id}/toggle-block`);
      toast.success(r.data.message);
      fetchUsers();
    } catch { toast.error('Error'); }
  };

  const handleTransaction = async (id, status) => {
    try {
      await axios.put(`${API}/admin/transactions/${id}`, { status });
      toast.success(`Transaction ${status}`);
      fetchStats();
    } catch { toast.error('Error'); }
  };

  const sendNotif = async (broadcast) => {
    setLoading(true);
    try {
      if (broadcast) {
        await axios.post(`${API}/notifications/admin/broadcast`, { title: notifForm.title, content: notifForm.content });
        toast.success('Broadcast sent to all users!');
      } else {
        await axios.post(`${API}/notifications/admin/send`, { title: notifForm.title, content: notifForm.content, userId: notifForm.userId });
        toast.success('Notification sent!');
      }
      setNotifForm({ title: '', content: '', userId: '' });
    } catch { toast.error('Error'); } finally { setLoading(false); }
  };

  const TABS = ['stats', 'users', 'messages', 'notifications'];

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <div className="admin-logo">⬟ EarnZone Admin</div>
        <div style={{display:'flex', gap:10, alignItems:'center'}}>
          <span style={{fontSize:13, color:'var(--text2)'}}>Hello, {user?.username}</span>
          <button className="btn btn-outline btn-sm" onClick={() => navigate('/dashboard')}>User View</button>
          <button className="btn btn-danger btn-sm" onClick={() => { logout(); navigate('/login'); }}>Logout</button>
        </div>
      </div>

      <div className="admin-tabs">
        {TABS.map(t => (
          <button key={t} className={`tab-btn ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      <div className="admin-content">
        {/* Stats */}
        {tab === 'stats' && stats && (
          <div>
            <div className="admin-stats-grid">
              {[
                { label: 'Total Users', val: stats.totalUsers, color: 'var(--gold)' },
                { label: 'Active Users', val: stats.activeUsers, color: 'var(--green)' },
                { label: 'New Today', val: stats.newToday, color: 'var(--purple)' },
                { label: 'Total Withdrawn', val: `$${(stats.totalWithdrawn||0).toFixed(2)}`, color: 'var(--gold)' },
              ].map(s => (
                <div key={s.label} className="admin-stat-card">
                  <div style={{fontFamily:'Syne', fontSize:32, fontWeight:800, color:s.color}}>{s.val}</div>
                  <div style={{fontSize:13, color:'var(--text2)', marginTop:4}}>{s.label}</div>
                </div>
              ))}
            </div>

            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:20, marginTop:20}}>
              <div className="card">
                <h3 style={{marginBottom:16}}>Pending Withdrawals ({stats.pendingWithdrawals?.length})</h3>
                {stats.pendingWithdrawals?.length === 0 && <div style={{color:'var(--text2)', fontSize:13}}>No pending withdrawals</div>}
                {stats.pendingWithdrawals?.map(tx => (
                  <div key={tx._id} style={{padding:'12px', background:'var(--bg3)', borderRadius:10, marginBottom:8}}>
                    <div style={{fontSize:13, fontWeight:600}}>{tx.userId?.username} — ${Math.abs(tx.amount).toFixed(2)}</div>
                    <div style={{fontSize:11, color:'var(--text2)', margin:'4px 0'}}>{tx.bitcoinAddress}</div>
                    <div style={{display:'flex', gap:8, marginTop:8}}>
                      <button className="btn btn-green btn-sm" onClick={() => handleTransaction(tx._id, 'completed')}>Approve</button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleTransaction(tx._id, 'rejected')}>Reject</button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="card">
                <h3 style={{marginBottom:16}}>Pending Deposits ({stats.pendingDeposits?.length})</h3>
                {stats.pendingDeposits?.length === 0 && <div style={{color:'var(--text2)', fontSize:13}}>No pending deposits</div>}
                {stats.pendingDeposits?.map(tx => (
                  <div key={tx._id} style={{padding:'12px', background:'var(--bg3)', borderRadius:10, marginBottom:8}}>
                    <div style={{fontSize:13, fontWeight:600}}>{tx.userId?.username} — ${tx.amount.toFixed(2)}</div>
                    <div style={{fontSize:11, color:'var(--text2)', margin:'4px 0', wordBreak:'break-all'}}>{tx.txHash}</div>
                    <div style={{display:'flex', gap:8, marginTop:8}}>
                      <button className="btn btn-green btn-sm" onClick={() => handleTransaction(tx._id, 'completed')}>Verify & Credit</button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleTransaction(tx._id, 'rejected')}>Reject</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Users */}
        {tab === 'users' && (
          <div className="card">
            <h3 style={{marginBottom:16}}>All Users ({users.length})</h3>
            <div style={{overflowX:'auto'}}>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>User</th><th>Level</th><th>Balance</th><th>Earned</th><th>Refs</th><th>Joined</th><th>Status</th><th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u._id}>
                      <td>
                        <div style={{fontWeight:600}}>{u.username}</div>
                        <div style={{fontSize:11, color:'var(--text2)'}}>{u.email}</div>
                      </td>
                      <td><span className="badge badge-gold">L{u.level}</span></td>
                      <td style={{color:'var(--gold)', fontWeight:700}}>${u.balance?.toFixed(2)}</td>
                      <td style={{color:'var(--green)'}}>${u.totalEarned?.toFixed(2)}</td>
                      <td>{u.referralCount}</td>
                      <td style={{fontSize:11, color:'var(--text2)'}}>{new Date(u.createdAt).toLocaleDateString()}</td>
                      <td><span className={`badge ${u.isActive ? 'badge-green' : 'badge-red'}`}>{u.isActive ? 'Active' : 'Blocked'}</span></td>
                      <td>
                        <button className={`btn btn-sm ${u.isActive ? 'btn-danger' : 'btn-green'}`} onClick={() => toggleBlock(u._id)}>
                          {u.isActive ? 'Block' : 'Unblock'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Messages */}
        {tab === 'messages' && (
          <div style={{display:'grid', gridTemplateColumns:'320px 1fr', gap:20, height:'600px'}}>
            <div className="card" style={{overflow:'auto', padding:12}}>
              <h3 style={{marginBottom:12, padding:'0 4px'}}>Conversations</h3>
              {conversations.map(c => (
                <div key={c.userId} onClick={() => openChat(c.userId)}
                  style={{padding:'12px', borderRadius:10, cursor:'pointer', marginBottom:6,
                    background: selectedUser === c.userId ? 'rgba(245,200,66,0.1)' : 'var(--bg3)',
                    border: selectedUser === c.userId ? '1px solid rgba(245,200,66,0.3)' : '1px solid transparent'}}>
                  <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                    <div style={{fontWeight:600, fontSize:14}}>{c.user?.username}</div>
                    {c.unreadCount > 0 && <span className="badge badge-gold">{c.unreadCount}</span>}
                  </div>
                  <div style={{fontSize:12, color:'var(--text2)', marginTop:4, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>
                    {c.lastMessage?.content}
                  </div>
                </div>
              ))}
            </div>
            <div className="card" style={{display:'flex', flexDirection:'column', padding:0, overflow:'hidden'}}>
              {!selectedUser ? (
                <div style={{flex:1, display:'flex', alignItems:'center', justifyContent:'center', color:'var(--text2)'}}>
                  Select a conversation
                </div>
              ) : (
                <>
                  <div style={{flex:1, overflow:'auto', padding:20, display:'flex', flexDirection:'column', gap:10}}>
                    {chatMsgs.map(msg => (
                      <div key={msg._id} style={{display:'flex', justifyContent: msg.sender === 'admin' ? 'flex-end' : 'flex-start'}}>
                        <div style={{maxWidth:'70%', padding:'10px 14px', borderRadius:14,
                          background: msg.sender === 'admin' ? 'rgba(245,200,66,0.15)' : 'var(--bg3)',
                          border: '1px solid var(--border)'}}>
                          <div style={{fontSize:11, color:'var(--text3)', marginBottom:4}}>
                            {msg.sender === 'admin' ? 'You (Admin)' : 'User'}
                          </div>
                          <div style={{fontSize:14}}>{msg.content}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div style={{display:'flex', gap:10, padding:16, borderTop:'1px solid var(--border)'}}>
                    <input value={replyInput} onChange={e => setReplyInput(e.target.value)}
                      placeholder="Type reply..."
                      style={{flex:1, background:'var(--bg3)', border:'1px solid var(--border)', borderRadius:10, padding:'10px 14px', color:'var(--text)', fontSize:14, outline:'none'}}
                      onKeyDown={e => e.key === 'Enter' && sendReply()} />
                    <button className="btn btn-gold" onClick={sendReply}>Send</button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Notifications */}
        {tab === 'notifications' && (
          <div style={{maxWidth:600}}>
            <div className="card">
              <h3 style={{marginBottom:20}}>Send Notification</h3>
              <div style={{display:'flex', flexDirection:'column', gap:14}}>
                <div className="input-group">
                  <label>Title</label>
                  <input placeholder="Notification title" value={notifForm.title}
                    onChange={e => setNotifForm({...notifForm, title: e.target.value})} />
                </div>
                <div className="input-group">
                  <label>Message</label>
                  <textarea rows={4} placeholder="Write your message..." value={notifForm.content}
                    onChange={e => setNotifForm({...notifForm, content: e.target.value})} />
                </div>
                <div className="input-group">
                  <label>User ID (leave empty to broadcast to ALL)</label>
                  <input placeholder="Specific user ID or leave empty for all" value={notifForm.userId}
                    onChange={e => setNotifForm({...notifForm, userId: e.target.value})} />
                </div>
                <div style={{display:'flex', gap:10}}>
                  <button className="btn btn-gold btn-full" onClick={() => sendNotif(true)} disabled={loading || !notifForm.title}>
                    📢 Broadcast to All
                  </button>
                  <button className="btn btn-green btn-full" onClick={() => sendNotif(false)} disabled={loading || !notifForm.title || !notifForm.userId}>
                    👤 Send to User
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
