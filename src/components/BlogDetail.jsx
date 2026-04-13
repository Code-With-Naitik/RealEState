import { useParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { blogAPI } from '../utility/api.jsx';
import '../css/BlogDetail.css';

export default function BlogDetail() {
    const { id } = useParams();
    const [blog, setBlog] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        window.scrollTo(0, 0);
        blogAPI.getOne(id)
            .then(res => {
                setBlog(res.data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [id]);

    if (loading) {
        return <div className="container section-pad text-center">Loading article...</div>;
    }

    if (!blog) {
        return (
            <div className="container section-pad pattern-bg text-center">
                <h2>Article Not Found</h2>
                <Link to="/blog" className="btn-primary" style={{ marginTop: '20px' }}>Back to Blogs</Link>
            </div>
        );
    }

    return (
        <div className="blog-detail-page pattern-bg">
            <div className="container">
                <article className="blog-article-container">
                    <header className="blog-detail-header">
                        <span className="blog-category">{blog.category}</span>
                        <h1 className="blog-detail-title">{blog.title}</h1>
                        <div className="blog-meta-large">
                            <span className="author">Written by <strong>{blog.author}</strong></span>
                            <span className="date">{new Date(blog.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                        </div>
                    </header>

                    <div className="blog-featured-image">
                        <img src={blog.imageUrl} alt={blog.title} />
                    </div>

                    <div className="blog-content styled-content">
                        {blog.content.split('\n').map((paragraph, index) => {
                            if (!paragraph.trim()) return null;
                            if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
                                return <h3 key={index}>{paragraph.replace(/\*\*/g, '')}</h3>;
                            }
                            if (paragraph.startsWith('-')) {
                                return <li key={index} style={{ marginLeft: 20, marginBottom: 10 }}>{paragraph.replace('-', '').trim()}</li>;
                            }
                            // Make inline bold rendering
                            const renderText = () => {
                                const parts = paragraph.split(/(\*\*.*?\*\*)/g);
                                return parts.map((part, i) => {
                                    if (part.startsWith('**') && part.endsWith('**')) {
                                        return <strong key={i}>{part.replace(/\*\*/g, '')}</strong>;
                                    }
                                    return part;
                                });
                            };
                            return <p key={index}>{renderText()}</p>;
                        })}
                    </div>
                </article>
            </div>
        </div>
    );
}
