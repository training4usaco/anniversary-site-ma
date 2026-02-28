import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebase";
import { MapContainer, TileLayer, Marker, Polyline, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default map marker icons
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({ iconUrl: icon, shadowUrl: iconShadow, iconSize: [25, 41], iconAnchor: [12, 41] });
L.Marker.prototype.options.icon = DefaultIcon;

const guessIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const actualIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

// Helper to let user place a guess
const GuessPicker = ({ position, setPosition, disabled }: { position: any, setPosition: any, disabled: boolean }) => {
    useMapEvents({
        click(e) {
            if (!disabled) setPosition(e.latlng);
        },
    });
    return position === null ? null : <Marker position={position}></Marker>;
};

// Map auto-framer for the results screen
const ResultMapController = ({ guess, actual }: { guess: any, actual: any }) => {
    const map = useMap();
    useEffect(() => {
        if (guess && actual) {
            const bounds = L.latLngBounds([guess, actual]);
            map.fitBounds(bounds, { padding: [50, 50] });
        }
    }, [guess, actual, map]);
    return null;
};

export const Play = () => {
    const navigate = useNavigate();

    // Game Flow States
    const [loading, setLoading] = useState(true);
    const [gameLocations, setGameLocations] = useState<any[]>([]);
    const [currentRound, setCurrentRound] = useState(1);
    const [totalScore, setTotalScore] = useState(0);
    const [gameState, setGameState] = useState<'playing' | 'result' | 'summary'>('playing');

    // Round Specific States
    const [guess, setGuess] = useState<{lat: number, lng: number} | null>(null);
    const [roundScore, setRoundScore] = useState(0);
    const [distanceStr, setDistanceStr] = useState("");

    // Random crop coordinates (0 to 100%)
    const [cropX, setCropX] = useState(0);
    const [cropY, setCropY] = useState(0);

    // 1. Fetch 5 random locations on load
    useEffect(() => {
        const initGame = async () => {
            const querySnapshot = await getDocs(collection(db, "locations"));
            const locations: any[] = [];
            querySnapshot.forEach((doc) => locations.push(doc.data()));

            if (locations.length > 0) {
                // Shuffle array and grab up to 5
                const shuffled = locations.sort(() => 0.5 - Math.random());
                const selected = shuffled.slice(0, 5);
                setGameLocations(selected);

                // Pick random crop percentages for round 1
                setCropX(Math.floor(Math.random() * 100));
                setCropY(Math.floor(Math.random() * 100));
            }
            setLoading(false);
        };
        initGame();
    }, []);

    // 2. The Math! Calculate Distance & Score
    const calculateScore = () => {
        const currentLocation = gameLocations[currentRound - 1];
        if (!guess || !currentLocation) return;

        const R = 6371e3; // Earth's radius in meters
        const lat1 = guess.lat * Math.PI / 180;
        const lat2 = currentLocation.lat * Math.PI / 180;
        const deltaLat = (currentLocation.lat - guess.lat) * Math.PI / 180;
        const deltaLng = (currentLocation.lng - guess.lng) * Math.PI / 180;

        const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
            Math.cos(lat1) * Math.cos(lat2) *
            Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distanceMeters = R * c;

        // Display distance nicely
        if (distanceMeters < 1000) {
            setDistanceStr(`${Math.round(distanceMeters)} m`);
        } else {
            setDistanceStr(`${(distanceMeters / 1609.34).toFixed(2)} miles`);
        }

        const MAX_DISTANCE = 3 * 1609.34;

        let finalScore = 0;
        if (distanceMeters < MAX_DISTANCE) {
            // Linear scaling: (1 - percentage of max distance reached) * 5000
            finalScore = Math.round(5000 * (1 - (distanceMeters / MAX_DISTANCE)));
        } else {
            finalScore = 0; // Over max distance = 0 points
        }

        setRoundScore(finalScore);
        setTotalScore(prev => prev + finalScore);
        setGameState('result');
    };

    // 3. Handle transitioning between rounds
    const handleNext = () => {
        if (currentRound < gameLocations.length) {
            setCurrentRound(prev => prev + 1);
            setGuess(null);
            setCropX(Math.floor(Math.random() * 100));
            setCropY(Math.floor(Math.random() * 100));
            setGameState('playing');
        } else {
            setGameState('summary');
        }
    };

    if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'system-ui' }}>Loading round...</div>;
    if (gameLocations.length === 0) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'system-ui' }}>No locations found! Upload some photos first.</div>;

    const currentLocation = gameLocations[currentRound - 1];

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px 16px',
            background: `radial-gradient(circle at 80% 50%, rgba(255, 195, 160, 0.3) 0%, rgba(255, 195, 160, 0) 55%), radial-gradient(circle at 20% 80%, rgba(129, 236, 214, 0.3) 0%, rgba(129, 236, 214, 0) 55%), #f9fafb`,
            fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>

            <button onClick={() => navigate("/meloguessr")} style={{ position: 'absolute', top: '24px', left: '24px', padding: '10px 20px', borderRadius: '999px', border: '1px solid rgba(255,255,255,0.4)', backgroundColor: 'rgba(255, 255, 255, 0.6)', cursor: 'pointer', color: '#4B5563', fontWeight: '600', backdropFilter: 'blur(8px)', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', zIndex: 10 }}>
                ← Quit Game
            </button>

            {/* Header Stats */}
            {gameState !== 'summary' && (
                <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', backgroundColor: 'rgba(255,255,255,0.8)', padding: '10px 24px', borderRadius: '999px', backdropFilter: 'blur(8px)', fontWeight: '700', color: '#374151' }}>
                    <span>Round {currentRound} / {gameLocations.length}</span>
                    <span>•</span>
                    <span>Total Score: {totalScore}</span>
                </div>
            )}

            <div style={{
                backgroundColor: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(16px)', padding: '20px',
                borderRadius: '40px', boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.1)', width: '100%', maxWidth: '800px',
                border: '1px solid rgba(255, 255, 255, 0.8)', textAlign: 'center'
            }}>

                {gameState === 'playing' ? (
                    <>
                        <h2 style={{ margin: '0 0 16px 0', color: '#111827', fontSize: '28px' }}>Where is this?</h2>

                        {/* THE CROPPED IMAGE VIEWER */}
                        <div style={{
                            width: '100%', height: '200px', borderRadius: '24px', marginBottom: '16px',
                            overflow: 'hidden',
                            border: '4px solid #F3F4F6',
                            boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                        }}>
                            <div style={{
                                width: '100%',
                                height: '100%',
                                backgroundImage: `url(${currentLocation.imageUrl})`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                transform: 'scale(2)',
                                transformOrigin: `${cropX}% ${cropY}%`,
                            }}></div>
                        </div>

                        {/* GUESSING MAP */}
                        <div style={{ width: '100%', height: '260px', borderRadius: '24px', overflow: 'hidden', border: '2px solid #E5E7EB', marginBottom: '16px' }}>
                            <MapContainer center={[37.33, -121.95]} zoom={11} style={{ height: '100%', width: '100%' }}>
                                <TileLayer attribution='&copy; CARTO' url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
                                <GuessPicker position={guess} setPosition={setGuess} disabled={false} />
                            </MapContainer>
                        </div>

                        <button
                            onClick={calculateScore}
                            disabled={!guess}
                            style={{
                                padding: '16px 40px', borderRadius: '999px', border: 'none', backgroundColor: guess ? '#10B981' : '#D1D5DB',
                                color: 'white', fontWeight: '700', fontSize: '18px', cursor: guess ? 'pointer' : 'not-allowed',
                                transition: 'all 0.2s', boxShadow: guess ? '0 10px 15px -3px rgba(16, 185, 129, 0.3)' : 'none'
                            }}
                        >
                            Make Guess
                        </button>
                    </>
                ) : gameState === 'result' ? (
                    <>
                        {/* RESULTS SCREEN */}
                        <h2 style={{ margin: '0 0 10px 0', color: '#111827', fontSize: '40px', fontWeight: '800' }}>{roundScore} points</h2>
                        <p style={{ margin: '0 0 16px 0', color: '#6B7280', fontSize: '18px' }}>You were {distanceStr} away!</p>

                        {/* SHOW FULL ORIGINAL IMAGE */}
                        <img src={currentLocation.imageUrl} alt="Original" style={{ width: '100%', maxHeight: '180px', objectFit: 'contain', borderRadius: '16px', marginBottom: '12px', backgroundColor: '#F3F4F6' }} />

                        {/* RESULTS MAP */}
                        <div style={{ width: '100%', height: '240px', borderRadius: '24px', overflow: 'hidden', border: '2px solid #E5E7EB', marginBottom: '12px' }}>
                            <MapContainer style={{ height: '100%', width: '100%' }}>
                                <TileLayer attribution='&copy; CARTO' url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />

                                <Marker position={guess as any} icon={guessIcon} />
                                <Marker position={{lat: currentLocation.lat, lng: currentLocation.lng}} icon={actualIcon} />
                                <Polyline
                                    positions={[guess as any, {lat: currentLocation.lat, lng: currentLocation.lng}]}
                                    color="#3b82f6"
                                    dashArray="10, 10"
                                    weight={3}
                                />
                                <ResultMapController guess={guess} actual={{lat: currentLocation.lat, lng: currentLocation.lng}} />
                            </MapContainer>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#4B5563' }}>
                                <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#2A7FFF' }}></div> Your Guess
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#4B5563' }}>
                                <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#2AD366' }}></div> Actual Location
                            </div>
                        </div>

                        <button
                            onClick={handleNext}
                            style={{ padding: '16px 40px', borderRadius: '999px', border: 'none', backgroundColor: '#111827', color: 'white', fontWeight: '700', fontSize: '18px', cursor: 'pointer' }}
                        >
                            {currentRound < gameLocations.length ? "Next Round" : "View Final Score"}
                        </button>
                    </>
                ) : (
                    // --- FINAL SUMMARY SCREEN ---
                    <div style={{ padding: '40px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px' }}>
                        <h2 style={{ fontSize: '24px', color: '#6B7280', marginBottom: '10px' }}>Final Score!</h2>
                        <h1 style={{ fontSize: '64px', color: '#111827', fontWeight: '800', margin: '0 0 10px 0' }}>{totalScore}</h1>
                        <p style={{ fontSize: '20px', color: '#4B5563', marginBottom: '40px', fontWeight: '600' }}>out of {gameLocations.length * 5000} points</p>

                        <button
                            onClick={() => window.location.reload()}
                            style={{ padding: '16px 40px', borderRadius: '999px', border: 'none', backgroundColor: '#10B981', color: 'white', fontWeight: '700', fontSize: '18px', cursor: 'pointer', boxShadow: '0 10px 15px -3px rgba(16, 185, 129, 0.3)' }}
                        >
                            Play Again
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};