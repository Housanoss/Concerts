import React, { useEffect, useState } from "react";
import "./SignUp.css";
import { useNavigate } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_URL;

type UserDto = {
    id?: number;
    username?: string;
    email?: string;
    role?: string;
};

type ApiErrorResponse = {
    error?: string;
    Error?: string;
    message?: string;
};

type UpdateUserPayload = {
    username?: string;
    email?: string;
    password?: string;
};

const EditUser = () => {
    const navigate = useNavigate();
    const [username, setUsername] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const [saving, setSaving] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

    useEffect(() => {
        if (!token) {
            navigate("/signin");
            return;
        }

        const ac = new AbortController();
        const load = async () => {
            setLoading(true);
            setError(null);

            const url = `${API_BASE}/api/users/me`;
            console.log("Fetching user from:", url);
            console.log("Token:", token);

            try {
                const res = await fetch(url, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    signal: ac.signal,
                });

                console.log("Response status:", res.status);

                const raw = await res.text();
                console.log("Response body:", raw);

                let data: (UserDto & ApiErrorResponse) | null = null;
                try {
                    data = raw ? JSON.parse(raw) : null;
                } catch (parseErr) {
                    console.error("JSON parse error:", parseErr);
                    data = null;
                }

                if (!res.ok) {
                    const errorMsg = data?.error || data?.Error || `Failed to load user (${res.status})`;
                    console.error("API error:", errorMsg);
                    setError(errorMsg);

                    if (res.status === 401 || res.status === 403) {
                        localStorage.removeItem("token");
                        localStorage.removeItem("username");
                        localStorage.removeItem("email");
                        navigate("/signin");
                    }
                    return;
                }

                console.log("User data loaded:", data);
                setUsername(data?.username ?? "");
                setEmail(data?.email ?? "");
            } catch (err) {
                if (err instanceof Error && err.name !== "AbortError") {
                    console.error("Load user error:", err);
                    console.error("Error details:", err.message);
                    setError(`Network error: ${err.message}`);
                }
            } finally {
                setLoading(false);
            }
        };

        load();
        return () => ac.abort();
    }, [token, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        if (!token) {
            navigate("/signin");
            return;
        }

        if (!username.trim() || !email.trim()) {
            setError("Username a e-mail jsou povinné.");
            return;
        }

        setSaving(true);

        try {
            const payload: UpdateUserPayload = {};

            if (username.trim()) {
                payload.username = username.trim();
            }
            if (email.trim()) {
                payload.email = email.trim();
            }
            if (password.trim()) {
                payload.password = password;
            }

            console.log("Updating user with payload:", payload);

            const res = await fetch(`${API_BASE}/api/users/me`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            console.log("Update response status:", res.status);

            const raw = await res.text();
            console.log("Update response body:", raw);

            let data: ApiErrorResponse | null = null;
            try {
                data = raw ? JSON.parse(raw) : null;
            } catch {
                data = null;
            }

            if (!res.ok) {
                const msg = data?.Error || data?.error || data?.message || `Update failed (${res.status})`;
                setError(msg);
                if (res.status === 401 || res.status === 403) {
                    localStorage.removeItem("token");
                    localStorage.removeItem("username");
                    localStorage.removeItem("email");
                    navigate("/signin");
                }
                return;
            }

            setSuccess("Údaje úspìšnì uloženy.");

            if (username) localStorage.setItem("username", username);
            if (email) localStorage.setItem("email", email);

            setPassword("");
        } catch (err) {
            console.error("Update user error:", err);
            if (err instanceof Error) {
                setError(`Network error: ${err.message}`);
            }
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="auth-container"><h1 className="title">Loading...</h1></div>;
    }

    return (
        <div className="auth-container">
            <h1 className="title">Edit profile</h1>

            <form onSubmit={handleSubmit} className="auth-form">
                <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                />

                <input
                    type="email"
                    placeholder="E-mail"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />

                <input
                    type="password"
                    placeholder="New password (leave empty to keep current)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                {error && <p className="error">{error}</p>}
                {success && <p style={{ color: "green" }}>{success}</p>}

                <button type="submit" className="submit-btn" disabled={saving}>
                    {saving ? "Saving..." : "Save changes"}
                </button>
            </form>
        </div>
    );
};

export default EditUser;