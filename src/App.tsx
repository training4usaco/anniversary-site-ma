import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { onAuthStateChanged, signOut, type User } from "firebase/auth";
import { auth } from "./firebase";
import { Login } from "./Login";
import { Welcome } from "./Welcome";
import { Meloguessr } from "./Meloguessr.tsx";
import {Year1Recap} from "./Year1Recap.tsx";
import {Play} from "./Play.tsx";
import { Gallery } from "./Gallery.tsx";

const ALLOWED_EMAILS = [import.meta.env.VITE_GMAIL_1, import.meta.env.VITE_GMAIL_2];

function App() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser && currentUser.email) {
                if (ALLOWED_EMAILS.includes(currentUser.email)) {
                    setUser(currentUser);
                } else {
                    await signOut(auth);
                    setUser(null);
                    alert("Sorry, but who are you?!");
                }
            } else {
                setUser(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    if (loading) return null;

    return (
        <BrowserRouter>
            {/* If not logged in, force them to see the Login page regardless of the URL */}
            {!user ? (
                <Routes>
                    <Route path="*" element={<Login />} />
                </Routes>
            ) : (
                /* If logged in, give them access to the real routes */
                <Routes>
                    <Route path="/" element={<Welcome userName={user.displayName?.split(" ")[0] || null} />} />
                    <Route path="/meloguessr" element={<Meloguessr />} />
                    <Route path="/year-1-recap" element={<Year1Recap />} />
                    
                    <Route path="/play" element={<Play />} />
                    <Route path="/gallery" element={<Gallery />} />

                    {/* Catch-all: If they type a weird URL, send them back to Welcome */}
                    <Route path="*" element={<Navigate to="/" />} />
                </Routes>
            )}
        </BrowserRouter>
    );
}

export default App;