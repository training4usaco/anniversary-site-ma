import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "./firebase";

export const Login = () => {
    const handleLogin = async () => {
        try {
            await signInWithPopup(auth, provider);
        } catch (error) {
            console.error("Login failed:", error);
        }
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            // Background inspired by the reference image: soft, colorful radial splashes
            background: `
        radial-gradient(circle at 80% 50%, rgba(255, 195, 160, 0.5) 0%, rgba(255, 195, 160, 0) 55%),
        radial-gradient(circle at 20% 80%, rgba(129, 236, 214, 0.5) 0%, rgba(129, 236, 214, 0) 55%),
        #f9fafb
      `,
            fontFamily: 'system-ui, -apple-system, sans-serif',
            margin: 0,
            padding: 0,
            boxSizing: 'border-box'
        }}>
            {/* The login card - a central "bubble" */}
            <div style={{
                backgroundColor: 'rgba(255, 255, 255, 0.85)', // More translucent to let background show
                backdropFilter: 'blur(12px)', // Adds a nice frosted glass effect
                padding: '48px 36px',
                borderRadius: '40px', // Even more rounded for a bubbly feel
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.1)', // Soft, large shadow
                textAlign: 'center',
                maxWidth: '340px',
                width: '90%',
                border: '1px solid rgba(255, 255, 255, 0.3)' // Subtle border
            }}>
                <p style={{
                    margin: '0 0 36px 0',
                    color: '#4B5563',
                    fontSize: '16px',
                    lineHeight: '1.5'
                }}>
                    Sign in to authenticate!
                </p>

                {/* The button - another "bubble" */}
                <button
                    onClick={handleLogin}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '100%',
                        padding: '16px 24px',
                        backgroundColor: '#ffffff',
                        color: '#1f2937',
                        border: '2px solid #f3f4f6',
                        borderRadius: '999px', // Pill shape
                        fontSize: '16px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        gap: '12px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)'
                    }}
                    onMouseOver={(e) => {
                        e.currentTarget.style.borderColor = '#e5e7eb';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.03)';
                    }}
                    onMouseOut={(e) => {
                        e.currentTarget.style.borderColor = '#f3f4f6';
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)';
                    }}
                    onMouseDown={(e) => {
                        e.currentTarget.style.transform = 'translateY(1px)';
                    }}
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.86C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.05H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.95l3.66-2.86z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.05l3.66 2.86c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    Continue with Google
                </button>
            </div>
        </div>
    );
};