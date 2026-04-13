import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../auth/auth_Context.jsx';
import { userAPI } from '../utility/api.jsx';
import '../css/Profile.css';

export default function Profile() {
    const { user, signout, updateUser } = useAuth();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ username: '', email: '' });
    const [userListings, setUserListings] = useState([]);
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState(null);

    useEffect(() => {
        if (!user) { navigate('/sign-in'); return; }
        setFormData({ username: user.username || '', email: user.email || '' });
        userAPI.getListings(user._id)
            .then(r => setUserListings(Array.isArray(r.data) ? r.data : (r.data?.listings || [])))
            .catch(() => { });
        window.scrollTo(0, 0);
    }, [user, navigate]);

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await userAPI.update(user._id, formData);
            updateUser(res.data);
            setEditing(false);
            setMessage({ type: 'success', text: 'Profile updated successfully!' });
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update profile.' });
        } finally {
            setSaving(false);
        }
    };

    const handleSignout = async () => {
        await signout();
        navigate('/');
    };

    if (!user) return null;

    const formatPrice = (n) =>
        n >= 10000000 ? `₹${(n / 10000000).toFixed(2)} Cr`
            : n >= 100000 ? `₹${(n / 100000).toFixed(1)} L`
                : `₹${n?.toLocaleString()}`;

    const initials = (user.username || 'U').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

    return (
        <div className="profile-page container">
            {/* Header */}
            <div className="profile-header">
                <div className="profile-avatar">
                    {user.avatar
                        ? <img src={user.avatar} alt={user.username} />
                        : <div className="avatar-initials">{initials}</div>
                    }
                </div>
                <div className="profile-header-info">
                    <h1>{user.username}</h1>
                    <p className="profile-email">{user.email}</p>
                    <span className={`profile-role-badge role-${user.role || 'user'}`}>
                        {user.role === 'admin' ? '🛡 Admin' : '👤 Member'}
                    </span>
                </div>
                <div className="profile-header-actions">
                    <Link to="/create-listing" className="btn-primary" style={{ fontSize: '0.85rem' }}>+ Add Listing</Link>
                    {user.role === 'admin' && (
                        <Link to="/admin" className="btn-outline" style={{ fontSize: '0.85rem' }}>🔧 Admin Panel</Link>
                    )}
                    <button onClick={handleSignout} className="btn-outline" style={{ fontSize: '0.85rem', color: '#e53935', borderColor: '#e53935' }}>
                        Sign Out
                    </button>
                </div>
            </div>

            <div className="profile-layout">
                {/* Left — Edit Profile */}
                <div className="profile-card">
                    <div className="profile-card-header">
                        <h2>Profile Information</h2>
                        {!editing && (
                            <button className="btn-outline" style={{ fontSize: '0.82rem', padding: '6px 14px' }} onClick={() => setEditing(true)}>
                                ✏️ Edit
                            </button>
                        )}
                    </div>

                    {message && (
                        <div className={`profile-message ${message.type}`}>{message.text}</div>
                    )}

                    {editing ? (
                        <form className="profile-edit-form" onSubmit={handleSave}>
                            <div className="form-group">
                                <label>Username</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.username}
                                    onChange={e => setFormData({ ...formData, username: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Email Address</label>
                                <input
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                                <button type="submit" className="btn-primary" disabled={saving} style={{ flex: 1 }}>
                                    {saving ? 'Saving...' : 'Save Changes'}
                                </button>
                                <button type="button" className="btn-outline" onClick={() => setEditing(false)} style={{ flex: 1 }}>
                                    Cancel
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="profile-info-list">
                            <div className="profile-info-item">
                                <span className="info-label">Username</span>
                                <span className="info-value">{user.username}</span>
                            </div>
                            <div className="profile-info-item">
                                <span className="info-label">Email</span>
                                <span className="info-value">{user.email}</span>
                            </div>
                            <div className="profile-info-item">
                                <span className="info-label">Member Since</span>
                                <span className="info-value">{user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}</span>
                            </div>
                            <div className="profile-info-item">
                                <span className="info-label">Account Role</span>
                                <span className="info-value" style={{ textTransform: 'capitalize' }}>{user.role || 'user'}</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right — My Listings */}
                <div className="profile-card">
                    <div className="profile-card-header">
                        <h2>My Listings ({userListings.length})</h2>
                    </div>
                    {userListings.length === 0 ? (
                        <div className="profile-empty">
                            <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🏠</div>
                            <p>You haven't added any listings yet.</p>
                        </div>
                    ) : (
                        <div className="profile-listings">
                            {userListings.map(l => (
                                <Link to={`/listings/${l._id}`} key={l._id} className="profile-listing-item">
                                    <img src={l.imageUrls?.[0] || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=200'} alt={l.name} />
                                    <div className="listing-item-info">
                                        <h4>{l.name}</h4>
                                        <p>📍 {l.location}</p>
                                        <p className="listing-item-price">{formatPrice(l.regularPrice)}</p>
                                    </div>
                                    <span className={`status-dot status-${l.status}`}></span>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
