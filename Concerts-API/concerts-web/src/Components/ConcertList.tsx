import React, { useEffect, useState } from 'react';

// Define the shape of your data (optional but good for TypeScript)
interface Concert {
    id: number;
    name: string;
    // add other properties your API returns
}

const ConcertList = () => {
    const [concerts, setConcerts] = useState<Concert[]>([]);

    useEffect(() => {
        // REPLACE with your actual API URL (check your API launch settings or browser)
        fetch('https://localhost:7000/api/concerts')
            .then(response => response.json())
            .then(data => setConcerts(data))
            .catch(error => console.error('Error fetching data:', error));
    }, []);

    return (
        <div>
            <h2>Concerts List</h2>
            <ul>
                {concerts.map(concert => (
                    <li key={concert.id}>{concert.name}</li>
                ))}
            </ul>
        </div>
    );
};

export default ConcertList;