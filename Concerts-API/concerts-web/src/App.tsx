import { useEffect, useState } from 'react';
import "./App.css";
import { Link } from "react-router-dom";
import SideTicketList from './Components/TicketSideList.tsx';

interface Concert {
    id: number;
    headliner: string;
    bands: string;
    venue: string;
    date: string;
    price: string;
    openers: string;
}

interface ConcertTicketProps {
    concertId: number;
    concerts: Concert[];
}

function ConcertInfo({ concertId, concerts }: ConcertTicketProps) {
    const concert = concerts.find(c => c.id === concertId);

    if (!concert) return <p>Concert with ID {concertId} not found.</p>;

    return (
        <div className="concert">
            <h2 style={{ margin: 0 }}>{concert.headliner}</h2>
            <p style={{ color: '#555' }}>Openers: {concert.openers}</p>
            <small style={{ color: '#555' }}>Date: {new Date(concert.date).toLocaleDateString()}</small>
            <p style={{ color: '#555' }}>Venue: {concert.venue}</p>
            <p style={{ color: '#555' }}>Price range: {concert.price}</p>

            <Link to={`/concert/${concert.id}`}>
            <button>Take me there!</button>
            </Link>
        </div>
    );
}

export default function App() {
    const [concerts, setConcerts] = useState<Concert[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
    const [username, setUsername] = useState<string>("");

    useEffect(() => {
        // Kontrola, zda je uživatel přihlášen
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

    if (loading) return <div style={{ padding: '20px' }}>Connecting to API...</div>;

    return (
        <div className='page'>
            <div style={{ fontFamily: 'Arial, sans-serif', flex: 2, marginRight: '40px' }}>
                <h1>The Ticket Stand</h1>
                <hr />
                <p>Current Shows Available:</p>
                <button className="filterBtn">Filter</button>
                <button className="orderbyBtn">Order by</button>

                {concerts.length === 0 ? (
                    <p>No concerts found. Check if your MySQL table has data!</p>
                ) : (
                    <div style={{ display: 'grid', gap: '20px', marginTop: '20px' }}>
                        {concerts.map((item) => (
                            <ConcertInfo
                                key={item.id}
                                concertId={item.id}
                                concerts={concerts}
                            />
                        ))}
                    </div>
                )}
            </div>

            <div className='rightSpace'>
                <div className='topBtns'>
                    {!isLoggedIn && (
                        <>
                            <Link to="/signin">
                                <button className="signInBtn">Sign In</button>
                            </Link>
                            <Link to="/signup">
                                <button className="signUpBtn">Sign Up</button>
                            </Link>
                        </>
                    )}
                    {isLoggedIn && (
                        <>
                            <Link to="/edituser">
                                <span>{username}</span>
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="logoutBtn"
                            >
                                Log Out
                            </button>
                        </>
                    )}
                </div>

                <SideTicketList />
            </div>
        </div>
    );
}