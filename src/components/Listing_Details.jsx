import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { listingsAPI, contactAPI } from '../utility/api.jsx';
import '../css/Listing_Details.css';

export default function ListingDetail() {
    const { id } = useParams();
    const [listing, setListing] = useState(null);
    const [loading, setLoading] = useState(true);
    const [imgIdx, setImgIdx] = useState(0);
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [inquiry, setInquiry] = useState({ name: '', phone: '', email: '', message: '' });
    const [sent, setSent] = useState(false);

    useEffect(() => {
        listingsAPI.getOne(id)
            .then(r => { setListing(r.data); setLoading(false); })
            .catch(() => setLoading(false));
        window.scrollTo(0, 0);
    }, [id]);

    // Keyboard navigation for lightbox
    useEffect(() => {
        if (!lightboxOpen) return;
        const handleKey = (e) => {
            if (e.key === 'Escape') setLightboxOpen(false);
            if (e.key === 'ArrowRight') setImgIdx(i => Math.min((listing?.imageUrls?.length || 1) - 1, i + 1));
            if (e.key === 'ArrowLeft') setImgIdx(i => Math.max(0, i - 1));
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [lightboxOpen, listing]);

    const formatPrice = (n) =>
        n >= 10000000 ? `₹${(n / 10000000).toFixed(2)} Cr`
            : n >= 100000 ? `₹${(n / 100000).toFixed(1)} L`
                : `₹${n?.toLocaleString()}`;

    const handleInquiry = async (e) => {
        e.preventDefault();
        try {
            await contactAPI.send({
                ...inquiry,
                subject: `Inquiry for: ${listing?.name}`,
                message: `${inquiry.message}\n\nProperty: ${listing?.name}\nAddress: ${listing?.address}`,
            });
            setSent(true);
        } catch (err) {
            alert('Failed to send. Please try again.');
        }
    };

    if (loading) return (
        <div className="detail-loading container">
            <div className="skeleton" style={{ height: 500, borderRadius: 16, marginTop: 80 }} />
        </div>
    );

    if (!listing) return (
        <div className="detail-notfound container">
            <h2>Property not found</h2>
            <Link to="/listings" className="btn-primary">Back to Listings</Link>
        </div>
    );

    return (
        <div className="listing-detail">
            {/* Image Gallery */}
            <div className="detail-gallery">
                <div className="main-image">
                    <img
                        src={listing.imageUrls?.[imgIdx] || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1000'}
                        alt={listing.name}
                        onClick={() => setLightboxOpen(true)}
                        style={{ cursor: 'zoom-in' }}
                    />
                    <div className="gallery-zoom-hint">🔍 Click to view fullscreen</div>
                    <div className="gallery-nav">
                        <button onClick={() => setImgIdx(i => Math.max(0, i - 1))} disabled={imgIdx === 0}>‹</button>
                        <span>{imgIdx + 1} / {listing.imageUrls?.length || 1}</span>
                        <button onClick={() => setImgIdx(i => Math.min((listing.imageUrls?.length || 1) - 1, i + 1))} disabled={imgIdx >= (listing.imageUrls?.length || 1) - 1}>›</button>
                    </div>
                </div>
                {listing.imageUrls?.length > 1 && (
                    <div className="thumb-strip">
                        {listing.imageUrls.map((url, i) => (
                            <button key={i} className={`thumb ${i === imgIdx ? 'active' : ''}`} onClick={() => setImgIdx(i)}>
                                <img src={url} alt="" />
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <div className="container detail-layout">
                {/* Main Info */}
                <div className="detail-main">
                    <div className="detail-badges">
                        <span className={`badge ${listing.type === 'sale' ? 'badge-sale' : 'badge-rent'}`}>
                            {listing.type === 'sale' ? 'For Sale' : 'For Rent'}
                        </span>
                        <span className="badge badge-navy">{listing.category}</span>
                        {listing.status === 'sold' && <span className="badge" style={{ background: '#f44336', color: '#fff' }}>Sold</span>}
                    </div>

                    <h1 className="detail-title">{listing.name}</h1>
                    <p className="detail-address">📍 {listing.address}</p>

                    <div className="detail-price-row">
                        {listing.offer && listing.discountPrice ? (
                            <>
                                <div className="dp-main">{formatPrice(listing.discountPrice)}</div>
                                <div className="dp-old">{formatPrice(listing.regularPrice)}</div>
                                <div className="dp-save">Save {formatPrice(listing.regularPrice - listing.discountPrice)}</div>
                            </>
                        ) : (
                            <div className="dp-main">{formatPrice(listing.regularPrice)}</div>
                        )}
                        {listing.type === 'rent' && <span className="dp-period">/month</span>}
                    </div>

                    <div className="detail-specs">
                        {listing.bedrooms > 0 && <div className="spec-item"><span className="spec-icon">🛏</span><div><div className="spec-val">{listing.bedrooms}</div><div className="spec-lab">Bedrooms</div></div></div>}
                        {listing.bathrooms > 0 && <div className="spec-item"><span className="spec-icon">🚿</span><div><div className="spec-val">{listing.bathrooms}</div><div className="spec-lab">Bathrooms</div></div></div>}
                        {listing.area && <div className="spec-item"><span className="spec-icon">📐</span><div><div className="spec-val">{listing.area}</div><div className="spec-lab">Sq. Ft.</div></div></div>}
                        <div className="spec-item"><span className="spec-icon">🚗</span><div><div className="spec-val">{listing.parking ? 'Yes' : 'No'}</div><div className="spec-lab">Parking</div></div></div>
                        <div className="spec-item"><span className="spec-icon">🪑</span><div><div className="spec-val">{listing.furnished ? 'Yes' : 'No'}</div><div className="spec-lab">Furnished</div></div></div>
                    </div>

                    <div className="detail-section">
                        <h3>Description</h3>
                        <p>{listing.description}</p>
                    </div>

                    {listing.amenities?.length > 0 && (
                        <div className="detail-section">
                            <h3>✨ Amenities</h3>
                            <div className="amenities-grid">
                                {listing.amenities.map((a, i) => (
                                    <div key={i} className="amenity-item">
                                        <span className="amenity-check">✓</span>
                                        {a}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="detail-section">
                        <h3>Location</h3>
                        <div className="map-placeholder">
                            <div className="map-inner">
                                <div style={{ fontSize: 48, marginBottom: 12 }}>📍</div>
                                <p>{listing.address}</p>
                                <a
                                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(listing.address)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn-outline"
                                    style={{ marginTop: 16, display: 'inline-flex' }}
                                >
                                    View on Google Maps
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <aside className="detail-sidebar">
                    {/* Inquiry Form */}
                    <div className="inquiry-card">
                        <div className="inquiry-card-header">
                            <h3>Enquire About This Property</h3>
                            <p>Our team typically responds within 24 hours</p>
                        </div>
                        <div className="inquiry-card-body">
                        {sent ? (
                            <div className="inquiry-success">
                                <div className="inquiry-success-icon">✓</div>
                                <h4>Message Sent!</h4>
                                <p>Our team will contact you shortly.</p>
                            </div>
                        ) : (
                            <form onSubmit={handleInquiry}>
                                <div className="form-group">
                                    <label>Your Name</label>
                                    <input required type="text" placeholder="Full name" value={inquiry.name} onChange={e => setInquiry({ ...inquiry, name: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label>Phone</label>
                                    <input required type="tel" placeholder="+91 XXXXX XXXXX" value={inquiry.phone} onChange={e => setInquiry({ ...inquiry, phone: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label>Email (optional)</label>
                                    <input type="email" placeholder="your@email.com" value={inquiry.email} onChange={e => setInquiry({ ...inquiry, email: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label>Message</label>
                                    <textarea placeholder="I'm interested in this property…" value={inquiry.message} onChange={e => setInquiry({ ...inquiry, message: e.target.value })} />
                                </div>
                                <button type="submit" className="inquiry-submit-btn">
                                    📩 Send Enquiry
                                </button>
                            </form>
                        )}
                        </div>
                    </div>

                    {/* Agent Card */}
                    <div className="agent-card">
                        <div className="agent-photo">
                            <img src="https://images.unsplash.com/photo-1560250097-0dc05969d69e?w=200&q=80" alt="Agent" />
                        </div>
                        <div className="agent-info">
                            <h4>NH RealEState</h4>
                            <p>Senior Realtor – NH realEState</p>
                            <div className="agent-actions">
                                <a href="tel:+919999999999" className="agent-btn call">📞 Call</a>
                                <a href="https://wa.me/919999999999" target="_blank" rel="noreferrer" className="agent-btn whatsapp">💬 WhatsApp</a>
                            </div>
                        </div>
                    </div>
                </aside>
            </div>

            {/* ===== Fullscreen Lightbox ===== */}
            {lightboxOpen && (
                <div className="lightbox-overlay" onClick={() => setLightboxOpen(false)}>
                    <button className="lightbox-close" onClick={() => setLightboxOpen(false)}>✕</button>

                    <button
                        className="lightbox-arrow lightbox-prev"
                        onClick={e => { e.stopPropagation(); setImgIdx(i => Math.max(0, i - 1)); }}
                        disabled={imgIdx === 0}
                    >‹</button>

                    <div className="lightbox-img-wrap" onClick={e => e.stopPropagation()}>
                        <img
                            src={listing.imageUrls?.[imgIdx]}
                            alt={`${listing.name} – ${imgIdx + 1}`}
                            className="lightbox-img"
                        />
                        <div className="lightbox-counter">{imgIdx + 1} / {listing.imageUrls?.length}</div>
                    </div>

                    <button
                        className="lightbox-arrow lightbox-next"
                        onClick={e => { e.stopPropagation(); setImgIdx(i => Math.min((listing.imageUrls?.length || 1) - 1, i + 1)); }}
                        disabled={imgIdx >= (listing.imageUrls?.length || 1) - 1}
                    >›</button>

                    {listing.imageUrls?.length > 1 && (
                        <div className="lightbox-thumbs" onClick={e => e.stopPropagation()}>
                            {listing.imageUrls.map((url, i) => (
                                <img
                                    key={i}
                                    src={url}
                                    alt=""
                                    className={`lightbox-thumb ${i === imgIdx ? 'active' : ''}`}
                                    onClick={() => setImgIdx(i)}
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}