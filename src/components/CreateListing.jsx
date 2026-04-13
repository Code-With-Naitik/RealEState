import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { listingsAPI, uploadAPI } from '../utility/api.jsx';
import { useAuth } from '../auth/auth_Context.jsx';
import '../css/CreateListing.css';

/* ─── Constants ─── */
const STEPS = [
    { label: 'Basic Info', icon: '🏠' },
    { label: 'Details',    icon: '📐' },
    { label: 'Photos',     icon: '📸' },
    { label: 'Review',     icon: '✅' },
];

const CATEGORIES = ['apartment', 'villa', 'plot', 'commercial', 'township'];

const AMENITIES = [
    '🏊 Swimming Pool', '🏋️ Gym', '🌳 Garden',
    '🔒 24/7 Security', '🛗 Lift/Elevator', '⚡ Power Backup',
    '🏃 Jogging Track', '🎭 Clubhouse', '📡 CCTV',
    '🚿 Water Harvesting', '🌿 Landscaping', '🛝 Kids Play Area',
];

const EMPTY = {
    name: '', description: '', address: '', location: '',
    regularPrice: '', discountPrice: '',
    bathrooms: 1, bedrooms: 1, area: '',
    furnished: false, parking: false, featured: false,
    type: 'sale', category: 'apartment', offer: false,
    imageUrls: [], amenities: [], projectName: '', status: 'active',
};

/* ─── Format price (Indian) ─── */
const fmt = (n) =>
    !n ? '—'
    : n >= 10000000 ? `₹${(n / 10000000).toFixed(2)} Cr`
    : n >= 100000   ? `₹${(n / 100000).toFixed(1)} L`
    : `₹${Number(n).toLocaleString('en-IN')}`;

