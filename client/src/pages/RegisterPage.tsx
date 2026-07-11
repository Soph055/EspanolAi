import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';

function RegisterPage() {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Password requirements - derived from the password state, recalculated every render
    const has8Chars = password.length >= 8;
    const hasUppercase = /[A-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*]/.test(password);

    const handleRegister = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setErrorMessage('');
        setSuccessMessage('');
        setIsLoading(true);

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/register`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    firstName: firstName.trim(),
                    lastName: lastName.trim(),
                    email: email.trim(),
                    password,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setSuccessMessage('Check your email to verify your account.');
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
            <div className="flex items-center gap-3 pt-12">
                <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                    <span className="font-display text-primary-foreground text-xl leading-none">ñ</span>
                </div>
                <span className="font-display text-2xl font-semibold">
                    Español<span className="text-primary">AI</span>
                </span>
            </div>

            {/* Middle: Card + Log in link (grows to fill space) */}
            <div className="flex-1 flex flex-col justify-center items-center w-full gap-6 py-12">

                {/* Card */}
                <div className="bg-card border border-border rounded-2xl p-8 w-full max-w-md shadow-sm">

                    {/* Heading */}
                    <div className="text-center mb-8">
                        <h1 className="text-4xl font-display text-foreground mb-2">Create your account</h1>
                        <p className="text-muted-foreground">Empieza gratis. No credit card required.</p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleRegister}>

                        {/* First + Last name row */}
                        <div className="flex gap-4 mb-6">
                            <div className="flex-1">
                                <label htmlFor="firstName" className="text-sm font-medium mb-2 block">FIRST NAME</label>
                                <input
                                    id="firstName"
                                    type="text"
                                    autoComplete="given-name"
                                    value={firstName}
                                    placeholder="Enter your first name"
                                    className="w-full bg-input border border-border rounded-lg px-4 py-3 focus:outline-none focus:border-primary transition"
                                    onChange={e => setFirstName(e.target.value)}
                                />
                            </div>
                            <div className="flex-1">
                                <label htmlFor="lastName" className="text-sm font-medium mb-2 block">LAST NAME</label>
                                <input
                                    id="lastName"
                                    type="text"
                                    autoComplete="family-name"
                                    value={lastName}
                                    placeholder="Enter your last name"
                                    className="w-full bg-input border border-border rounded-lg px-4 py-3 focus:outline-none focus:border-primary transition"
                                    onChange={e => setLastName(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div className="mb-6">
                            <label htmlFor="email" className="text-sm font-medium mb-2 block">EMAIL</label>
                            <input
                                id="email"
                                type="email"
                                autoComplete="email"
                                value={email}
                                placeholder="Enter your email"
                                className="w-full bg-input border border-border rounded-lg px-4 py-3 focus:outline-none focus:border-primary transition"
                                onChange={e => setEmail(e.target.value)}
                            />
                        </div>

                        {/* Password */}
                        <div className="mb-6">
                            <label htmlFor="password" className="text-sm font-medium mb-2 block">PASSWORD</label>
                            <input
                                id="password"
                                type="password"
                                autoComplete="new-password"
                                value={password}
                                placeholder="Enter your password"
                                className="w-full bg-input border border-border rounded-lg px-4 py-3 focus:outline-none focus:border-primary transition"
                                onChange={e => setPassword(e.target.value)}
                            />
                        </div>

                        {/* Password requirements checklist */}
                        <div className="grid grid-cols-2 gap-2 mb-6 text-sm">
                            <div className={`flex items-center gap-2 ${has8Chars ? 'text-primary' : 'text-muted-foreground'}`}>
                                <span>{has8Chars ? '✓' : '×'}</span>
                                <span>At least 8 characters</span>
                            </div>
                            <div className={`flex items-center gap-2 ${hasUppercase ? 'text-primary' : 'text-muted-foreground'}`}>
                                <span>{hasUppercase ? '✓' : '×'}</span>
                                <span>One uppercase letter</span>
                            </div>
                            <div className={`flex items-center gap-2 ${hasNumber ? 'text-primary' : 'text-muted-foreground'}`}>
                                <span>{hasNumber ? '✓' : '×'}</span>
                                <span>One number</span>
                            </div>
                            <div className={`flex items-center gap-2 ${hasSpecial ? 'text-primary' : 'text-muted-foreground'}`}>
                                <span>{hasSpecial ? '✓' : '×'}</span>
                                <span>One special character</span>
                            </div>
                        </div>

                        {/* Error / success messages */}
                        {errorMessage && (
                            <p className="text-destructive text-sm mb-4">{errorMessage}</p>
                        )}

                        {successMessage && (
                            <p className="text-primary text-sm mb-4">{successMessage}</p>
                        )}

                        {/* Create account button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-gradient-to-r from-primary to-primary-light text-primary-foreground py-3 rounded-xl font-medium hover:opacity-90 transition disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Creating account...' : 'Create account →'}
                        </button>

                        {/* Terms and Privacy */}
                        <p className="text-xs text-muted-foreground text-center mt-4">
                            By continuing you agree to our{' '}
                            <Link to="/terms" className="underline hover:text-foreground transition">Terms</Link>
                            {' '}and{' '}
                            <Link to="/privacy" className="underline hover:text-foreground transition">Privacy Policy</Link>.
                        </p>

                    </form>

                </div>

                {/* Log in link (below card) */}
                <p className="text-muted-foreground">
                    Already have an account?{' '}
                    <Link to="/login" className="font-semibold text-foreground hover:text-primary transition">
                        Log in
                    </Link>
                </p>

            </div>

            {/* Bottom: Footer */}
            <footer className="text-sm text-muted-foreground">
                © 2026 EspañolAI · Aprende sin límites
            </footer>

        </div>
    );
}

export default RegisterPage;