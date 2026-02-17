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

        // Validace
        if (!email.trim() || !password.trim()) {
            setError("Email and Password are required");
            return;
        }

        setLoading(true);
        const targetUrl = `${API_BASE}/api/users/login`;

        try {
            const response = await fetch(targetUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            // Bezpečné parsování odpovědi (pro případ, že backend vrátí chybu v textu)
            const rawText = await response.text();
            let data: any = {};
            try {
                data = JSON.parse(rawText);
            } catch {
                data = { message: rawText }; // Fallback pro ne-JSON odpovědi
            }

            if (!response.ok) {
                // Zobrazíme chybu z backendu nebo obecnou
                setError(data.error || data.message || `Login failed (${response.status})`);
                setLoading(false);
                return;
            }

            // --- ÚSPĚŠNÉ PŘIHLÁŠENÍ ---

            // 1. Token (backend ho může poslat jako 'token' nebo 'Token')
            const token = data.token || data.Token;
            if (!token) {
                setError("Login successful but no token received.");
                setLoading(false);
                return;
            }
            localStorage.setItem("token", token);

            // 2. Username
            const username = data.username || data.Username || "User";
            localStorage.setItem("username", username);

            // 3. Email
            const userEmail = data.email || data.Email || email;
            localStorage.setItem("email", userEmail);

            // 👇 4. ROLE (KLÍČOVÁ ČÁST PRO ADMINA) 👇
            // Backend posílá 'role' nebo 'Role'. Uložíme to.
            // Pokud role nepřijde, uložíme "User".
            const role = data.role || data.Role || "User";
            localStorage.setItem("role", role);

            console.log("✅ Login Success!");
            console.log("👤 User:", username);
            console.log("🔑 Role:", role);

            // 5. Přesměrování a Refresh
            // Refresh je nutný, aby si App.tsx znovu načetla localStorage a ukázala tlačítka
            navigate("/");
            window.location.reload();

        } catch (err) {
            console.error("Login Error:", err);
            setError("Failed to connect to the server.");
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

                {error && <p className="error" style={{ color: 'red', fontWeight: 'bold' }}>{error}</p>}

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