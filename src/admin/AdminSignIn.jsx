import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../auth/auth_Context.jsx';
import '../css/Auth.css'; // Reusing standard auth styling

export default function AdminSignIn() {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const { adminSignin, loading } = useAuth();
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        const res = await adminSignin(formData.email, formData.password);
        if (res.success) {
            navigate('/admin');
        } else {
            setError(res.message);
        }
    };

    return (
        <div className="auth-page auth-bg-signin">
            <div className="auth-form-side">
                <div className="auth-form-container" style={{ borderTop: '4px solid #013220' }}>
                    <h1 style={{ color: '#013220' }}>Admin Login Desk</h1>
                    <p className="auth-subtitle">Secure access for NH platform administrators.</p>
                    {error && <div className="auth-error">{error}</div>}

                    <form onSubmit={handleSubmit} className="auth-form">
                        <div className="form-group">
                            <label>Admin Email</label>
                            <input required type="email" placeholder="admin@nhrealestate.in" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                        </div>
                        <div className="form-group">
                            <label>Passcode</label>
                            <input required type="password" placeholder="••••••••" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} />
                        </div>
                        <button type="submit" className="auth-btn" disabled={loading} style={{ backgroundColor: '#013220', color: 'white', border: 'none' }}>
                            {loading ? 'Authenticating...' : 'Enter Admin Terminal'}
                        </button>
                    </form>

                    <div className="auth-form-footer">
                        Not registered as admin yet? <Link to="/admin/signup" className="auth-link">Apply for Access</Link>
                        <div style={{ marginTop: '1rem' }}>
                            <Link to="/sign-in" className="auth-link" style={{ fontSize: '12px', color: '#555' }}>Return to regular Sign In</Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
