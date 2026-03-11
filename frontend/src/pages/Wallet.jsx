import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import './Wallet.css';

const BITCOIN_ADDRESS = 'YOUR_BITCOIN_ADDRESS_HERE'; // Replace with your BTC address

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
  );
}
