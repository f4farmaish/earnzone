import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function Notifications() {
  const { user, API } = useAuth();
  const [notifs, setNotifs] = useState([]);

  useEffect(() => {
    axios.get(`${API}/notifications`).then(r => {
      setNotifs(r.data);
      r.data.forEach(n => {
        if (!n.read.includes(user?._id)) {
          axios.post(`${API}/notifications/read/${n._id}`).catch(() => {});
        }
      });
    }).catch(() => {});
  }, []);

  return (
    <div style={{maxWidth:700}}>
      <h2 style={{fontSize:24, fontWeight:700, marginBottom:24}}>Notifications 🔔</h2>
      {notifs.length === 0 ? (
        <div className="card" style={{textAlign:'center', color:'var(--text2)', padding:60}}>
          <div style={{fontSize:40, marginBottom:12}}>🔔</div>
          <div>No notifications yet</div>
        </div>
      ) : (
        <div style={{display:'flex', flexDirection:'column', gap:12}}>
          {notifs.map(n => {
            const isRead = n.read.includes(user?._id);
            return (
              <div key={n._id} className="card" style={{
                borderLeft: isRead ? '3px solid var(--border)' : '3px solid var(--gold)',
                opacity: isRead ? 0.8 : 1
              }}>
                <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8}}>
                  <h4 style={{fontSize:15, fontWeight:700}}>{n.title}</h4>
                  {!isRead && <span className="badge badge-gold">New</span>}
                </div>
                <p style={{fontSize:14, color:'var(--text2)', lineHeight:1.6}}>{n.content}</p>
                <div style={{fontSize:12, color:'var(--text3)', marginTop:10}}>{new Date(n.createdAt).toLocaleString()}</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
