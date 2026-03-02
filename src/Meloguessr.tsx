import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { collection, addDoc } from "firebase/firestore";
import { db, storage } from "./firebase";
import EXIF from "exif-js"; // 1. Added import

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

const extractGPS = (file: File): Promise<{lat: number, lng: number} | null> => {
    return new Promise((resolve) => {
        EXIF.getData(file as any, function(this: any) {
            const lat = EXIF.getTag(this, "GPSLatitude");
            const latRef = EXIF.getTag(this, "GPSLatitudeRef") || "N";
            const lon = EXIF.getTag(this, "GPSLongitude");
            const lonRef = EXIF.getTag(this, "GPSLongitudeRef") || "W";

            if (!lat || !lon) {
                resolve(null);
                return;
            }

            const toDecimal = (gps: any, ref: string) => {
                const d = gps[0].numerator / gps[0].denominator;
                const m = gps[1].numerator / gps[1].denominator;
                const s = gps[2].numerator / gps[2].denominator;
                let decimal = d + (m / 60) + (s / 3600);
                if (ref === "S" || ref === "W") decimal = decimal * -1;
                return decimal;
            };

            resolve({
                lat: toDecimal(lat, latRef),
                lng: toDecimal(lon, lonRef)
            });
        });
    });
};

const LocationPicker = ({ position, setPosition }: { position: any, setPosition: any }) => {
    useMapEvents({
        click(e) {
            setPosition(e.latlng);
        },
    });
    return position === null ? null : <Marker position={position}></Marker>;
};

const MapController = ({ position }: { position: any }) => {
    const map = useMap();
    useEffect(() => {
        if (position) {
            map.flyTo(position, 14, { duration: 1.5 });
        }
    }, [position, map]);
    return null;
};

