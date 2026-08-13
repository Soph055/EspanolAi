import { useState, type FormEvent } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import Footer from '../components/Footer';

// -------- Confirm Reset Password --------
// Step 2 of the password reset flow.
// User lands here from the reset link in their email (URL contains the token).
// They enter a new password; backend validates the token and updates the password.
// On success, we redirect to /login after a brief delay so the user can read the confirmation.
function ConfirmResetPage() {
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Grab the token from the URL (matches the :token param in the route)
    const { token } = useParams();
    const navigate = useNavigate();

    // Password requirements - derived from state, recalculated every render
    // Must match the rules in the backend's Zod schema
    const has8Chars = password.length >= 8;
    const hasUppercase = /[A-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*]/.test(password);

    const handleReset = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setErrorMessage('');
        setSuccessMessage('');
        setIsLoading(true);

        try {
            // Token goes in the URL path (matches the backend route)
            const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/reset-password/${token}`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password }),
            });

            const data = await response.json();

            if (response.ok) {
                setSuccessMessage('Password reset. Redirecting to login...');
                // Delay the redirect so the user can read the success message
                setTimeout(() => navigate('/login'), 1500);
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

            {/* Middle: Card + back-to-login link (grows to fill vertical space) */}
            <div className="flex-1 flex flex-col justify-center items-center w-full gap-6 py-12">

                {/* Card */}
                <div className="bg-card border border-border rounded-2xl p-8 w-full max-w-md shadow-sm">

                    {/* Heading */}
                    <div className="text-center mb-8">
                        <h1 className="text-4xl font-display text-foreground mb-2">Set a new password</h1>
                        <p className="text-muted-foreground">Choose something strong you'll remember.</p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleReset}>

                        {/* Password field */}
                        <div className="mb-6">
                            <label htmlFor="password" className="text-sm font-medium mb-2 block">NEW PASSWORD</label>
                            <input
                                id="password"
                                type="password"
                                autoComplete="new-password"
                                value={password}
                                placeholder="Enter your new password"
                                className="w-full bg-input border border-border rounded-lg px-4 py-3 focus:outline-none focus:border-primary transition"
                                onChange={e => setPassword(e.target.value)}
                            />
                        </div>

                        {/* Password requirements checklist - live updates as user types */}
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

                        {/* Submit button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-gradient-to-r from-primary to-primary-light text-primary-foreground py-3 rounded-xl font-medium hover:opacity-90 transition disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Resetting...' : 'Reset password →'}
                        </button>

                    </form>
                </div>

                {/* Back to login link */}
                <p className="text-muted-foreground">
                    Changed your mind?{' '}
                    <Link to="/login" className="font-semibold text-foreground hover:text-primary transition">
                        Back to log in
                    </Link>
                </p>

            </div>

            {/* Bottom: Footer */}
           <Footer />
        </div>
    );
}

export default ConfirmResetPage;