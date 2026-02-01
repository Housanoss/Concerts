import { useEffect, useState } from 'react';
import "./App.css"; 

// 1. Define the shape of your data. 
// This must match your C# Concert class properties exactly.
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

export interface Ticket {
    id: number;
    concertId: number; 
    userId: number;     
    price: number;
    description: string;
    concert?: Concert; //connection to concert to know name
}





  
