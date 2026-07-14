import { useState, useEffect, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Logo } from '../components/Logo'

function VerifyEmailPage() {
    const { token } = useParams();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [errorMessage, setErrorMessage] = useState('');
    const hasVerified = useRef(false);

    useEffect(() => {
         // Guard against StrictMode's double-invoke firing this twice in dev
              if (hasVerified.current) return;
                hasVerified.current = true;
                
        const verifyToken = async () => {
            //if no token fail immediately 
            if (!token) {
                setStatus('error');
                setErrorMessage('No token provided.');
                return;
            }

            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/verify/${token}`);
                const data = await response.json();

                if (response.ok) {
                    setStatus('success');

                } else {
                    setStatus('error');
                    setErrorMessage(data.message || 'Verification failed.');

                }
            } catch (err) {
                console.error(err);
                setStatus('error');
                setErrorMessage('Something went wrong. Please try again');
            }
        };

        verifyToken();


    }, [token]);

    return (

        <div className=" min-h-screen flex flex-col items-center p-6">

            {/**Logo */}
            <Logo />

            {/**Middle Wrapper */}
            <div className='flex-1 flex flex-col justify-center items-center w-full gap-6 py-12'>

                {/**Card */}
                <div className='bg-card border border-border rounded-2xl p-8 w-full max-w-md shadow-sm text-center'>
                    {/**Status Loading */}

                    {status === 'loading' && (
                        <>
                            <div className="w-16 h-16 mx-auto mb-4 border-4 border-border border-t-primary rounded-full animate-spin"></div>
                            <h1 className="text-3xl font-display text-foreground mb-2">Verifying your email</h1>
                            <p className="text-muted-foreground">Just a moment...</p>
                        </>

                    )}

                    {/**Status Success */}
                    {status === 'success' && (
                        <>
                            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                                <span className="text-primary text-4xl">✓</span>
                            </div>
                            <h1 className="text-3xl font-display text-foreground mb-2">Email verified</h1>
                            <p className="text-muted-foreground mb-6">Your account is ready to use.</p>
                            <Link
                                to="/login"
                                className="inline-block w-full bg-gradient-to-r from-primary to-primary-light text-primary-foreground py-3 rounded-xl font-medium hover:opacity-90 transition"
                            >
                                Log in →
                            </Link>
                        </>

                    )}

                    {/**Status Failure */}

                    {status === 'error' && (<>
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-destructive/10 flex items-center justify-center">
                            <span className="text-destructive text-4xl">×</span>
                        </div>
                        <h1 className="text-3xl font-display text-foreground mb-2">Verification failed</h1>
                        <p className="text-muted-foreground mb-6">
                            {errorMessage || 'This link may be expired or invalid.'}
                        </p>
                        <Link
                            to="/login"
                            className="inline-block w-full bg-card border border-border text-foreground py-3 rounded-xl font-medium hover:bg-muted transition"
                        >
                            Back to login
                        </Link>
                    </>

                    )}
                </div>
            </div>




        </div>
    );
}

export default VerifyEmailPage;