import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const response = await fetch('http://localhost:5001/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('user', JSON.stringify(data));
                navigate('/dashboard');
            } else {
                setError(data.message || 'Login failed');
            }
        } catch (err) {
            setError('Connection error. Is the backend running?');
        }
    };

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            background: 'radial-gradient(circle at top right, #1e1b4b, #0f172a)'
        }}>
            <div className="glass-panel" style={{ width: '100%', maxWidth: '400px', padding: '2rem' }}>
                <div className="text-center mb-4">
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>NeuGraph</h1>
                    <p className="text-gray text-sm">Welcome Back</p>
                    <p className="text-gray text-sm">Please sign in to your account</p>
                </div>

                {error && (
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        background: 'rgba(239, 68, 68, 0.2)',
                        color: '#ef4444',
                        padding: '0.75rem',
                        borderRadius: '8px',
                        marginBottom: '1rem',
                        fontSize: '0.875rem'
                    }}>
                        <AlertCircle size={18} />
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div style={{ position: 'relative', marginBottom: '1rem' }}>
                        <Mail size={20} style={{ position: 'absolute', left: '12px', top: '12px', color: '#94a3b8' }} />
                        <input
                            type="email"
                            placeholder="Email"
                            className="form-input"
                            style={{ paddingLeft: '40px' }}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
                        <Lock size={20} style={{ position: 'absolute', left: '12px', top: '12px', color: '#94a3b8' }} />
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Password"
                            className="form-input"
                            style={{ paddingLeft: '40px', paddingRight: '40px' }}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            style={{ position: 'absolute', right: '12px', top: '12px', background: 'none', padding: 0, color: '#94a3b8' }}
                        >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: '#94a3b8', cursor: 'pointer' }}>
                            <input type="checkbox" style={{ accentColor: 'var(--primary-color)' }} />
                            Remember Me
                        </label>
                    </div>

                    <button type="submit" className="btn-primary">
                        LOGIN
                    </button>
                </form>

                <p className="text-center text-sm text-gray" style={{ marginTop: '1.5rem' }}>
                    Don't have your account? <a href="#" style={{ color: 'var(--primary-color)' }}>Contact Support</a>
                </p>
            </div>
        </div>
    );
};

export default Login;
