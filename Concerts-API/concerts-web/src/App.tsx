import { useEffect, useState } from 'react';
import "./App.css";

// 1. Define the shape of your data. 
// This must match your C# Concert class properties exactly.
interface Concert {
    id: number;
    headliner: string;
    openers: string;
    bands: string;
    venue: string;
    date: string;
    type: string;
    genre: string;
    // bude potřeba dodělat na controlleru description: string;
}






interface ConcertTicketProps {
    concertId: number;
    concerts: Concert[];
} //slouží k tomu aby si fuknce ConcertTicket mohla najít koncert v poli podle zadaného id

function ConcertTicket({ concertId, concerts }: ConcertTicketProps) {
    const concert = concerts.find(c => c.id === concertId);

    if (!concert) {
        return <p>Concert with ID {concertId} not found.</p>;
    }

    return (
        <div className='ticketInfo'>
            <h3>{concert.headliner}</h3>
            <p>{concert.openers}</p>
            <p>{concert.venue}</p>
            <p>{new Date(concert.date).toLocaleDateString()}</p>
            <p>{concert.type}</p>
        </div>
    )
}

function ConcertInfo({ concertId, concerts }: ConcertTicketProps) {
    const concert = concerts.find(c => c.id === concertId);

    if (!concert) {
        return <p>Concert with ID {concertId} not found.</p>;
    }

    return (
        <div className='concertInfo'>
            <h3>{concert.headliner}</h3>
            <p>{concert.openers}</p>
            <p>{concert.venue}</p>
            <p>{new Date(concert.date).toLocaleDateString()}</p>
            <p>{concert.genre}</p>
        </div>
    )
}
export default function App() {
    // 2. State management: 'concerts' starts as an empty array []
    const [concerts, setConcerts] = useState<Concert[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    export interface Concert {
        id: number;
        venue: string;
        date: string;
        price: number;
        genres: string;
        description: string;
        sold_out: boolean;

        bands: string;
        headliner: string;
        openers: string;
    }





    return (
        <div className='page'>
            <div className='leftSpace'>
                <h1>The Ticket Stand</h1>
                <p>Current Shows Available:</p>
                <hr />
                <button className="filterBtn">Filter</button>
                <button className="orderbyBtn">Order by</button>

                {/* 6. Rendering the list */}
                {concerts.length === 0 ? (
                    <p>No concerts found. Check if your MySQL table has data!</p>
                ) : (
                    <div style={{ display: 'grid', gap: '20px', marginTop: '20px' }}>
                        {concerts.map((item) => (
                            <ConcertInfo
                                key={item.id}
                                concertId={item.id}
                                concerts={[item]} // pole jen s tímto koncertem
                            />
                        ))}

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
                                <h2 style={{ margin: '0' }}>{item.headliner}</h2>
                                <p style={{ color: '#555' }}>Openers: {item.bands}</p>
                                <p style={{ color: '#555' }}>Venue: {item.venue}</p>
                                <small>Date: {new Date(item.date).toLocaleDateString()}</small>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <div className='rightSpace'>
                <div className='topBtns'>
                    <button className='loginBtn'>Log In</button>
                    <button className='signupBtn'>Sign Up</button>
                </div>
                <ConcertTicket concertId={3} />
            </div>
        </div>
    );
}