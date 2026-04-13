import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../utility/api.jsx';
import '../css/Auth.css';

export default function AdminSignUp() {
    const [formData, setFormData] = useState({ username: '', email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            await authAPI.signup({ ...formData, role: 'admin' });
            setSuccess(true);
            setTimeout(() => {
                navigate('/admin/signin');
            }, 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create admin profile');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="auth-page auth-bg-signup">
                <div className="auth-form-side">
                    <div className="auth-form-container" style={{ textAlign: 'center' }}>
                        <h1 style={{ color: '#D4AF37' }}>Welcome Admin</h1>
                        <p className="auth-subtitle">Your administrative account has been created.</p>
                        <p style={{ color: '#666', fontSize: '14px' }}>Redirecting to secure login desk...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="auth-page auth-bg-signup">
            <div className="auth-form-side">
                <div className="auth-form-container" style={{ borderTop: '4px solid #013220' }}>
                    <h1 style={{ color: '#013220' }}>Admin Registration</h1>
                    <p className="auth-subtitle">Register a new system administrator credentials.</p>
                    {error && <div className="auth-error">{error}</div>}

                    <form onSubmit={handleSubmit} className="auth-form">
                        <div className="form-group">
                            <label>Admin Username</label>
                            <input required type="text" placeholder="AdminName" value={formData.username} onChange={e => setFormData({ ...formData, username: e.target.value })} />
                        </div>
                        <div className="form-group">
                            <label>Official Email</label>
                            <input required type="email" placeholder="admin@nhrealestate.in" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                        </div>
                        <div className="form-group">
                            <label>Secure Password</label>
                            <input required type="password" placeholder="••••••••" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} />
                        </div>
                        <button type="submit" className="auth-btn" disabled={loading} style={{ backgroundColor: '#013220', color: 'white', border: 'none' }}>
                            {loading ? 'Creating Identity...' : 'Register as Admin'}
                        </button>
                    </form>

                    <div className="auth-form-footer">
                        Already an admin? <Link to="/admin/signin" className="auth-link">Sign in here</Link>
                        <div style={{ marginTop: '1rem' }}>
                            <Link to="/" className="auth-link" style={{ fontSize: '12px', color: '#555' }}>Back to Home</Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
