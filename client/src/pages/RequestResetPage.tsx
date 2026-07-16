import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import Footer from '../components/Footer';
import Logo from '../components/Logo';

// -------- Request Reset Password --------
// Step 1 of the password reset flow.
// User enters their email; backend generates a token and emails them a reset link.
// Response is deliberately identical whether the email exists or not (prevents email enumeration).
function RequestResetPasswordPage() {
    const [email, setEmail] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleResetRequest = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        // Clear any previous messages from the last attempt
        setErrorMessage('');
        setSuccessMessage('');
        setIsLoading(true);

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/reset-password`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email.trim() }),
            });

            const data = await response.json();

            if (response.ok) {
                // Show the backend's message directly - it's the same string regardless of
                // whether the email exists, which is what we want for security
                setSuccessMessage(data.message);
            } else {
                setErrorMessage(data.message);
            }
        } catch (err) {
            console.error(err);
            setErrorMessage('Something went wrong. Please try again.');
        } finally {
            // Always re-enable the button, success or failure
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center p-6">

            {/* Top: Logo */}
            <Logo />

            {/* Middle: Card + back-to-login link (grows to fill vertical space) */}
            <div className="flex-1 flex flex-col justify-center items-center w-full gap-6 py-12">

                {/* Card */}
                <div className="bg-card border border-border rounded-2xl p-8 w-full max-w-md shadow-sm">

                    {/* Heading */}
                    <div className="text-center mb-8">
                        <h1 className="text-4xl font-display text-foreground mb-2">Forgot your password?</h1>
                        <p className="text-muted-foreground">Enter your email and we'll send you a reset link.</p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleResetRequest}>

                        {/* Email field */}
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

                        {/* Error / success messages - only one shows at a time */}
                        {errorMessage && (
                            <p className="text-destructive text-sm mb-4">{errorMessage}</p>
                        )}
                        {successMessage && (
                            <p className="text-primary text-sm mb-4">{successMessage}</p>
                        )}

                        {/* Submit button - disabled + shows loading text during request */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-gradient-to-r from-primary to-primary-light text-primary-foreground py-3 rounded-xl font-medium hover:opacity-90 transition disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Sending...' : 'Send reset link →'}
                        </button>

                    </form>
                </div>

                {/* Back to login link */}
                <p className="text-muted-foreground">
                    Remember it?{' '}
                    <Link to="/login" className="font-semibold text-foreground hover:text-primary transition">
                        Back to log in
                    </Link>
                </p>

            </div>

            <Footer />

        </div>
    );
}

export default RequestResetPasswordPage;