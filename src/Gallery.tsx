import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebase";

export const Gallery = () => {
    const navigate = useNavigate();
    const [images, setImages] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    // State to track which image is currently open in the lightbox
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    useEffect(() => {
        const fetchImages = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, "locations"));
                const loadedImages: string[] = [];
                querySnapshot.forEach((doc) => {
                    const data = doc.data();
                    if (data.imageUrl) {
                        loadedImages.push(data.imageUrl);
                    }
                });
                setImages(loadedImages);
            } catch (error) {
                console.error("Error fetching images: ", error);
            } finally {
                setLoading(false);
            }
        };

        fetchImages();
    }, []);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setSelectedImage(null);
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    return (
        <div style={{
            minHeight: '100vh',
            background: `radial-gradient(circle at 80% 50%, rgba(255, 195, 160, 0.2) 0%, rgba(255, 195, 160, 0) 55%),
                         radial-gradient(circle at 20% 80%, rgba(129, 236, 214, 0.2) 0%, rgba(129, 236, 214, 0) 55%),
                         #f9fafb`,
            fontFamily: 'system-ui, -apple-system, sans-serif',
            padding: '40px 20px',
            boxSizing: 'border-box',
            position: 'relative'
        }}>
            {/* Header and Back Button */}
            <div style={{ maxWidth: '1200px', margin: '0 auto', marginBottom: '40px', display: 'flex', alignItems: 'center', gap: '20px' }}>
                <button
                    onClick={() => navigate("/meloguessr")}
                    style={{
                        padding: '10px 20px', borderRadius: '999px', border: '1px solid #e5e7eb',
                        backgroundColor: 'white', cursor: 'pointer', color: '#4B5563', fontWeight: '600',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '8px',
                        transition: 'all 0.2s ease'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.transform = 'translateX(-4px)'}
                    onMouseOut={(e) => e.currentTarget.style.transform = 'translateX(0)'}
                >
                    ← Back
                </button>
                <h1 style={{ margin: 0, fontSize: '32px', color: '#111827', fontWeight: '800' }}>
                    Gallery
                </h1>
            </div>

            {/* Image Grid */}
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                {loading ? (
                    <p style={{ textAlign: 'center', color: '#6B7280', fontSize: '18px', marginTop: '40px' }}>Loading your gallery...</p>
                ) : images.length === 0 ? (
                    <p style={{ textAlign: 'center', color: '#6B7280', fontSize: '18px', marginTop: '40px' }}>No images uploaded yet!</p>
                ) : (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                        gap: '24px'
                    }}>
                        {images.map((url, index) => (
                            <div
                                key={index}
                                onClick={() => setSelectedImage(url)}
                                style={{
                                    width: '100%',
                                    paddingTop: '100%',
                                    position: 'relative',
                                    borderRadius: '16px',
                                    overflow: 'hidden',
                                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                                    cursor: 'pointer'
                                }}
                            >
                                <img
                                    src={url}
                                    alt={`Memory ${index + 1}`}
                                    style={{
                                        position: 'absolute', top: 0, left: 0,
                                        width: '100%', height: '100%', objectFit: 'cover',
                                        transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
                                    }}
                                    onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.08)'}
                                    onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                />
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* --- THE LIGHTBOX OVERLAY --- */}
            {selectedImage && (
                <div
                    onClick={() => setSelectedImage(null)}
                    style={{
                        position: 'fixed',
                        top: 0, left: 0, width: '100vw', height: '100vh',
                        backgroundColor: 'rgba(0, 0, 0, 0.85)',
                        backdropFilter: 'blur(8px)',
                        display: 'flex', justifyContent: 'center', alignItems: 'center',
                        zIndex: 1000,
                        cursor: 'zoom-out',
                        padding: '40px',
                        boxSizing: 'border-box'
                    }}
                >
                    <button
                        onClick={() => setSelectedImage(null)}
                        style={{
                            position: 'absolute', top: '24px', right: '32px',
                            background: 'none', border: 'none', color: 'white',
                            fontSize: '40px', fontWeight: '300', cursor: 'pointer',
                            zIndex: 1001
                        }}
                    >
                        &times;
                    </button>

                    <img
                        src={selectedImage}
                        alt="Enlarged Memory"
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            maxWidth: '100%',
                            maxHeight: '100%',
                            objectFit: 'contain',
                            borderRadius: '12px',
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                            cursor: 'default'
                        }}
                    />
                </div>
            )}
        </div>
    );
};