/* ═══════════════════════════════════════════ */
export default function CreateListing() {
    const { user } = useAuth();
    const navigate  = useNavigate();
    const fileRef   = useRef();

    const [step,     setStep]     = useState(0);
    const [form,     setForm]     = useState(EMPTY);
    const [files,    setFiles]    = useState([]);
    const [previews, setPreviews] = useState([]);
    const [drag,     setDrag]     = useState(false);
    const [progress, setProgress] = useState(0);
    const [uploading,setUploading]= useState(false);
    const [saving,   setSaving]   = useState(false);
    const [error,    setError]    = useState('');
    const [success,  setSuccess]  = useState(false);

    if (!user) { navigate('/sign-in'); return null; }

    /* ─── helpers ─── */
    const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

    const toggleAmenity = (a) =>
        setForm(f => ({
            ...f,
            amenities: f.amenities.includes(a)
                ? f.amenities.filter(x => x !== a)
                : [...f.amenities, a],
        }));

    const addFiles = (incoming) => {
        const imgs = Array.from(incoming).filter(f => f.type.startsWith('image/'));
        if (imgs.length + files.length > 10) { setError('Maximum 10 images allowed.'); return; }
        setError('');
        setFiles(p  => [...p, ...imgs]);
        setPreviews(p => [...p, ...imgs.map(f => URL.createObjectURL(f))]);
    };

    const removeImg = (i) => {
        setFiles(p    => p.filter((_, idx) => idx !== i));
        setPreviews(p => p.filter((_, idx) => idx !== i));
    };

    /* ─── Validation ─── */
    const validate = () => {
        setError('');
        if (step === 0) {
            if (!form.name.trim())        return setError('Property name is required.'), false;
            if (!form.address.trim())     return setError('Address is required.'), false;
            if (!form.location.trim())    return setError('Location / area is required.'), false;
            if (!form.description.trim()) return setError('Description is required.'), false;
        }
        if (step === 1) {
            if (!form.regularPrice || Number(form.regularPrice) <= 0)
                return setError('Enter a valid regular price.'), false;
            if (!form.area || Number(form.area) <= 0)
                return setError('Enter a valid area (sq. ft.).'), false;
            if (form.offer && Number(form.discountPrice) >= Number(form.regularPrice))
                return setError('Discount price must be less than regular price.'), false;
        }
        if (step === 2) {
            if (files.length === 0 && form.imageUrls.length === 0)
                return setError('Upload at least one property photo.'), false;
        }
        return true;
    };

    const next = () => { if (validate()) setStep(s => Math.min(s + 1, 3)); };
    const prev = () => { setError(''); setStep(s => Math.max(s - 1, 0)); };

    /* ─── Submit ─── */
    const handleSubmit = async () => {
        setError('');
        try {
            setSaving(true);
            let imageUrls = form.imageUrls;
            if (files.length > 0) {
                setUploading(true);
                setProgress(15);
                const fd = new FormData();
                files.forEach(f => fd.append('images', f));
                setProgress(50);
                const res = await uploadAPI.images(fd);
                imageUrls = res.data.urls || [];
                setProgress(100);
                setUploading(false);
            }
            if (imageUrls.length === 0) { setError('Upload at least one photo.'); return; }
            const payload = {
                ...form,
                imageUrls,
                regularPrice:  Number(form.regularPrice),
                discountPrice: form.discountPrice ? Number(form.discountPrice) : undefined,
                bathrooms:     Number(form.bathrooms),
                bedrooms:      Number(form.bedrooms),
                area:          Number(form.area),
            };
            await listingsAPI.create(payload);
            setSuccess(true);
            setTimeout(() => navigate('/listings'), 2600);
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Failed to publish. Try again.');
        } finally {
            setSaving(false);
            setUploading(false);
        }
    };

    /* ─── Success ─── */
    if (success) return (
        <div className="cl-success-wrap">
            <div className="cl-success-card">
                <div className="cl-success-icon">✓</div>
                <h2>Listing Published!</h2>
                <p>Your property is live. Redirecting to all listings…</p>
                <div className="cl-success-bar"><div className="cl-success-fill" /></div>
            </div>
        </div>
    );

    /* ─── JSX ─── */
    return (
        <div className="cl-page">

            {/* ── Hero ── */}
            <div className="cl-hero">
                <div className="cl-hero-pattern" />
                <div className="container cl-hero-content">
                    <div className="section-label">List a Property</div>
                    <h1>Create Your Listing</h1>
                    <p>Follow the steps below to publish your property on NH realEState</p>
                </div>
            </div>

            <div className="cl-wrapper">

                {/* ── Stepper ── */}
                <div className="cl-stepper">
                    {STEPS.map((s, i) => (
                        <div key={s.label} className={`cl-step ${i === step ? 'active' : ''} ${i < step ? 'done' : ''}`}>
                            <div className="cl-step-circle">
                                {i < step ? '✓' : i + 1}
                            </div>
                            <div className="cl-step-info">
                                <div className="cl-step-num">Step {i + 1}</div>
                                <div className="cl-step-name">{s.label}</div>
                            </div>
                            {i < STEPS.length - 1 && <div className="cl-step-line" />}
                        </div>
                    ))}
                </div>

                {/* ── Card ── */}
                <div className="cl-card">

                    {/* Error */}
                    {error && <div className="cl-alert">⚠ {error}</div>}

                    {/* ══ STEP 0 — Basic Info ══ */}
                    {step === 0 && (
                        <div className="cl-form-section">
                            <div className="cl-section-hd">
                                <div className="cl-hd-icon">🏠</div>
                                <div className="cl-hd-text">
                                    <h2>Property Information</h2>
                                    <p>Start with name, type, and location</p>
                                </div>
                            </div>

                            {/* Name + Project */}
                            <div className="cl-g2">
                                <div className="form-group">
                                    <label>Property Name *</label>
                                    <input type="text" placeholder="e.g. Sunshine Heights"
                                        value={form.name} onChange={e => set('name', e.target.value)} />
                                </div>
                                <div className="form-group">
                                    <label>Project Name (optional)</label>
                                    <input type="text" placeholder="e.g. NH Green Valley"
                                        value={form.projectName} onChange={e => set('projectName', e.target.value)} />
                                </div>
                            </div>

                            {/* Listing Type */}
                            <div className="cl-group-label">Listing Type</div>
                            <div className="cl-type-toggle" style={{ marginBottom: 16 }}>
                                {[
                                    { val: 'sale', icon: '🏷️', label: 'For Sale' },
                                    { val: 'rent', icon: '🔑', label: 'For Rent' },
                                ].map(t => (
                                    <button key={t.val} type="button"
                                        className={`cl-type-btn ${form.type === t.val ? 'active' : ''}`}
                                        onClick={() => set('type', t.val)}>
                                        <span className="t-icon">{t.icon}</span>
                                        <span className="t-label">{t.label}</span>
                                    </button>
                                ))}
                            </div>

                            {/* Category */}
                            <div className="cl-group-label">Category</div>
                            <div className="cl-cat-pills" style={{ marginBottom: 16 }}>
                                {CATEGORIES.map(c => (
                                    <button key={c} type="button"
                                        className={`cl-cat-pill ${form.category === c ? 'active' : ''}`}
                                        onClick={() => set('category', c)}>
                                        {c.charAt(0).toUpperCase() + c.slice(1)}
                                    </button>
                                ))}
                            </div>

                            {/* Address + Location */}
                            <div className="form-group">
                                <label>Full Address *</label>
                                <input type="text" placeholder="Street, building, locality…"
                                    value={form.address} onChange={e => set('address', e.target.value)} />
                            </div>
                            <div className="form-group">
                                <label>Location / Area *</label>
                                <input type="text" placeholder="e.g. Super Corridor, Indore"
                                    value={form.location} onChange={e => set('location', e.target.value)} />
                            </div>

                            {/* Description */}
                            <div className="form-group">
                                <label>Description *</label>
                                <textarea rows={5}
                                    placeholder="Describe the property — highlights, surroundings, nearby infrastructure…"
                                    value={form.description} onChange={e => set('description', e.target.value)} />
                            </div>
                        </div>
                    )}

                    {/* ══ STEP 1 — Details ══ */}
                    {step === 1 && (
                        <div className="cl-form-section">
                            <div className="cl-section-hd">
                                <div className="cl-hd-icon">📐</div>
                                <div className="cl-hd-text">
                                    <h2>Property Details</h2>
                                    <p>Price, size, rooms, and amenities</p>
                                </div>
                            </div>

                            {/* Pricing */}
                            <div className="cl-group-label">Pricing</div>
                            <div className="cl-g3">
                                <div className="form-group">
                                    <label>Regular Price (₹) *</label>
                                    <input type="number" min="0" placeholder="e.g. 4500000"
                                        value={form.regularPrice} onChange={e => set('regularPrice', e.target.value)} />
                                    {form.regularPrice && <span className="cl-price-hint">{fmt(form.regularPrice)}</span>}
                                </div>
                                <div className="form-group">
                                    <label>Area (sq. ft.) *</label>
                                    <input type="number" min="0" placeholder="e.g. 1250"
                                        value={form.area} onChange={e => set('area', e.target.value)} />
                                </div>
                                <div className="form-group">
                                    <label>Price / sq.ft.</label>
                                    <input type="text" readOnly
                                        value={form.regularPrice && form.area
                                            ? `₹${Math.round(form.regularPrice / form.area).toLocaleString('en-IN')}`
                                            : '—'}
                                        style={{ background: '#F5F1EA', cursor: 'default' }} />
                                </div>
                            </div>

                            {/* Offer toggle */}
                            <div className="cl-offer-row">
                                <div className="cl-offer-label">
                                    Special Offer / Discount
                                    <span>Enable to set a discounted price</span>
                                </div>
                                <label className="cl-toggle-switch">
                                    <input type="checkbox" checked={form.offer}
                                        onChange={e => set('offer', e.target.checked)} />
                                    <span className="cl-slider" />
                                </label>
                            </div>

                            {form.offer && (
                                <div className="form-group">
                                    <label>Discounted Price (₹)</label>
                                    <input type="number" min="0" placeholder="Must be less than regular price"
                                        value={form.discountPrice} onChange={e => set('discountPrice', e.target.value)} />
                                    {form.discountPrice && <span className="cl-price-hint">{fmt(form.discountPrice)}</span>}
                                </div>
                            )}

                            {/* Rooms */}
                            <div className="cl-group-label">Rooms</div>
                            <div className="cl-counter-wrap">
                                <span className="cl-counter-label">🛏 Bedrooms</span>
                                <div className="cl-counter">
                                    <button type="button" onClick={() => set('bedrooms', Math.max(0, form.bedrooms - 1))}>−</button>
                                    <span>{form.bedrooms}</span>
                                    <button type="button" onClick={() => set('bedrooms', form.bedrooms + 1)}>+</button>
                                </div>
                            </div>
                            <div className="cl-counter-wrap">
                                <span className="cl-counter-label">🚿 Bathrooms</span>
                                <div className="cl-counter">
                                    <button type="button" onClick={() => set('bathrooms', Math.max(0, form.bathrooms - 1))}>−</button>
                                    <span>{form.bathrooms}</span>
                                    <button type="button" onClick={() => set('bathrooms', form.bathrooms + 1)}>+</button>
                                </div>
                            </div>

                            {/* Features */}
                            <div className="cl-group-label">Features</div>
                            <div className="cl-feat-grid">
                                {[
                                    { key: 'furnished', icon: '🛋️', label: 'Furnished' },
                                    { key: 'parking',   icon: '🚗', label: 'Parking'   },
                                    { key: 'featured',  icon: '⭐', label: 'Featured'  },
                                ].map(({ key, icon, label }) => (
                                    <label key={key} className={`cl-feat-chip ${form[key] ? 'on' : ''}`}>
                                        <input type="checkbox" checked={form[key]}
                                            onChange={e => set(key, e.target.checked)} />
                                        <span className="fc-icon">{icon}</span>
                                        {label}
                                    </label>
                                ))}
                            </div>

                            {/* Amenities */}
                            <div className="cl-group-label">Amenities</div>
                            <div className="cl-amenity-grid">
                                {AMENITIES.map(a => (
                                    <label key={a} className={`cl-amenity-chip ${form.amenities.includes(a) ? 'on' : ''}`}>
                                        <input type="checkbox" checked={form.amenities.includes(a)}
                                            onChange={() => toggleAmenity(a)} />
                                        {a}
                                    </label>
                                ))}
                            </div>

                            {/* Status */}
                            <div className="cl-group-label">Listing Status</div>
                            <div className="cl-status-tabs">
                                {[
                                    { val: 'active',  label: '✅ Active'  },
                                    { val: 'pending', label: '⏳ Pending' },
                                    { val: 'sold',    label: '🔒 Sold'    },
                                ].map(s => (
                                    <button key={s.val} type="button"
                                        className={`cl-status-tab ${form.status === s.val ? 'active-tab' : ''}`}
                                        onClick={() => set('status', s.val)}>
                                        {s.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ══ STEP 2 — Photos ══ */}
                    {step === 2 && (
                        <div className="cl-form-section">
                            <div className="cl-section-hd">
                                <div className="cl-hd-icon">📸</div>
                                <div className="cl-hd-text">
                                    <h2>Property Photos</h2>
                                    <p>High-quality images attract more buyers</p>
                                </div>
                            </div>

                            {/* Drop Zone */}
                            <div
                                className={`cl-dropzone ${drag ? 'drag-over' : ''}`}
                                onClick={() => fileRef.current?.click()}
                                onDragOver={e => { e.preventDefault(); setDrag(true); }}
                                onDragLeave={() => setDrag(false)}
                                onDrop={e => { e.preventDefault(); setDrag(false); addFiles(e.dataTransfer.files); }}
                            >
                                {previews.length > 0 && (
                                    <div className="cl-img-count-badge">{previews.length} / 10</div>
                                )}
                                <div className="cl-dz-icon">📁</div>
                                <div className="cl-dz-title">Drag &amp; drop photos here</div>
                                <div className="cl-dz-sub">or click to browse from your device</div>
                                <div className="cl-dz-hint">PNG • JPG • WEBP  |  Max 10 MB each  |  Up to 10 photos</div>
                                <button type="button" className="cl-dz-btn"
                                    onClick={e => { e.stopPropagation(); fileRef.current?.click(); }}>
                                    📂 Browse Files
                                </button>
                                <input ref={fileRef} type="file" accept="image/*" multiple
                                    style={{ display: 'none' }}
                                    onChange={e => addFiles(e.target.files)} />
                            </div>

                            {/* Previews */}
                            {previews.length > 0 && (
                                <div className="cl-img-grid">
                                    {previews.map((src, i) => (
                                        <div key={i} className="cl-img-thumb">
                                            <img src={src} alt={`photo-${i}`} />
                                            {i === 0 && <div className="cl-img-cover">Cover Photo</div>}
                                            <button type="button" className="cl-img-remove"
                                                onClick={e => { e.stopPropagation(); removeImg(i); }}>✕</button>
                                        </div>
                                    ))}
                                    {previews.length < 10 && (
                                        <div className="cl-img-add" onClick={() => fileRef.current?.click()}>
                                            <span>＋</span>
                                            <span>Add More</span>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Upload progress */}
                            {uploading && (
                                <div className="cl-upload-bar">
                                    <span>⏳ Uploading photos… {progress}%</span>
                                    <div className="cl-prog">
                                        <div className="cl-prog-fill" style={{ width: `${progress}%` }} />
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ══ STEP 3 — Review ══ */}
                    {step === 3 && (
                        <div className="cl-form-section">
                            <div className="cl-section-hd">
                                <div className="cl-hd-icon">✅</div>
                                <div className="cl-hd-text">
                                    <h2>Review &amp; Publish</h2>
                                    <p>Confirm your listing details before going live</p>
                                </div>
                            </div>

                            <div className="cl-review-card">
                                {/* Cover image */}
                                <div className="cl-rv-image">
                                    {previews[0]
                                        ? <img src={previews[0]} alt="cover" />
                                        : (
                                            <div className="cl-rv-no-img">
                                                <div className="cl-rv-no-img-icon">🏠</div>
                                                <span>No photos uploaded</span>
                                            </div>
                                        )
                                    }
                                    <div className="cl-rv-badges">
                                        <span className={`cl-rv-type ${form.type}`}>
                                            {form.type === 'sale' ? 'For Sale' : 'For Rent'}
                                        </span>
                                        <span className="cl-rv-cat">{form.category}</span>
                                    </div>
                                    {previews.length > 0 && (
                                        <div className="cl-rv-photo-ct">📷 {previews.length} photo{previews.length !== 1 ? 's' : ''}</div>
                                    )}
                                </div>

                                {/* Body */}
                                <div className="cl-rv-body">
                                    <h3>{form.name || 'Untitled Property'}</h3>
                                    {form.projectName && <p className="cl-rv-project">🏗️ {form.projectName}</p>}
                                    <p className="cl-rv-loc">📍 {form.address}{form.location ? `, ${form.location}` : ''}</p>

                                    <div className="cl-rv-price">
                                        {fmt(form.regularPrice)}
                                        {form.offer && form.discountPrice && (
                                            <span className="cl-rv-discount">→ {fmt(form.discountPrice)}</span>
                                        )}
                                    </div>

                                    <div className="cl-rv-specs">
                                        {form.bedrooms > 0 && <span className="cl-rv-spec">🛏 {form.bedrooms} Bed</span>}
                                        {form.bathrooms > 0 && <span className="cl-rv-spec">🚿 {form.bathrooms} Bath</span>}
                                        {form.area && <span className="cl-rv-spec">📐 {form.area} sq.ft.</span>}
                                        {form.furnished && <span className="cl-rv-spec">🛋️ Furnished</span>}
                                        {form.parking && <span className="cl-rv-spec">🚗 Parking</span>}
                                        {form.featured && <span className="cl-rv-spec">⭐ Featured</span>}
                                    </div>

                                    {form.amenities.length > 0 && (
                                        <div className="cl-rv-amenities">
                                            {form.amenities.map(a => (
                                                <span key={a} className="cl-rv-amenity">{a}</span>
                                            ))}
                                        </div>
                                    )}

                                    <div className="cl-rv-desc">
                                        <div className="cl-rv-desc-label">Description</div>
                                        <p>{form.description}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Submit */}
                            <div className="cl-submit-bar">
                                <p className="cl-submit-note">
                                    By publishing you agree to our listing policies. Your property will be reviewed within 24 hours.
                                </p>
                                <button
                                    className="cl-publish-btn"
                                    onClick={handleSubmit}
                                    disabled={saving || uploading}
                                >
                                    {saving ? '⏳ Publishing…' : '🚀 Publish Listing'}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ── Navigation ── */}
                    <div className="cl-nav-bar">
                        {step > 0
                            ? <button type="button" className="cl-back-btn" onClick={prev}>← Back</button>
                            : <div />
                        }
                        {step < 3 && (
                            <button type="button" className="cl-next-btn" onClick={next}>
                                Continue →
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
