import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../css/About.css';

export default function About() {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="about-page">
            <div className="about-page-hero">
                <div className="container">
                    <h1>About NH realEState</h1>
                    <p>Elevating Central India's real estate landscape through trust, transparency, and tailored investments.</p>
                </div>
            </div>

            <section className="about-story-section">
                <div className="container about-story-grid">
                    <div className="about-story-img">
                        <img src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80" alt="NH realEState Office" />
                        <div className="about-story-badge">
                            <strong>15+</strong>
                            <span>Years of Trust</span>
                        </div>
                    </div>
                    <div className="about-story-content">
                        <div className="section-label">Our Story</div>
                        <h2>Pioneering Real Estate Marketing Since 2008</h2>
                        <p>
                            In 2008, NH realEState was founded with a single mission: to redefine the property buying experience in Indore. We recognized that buying a property isn't just about brick and mortar—it's about emotional connection and long-term financial security.
                        </p>
                        <p>
                            Today, we stand as one of Central India's premier real estate consultancy firms. Specifying heavily in regions like the Super Corridor, MR-10, and AB Bypass Road, we bridge the gap between world-class developers and astute home buyers.
                        </p>
                        <p>
                            From plotting your first commercial investment to handing over the keys to your luxury dream villa, our end-to-end support ensures absolutely zero friction.
                        </p>
                        <div style={{ display: 'flex', gap: 16, marginTop: 32 }}>
                            <Link to="/listings" className="btn-primary">View Our Projects</Link>
                            <Link to="/contact" className="btn-outline">Talk to an Expert</Link>
                        </div>
                    </div>
                </div>
            </section>

            <section className="about-stats-section">
                <div className="container about-stats-grid">
                    <div className="about-stat-card">
                        <div className="about-stat-number">15+</div>
                        <div className="about-stat-label">Years Experience</div>
                    </div>
                    <div className="about-stat-card">
                        <div className="about-stat-number">500+</div>
                        <div className="about-stat-label">Happy Families</div>
                    </div>
                    <div className="about-stat-card">
                        <div className="about-stat-number">50+</div>
                        <div className="about-stat-label">Channel Partners</div>
                    </div>
                    <div className="about-stat-card">
                        <div className="about-stat-number">10M+</div>
                        <div className="about-stat-label">Sq. Ft. Sold</div>
                    </div>
                </div>
            </section>

            <section className="about-mission-section">
                <div className="container">
                    <div style={{ textAlign: 'center', marginBottom: 50 }}>
                        <div className="section-label" style={{ justifyContent: 'center' }}>Purpose & Values</div>
                        <h2 className="section-title">Why NH realEState?</h2>
                    </div>

                    <div className="mission-vision-grid">
                        <div className="mv-card">
                            <div className="mv-icon">🕊️</div>
                            <h3>Our Mission</h3>
                            <p>
                                To empower home buyers and investors with transparent, data-driven market insights. We strive to offer legally sound, RERA-compliant properties that guarantee high appreciation and peace of mind across generations.
                            </p>
                        </div>
                        <div className="mv-card">
                            <div className="mv-icon">🔭</div>
                            <h3>Our Vision</h3>
                            <p>
                                To become India's most trusted and technically innovative real estate consultancy. We foresee a landscape where buying real estate is as effortless, secure, and delightful as purchasing a consumer good from a trusted brand.
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
