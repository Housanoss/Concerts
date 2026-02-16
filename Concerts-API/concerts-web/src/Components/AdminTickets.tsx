import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_URL;

interface AdminTicket {
    ticketId: number;
    ownerEmail: string;
    concertArtist: string;
    price: number;
    type: string;
}

const AdminTickets = () => {
    const navigate = useNavigate();
    const [tickets, setTickets] = useState<AdminTicket[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Stavy pro editaci
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editForm, setEditForm] = useState({ price: 0, type: 'Standard', soldOut: false });

    const token = localStorage.getItem("token");

    // Na?tení všech lístk? pro Admina
    const fetchTickets = async () => {
        try {
            const res = await fetch(`${API_BASE}/api/tickets/admin/all`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!res.ok) {
                if (res.status === 401 || res.status === 403) {
                    throw new Error("Nemáte oprávn?ní Administrátora!");
                }
                throw new Error("Chyba p?i na?ítání lístk?.");
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

    // Zapnutí edita?ního módu pro konkrétní ?ádek
    const handleEditClick = (ticket: AdminTicket) => {
        setEditingId(ticket.ticketId);
        setEditForm({ price: ticket.price, type: ticket.type, soldOut: false });
    };

    // Uložení zm?n na Backend
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

            if (!res.ok) throw new Error("Chyba p?i ukládání úprav.");

            alert("Lístek byl úsp?šn? upraven!");
            setEditingId(null); // Vypneme editaci
            fetchTickets();     // Znovu na?teme data, a? vidíme zm?ny
        } catch (err) {
            alert(err instanceof Error ? err.message : "Chyba uložení");
        }
    };

    // Smazání lístku (Storno)
    const handleDelete = async (ticketId: number) => {
        if (!window.confirm("Opravdu chcete tento lístek trvale smazat?")) return;

        try {
            const res = await fetch(`${API_BASE}/api/tickets/admin/${ticketId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!res.ok) throw new Error("Chyba p?i mazání.");

            alert("Lístek smazán.");
            fetchTickets();
        } catch (err) {
            alert(err instanceof Error ? err.message : "Chyba mazání");
        }
    };

    if (loading) return <div style={{ color: 'white', padding: '20px' }}>Na?ítám administraci...</div>;

    if (error) return (
        <div style={{ padding: '20px', color: 'red', textAlign: 'center' }}>
            <h2>P?ístup odep?en</h2>
            <p>{error}</p>
            <button onClick={() => navigate('/')} style={{ padding: '10px' }}>Zp?t na domovskou stránku</button>
        </div>
    );

    return (
        <div style={{ padding: '40px', color: 'white', maxWidth: '1000px', margin: '0 auto' }}>
            <h1 style={{ color: '#ffa500' }}>??? Admin Panel - Správa lístk?</h1>
            <p>Zde m?žete upravovat vlastnosti lístk? nebo je smazat.</p>

            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px', background: '#222' }}>
                <thead>
                    <tr style={{ background: '#333', textAlign: 'left' }}>
                        <th style={{ padding: '15px' }}>ID</th>
                        <th style={{ padding: '15px' }}>Vlastník</th>
                        <th style={{ padding: '15px' }}>Koncert</th>
                        <th style={{ padding: '15px' }}>Typ lístku</th>
                        <th style={{ padding: '15px' }}>Cena ($)</th>
                        <th style={{ padding: '15px' }}>Vyprodat Koncert?</th>
                        <th style={{ padding: '15px' }}>Akce</th>
                    </tr>
                </thead>
                <tbody>
                    {tickets.map(ticket => {
                        const isEditing = editingId === ticket.ticketId;

                        return (
                            <tr key={ticket.ticketId} style={{ borderBottom: '1px solid #444' }}>
                                <td style={{ padding: '15px' }}>#{ticket.ticketId}</td>
                                <td style={{ padding: '15px' }}>{ticket.ownerEmail}</td>
                                <td style={{ padding: '15px' }}>{ticket.concertArtist}</td>

                                {/* Editace Typu */}
                                <td style={{ padding: '15px' }}>
                                    {isEditing ? (
                                        <select
                                            value={editForm.type}
                                            onChange={(e) => setEditForm({ ...editForm, type: e.target.value })}
                                            style={{ padding: '5px' }}
                                        >
                                            <option value="Standard">Standard</option>
                                            <option value="VIP">VIP</option>
                                            <option value="Golden Circle">Golden Circle</option>
                                        </select>
                                    ) : (
                                        ticket.type
                                    )}
                                </td>

                                {/* Editace Ceny */}
                                <td style={{ padding: '15px' }}>
                                    {isEditing ? (
                                        <input
                                            type="number"
                                            value={editForm.price}
                                            onChange={(e) => setEditForm({ ...editForm, price: parseFloat(e.target.value) })}
                                            style={{ width: '60px', padding: '5px' }}
                                        />
                                    ) : (
                                        ticket.price
                                    )}
                                </td>

                                {/* Tla?ítko pro Vyprodání (Sold Out) */}
                                <td style={{ padding: '15px', textAlign: 'center' }}>
                                    {isEditing ? (
                                        <input
                                            type="checkbox"
                                            checked={editForm.soldOut}
                                            onChange={(e) => setEditForm({ ...editForm, soldOut: e.target.checked })}
                                        />
                                    ) : (
                                        "-"
                                    )}
                                </td>

                                {/* Ak?ní tla?ítka */}
                                <td style={{ padding: '15px' }}>
                                    {isEditing ? (
                                        <>
                                            <button onClick={() => handleSave(ticket.ticketId)} style={{ background: 'green', color: 'white', padding: '5px 10px', marginRight: '5px', cursor: 'pointer' }}>Uložit</button>
                                            <button onClick={() => setEditingId(null)} style={{ background: 'gray', color: 'white', padding: '5px 10px', cursor: 'pointer' }}>Zrušit</button>
                                        </>
                                    ) : (
                                        <>
                                            <button onClick={() => handleEditClick(ticket)} style={{ background: '#ffa500', color: 'black', padding: '5px 10px', marginRight: '5px', cursor: 'pointer' }}>Upravit</button>
                                            <button onClick={() => handleDelete(ticket.ticketId)} style={{ background: 'red', color: 'white', padding: '5px 10px', cursor: 'pointer' }}>Smazat</button>
                                        </>
                                    )}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>

            {tickets.length === 0 && <p style={{ textAlign: 'center', marginTop: '20px' }}>Žádné lístky nebyly nalezeny.</p>}
        </div>
    );
};

export default AdminTickets;