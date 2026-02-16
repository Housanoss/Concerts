import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import './Concert.css';

const API_BASE = import.meta.env.VITE_API_URL;

interface Concert {
    id: number;
    date: string;
    venue: string;
    bands: string; // V DB asi "artist" nebo "headliner"? Upravte dle entity
    price: string; // Základní cena jako string
    description: string;
    genres: string;
    sold_out: number;
}

// Typy lístků pro výběr
const TICKET_TYPES = [
    { label: "Standard", multiplier: 1 },
    { label: "VIP", multiplier: 1.5 },
    { label: "Golden Circle", multiplier: 1.2 }
];

const Concert = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [concert, setConcert] = useState<Concert | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [purchaseSuccess, setPurchaseSuccess] = useState<string | null>(null);

    // Nové stavy pro výběr typu
    const [selectedType, setSelectedType] = useState<string>("Standard");
    const [calculatedPrice, setCalculatedPrice] = useState<number>(0);

    const token = localStorage.getItem("token");
    const username = localStorage.getItem("username");
    const isLoggedIn = !!token;

    useEffect(() => {
        const fetchConcertData = async () => {
            setLoading(true);
            setError(null);

            try {
                const concertUrl = `${API_BASE}/api/concerts/${id}`;
                const concertRes = await fetch(concertUrl);

                if (!concertRes.ok) {
                    throw new Error(`Concert not found (${concertRes.status})`);
                }

                const concertData = await concertRes.json();
                setConcert(concertData);

                // Nastavíme výchozí cenu podle základní ceny koncertu
                if (concertData.price) {
                    setCalculatedPrice(parseFloat(concertData.price));
                }

            } catch (err) {
                console.error("Error fetching concert:", err);
                setError(err instanceof Error ? err.message : "Failed to load concert");
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchConcertData();
        } else {
            setError("No concert ID provided");
            setLoading(false);
        }
    }, [id]);

    // Přepočet ceny při změně typu
    useEffect(() => {
        if (concert && concert.price) {
            const basePrice = parseFloat(concert.price);
            const typeInfo = TICKET_TYPES.find(t => t.label === selectedType);
            if (typeInfo) {
                setCalculatedPrice(basePrice * typeInfo.multiplier);
            }
        }
    }, [selectedType, concert]);

    const handleBuyTicket = async () => {
        if (!isLoggedIn) {
            navigate('/signin');
            return;
        }

        setPurchaseSuccess(null);
        setError(null);

        try {
            // Voláme endpoint pro nákup s parametrem typu
            const res = await fetch(`${API_BASE}/api/tickets/purchase/${id}?type=${selectedType}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || data.error || "Purchase failed");
            }

            const data = await res.json();
            setPurchaseSuccess(`Successfully purchased ${selectedType} ticket for $${data.price || calculatedPrice}!`);

        } catch (err) {
            console.error("Purchase error:", err);
            setError(err instanceof Error ? err.message : "Failed to purchase ticket");
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("username");
        localStorage.removeItem("email");
        window.location.reload();
    };

    if (loading) {
        return (
            <div className="concert-container">
                <p>Loading concert details...</p>
            </div>
        );
    }

    if (error && !concert) {
        return (
            <div className="concert-container">
                <p className="error">Error: {error}</p>
                <button onClick={() => navigate('/')} className="back-button">
                    Back to Concerts
                </button>
            </div>
        );
    }

    if (!concert) {
        return (
            <div className="concert-container">
                <p>Concert not found</p>
                <button onClick={() => navigate('/')} className="back-button">
                    Back to Concerts
                </button>
            </div>
        );
    }

    return (
        <div className="concert-container">
            <div className="concert-top-bar">
                <button onClick={() => navigate('/')} className="back-button">
                    Back to Concerts
                </button>

                <div className="user-controls">
                    {!isLoggedIn ? (
                        <>
                            <Link to="/signin">
                                <button className="signInBtn">Sign In</button>
                            </Link>
                            <Link to="/signup">
                                <button className="signUpBtn">Sign Up</button>
                            </Link>
                        </>
                    ) : (
                        <>
                            <Link to="/edituser">
                                <span className="username-display">{username}</span>
                            </Link>
                            <button onClick={handleLogout} className="logoutBtn">
                                Log Out
                            </button>
                        </>
                    )}
                </div>
            </div>

            <div className="concert-header">
                <h1>{concert.bands}</h1>
                {concert.sold_out === 1 && (
                    <span className="sold-out-badge">SOLD OUT</span>
                )}
            </div>

            <div className="concert-details">
                <div className="detail-section">
                    <h3>Date</h3>
                    <p>{new Date(concert.date).toLocaleDateString()}</p>
                </div>
                <div className="detail-section">
                    <h3>Venue</h3>
                    <p>{concert.venue}</p>
                </div>
                <div className="detail-section">
                    <h3>Base Price</h3>
                    <p>${concert.price}</p>
                </div>
                <div className="detail-section description">
                    <h3>About</h3>
                    <p>{concert.description}</p>
                </div>
            </div>

            <div className="tickets-section">
                <h2>Buy Tickets</h2>

                {purchaseSuccess && (
                    <div className="success-message">{purchaseSuccess}</div>
                )}

                {error && (
                    <div className="error-message">{error}</div>
                )}

                {concert.sold_out === 1 ? (
                    <p className="no-tickets">This concert is sold out!</p>
                ) : (
                    <div className="ticket-purchase-box" style={{ background: '#222', padding: '20px', borderRadius: '10px', maxWidth: '400px', margin: '0 auto' }}>

                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '10px', color: '#ccc' }}>Select Ticket Type:</label>
                            <select
                                value={selectedType}
                                onChange={(e) => setSelectedType(e.target.value)}
                                style={{ width: '100%', padding: '10px', borderRadius: '5px' }}
                            >
                                {TICKET_TYPES.map(type => (
                                    <option key={type.label} value={type.label}>
                                        {type.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div style={{ marginBottom: '20px', textAlign: 'center' }}>
                            <span style={{ fontSize: '1.5rem', color: '#00ff00' }}>
                                Total Price: ${calculatedPrice.toFixed(2)}
                            </span>
                        </div>

                        <button
                            onClick={handleBuyTicket}
                            disabled={!isLoggedIn}
                            style={{
                                width: '100%',
                                padding: '15px',
                                backgroundColor: isLoggedIn ? '#ffa500' : '#555',
                                color: 'white',
                                border: 'none',
                                borderRadius: '5px',
                                fontSize: '1.2rem',
                                cursor: isLoggedIn ? 'pointer' : 'not-allowed'
                            }}
                        >
                            {isLoggedIn ? `Buy ${selectedType} Ticket` : 'Sign in to Buy'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Concert;