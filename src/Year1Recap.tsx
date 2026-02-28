import { useNavigate } from "react-router-dom";
import {useState} from "react";

export const Year1Recap = () => {
    const navigate = useNavigate();

    const metrics = {
        // Reels
        totalReels: "1,682",
        meloReels: "1,170",
        alexReels: "512",

        // Love Phrases
        totalLove: "447",
        meloLove: "175",
        alexLove: "272",

        // VC
        vcTime: "206 hrs 49 mins",

        // Text Length
        meloChars: "13.4",
        alexChars: "10.5",
        essayistName: "Melody",

        // Speedy Replier (Replaced Golden Hour)
        alexResponse: "4 mins",
        meloResponse: "3 mins",

        // Emoji Podium
        alexEmojis: [
            { emoji: "🗿", count: 635 },
            { emoji: "😭", count: 541 },
            { emoji: "🥴", count: 471 }
        ],
        meloEmojis: [
            { emoji: "🥀", count: 332 },
            { emoji: "❤️", count: 202 },
            { emoji: "😭", count: 187 }
        ],
        
        totalMiles: "2,540",

        survivalShows: [
            { title: "Squid Game", seasons: "SEASONS 2 & 3", icon: "🦑", color: "#FF0055" },
            { title: "Alice in Borderland", seasons: "SEASON 3", icon: "🃏", color: "#00FFCC" },
            { title: "A Bloody Lucky Day", seasons: "We should finish this", icon: "🚕", color: "#FFCC00" },
            { title: "My Melody & Kuromi", seasons: "Season 2 when :o", icon: "🐰", color: "#FF99CC" }
        ],

        coopGames: [
            { title: "Minecraft", detail: "Love tapping away!", color: "#43B581" },
            { title: "Word Hunt", detail: "The worst game to exist.", color: "#FAA61A" },
            { title: "Brawl Stars", detail: "Only a bit of carrying was done.", color: "#FEE75C" },
            { title: "It Takes Two", detail: "More like It Takes FPS", color: "#EB459E" }
        ],

        bucketList: [
            {
                destination: "Monterey Bay",
                vibe: "Weekend getaway. Otters, coastal drives, and aquarium dates.",
                icon: "🦦",
                color: "#00B4DB" // Ocean blue
            },
            {
                destination: "Taiwan",
                vibe: "Night markets, infinite street food, and the birthplace of our boba addiction.",
                icon: "🧋",
                color: "#F2A900" // Night market gold
            },
            {
                destination: "Japan",
                vibe: "The ultimate final boss of food, culture, and bankrupting ourselves on blind boxes.",
                icon: "🌸",
                color: "#FF4B2B" // Tokyo neon red
            }
        ],
    };

    return (
        <div style={{
            height: '100vh',
            width: '100vw',
            overflowY: 'scroll',
            scrollSnapType: 'y mandatory',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            backgroundColor: '#121212',
            color: 'white',
            margin: 0,
            padding: 0
        }}>
            {/* Injecting CSS for the bounce animation and highlights */}
            <style>
                {`
        body { margin: 0; overflow: hidden; } 
        .highlight { 
            color: #fff; 
            background: rgba(0,0,0,0.2); 
            padding: 5px 15px; 
            border-radius: 20px; 
            display: inline-block; 
        }
        .scroll-hint { 
            position: absolute; 
            bottom: 40px; 
            font-size: 1.2rem; 
            font-weight: bold;
            animation: bounce 2s infinite; 
            opacity: 0.8; 
        }
        @keyframes bounce { 
            0%, 20%, 50%, 80%, 100% { transform: translateY(0); } 
            40% { transform: translateY(-15px); } 
            60% { transform: translateY(-7px); } 
        }
        .photo-frame {
            max-width: 80%;
            max-height: 50vh;
            border-radius: 16px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.4);
            border: 6px solid white;
            margin-bottom: 24px;
            object-fit: cover;
        }

        .labubu-container {
            position: relative;
            display: inline-block;
            cursor: pointer;
        }

        .labubu-pop {
            position: relative;
            z-index: 2; /* Keeps text in front */
            display: inline-block;
            font-weight: 900;
            color: #ff2a5f; 
            background: #ffffff;
            padding: 4px 16px;
            border-radius: 20px;
            box-shadow: 0 10px 20px -5px rgba(0, 0, 0, 0.3);
            text-transform: lowercase;
            transition: transform 0.2s ease;
        }

        /* NEW: An invisible "window" sitting above the text pill */
        .labubu-mask {
            position: absolute;
            bottom: 12px; /* Starts just behind the white pill */
            left: -50px;
            right: -50px;
            height: 120px; /* Tall enough to fit the image */
            overflow: hidden; /* This hides the image when it slides down! */
            pointer-events: none;
            z-index: 1; /* Sits behind the pill */
        }

        .labubu-image {
            position: absolute;
            bottom: 0;
            left: 50%;
            width: 70px; 
            /* Start pushed 100% downward, completely outside the mask */
            transform: translateX(-50%) translateY(100%); 
            /* Pure sliding animation - no opacity, no scaling */
            transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        /* When hovered, slide straight up! */
        .labubu-container:hover .labubu-image {
            transform: translateX(-50%) translateY(5px);
        }

        /* Tiny lift for the text badge itself */
        .labubu-container:hover .labubu-pop {
            transform: translateY(-2px);
        }
        
        @keyframes dash {
            to { stroke-dashoffset: -16; }
        }
        .travel-path {
            animation: dash 1s linear infinite;
        }
        
        blindBoxes: "32", 
        toyFinances: "Financial Ruin",
        toyAddict: "Melody (Obviously)",
    `}
            </style>

            {/* Back Button */}
            <button
                onClick={() => navigate("/")}
                style={{
                    position: 'fixed', top: '24px', left: '24px', zIndex: 50,
                    padding: '10px 20px', borderRadius: '999px', border: '1px solid rgba(255,255,255,0.4)',
                    backgroundColor: 'rgba(0, 0, 0, 0.4)', cursor: 'pointer',
                    color: '#fff', fontWeight: '600', backdropFilter: 'blur(8px)',
                    transition: 'all 0.2s ease', boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}
                onMouseOver={(e) => { e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.6)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.4)'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
                ← Back Home
            </button>

            {/* --- SLIDE 1: INTRO --- */}
            <div style={cardStyle('linear-gradient(135deg, #8A2387, #E94057, #F27121)', 'white')}>
                <h1 style={h1Style}>1 Entire Year<br />together</h1>
                <p style={pStyle}>Thank you for being the bestest girlfriend &lt;3</p>
                <div className="scroll-hint">↓ Swipe Down ↓</div>
            </div>

            {/* --- SLIDE 2: THE REEL DEAL --- */}
            <div style={cardStyle('linear-gradient(135deg, #00c6ff 0%, #0072ff 100%)', 'white')}>
                <h2 style={h2Style}>The Doomscrolling</h2>
                <p style={pStyle}>We shared...</p>
                <h1 style={h1Style}>{metrics.totalReels}</h1>
                <p style={pStyle}>posts and reels in total.</p>
                <div style={{ marginTop: '20px', fontSize: '1.2rem', fontWeight: 600 }}>
                    {/* Added margin: '4px 0' to pull these tightly together */}
                    <p style={{ margin: '6px 0' }}>Melody sent: <span className="highlight">{metrics.meloReels}</span></p>
                    <p style={{ margin: '6px 0' }}>Alex sent: <span className="highlight">{metrics.alexReels}</span></p>
                </div>
            </div>

            {/* --- SLIDE 3: LOVE PHRASES --- */}
            <div style={cardStyle('linear-gradient(135deg, #ff758c 0%, #ff7eb3 100%)', 'white')}>
                <h2 style={h2Style}>Love messages</h2>
                <h1 style={h1Style}>{metrics.totalLove}</h1>

                <p style={pStyle}>
        <span className="labubu-container">
            <span className="labubu-pop">i labubu</span>

            {/* NEW: The invisible mask box */}
            <div className="labubu-mask">
                <img
                    src="/labubu.png"
                    alt="Labubu character"
                    className="labubu-image"
                />
            </div>
        </span>
                    s in the past year.
                </p>

                <div style={{ marginTop: '20px', fontSize: '1.2rem', fontWeight: 600 }}>
                    <p style={{ margin: '6px 0' }}>Melody labubus: <span className="highlight">{metrics.meloLove} times</span></p>
                    <p style={{ margin: '6px 0' }}>Alex labubus: <span className="highlight">{metrics.alexLove} times</span></p>
                </div>
            </div>

            {/* --- SLIDE 4: VC TIME --- */}
            <div style={cardStyle('linear-gradient(135deg, #11998e 0%, #38ef7d 100%)', '#111')}>
                <h2 style={h2Style}>"Where's your face?"</h2>
                <h1 style={h1Style}>{metrics.vcTime}</h1>
                <p style={pStyle}>is how long we vced for. That's 8 and a half days straight!</p>
            </div>

            {/* --- SLIDE: MOVIE NIGHT (SURVIVAL ERA) --- */}
            <div style={cardStyle('linear-gradient(135deg, #111111 0%, #430000 100%)', 'white')}>
                <h2 style={{...h2Style, marginBottom: '10px'}}>Move Night</h2>
                <p style={{...pStyle, marginBottom: '40px', fontSize: '1.1rem', opacity: 0.9}}>
                    Shows we watched together (no wonder we're depressed)
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%', maxWidth: '400px' }}>

                    {metrics.survivalShows.map((show, index) => (
                        <div key={index} style={{
                            background: 'rgba(255,255,255,0.05)',
                            borderLeft: `5px solid ${show.color}`,
                            padding: '20px',
                            borderRadius: '0 16px 16px 0',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '20px',
                            boxShadow: '0 10px 20px rgba(0,0,0,0.3)',
                            backdropFilter: 'blur(5px)'
                        }}>
                            <div style={{ textAlign: 'left' }}>
                                <h3 style={{ margin: '0 0 5px 0', fontSize: '1.4rem', fontWeight: 800 }}>{show.title}</h3>
                                <p style={{ margin: 0, opacity: 0.7, letterSpacing: '1px', fontSize: '0.9rem' }}>
                                    {show.seasons}
                                </p>
                            </div>
                        </div>
                    ))}

                </div>
            </div>

            {/* --- SLIDE 5: THE SPEEDY REPLIER --- */}
            <div style={cardStyle('linear-gradient(135deg, #f6d365 0%, #fda085 100%)', '#111')}>
                <h2 style={h2Style}>Chronically Online</h2>
                <p style={pStyle}>With the power of notifs, on average...</p>

                <div style={{ marginTop: '40px', fontSize: '1.5rem', fontWeight: 600, display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{ padding: '20px', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '16px' }}>
                        <p style={{ margin: '0 0 10px 0' }}>Melody replies in:</p>
                        <h1 style={{ margin: 0, fontSize: '3rem' }}>{metrics.meloResponse}</h1>
                    </div>

                    <div style={{ padding: '20px', backgroundColor: 'rgba(0,0,0,0.1)', borderRadius: '16px' }}>
                        <p style={{ margin: '0 0 10px 0' }}>Alex replies in:</p>
                        <h1 style={{ margin: 0, fontSize: '3rem' }}>{metrics.alexResponse}</h1>
                    </div>
                </div>
            </div>

            <div style={cardStyle('linear-gradient(135deg, #b224ef 0%, #7579ff 100%)', 'white')}>
                <h2 style={h2Style}>Yappers Strong Together</h2>
                <p style={{ ...pStyle, marginBottom: '10px' }}>Melody averaged <span className="highlight">{metrics.meloChars} characters</span> per message.</p>
                <p style={{ ...pStyle, marginBottom: '40px' }}>Alex averaged <span className="highlight">{metrics.alexChars} characters</span> per message.</p>
            </div>

            {/* --- SLIDE: CLOSING THE DISTANCE --- */}
            <div style={cardStyle('linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', 'white')}>
                <h2 style={h2Style}>Long Distance Relationship</h2>
                <h1 style={h1Style}>{metrics.totalMiles}</h1>
                <p style={pStyle}>Miles traveled to be together.</p>

                {/* --- CUSTOM ANIMATED MAP WIDGET --- */}
                <div style={{ marginTop: '40px', width: '100%', maxWidth: '400px', position: 'relative' }}>
                    <svg viewBox="0 0 400 160" style={{ width: '100%', height: '160px', overflow: 'visible' }}>

                        {/* THE ROUTES (Dashed Lines) */}
                        {/* NYC to Pomona Route */}
                        <path d="M 350,70 Q 200,-30 60,70" fill="transparent" stroke="rgba(255,255,255,0.6)" strokeWidth="4" strokeDasharray="8 8" className="travel-path" />
                        {/* UCI to Pomona Route (shorter, straight up) */}
                        <path d="M 50,140 Q 30,105 55,75" fill="transparent" stroke="rgba(255,255,255,0.6)" strokeWidth="4" strokeDasharray="8 8" className="travel-path" />

                        {/* THE PINS */}
                        {/* NYC Pin */}
                        <circle cx="350" cy="70" r="8" fill="white" />
                        <text x="350" y="95" fill="white" fontSize="14" fontWeight="bold" textAnchor="middle">NYC</text>

                        {/* UCI Pin */}
                        <circle cx="50" cy="140" r="6" fill="white" opacity="0.9" />
                        <text x="50" y="160" fill="white" fontSize="12" fontWeight="bold" textAnchor="middle">UCI</text>

                        {/* Pomona Destination Pin (Bigger & Gold) */}
                        <circle cx="60" cy="70" r="10" fill="#FFD700" style={{ filter: 'drop-shadow(0px 4px 4px rgba(0,0,0,0.3))' }} />
                        <text x="60" y="45" fill="#FFD700" fontSize="16" fontWeight="900" textAnchor="middle" style={{ filter: 'drop-shadow(0px 2px 2px rgba(0,0,0,0.2))' }}>Pomona</text>

                    </svg>
                </div>

                {/* TRIP BREAKDOWN TICKETS */}
                <div style={{ marginTop: '30px', fontSize: '1.2rem', fontWeight: 700, display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
                    <div style={{ padding: '12px 24px', background: 'rgba(255,255,255,0.2)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.4)', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                        1x from NYC
                    </div>
                    <div style={{ padding: '12px 24px', background: 'rgba(255,255,255,0.2)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.4)', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                        2x from UCI
                    </div>
                </div>
            </div>

            {/* --- SLIDE 8: THE EMOJI PODIUM --- */}
            <div style={cardStyle('linear-gradient(135deg, #ff0844 0%, #ffb199 100%)', 'white')}>
                <h2 style={{...h2Style, marginBottom: '10px'}}>:wilted_rose: Emoji</h2>
                <p style={{...pStyle, marginBottom: '40px', fontSize: '1.2rem'}}>Our most used emojis...</p>

                <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'center',
                    gap: '40px',
                    width: '100%'
                }}>

                    {/* MELODY'S PODIUM */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <h3 style={{ marginBottom: '20px', fontSize: '1.5rem', fontWeight: 800 }}>Melody</h3>
                        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px' }}>
                            {/* 2nd Place */}
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <div style={{ fontSize: '2.5rem' }}>{metrics.meloEmojis[1].emoji}</div>
                                <div style={{ fontSize: '0.9rem', marginBottom: '8px', opacity: 0.9 }}>{metrics.meloEmojis[1].count}</div>
                                <div style={{ width: '55px', height: '80px', background: 'linear-gradient(to bottom, #E0E0E0, #9E9E9E)', borderRadius: '8px 8px 0 0', display: 'flex', justifyContent: 'center', paddingTop: '10px', fontSize: '1.5rem', fontWeight: 'bold', color: 'rgba(0,0,0,0.5)' }}>2</div>
                            </div>
                            {/* 1st Place (No bounce) */}
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <div style={{ fontSize: '3.5rem' }}>{metrics.meloEmojis[0].emoji}</div>
                                <div style={{ fontSize: '0.9rem', marginBottom: '8px', opacity: 0.9 }}>{metrics.meloEmojis[0].count}</div>
                                <div style={{ width: '65px', height: '120px', background: 'linear-gradient(to bottom, #FFD700, #DAA520)', borderRadius: '8px 8px 0 0', display: 'flex', justifyContent: 'center', paddingTop: '10px', fontSize: '2rem', fontWeight: 'bold', color: 'rgba(0,0,0,0.5)', boxShadow: '0 -10px 20px rgba(255, 215, 0, 0.4)' }}>1</div>
                            </div>
                            {/* 3rd Place */}
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <div style={{ fontSize: '2rem' }}>{metrics.meloEmojis[2].emoji}</div>
                                <div style={{ fontSize: '0.9rem', marginBottom: '8px', opacity: 0.9 }}>{metrics.meloEmojis[2].count}</div>
                                <div style={{ width: '55px', height: '50px', background: 'linear-gradient(to bottom, #CD7F32, #8B4513)', borderRadius: '8px 8px 0 0', display: 'flex', justifyContent: 'center', paddingTop: '5px', fontSize: '1.2rem', fontWeight: 'bold', color: 'rgba(0,0,0,0.5)' }}>3</div>
                            </div>
                        </div>
                    </div>

                    {/* ALEX'S PODIUM */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <h3 style={{ marginBottom: '20px', fontSize: '1.5rem', fontWeight: 800 }}>Alex</h3>
                        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px' }}>
                            {/* 2nd Place */}
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <div style={{ fontSize: '2.5rem' }}>{metrics.alexEmojis[1].emoji}</div>
                                <div style={{ fontSize: '0.9rem', marginBottom: '8px', opacity: 0.9 }}>{metrics.alexEmojis[1].count}</div>
                                <div style={{ width: '55px', height: '80px', background: 'linear-gradient(to bottom, #E0E0E0, #9E9E9E)', borderRadius: '8px 8px 0 0', display: 'flex', justifyContent: 'center', paddingTop: '10px', fontSize: '1.5rem', fontWeight: 'bold', color: 'rgba(0,0,0,0.5)' }}>2</div>
                            </div>
                            {/* 1st Place (No bounce) */}
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <div style={{ fontSize: '3.5rem' }}>{metrics.alexEmojis[0].emoji}</div>
                                <div style={{ fontSize: '0.9rem', marginBottom: '8px', opacity: 0.9 }}>{metrics.alexEmojis[0].count}</div>
                                <div style={{ width: '65px', height: '120px', background: 'linear-gradient(to bottom, #FFD700, #DAA520)', borderRadius: '8px 8px 0 0', display: 'flex', justifyContent: 'center', paddingTop: '10px', fontSize: '2rem', fontWeight: 'bold', color: 'rgba(0,0,0,0.5)', boxShadow: '0 -10px 20px rgba(255, 215, 0, 0.4)' }}>1</div>
                            </div>
                            {/* 3rd Place */}
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <div style={{ fontSize: '2rem' }}>{metrics.alexEmojis[2].emoji}</div>
                                <div style={{ fontSize: '0.9rem', marginBottom: '8px', opacity: 0.9 }}>{metrics.alexEmojis[2].count}</div>
                                <div style={{ width: '55px', height: '50px', background: 'linear-gradient(to bottom, #CD7F32, #8B4513)', borderRadius: '8px 8px 0 0', display: 'flex', justifyContent: 'center', paddingTop: '5px', fontSize: '1.2rem', fontWeight: 'bold', color: 'rgba(0,0,0,0.5)' }}>3</div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            {/* --- SLIDE 7: FAVORITE PICTURE --- */}
            <div style={cardStyle('linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)', 'white')}>
                <h2 style={{...h2Style, marginBottom: '10px'}}>My Favorite Photo</h2>
                <img src="/favorite_pic.JPG" alt="Our favorite memory" className="photo-frame" />
                <p style={{...pStyle, fontSize: '1.2rem'}}>So adorable :&gt;</p>
            </div>

            {/* --- SLIDE: THE DUO QUEUE (GAMING) --- */}
            <div style={cardStyle('linear-gradient(135deg, #1A1A2E 0%, #0F1020 100%)', 'white')}>
                <h2 style={{...h2Style, marginBottom: '5px', color: '#E2E8F0'}}>Ready Player 1</h2>
                <p style={{...pStyle, marginBottom: '25px', fontSize: '1.05rem', color: '#94A3B8'}}>
                    Some games we've played this year.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', maxWidth: '400px' }}>

                    {metrics.coopGames.map((game, index) => (
                        <div key={index} style={{
                            background: 'rgba(255,255,255,0.03)',

                            border: '1px solid rgba(255,255,255,0.05)',
                            borderLeftColor: game.color,
                            borderLeftWidth: '4px',
                            borderLeftStyle: 'solid',

                            padding: '14px 18px',
                            borderRadius: '0 12px 12px 0',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '16px',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
                        }}>
                            <div style={{ textAlign: 'left' }}>
                                <h3 style={{ margin: '0 0 4px 0', fontSize: '1.15rem', fontWeight: 800, color: '#F8FAFC' }}>
                                    {game.title}
                                </h3>
                                <p style={{ margin: 0, color: '#94A3B8', fontSize: '0.85rem', lineHeight: '1.3' }}>
                                    {game.detail}
                                </p>
                            </div>
                        </div>
                    ))}

                </div>

                <div style={{
                    marginTop: '25px',
                    padding: '14px 20px',
                    borderRadius: '12px',
                    background: 'linear-gradient(90deg, rgba(235, 69, 158, 0.1) 0%, rgba(67, 181, 129, 0.1) 100%)',
                    border: '1px solid rgba(255,255,255,0.1)'
                }}>
                    <p style={{ margin: 0, fontWeight: 700, color: '#F8FAFC', fontSize: '0.9rem' }}>
                        And some elite level carrying from yours truly
                    </p>
                </div>
            </div>

            {/* --- SLIDE: THE BUCKET LIST (SCATTERED POLAROIDS) --- */}
            <div style={cardStyle('linear-gradient(135deg, #c5e5fa 0%, #f8fafc 100%)', 'white')}>
                <h2 style={{...h2Style, marginBottom: '5px', color: '#1E293B'}}>Places We Should Go</h2>
                <p style={{...pStyle, marginBottom: '40px', fontSize: '1.05rem', color: '#1E293B'}}>
                    And maybe we can even get some stinky tofu.
                </p>

                {/* The Desk / Surface */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '220px',
                    width: '100%',
                    position: 'relative'
                }}>

                    {metrics.bucketList.map((trip, index) => {
                        const [isHovered, setIsHovered] = useState(false);

                        const baseTilt = index === 0 ? -12 : index === 1 ? 3 : 15;
                        const baseX = index === 0 ? -30 : index === 1 ? 0 : 30;
                        const baseY = index === 0 ? 10 : index === 1 ? -20 : 15;
                        const baseZ = index === 1 ? 10 : 1;

                        const tilt = isHovered ? '0deg' : `${baseTilt}deg`;
                        const xOffset = `${baseX}px`;
                        const yOffset = isHovered ? `${baseY - 25}px` : `${baseY}px`;
                        const zIndex = isHovered ? 50 : baseZ;
                        const scale = isHovered ? 'scale(1.15)' : 'scale(1)';

                        return (
                            <div
                                key={index}
                                onMouseEnter={() => setIsHovered(true)}
                                onMouseLeave={() => setIsHovered(false)}
                                style={{
                                    position: 'absolute',
                                    transform: `translate(${xOffset}, ${yOffset}) rotate(${tilt}) ${scale}`,
                                    zIndex: zIndex,
                                    background: '#FFFFFF',
                                    padding: '10px 10px 25px 10px',
                                    borderRadius: '4px',
                                    boxShadow: isHovered
                                        ? '0 25px 50px rgba(0,0,0,0.3)'
                                        : '0 15px 35px rgba(0,0,0,0.15)',
                                    width: '130px',
                                    transition: isHovered
                                        ? 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                                        : 'all 0.4s ease, z-index 0s 0.4s',
                                    cursor: 'pointer'
                                }}
                            >
                                {/* --- THE TAPE EFFECT --- */}
                                <div style={{
                                    position: 'absolute',
                                    top: '-12px',
                                    left: '50%',
                                    transform: 'translateX(-50%) rotate(-2deg)',
                                    width: '50px',
                                    height: '22px',
                                    background: 'rgba(255, 255, 255, 0.5)', // Semi-transparent white
                                    backdropFilter: 'blur(2px)', // Frosted look
                                    borderLeft: '1px solid rgba(255,255,255,0.3)',
                                    borderRight: '1px solid rgba(255,255,255,0.3)',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                                    zIndex: 2,
                                    pointerEvents: 'none' // Mouse goes through the tape to the card
                                }} />
                                
                                {/* The "Photo" Area */}
                                <div style={{
                                    background: `linear-gradient(135deg, ${trip.color}80 0%, ${trip.color} 100%)`,
                                    height: '110px',
                                    borderRadius: '2px',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    fontSize: '3.5rem',
                                    boxShadow: 'inset 0 0 10px rgba(0,0,0,0.05)'
                                }}>
                                    {trip.icon}
                                </div>
                                {/* The Handwritten Caption */}
                                <div style={{
                                    textAlign: 'center',
                                    marginTop: '12px',
                                    color: '#1E293B',
                                    fontWeight: 800,
                                    fontSize: '0.9rem',
                                    letterSpacing: '-0.5px'
                                }}>
                                    {trip.destination}
                                </div>
                            </div>
                        );
                    })}

                </div>
            </div>
            
            

            {/* --- SLIDE 8: OUTRO --- */}
            <div style={cardStyle('linear-gradient(135deg, #232526 0%, #414345 100%)', 'white')}>
                <h1 style={{...h1Style, fontSize: '3.5rem'}}>Happy<br/>Anniversary :D</h1>
                <p style={pStyle}>To my favorite goober</p>
            </div>
        </div>
    );
};

// --- Helper Styles to keep the JSX clean ---
const cardStyle = (background: string, color: string): React.CSSProperties => ({
    height: '100vh',
    width: '100vw',
    scrollSnapAlign: 'start',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    padding: '2rem',
    background: background,
    color: color,
    position: 'relative',
    boxSizing: 'border-box'
});

const h1Style: React.CSSProperties = {
    fontSize: '6rem',
    fontWeight: 900,
    lineHeight: 1.1,
    marginBottom: '1rem',
    textTransform: 'uppercase',
    letterSpacing: '-2px',
    margin: '0 0 20px 0'
};

const h2Style: React.CSSProperties = {
    fontSize: '3rem',
    fontWeight: 700,
    marginBottom: '2rem',
    opacity: 0.9,
    margin: '0 0 20px 0'
};

const pStyle: React.CSSProperties = {
    fontSize: '1.5rem',
    fontWeight: 500,
    opacity: 0.9,
    maxWidth: '600px',
    margin: '0'
};