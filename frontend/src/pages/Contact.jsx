import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import './Contact.css';

export default function Contact() {
  const { user, API } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef();

  useEffect(() => { fetchMessages(); }, []);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const fetchMessages = async () => {
    try {
      const res = await axios.get(`${API}/chat/my-messages`);
      setMessages(res.data);
    } catch {}
  };

  const send = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    setLoading(true);
    try {
      await axios.post(`${API}/chat/send`, { content: input });
      setInput('');
      fetchMessages();
    } catch {
      toast.error('Failed to send');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{maxWidth:700}}>
      <h2 style={{fontSize:24, fontWeight:700, marginBottom:8}}>Contact Admin 💬</h2>
      <p style={{color:'var(--text2)', fontSize:14, marginBottom:24}}>Send a message and our admin will reply as soon as possible</p>

      <div className="chat-container card">
        <div className="chat-messages">
          {messages.length === 0 && (
            <div style={{textAlign:'center', color:'var(--text2)', padding:'40px 20px'}}>
              <div style={{fontSize:40, marginBottom:12}}>👋</div>
              <div>Start a conversation with admin!</div>
            </div>
          )}
          {messages.map(msg => (
            <div key={msg._id} className={`chat-msg ${msg.sender === 'user' ? 'mine' : 'theirs'}`}>
              <div className="msg-bubble">
                <div className="msg-sender">{msg.sender === 'admin' ? '👤 Admin' : user?.username}</div>
                <div className="msg-content">{msg.content}</div>
                <div className="msg-time">{new Date(msg.createdAt).toLocaleString()}</div>
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        <form className="chat-input-row" onSubmit={send}>
          <input
            placeholder="Type your message..."
            value={input}
            onChange={e => setInput(e.target.value)}
            disabled={loading}
          />
          <button className="btn btn-gold" type="submit" disabled={loading || !input.trim()}>
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
