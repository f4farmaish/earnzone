import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import './Wallet.css';

const BITCOIN_ADDRESS = 'bc1q7kjrl5prs4nytmyf2wnmvc8u0kggxtqnn80z7j';

const FAKE_USERS = [
  'alex_w', 'sarah_m', 'john99', 'mike_j', 'emma_k', 'david_l',
  'lisa_p', 'ryan_t', 'anna_b', 'chris_h', 'jessica_r', 'tom_s',
  'kate_m', 'james_o', 'olivia_n', 'noah_c', 'sophia_d', 'liam_f',
  'mia_g', 'ethan_v', 'ava_w', 'mason_z', 'isabella_x', 'logan_y'
];

const FAKE_AMOUNTS = [15, 18, 20, 22, 25, 28, 30, 35, 40, 45, 50];

const FAKE_TIMES = ['just now', '1 min ago', '2 mins ago', '3 mins ago', '5 mins ago', '8 mins ago', '10 mins ago'];

function generateFakeWithdrawal() {
  return {
    id: Math.random(),
    user: FAKE_USERS[Math.floor(Math.random() * FAKE_USERS.length)],
    amount: FAKE_AMOUNTS[Math.floor(Math.random() * FAKE_AMOUNTS.length)],
    time: FAKE_TIMES[Math.floor(Math.random() * FAKE_TIMES.length)],
    address: 'bc1q' + Math.random().toString(36).substring(2, 8) + '...'
  };
}

