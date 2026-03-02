import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { collection, addDoc } from "firebase/firestore";
import { db, storage } from "./firebase";
import exifr from 'exifr';

import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// --- TYPES ---
interface UploadItem {
    file: File;
    previewUrl: string;
    location: { lat: number; lng: number } | null;
    id: string;
}

// --- HOOKS ---
const useIsMobile = () => {
    const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
    useEffect(() => {
        const handler = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handler);
        return () => window.removeEventListener('resize', handler);
    }, []);
    return isMobile;
};

// --- MAP COMPONENTS ---
const LocationPicker = ({ position, setPosition }: { position: any; setPosition: any }) => {
    useMapEvents({
        click(e) { setPosition(e.latlng); },
    });
    return position === null ? null : <Marker position={position}></Marker>;
};

const MapController = ({ position }: { position: any }) => {
    const map = useMap();
    useEffect(() => {
        if (position) map.flyTo(position, 14, { duration: 1.5 });
    }, [position, map]);
    return null;
};

// --- SHARED STYLES ---
const cardStyle: React.CSSProperties = {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    backdropFilter: 'blur(16px)',
    borderRadius: '32px',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.08)',
    border: '1px solid rgba(255, 255, 255, 0.7)',
};

const bgStyle: React.CSSProperties = {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    background: `radial-gradient(circle at 80% 50%, rgba(255, 195, 160, 0.5) 0%, rgba(255, 195, 160, 0) 55%),
                 radial-gradient(circle at 20% 80%, rgba(129, 236, 214, 0.5) 0%, rgba(129, 236, 214, 0) 55%), #f9fafb`,
    fontFamily: 'system-ui, -apple-system, sans-serif',
};

