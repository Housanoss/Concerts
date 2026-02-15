import React, { useState } from 'react';
import './SignIn.css';
import { Link, useNavigate } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_URL;

const SignIn = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        //  Frontend validace před voláním backendu
        if (!email.trim()) {
            setError("Email is required");
            return;
        }

        if (!password.trim()) {
            setError("Password is required");
            return;
        }

        setLoading(true);
        const targetUrl = `${API_BASE}/api/users/login`;

        console.log("API_BASE:", API_BASE);
        console.log("Target URL:", targetUrl);

        try {
            const response = await fetch(targetUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email,
                    password
                }),
            });

            const raw = await response.text();

            interface LoginResponse {
                // Základní věci
                token?: string;
                error?: string;
                Error?: string;
                message?: string;

                // Token varianty
                Token?: string;
                accessToken?: string;
                jwt?: string;

                // Username a email
                username?: string;
                email?: string;

                // Objekt user, který má v sobě username nebo name
                user?: {
                    username?: string;
                    name?: string;
                    email?: string;
                };
            }
            let data: LoginResponse | null = null;

            try {
                data = raw ? JSON.parse(raw) : null;
            } catch {
                data = null;
            }

            console.log("LOGIN status:", response.status);
            console.log("LOGIN raw body:", raw);

            if (!response.ok) {
                const msg =
                    data?.Error ||
                    data?.error ||
                    data?.message ||
                    `Login failed (${response.status})`;

                setError(msg);
                return;
            }

            //  token mapování — backend může vracet různě
            const token =
                data?.Token ||
                data?.token ||
                data?.accessToken ||
                data?.jwt;

            if (!token) {
                setError("Login OK but token missing in response.");
                console.log("Parsed data:", data);
                return;
            }

            //  uložení tokenu pro autorizaci dalších requestů
            localStorage.setItem("token", token);

            //  uložení username (skutečné jméno uživatele)
            const username =
                data?.username ??
                data?.user?.username ??
                data?.user?.name ??
                "User"; // fallback pokud backend nepošle username

            localStorage.setItem("username", username);

            //  uložení emailu zvlášť
            const userEmail =
                data?.email ??
                data?.user?.email ??
                email;

            localStorage.setItem("email", userEmail);

            console.log("Stored username:", username);
            console.log("Stored email:", userEmail);

            //  přesměrování po loginu
            navigate("/");

        } catch (err) {
            console.error("LOGIN error:", err);
            setError("Network / CORS error — check backend & URL.");
        } finally {
            setLoading(false);
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

                <button
                    type="submit"
                    className="submit-btn"
                    disabled={loading}
                >
                    {loading ? "Logging in..." : "Log in"}
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