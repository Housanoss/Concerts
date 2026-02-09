import React, { useState } from 'react';
import './SignUp.css'; // We will create this styling file next
import { Link } from "react-router-dom";

const SignUp = () => {
    // STATE: This holds the values the user types
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // FUNCTION: What happens when they click the button?
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault(); // Prevents the page from reloading
        console.log("Submitted:", { username, email, password });
        alert(`Welcome, ${username}!`);
    };

    return (
        <div className="auth-container">
            <h1 className="title">THE TICKET STAND</h1>

            {/* The Form */}
            <form onSubmit={handleSubmit} className="auth-form">
                <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />

                {/* Only show Email if we are signing up */}

                <input
                    type="email"
                    placeholder="E-mail"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />


                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                <button type="submit" className="submit-btn">
                    Sign up
                </button>
            </form>

            <span>
                Already have an account?
                <Link to="/signin">
                    <button className="signInBtn">Sign In</button>
                </Link>
            </span>

        </div>
    );
};

export default SignUp;