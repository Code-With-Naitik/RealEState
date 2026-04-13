import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { listingsAPI, blogAPI } from '../utility/api.jsx';
import { mockBlogs } from '../utility/blogData.jsx';
import ListingCard from './Listing_card.jsx';
import '../css/HomePage.css';

const HERO_SLIDES = [
    {
        bg: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1600&q=80',
        title: 'Your Trusted Real Estate Partner',
        sub: 'Discover premium properties across Indore\'s finest locations',
    },
    {
        bg: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1600&q=80',
        title: 'Find Your Dream Home Today',
        sub: 'Luxury villas, modern apartments & prime investment plots',
    },
    {
        bg: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1600&q=80',
        title: 'Invest in Indore\'s Future',
        sub: 'Strategic locations on Super Corridor, Airport Road & Economic Corridor',
    },
];

const STATS = [
    { value: 15, suffix: '+', label: 'Years of Experience' },
    { value: 500, suffix: '+', label: 'Happy Buyers' },
    { value: 50, suffix: '+', label: 'Channel Partners' },
    { value: 10, suffix: 'M+', label: 'Sqft Area Sold' },
];

function AnimatedCounter({ end, duration = 2000, suffix = '' }) {
    const [count, setCount] = useState(0);
    const countRef = useRef(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.disconnect();
                }
            },
            { threshold: 0.1 }
        );
        if (countRef.current) observer.observe(countRef.current);
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        if (!isVisible) return;
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            // Ease-out curve
            const easeProgress = 1 - Math.pow(1 - progress, 4);
            setCount(Math.floor(easeProgress * end));
            
            if (progress < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
    }, [isVisible, end, duration]);

    return <span ref={countRef}>{count}{suffix}</span>;
}


const SERVICES = [
    { icon: '🏠', title: 'Buy Property', desc: 'Find your perfect home from our curated portfolio of premium residential and commercial properties.' },
    { icon: '💰', title: 'Sell Property', desc: 'Get the best value for your property with our expert marketing and wide network of buyers.' },
    { icon: '🏦', title: 'Home Loans', desc: 'We partner with leading banks — HDFC, ICICI, SBI — to help you secure the best loan deals.' },
    { icon: '⚖️', title: 'Legal Assistance', desc: 'Complete legal support for registration, documentation, and compliance at every step.' },
    { icon: '🔑', title: 'Builder Services', desc: 'Dedicated builder liaison for new projects, site visits, and possession coordination.' },
    { icon: '📊', title: 'Investment Advisory', desc: 'Strategic real estate investment guidance for maximum returns in Indore\'s growth corridors.' },
];

const PROCESS_STEPS = [
    { num: '01', title: 'Site Visits & Walk', desc: 'We schedule property tours at your convenience' },
    { num: '02', title: 'Deals & Negotiation', desc: 'Expert negotiation to get you the best price' },
    { num: '03', title: 'Documentation', desc: 'Complete buying & loan paperwork assistance' },
    { num: '04', title: 'Registry & Legal', desc: 'Seamless legal compliance and registration' },
    { num: '05', title: 'Project Completion', desc: 'We ensure quality delivery as promised' },
    { num: '06', title: 'Key Handover', desc: 'Possession and post-handover support' },
];

const TESTIMONIALS = [
    { name: 'Rajendra Soni', role: 'Kukshi Jewellers', text: 'Had a great experience dealing with NH realEState. They guided me with a focused approach in buying plots in Krishna Vatika. Wishing them great success!' },
    { name: 'Chandrakant Mehta', role: 'Retired Government Teacher', text: 'I bought a plot in Smart Town in 2022 and after seeing the development and construction quality I am really satisfied with my investment.' },
    { name: 'Bhawna Gupta', role: 'Indore', text: 'NH realEState suggested Om Aangan — a very well executed closed campus residential township at MR5. Truly satisfied with the investment.' },
    { name: 'Anushree Bakliwal', role: 'IDEMIA French MNC, Mumbai', text: 'Booked a plot in Kalindi Corridor at Super Corridor. Mr Ayush has friendly and helpful behaviour, explained all amenities and future aspects in detail.' },
    { name: 'Puneet Agrawal', role: 'Chartered Accountant, Indore', text: 'The team is very cooperative and helpful in every aspect. They helped me buy the right property at the right price.' },
];

