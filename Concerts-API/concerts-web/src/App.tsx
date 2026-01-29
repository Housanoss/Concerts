import { useEffect, useState } from 'react';

// 1. Define the shape of your data. 
// This must match your C# Concert class properties exactly.
interface Concert {
    id: number;
    headLiner: string;
    bands: string;
    venue: string;
    date: string;
}

export default function App() {
    // 2. State management: 'concerts' starts as an empty array []
    const [concerts, setConcerts] = useState<Concert[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        // 3. FETCH DATA: Change '7001' to the port you see in your browser when C# starts!
        const API_URL = 'https://localhost:7231/api/concerts';

        fetch(API_URL)
            .then((res) => {
                if (!res.ok) throw new Error("API not responding");
                return res.json();
            })
            .then((data: Concert[]) => {
                // 4. Save the data into our state
                setConcerts(data);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Connection failed:", err);
                setLoading(false);
            });
    }, []);

    // 5. Visual Feedback: Show a message while waiting for the API
    if (loading) return <div style={{ padding: '20px' }}>Connecting to API...</div>;

    return (
        <div style={{ padding: '40px', fontFamily: 'Arial, sans-serif' }}>
            <h1>TicketMaster Clone</h1>
            <p>Current Shows Available:</p>
            <hr />
            <button className = "filterBtn">Filter</button>
            <button className = "orderbyBtn">Order by</button>

            {/* 6. Rendering the list */}
            {concerts.length === 0 ? (
                <p>No concerts found. Check if your MySQL table has data!</p>
            ) : (
                <div style={{ display: 'grid', gap: '20px', marginTop: '20px' }}>
                    {concerts.map((item) => (
                        <div
                            key={item.id}
                            style={{
                                padding: '20px',
                                border: '1px solid #ddd',
                                borderRadius: '12px',
                                boxShadow: '2px 2px 10px rgba(0,0,0,0.05)'
                            }}
                        >
                            <h2 style={{ margin: '0' }}>{item.headLiner}</h2>
                            <p style={{ color: '#555' }}>Openers: {item.bands}</p>
                            <p style={{ color: '#555' }}>Venue: {item.venue}</p>
                            <small>Date: {new Date(item.date).toLocaleDateString()}</small>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}