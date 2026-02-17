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

// Definice typů lístků a jejich cenových násobků
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

    // Stav pro počty lístků
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

    const handleBuyType = async (typeId: string, label: string, multiplier: number) => {
        if (!isLoggedIn) {
            navigate('/signin');
            return;
        }

        const quantity = quantities[typeId];
        if (quantity === 0) return;

        setPurchaseSuccess(null);

        try {
            const promises = [];
            for (let i = 0; i < quantity; i++) {
                promises.push(
                    fetch(`${API_BASE}/api/tickets/purchase/${id}?type=${label}`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`,
                        },
                    })
                );
            }

            await Promise.all(promises);
            setPurchaseSuccess(`Successfully purchased ${quantity}x ${label} tickets! 🎉`);
            setQuantities(prev => ({ ...prev, [typeId]: 0 }));

        } catch (err) {
            console.error(err);
            setError("Purchase failed.");
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
            {/* --- Horní navigace --- */}
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

            {/* --- Hero Sekce (Hlavička) --- */}
            <header className="hero-section">
                <div className="hero-content">
                    <h1 className="band-title">{concert.bands}</h1>
                    <div className="concert-meta">
                        <span className="meta-item"> {dateObj.toLocaleDateString()}</span>
                        <span className="meta-item"> {concert.venue}</span>
                        <span className="meta-item"> {concert.genres}</span>
                    </div>
                    {concert.sold_out === 1 && <div className="badge-soldout">SOLD OUT</div>}
                </div>
            </header>

            {/* --- Popis --- */}
            <section className="description-section">
                <p>{concert.description}</p>
            </section>

            {/* --- Výběr lístků --- */}
            <main className="tickets-container">
                <h2 className="section-title">Select Tickets</h2>

                {purchaseSuccess && <div className="alert-success">{purchaseSuccess}</div>}
                {error && <div className="alert-error">{error}</div>}

                {concert.sold_out === 1 ? (
                    <div className="sold-out-message">
                        This concert is currently sold out.
                    </div>
                ) : (
                    <div className="ticket-grid">
                        {TICKET_TYPES.map((type) => {
                            const price = basePrice * type.multiplier;
                            const currentQty = quantities[type.id];
                            const totalPrice = price * currentQty;
                            const isActive = currentQty > 0;

                            return (
                                <div key={type.id} className={`ticket-row ${isActive ? 'active' : ''}`}>

                                    {/* Typ a Cena */}
                                    <div className="ticket-info">
                                        <h3>{type.label}</h3>
                                        <span className="price-tag">${price.toFixed(2)} <small>/ each</small></span>
                                    </div>

                                    {/* Počítadlo */}
                                    <div className="ticket-counter">
                                        <button
                                            className="counter-btn"
                                            onClick={() => updateQuantity(type.id, -1)}
                                        >−</button>

                                        <span className="counter-value">{currentQty}</span>

                                        <button
                                            className="counter-btn"
                                            onClick={() => updateQuantity(type.id, 1)}
                                        >+</button>
                                    </div>

                                    {/* Akce */}
                                    <div className="ticket-action">
                                        {isActive && (
                                            <div className="total-price">
                                                Total: <span>${totalPrice.toFixed(2)}</span>
                                            </div>
                                        )}

                                        <button
                                            className="buy-btn"
                                            onClick={() => handleBuyType(type.id, type.label, type.multiplier)}
                                            disabled={!isActive || !isLoggedIn}
                                        >
                                            {isLoggedIn ? (isActive ? 'Buy Now' : 'Add') : 'Sign In'}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>
        </div>
    );
};

export default Concert;