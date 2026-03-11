import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [form, setForm] = useState({ username: '', email: '', password: '', referralCode: '' });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const ref = searchParams.get('ref');
    if (ref) setForm(f => ({ ...f, referralCode: ref }));
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    setLoading(true);
    try {
      await register(form.username, form.email, form.password, form.referralCode);
      toast.success('Welcome to EarnZone!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <h1>EarnZone</h1>
          <p>Create your free account</p>
        </div>
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Username</label>
            <input placeholder="cooluser123" value={form.username}
              onChange={e => setForm({...form, username: e.target.value})} required />
          </div>
          <div className="input-group">
            <label>Email</label>
            <input type="email" placeholder="your@email.com" value={form.email}
              onChange={e => setForm({...form, email: e.target.value})} required />
          </div>
          <div className="input-group">
            <label>Password</label>
            <input type="password" placeholder="Min 6 characters" value={form.password}
              onChange={e => setForm({...form, password: e.target.value})} required />
          </div>
          <div className="input-group">
            <label>Referral Code (optional)</label>
            <input placeholder="Enter referral code" value={form.referralCode}
              onChange={e => setForm({...form, referralCode: e.target.value})} />
          </div>
          <button className="btn btn-gold btn-full" type="submit" disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>
        <p className="auth-link">Already have an account? <Link to="/login">Sign In</Link></p>
      </div>
    </div>
  );
}