const BANKS = [
    { name: 'HDFC Bank', logo: 'https://upload.wikimedia.org/wikipedia/commons/2/28/HDFC_Bank_Logo.svg' },
    { name: 'ICICI Bank', logo: 'https://upload.wikimedia.org/wikipedia/commons/1/12/ICICI_Bank_Logo.svg' },
    { name: 'State Bank of India', logo: 'https://upload.wikimedia.org/wikipedia/commons/c/cc/SBI-logo.svg' },
];

export default function Home() {
    const [slide, setSlide] = useState(0);
    const [listings, setListings] = useState([]);
    const [blogs, setBlogs] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchType, setSearchType] = useState('');
    const [testimonialIdx, setTestimonialIdx] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        listingsAPI.getAll({ featured: true, limit: 6 })
            .then(r => setListings(r.data.listings || []))
            .catch(() => { });
        blogAPI.getAll()
            .then(r => {
                const items = r.data?.blogs || r.data;
                const fetchedBlogs = Array.isArray(items) && items.length > 0 ? items : mockBlogs;
                setBlogs(fetchedBlogs.slice(0, 3));
            })
            .catch(() => {
                setBlogs(mockBlogs.slice(0, 3));
            });
    }, []);

    useEffect(() => {
        const t = setInterval(() => setSlide(s => (s + 1) % HERO_SLIDES.length), 5000);
        return () => clearInterval(t);
    }, []);

    useEffect(() => {
        const t = setInterval(() => setTestimonialIdx(i => (i + 1) % TESTIMONIALS.length), 4000);
        return () => clearInterval(t);
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        const params = new URLSearchParams();
        if (searchQuery) params.set('search', searchQuery);
        if (searchType) params.set('type', searchType);
        navigate(`/listings?${params.toString()}`);
    };

    return (
        <div className="home">
            {/* HERO */}
            <section className="hero">
                {HERO_SLIDES.map((s, i) => (
                    <div
                        key={i}
                        className={`hero-slide ${i === slide ? 'active' : ''}`}
                    >
                        <img src={s.bg} alt="hero" className="hero-img" />
                    </div>
                ))}
                <div className="hero-overlay" />
                <div className="hero-content container">
                    <div className="hero-tag">Est. 2008 • Indore, India</div>
                    <h1 className="hero-title">{HERO_SLIDES[slide].title}</h1>
                    <p className="hero-sub">{HERO_SLIDES[slide].sub}</p>

                    <form className="search-bar" onSubmit={handleSearch}>
                        <input
                            type="text"
                            placeholder="Search by location, project name..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                        />
                        <select value={searchType} onChange={e => setSearchType(e.target.value)}>
                            <option value="">All Types</option>
                            <option value="sale">For Sale</option>
                            <option value="rent">For Rent</option>
                        </select>
                        <button type="submit" className="search-btn">Search</button>
                    </form>

                    <div className="hero-cats">
                        {['apartment', 'villa', 'plot', 'township'].map(cat => (
                            <Link key={cat} to={`/listings?category=${cat}`} className="hero-cat">
                                {cat === 'apartment' ? '🏢' : cat === 'villa' ? '🏡' : cat === 'plot' ? '🗺️' : '🏘️'}
                                <span>{cat.charAt(0).toUpperCase() + cat.slice(1)}</span>
                            </Link>
                        ))}
                    </div>
                </div>

                <div className="hero-dots">
                    {HERO_SLIDES.map((_, i) => (
                        <button
                            key={i}
                            className={`dot ${i === slide ? 'active' : ''}`}
                            onClick={() => setSlide(i)}
                        />
                    ))}
                </div>
            </section>

            {/* STATS */}
            <section className="stats-bar">
                <div className="container stats-grid">
                    {STATS.map((s, i) => (
                        <div key={i} className="stat-item">
                            <div className="stat-value">
                                <AnimatedCounter end={s.value} suffix={s.suffix} />
                            </div>
                            <div className="stat-label">{s.label}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ABOUT */}
            <section className="section-pad about-section">
                <div className="container about-grid">
                    <div className="about-image-wrap">
                        <img
                            src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=700&q=80"
                            alt="About NH realEState"
                        />
                        <div className="about-badge">
                            <span className="ab-number">15+</span>
                            <span className="ab-text">Years of Trust</span>
                        </div>
                    </div>
                    <div className="about-text">
                        <div className="section-label">About Us</div>
                        <h2 className="section-title">NH realEState — A Real Estate Marketing Company</h2>
                        <p>
                            NH realEState is one of the best marketing companies in Indore. We have been providing real estate services to our valued customers since 2008. Our in-depth local market knowledge helps customers find their perfect dream home or investment property.
                        </p>
                        <p style={{ marginTop: 16 }}>
                            Our specialization is in prime locations such as the <strong>Indore-Dewas bypass</strong>, economic corridor, super corridor, Indore-Ujjain road, and airport road.
                        </p>
                        <div className="about-highlights">
                            <div className="ah-item">✓ RERA Registered Projects</div>
                            <div className="ah-item">✓ Transparent Dealings</div>
                            <div className="ah-item">✓ End-to-End Support</div>
                            <div className="ah-item">✓ Bank Loan Assistance</div>
                        </div>
                        <Link to="/about" className="btn-primary" style={{ marginTop: 32 }}>More About Us</Link>
                    </div>
                </div>
            </section>

            {/* INDORE INVESTMENT */}
            <section className="indore-section">
                <div className="indore-bg" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=1400&q=80')" }} />
                <div className="indore-overlay" />
                <div className="container indore-content">
                    <div className="section-label" style={{ color: 'var(--gold)' }}>
                        <span style={{ background: 'var(--gold)' }}></span>
                        Investment Opportunity
                    </div>
                    <h2 className="section-title light">Indore — A New Hub for<br />Property Investment</h2>
                    <p className="indore-desc">
                        Indore's perfect combination of location, growth, infrastructure, and affordability makes it a promising real estate investment market. Indore, a TIER II city, has established itself as the cleanest city in India and is the only city with both IIT and IIM.
                    </p>
                    <div className="indore-stats">
                        {['#1 Cleanest City', 'IIT & IIM City', 'Fastest Growing', 'Smart City'].map(t => (
                            <div key={t} className="indore-tag">{t}</div>
                        ))}
                    </div>
                    <Link to="/listings" className="btn-primary">Explore Properties</Link>
                </div>
            </section>

            {/* SERVICES */}
            <section className="section-pad">
                <div className="container">
                    <div style={{ textAlign: 'center', marginBottom: 48 }}>
                        <div className="section-label" style={{ justifyContent: 'center' }}>What We Offer</div>
                        <h2 className="section-title">Our Services</h2>
                    </div>
                    <div className="services-grid">
                        {SERVICES.map((s, i) => (
                            <div key={i} className="service-card">
                                <div className="service-icon">{s.icon}</div>
                                <h3>{s.title}</h3>
                                <p>{s.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FEATURED LISTINGS */}
            <section className="section-pad" style={{ background: 'var(--cream-dark)' }}>
                <div className="container">
                    <div className="section-header">
                        <div>
                            <div className="section-label">Explore</div>
                            <h2 className="section-title">Our Projects</h2>
                        </div>
                        <Link to="/listings" className="btn-outline">View All</Link>
                    </div>
                    {listings.length > 0 ? (
                        <div className="listings-grid">
                            {listings.map(l => <ListingCard key={l._id} listing={l} />)}
                        </div>
                    ) : (
                        <div className="empty-listings">
                            <p>No listings yet. <Link to="/create-listing" style={{ color: 'var(--gold)' }}>Add the first one!</Link></p>
                        </div>
                    )}
                </div>
            </section>

            {/* CTA BANNER */}
            <section className="cta-section">
                <div className="container cta-inner">
                    <img src="https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=500&q=80" alt="Dream Property" className="cta-img" />
                    <div className="cta-text">
                        <h2>Find Your Dream Property Today!</h2>
                        <p>
                            Explore the best properties with ease. Whether buying, selling, or investing — our expert team is here every step of the way.
                        </p>
                        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                            <a href="tel:+91+91 9999999999" className="btn-primary">📞 Call Now</a>
                            <Link to="/contact" className="btn-outline" style={{ borderColor: 'var(--gold)', color: 'var(--gold)' }}>Contact Us</Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* PROCESS */}
            <section className="section-pad">
                <div className="container">
                    <div style={{ textAlign: 'center', marginBottom: 56 }}>
                        <div className="section-label" style={{ justifyContent: 'center' }}>How It Works</div>
                        <h2 className="section-title">Experience with Us</h2>
                    </div>
                    <div className="process-grid">
                        {PROCESS_STEPS.map((s, i) => (
                            <div key={i} className="process-step">
                                <div className="step-num">{s.num}</div>
                                <h4>{s.title}</h4>
                                <p>{s.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* TESTIMONIALS */}
            <section className="section-pad testimonials-section">
                <div className="container">
                    <div style={{ textAlign: 'center', marginBottom: 48 }}>
                        <div className="section-label" style={{ justifyContent: 'center' }}>What Clients Say</div>
                        <h2 className="section-title light">Customer Reviews</h2>
                    </div>
                    <div className="testimonials-slider">
                        {TESTIMONIALS.map((t, i) => (
                            <div key={i} className={`testimonial-card ${i === testimonialIdx ? 'active' : ''}`}>
                                <div className="stars">★★★★★</div>
                                <p className="testimonial-text">"{t.text}"</p>
                                <div className="testimonial-author">
                                    <div className="author-avatar">{t.name.charAt(0)}</div>
                                    <div>
                                        <div className="author-name">{t.name}</div>
                                        <div className="author-role">{t.role}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="testimonial-dots">
                        {TESTIMONIALS.map((_, i) => (
                            <button
                                key={i}
                                className={`dot ${i === testimonialIdx ? 'active' : ''}`}
                                onClick={() => setTestimonialIdx(i)}
                                style={{ '--dot-color': 'var(--gold)' }}
                            />
                        ))}
                    </div>
                </div>
            </section>

            {/* BANKING PARTNERS */}
            <section className="section-pad">
                <div className="container">
                    <div style={{ textAlign: 'center', marginBottom: 40 }}>
                        <div className="section-label" style={{ justifyContent: 'center' }}>Finance Partners</div>
                        <h2 className="section-title">Our Banking & Finance Partners</h2>
                    </div>
                    <div className="banks-track-wrapper">
                        {BANKS.map((b, i) => (
                            <div key={i} className="bank-logo-item">
                                <img src={b.logo} alt={b.name} />
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* BLOG */}
            {blogs.length > 0 && (
                <section className="section-pad" style={{ background: 'var(--cream-dark)' }}>
                    <div className="container">
                        <div className="section-header">
                            <div>
                                <div className="section-label">Latest</div>
                                <h2 className="section-title">Our Blog</h2>
                            </div>
                            <Link to="/blog" className="btn-outline">View All</Link>
                        </div>
                        <div className="blog-grid">
                            {blogs.map(b => (
                                <Link key={b._id} to={`/blog/${b._id}`} className="blog-card">
                                    <div className="blog-card-img">
                                        <img src={b.imageUrl || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=500'} alt={b.title} />
                                    </div>
                                    <div className="blog-card-body">
                                        <div className="blog-date">{new Date(b.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                                        <h3>{b.title}</h3>
                                        <p>{b.excerpt || b.content?.slice(0, 100)}...</p>
                                        <span className="read-more">Read More →</span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            )}
        </div>
    );
}