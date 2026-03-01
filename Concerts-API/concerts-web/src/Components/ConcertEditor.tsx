import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './Concert.css';

const API_BASE = import.meta.env.VITE_API_URL;

export default function ConcertEditor() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditMode = !!id;

    const [form, setForm] = useState({
        bands: '',
        venue: '',
        date: '',
        price: '',
        description: '',
        genres: '',
        sold_out: false
    });

    useEffect(() => {
        if (isEditMode) {
            fetch(`${API_BASE}/api/concerts/${id}`)
                .then(res => res.json())
                .then(data => {
                    const dateStr = data.date ? new Date(data.date).toISOString().slice(0, 16) : '';
                    setForm({
                        bands: data.bands || '',
                        venue: data.venue || '',
                        date: dateStr,
                        price: data.price || '',
                        description: data.description || '',
                        genres: data.genres || '',
                        sold_out: data.sold_out === true || data.sold_out === 1
                    });
                });
        }
    }, [id, isEditMode]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const token = localStorage.getItem("token");

        const url = isEditMode
            ? `${API_BASE}/api/concerts/${id}`
            : `${API_BASE}/api/concerts`;

        const method = isEditMode ? 'PUT' : 'POST';

        const bodyData = {
            id: isEditMode ? parseInt(id!) : 0,
            bands: form.bands,
            venue: form.venue,
            date: form.date,
            price: form.price,
            description: form.description,
            genres: form.genres,
            sold_out: form.sold_out
        };

        try {
            const res = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(bodyData)
            });

            if (res.ok) {
                alert(isEditMode ? "Koncert upraven!" : "Koncert vytvořen!");
                navigate('/');
            } else {
                const errText = await res.text();
                console.error("Chyba:", errText);
                alert("Chyba při ukládání: " + errText);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm("Opravdu chceš smazat tento koncert?")) return;
        const token = localStorage.getItem("token");

        try {
            const res = await fetch(`${API_BASE}/api/concerts/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.ok) {
                alert("Koncert smazán!");
                navigate('/');
            } else {
                alert("Chyba při mazání.");
            }
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="concert-page" style={{ display: 'flex', justifyContent: 'center', padding: '50px' }}>
            <div style={{ background: '#1e1e1e', padding: '40px', borderRadius: '12px', width: '100%', maxWidth: '600px', border: '1px solid #333' }}>
                <h2 style={{ color: '#ffa500', marginBottom: '20px' }}>
                    {isEditMode ? '✏️ Upravit Koncert' : '➕ Nový Koncert'}
                </h2>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>

                    <div>
                        <label style={{ display: 'block', color: '#888', marginBottom: '5px' }}>Bands (Headliner first)</label>
                        <input
                            type="text"
                            className="search-input"
                            value={form.bands}
                            onChange={e => setForm({ ...form, bands: e.target.value })}
                            placeholder="Metallica, Gojira..."
                            required
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', color: '#888', marginBottom: '5px' }}>Venue</label>
                        <input
                            type="text"
                            className="search-input"
                            value={form.venue}
                            onChange={e => setForm({ ...form, venue: e.target.value })}
                            placeholder="O2 Arena, Prague"
                            required
                        />
                    </div>

                    <div className="editor-grid">
                        <div>
                            <label style={{ display: 'block', color: '#888', marginBottom: '5px' }}>Date</label>
                            <input
                                type="datetime-local"
                                className="search-input"
                                value={form.date}
                                onChange={e => setForm({ ...form, date: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', color: '#888', marginBottom: '5px' }}>Price range ($)</label>
                            <input
                                type="text"
                                className="search-input"
                                value={form.price}
                                onChange={e => setForm({ ...form, price: e.target.value })}
                                placeholder="80 - 200"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', color: '#888', marginBottom: '5px' }}>Genres</label>
                        <input
                            type="text"
                            className="search-input"
                            value={form.genres}
                            onChange={e => setForm({ ...form, genres: e.target.value })}
                            placeholder="Metal, Rock"
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', color: '#888', marginBottom: '5px' }}>Description</label>
                        <textarea
                            className="search-input"
                            style={{ minHeight: '100px', borderRadius: '12px' }}
                            value={form.description}
                            onChange={e => setForm({ ...form, description: e.target.value })}
                        />
                    </div>

                    {isEditMode && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <input
                                type="checkbox"
                                checked={form.sold_out}
                                onChange={e => setForm({ ...form, sold_out: e.target.checked })}
                                style={{ width: '20px', height: '20px' }}
                            />
                            <label style={{ color: 'white' }}>Sold Out?</label>
                        </div>
                    )}

                    <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                        <button type="button" onClick={() => navigate('/')} className="btn-secondary">Zrušit</button>
                        {isEditMode && (
                            <button type="button" onClick={handleDelete} style={{
                                background: '#ff4444',
                                color: 'white',
                                border: 'none',
                                padding: '10px 20px',
                                borderRadius: '8px',
                                fontWeight: 'bold',
                                cursor: 'pointer'
                            }}>
                                🗑️ Smazat
                            </button>
                        )}
                        <button type="submit" className="buy-btn" style={{ flex: 1 }}>
                            {isEditMode ? 'Uložit změny' : 'Vytvořit koncert'}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}