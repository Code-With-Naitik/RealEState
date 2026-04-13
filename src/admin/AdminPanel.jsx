import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { listingsAPI, userAPI, contactAPI, blogAPI } from '../utility/api.jsx';
import { useAuth } from '../auth/auth_Context.jsx';
import ImageUploader from './ImageUploader.jsx';
import './admin_css/AdminPanel.css';

export default function AdminPanel() {
    const navigate = useNavigate();
    const { adminSignout } = useAuth();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [stats, setStats] = useState({ total: 0, forSale: 0, forRent: 0, sold: 0 });
    const [listings, setListings] = useState([]);
    const [users, setUsers] = useState([]);
    const [enquiries, setEnquiries] = useState([]);
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);

    // Editing and Adding States
    const [editingListing, setEditingListing] = useState(null);
    const [editingUser, setEditingUser] = useState(null);
    const [addingUser, setAddingUser] = useState(false);
    const [addingListing, setAddingListing] = useState(false);
    const [editingBlog, setEditingBlog] = useState(null);
    const [addingBlog, setAddingBlog] = useState(false);
    const [formData, setFormData] = useState({});
    const [isExiting, setIsExiting] = useState(false);
    const [isEntering, setIsEntering] = useState(true);

    useEffect(() => {
        fetchData();
        // Entry animation: show intro overlay then fade out
        const timer = setTimeout(() => setIsEntering(false), 1400);
        return () => clearTimeout(timer);
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const results = await Promise.allSettled([
                listingsAPI.getStats(),
                listingsAPI.getAll({ limit: 100 }),
                userAPI.getAll(),
                contactAPI.getAll(),
                blogAPI.getAllAdmin()
            ]);
            
            const [statsRes, listingsRes, usersRes, enquiriesRes, blogsRes] = results;
            setStats(statsRes.status === 'fulfilled' ? statsRes.value.data : { total: 0, forSale: 0, forRent: 0, sold: 0 });
            setListings(listingsRes.status === 'fulfilled' ? (listingsRes.value.data.listings || []) : []);
            setUsers(usersRes.status === 'fulfilled' ? (usersRes.value.data || []) : []);
            setEnquiries(enquiriesRes.status === 'fulfilled' ? (enquiriesRes.value.data || []) : []);
            
            if (blogsRes.status === 'fulfilled') {
                const bData = blogsRes.value.data;
                setBlogs(Array.isArray(bData) ? bData : (bData?.blogs || []));
            } else {
                setBlogs([]);
            }
        } catch (error) {
            console.error("Error fetching admin data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteListing = async (id) => {
        if (!window.confirm("Are you sure you want to delete this listing?")) return;
        try {
            await listingsAPI.delete(id);
            setListings(listings.filter(l => l._id !== id));
            setStats(s => ({ ...s, total: s.total - 1 }));
        } catch (err) {
            alert('Failed to delete listing');
        }
    };

    const handleDeleteUser = async (id) => {
        if (!window.confirm("Are you sure you want to delete this user?")) return;
        try {
            await userAPI.delete(id);
            setUsers(users.filter(u => u._id !== id));
        } catch (err) {
            alert('Failed to delete user');
        }
    };

    const openEditListing = (listing) => {
        setEditingListing(listing);
        setFormData({
            name: listing.name,
            regularPrice: listing.regularPrice,
            status: listing.status,
            featured: listing.featured
        });
    };

    const openEditUser = (user) => {
        setEditingUser(user);
        setFormData({
            username: user.username,
            email: user.email,
            role: user.role
        });
    };

    const saveListing = async (e) => {
        e.preventDefault();
        try {
            const res = await listingsAPI.update(editingListing._id, formData);
            setListings(listings.map(l => l._id === editingListing._id ? res.data : l));
            setEditingListing(null);
        } catch (err) {
            alert('Failed to update listing');
        }
    };

    const saveUser = async (e) => {
        e.preventDefault();
        try {
            const res = await userAPI.update(editingUser._id, formData);
            setUsers(users.map(u => u._id === editingUser._id ? res.data : u));
            setEditingUser(null);
        } catch (err) {
            alert('Failed to update user');
        }
    };

    const handleDeleteEnquiry = async (id) => {
        if (!window.confirm("Delete this enquiry?")) return;
        try {
            await contactAPI.delete(id);
            setEnquiries(enquiries.filter(e => e._id !== id));
        } catch (err) {
            alert('Failed to delete enquiry');
        }
    };

    const handleStatusUpdate = async (id, status) => {
        try {
            await contactAPI.update(id, { status });
            setEnquiries(enquiries.map(e => e._id === id ? { ...e, status } : e));
        } catch (err) {
            alert('Failed to update status');
        }
    };

    const handleAddUser = async (e) => {
        e.preventDefault();
        try {
            const { authAPI } = await import('../utility/api.jsx');
            await authAPI.signup(formData);
            alert('New user created successfully');
            setAddingUser(false);
            fetchData(); // Refresh the list
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to create user');
        }
    };

    const handleDeleteBlog = async (id) => {
        if (!window.confirm("Delete this blog?")) return;
        try {
            await blogAPI.delete(id);
            setBlogs(blogs.filter(b => b._id !== id));
        } catch (err) {
            alert('Failed to delete blog');
        }
    };

    const openEditBlog = (blog) => {
        setEditingBlog(blog);
        setFormData({ title: blog.title, content: blog.content, excerpt: blog.excerpt, imageUrl: blog.imageUrl, published: blog.published });
    };

    const saveBlog = async (e) => {
        e.preventDefault();
        try {
            const res = await blogAPI.update(editingBlog._id, formData);
            setBlogs(blogs.map(b => b._id === editingBlog._id ? res.data : b));
            setEditingBlog(null);
        } catch (err) {
            alert('Failed to update blog');
        }
    };

    const handleAddBlog = async (e) => {
        e.preventDefault();
        try {
            const res = await blogAPI.create(formData);
            setBlogs([res.data, ...blogs]);
            setAddingBlog(false);
            setFormData({});
        } catch (err) {
            alert('Failed to create blog');
        }
    };

    const defaultListingForm = () => ({
        name: '', description: '', address: '', location: '',
        regularPrice: '', discountPrice: '', bedrooms: 1, bathrooms: 1,
        area: '', type: 'sale', category: 'apartment', status: 'active',
        featured: false, furnished: false, parking: false, offer: false,
        imageUrls: [],   // array from ImageUploader
        amenities: '', projectName: '',
    });

    const handleAddListing = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                regularPrice: Number(formData.regularPrice),
                discountPrice: formData.discountPrice ? Number(formData.discountPrice) : undefined,
                bedrooms: Number(formData.bedrooms),
                bathrooms: Number(formData.bathrooms),
                area: formData.area ? Number(formData.area) : undefined,
                imageUrls: Array.isArray(formData.imageUrls) ? formData.imageUrls : [],
                amenities: formData.amenities
                    ? formData.amenities.split(',').map(s => s.trim()).filter(Boolean)
                    : [],
            };
            const res = await listingsAPI.create(payload);
            setListings(prev => [res.data, ...prev]);
            setStats(s => ({ ...s, total: s.total + 1, forSale: formData.type === 'sale' ? s.forSale + 1 : s.forSale, forRent: formData.type === 'rent' ? s.forRent + 1 : s.forRent }));
            setAddingListing(false);
            setFormData({});
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to create listing');
        }
    };

    const handleExit = () => {
        setIsExiting(true);
        setTimeout(() => {
            navigate('/');
        }, 1200); // 1.2s delay for attractive luxury animation sequence
    };

    if (loading && isEntering) return (
        <div className="admin-entry-overlay">
            <div className="entry-loader-container">
                <div className="entry-logo">⬡</div>
                <h2 className="entry-title">NH Admin</h2>
                <p className="entry-subtitle">Loading Workspace...</p>
                <div className="entry-bar-track"><div className="entry-bar-fill"></div></div>
            </div>
        </div>
    );

    if (isEntering) return (
        <div className="admin-entry-overlay">
            <div className="entry-loader-container">
                <div className="entry-logo">⬡</div>
                <h2 className="entry-title">NH Admin</h2>
                <p className="entry-subtitle">Welcome Back, Administrator</p>
                <div className="entry-bar-track"><div className="entry-bar-fill"></div></div>
            </div>
        </div>
    );

    const navItem = (tab, icon, label) => (
        <li
            className={activeTab === tab ? 'active' : ''}
            onClick={() => { setActiveTab(tab); setSidebarOpen(false); }}
        >
            {icon} {label}
            {tab === 'enquiries' && enquiries.filter(e => e.status === 'new').length > 0 && (
                <span className="badge-new">{enquiries.filter(e => e.status === 'new').length}</span>
            )}
        </li>
    );

    const sidebarContent = (
        <>
            <h2>NH Admin</h2>
            <ul className="sidebar-menu">
                {navItem('dashboard',  '📊', 'Dashboard')}
                {navItem('listings',   '🏠', 'Manage Listings')}
                {navItem('users',      '👥', 'Manage Users')}
                {navItem('enquiries',  '✉️', 'Enquiries')}
                {navItem('blogs',      '📝', 'Manage Blogs')}
            </ul>
            <div className="sidebar-bottom-actions">
                <div className="sidebar-action-btn" onClick={handleExit}>
                    🌍 Back to Website
                </div>
                <div className="sidebar-action-btn sidebar-action-danger"
                    onClick={async () => { await adminSignout(); navigate('/admin/signin'); }}>
                    🚪 Sign Out
                </div>
            </div>
        </>
    );

    return (
        <div className="admin-container">

            {/* Mobile top bar */}
            <header className="admin-mobile-topbar">
                <button
                    className={`admin-hamburger ${sidebarOpen ? 'is-open' : ''}`}
                    onClick={() => setSidebarOpen(prev => !prev)}
                    aria-label="Toggle sidebar"
                >
                    <span /><span /><span />
                </button>
                <span className="admin-mobile-title">NH Admin</span>
                <span style={{ width: 44 }} />{/* spacer */}
            </header>

            {/* Backdrop overlay on mobile */}
            {sidebarOpen && (
                <div className="admin-sidebar-overlay" onClick={() => setSidebarOpen(false)} />
            )}

            {/* Desktop sidebar (always visible on desktop) */}
            <aside className="admin-sidebar">
                {sidebarContent}
            </aside>

            {/* Mobile sidebar drawer */}
            <aside className={`admin-sidebar admin-sidebar-mobile ${sidebarOpen ? 'open' : ''}`}>
                {sidebarContent}
            </aside>

            <main className="admin-content">
                <div className="admin-header">
                    <h1>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h1>
                </div>

                {activeTab === 'dashboard' && (
                    <>
                        <div className="admin-stats-grid">
                            <div className="stat-card">
                                <h3>Total Properties</h3>
                                <p className="stat-value">{stats.total}</p>
                            </div>
                            <div className="stat-card">
                                <h3>For Sale</h3>
                                <p className="stat-value">{stats.forSale}</p>
                            </div>
                            <div className="stat-card">
                                <h3>For Rent</h3>
                                <p className="stat-value">{stats.forRent}</p>
                            </div>
                            <div className="stat-card">
                                <h3>Sold Out</h3>
                                <p className="stat-value">{stats.sold}</p>
                            </div>
                            <div className="stat-card" style={{ borderTop: '3px solid var(--gold)' }}>
                                <h3>Registered Users</h3>
                                <p className="stat-value" style={{ color: 'var(--gold-dark, #b8860b)' }}>{users.length}</p>
                            </div>
                        </div>
                        <div className="admin-data-section">
                            <div className="data-table-header">
                                <h2>Recent Listings</h2>
                            </div>
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>Property</th>
                                        <th>Type</th>
                                        <th>Price</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {listings.slice(0, 5).map(l => (
                                        <tr key={l._id}>
                                            <td data-label="Property" style={{ fontWeight: 600 }}>{l.name}</td>
                                            <td data-label="Type" style={{ textTransform: 'capitalize' }}>{l.type}</td>
                                            <td data-label="Price">₹{l.regularPrice.toLocaleString('en-IN')}</td>
                                            <td data-label="Status">
                                                <span className={`status-badge status-${l.status}`}>{l.status}</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}

                {activeTab === 'listings' && (
                    <div className="admin-data-section">
                        <div className="data-table-header">
                            <h2>All Listings Database</h2>
                            <button className="btn-save" onClick={() => { setAddingListing(true); setFormData(defaultListingForm()); }} style={{ padding: '0.5rem 1.2rem', fontSize: '0.9rem', cursor: 'pointer' }}>+ Add Property</button>
                        </div>
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Location</th>
                                    <th>Price</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {listings.map(l => (
                                    <tr key={l._id}>
                                        <td data-label="Name">{l.name.substring(0, 30)}{l.name.length > 30 && '...'}</td>
                                        <td data-label="Location">{l.location}</td>
                                        <td data-label="Price">₹{l.regularPrice.toLocaleString('en-IN')}</td>
                                        <td data-label="Status">
                                            <span className={`status-badge status-${l.status}`}>{l.status}</span>
                                        </td>
                                        <td data-label="Actions" className="action-btns">
                                            <button className="btn-edit" onClick={() => openEditListing(l)}>Edit</button>
                                            <button className="btn-delete" onClick={() => handleDeleteListing(l._id)}>Delete</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {activeTab === 'users' && (
                    <div className="admin-data-section">
                        <div className="data-table-header">
                            <h2>Registered Users</h2>
                            <button className="btn-primary" onClick={() => { setAddingUser(true); setFormData({ username: '', email: '', password: '', role: 'user' }); }} style={{ background: 'var(--gold)', border: 'none', padding: '0.5rem 1rem' }}>+ Add New User</button>
                        </div>
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>User</th>
                                    <th>Email</th>
                                    <th>Role</th>
                                    <th>Joined</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(u => (
                                    <tr key={u._id}>
                                        <td data-label="User">
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <div style={{ width: 36, height: 36, borderRadius: '50%', overflow: 'hidden', flexShrink: 0, background: 'var(--primary, #013220)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    {u.avatar
                                                        ? <img src={u.avatar} alt={u.username} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                        : <span style={{ color: 'var(--gold)', fontWeight: 700, fontSize: '0.85rem' }}>{(u.username || 'U')[0].toUpperCase()}</span>
                                                    }
                                                </div>
                                                <span style={{ fontWeight: 600 }}>{u.username}</span>
                                            </div>
                                        </td>
                                        <td data-label="Email" style={{ color: '#666' }}>{u.email}</td>
                                        <td data-label="Role"><span className={`status-badge role-${u.role}`}>{u.role || 'user'}</span></td>
                                        <td data-label="Joined" style={{ color: '#888', fontSize: '0.85rem' }}>{u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}</td>
                                        <td data-label="Actions" className="action-btns">
                                            <button className="btn-edit" onClick={() => openEditUser(u)}>Edit</button>
                                            <button className="btn-delete" onClick={() => handleDeleteUser(u._id)}>Delete</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
                {activeTab === 'enquiries' && (
                    <div className="admin-data-section">
                        <div className="data-table-header">
                            <h2>User Enquiries & Messages</h2>
                            <p style={{ color: '#888' }}>{enquiries.length} total messages received</p>
                        </div>
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Sender Details</th>
                                    <th>Message</th>
                                    <th>Linked User</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {enquiries.map(e => (
                                    <tr key={e._id} style={{ borderLeft: e.status === 'new' ? '4px solid var(--gold)' : '4px solid transparent' }}>
                                        <td data-label="Sender">
                                            <div style={{ fontWeight: 600 }}>{e.name}</div>
                                            <div style={{ fontSize: '0.85rem', color: '#666' }}>{e.email}</div>
                                            <div style={{ fontSize: '0.85rem', color: '#666' }}>{e.phone}</div>
                                        </td>
                                        <td data-label="Message" style={{ maxWidth: '300px' }}>
                                            <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{e.subject || 'No Subject'}</div>
                                            <div style={{ fontSize: '0.85rem', color: '#555', marginTop: '4px' }}>{e.message}</div>
                                            <div style={{ fontSize: '0.75rem', color: '#999', marginTop: '8px' }}>
                                                {new Date(e.createdAt).toLocaleString('en-IN')}
                                            </div>
                                        </td>
                                        <td data-label="User">
                                            {e.user ? (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <div style={{ width: 24, height: 24, borderRadius: '50%', overflow: 'hidden', background: '#eee' }}>
                                                        {e.user.avatar ? <img src={e.user.avatar} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '👤'}
                                                    </div>
                                                    <span style={{ fontSize: '0.85rem' }}>{e.user.username}</span>
                                                </div>
                                            ) : (
                                                <span style={{ color: '#999', fontSize: '0.85rem' }}>Guest</span>
                                            )}
                                        </td>
                                        <td data-label="Status">
                                            <select
                                                className={`status-select status-${e.status}`}
                                                value={e.status}
                                                onChange={(opt) => handleStatusUpdate(e._id, opt.target.value)}
                                                style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid #ddd', fontSize: '0.85rem' }}
                                            >
                                                <option value="new">🆕 New</option>
                                                <option value="read">👀 Read</option>
                                                <option value="replied">✅ Replied</option>
                                            </select>
                                        </td>
                                        <td data-label="Actions" className="action-btns">
                                            <button className="btn-delete" onClick={() => handleDeleteEnquiry(e._id)}>Delete</button>
                                        </td>
                                    </tr>
                                ))}
                                {enquiries.length === 0 && (
                                    <tr>
                                        <td colSpan="5" style={{ textAlign: 'center', padding: '3rem', color: '#999' }}>No enquiries found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
                {activeTab === 'blogs' && (
                    <div className="admin-data-section">
                        <div className="data-table-header">
                            <h2>Manage Blog Articles</h2>
                            <button className="btn-save" onClick={() => { setAddingBlog(true); setFormData({ title: '', content: '', excerpt: '', imageUrl: '', published: true }); }} style={{ padding: '0.5rem 1.2rem', fontSize: '0.9rem', cursor: 'pointer' }}>+ Add Blog</button>
                        </div>
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Title</th>
                                    <th>Status</th>
                                    <th>Date</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {blogs.map(b => (
                                    <tr key={b._id}>
                                        <td data-label="Title">{b.title}</td>
                                        <td data-label="Status">
                                            <span className={`status-badge status-${b.published ? 'active' : 'pending'}`}>{b.published ? 'Published' : 'Draft'}</span>
                                        </td>
                                        <td data-label="Date">{new Date(b.createdAt).toLocaleDateString('en-IN')}</td>
                                        <td data-label="Actions" className="action-btns">
                                            <button className="btn-edit" onClick={() => openEditBlog(b)}>Edit</button>
                                            <button className="btn-delete" onClick={() => handleDeleteBlog(b._id)}>Delete</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </main>

            {/* Edit Listing Modal */}
            {editingListing && (
                <div className="admin-modal-overlay">
                    <div className="admin-modal">
                        <h2>Edit Listing</h2>
                        <form className="admin-form" onSubmit={saveListing}>
                            <div className="form-group">
                                <label>Property Name</label>
                                <input required type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Regular Price (₹)</label>
                                <input required type="number" value={formData.regularPrice} onChange={e => setFormData({ ...formData, regularPrice: Number(e.target.value) })} />
                            </div>
                            <div className="form-group">
                                <label>Status</label>
                                <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}>
                                    <option value="active">Active</option>
                                    <option value="pending">Pending</option>
                                    <option value="sold">Sold</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>
                                    <input type="checkbox" checked={formData.featured} onChange={e => setFormData({ ...formData, featured: e.target.checked })} style={{ width: 'auto', marginRight: '10px' }} />
                                    Featured Property
                                </label>
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn-cancel" onClick={() => setEditingListing(null)}>Cancel</button>
                                <button type="submit" className="btn-save">Save Changes</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit User Modal */}
            {editingUser && (
                <div className="admin-modal-overlay">
                    <div className="admin-modal">
                        <h2>Edit User</h2>
                        <form className="admin-form" onSubmit={saveUser}>
                            <div className="form-group">
                                <label>Username</label>
                                <input required type="text" value={formData.username} onChange={e => setFormData({ ...formData, username: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Email</label>
                                <input required type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Role</label>
                                <select value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })}>
                                    <option value="user">User</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn-cancel" onClick={() => setEditingUser(null)}>Cancel</button>
                                <button type="submit" className="btn-save">Save Changes</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Add User Modal */}
            {addingUser && (
                <div className="admin-modal-overlay">
                    <div className="admin-modal">
                        <h2>Add New User</h2>
                        <form className="admin-form" onSubmit={handleAddUser}>
                            <div className="form-group">
                                <label>Username</label>
                                <input required type="text" value={formData.username} onChange={e => setFormData({ ...formData, username: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Email Address</label>
                                <input required type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Temporary Password</label>
                                <input required type="password" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Assigned Role</label>
                                <select value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })}>
                                    <option value="user">User</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn-cancel" onClick={() => setAddingUser(false)}>Cancel</button>
                                <button type="submit" className="btn-save">Create User Account</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Add Listing Modal */}
            {addingListing && (
                <div className="admin-modal-overlay">
                    <div className="admin-modal" style={{ maxWidth: '720px', maxHeight: '90vh', overflowY: 'auto' }}>
                        <h2>Add New Property / Project</h2>
                        <form className="admin-form" onSubmit={handleAddListing}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                                    <label>Property Name *</label>
                                    <input required type="text" placeholder="e.g. NH Royal Heights" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                                </div>
                                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                                    <label>Project Name (Optional)</label>
                                    <input type="text" placeholder="e.g. NH Township Phase 2" value={formData.projectName} onChange={e => setFormData({ ...formData, projectName: e.target.value })} />
                                </div>
                                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                                    <label>Description *</label>
                                    <textarea required rows={3} placeholder="Describe this property..." style={{ width: '100%', padding: '0.8rem', border: '1px solid #ccc', borderRadius: '6px', fontFamily: 'inherit', fontSize: '1rem' }} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label>Address *</label>
                                    <input required type="text" placeholder="Full address" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label>City / Location *</label>
                                    <input required type="text" placeholder="e.g. Mumbai" value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label>Regular Price (₹) *</label>
                                    <input required type="number" min="0" value={formData.regularPrice} onChange={e => setFormData({ ...formData, regularPrice: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        Discount Price (₹)
                                        {!formData.offer && <span style={{ color: '#999', fontWeight: 400, fontSize: '0.8rem' }}>(enable Special Offer below)</span>}
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        disabled={!formData.offer}
                                        value={formData.offer ? (formData.discountPrice || '') : ''}
                                        placeholder={formData.offer ? 'Enter discounted price' : 'Enable Special Offer first'}
                                        style={{ opacity: formData.offer ? 1 : 0.45 }}
                                        onChange={e => setFormData({ ...formData, discountPrice: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Bedrooms *</label>
                                    <input required type="number" min="0" value={formData.bedrooms} onChange={e => setFormData({ ...formData, bedrooms: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label>Bathrooms *</label>
                                    <input required type="number" min="0" value={formData.bathrooms} onChange={e => setFormData({ ...formData, bathrooms: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label>Area (sq. ft)</label>
                                    <input type="number" min="0" value={formData.area} onChange={e => setFormData({ ...formData, area: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label>Type *</label>
                                    <select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })}>
                                        <option value="sale">For Sale</option>
                                        <option value="rent">For Rent</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Category *</label>
                                    <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>
                                        <option value="apartment">Apartment</option>
                                        <option value="villa">Villa</option>
                                        <option value="plot">Plot</option>
                                        <option value="commercial">Commercial</option>
                                        <option value="township">Township</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Status</label>
                                    <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}>
                                        <option value="active">Active</option>
                                        <option value="pending">Pending</option>
                                        <option value="sold">Sold</option>
                                    </select>
                                </div>
                                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                                    <label>Property Images *</label>
                                    <ImageUploader
                                        urls={formData.imageUrls || []}
                                        onChange={urls => setFormData({ ...formData, imageUrls: urls })}
                                    />
                                    {(!formData.imageUrls || formData.imageUrls.length === 0) && (
                                        <p style={{ color: '#c00', fontSize: '0.8rem', marginTop: '4px' }}>⚠ Please upload at least one image before publishing.</p>
                                    )}
                                </div>
                                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                                    <label>Amenities (comma-separated)</label>
                                    <input type="text" placeholder="e.g. Pool, Gym, Security" value={formData.amenities} onChange={e => setFormData({ ...formData, amenities: e.target.value })} />
                                </div>
                                <div className="form-group" style={{ gridColumn: '1 / -1', display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 500, cursor: 'pointer' }}>
                                        <input type="checkbox" checked={formData.featured} onChange={e => setFormData({ ...formData, featured: e.target.checked })} style={{ width: 'auto' }} /> Featured
                                    </label>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 500, cursor: 'pointer' }}>
                                        <input type="checkbox" checked={formData.furnished} onChange={e => setFormData({ ...formData, furnished: e.target.checked })} style={{ width: 'auto' }} /> Furnished
                                    </label>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 500, cursor: 'pointer' }}>
                                        <input type="checkbox" checked={formData.parking} onChange={e => setFormData({ ...formData, parking: e.target.checked })} style={{ width: 'auto' }} /> Parking
                                    </label>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 500, cursor: 'pointer' }}>
                                        <input type="checkbox" checked={formData.offer} onChange={e => {
                                            const checked = e.target.checked;
                                            setFormData({ ...formData, offer: checked, discountPrice: checked ? formData.discountPrice : '' });
                                        }} style={{ width: 'auto' }} /> Special Offer (enables discount price)
                                    </label>
                                </div>
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn-cancel" onClick={() => setAddingListing(false)}>Cancel</button>
                                <button type="submit" className="btn-save">🏠 Publish Property</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Blog Modal */}
            {editingBlog && (
                <div className="admin-modal-overlay">
                    <div className="admin-modal">
                        <h2>Edit Blog</h2>
                        <form className="admin-form" onSubmit={saveBlog}>
                            <div className="form-group">
                                <label>Title</label>
                                <input required type="text" value={formData.title || ''} onChange={e => setFormData({ ...formData, title: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Content</label>
                                <textarea required rows={5} value={formData.content || ''} onChange={e => setFormData({ ...formData, content: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Image URL</label>
                                <input type="text" value={formData.imageUrl || ''} onChange={e => setFormData({ ...formData, imageUrl: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>
                                    <input type="checkbox" checked={formData.published} onChange={e => setFormData({ ...formData, published: e.target.checked })} style={{ width: 'auto', marginRight: '10px' }} />
                                    Published
                                </label>
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn-cancel" onClick={() => setEditingBlog(null)}>Cancel</button>
                                <button type="submit" className="btn-save">Save Changes</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Add Blog Modal */}
            {addingBlog && (
                <div className="admin-modal-overlay">
                    <div className="admin-modal">
                        <h2>Add New Blog</h2>
                        <form className="admin-form" onSubmit={handleAddBlog}>
                            <div className="form-group">
                                <label>Title</label>
                                <input required type="text" value={formData.title || ''} onChange={e => setFormData({ ...formData, title: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Excerpt</label>
                                <input type="text" value={formData.excerpt || ''} onChange={e => setFormData({ ...formData, excerpt: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Content</label>
                                <textarea required rows={5} value={formData.content || ''} onChange={e => setFormData({ ...formData, content: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Cover Image URL</label>
                                <input type="text" value={formData.imageUrl || ''} onChange={e => setFormData({ ...formData, imageUrl: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>
                                    <input type="checkbox" checked={!!formData.published} onChange={e => setFormData({ ...formData, published: e.target.checked })} style={{ width: 'auto', marginRight: '10px' }} />
                                    Publish Immediately
                                </label>
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn-cancel" onClick={() => setAddingBlog(false)}>Cancel</button>
                                <button type="submit" className="btn-save">Create Blog</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Luxurious Exit Animation Overlay */}
            {isExiting && (
                <div className="admin-exit-overlay">
                    <div className="exit-loader-container">
                        <div className="exit-spinner"></div>
                        <h2 className="exit-text">Returning to NH realEState</h2>
                    </div>
                </div>
            )}
        </div>
    );
}