function LiveFeed() {
  const [feed, setFeed] = useState(() => Array.from({length: 6}, generateFakeWithdrawal));

  useEffect(() => {
    const interval = setInterval(() => {
      setFeed(prev => [generateFakeWithdrawal(), ...prev.slice(0, 7)]);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="live-feed">
      <div className="live-feed-header">
        <span className="live-dot" />
        Live Withdrawals
      </div>
      <div className="live-feed-list">
        {feed.map((item, i) => (
          <div key={item.id} className="live-feed-item" style={{animationDelay: `${i * 0.05}s`}}>
            <div className="live-feed-avatar">
              {item.user[0].toUpperCase()}
            </div>
            <div className="live-feed-info">
              <div className="live-feed-user">{item.user}</div>
              <div className="live-feed-addr">{item.address}</div>
            </div>
            <div className="live-feed-right">
              <div className="live-feed-amount">${item.amount}</div>
              <div className="live-feed-time">{item.time}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Wallet() {
  const { user, API, refreshUser } = useAuth();
  const [walletInfo, setWalletInfo] = useState(null);
  const [tab, setTab] = useState('overview');
  const [withdrawForm, setWithdrawForm] = useState({ amount: '', bitcoinAddress: '' });
  const [depositForm, setDepositForm] = useState({ amount: '', txHash: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchWallet(); }, []);

  const fetchWallet = async () => {
    try {
      const res = await axios.get(`${API}/wallet/info`);
      setWalletInfo(res.data);
    } catch {}
  };

  const handleWithdraw = async (e) => {
    e.preventDefault();
    if (withdrawForm.amount < 15) return toast.error('Minimum withdrawal is $15');
    setLoading(true);
    try {
      const res = await axios.post(`${API}/wallet/withdraw`, {
        amount: parseFloat(withdrawForm.amount),
        bitcoinAddress: withdrawForm.bitcoinAddress
      });
      toast.success(res.data.message);
      setWithdrawForm({ amount: '', bitcoinAddress: '' });
      fetchWallet();
      refreshUser();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeposit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(`${API}/wallet/deposit`, {
        amount: parseFloat(depositForm.amount),
        txHash: depositForm.txHash
      });
      toast.success(res.data.message);
      setDepositForm({ amount: '', txHash: '' });
      fetchWallet();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error');
    } finally {
      setLoading(false);
    }
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(BITCOIN_ADDRESS);
    toast.success('Bitcoin address copied!');
  };

  return (
    <div className="wallet-layout">
      {/* Main Wallet */}
      <div className="wallet-page">
        <div className="page-header">
          <h2>Wallet 💎</h2>
        </div>

        {/* Balance Cards */}
        <div className="wallet-cards">
          <div className="wallet-card main-balance">
            <div className="wc-label">Available Balance</div>
            <div className="wc-amount">${(user?.balance || 0).toFixed(2)}</div>
            <div className="wc-sub">Min withdrawal: $15</div>
          </div>
          <div className="wallet-card">
            <div className="wc-label">Total Earned</div>
            <div className="wc-amount" style={{color:'var(--green)'}}>${(user?.totalEarned || 0).toFixed(2)}</div>
          </div>
          <div className="wallet-card">
            <div className="wc-label">Total Withdrawn</div>
            <div className="wc-amount" style={{color:'var(--purple)'}}>${(user?.totalWithdrawn || 0).toFixed(2)}</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="wallet-tabs">
          {['overview', 'withdraw', 'deposit'].map(t => (
            <button key={t} className={`tab-btn ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {/* Overview */}
        {tab === 'overview' && walletInfo && (
          <div className="card">
            <h3 style={{marginBottom:16}}>Transaction History</h3>
            <div className="tx-list">
              {walletInfo.transactions?.length === 0 && (
                <div style={{textAlign:'center', color:'var(--text2)', padding:40}}>No transactions yet</div>
              )}
              {walletInfo.transactions?.map(tx => (
                <div className="tx-item" key={tx._id}>
                  <div className="tx-info">
                    <div className="tx-type">{tx.type.replace(/_/g, ' ')}</div>
                    <div className="tx-date">{new Date(tx.createdAt).toLocaleString()}</div>
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

        {/* Withdraw */}
        {tab === 'withdraw' && (
          <div className="card">
            <h3 style={{marginBottom:8}}>Withdraw to Bitcoin</h3>
            <p style={{color:'var(--text2)', fontSize:13, marginBottom:20}}>
              Minimum withdrawal: <strong style={{color:'var(--gold)'}}>$15</strong> · Processed within 24 hours
            </p>
            <form onSubmit={handleWithdraw} style={{display:'flex', flexDirection:'column', gap:16}}>
              <div className="input-group">
                <label>Amount (USD)</label>
                <input type="number" min="15" step="0.01" placeholder="15.00"
                  value={withdrawForm.amount}
                  onChange={e => setWithdrawForm({...withdrawForm, amount: e.target.value})} required />
              </div>
              <div className="input-group">
                <label>Your Bitcoin Address</label>
                <input placeholder="bc1q..." value={withdrawForm.bitcoinAddress}
                  onChange={e => setWithdrawForm({...withdrawForm, bitcoinAddress: e.target.value})} required />
              </div>
              <div className="info-box">
                ⚠️ Double-check your Bitcoin address. Withdrawals to wrong addresses cannot be recovered.
              </div>
              <button className="btn btn-gold btn-full" disabled={loading || user?.balance < 15}>
                {loading ? 'Processing...' : user?.balance < 15 ? `Need $${(15-user?.balance).toFixed(2)} more` : 'Request Withdrawal'}
              </button>
            </form>
          </div>
        )}

        {/* Deposit */}
        {tab === 'deposit' && (
          <div className="card">
            <h3 style={{marginBottom:8}}>Deposit Bitcoin</h3>
            <p style={{color:'var(--text2)', fontSize:13, marginBottom:20}}>
              Send Bitcoin to the address below, then submit your transaction hash for verification
            </p>
            <div className="btc-address-box">
              <div className="btc-label">Our Bitcoin Address</div>
              <div className="btc-address">{BITCOIN_ADDRESS}</div>
              <button className="btn btn-outline btn-sm" style={{marginTop:12}} onClick={copyAddress}>
                Copy Address
              </button>
            </div>
            <form onSubmit={handleDeposit} style={{display:'flex', flexDirection:'column', gap:16, marginTop:20}}>
              <div className="input-group">
                <label>Amount Sent (USD equivalent)</label>
                <input type="number" min="1" step="0.01" placeholder="20.00"
                  value={depositForm.amount}
                  onChange={e => setDepositForm({...depositForm, amount: e.target.value})} required />
              </div>
              <div className="input-group">
                <label>Transaction Hash (TxID)</label>
                <input placeholder="Paste your Bitcoin transaction hash here"
                  value={depositForm.txHash}
                  onChange={e => setDepositForm({...depositForm, txHash: e.target.value})} required />
              </div>
              <button className="btn btn-green btn-full" disabled={loading}>
                {loading ? 'Submitting...' : 'Submit Deposit'}
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Live Feed Sidebar */}
      <LiveFeed />
    </div>
  );
}
