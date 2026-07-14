import { useState, type FormEvent} from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom'
import {Logo} from '../components/Logo'
import Footer from '../components/Footer';

function LoginPage() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setErrorMessage('');
        setIsLoading(true);


        try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });
    const data = await response.json();
    
    if (response.ok) {
        navigate('/dashboard');
    } else {
        setErrorMessage(data.message);
    }
} catch (err) {
    console.error(err);
    setErrorMessage('Something went wrong. Please try again.');
} finally {
    setIsLoading(false);
}

       
    };

    return (
        <div className="min-h-screen flex flex-col items-center p-6">


            {/* Top: Logo */}
            <Logo />

            {/* Middle: Card + Sign up link */}
            <div className="flex-1 flex flex-col justify-center items-center w-full gap-6 py-12">

                {/* Card */}
                <div className="bg-card border border-border rounded-2xl p-8 w-full max-w-md shadow-sm">

                    {/* Heading */}
                    <div className="text-center mb-8">
                        <h1 className="text-4xl font-display text-foreground mb-2">Welcome back</h1>
                        <p className="text-muted-foreground">Pick up right where you left off.</p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleLogin}>
                        {/* Email */}
                        <div className="mb-6">
                            <label htmlFor="email" className="text-sm font-medium mb-2 block">EMAIL</label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                placeholder="Enter your email"
                                className="w-full bg-input border border-border rounded-2xl px-4 py-3 focus:outline-none focus:border-primary transition"
                                onChange={e => setEmail(e.target.value)}
                            />
                        </div>

                        {/* Password */}
                        <div className="mb-6">
                            <div className="flex flex-row justify-between items-center mb-2">
                                <label htmlFor="password" className="text-sm font-medium">PASSWORD</label>
                                <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition">
                                    Forgot password?
                                </a>
                            </div>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                placeholder="Enter your password"
                                className="w-full bg-input border border-border rounded-2xl px-4 py-3 focus:outline-none focus:border-primary transition"
                                onChange={e => setPassword(e.target.value)}
                            />
                        </div>

                        {/* Error message */}
                        {errorMessage && (<p className="text-destructive text-sm mb-4">{errorMessage}</p>)}
                        {/* Log in button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-gradient-to-r from-primary to-primary-light text-primary-foreground py-3 rounded-2xl font-medium hover:opacity-90 transition disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Logging in...' : 'Log in →'}
                        </button>
                    </form>

                </div>

                {/* register link */}
                <p className="text-muted-foreground">
                    Don't have an account?{' '}
                    <Link to="/register" className="font-semibold text-foreground hover:text-primary transition">
                        Sign up
                    </Link>
                </p>

            </div>

               <Footer />

        </div>
    );
}

export default LoginPage;