import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

export default function Referrals() {
  const { user, API } = useAuth();
  const [referrals, setReferrals] = useState([]);
  const adRef = useRef(null);

  useEffect(() => {
    axios.get(`${API}/user/referrals`).then(r => setReferrals(r.data.referrals)).catch(() => {});
  }, []);

  // Load banner ad
  useEffect(() => {
    if (adRef.current && !adRef.current.querySelector('script')) {
      const s1 = document.createElement('script');
      s1.innerHTML = `atOptions = {'key':'dd48ecda5386a20b9a7b8486466b2dc0','format':'iframe','height':250,'width':300,'params':{}};`;
      const s2 = document.createElement('script');
      s2.src = 'https://www.highperformanceformat.com/dd48ecda5386a20b9a7b8486466b2dc0/invoke.js';
      s2.async = true;
      adRef.current.appendChild(s1);
      adRef.current.appendChild(s2);
    }
  }, []);

  const refLink = `${window.location.origin}/register?ref=${user?.referralCode}`;
  const copy = () => { navigator.clipboard.writeText(refLink); toast.success('Link copied!'); };

  return (
    <div style={{maxWidth:700}}>
      <h2 style={{fontSize:24, fontWeight:700, marginBottom:24}}>Referrals 👥</h2>

      <div className="card" style={{marginBottom:20}}>
        <h3 style={{marginBottom:12}}>Your Referral Link</h3>
        <div style={{display:'flex', gap:10, alignItems:'center', flexWrap:'wrap'}}>
          <div style={{flex:1, background:'var(--bg3)', border:'1px solid var(--border)', borderRadius:10, padding:'12px 16px', fontSize:13, color:'var(--text2)', wordBreak:'break-all'}}>
            {refLink}
          </div>
          <button className="btn btn-gold" onClick={copy}>Copy</button>
        </div>
        <div style={{marginTop:16, display:'flex', gap:16, flexWrap:'wrap'}}>
          <div style={{background:'var(--bg3)', borderRadius:12, padding:'16px 20px', flex:1, textAlign:'center'}}>
            <div style={{fontFamily:'Syne', fontSize:28, fontWeight:800, color:'var(--gold)'}}>{referrals.length}</div>
            <div style={{fontSize:12, color:'var(--text2)'}}>Total Referrals</div>
          </div>
          <div style={{background:'var(--bg3)', borderRadius:12, padding:'16px 20px', flex:1, textAlign:'center'}}>
            <div style={{fontFamily:'Syne', fontSize:28, fontWeight:800, color:'var(--green)'}}>{user?.validReferrals || 0}</div>
            <div style={{fontSize:12, color:'var(--text2)'}}>Valid (2+ days active)</div>
          </div>
          <div style={{background:'var(--bg3)', borderRadius:12, padding:'16px 20px', flex:1, textAlign:'center'}}>
            <div style={{fontFamily:'Syne', fontSize:28, fontWeight:800, color:'var(--purple)'}}>20</div>
            <div style={{fontSize:12, color:'var(--text2)'}}>Needed for Free L2</div>
          </div>
        </div>
      </div>

      {/* BANNER AD */}
      <div style={{display:'flex', justifyContent:'center', marginBottom:20}}>
        <div ref={adRef} style={{minHeight:250, width:300}} />
      </div>

      <div className="card">
        <h3 style={{marginBottom:16}}>Your Referrals ({referrals.length})</h3>
        {referrals.length === 0 ? (
          <div style={{textAlign:'center', color:'var(--text2)', padding:40}}>No referrals yet. Share your link!</div>
        ) : (
          <div style={{display:'flex', flexDirection:'column', gap:10}}>
            {referrals.map(r => (
              <div key={r._id} style={{display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 16px', background:'var(--bg3)', borderRadius:12}}>
                <div style={{display:'flex', alignItems:'center', gap:12}}>
                  <div style={{width:36, height:36, background:'linear-gradient(135deg, var(--gold), var(--gold2))', borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Syne', fontWeight:800, color:'#000'}}>
                    {r.username?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <div style={{fontWeight:600, fontSize:14}}>{r.username}</div>
                    <div style={{fontSize:12, color:'var(--text2)'}}>Joined {new Date(r.createdAt).toLocaleDateString()}</div>
                  </div>
                </div>
                <div style={{display:'flex', alignItems:'center', gap:8}}>
                  <span className={`badge ${r.isActive ? 'badge-green' : 'badge-red'}`}>{r.isActive ? 'Active' : 'Blocked'}</span>
                  <span className="badge badge-purple">L{r.level}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
