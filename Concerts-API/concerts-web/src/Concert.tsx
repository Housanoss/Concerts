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
    userId: number;
    price: number;
    type: string;
}

const TICKET_TYPES = [
    { id: 'standard', label: "Standard", multiplier: 1 },
    { id: 'vip', label: "VIP", multiplier: 1.5 },
    { id: 'gold', label: "Golden Circle", multiplier: 1.2 }
];

const Concert = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [concert, setConcert] = useState<Concert | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [purchaseSuccess, setPurchaseSuccess] = useState<string | null>(null);
    const [isPurchasing, setIsPurchasing] = useState<boolean>(false);

    const [quantities, setQuantities] = useState<{ [key: string]: number }>({
        standard: 0,
        vip: 0,
        gold: 0
    });

    const token = localStorage.getItem("token");
    const username = localStorage.getItem("username");
    const isLoggedIn = !!token;

    useEffect(() => {
        const fetchConcertData = async () => {
            setLoading(true);
            try {
                const res = await fetch(`${API_BASE}/api/concerts/${id}`);
                if (!res.ok) throw new Error("Concert not found");
                const data = await res.json();
                setConcert(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to load concert");
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchConcertData();
    }, [id]);

    const updateQuantity = (typeId: string, delta: number) => {
        setQuantities(prev => ({
            ...prev,
            [typeId]: Math.max(0, prev[typeId] + delta)
        }));
    };

    const cartItems = TICKET_TYPES.filter(t => quantities[t.id] > 0).map(t => ({
        ...t,
        quantity: quantities[t.id],
        price: parseFloat(concert?.price || "0") * t.multiplier,
    }));

    const cartTotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    const handleCheckout = async () => {
        if (!isLoggedIn) {
            navigate('/signin');
            return;
        }

        setIsPurchasing(true);
        setPurchaseSuccess(null);
        setError(null);

        try {
            // 1. Načteme všechny lístky pro tento koncert
            const ticketsRes = await fetch(`${API_BASE}/api/tickets/concert/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const allTickets: Ticket[] = await ticketsRes.json();

            // 2. Pro každý typ v košíku najdeme volné lístky (UserId == 1) a koupíme je
            for (const item of cartItems) {
                const freeTickets = allTickets
                    .filter(t => t.type === item.label && t.userId === 1)
                    .slice(0, item.quantity);

                if (freeTickets.length < item.quantity) {
                    setError(`Not enough ${item.label} tickets available.`);
                    setIsPurchasing(false);
                    return;
                }

                // 3. Postupně kupujeme každý volný lístek
                for (const ticket of freeTickets) {
                    const res = await fetch(`${API_BASE}/api/tickets/${ticket.id}/purchase`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`,
                        },
                    });

                    if (!res.ok) {
                        setError("Purchase failed. Please try again.");
                        setIsPurchasing(false);
                        return;
                    }
                }
            }

            setPurchaseSuccess(`Successfully purchased ${cartCount} ticket(s)! 🎉`);
            setQuantities({ standard: 0, vip: 0, gold: 0 });

        } catch (err) {
            console.error(err);
            setError("Purchase failed. Please try again.");
        } finally {
            setIsPurchasing(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("username");
        window.location.reload();
    };

    if (loading) return <div className="loading-screen">Loading concert details...</div>;
    if (!concert) return <div className="error-screen">Concert not found</div>;

    const basePrice = parseFloat(concert.price);
    const dateObj = new Date(concert.date);

    return (
        <div className="concert-page">
            <nav className="top-nav">
                <button onClick={() => navigate('/')} className="nav-back-btn">
                    ← Back to List
                </button>
                <div className="nav-user">
                    {!isLoggedIn ? (
                        <Link to="/signin"><button className="btn-signin">Sign In</button></Link>
                    ) : (
                        <>
                            <span className="user-name">{username}</span>
                            <button onClick={handleLogout} className="btn-logout">Log Out</button>
                        </>
                    )}
                </div>
            </nav>

            <header className="hero-section">
                <div className="hero-content">
                    <h1 className="band-title">{concert.bands}</h1>
                    <div className="concert-meta">
                        <span className="meta-item">{dateObj.toLocaleDateString()}</span>
                        <span className="meta-item">{concert.venue}</span>
                        <span className="meta-item">{concert.genres}</span>
                    </div>
                    {concert.sold_out === 1 && <div className="badge-soldout">SOLD OUT</div>}
                </div>
            </header>

            <section className="description-section">
                <p>{concert.description}</p>
            </section>

            <main className="tickets-container">
                <h2 className="section-title">Select Tickets</h2>

                {purchaseSuccess && <div className="alert-success">{purchaseSuccess}</div>}
                {error && <div className="alert-error">{error}</div>}

                {concert.sold_out === 1 ? (
                    <div className="sold-out-message">
                        This concert is currently sold out.
                    </div>
                ) : (
                    <>
                        <div className="ticket-grid">
                            {TICKET_TYPES.map((type) => {
                                const price = basePrice * type.multiplier;
                                const currentQty = quantities[type.id];
                                const isActive = currentQty > 0;

                                return (
                                    <div key={type.id} className={`ticket-row ${isActive ? 'active' : ''}`}>
                                        <div className="ticket-info">
                                            <h3>{type.label}</h3>
                                            <span className="price-tag">${price.toFixed(2)} <small>/ each</small></span>
                                        </div>
                                        <div className="ticket-counter">
                                            <button className="counter-btn" onClick={() => updateQuantity(type.id, -1)}>−</button>
                                            <span className="counter-value">{currentQty}</span>
                                            <button className="counter-btn" onClick={() => updateQuantity(type.id, 1)}>+</button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {cartItems.length > 0 && (
                            <div className="cart-section">
                                <h2 className="section-title">🛒 Your Cart</h2>
                                <div className="cart-items">
                                    {cartItems.map(item => (
                                        <div key={item.id} className="cart-item">
                                            <span className="cart-item-label">{item.label}</span>
                                            <span className="cart-item-qty">{item.quantity}x</span>
                                            <span className="cart-item-price">${(item.price * item.quantity).toFixed(2)}</span>
                                            <button
                                                className="cart-item-remove"
                                                onClick={() => setQuantities(prev => ({ ...prev, [item.id]: 0 }))}
                                            >✕</button>
                                        </div>
                                    ))}
                                </div>
                                <div className="cart-footer">
                                    <div className="cart-total">
                                        Total: <span>${cartTotal.toFixed(2)}</span>
                                    </div>
                                    {!isLoggedIn ? (
                                        <Link to="/signin">
                                            <button className="checkout-btn">Sign In to Buy</button>
                                        </Link>
                                    ) : (
                                        <button
                                            className="checkout-btn"
                                            onClick={handleCheckout}
                                            disabled={isPurchasing}
                                        >
                                            {isPurchasing ? "Processing..." : `Buy ${cartCount} Ticket(s)`}
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </main>
        </div>
    );
};

export default Concert;