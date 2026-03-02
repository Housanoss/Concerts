import { useEffect, useState } from 'react';
import "./App.css";
import { Link, useNavigate } from "react-router-dom";
import SideTicketList from './Components/TicketSideList.tsx';

interface Concert {
    id: number;
    bands: string;
    venue: string;
    date: string;
    price: string;
    openers?: string;
}

interface ConcertTicketProps {
    concertId: number;
    concerts: Concert[];
    isAdmin: boolean;
}

function ConcertInfo({ concertId, concerts, isAdmin }: ConcertTicketProps) {
    const concert = concerts.find(c => c.id === concertId);
    if (!concert) return null;

    const dateObj = new Date(concert.date);
    const day = dateObj.getDate();
    const month = dateObj.toLocaleDateString('en-US', { month: 'short' });
    const year = dateObj.getFullYear();

    const allBands = concert.bands.split(',');
    const headliner = allBands[0].trim();
    const guests = allBands.slice(1).map(b => b.trim()).join(', ');

    const basePrice = parseFloat(concert.price);
    const maxPrice = basePrice * 1.5;
    const priceRange = `$${basePrice.toFixed(0)} - $${maxPrice.toFixed(0)}`;

    return (
        <div className="concert-card">
            <div className="concert-date">
                <span className="day">{day}</span>
                <span className="month">{month}</span>
                <span className="year">{year}</span>
            </div>

            <div className="concert-info">
                <h2 className="headliner">{headliner}</h2>
                <p className="openers">
                    {guests ? `with ${guests}` : (concert.openers ? `with ${concert.openers}` : "")}
                </p>
                <div className="meta-info">
                    <span>{concert.venue}</span>
                    <span>{priceRange}</span>
                </div>
            </div>

            <div className="concert-action">
                {isAdmin ? (
                    <Link to={`/admin/concert/${concert.id}`} className="cta-link">
                        <button className="cta-btn cta-btn--admin">
                            Edit
                        </button>
                    </Link>
                ) : (
                    <Link to={`/concert/${concert.id}`} className="cta-link">
                        <button className="cta-btn">Get Tickets</button>
                    </Link>
                )}
            </div>
        </div>
    );
}

export default function App() {
    const [concerts, setConcerts] = useState<Concert[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
    const [isAdmin, setIsAdmin] = useState<boolean>(true);
    const [username, setUsername] = useState<string>("");
    const [searchQuery, setSearchQuery] = useState<string>("");

    useEffect(() => {
        const token = localStorage.getItem("token");
        const storedUsername = localStorage.getItem("username");

        let rawRole = localStorage.getItem("role");

        if (rawRole === null) rawRole = "";

        const cleanRole = rawRole.replace(/['"]+/g, '').trim().toLowerCase();

        console.log("Surová role:", rawRole);
        console.log("Čistá role:", cleanRole);

        setIsLoggedIn(!!token);
        setUsername(storedUsername || "");

        if (cleanRole === "admin") {
            setIsAdmin(true);
        } else {
            setIsAdmin(false);
        }

        const API_URL = `${import.meta.env.VITE_API_URL}/api/concerts`;

        fetch(API_URL)
            .then((res) => {
                if (!res.ok) throw new Error("API not responding");
                return res.json();
            })
            .then((data: Concert[]) => {
                const sorted = [...data].sort(
                    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
                );
                setConcerts(sorted);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Connection failed:", err);
                setLoading(false);
            });
    }, []);

    const handleLogout = () => {
        localStorage.clear();
        window.location.reload();
    };

    const filteredConcerts = concerts.filter(c =>
        c.bands.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.venue.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) return <div className="loading-screen">Loading concerts...</div>;

    return (
        <div className='app-container'>
            <div className="main-content">
                <header className="app-header">
                    <h1>The Ticket Stand</h1>



                    <p className="subtitle">Discover & book your next live experience</p>

                    <div className="header-actions">

                        <div className="search-container">
                            <input
                                type="text"
                                placeholder="Search by artist, venue..."
                                className="search-input"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <span className="search-icon"></span>
                        </div>

                        {isAdmin && (
                            <Link to="/admin/concert/new" className="add-concert-link">
                                <button className="btn-add-concert">+</button>
                            </Link>
                        )}
                    </div>
                </header>

                <div className="concert-list">
                    {filteredConcerts.length === 0 ? (
                        <div className="empty-state">No concerts found.</div>
                    ) : (
                        filteredConcerts.map((item) => (
                            <ConcertInfo
                                key={item.id}
                                concertId={item.id}
                                concerts={concerts}
                                isAdmin={isAdmin}
                            />
                        ))
                    )}
                </div>
            </div>

            <div className='sidebar'>
                <div className='user-panel'>
                    {!isLoggedIn ? (
                        <div className="auth-buttons">
                            <Link to="/signin"><button className="btn-secondary">Sign In</button></Link>
                            <Link to="/signup"><button className="btn-primary">Sign Up</button></Link>
                        </div>
                    ) : (
                        <div className="logged-user">
                            <div className="user-greeting">
                                <span>Hello,</span>
                                <Link to="/edituser" className="username-link">{username}</Link>
                                {isAdmin && <small className="admin-badge"> (Administrator)</small>}
                            </div>
                            <button onClick={handleLogout} className="btn-logout">Log Out</button>
                        </div>
                    )}
                </div>
                <div className="sidebar-content">
                    {!isAdmin && <SideTicketList />}
                </div>
            </div>
        </div>
    );
}