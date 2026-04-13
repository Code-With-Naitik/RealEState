import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/auth_Context.jsx';
import '../css/Auth.css';

export default function SignUp() {
    const [formData, setFormData] = useState({ username: '', email: '', password: '' });
    const [error, setError] = useState(null);
    const { signup, loading, user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        window.scrollTo(0, 0);
        if (user) {
            navigate('/');
        }
    }, [user, navigate]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        if (!formData.username || !formData.email || !formData.password) {
            setError("Please fill in all fields.");
            return;
        }

        const res = await signup(formData.username, formData.email, formData.password);
        if (res.success) {
            navigate('/sign-in');
        } else {
            setError(res.message);
        }
    };

    return (
        <div className="auth-page auth-bg-signup">
            <div className="auth-form-side">
                <div className="auth-form-container">
                    <h1>Create Account</h1>
                    <p className="auth-subtitle">Start your real estate journey with us.</p>

                    {error && <div className="auth-error">{error}</div>}

                    <form className="auth-form" onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="username">Full Name / Username</label>
                            <input
                                type="text"
                                id="username"
                                placeholder="John Doe"
                                value={formData.username}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="email">Email Address</label>
                            <input
                                type="email"
                                id="email"
                                placeholder="name@example.com"
                                value={formData.email}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="password">Password</label>
                            <input
                                type="password"
                                id="password"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={handleChange}
                            />
                        </div>

                        <button type="submit" className="btn-primary auth-btn" disabled={loading}>
                            {loading ? 'Creating Account...' : 'Sign Up'}
                        </button>
                    </form>

                    <div className="auth-form-footer">
                        Already have an account? <Link to="/sign-in" className="auth-link">Sign In</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