// ─────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────
export const Meloguessr = () => {
    const navigate = useNavigate();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const isMobile = useIsMobile();

    const [uploadQueue, setUploadQueue] = useState<UploadItem[]>([]);
    const [activeIndex, setActiveIndex] = useState<number>(0);
    const [uploading, setUploading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [isSearching, setIsSearching] = useState(false);
    // Mobile-only: whether the bottom sheet panel is expanded
    const [sheetExpanded, setSheetExpanded] = useState(false);

    const activeItem = uploadQueue[activeIndex];
    const allPinned = uploadQueue.length > 0 && uploadQueue.every(i => i.location !== null);
    const pinnedCount = uploadQueue.filter(i => i.location).length;

    // --- LOGIC ---
    const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;
        const newItems: UploadItem[] = await Promise.all(
            files.map(async (file) => {
                const gps = await exifr.gps(file).catch(() => null);
                return {
                    file,
                    previewUrl: URL.createObjectURL(file),
                    location: gps ? { lat: gps.latitude, lng: gps.longitude } : null,
                    id: Math.random().toString(36).substr(2, 9),
                };
            })
        );
        setUploadQueue(prev => [...prev, ...newItems]);
        setActiveIndex(uploadQueue.length);
        setSearchQuery("");
        if (isMobile) setSheetExpanded(true);
    };

    const updateCurrentLocation = (loc: { lat: number; lng: number } | null) => {
        setUploadQueue(prev =>
            prev.map((item, idx) => idx === activeIndex ? { ...item, location: loc } : item)
        );
    };

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;
        setIsSearching(true);
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`
            );
            const data = await response.json();
            if (data && data.length > 0) {
                const { lat, lon } = data[0];
                updateCurrentLocation({ lat: parseFloat(lat), lng: parseFloat(lon) });
                if (isMobile) setSheetExpanded(false); // collapse to reveal map after search
            } else {
                alert("Location not found! Try a broader search.");
            }
        } catch {
            alert("Something went wrong with the search.");
        } finally {
            setIsSearching(false);
        }
    };

    const saveAllToGame = async () => {
        const itemsToUpload = uploadQueue.filter(i => i.location !== null);
        if (itemsToUpload.length === 0) return;
        setUploading(true);
        try {
            for (const item of itemsToUpload) {
                const storageRef = ref(storage, `game-pics/${Date.now()}_${item.file.name}`);
                const uploadResult = await uploadBytes(storageRef, item.file);
                const downloadURL = await getDownloadURL(uploadResult.ref);
                await addDoc(collection(db, "locations"), {
                    imageUrl: downloadURL,
                    lat: item.location!.lat,
                    lng: item.location!.lng,
                    createdAt: new Date(),
                });
            }
            alert(`${itemsToUpload.length} ${itemsToUpload.length === 1 ? 'memory' : 'memories'} saved! 📸`);
            setUploadQueue([]);
            setActiveIndex(0);
            setSearchQuery("");
            setSheetExpanded(false);
        } catch (error) {
            console.error(error);
            alert("Something went wrong during the upload.");
        } finally {
            setUploading(false);
        }
    };

    const cancelAll = () => {
        uploadQueue.forEach(i => URL.revokeObjectURL(i.previewUrl));
        setUploadQueue([]);
        setActiveIndex(0);
        setSearchQuery("");
        setSheetExpanded(false);
    };

    useEffect(() => {
        return () => { uploadQueue.forEach(i => URL.revokeObjectURL(i.previewUrl)); };
    }, []);

    // ─────────────────────────────────────────────
    // SHARED: EMPTY / LANDING STATE
    // ─────────────────────────────────────────────
    if (uploadQueue.length === 0) {
        return (
            <div style={{ ...bgStyle, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <input type="file" ref={fileInputRef} onChange={onFileChange} style={{ display: 'none' }} accept="image/*" multiple />

                {!isMobile && (
                    <button
                        onClick={() => navigate("/")}
                        style={{
                            position: 'absolute', top: '24px', left: '24px', padding: '10px 20px',
                            borderRadius: '999px', border: '1px solid rgba(255,255,255,0.4)',
                            backgroundColor: 'rgba(255, 255, 255, 0.6)', cursor: 'pointer', color: '#4B5563',
                            fontWeight: '600', backdropFilter: 'blur(8px)', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', zIndex: 10,
                        }}
                        onMouseOver={e => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.9)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                        onMouseOut={e => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.6)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                    >
                        ← Back Home
                    </button>
                )}

                <div style={{
                    ...cardStyle,
                    padding: isMobile ? '40px 28px' : '64px 48px',
                    textAlign: 'center',
                    maxWidth: '640px',
                    width: isMobile ? '92%' : '90%',
                    backgroundImage: 'radial-gradient(#e5e7eb 1px, transparent 1px)',
                    backgroundSize: '20px 20px',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', marginBottom: '12px' }}>
                        <div style={{ height: '1px', backgroundColor: '#D1D5DB', width: '40px' }}></div>
                        <span style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: '600', letterSpacing: '2px', textTransform: 'uppercase' }}>PHOTO GAME</span>
                        <div style={{ height: '1px', backgroundColor: '#D1D5DB', width: '40px' }}></div>
                    </div>

                    <h1 style={{ margin: '0 0 16px 0', fontSize: isMobile ? '38px' : '48px', color: '#111827', fontWeight: '800', letterSpacing: '-1px' }}>
                        Meloguessr
                    </h1>
                    <p style={{ color: '#6B7280', fontSize: isMobile ? '16px' : '18px', margin: '0 0 32px 0' }}>
                        Guess where these pics were taken!
                    </p>

                    <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
                        {isMobile && (
                            <button
                                onClick={() => navigate("/")}
                                style={{ padding: '14px 24px', borderRadius: '999px', border: '1px solid #E5E7EB', backgroundColor: '#ffffff', cursor: 'pointer', color: '#4B5563', fontWeight: '600', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}
                            >
                                ← Home
                            </button>
                        )}
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            style={{ padding: isMobile ? '14px 24px' : '16px 32px', borderRadius: '999px', border: '1px solid #E5E7EB', backgroundColor: '#ffffff', cursor: 'pointer', color: '#374151', fontWeight: '600', fontSize: isMobile ? '15px' : '16px', transition: 'all 0.2s ease', display: 'flex', alignItems: 'center', gap: '10px' }}
                            onMouseOver={e => { e.currentTarget.style.backgroundColor = '#F9FAFB'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                            onMouseOut={e => { e.currentTarget.style.backgroundColor = '#ffffff'; e.currentTarget.style.transform = 'translateY(0)'; }}
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                <polyline points="17 8 12 3 7 8"></polyline>
                                <line x1="12" y1="3" x2="12" y2="15"></line>
                            </svg>
                            Upload
                        </button>

                        <button
                            onClick={() => navigate("/play")}
                            style={{ padding: isMobile ? '14px 24px' : '16px 32px', borderRadius: '999px', border: 'none', backgroundColor: '#0F172A', cursor: 'pointer', color: '#ffffff', fontWeight: '600', fontSize: isMobile ? '15px' : '16px', transition: 'all 0.2s ease', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: '10px' }}
                            onMouseOver={e => { e.currentTarget.style.backgroundColor = '#1E293B'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                            onMouseOut={e => { e.currentTarget.style.backgroundColor = '#0F172A'; e.currentTarget.style.transform = 'translateY(0)'; }}
                        >
                            Play
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline>
                            </svg>
                        </button>

                        <button
                            onClick={() => navigate("/gallery")}
                            style={{ padding: isMobile ? '14px 24px' : '16px 32px', borderRadius: '999px', border: '1px solid #e5e7eb', backgroundColor: '#ffffff', cursor: 'pointer', color: '#111827', fontWeight: '600', fontSize: isMobile ? '15px' : '16px', transition: 'all 0.2s ease', display: 'flex', alignItems: 'center', gap: '10px' }}
                            onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
                            onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
                        >
                            Gallery
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                                <polyline points="21 15 16 10 5 21"></polyline>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (isMobile) {
        return (
            <div style={{ ...bgStyle, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <input type="file" ref={fileInputRef} onChange={onFileChange} style={{ display: 'none' }} accept="image/*" multiple />

                {/* Map fills entire screen */}
                <div style={{ position: 'absolute', inset: 0 }}>
                    {activeItem && (
                        <MapContainer center={[37.33, -121.95]} zoom={4} style={{ height: '100%', width: '100%' }}>
                            <TileLayer
                                attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
                                url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                            />
                            <LocationPicker position={activeItem.location} setPosition={(loc: any) => { updateCurrentLocation(loc); }} />
                            <MapController position={activeItem.location} />
                        </MapContainer>
                    )}
                </div>

                {/* Top bar */}
                <div style={{
                    position: 'relative', zIndex: 1000, display: 'flex', alignItems: 'center',
                    justifyContent: 'space-between', padding: '12px 16px',
                    backdropFilter: 'blur(16px)', backgroundColor: 'rgba(255,255,255,0.85)',
                    borderBottom: '1px solid rgba(255,255,255,0.6)',
                }}>
                    <button
                        onClick={() => navigate("/")}
                        style={{ padding: '8px 14px', borderRadius: '999px', border: '1px solid #E5E7EB', backgroundColor: 'rgba(255,255,255,0.8)', cursor: 'pointer', color: '#4B5563', fontWeight: '600', fontSize: '13px' }}
                    >
                        ← Back
                    </button>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <span style={{ fontSize: '15px', fontWeight: '800', color: '#111827', letterSpacing: '-0.3px' }}>Meloguessr</span>
                        <span style={{ fontSize: '11px', color: '#9CA3AF' }}>{pinnedCount}/{uploadQueue.length} pinned</span>
                    </div>

                    <button
                        onClick={saveAllToGame}
                        disabled={uploading || !allPinned}
                        style={{
                            padding: '8px 14px', borderRadius: '999px', border: 'none',
                            backgroundColor: allPinned ? '#10B981' : '#D1D5DB',
                            color: 'white', fontWeight: '700', fontSize: '13px',
                            cursor: (uploading || !allPinned) ? 'not-allowed' : 'pointer',
                            boxShadow: allPinned ? '0 4px 12px rgba(16,185,129,0.35)' : 'none',
                            transition: 'all 0.3s',
                        }}
                    >
                        {uploading ? "..." : "Save All"}
                    </button>
                </div>

                {/* Tap-to-pin hint — only shows when sheet is collapsed */}
                {!sheetExpanded && (
                    <div style={{ position: 'absolute', top: '72px', left: '50%', transform: 'translateX(-50%)', zIndex: 999, pointerEvents: 'none' }}>
                        <span style={{
                            fontSize: '12px', color: '#4B5563', backgroundColor: 'rgba(255,255,255,0.85)',
                            padding: '6px 14px', borderRadius: '999px', backdropFilter: 'blur(8px)',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.08)', whiteSpace: 'nowrap',
                            border: '1px solid rgba(255,255,255,0.7)',
                        }}>
                            Tap the map to drop a pin
                        </span>
                    </div>
                )}

                {/* Bottom sheet */}
                <div style={{
                    position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 1000,
                    backgroundColor: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(20px)',
                    borderRadius: '28px 28px 0 0',
                    boxShadow: '0 -8px 32px rgba(0,0,0,0.12)',
                    border: '1px solid rgba(255,255,255,0.8)',
                    maxHeight: sheetExpanded ? '72vh' : 'auto',
                    overflow: sheetExpanded ? 'auto' : 'visible',
                    transition: 'max-height 0.35s cubic-bezier(0.32, 0.72, 0, 1)',
                }}>
                    {/* Drag handle + toggle header */}
                    <div
                        onClick={() => setSheetExpanded(prev => !prev)}
                        style={{ padding: '12px 16px 8px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}
                    >
                        <div style={{ width: '36px', height: '4px', backgroundColor: '#D1D5DB', borderRadius: '999px' }}></div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                            <span style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: '700', letterSpacing: '1.5px', textTransform: 'uppercase' }}>Your Photos</span>
                            <span style={{ fontSize: '12px', color: '#6B7280', fontWeight: '500' }}>{sheetExpanded ? 'Collapse ↓' : 'Expand ↑'}</span>
                        </div>
                    </div>

                    {/* Horizontal thumbnail strip — always visible */}
                    <div style={{ padding: '4px 16px 14px', display: 'flex', gap: '10px', overflowX: 'auto', scrollbarWidth: 'none' }}>
                        {uploadQueue.map((item, idx) => (
                            <div
                                key={item.id}
                                onClick={() => { setActiveIndex(idx); setSheetExpanded(false); setSearchQuery(""); }}
                                style={{
                                    flexShrink: 0, position: 'relative', cursor: 'pointer',
                                    borderRadius: '14px',
                                    outline: activeIndex === idx ? '3px solid #10B981' : '3px solid transparent',
                                    outlineOffset: '1px',
                                    transition: 'outline-color 0.15s',
                                }}
                            >
                                <img
                                    src={item.previewUrl}
                                    style={{ width: '64px', height: '64px', objectFit: 'cover', borderRadius: '11px', display: 'block' }}
                                />
                                {item.location
                                    ? <div style={{ position: 'absolute', top: -5, right: -5, background: '#10B981', color: 'white', borderRadius: '50%', width: '18px', height: '18px', fontSize: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>✓</div>
                                    : <div style={{ position: 'absolute', top: -5, right: -5, background: '#EF4444', color: 'white', borderRadius: '50%', width: '18px', height: '18px', fontSize: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>!</div>
                                }
                            </div>
                        ))}
                        {/* Add more button */}
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            style={{
                                flexShrink: 0, width: '64px', height: '64px', borderRadius: '14px',
                                border: '2px dashed #D1D5DB', display: 'flex', alignItems: 'center',
                                justifyContent: 'center', color: '#9CA3AF', fontSize: '24px', cursor: 'pointer',
                                backgroundColor: 'rgba(249,250,251,0.8)',
                            }}
                        >+</div>
                    </div>

                    {/* Expanded panel: photo preview + search + coords */}
                    {sheetExpanded && activeItem && (
                        <div style={{ padding: '4px 16px 32px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div style={{ height: '1px', backgroundColor: '#F3F4F6' }}></div>

                            <img
                                src={activeItem.previewUrl}
                                alt="Preview"
                                style={{ width: '100%', maxHeight: '180px', objectFit: 'contain', borderRadius: '16px', backgroundColor: '#F9FAFB' }}
                            />

                            <form onSubmit={handleSearch} style={{ display: 'flex', gap: '8px' }}>
                                <input
                                    type="text"
                                    placeholder="Search an address or city..."
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    style={{
                                        flex: 1, padding: '12px 14px', borderRadius: '14px', border: '1px solid #E5E7EB',
                                        fontSize: '14px', outline: 'none', fontFamily: 'inherit',
                                        backgroundColor: '#F9FAFB',
                                    }}
                                />
                                <button
                                    type="submit"
                                    disabled={isSearching}
                                    style={{ padding: '0 18px', borderRadius: '14px', border: 'none', backgroundColor: '#111827', color: 'white', fontWeight: '600', cursor: isSearching ? 'not-allowed' : 'pointer', opacity: isSearching ? 0.6 : 1, fontSize: '14px', minWidth: '60px' }}
                                >
                                    {isSearching ? "..." : "Find"}
                                </button>
                            </form>

                            {activeItem.location ? (
                                <div style={{ padding: '12px 14px', backgroundColor: 'rgba(16,185,129,0.08)', borderRadius: '14px', border: '1px solid rgba(16,185,129,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                                    <div>
                                        <p style={{ margin: 0, fontSize: '12px', color: '#10B981', fontWeight: '700' }}>📍 Location pinned</p>
                                        <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#6B7280' }}>
                                            {activeItem.location.lat.toFixed(4)}, {activeItem.location.lng.toFixed(4)}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => setSheetExpanded(false)}
                                        style={{ padding: '8px 16px', borderRadius: '999px', border: 'none', backgroundColor: '#10B981', color: 'white', fontWeight: '600', fontSize: '12px', cursor: 'pointer', flexShrink: 0 }}
                                    >
                                        View Map
                                    </button>
                                </div>
                            ) : (
                                <div style={{ padding: '12px 14px', backgroundColor: 'rgba(239,68,68,0.06)', borderRadius: '14px', border: '1px solid rgba(239,68,68,0.15)', textAlign: 'center' }}>
                                    <p style={{ margin: 0, fontSize: '12px', color: '#EF4444', fontWeight: '600' }}>Search above, or collapse & tap the map 👆</p>
                                </div>
                            )}

                            <button
                                onClick={cancelAll}
                                style={{ padding: '12px', borderRadius: '14px', border: '1px solid #E5E7EB', backgroundColor: 'transparent', cursor: 'pointer', color: '#9CA3AF', fontWeight: '600', fontSize: '13px', marginTop: '4px' }}
                            >
                                Cancel All & Start Over
                            </button>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // ─────────────────────────────────────────────
    // DESKTOP: BULK UPLOAD (unchanged layout)
    // ─────────────────────────────────────────────
    return (
        <div style={{ ...bgStyle, display: 'flex', flexDirection: 'column' }}>
            <input type="file" ref={fileInputRef} onChange={onFileChange} style={{ display: 'none' }} accept="image/*" multiple />

            {/* Header */}
            <div style={{
                padding: '16px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                backdropFilter: 'blur(16px)', backgroundColor: 'rgba(255,255,255,0.7)',
                borderBottom: '1px solid rgba(255,255,255,0.6)',
            }}>
                <button
                    onClick={() => navigate("/")}
                    style={{ padding: '10px 20px', borderRadius: '999px', border: '1px solid rgba(255,255,255,0.4)', backgroundColor: 'rgba(255,255,255,0.6)', cursor: 'pointer', color: '#4B5563', fontWeight: '600', backdropFilter: 'blur(8px)' }}
                    onMouseOver={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.9)'}
                    onMouseOut={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.6)'}
                >
                    ← Back Home
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <h2 style={{ margin: 0, fontSize: '22px', fontWeight: '800', color: '#111827', letterSpacing: '-0.5px' }}>
                        Meloguessr
                    </h2>
                    <span style={{ fontSize: '13px', color: '#6B7280', backgroundColor: 'rgba(0,0,0,0.05)', padding: '4px 12px', borderRadius: '999px' }}>
                        {pinnedCount}/{uploadQueue.length} pinned
                    </span>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                        onClick={cancelAll}
                        style={{ padding: '10px 20px', borderRadius: '999px', border: '1px solid #E5E7EB', backgroundColor: 'rgba(255,255,255,0.8)', cursor: 'pointer', color: '#4B5563', fontWeight: '600', backdropFilter: 'blur(8px)' }}
                    >
                        Cancel All
                    </button>
                    <button
                        onClick={saveAllToGame}
                        disabled={uploading || !allPinned}
                        style={{
                            padding: '10px 24px', borderRadius: '999px', border: 'none',
                            backgroundColor: allPinned ? '#10B981' : '#D1D5DB',
                            color: 'white', fontWeight: '600', cursor: (uploading || !allPinned) ? 'not-allowed' : 'pointer',
                            opacity: uploading ? 0.7 : 1, transition: 'background-color 0.3s',
                            boxShadow: allPinned ? '0 10px 15px -3px rgba(16,185,129,0.3)' : 'none',
                        }}
                    >
                        {uploading ? "Uploading..." : allPinned ? `Save All ${uploadQueue.length} Photos` : "Pin all photos first"}
                    </button>
                </div>
            </div>

            {/* Body */}
            <div style={{ display: 'flex', flex: 1, overflow: 'hidden', padding: '20px', gap: '20px' }}>

                {/* Sidebar Queue */}
                <div style={{
                    ...cardStyle, width: '260px', overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '8px',
                    backgroundImage: 'radial-gradient(#e5e7eb 1px, transparent 1px)', backgroundSize: '20px 20px',
                }}>
                    <p style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: '700', letterSpacing: '2px', textTransform: 'uppercase', margin: '0 0 8px 0' }}>
                        Your Photos
                    </p>

                    {uploadQueue.map((item, idx) => (
                        <div
                            key={item.id}
                            onClick={() => { setActiveIndex(idx); setSearchQuery(""); }}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', borderRadius: '16px',
                                cursor: 'pointer', transition: 'all 0.15s ease',
                                border: activeIndex === idx ? '2px solid #10B981' : '2px solid transparent',
                                backgroundColor: activeIndex === idx ? 'rgba(16,185,129,0.08)' : 'rgba(255,255,255,0.5)',
                                backdropFilter: 'blur(8px)',
                            }}
                        >
                            <div style={{ position: 'relative', flexShrink: 0 }}>
                                <img src={item.previewUrl} style={{ width: '52px', height: '52px', objectFit: 'cover', borderRadius: '10px', display: 'block' }} />
                                {item.location && (
                                    <div style={{ position: 'absolute', top: -6, right: -6, background: '#10B981', color: 'white', borderRadius: '50%', width: '18px', height: '18px', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', boxShadow: '0 2px 4px rgba(0,0,0,0.15)' }}>✓</div>
                                )}
                            </div>
                            <div style={{ overflow: 'hidden', flex: 1 }}>
                                <p style={{ margin: 0, fontSize: '12px', fontWeight: '600', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: '#111827' }}>
                                    {item.file.name}
                                </p>
                                <p style={{ margin: '2px 0 0', fontSize: '11px', color: item.location ? '#10B981' : '#EF4444', fontWeight: '500' }}>
                                    {item.location ? "Location set ✓" : "Needs a pin"}
                                </p>
                            </div>
                        </div>
                    ))}

                    <button
                        onClick={() => fileInputRef.current?.click()}
                        style={{ marginTop: '4px', width: '100%', padding: '12px', border: '2px dashed #D1D5DB', borderRadius: '16px', background: 'none', color: '#9CA3AF', cursor: 'pointer', fontWeight: '600', fontSize: '13px', transition: 'all 0.2s' }}
                        onMouseOver={e => { e.currentTarget.style.borderColor = '#10B981'; e.currentTarget.style.color = '#10B981'; }}
                        onMouseOut={e => { e.currentTarget.style.borderColor = '#D1D5DB'; e.currentTarget.style.color = '#9CA3AF'; }}
                    >
                        + Add More
                    </button>
                </div>

                {/* Main workspace */}
                {activeItem && (
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px', overflow: 'hidden' }}>
                        <div style={{ textAlign: 'center' }}>
                            <span style={{ fontSize: '13px', color: '#6B7280', backgroundColor: 'rgba(255,255,255,0.7)', padding: '6px 16px', borderRadius: '999px', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.6)' }}>
                                Search for a location or click the map to drop a pin
                            </span>
                        </div>

                        <div style={{ display: 'flex', gap: '16px', flex: 1, overflow: 'hidden' }}>
                            {/* Left: photo + search */}
                            <div style={{ width: '320px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <div style={{ ...cardStyle, padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    <img
                                        src={activeItem.previewUrl}
                                        alt="Preview"
                                        style={{ width: '100%', maxHeight: '220px', objectFit: 'contain', borderRadius: '16px', backgroundColor: '#F3F4F6' }}
                                    />
                                    <form onSubmit={handleSearch} style={{ display: 'flex', gap: '8px' }}>
                                        <input
                                            type="text"
                                            placeholder="Search an address or city..."
                                            value={searchQuery}
                                            onChange={e => setSearchQuery(e.target.value)}
                                            style={{ flex: 1, padding: '10px 14px', borderRadius: '12px', border: '1px solid #E5E7EB', fontSize: '13px', outline: 'none', fontFamily: 'inherit' }}
                                        />
                                        <button
                                            type="submit"
                                            disabled={isSearching}
                                            style={{ padding: '0 18px', borderRadius: '12px', border: 'none', backgroundColor: '#111827', color: 'white', fontWeight: '600', cursor: isSearching ? 'not-allowed' : 'pointer', opacity: isSearching ? 0.6 : 1, fontSize: '13px' }}
                                        >
                                            {isSearching ? "..." : "Find"}
                                        </button>
                                    </form>

                                    {activeItem.location && (
                                        <div style={{ padding: '10px 14px', backgroundColor: 'rgba(16,185,129,0.08)', borderRadius: '12px', border: '1px solid rgba(16,185,129,0.2)' }}>
                                            <p style={{ margin: 0, fontSize: '11px', color: '#10B981', fontWeight: '600' }}>📍 Location pinned</p>
                                            <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#6B7280' }}>
                                                {activeItem.location.lat.toFixed(4)}, {activeItem.location.lng.toFixed(4)}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Map */}
                            <div style={{ flex: 1, borderRadius: '32px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.1)', border: '4px solid rgba(255,255,255,0.8)' }}>
                                <MapContainer center={[37.33, -121.95]} zoom={4} style={{ height: '100%', width: '100%' }}>
                                    <TileLayer
                                        attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
                                        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                                    />
                                    <LocationPicker position={activeItem.location} setPosition={updateCurrentLocation} />
                                    <MapController position={activeItem.location} />
                                </MapContainer>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};