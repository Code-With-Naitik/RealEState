import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { blogAPI } from '../utility/api.jsx';
import '../css/Blog.css';

export default function Blog() {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        blogAPI.getAll()
            .then(res => {
                const fetched = res.data?.blogs || res.data;
                setBlogs(Array.isArray(fetched) ? fetched : []);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);
    return (
        <div className="blog-page">
            <div className="blog-header-banner">
                <div className="container">
                    <h1>Real Estate Insights & News</h1>
                    <p>Expert advice, market trends, and investment tips for Indore's property market.</p>
                </div>
            </div>

            <div className="container section-pad">
                <div className="blog-grid-full">
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '3rem', width: '100%', gridColumn: '1 / -1' }}>Loading insights...</div>
                    ) : blogs.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '3rem', width: '100%', gridColumn: '1 / -1' }}>No articles published yet.</div>
                    ) : blogs.map((b) => (
                        <Link key={b._id} to={`/blog/${b._id}`} className="blog-card">
                            <div className="blog-card-img">
                                <img src={b.imageUrl} alt={b.title} />
                                <span className="blog-category-badge">{b.category}</span>
                            </div>
                            <div className="blog-card-body">
                                <div className="blog-meta">
                                    <span className="blog-date">{new Date(b.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                    <span className="blog-author">By {b.author}</span>
                                </div>
                                <h3>{b.title}</h3>
                                <p>{b.excerpt}</p>
                                <span className="read-more">Read Full Article →</span>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
