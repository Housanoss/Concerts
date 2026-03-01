import { useEffect, useState } from 'react';

const API_BASE = import.meta.env.VITE_API_URL;

interface MyTicket {
    ticketId: number;
    headliner: string;
    venue: string;
    date: string;
    type: string;
    price: number;
}

const SideTicketList = () => {
    const [tickets, setTickets] = useState<MyTicket[]>([]);
    const [loading, setLoading] = useState(true);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("token");

        if (!token) {
            setIsLoggedIn(false);
            setLoading(false);
            return;
        }

        setIsLoggedIn(true);

        fetch(`${API_BASE}/api/tickets/mine`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        })
            .then(res => {
                if (res.status === 401) {
                    localStorage.removeItem("token");
                    setIsLoggedIn(false);
                    throw new Error("Unauthorized");
                }
                return res.json();
            })
            .then((data) => {
                setTickets(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Chyba při načítání lístků:", err);
                setLoading(false);
            });
    }, []);

    return (
        <div className="side-ticket-box" style={{
            backgroundColor: '#2a2a2a',
            padding: '15px',
            borderRadius: '10px',
            marginTop: '20px',
            color: 'white'
        }}>
            <h3 style={{ borderBottom: '2px solid #555', paddingBottom: '10px' }}>
                My Tickets
            </h3>

            {loading && <p>Loading tickets...</p>}

            {!isLoggedIn && !loading && (
                <div style={{ textAlign: 'center', marginTop: '10px' }}>
                    <p style={{ fontSize: '14px', color: '#ccc' }}>Sign in to view your tickets.</p>
                </div>
            )}

            {isLoggedIn && tickets.length === 0 && !loading && (
                <p style={{ color: '#aaa', fontStyle: 'italic' }}>You haven't bought any tickets yet.</p>
            )}

            <div className="tickets-list" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {tickets.map(ticket => (
                    <div key={ticket.ticketId} style={{
                        padding: '10px',
                        borderRadius: '5px',
                        borderBottom: '1px solid #444',
                        marginBottom: '10px'
                    }}>
                        <strong style={{ fontSize: '1.1em', display: 'block' }}>{ticket.headliner}</strong>
                        <span style={{ fontSize: '0.85em', color: '#ccc' }}>
                            {new Date(ticket.date).toLocaleDateString()}
                        </span>
                        <br />
                        <span style={{ fontSize: '0.85em', color: '#888' }}>{ticket.venue}</span>
                        <br />
                        <span style={{ fontSize: '0.8em', color: '#ffa500' }}>
                            {ticket.type} – ${ticket.price?.toFixed(2)}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SideTicketList;