import React, { useState } from 'react';
import '../SignIn.css';

const SignIn = () => {
    const [isRegister, setIsRegister] = useState(false);

    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (isRegister) {
            console.log("Register:", { username, email, password });
            alert(`Account created for ${username}`);
        } else {
            console.log("Login:", { username, password });
            alert(`Welcome back, ${username}`);
        }
    };

    return (
        <div className="auth-container">
            <h1 className="title">THE TICKET STAND</h1>
            <h2>{isRegister ? "Create account" : "Log in"}</h2>

            <form onSubmit={handleSubmit} className="auth-form">
                <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                />

                {isRegister && (
                    <input
                        type="email"
                        placeholder="E-mail"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                )}

                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />

                <button type="submit" className="submit-btn">
                    {isRegister ? "Sign up" : "Log in"}
                </button>
            </form>

            {/* Bottom switch */}
            <div className="auth-footer">
                {!isRegister ? (
                    <p>
                        Nemáš úèet?{" "}
                        <span
                            className="auth-link"
                            onClick={() => setIsRegister(true)}
                        >
                            Vytvoøit úèet
                        </span>
                    </p>
                ) : (
                    <p>
                        Už máš úèet?{" "}
                        <span className="auth-link" onClick={() => setIsRegister(false)}>
                            <button>Pøihlásit se</button>
                        </span>
                    </p>
                )}
            </div>
        </div>
    );
};

export default SignIn;
