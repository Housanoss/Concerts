import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import './Concert.css';

const API_BASE = import.meta.env.VITE_API_URL;

interface Concert {
    id: number;
    date: string;
    venue: string;
    bands: string;
    price: string;
    description: string;
    genres: string;
    sold_out: number;
}

interface Ticket {
    id: number;
    concert_id: number;
    user_id: number | null;
    price: number;
    type: string;
}

const Concert = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [concert, setConcert] = useState<Concert | null>(null);
    const [allTickets, setAllTickets] = useState<Ticket[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [purchaseSuccess, setPurchaseSuccess] = useState<string | null>(null);

    const token = localStorage.getItem("token");
    const username = localStorage.getItem("username");
    const isLoggedIn = !!token;

    useEffect(() => {
        const fetchConcertData = async () => {
            setLoading(true);
            setError(null);

            console.log("Fetching concert with ID:", id);
            console.log("API_BASE:", API_BASE);

            try {
                const concertUrl = `${API_BASE}/api/concerts/${id}`;
                console.log("Fetching from:", concertUrl);

                const concertRes = await fetch(concertUrl);
                console.log("Concert response status:", concertRes.status);

                if (!concertRes.ok) {
                    throw new Error(`Concert not found (${concertRes.status})`);
                }

                const concertData = await concertRes.json();
                console.log("Concert data:", concertData);
                setConcert(concertData);

                const ticketsUrl = `${API_BASE}/api/tickets/concert/${id}`;
                console.log("Fetching tickets from:", ticketsUrl);

                const ticketsRes = await fetch(ticketsUrl);
                console.log("Tickets response status:", ticketsRes.status);

                if (ticketsRes.ok) {
                    const ticketsData = await ticketsRes.json();
                    console.log("All tickets data:", ticketsData);
                    setAllTickets(ticketsData);
                } else {
                    console.log("Tickets fetch failed, but continuing...");
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

    const handleBuyTicket = async (ticketId: number, ticketType: string, price: number) => {
        if (!isLoggedIn) {
            navigate('/signin');
            return;
        }

        setPurchaseSuccess(null);
        setError(null);

        try {
            const res = await fetch(`${API_BASE}/api/tickets/${ticketId}/purchase`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Purchase failed");
            }

            setPurchaseSuccess(`Successfully purchased ${ticketType} ticket for $${price}!`);

            const ticketsRes = await fetch(`${API_BASE}/api/tickets/concert/${id}`);
            if (ticketsRes.ok) {
                const ticketsData = await ticketsRes.json();
                setAllTickets(ticketsData);
            }

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
                <p style={{ fontSize: '12px', color: '#999' }}>
                    Check browser console (F12) for details
                </p>
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

    const availableTickets = allTickets.filter(ticket => !ticket.user_id || ticket.user_id === 0);
    const soldTickets = allTickets.filter(ticket => ticket.user_id && ticket.user_id !== 0);

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
                    <p>{new Date(concert.date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    })}</p>
                </div>

                <div className="detail-section">
                    <h3>Venue</h3>
                    <p>{concert.venue}</p>
                </div>

                <div className="detail-section">
                    <h3>Genres</h3>
                    <p>{concert.genres}</p>
                </div>

                <div className="detail-section">
                    <h3>Price Range</h3>
                    <p>${concert.price}</p>
                </div>

                <div className="detail-section description">
                    <h3>About</h3>
                    <p>{concert.description}</p>
                </div>
            </div>

            <div className="tickets-section">
                <h2>Tickets Overview</h2>
                <p style={{ color: '#666', marginBottom: '20px' }}>
                    Total: {allTickets.length} tickets |
                    Available: {availableTickets.length} |
                    Sold: {soldTickets.length}
                </p>

                {purchaseSuccess && (
                    <div className="success-message">{purchaseSuccess}</div>
                )}

                {error && (
                    <div className="error-message">{error}</div>
                )}

                {!isLoggedIn && (
                    <div className="login-prompt">
                        <p>Please <a href="/signin">sign in</a> to purchase tickets</p>
                    </div>
                )}

                {concert.sold_out === 1 ? (
                    <p className="no-tickets">This concert is sold out!</p>
                ) : (
                    <>
                        <h3>Available Tickets ({availableTickets.length})</h3>
                        {availableTickets.length === 0 ? (
                            <p className="no-tickets">No tickets available at the moment</p>
                        ) : (
                            <div className="tickets-list">
                                <table className="tickets-table">
                                    <thead>
                                        <tr>
                                            <th>Type</th>
                                            <th>Price</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {availableTickets.map((ticket) => (
                                            <tr key={ticket.id}>
                                                <td><span className={`ticket-type-badge ${ticket.type.toLowerCase()}`}>{ticket.type}</span></td>
                                                <td>${ticket.price}</td>
                                                <td>
                                                    <button
                                                        onClick={() => handleBuyTicket(ticket.id, ticket.type, ticket.price)}
                                                        disabled={!isLoggedIn}
                                                        className="buy-ticket-btn-small"
                                                    >
                                                        {isLoggedIn ? 'Buy' : 'Sign in'}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {soldTickets.length > 0 && (
                            <>
                                <h3 style={{ marginTop: '40px' }}>Sold Tickets ({soldTickets.length})</h3>
                                <div className="tickets-list">
                                    <table className="tickets-table">
                                        <thead>
                                            <tr>
                                                <th>Type</th>
                                                <th>Price</th>
                                                <th>Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {soldTickets.map((ticket) => (
                                                <tr key={ticket.id} className="sold-ticket-row">
                                                    <td><span className={`ticket-type-badge ${ticket.type.toLowerCase()}`}>{ticket.type}</span></td>
                                                    <td>${ticket.price}</td>
                                                    <td><span className="sold-badge">SOLD</span></td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default Concert;