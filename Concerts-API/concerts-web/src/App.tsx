import { useEffect, useState } from 'react';
import "./App.css";
import { Link } from "react-router-dom";
import SideTicketList from './Components/TicketSideList.tsx';

// Definice struktury koncertu podle toho, co vrací API
interface Concert {
    id: number;
    bands: string;       // ZMĚNA: V databázi je to 'bands', ne 'headliner'
    venue: string;
    date: string;
    price: string;
    openers?: string;    // Otazník znamená, že to nemusí být vždy vyplněné
}

interface ConcertTicketProps {
    concertId: number;
    concerts: Concert[];
}

function ConcertInfo({ concertId, concerts }: ConcertTicketProps) {
    const concert = concerts.find(c => c.id === concertId);

    if (!concert) return null;

    const dateObj = new Date(concert.date);
    const day = dateObj.getDate();
    const month = dateObj.toLocaleDateString('en-US', { month: 'short' });

    // --- VÝPOČET ROZMEZÍ CENY ---
    const basePrice = parseFloat(concert.price);
    const maxPrice = basePrice * 1.5; // VIP je 1.5 násobek (podle Concert.tsx)

    // Formátování ceny (např. "$50 - $75")
    const priceRange = `$${basePrice.toFixed(0)} - $${maxPrice.toFixed(0)}`;

    return (
        <div className="concert-card">
            <div className="concert-date">
                <span className="day">{day}</span>
                <span className="month">{month}</span>
            </div>

            <div className="concert-info">
                {/* ZMĚNA: Používáme concert.bands místo concert.headliner */}
                <h2 className="headliner">{concert.bands}</h2>

                {/* Pokud nejsou openers, napíšeme "Special Guests" */}
                <p className="openers">with {concert.openers || "Special Guests"}</p>

                <div className="meta-info">
                    <span>📍 {concert.venue}</span>
                    {/* ZMĚNA: Zobrazujeme vypočítaný rozsah */}
                    <span>💰 {priceRange}</span>
                </div>
            </div>

            <div className="concert-action">
                <Link to={`/concert/${concert.id}`} className="cta-link">
                    <button className="cta-btn">Get Tickets</button>
                </Link>
            </div>
        </div>
    );
}

export default function App() {
    const [concerts, setConcerts] = useState<Concert[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
    const [username, setUsername] = useState<string>("");

    useEffect(() => {
        const token = localStorage.getItem("token");
        const storedUsername = localStorage.getItem("username");
        setIsLoggedIn(!!token);
        setUsername(storedUsername || "");

        const API_URL = `${import.meta.env.VITE_API_URL}/api/concerts`;

        fetch(API_URL)
            .then((res) => {
                if (!res.ok) throw new Error("API not responding");
                return res.json();
            })
            .then((data: Concert[]) => {
                // Pro jistotu si do konzole vypíšeme, co přišlo, abychom viděli názvy sloupců
                console.log("Data z API:", data);
                setConcerts(data);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Connection failed:", err);
                setLoading(false);
            });
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("username");
        setIsLoggedIn(false);
        setUsername("");
        window.location.reload();
    };

    if (loading) return <div className="loading-screen">Loading concerts...</div>;

    return (
        <div className='app-container'>
            {/* Hlavní část - Levá strana */}
            <div className="main-content">
                <header className="app-header">
                    <h1>The Ticket Stand</h1>
                    <p className="subtitle">Discover & book your next live experience</p>

                    <div className="search-container">
                        <input
                            type="text"
                            placeholder="Search by artist, venue or city..."
                            className="search-input"
                        />
                        <span className="search-icon">🔍</span>
                    </div>
                </header>

                <div className="concert-list">
                    {concerts.length === 0 ? (
                        <div className="empty-state">
                            No concerts found in the database.
                        </div>
                    ) : (
                        concerts.map((item) => (
                            <ConcertInfo
                                key={item.id}
                                concertId={item.id}
                                concerts={concerts}
                            />
                        ))
                    )}
                </div>
            </div>

            {/* Postranní panel - Pravá strana */}
            <div className='sidebar'>
                <div className='user-panel'>
                    {!isLoggedIn ? (
                        <div className="auth-buttons">
                            <Link to="/signin">
                                <button className="btn-secondary">Sign In</button>
                            </Link>
                            <Link to="/signup">
                                <button className="btn-primary">Sign Up</button>
                            </Link>
                        </div>
                    ) : (
                        <div className="logged-user">
                            <div className="user-greeting">
                                <span>Hello,</span>
                                <Link to="/edituser" className="username-link">{username}</Link>
                            </div>
                            <button onClick={handleLogout} className="btn-logout">
                                Log Out
                            </button>
                        </div>
                    )}
                </div>

                <div className="sidebar-content">
                    <SideTicketList />
                </div>
            </div>
        </div>
    );
}