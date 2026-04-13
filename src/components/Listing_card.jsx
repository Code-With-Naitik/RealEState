import { Link } from 'react-router-dom';
import '../css/Listing_Card.css';

const fmt = (n) =>
    n >= 10000000 ? `₹${(n / 10000000).toFixed(2)} Cr`
    : n >= 100000 ? `₹${(n / 100000).toFixed(1)} L`
    : `₹${n?.toLocaleString('en-IN')}`;

const CAT_ICONS = {
    apartment:  '🏢',
    villa:      '🏡',
    plot:       '🌿',
    commercial: '🏪',
    township:   '🏘️',
};

export default function ListingCard({ listing }) {
    const isOffer  = listing.offer && listing.discountPrice;
    const catIcon  = CAT_ICONS[listing.category] || '🏠';

    return (
        <Link to={`/listings/${listing._id}`} className="listing-card">

            {/* ── Image ── */}
            <div className="card-image">
                <img
                    src={listing.imageUrls?.[0] || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600'}
                    alt={listing.name}
                    loading="lazy"
                />

                {/* Category label at bottom of image */}
                <div className="card-cat-label">
                    {catIcon} {listing.category}
                </div>

                {/* Top-left badges */}
                <div className="card-badges">
                    <span className={`cb-type ${listing.type}`}>
                        {listing.type === 'sale' ? 'For Sale' : 'For Rent'}
                    </span>
                    {listing.featured && (
                        <span className="cb-featured">⭐ Featured</span>
                    )}
                </div>

                {/* Offer ribbon */}
                {isOffer && (
                    <div className="card-offer-ribbon">
                        Save {fmt(listing.regularPrice - listing.discountPrice)}
                    </div>
                )}
            </div>

            {/* ── Body ── */}
            <div className="card-body">

                {/* Title */}
                <h3 className="card-title">{listing.name}</h3>

                {/* Location */}
                <div className="card-location">
                    <span className="loc-icon">📍</span>
                    <span>{listing.location || listing.address}</span>
                </div>

                {/* Price */}
                <div className="card-price">
                    {isOffer ? (
                        <>
                            <span className="price-main">{fmt(listing.discountPrice)}</span>
                            <span className="price-old">{fmt(listing.regularPrice)}</span>
                        </>
                    ) : (
                        <span className="price-main">{fmt(listing.regularPrice)}</span>
                    )}
                    {listing.type === 'rent' && <span className="price-period">/month</span>}
                </div>

                <div className="card-divider" />

                {/* Meta */}
                <div className="card-meta">
                    {listing.bedrooms > 0 && (
                        <div className="cm-item">
                            <span>🛏</span>
                            <span>{listing.bedrooms} Bed{listing.bedrooms > 1 ? 's' : ''}</span>
                        </div>
                    )}
                    {listing.bathrooms > 0 && (
                        <div className="cm-item">
                            <span>🚿</span>
                            <span>{listing.bathrooms} Bath{listing.bathrooms > 1 ? 's' : ''}</span>
                        </div>
                    )}
                    {listing.area && (
                        <div className="cm-item">
                            <span>📐</span>
                            <span>{listing.area} sqft</span>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Footer CTA ── */}
            <div className="card-footer">
                <span className="card-view-btn">View Details →</span>
                <span className={`card-status-dot ${listing.status || 'active'}`} title={listing.status} />
            </div>

        </Link>
    );
}