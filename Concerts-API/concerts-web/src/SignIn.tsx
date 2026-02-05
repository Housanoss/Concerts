import React, { useState } from 'react';
import './SignIn.css';
import { Link } from "react-router-dom";

const SignIn = () => {

    const [username] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

 
            console.log("Login:", { email, password });
            alert(`Welcome back, ${username}`);
        
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

                <button type="submit" className="submit-btn">"Log in" </button>
            </form>

            {/* Bottom switch */}

            <span>Don't have an account?
                <Link to="/signup">
                <button className="signUpBtn">Register</button>
                </Link>
            </span>



        </div>
    );
};

export default SignIn;
