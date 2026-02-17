import { useEffect, useState } from 'react';
import "./App.css";
import { Link, useNavigate } from "react-router-dom"; // Přidat useNavigate
import SideTicketList from './Components/TicketSideList.tsx';

interface Concert {
    id: number;
    bands: string;
    venue: string;
    date: string;
    price: string;
    openers?: string;
}

// Přidali jsme prop 'isAdmin'
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
            </div>

            <div className="concert-info">
                <h2 className="headliner">{headliner}</h2>
                <p className="openers">
                    {guests ? `with ${guests}` : (concert.openers ? `with ${concert.openers}` : "")}
                </p>
                <div className="meta-info">
                    <span>📍 {concert.venue}</span>
                    <span>💰 {priceRange}</span>
                </div>
            </div>

            <div className="concert-action">
                {/* LOGIKA: Pokud je Admin, zobrazí EDIT, jinak GET TICKETS */}
                {isAdmin ? (
                    <Link to={`/admin/concert/${concert.id}`} className="cta-link">
                        <button className="cta-btn" style={{ backgroundColor: '#444', border: '1px solid #ffa500' }}>
                            ✏️ Edit
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
   // const [isAdmin, setIsAdmin] = useState<boolean>(false); // Stav pro admina
    // Natvrdo nastavíme true, abychom viděli tlačítka
    const [isAdmin, setIsAdmin] = useState<boolean>(true);
    const [username, setUsername] = useState<string>("");

    useEffect(() => {
        const token = localStorage.getItem("token");
        const storedUsername = localStorage.getItem("username");

        // Získáme roli a odstraníme případné uvozovky, mezery a převedeme na malá písmena
        let rawRole = localStorage.getItem("role");

        // Ošetření, kdyby tam bylo null
        if (rawRole === null) rawRole = "";

        // Vyčistíme string (někdy se tam uloží i s uvozovkami jako '"admin"')
        const cleanRole = rawRole.replace(/['"]+/g, '').trim().toLowerCase();

        console.log("Surová role:", rawRole);
        console.log("Čistá role:", cleanRole);

        setIsLoggedIn(!!token);
        setUsername(storedUsername || "");

        // Teď porovnáme čistou roli
        if (cleanRole === "admin") {
            setIsAdmin(true);
        } else {
            setIsAdmin(false);
        }

        // ... zbytek kódu pro fetch koncertů ...
        const API_URL = `${import.meta.env.VITE_API_URL}/api/concerts`;

        fetch(API_URL)
            .then((res) => {
                if (!res.ok) throw new Error("API not responding");
                return res.json();
            })
            .then((data: Concert[]) => {
                setConcerts(data);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Connection failed:", err);
                setLoading(false);
            });
    }, []);

    const handleLogout = () => {
        localStorage.clear(); // Vyčistí vše (token, username, role)
        window.location.reload();
    };

    if (loading) return <div className="loading-screen">Loading concerts...</div>;

    return (
        <div className='app-container'>
            <div className="main-content">
                <header className="app-header">
                    <h1>The Ticket Stand</h1>


                    <div style={{ background: 'red', color: 'white', padding: '10px', margin: '10px 0' }}>
                        DEBUG INFO: <br />
                        Role v localStorage: <b>{localStorage.getItem("role") || "NULL"}</b> <br />
                        Je Admin?: <b>{isAdmin ? "ANO" : "NE"}</b>
                    </div>


                    <p className="subtitle">Discover & book your next live experience</p>

                    {/* Vyhledávání + Admin tlačítko */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '20px' }}>

                        <div className="search-container" style={{ marginTop: 0, flex: 1 }}>
                            <input
                                type="text"
                                placeholder="Search by artist, venue..."
                                className="search-input"
                            />
                            <span className="search-icon">🔍</span>
                        </div>

                        {/* TLAČÍTKO PLUS PRO ADMINA */}
                        {isAdmin && (
                            <Link to="/admin/concert/new" style={{ marginLeft: '20px' }}>
                                <button style={{
                                    width: '50px',
                                    height: '50px',
                                    borderRadius: '50%',
                                    background: '#ffa500',
                                    color: 'black',
                                    border: 'none',
                                    fontSize: '2rem',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: 'bold'
                                }}>
                                    +
                                </button>
                            </Link>
                        )}
                    </div>
                </header>

                <div className="concert-list">
                    {concerts.length === 0 ? (
                        <div className="empty-state">No concerts found.</div>
                    ) : (
                        concerts.map((item) => (
                            <ConcertInfo
                                key={item.id}
                                concertId={item.id}
                                concerts={concerts}
                                isAdmin={isAdmin} // Posíláme info dolů
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
                                {isAdmin && <small style={{ color: '#ffa500', display: 'block' }}> (Administrator)</small>}
                            </div>
                            <button onClick={handleLogout} className="btn-logout">Log Out</button>
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