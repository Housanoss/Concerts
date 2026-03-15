import { useEffect, useState } from 'react';
import './TicketSideList.css';

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
        <div className="side-ticket-box">
            <h3>My Tickets</h3>

            {loading && <p className="side-ticket-loading">Loading tickets...</p>}

            {!isLoggedIn && !loading && (
                <p className="side-ticket-signin">Sign in to view your tickets.</p>
            )}

            {isLoggedIn && tickets.length === 0 && !loading && (
                <p className="side-ticket-empty">You haven't bought any tickets yet.</p>
            )}

            <div className="tickets-list">
                {tickets.map(ticket => (
                    <div key={ticket.ticketId} className="ticket-item">
                        <strong className="ticket-item-headliner">{ticket.headliner}</strong>
                        <span className="ticket-item-date">
                            {new Date(ticket.date).toLocaleDateString()}
                        </span>
                        <br />
                        <span className="ticket-item-venue">{ticket.venue}</span>
                        <br />
                        <span className="ticket-item-type">
                            {ticket.type} – ${ticket.price?.toFixed(2)}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SideTicketList;