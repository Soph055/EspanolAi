import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Logo } from '../components/Logo'

function VerifyEmailPage() {
    const { token } = useParams();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [errorMessage, setErrorMessage] = useState('');


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
                    {status === 'sucess' && (
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