import {useState, useEffect, useMemo} from "react";
import { signOut } from "firebase/auth";
import { auth } from "./firebase";
import { useNavigate } from "react-router-dom";
import * as React from "react";

const START_DATE = new Date("2025-02-28T00:00:00");

const ConfettiRain = React.memo(() => {
    const pieces = useMemo(() => {
        return Array.from({ length: 100 }).map((_, i) => ({
            color: ['#ff0000', '#ffd700', '#ff69b4', '#00ff00', '#00e5ff', '#ff9f00'][i % 6],
            left: Math.random() * 100,
            delay: Math.random() * 5,
            duration: 3 + Math.random() * 4,
            size: 8 + Math.random() * 8,
            rotation: Math.random() * 360
        }));
    }, []);

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
            pointerEvents: 'none', zIndex: 9999, overflow: 'hidden'
        }}>
            {pieces.map((p, i) => (
                <div key={i} className="confetti-bit" style={{
                    position: 'absolute',
                    top: '-20px',
                    left: `${p.left}vw`,
                    width: `${p.size}px`,
                    height: `${p.size}px`,
                    backgroundColor: p.color,
                    borderRadius: i % 3 === 0 ? '50%' : '2px',
                    opacity: 0.8,
                    // Use the pre-calculated random values here
                    animation: `fall ${p.duration}s linear ${p.delay}s infinite`,
                    transform: `rotate(${p.rotation}deg)`
                }} />
            ))}
            <style>{`
                @keyframes fall {
                    0% { transform: translateY(-5vh) rotate(0deg) translateX(0); }
                    25% { transform: translateY(25vh) rotate(90deg) translateX(20px); }
                    50% { transform: translateY(50vh) rotate(180deg) translateX(-20px); }
                    75% { transform: translateY(75vh) rotate(270deg) translateX(20px); }
                    100% { transform: translateY(110vh) rotate(360deg) translateX(0); }
                }
            `}</style>
        </div>
    );
});

const AnniversaryRecapButton = () => {
    const navigate = useNavigate();
    return (
        <>
            <style>
                {`
                        .recap-btn {
                        position: relative; display: flex; align-items: center; gap: 12px;
                        padding: 6px 8px 6px 6px; background-color: #ffffff; border: 1px solid #e5e7eb;
                        border-radius: 999px; color: #111827; font-family: system-ui, -apple-system, sans-serif;
                        font-weight: 500; cursor: pointer; overflow: hidden; transition: border-color 0.3s;
                    }
                        .recap-btn::after {
                        content: ''; position: absolute; top: 0; left: 0; width: 0%; height: 100%;
                        background-color: #111827; transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1); z-index: 0;
                    }
                        .recap-btn:hover::after { width: 100%; }
                        .recap-btn:hover { border-color: #111827; }
                        .btn-content { position: relative; z-index: 1; display: flex; align-items: center; gap: 12px; transition: color 0.3s; }
                        .recap-btn:hover .btn-content { color: #ffffff; }
                        .new-badge { background-color: #ffffff; color: #111827; border: 1px solid #e5e7eb; border-radius: 999px; padding: 4px 10px; font-size: 12px; font-weight: 600; box-shadow: 0 1px 2px rgba(0,0,0,0.05); }
                        .arrow-icon { transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
                        .recap-btn:hover .arrow-icon { transform: translateX(4px); }
                        `}
            </style>
            <button className="recap-btn" onClick={() => navigate('/year-1-recap')}>
                <div className="btn-content">
                    <span className="new-badge">New</span>
                    <span style={{ fontSize: '14px' }}>1 Year Anniversary Recap</span>
                    <svg className="arrow-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                        <polyline points="12 5 19 12 12 19"></polyline>
                    </svg>
                </div>
            </button>
        </>
    );
};

