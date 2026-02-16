import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
    const [availableTickets, setAvailableTickets] = useState<Ticket[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [purchaseSuccess, setPurchaseSuccess] = useState<string | null>(null);

    const token = localStorage.getItem("token");
    const isLoggedIn = !!token;

    useEffect(() => {
        const fetchConcertData = async () => {
            setLoading(true);
            setError(null);

            console.log("Fetching concert with ID:", id);
            console.log("API_BASE:", API_BASE);

            try {
                // Fetch concert details
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

                // Fetch available tickets for this concert
                const ticketsUrl = `${API_BASE}/api/tickets/concert/${id}`;
                console.log("Fetching tickets from:", ticketsUrl);

                const ticketsRes = await fetch(ticketsUrl);
                console.log("Tickets response status:", ticketsRes.status);

                if (ticketsRes.ok) {
                    const ticketsData = await ticketsRes.json();
                    console.log("Tickets data:", ticketsData);

                    // Filter only tickets without user_id (not sold yet)
                    const available = ticketsData.filter((ticket: Ticket) => !ticket.user_id || ticket.user_id === 0);
                    console.log("Available tickets:", available);
                    setAvailableTickets(available);
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

            // Refresh available tickets
            const ticketsRes = await fetch(`${API_BASE}/api/tickets/concert/${id}`);
            if (ticketsRes.ok) {
                const ticketsData = await ticketsRes.json();
                const available = ticketsData.filter((ticket: Ticket) => !ticket.user_id || ticket.user_id === 0);
                setAvailableTickets(available);
            }

        } catch (err) {
            console.error("Purchase error:", err);
            setError(err instanceof Error ? err.message : "Failed to purchase ticket");
        }
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

    // Group tickets by type
    const ticketsByType = availableTickets.reduce((acc, ticket) => {
        if (!acc[ticket.type]) {
            acc[ticket.type] = [];
        }
        acc[ticket.type].push(ticket);
        return acc;
    }, {} as Record<string, Ticket[]>);

    return (
        <div className="concert-container">
            <div className="concert-header">
                <button onClick={() => navigate('/')} className="back-button">
                    Back to Concerts
                </button>
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
                <h2>Available Tickets</h2>

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
                ) : availableTickets.length === 0 ? (
                    <p className="no-tickets">No tickets available at the moment</p>
                ) : (
                    <div className="ticket-types">
                        {Object.entries(ticketsByType).map(([type, tickets]) => (
                            <div key={type} className="ticket-type-card">
                                <h3>{type}</h3>
                                <p className="ticket-count">{tickets.length} available</p>
                                <p className="ticket-price">${tickets[0].price}</p>
                                <button
                                    onClick={() => handleBuyTicket(tickets[0].id, type, tickets[0].price)}
                                    disabled={!isLoggedIn}
                                    className="buy-ticket-btn"
                                >
                                    {isLoggedIn ? 'Buy Ticket' : 'Sign in to buy'}
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Concert;