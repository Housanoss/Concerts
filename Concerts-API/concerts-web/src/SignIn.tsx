import React, { useState } from 'react';
import './SignIn.css';
import { Link, useNavigate } from "react-router-dom";

// Pokud používáte Vite, nastavte VITE_API_URL v .env (viz níže).
const API_BASE = import.meta.env.VITE_API_URL ?? 'https://localhost:5077';

const SignIn = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);

    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        try {
            const response = await fetch(`${API_BASE}/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password }),
            });

            const raw = await response.text();
            let data: any = null;
            try {
                data = raw ? JSON.parse(raw) : null;
            } catch {
                data = null;
            }

            console.log("LOGIN status:", response.status);
            console.log("LOGIN raw body:", raw);

            if (!response.ok) {
                // backend vrací { Error = "..." } pro 400
                const msg = data?.Error || data?.error || `Login failed (${response.status})`;
                setError(msg);
                alert(msg);
                return;
            }

            // backend v souèasné implementaci vrací { Token = token }
            const token = data?.Token || data?.token || data?.accessToken;
            if (!token) {
                setError("Login OK, but token missing in response (check backend response key).");
                console.log("Parsed data:", data);
                return;
            }

            // uložíme token pod klíèem "token" — zbytek aplikace oèekává tento klíè
            localStorage.setItem("token", token);

            const username =
                data?.username ??
                data?.user?.username ??
                data?.user?.name ??
                email;

            alert(`welcome ${username}`);
            navigate("/");
        } catch (err: unknown) {
            console.error("LOGIN network/cors error:", err);
            setError("Network/CORS error (check backend URL, CORS settings, server running).");
            alert("Network/CORS error (see console)");
        }
    };


    return (
        <div className="auth-container">
            <h1 className="title">THE TICKET STAND</h1>

            <form onSubmit={handleSubmit} className="auth-form">
                <input
                    type="email"
                    placeholder="E-mail"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />

                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />

                {error && <p className="error">{error}</p>}

                <button type="submit" className="submit-btn">
                    Log in
                </button>
            </form>

            <span>
                Don't have an account?
                <Link to="/signup">
                    <button className="signUpBtn">Register</button>
                </Link>
            </span>
        </div>
    );
};

export default SignIn;