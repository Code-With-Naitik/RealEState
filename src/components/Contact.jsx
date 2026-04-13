import { useState } from 'react';
import { contactAPI } from '../utility/api.jsx';
import '../css/Contact.css';

export default function Contact() {
    const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await contactAPI.send(form);
            setSent(true);
            setForm({ name: '', email: '', phone: '', subject: '', message: '' });
        } catch {
            setError('Failed to send message. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="contact-page">
            <div className="page-hero" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&q=60')" }}>
                <div className="page-hero-overlay" />
                <div className="container page-hero-content">
                    <h1>Contact Us</h1>
                    <p>Get in touch with our expert team today</p>
                </div>
            </div>

            <div className="container contact-layout section-pad">
                <div className="contact-info">
                    <div className="section-label">Reach Out</div>
                    <h2 className="section-title">Let's Start a Conversation</h2>
                    <p className="contact-intro">
                        Whether you're buying, selling, or investing — our expert team is ready to guide you through every step. Reach out and let's find your dream property together.
                    </p>

                    <div className="contact-items">
                        {[
                            { icon: '📞', title: 'Phone', value: '+91 9999999999', link: 'tel:+91+91 9999999999' },
                            { icon: '✉️', title: 'Email', value: 'NHProperty@nhrealestate.in', link: 'mailto:[EMAIL_ADDRESS]' },
                            { icon: '📍', title: 'Address', value: 'Surat, Gujarat, India', link: '#' },
                            { icon: '🕐', title: 'Office Hours', value: 'Monday–Saturday: 9 AM – 7 PM', link: null },
                        ].map((item, i) => (
                            <div key={i} className="contact-item">
                                <div className="ci-icon">{item.icon}</div>
                                <div>
                                    <div className="ci-title">{item.title}</div>
                                    {item.link ? (
                                        <a href={item.link} className="ci-value">{item.value}</a>
                                    ) : (
                                        <div className="ci-value">{item.value}</div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="contact-social">
                        <p>Follow us:</p>
                        <div className="social-row">
                            {['Facebook', 'Instagram', 'YouTube', 'WhatsApp'].map(s => {
                                const renderIcon = (name) => {
                                    switch (name) {
                                        case 'Facebook': return <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>;
                                        case 'Instagram': return <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>;
                                        case 'YouTube': return <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33 2.78 2.78 0 0 0 1.94 2c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon></svg>;
                                        case 'WhatsApp': return <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>;
                                        default: return null;
                                    }
                                };
                                return (
                                    <a key={s} href="#" className="social-btn" title={s}>
                                        {renderIcon(s)}
                                    </a>
                                );
                            })}
                        </div>
                    </div>
                </div>

                <div className="contact-form-wrap">
                    {sent ? (
                        <div className="sent-success">
                            <div style={{ fontSize: 56, marginBottom: 16 }}>🎉</div>
                            <h3>Message Sent Successfully!</h3>
                            <p>Thank you for reaching out. Our team will contact you within 24 hours.</p>
                            <button className="btn-primary" onClick={() => setSent(false)} style={{ marginTop: 24 }}>
                                Send Another Message
                            </button>
                        </div>
                    ) : (
                        <form className="contact-form" onSubmit={handleSubmit}>
                            <h3>Send Us a Message</h3>
                            {error && <div className="form-error">{error}</div>}
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Full Name *</label>
                                    <input required type="text" placeholder="Your full name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label>Phone Number</label>
                                    <input type="tel" placeholder="+91 XXXXX XXXXX" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Email Address *</label>
                                <input required type="email" placeholder="your@email.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Subject</label>
                                <input type="text" placeholder="How can we help?" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Message *</label>
                                <textarea required placeholder="Tell us about your property needs..." value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} style={{ minHeight: 140 }} />
                            </div>
                            <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
                                {loading ? 'Sending...' : 'Send Message →'}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}