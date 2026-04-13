import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/auth_Context.jsx';
import Logo from '../assets/logo.png';
import '../css/Navbar.css';

export default function Navbar() {
    const { user, signout } = useAuth();
    const [scrolled, setScrolled]   = useState(false);
    const [menuOpen, setMenuOpen]   = useState(false);
    const navigate  = useNavigate();
    const location  = useLocation();

    const isAdminRoute = location.pathname.startsWith('/admin');

    // Scroll listener
    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 60);
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    // Lock body scroll when mobile sidebar is open
    useEffect(() => {
        if (menuOpen) {
            document.body.classList.add('menu-open');
        } else {
            document.body.classList.remove('menu-open');
        }
        return () => document.body.classList.remove('menu-open');
    }, [menuOpen]);

    // Close sidebar on route change
    useEffect(() => {
        setMenuOpen(false);
    }, [location.pathname]);

    const closeMenu = () => setMenuOpen(false);
    const toggleMenu = () => setMenuOpen(prev => !prev);

    const handleSignout = async () => {
        closeMenu();
        await signout();
        navigate('/');
    };

    // Standalone admin dashboard — no navbar
    if (isAdminRoute) return null;

    const solidNavPaths = [
        '/profile', '/privacy', '/terms', '/sign-in', '/sign-up',
        '/listings', '/create-listing', '/blog', '/contact', '/about'
    ];
    const isSolidPath = solidNavPaths.some(p => location.pathname.startsWith(p));

    return (
        <>
            {/* ── Backdrop overlay (mobile) ── */}
            <div
                className={`menu-overlay ${menuOpen ? 'visible' : ''}`}
                onClick={closeMenu}
            />

            <nav className={`navbar ${scrolled || isSolidPath ? 'scrolled' : ''}`}>
                <div className="nav-inner container">

                    {/* Logo */}
                    <Link to="/" className="nav-logo" onClick={closeMenu}>
                        <img src={Logo} alt="NH RealEState" className="logo-img" />
                        <div>
                            <div className="logo-main">NH realEState</div>
                            <div className="logo-sub">Your Trusted Partner</div>
                        </div>
                    </Link>

                    {/* ── Sidebar / Nav links ── */}
                    <div className={`nav-links ${menuOpen ? 'open' : ''}`}>

                        {/* Sidebar header (mobile only) */}
                        <div className="mobile-menu-header">
                            <div className="mobile-logo-wrap">
                                <img src={Logo} alt="NH RealEState" className="logo-img" />
                                <div className="logo-main">NH realEState</div>
                            </div>
                            <button
                                className="close-menu"
                                onClick={closeMenu}
                                aria-label="Close menu"
                            >
                                ✕
                            </button>
                        </div>


                        {/* Navigation links */}
                        <div className="mobile-links-container">
                            <NavLink to="/"         end onClick={closeMenu}>Home</NavLink>
                            <NavLink to="/listings"     onClick={closeMenu}>Our Projects</NavLink>
                            <NavLink to="/about"        onClick={closeMenu}>About Us</NavLink>
                            <NavLink to="/blog"         onClick={closeMenu}>Blog Content</NavLink>
                            <NavLink to="/contact"      onClick={closeMenu}>Contact Desk</NavLink>
                        </div>

                        {/* Sidebar footer – contact info (mobile only) */}
                        <div className="mobile-menu-footer">
                            <div className="sidebar-foot-title">Get in Touch</div>
                            <a href="tel:+919999999999"       className="mobile-phone">📞 +91 9999999999</a>
                            <a href="mailto:info@nhrealestate.in" className="mobile-email">✉️ info@nhrealestate.in</a>
                        </div>
                    </div>

                    {/* ── Right-side actions ── */}
                    <div className="nav-actions">
                        {/* Phone (desktop only) */}
                        <a href="tel:+919999999999" className="nav-phone">
                            <span className="phone-icon">📞</span>
                            <span>+91 9999999999</span>
                        </a>

                        {/* Auth area */}
                        {user ? (
                            <div className="nav-user">
                                <Link to="/profile" className="user-avatar">
                                    <img src={user.avatar} alt={user.username} />
                                </Link>
                                <div className="user-dropdown">
                                    <Link to="/profile">My Profile</Link>
                                    <Link to="/create-listing">Add Listing</Link>
                                    <button onClick={handleSignout}>Sign Out</button>
                                </div>
                            </div>
                        ) : (
                            <Link to="/sign-in" className="btn-primary">Sign In</Link>
                        )}

                        {/* Hamburger – animates to ✕ when open */}
                        <button
                            className={`hamburger ${menuOpen ? 'is-open' : ''}`}
                            onClick={toggleMenu}
                            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
                            aria-expanded={menuOpen}
                        >
                            <span />
                            <span />
                            <span />
                        </button>
                    </div>
                </div>
            </nav>
        </>
    );
}