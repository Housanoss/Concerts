import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './ConcertEditor.css';

const API_BASE = import.meta.env.VITE_API_URL;

interface AdminTicket {
    ticketId: number;
    userId?: number;
    UserId?: number;
    ownerId?: number;
    ownerEmail?: string;
    concertArtist?: string;
    price: number;
    type: string;
    venue?: string;
    date?: string;
}

interface TicketBatch {
    type: string;
    count: number;
    price: number;
}

export default function ConcertEditor() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditMode = !!id;
    const token = localStorage.getItem("token");

    const [form, setForm] = useState({
        bands: '',
        venue: '',
        date: '',
        price: '',
        description: '',
        genres: '',
        sold_out: false
    });

    const [batches, setBatches] = useState<TicketBatch[]>([
        { type: 'Standard', count: 0, price: 0 },
        { type: 'VIP', count: 0, price: 0 },
        { type: 'Golden Circle', count: 0, price: 0 }
    ]);

    const [soldTickets, setSoldTickets] = useState<AdminTicket[]>([]);

    const fetchTickets = async () => {
        try {
            const res = await fetch(`${API_BASE}/api/tickets/concert/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.ok) {
                const data: AdminTicket[] = await res.json();
                console.log("Načtené lístky z DB:", data);

                const isUnsold = (t: any) => t.userId === 1 || t.UserId === 1 || t.ownerId === 1;

                setSoldTickets(data.filter(t => !isUnsold(t)));

                const unsold = data.filter(t => isUnsold(t));
                const std = unsold.filter(t => (t.type || "").toLowerCase() === 'standard');
                const vip = unsold.filter(t => (t.type || "").toLowerCase() === 'vip');
                const gold = unsold.filter(t => (t.type || "").toLowerCase() === 'golden circle');

                setBatches([
                    { type: 'Standard', count: std.length, price: std.length > 0 ? std[0].price : 0 },
                    { type: 'VIP', count: vip.length, price: vip.length > 0 ? vip[0].price : 0 },
                    { type: 'Golden Circle', count: gold.length, price: gold.length > 0 ? gold[0].price : 0 }
                ]);
            } else {
                console.error("Lístky se nenačetly, API vrátilo status:", res.status);
            }
        } catch (err) {
            console.error("Chyba spojení při načítání lístků:", err);
        }
    };

    useEffect(() => {
        if (isEditMode) {
            fetch(`${API_BASE}/api/concerts/${id}`)
                .then(res => res.json())
                .then(data => {
                    setForm({
                        bands: data.bands || '',
                        venue: data.venue || '',
                        date: data.date ? new Date(data.date).toISOString().slice(0, 16) : '',
                        price: data.price || '',
                        description: data.description || '',
                        genres: data.genres || '',
                        sold_out: data.sold_out === true || data.sold_out === 1
                    });
                });

            fetchTickets();
        }
    }, [id, isEditMode]);

    const handleConcertSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const url = isEditMode ? `${API_BASE}/api/concerts/${id}` : `${API_BASE}/api/concerts`;
        const method = isEditMode ? 'PUT' : 'POST';

        const bodyData = {
            ...form,
            id: isEditMode ? parseInt(id!) : 0,
            sold_out: Boolean(form.sold_out)
        };

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(bodyData)
            });

            if (res.ok) {
                alert(isEditMode ? "Koncert upraven!" : "Koncert vytvořen!");
                if (!isEditMode) navigate('/');
            } else {
                alert("Chyba při ukládání koncertu.");
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleDeleteConcert = async () => {
        if (!window.confirm('Opravdu chceš smazat tento koncert? Smažou se i všechny lístky!')) return;

        try {
            const res = await fetch(`${API_BASE}/api/concerts/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.ok) {
                alert('Koncert byl smazán.');
                navigate('/');
            } else {
                alert('Chyba při mazání koncertu.');
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleBatchChange = (type: string, field: 'count' | 'price', value: number) => {
        setBatches(prev => prev.map(b => b.type === type ? { ...b, [field]: value } : b));
    };

    const handleSaveAllBatches = async () => {
        try {
            const promises = batches.map(batch =>
                fetch(`${API_BASE}/api/tickets/admin/concert/${id}/batch`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                    body: JSON.stringify({ type: batch.type, count: batch.count, price: batch.price })
                })
            );

            await Promise.all(promises);
            alert("Všechny lístky byly úspěšně uloženy!");
            fetchTickets();
        } catch (err) {
            console.error(err);
            alert("Chyba při hromadné aktualizaci lístků.");
        }
    };

    return (
        <div className="editor-page">

            {/* 1. ČÁST: NASTAVENÍ KONCERTU */}
            <div className="editor-card">
                <h2>{isEditMode ? 'Nastavení koncertu' : 'Nový Koncert'}</h2>

                <form className="editor-form" onSubmit={handleConcertSubmit}>
                    <div>
                        <label className="editor-label">Kdo hraje</label>
                        <input type="text" className="search-input" value={form.bands}
                            onChange={e => setForm({ ...form, bands: e.target.value })} required />
                    </div>
                    <div>
                        <label className="editor-label">Místo (Venue)</label>
                        <input type="text" className="search-input" value={form.venue}
                            onChange={e => setForm({ ...form, venue: e.target.value })} required />
                    </div>
                    <div className="editor-grid">
                        <div>
                            <label className="editor-label">Datum</label>
                            <input type="datetime-local" className="search-input" value={form.date}
                                onChange={e => setForm({ ...form, date: e.target.value })} required />
                        </div>
                        <div>
                            <label className="editor-label">Základní cena ($)</label>
                            <input type="text" className="search-input" value={form.price}
                                onChange={e => setForm({ ...form, price: e.target.value })} required />
                        </div>
                    </div>
                    <div className="editor-actions">
                        <button type="submit" className="buy-btn" style={{ flex: 1 }}>
                            {isEditMode ? 'Uložit nastavení koncertu' : 'Vytvořit koncert'}
                        </button>
                        {isEditMode && (
                            <button type="button" className="btn-delete-concert" onClick={handleDeleteConcert}>
                                Smazat koncert
                            </button>
                        )}
                    </div>
                </form>
            </div>

            {/* 2. ČÁST: SKLAD LÍSTKŮ */}
            {isEditMode && (
                <div className="editor-card">
                    <h3> Sklad volných lístků (Nezakoupené)</h3>

                    <table className="tickets-table">
                        <thead>
                            <tr>
                                <th>Typ lístku</th>
                                <th>Počet kusů</th>
                                <th>Cena za kus ($)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {batches.map(batch => (
                                <tr key={batch.type}>
                                    <td>{batch.type}</td>
                                    <td>
                                        <input
                                            type="number"
                                            min="0"
                                            value={batch.count}
                                            onChange={(e) => handleBatchChange(batch.type, 'count', parseInt(e.target.value) || 0)}
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type="number"
                                            min="0"
                                            value={batch.price}
                                            onChange={(e) => handleBatchChange(batch.type, 'price', parseFloat(e.target.value) || 0)}
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <button className="btn-save-batches" onClick={handleSaveAllBatches}>
                        Uložit všechny lístky
                    </button>
                </div>
            )}

            {/* 3. ČÁST: PRODANÉ LÍSTKY */}
            {isEditMode && soldTickets.length > 0 && (
                <div className="editor-card">
                    <h3 className="sold-heading">Již prodané lístky ({soldTickets.length} ks)</h3>
                    <p className="sold-info">Lístky, které si již zakoupili reální uživatelé.</p>
                </div>
            )}

        </div>
    );
}