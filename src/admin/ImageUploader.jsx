import { useState, useRef } from 'react';
import { uploadAPI } from '../utility/api.jsx';
import './admin_css/ImageUploader.css';

/**
 * ImageUploader – Drag-and-drop / click-to-upload image picker.
 * Props:
 *  - urls: string[]  — current list of uploaded image URLs
 *  - onChange: (urls: string[]) => void
 */
export default function ImageUploader({ urls = [], onChange }) {
    const [uploading, setUploading] = useState(false);
    const [dragOver, setDragOver] = useState(false);
    const inputRef = useRef();

    const uploadFiles = async (files) => {
        if (!files || files.length === 0) return;
        setUploading(true);
        try {
            const form = new FormData();
            Array.from(files).forEach(f => form.append('images', f));
            const res = await uploadAPI.images(form);
            onChange([...urls, ...res.data.urls]);
        } catch (err) {
            alert(err.response?.data?.message || 'Upload failed. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    const handleFiles = (e) => uploadFiles(e.target.files);
    const handleDrop = (e) => {
        e.preventDefault();
        setDragOver(false);
        uploadFiles(e.dataTransfer.files);
    };
    const removeImage = (idx) => onChange(urls.filter((_, i) => i !== idx));

    return (
        <div className="img-uploader">
            {/* Drop Zone */}
            <div
                className={`img-drop-zone ${dragOver ? 'drag-active' : ''} ${uploading ? 'uploading' : ''}`}
                onClick={() => !uploading && inputRef.current.click()}
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
            >
                <input
                    ref={inputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handleFiles}
                />
                {uploading ? (
                    <div className="img-upload-spinner">
                        <div className="img-spin"></div>
                        <span>Uploading...</span>
                    </div>
                ) : (
                    <>
                        <div className="img-drop-icon">🖼️</div>
                        <p className="img-drop-label">Click or drag &amp; drop images here</p>
                        <p className="img-drop-hint">PNG, JPG, WEBP up to 10 MB • Multiple allowed</p>
                    </>
                )}
            </div>

            {/* Preview Grid */}
            {urls.length > 0 && (
                <div className="img-preview-grid">
                    {urls.map((url, i) => (
                        <div key={i} className="img-preview-item">
                            <img src={url} alt={`Upload ${i + 1}`} />
                            <button
                                type="button"
                                className="img-remove-btn"
                                onClick={() => removeImage(i)}
                                title="Remove image"
                            >✕</button>
                            {i === 0 && <span className="img-primary-badge">Cover</span>}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