export const Meloguessr = () => {
    const navigate = useNavigate();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [uploading, setUploading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [selectedLocation, setSelectedLocation] = useState<{lat: number, lng: number} | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [isSearching, setIsSearching] = useState(false);

    const handleUploadClick = () => fileInputRef.current?.click();

    const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
            setSearchQuery("");

            const gps = await extractGPS(file);
            if (gps) {
                setSelectedLocation(gps);
            } else {
                setSelectedLocation(null);
            }
        }
    };

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;
        setIsSearching(true);
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`);
            const data = await response.json();
            if (data && data.length > 0) {
                const { lat, lon } = data[0];
                const newPos = { lat: parseFloat(lat), lng: parseFloat(lon) };
                setSelectedLocation(newPos);
            } else {
                alert("Location not found! Try a broader search.");
            }
        } catch (error) {
            console.error("Search failed:", error);
            alert("Something went wrong with the search.");
        } finally {
            setIsSearching(false);
        }
    };

    const saveLocationToGame = async () => {
        if (!selectedFile || !selectedLocation) return;
        try {
            setUploading(true);
            const storageRef = ref(storage, `game-pics/${Date.now()}_${selectedFile.name}`);
            const uploadResult = await uploadBytes(storageRef, selectedFile);
            const downloadURL = await getDownloadURL(uploadResult.ref);

            await addDoc(collection(db, "locations"), {
                imageUrl: downloadURL,
                lat: selectedLocation.lat,
                lng: selectedLocation.lng,
                createdAt: new Date(),
            });

            alert("Memory saved to the map! 📸");
            setSelectedFile(null);
            setPreviewUrl(null);
            setSelectedLocation(null);
            setSearchQuery("");
        } catch (error) {
            console.error("Upload failed:", error);
            alert("Something went wrong with the upload.");
        } finally {
            setUploading(false);
        }
    };

    useEffect(() => {
        return () => { if (previewUrl) URL.revokeObjectURL(previewUrl); };
    }, [previewUrl]);

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            background: `radial-gradient(circle at 80% 50%, rgba(255, 195, 160, 0.5) 0%, rgba(255, 195, 160, 0) 55%), radial-gradient(circle at 20% 80%, rgba(129, 236, 214, 0.5) 0%, rgba(129, 236, 214, 0) 55%), #f9fafb`,
            fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
            <input type="file" ref={fileInputRef} onChange={onFileChange} style={{ display: 'none' }} accept="image/*" />

            <button
                onClick={() => navigate("/")}
                style={{
                    position: 'absolute', top: '24px', left: '24px', padding: '10px 20px', borderRadius: '999px', border: '1px solid rgba(255,255,255,0.4)',
                    backgroundColor: 'rgba(255, 255, 255, 0.6)', cursor: 'pointer', color: '#4B5563', fontWeight: '600', backdropFilter: 'blur(8px)',
                    transition: 'all 0.2s ease', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', zIndex: 10
                }}
                onMouseOver={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.9)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.6)'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
                ← Back Home
            </button>

            <div style={{
                backgroundColor: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(16px)', padding: '64px 48px',
                borderRadius: '48px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.08)', textAlign: 'center', maxWidth: '640px', width: '90%',
                maxHeight: '95vh', overflowY: 'auto', border: '1px solid rgba(255, 255, 255, 0.7)',
                backgroundImage: 'radial-gradient(#e5e7eb 1px, transparent 1px)', backgroundSize: '20px 20px'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', marginBottom: '12px' }}>
                    <div style={{ height: '1px', backgroundColor: '#D1D5DB', width: '40px' }}></div>
                    <span style={{ fontSize: '12px', color: '#9CA3AF', fontWeight: '600', letterSpacing: '2px', textTransform: 'uppercase' }}>PHOTO GAME</span>
                    <div style={{ height: '1px', backgroundColor: '#D1D5DB', width: '40px' }}></div>
                </div>

                <h1 style={{ margin: '0 0 24px 0', fontSize: '48px', color: '#111827', fontWeight: '800', letterSpacing: '-1px' }}>
                    Meloguessr
                </h1>

                <p style={{ color: '#6B7280', fontSize: '18px', margin: '0 0 36px 0', fontWeight: '400' }}>
                    {previewUrl ? "Search or tap the map to pin!" : "Guess where these pics were taken!"}
                </p>

                {previewUrl ? (
                    <div style={{
                        display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px', backgroundColor: '#ffffff',
                        borderRadius: '24px', border: '1px solid #E5E7EB', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
                    }}>
                        <img src={previewUrl} alt="Preview" style={{
                            width: '100%', maxHeight: '200px', objectFit: 'contain', borderRadius: '16px', marginBottom: '20px', backgroundColor: '#F3F4F6'
                        }} />

                        <form onSubmit={handleSearch} style={{ display: 'flex', width: '100%', gap: '8px', marginBottom: '16px' }}>
                            <input
                                type="text"
                                placeholder="Search an address, city, or place..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                style={{
                                    flex: 1, padding: '12px 16px', borderRadius: '12px', border: '1px solid #D1D5DB',
                                    fontSize: '14px', outline: 'none', fontFamily: 'inherit'
                                }}
                            />
                            <button
                                type="submit"
                                disabled={isSearching}
                                style={{
                                    padding: '0 20px', borderRadius: '12px', border: 'none', backgroundColor: '#111827',
                                    color: 'white', fontWeight: '600', cursor: isSearching ? 'not-allowed' : 'pointer',
                                    opacity: isSearching ? 0.7 : 1
                                }}
                            >
                                {isSearching ? "..." : "Find"}
                            </button>
                        </form>

                        <div style={{ width: '100%', height: '250px', borderRadius: '16px', overflow: 'hidden', marginBottom: '24px', border: '2px solid #E5E7EB' }}>
                            <MapContainer center={[37.33, -121.95]} zoom={11} style={{ height: '100%', width: '100%' }}>
                                <TileLayer
                                    attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
                                    url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                                />
                                <LocationPicker position={selectedLocation} setPosition={setSelectedLocation} />
                                <MapController position={selectedLocation} />
                            </MapContainer>
                        </div>

                        <div style={{ display: 'flex', gap: '12px', width: '100%', justifyContent: 'center' }}>
                            <button
                                onClick={() => {setSelectedFile(null); setPreviewUrl(null); setSelectedLocation(null); setSearchQuery("");}}
                                disabled={uploading}
                                style={{ padding: '12px 24px', borderRadius: '999px', border: '1px solid #E5E7EB', backgroundColor: '#ffffff', cursor: 'pointer', color: '#4B5563', fontWeight: '600' }}
                            >Cancel</button>
                            <button
                                onClick={saveLocationToGame}
                                disabled={uploading || !selectedLocation}
                                style={{
                                    padding: '12px 24px', borderRadius: '999px', border: 'none', backgroundColor: selectedLocation ? '#10B981' : '#D1D5DB',
                                    color: 'white', fontWeight: '600', cursor: (uploading || !selectedLocation) ? 'not-allowed' : 'pointer',
                                    opacity: uploading ? 0.7 : 1, transition: 'background-color 0.3s'
                                }}
                            >
                                {uploading ? "Uploading..." : selectedLocation ? "Save to Game" : "Pin a location first"}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <button
                            onClick={handleUploadClick}
                            style={{ padding: '16px 32px', borderRadius: '999px', border: '1px solid #E5E7EB', backgroundColor: '#ffffff', cursor: 'pointer', color: '#374151', fontWeight: '600', fontSize: '16px', transition: 'all 0.2s ease', boxShadow: '0 4px 6px rgba(0,0,0,0.02)', display: 'flex', alignItems: 'center', gap: '10px' }}
                            onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#F9FAFB'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                            onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#ffffff'; e.currentTarget.style.transform = 'translateY(0)'; }}
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line>
                            </svg>
                            Upload Images
                        </button>
                        <button
                            onClick={() => navigate("/play")}
                            style={{ padding: '16px 32px', borderRadius: '999px', border: 'none', backgroundColor: '#0F172A', cursor: 'pointer', color: '#ffffff', fontWeight: '600', fontSize: '16px', transition: 'all 0.2s ease', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', display: 'flex', alignItems: 'center', gap: '10px' }}
                            onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#1E293B'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1)'; }}
                            onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#0F172A'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)'; }}
                        >
                            Start a Game
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline>
                            </svg>
                        </button>

                        <button
                            onClick={() => navigate("/gallery")}
                            style={{ padding: '16px 32px', borderRadius: '999px', border: '1px solid #e5e7eb', backgroundColor: '#ffffff', cursor: 'pointer', color: '#111827', fontWeight: '600', fontSize: '16px', transition: 'all 0.2s ease', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', display: 'flex', alignItems: 'center', gap: '10px' }}
                            onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)'; }}
                            onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.05)'; }}
                        >
                            View Gallery
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                                <polyline points="21 15 16 10 5 21"></polyline>
                            </svg>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};