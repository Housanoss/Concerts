import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminTickets.css';

const API_BASE = import.meta.env.VITE_API_URL;

interface AdminTicket {
    ticketId: number;
    ownerEmail: string;
    concertArtist: string;
    price: number;
    type: string;
    venue: string;
    date: string;
}

const AdminTickets = () => {
    const navigate = useNavigate();
    const [tickets, setTickets] = useState<AdminTicket[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const [editingId, setEditingId] = useState<number | null>(null);
    const [editForm, setEditForm] = useState({
        price: 0, type: 'Standard', soldOut: false, venue: '', date: ''
    });

    const token = localStorage.getItem("token");

    const fetchTickets = async () => {
        try {
            const res = await fetch(`${API_BASE}/api/tickets/admin/all`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!res.ok) {
                if (res.status === 401 || res.status === 403) {
                    throw new Error("Nemáte oprávnìní Administrátora!");
                }
                throw new Error("Chyba pøi naèítání lístkù.");
            }

            const data = await res.json();
            setTickets(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Neznámá chyba");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!token) {
            navigate('/signin');
            return;
        }
        fetchTickets();
    }, [token, navigate]);

    const handleEditClick = (ticket: AdminTicket) => {
        const dateStr = ticket.date ? new Date(ticket.date).toISOString().slice(0, 16) : '';
        setEditingId(ticket.ticketId);
        setEditForm({
            price: ticket.price,
            type: ticket.type,
            soldOut: false,
            venue: ticket.venue || '',
            date: dateStr
        });
    };

    const handleSave = async (ticketId: number) => {
        try {
            const res = await fetch(`${API_BASE}/api/tickets/admin/${ticketId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    price: editForm.price,
                    type: editForm.type,
                    soldOut: editForm.soldOut
                })
            });

            if (!res.ok) throw new Error("Chyba pøi ukládání úprav.");

            alert("Lístek byl úspìšnì upraven!");
            setEditingId(null);
            fetchTickets();
        } catch (err) {
            alert(err instanceof Error ? err.message : "Chyba uložení");
        }
    };

    const handleDelete = async (ticketId: number) => {
        if (!window.confirm("Opravdu chcete tento lístek trvale smazat?")) return;

        try {
            const res = await fetch(`${API_BASE}/api/tickets/admin/${ticketId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!res.ok) throw new Error("Chyba pøi mazání.");

            alert("Lístek smazán.");
            fetchTickets();
        } catch (err) {
            alert(err instanceof Error ? err.message : "Chyba mazání");
        }
    };

    if (loading) return <div className="admin-loading">Naèítám administraci...</div>;

    if (error) return (
        <div className="admin-error">
            <h2>Pøístup odepøen</h2>
            <p>{error}</p>
            <button onClick={() => navigate('/')}>Zpìt na domovskou stránku</button>
        </div>
    );

    return (
        <div className="admin-tickets-page">
            <h1>Admin Panel - Správa lístkù</h1>
            <p>Zde mùžete upravovat vlastnosti lístkù nebo je smazat.</p>

            <table className="admin-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Vlastník</th>
                        <th>Koncert</th>
                        <th>Typ lístku</th>
                        <th>Cena ($)</th>
                        <th>Vyprodat Koncert?</th>
                        <th>Akce</th>
                    </tr>
                </thead>
                <tbody>
                    {tickets.map(ticket => {
                        const isEditing = editingId === ticket.ticketId;

                        return (
                            <tr key={ticket.ticketId}>
                                <td>#{ticket.ticketId}</td>
                                <td>{ticket.ownerEmail}</td>
                                <td>{ticket.concertArtist}</td>

                                <td>
                                    {isEditing ? (
                                        <select
                                            value={editForm.type}
                                            onChange={(e) => setEditForm({ ...editForm, type: e.target.value })}
                                        >
                                            <option value="Standard">Standard</option>
                                            <option value="VIP">VIP</option>
                                            <option value="Golden Circle">Golden Circle</option>
                                        </select>
                                    ) : ticket.type}
                                </td>

                                <td>
                                    {isEditing ? (
                                        <input
                                            type="number"
                                            value={editForm.price}
                                            onChange={(e) => setEditForm({ ...editForm, price: parseFloat(e.target.value) })}
                                        />
                                    ) : ticket.price}
                                </td>

                                <td style={{ textAlign: 'center' }}>
                                    {isEditing ? (
                                        <input
                                            type="checkbox"
                                            checked={editForm.soldOut}
                                            onChange={(e) => setEditForm({ ...editForm, soldOut: e.target.checked })}
                                        />
                                    ) : "-"}
                                </td>

                                <td>
                                    {isEditing ? (
                                        <>
                                            <button className="btn-save" onClick={() => handleSave(ticket.ticketId)}>Uložit</button>
                                            <button className="btn-cancel" onClick={() => setEditingId(null)}>Zrušit</button>
                                        </>
                                    ) : (
                                        <>
                                            <button className="btn-edit" onClick={() => handleEditClick(ticket)}>Upravit</button>
                                            <button className="btn-delete" onClick={() => handleDelete(ticket.ticketId)}>Smazat</button>
                                        </>
                                    )}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>

            {tickets.length === 0 && <p className="admin-empty">Žádné lístky nebyly nalezeny.</p>}
        </div>
    );
};

export default AdminTickets;