import React, { useState } from 'react';
import useStore from '../store/useStore';
import axios from 'axios';
import { ShieldAlert } from 'lucide-react';

const Login = () => {
    const { login } = useStore();
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('admin@disastersense.com'); // Admin default
    const [password, setPassword] = useState('123456');
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
            if (isLogin) {
                const res = await axios.post(`${apiUrl}/api/auth/login`, { email, password });
                login(res.data.user, res.data.token);
            } else {
                await axios.post(`${apiUrl}/api/auth/register`, { name, email, password });
                setIsLogin(true); // Switch to login after register
                setError('Registration successful, securely logging you out pending auth.');
                setEmail('');
                setPassword('');
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Authentication failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px', justifyContent: 'center' }}>
                    <ShieldAlert size={32} color="#EF4444" />
                    <h2 style={{ fontSize: '24px', margin: 0, fontFamily: 'var(--font-heading)' }}>DisasterSense</h2>
                </div>

                <h3 style={{ textAlign: 'center', marginBottom: '16px', color: 'var(--text-secondary)' }}>
                    {isLogin ? 'Mission Operations Login' : 'Analyst Registration'}
                </h3>

                {error && <div className="login-error" style={{ color: error.includes('success') ? 'var(--secondary)' : 'var(--accent)', background: 'var(--bg-color)', padding: '10px', borderRadius: '6px', marginBottom: '16px', textAlign: 'center', fontSize: '14px', border: `1px solid ${error.includes('success') ? 'var(--secondary)' : 'var(--accent)'}` }}>{error}</div>}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {!isLogin && (
                        <input
                            className="login-input"
                            type="text"
                            placeholder="Full Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    )}
                    <input
                        className="login-input"
                        type="email"
                        placeholder="Agency Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <input
                        className="login-input"
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />

                    <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', padding: '12px', marginTop: '8px', fontSize: '16px' }}>
                        {loading ? 'Authenticating...' : (isLogin ? 'Secure Login' : 'Register Deployment')}
                    </button>
                </form>

                <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px' }}>
                    <span style={{ color: 'var(--text-secondary)', cursor: 'pointer', textDecoration: 'underline' }} onClick={() => { setIsLogin(!isLogin); setError(''); }}>
                        {isLogin ? 'Need clearance? Register here.' : 'Already cleared? Login here.'}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default Login;
