import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { listingsAPI } from '../utility/api.jsx';
import ListingCard from './Listing_card.jsx';
import '../css/Listingpage_with_Fillter.css';

const CATEGORIES = [
    { val: '',           label: 'All',        icon: '🏠' },
    { val: 'apartment',  label: 'Apartment',  icon: '🏢' },
    { val: 'villa',      label: 'Villa',      icon: '🏡' },
    { val: 'plot',       label: 'Plot',       icon: '🌿' },
    { val: 'commercial', label: 'Commercial', icon: '🏪' },
    { val: 'township',   label: 'Township',   icon: '🏘️' },
];

const LOCATIONS = [
    '', 'Super Corridor', 'Airport Road', 'MR-10',
    'Bypass Road', 'Vijay Nagar', 'Scheme 78',
];

export default function Listings() {
    const [searchParams] = useSearchParams();

    const [listings, setListings] = useState([]);
    const [total,    setTotal]    = useState(0);
    const [pages,    setPages]    = useState(1);
    const [loading,  setLoading]  = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const [filters, setFilters] = useState({
        search:   searchParams.get('search')   || '',
        type:     searchParams.get('type')     || '',
        category: searchParams.get('category') || '',
        location: searchParams.get('location') || '',
        minPrice: '',
        maxPrice: '',
        page: 1,
    });

    /* ─── Fetch ─── */
    const fetchListings = async (f = filters) => {
        setLoading(true);
        try {
            const params = { limit: 12, page: f.page };
            if (f.search)                          params.search   = f.search;
            if (f.type)                            params.type     = f.type;
            if (f.category && f.category !== '')   params.category = f.category;
            if (f.location && f.location !== '')   params.location = f.location;
            if (f.minPrice)                        params.minPrice = f.minPrice;
            if (f.maxPrice)                        params.maxPrice = f.maxPrice;
            const res = await listingsAPI.getAll(params);
            setListings(res.data.listings || []);
            setTotal(res.data.total || 0);
            setPages(res.data.pages || 1);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchListings(); }, []);

    /* ─── Helpers ─── */
    const apply = (key, val) => {
        const nf = { ...filters, [key]: val, page: 1 };
        setFilters(nf);
        fetchListings(nf);
    };

    const applyPrice = () => fetchListings({ ...filters, page: 1 });

    const reset = () => {
        const nf = { search: '', type: '', category: '', location: '', minPrice: '', maxPrice: '', page: 1 };
        setFilters(nf);
        fetchListings(nf);
    };

    const handleSearch = (e) => { e.preventDefault(); fetchListings({ ...filters, page: 1 }); };

    /* ─── Render ─── */
    return (
        <div className="listings-page">

            {/* Hero */}
            <div className="page-hero">
                <div className="page-hero-overlay" />
                <div className="container page-hero-content">
                    <h1>Our Properties</h1>
                    <p>Explore premium properties across Indore's finest locations</p>
                </div>
            </div>

            <div className="container listings-layout">

                {/* ── Sidebar ── */}
                <aside className={`filters-sidebar ${!sidebarOpen ? 'collapsed' : ''}`}>

                    {/* Mobile toggle */}
                    <button
                        className="filter-toggle-btn"
                        onClick={() => setSidebarOpen(o => !o)}
                    >
                        🔍 {sidebarOpen ? 'Hide Filters' : 'Show Filters'}
                    </button>

                    <div className="filter-panel">
                        {/* Header */}
                        <div className="fp-header">
                            <h3>🔧 Filter Properties</h3>
                            <button className="fp-clear-btn" onClick={reset}>Clear All</button>
                        </div>

                        <div className="fp-body">

                            {/* Search */}
                            <div className="fg">
                                <span className="fg-label">Search</span>
                                <form className="fg-search" onSubmit={handleSearch}>
                                    <input
                                        type="text"
                                        placeholder="Location, project name…"
                                        value={filters.search}
                                        onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
                                    />
                                    <button type="submit">🔍</button>
                                </form>
                            </div>

                            <div className="fp-divider" />

                            {/* Property Type */}
                            <div className="fg">
                                <span className="fg-label">Property Type</span>
                                <div className="fg-type-tabs">
                                    {[
                                        { val: '',     label: 'All'      },
                                        { val: 'sale', label: 'For Sale' },
                                        { val: 'rent', label: 'For Rent' },
                                    ].map(t => (
                                        <button
                                            key={t.val}
                                            className={`fg-type-tab ${filters.type === t.val ? 'active' : ''}`}
                                            onClick={() => apply('type', t.val)}
                                        >
                                            {t.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="fp-divider" />

                            {/* Category */}
                            <div className="fg">
                                <span className="fg-label">Category</span>
                                <div className="fg-cats">
                                    {CATEGORIES.map(c => (
                                        <button
                                            key={c.val}
                                            className={`fg-cat-btn ${filters.category === c.val ? 'active' : ''}`}
                                            onClick={() => apply('category', c.val)}
                                        >
                                            <span className="fg-cat-dot" />
                                            <span style={{ marginRight: 4 }}>{c.icon}</span>
                                            {c.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="fp-divider" />

                            {/* Location */}
                            <div className="fg">
                                <span className="fg-label">Location</span>
                                <select
                                    className="fg-select"
                                    value={filters.location}
                                    onChange={e => apply('location', e.target.value)}
                                >
                                    <option value="">All Locations</option>
                                    {LOCATIONS.filter(l => l).map(l => (
                                        <option key={l} value={l}>{l}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="fp-divider" />

                            {/* Price Range */}
                            <div className="fg">
                                <span className="fg-label">Price Range</span>
                                <div className="fg-price-inputs">
                                    <input
                                        type="number"
                                        className="fg-price-in"
                                        placeholder="Min ₹"
                                        value={filters.minPrice}
                                        onChange={e => setFilters(f => ({ ...f, minPrice: e.target.value }))}
                                    />
                                    <input
                                        type="number"
                                        className="fg-price-in"
                                        placeholder="Max ₹"
                                        value={filters.maxPrice}
                                        onChange={e => setFilters(f => ({ ...f, maxPrice: e.target.value }))}
                                    />
                                </div>
                                <button className="fg-apply-btn" onClick={applyPrice}>
                                    Apply Price Filter
                                </button>
                            </div>

                        </div>
                    </div>
                </aside>

                {/* ── Main ── */}
                <main className="listings-main">

                    {/* Header bar */}
                    <div className="listings-header">
                        <p className="results-count">
                            Showing <strong>{listings.length}</strong> of <strong>{total}</strong> properties
                        </p>
                        <select
                            className="sort-select"
                            onChange={e => apply('sort', e.target.value)}
                        >
                            <option value="">Newest First</option>
                            <option value="price-asc">Price: Low → High</option>
                            <option value="price-desc">Price: High → Low</option>
                        </select>
                    </div>

                    {loading ? (
                        /* Skeleton */
                        <div className="skeleton-grid">
                            {Array(6).fill(0).map((_, i) => (
                                <div key={i} className="skeleton-card">
                                    <div className="skeleton" style={{ height: 210 }} />
                                    <div style={{ padding: '18px 18px 14px' }}>
                                        <div className="skeleton" style={{ height: 18, marginBottom: 10, borderRadius: 6 }} />
                                        <div className="skeleton" style={{ height: 13, width: '65%', marginBottom: 14, borderRadius: 6 }} />
                                        <div className="skeleton" style={{ height: 22, width: '50%', borderRadius: 6 }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : listings.length > 0 ? (
                        <>
                            <div className="listings-grid-main">
                                {listings.map(l => <ListingCard key={l._id} listing={l} />)}
                            </div>

                            {pages > 1 && (
                                <div className="pagination">
                                    {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
                                        <button
                                            key={p}
                                            className={`page-btn ${filters.page === p ? 'active' : ''}`}
                                            onClick={() => {
                                                const nf = { ...filters, page: p };
                                                setFilters(nf);
                                                fetchListings(nf);
                                            }}
                                        >
                                            {p}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="no-results">
                            <div className="no-results-icon">🏠</div>
                            <h3>No properties found</h3>
                            <p>Try adjusting your filters to discover more listings.</p>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}