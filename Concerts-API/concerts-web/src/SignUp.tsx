import React, { useState } from 'react';
import './SignUp.css';
import { Link, useNavigate } from "react-router-dom"; // Import useNavigate

const SignUp = () => {
    // STATE
    const [username, setUsername] = useState(''); // Username tu necháme
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(''); // State pro chyby

    const navigate = useNavigate();

    // FUNCTION
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            const response = await fetch("https://localhost:7231/api/users/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    username: username, // <--- POSÍLÁME USERNAME
                    email: email,
                    password: password
                }),
            });

            if (response.ok) {
                alert(`Welcome, ${username}! Please log in.`);
                navigate("/signin"); // Přesměrování na login
            } else {
                const data = await response.json();
                setError(data.message || data.Error || "Registration failed.");
            }
        } catch (err) {
            console.error(err);
            setError("Server connection failed.");
        }
    };

    return (
        <div className="auth-container">
            <h1 className="title">THE TICKET STAND</h1>

            <form onSubmit={handleSubmit} className="auth-form">

                {/* USERNAME INPUT */}
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
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />

                {/* ERROR MESSAGE */}
                {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}

                <button type="submit" className="submit-btn">
                    Sign up
                </button>
            </form>

            <span>
                Already have an account?
                <Link to="/signin">
                    <button className="signInBtn" style={{ marginLeft: '10px' }}>Sign In</button>
                </Link>
            </span>
        </div>
    );
};

export default SignUp;