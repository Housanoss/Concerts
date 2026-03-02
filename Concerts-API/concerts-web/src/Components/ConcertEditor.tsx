import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './Concert.css';

const API_BASE = import.meta.env.VITE_API_URL;

interface AdminTicket {
    ticketId: number;
    userId?: number;   // 👈 Přidáno kvůli mapování z C#
    UserId?: number;   // 👈 Přidáno kvůli mapování z C#
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

    // --- STAV PRO KONCERT ---
    const [form, setForm] = useState({
        bands: '',
        venue: '',
        date: '',
        price: '',
        description: '',
        genres: '',
        sold_out: false
    });

    // --- STAV PRO HROMADNOU SPRÁVU NEZAKOUPENÝCH LÍSTKŮ (ID = 1) ---
    const [batches, setBatches] = useState<TicketBatch[]>([
        { type: 'Standard', count: 0, price: 0 },
        { type: 'VIP', count: 0, price: 0 },
        { type: 'Golden Circle', count: 0, price: 0 }
    ]);

    // --- STAV PRO ZAKOUPENÉ LÍSTKY (ID !== 1) ---
    const [soldTickets, setSoldTickets] = useState<AdminTicket[]>([]);

    const fetchTickets = async () => {
        try {
            // 👇 ZMĚNA 1: Odstraněno slovo "admin" z URL, aby to sedělo na C# backend
            const res = await fetch(`${API_BASE}/api/tickets/concert/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.ok) {
                const data: AdminTicket[] = await res.json();
                console.log("Načtené lístky z DB:", data); // Pro kontrolu (F12)

                // Zjistíme, jestli je lístek volný (ID = 1)
                const isUnsold = (t: any) => t.userId === 1 || t.UserId === 1 || t.ownerId === 1;

                // Vyfiltrujeme zakoupené
                setSoldTickets(data.filter(t => !isUnsold(t)));

                // Vyfiltrujeme nezakoupené a spočítáme je
                const unsold = data.filter(t => isUnsold(t));

                // 👇 ZMĚNA 2: Převedeno na malá písmena pro spolehlivé porovnání
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
                        sold_out: data.sold_out === 1
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
            sold_out: form.sold_out ? 1 : 0
        };

        try {
            const res = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
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

    const handleBatchChange = (type: string, field: 'count' | 'price', value: number) => {
        setBatches(prev => prev.map(b => b.type === type ? { ...b, [field]: value } : b));
    };

    // Nová funkce pro hromadné uložení všech typů lístků najednou
    const handleSaveAllBatches = async () => {
        try {
            const promises = batches.map(batch =>
                fetch(`${API_BASE}/api/tickets/admin/concert/${id}/batch`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                    body: JSON.stringify({
                        type: batch.type,
                        count: batch.count,
                        price: batch.price
                    })
                })
            );

            await Promise.all(promises);
            alert("Všechny lístky byly úspěšně uloženy!");
            fetchTickets(); // Aktualizace UI
        } catch (err) {
            console.error(err);
            alert("Chyba při hromadné aktualizaci lístků.");
        }
    };

    return (
        <div className="concert-page" style={{ padding: '50px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

            {/* 1. ČÁST: NASTAVENÍ KONCERTU */}
            <div style={{ background: '#1e1e1e', padding: '40px', borderRadius: '12px', width: '100%', maxWidth: '800px', border: '1px solid #333', marginBottom: '40px' }}>
                <h2 style={{ color: '#ffa500', marginBottom: '20px' }}>
                    {isEditMode ? '✏️ Nastavení koncertu' : '➕ Nový Koncert'}
                </h2>

                <form onSubmit={handleConcertSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <div>
                        <label style={{ display: 'block', color: '#888', marginBottom: '5px' }}>Kdo hraje</label>
                        <input type="text" className="search-input" value={form.bands} onChange={e => setForm({ ...form, bands: e.target.value })} required />
                    </div>
                    <div>
                        <label style={{ display: 'block', color: '#888', marginBottom: '5px' }}>Místo (Venue)</label>
                        <input type="text" className="search-input" value={form.venue} onChange={e => setForm({ ...form, venue: e.target.value })} required />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                        <div>
                            <label style={{ display: 'block', color: '#888', marginBottom: '5px' }}>Datum</label>
                            <input type="datetime-local" className="search-input" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} required />
                        </div>
                        <div>
                            <label style={{ display: 'block', color: '#888', marginBottom: '5px' }}>Základní cena ($)</label>
                            <input type="number" className="search-input" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} required />
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                        <button type="submit" className="buy-btn" style={{ flex: 1 }}>{isEditMode ? 'Uložit nastavení koncertu' : 'Vytvořit koncert'}</button>
                    </div>
                </form>
            </div>

            {/* 2. ČÁST: SPRÁVA NEZAKOUPENÝCH LÍSTKŮ (Sklad) */}
            {isEditMode && (
                <div style={{ background: '#1e1e1e', padding: '40px', borderRadius: '12px', width: '100%', maxWidth: '800px', border: '1px solid #333', marginBottom: '40px' }}>
                    <h3 style={{ color: '#ffa500', marginBottom: '20px', borderBottom: '1px solid #444', paddingBottom: '10px' }}>
                        📦 Sklad volných lístků (Nezakoupené)
                    </h3>

                    <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px', background: '#222' }}>
                        <thead>
                            <tr style={{ background: '#333', textAlign: 'left', color: 'white' }}>
                                <th style={{ padding: '15px' }}>Typ lístku</th>
                                <th style={{ padding: '15px' }}>Počet kusů</th>
                                <th style={{ padding: '15px' }}>Cena za kus ($)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {batches.map(batch => (
                                <tr key={batch.type} style={{ borderBottom: '1px solid #444', color: '#ccc' }}>
                                    <td style={{ padding: '15px', fontWeight: 'bold', color: '#fff' }}>{batch.type}</td>
                                    <td style={{ padding: '15px' }}>
                                        <input
                                            type="number"
                                            min="0"
                                            value={batch.count}
                                            onChange={(e) => handleBatchChange(batch.type, 'count', parseInt(e.target.value) || 0)}
                                            style={{ width: '100%', padding: '8px', borderRadius: '5px', background: '#333', color: 'white', border: '1px solid #555' }}
                                        />
                                    </td>
                                    <td style={{ padding: '15px' }}>
                                        <input
                                            type="number"
                                            min="0"
                                            value={batch.price}
                                            onChange={(e) => handleBatchChange(batch.type, 'price', parseFloat(e.target.value) || 0)}
                                            style={{ width: '100%', padding: '8px', borderRadius: '5px', background: '#333', color: 'white', border: '1px solid #555' }}
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* JEDNOTNÉ TLAČÍTKO PRO ULOŽENÍ */}
                    <button
                        onClick={handleSaveAllBatches}
                        style={{ width: '100%', marginTop: '20px', background: '#ffa500', color: 'black', padding: '12px 15px', borderRadius: '5px', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '1.1rem' }}>
                        💾 Uložit všechny lístky
                    </button>
                </div>
            )}

            {/* 3. ČÁST: ZAKOUPENÉ LÍSTKY */}
            {isEditMode && soldTickets.length > 0 && (
                <div style={{ background: '#1e1e1e', padding: '40px', borderRadius: '12px', width: '100%', maxWidth: '800px', border: '1px solid #333' }}>
                    <h3 style={{ color: '#aaa', marginBottom: '20px', borderBottom: '1px solid #444', paddingBottom: '10px' }}>
                        👤 Již prodané lístky ({soldTickets.length} ks)
                    </h3>
                    <p style={{ color: '#888' }}>Lístky, které si již zakoupili reální uživatelé.</p>
                </div>
            )}

        </div>
    );
}