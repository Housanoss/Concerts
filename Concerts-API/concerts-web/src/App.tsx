import { useEffect, useState } from 'react';
import "./App.css";
import { Link } from "react-router-dom";

interface Concert {
    id: number;
    headliner: string;
    bands: string;
    venue: string;
    date: string;
    price: string;
    openers: string;
}

interface ConcertTicketProps {
    concertId: number;
    concerts: Concert[];
}

interface Ticket{
    ticketId: number;
    userId: number;
    concertId: number;
    venue: string;
    date: string;
    price: number;
    description: string;
    soldOut: boolean;
    headliner: string;
    openers: string;
}

function ConcertTicket({ concertId, concerts }: ConcertTicketProps) {
    const concert = concerts.find(c => c.id === concertId);

    if (!concert) return <p>Concert with ID {concertId} not found.</p>;

    return (
        <div>
            <h5>{concert.headliner}</h5>
            <p>{concert.openers}</p>
            <p>{concert.date}</p>
            <p>{concert.venue}</p>
        </div>
    );
}

function ConcertInfo({ concertId, concerts }: ConcertTicketProps) {
    const concert = concerts.find(c => c.id === concertId);

    if (!concert) return <p>Concert with ID {concertId} not found.</p>;

    return (
        <div className="concert">
            <h2 style={{ margin: 0 }}>{concert.headliner}</h2>
            <p style={{ color: '#555' }}>Openers: {concert.openers}</p>
            <small style={{ color: '#555' }}>Date: {new Date(concert.date).toLocaleDateString()}</small>
            <p style={{ color: '#555' }}>Venue: {concert.venue}</p>
            <p style={{ color: '#555' }}>Price range: {concert.price}</p>
        </div>
    );
}

export default function App() {
    const [concerts, setConcerts] = useState<Concert[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const API_URL = 'https://localhost:7231/api/concerts';

        fetch(API_URL)
            .then((res) => {
                if (!res.ok) throw new Error("API not responding");
                return res.json();
            })
            .then((data: Concert[]) => {
                setConcerts(data);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Connection failed:", err);
                setLoading(false);
            });
    }, []);

    if (loading) return <div style={{ padding: '20px' }}>Connecting to API...</div>;

    return (
        <div className='page'>
            <div style={{ padding: '40px', fontFamily: 'Arial, sans-serif' }}>
                <h1>The Ticket Stand</h1>
                <hr />
                <p>Current Shows Available:</p>
                <button className="filterBtn">Filter</button>
                <button className="orderbyBtn">Order by</button>

                {concerts.length === 0 ? (
                    <p>No concerts found. Check if your MySQL table has data!</p>
                ) : (
                    <div style={{ display: 'grid', gap: '20px', marginTop: '20px' }}>
                        {concerts.map((item) => (
                            <ConcertInfo
                                key={item.id}
                                concertId={item.id}
                                concerts={concerts}
                            />
                        ))}
                    </div>
                )}
            </div>

            <div className='rightSpace'>
                <div className='topBtns'>
                    <Link to="/signin">
                        <button className="signInBtn">Sign In</button>
                    </Link>
                    <Link to="/signup">
                        <button className="signUpBtn">Sign Up</button>
                    </Link>
                </div>

                {/* Tohle může zůstat, pokud chceš třeba "vybraný" koncert */}
                <ConcertTicket concertId={3} concerts={concerts} />

                {/* Tohle už není potřeba, protože se renderuje nahoře pro všechny */}
                {/* <ConcertInfo concertId={2} concerts={concerts} /> */}
            </div>
        </div>
    );
}
