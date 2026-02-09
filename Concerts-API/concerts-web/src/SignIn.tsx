import React, { useState } from 'react';
import './SignIn.css';
import { Link, useNavigate } from "react-router-dom";

//  nastav v .env:
// VITE_API_URL=https://localhost:5077
//  musí odpovídat URL tvého backend serveru
const API_BASE = import.meta.env.VITE_API_URL ?? 'https://localhost:7231';

const SignIn = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        //  Frontend validace pøed voláním backendu
        if (!email.trim()) {
            setError("Email is required");
            return;
        }

        if (!password.trim()) {
            setError("Password is required");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(`${API_BASE}/login`, {
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

                // Věci, které zkoušíš číst dole v kódu (přidej je sem):
                Token?: string;
                accessToken?: string;
                jwt?: string;
                username?: string;

                // Objekt user, který má v sobě username nebo name
                user?: {
                    username?: string;
                    name?: string;
                };
            }
            let data: LoginResponse | null = null;
            //let data: any = null;

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

            //  token mapování — backend mùže vracet rùznì
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

            //  uložení tokenu pro autorizaci dalších requestù
            localStorage.setItem("token", token);

            //  volitelnì uložení user info
            const username =
                data?.username ??
                data?.user?.username ??
                data?.user?.name ??
                email;

            localStorage.setItem("username", username);

            //  pøesmìrování po loginu
            navigate("/");
            //  "/" by mìla být chránìná routa
            // viz soubor:
            // src/components/RequireAuth.tsx
            //  komponenta která kontroluje token

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