export const Welcome = ({  }: { userName: string | null }) => {
    const navigate = useNavigate();
    
    const [showConfetti, setShowConfetti] = useState(false);
    const [hasCelebrated, setHasCelebrated] = useState(false);

    const [timeTogether, setTimeTogether] = useState({
        years: 0, months: 0, days: 0, hours: 0, minutes: 0, seconds: 0
    });

    useEffect(() => {
        const calculateTime = () => {
            const now = new Date();
            let years = now.getFullYear() - START_DATE.getFullYear();
            let months = now.getMonth() - START_DATE.getMonth();
            let days = now.getDate() - START_DATE.getDate();
            let hours = now.getHours() - START_DATE.getHours();
            let minutes = now.getMinutes() - START_DATE.getMinutes();
            let seconds = now.getSeconds() - START_DATE.getSeconds();

            if (seconds < 0) { seconds += 60; minutes--; }
            if (minutes < 0) { minutes += 60; hours--; }
            if (hours < 0) { hours += 24; days--; }
            if (days < 0) {
                const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
                days += prevMonth.getDate(); months--;
            }
            if (months < 0) { months += 12; years--; }

            setTimeTogether({ years, months, days, hours, minutes, seconds });

            if (months == 0 && days == 0 && hours == 0 && minutes == 0 && !hasCelebrated) {
                setShowConfetti(true);
                setHasCelebrated(true);
                setTimeout(() => setShowConfetti(false), 60000);
                setHasCelebrated(true);
            }

            // if (years >= 1 && !hasCelebrated) {
            //     setShowConfetti(true);
            //     setHasCelebrated(true);
            //     setTimeout(() => setShowConfetti(false), 60000);
            //     setHasCelebrated(false);
            // }
        };

        calculateTime();
        const interval = setInterval(calculateTime, 1000);
        return () => clearInterval(interval);
    }, [hasCelebrated]);

    const TimeBubble = ({ label, value }: { label: string, value: number }) => (
        <div style={{
            backgroundColor: '#ffffff', padding: '16px 12px', borderRadius: '24px',
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            minWidth: '76px', boxShadow: '0 8px 16px rgba(0,0,0,0.08)', border: '1px solid #f3f4f6'
        }}>
            <span style={{ fontSize: '32px', fontWeight: '800', color: '#111827', lineHeight: '1' }}>
                {value.toString().padStart(2, '0')}
            </span>
            <span style={{ fontSize: '11px', color: '#6B7280', textTransform: 'uppercase', fontWeight: '700', marginTop: '6px', letterSpacing: '0.5px' }}>
                {label}
            </span>
        </div>
    );

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            background: `radial-gradient(circle at 80% 50%, rgba(255, 195, 160, 0.5) 0%, rgba(255, 195, 160, 0) 55%), radial-gradient(circle at 20% 80%, rgba(129, 236, 214, 0.5) 0%, rgba(129, 236, 214, 0) 55%), #f9fafb`,
            fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
            
            {/* Render Confetti when triggered */}
            {showConfetti && <ConfettiRain />}

            <div style={{ position: 'absolute', top: '24px', right: '24px', display: 'flex', gap: '12px' }}>
                <button onClick={() => navigate('/meloguessr')} style={{ padding: '10px 20px', borderRadius: '999px', border: 'none', backgroundColor: '#111827', color: '#fff', fontWeight: '600', cursor: 'pointer' }}>
                    Meloguessr
                </button>
                <button onClick={() => signOut(auth)} style={{ padding: '10px 20px', borderRadius: '999px', border: '1px solid rgba(255,255,255,0.4)', backgroundColor: 'rgba(255, 255, 255, 0.6)', color: '#4B5563', fontWeight: '600', cursor: 'pointer', backdropFilter: 'blur(8px)' }}>
                    Sign Out
                </button>
            </div>

            <div style={{
                backgroundColor: 'rgba(255, 255, 255, 0.85)', backdropFilter: 'blur(12px)',
                padding: '48px 36px', borderRadius: '40px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.1)',
                textAlign: 'center', maxWidth: '540px', width: '90%', border: '1px solid rgba(255, 255, 255, 0.5)', marginBottom: '24px'
            }}>
                <h1 style={{ margin: '0 0 32px 0', fontSize: '24px', color: '#111827', fontWeight: '800' }}>
                    {"Time since day one..."}
                </h1>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center' }}>
                    <TimeBubble label="Years" value={timeTogether.years} />
                    <TimeBubble label="Months" value={timeTogether.months} />
                    <TimeBubble label="Days" value={timeTogether.days} />
                    <TimeBubble label="Hours" value={timeTogether.hours} />
                    <TimeBubble label="Minutes" value={timeTogether.minutes} />
                    <TimeBubble label="Seconds" value={timeTogether.seconds} />
                </div>
            </div>

            <AnniversaryRecapButton />
        </div>
    );
};