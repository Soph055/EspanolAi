import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom'
import { Link } from 'react-router-dom'
function RegisterPage() {
    const navigate = useNavigate();
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');


    const has8Chars = password.length >= 8;
    const hasUppercase = /[A-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);


    return (

        <div className='min-h-screen flex flex-col items-center p-6'>
            {/* Top: Logo */}
            <div className="flex items-center gap-3 pt-12">
                <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                    <span className="font-display text-primary-foreground text-xl leading-none">ñ</span>
                </div>
                <span className="font-display text-2xl font-semibold">
                    Español<span className="text-primary">AI</span>
                </span>
            </div>
            {/* Middle: Card*/}
            <div className='flex-1 flex flex-col justify-center items-center w-full gap-6 py-12 '>
                {/* Card Shell*/}
                <div className="bg-card border border-border rounded-2xl p-8 w-full max-w-md shadow-sm">

                    {/*Heading + subheading*/}
                    <div className='text-center mb-8'>
                        <h1 className='text-4xl font-display text-foreground mb-2'>Create your account</h1>
                        <p className="text-muted-foreground">Start learning Spanish today!</p>
                    </div>

                    {/* Form */}
                    <form>
                        {/* First Name and Last Name */}
                        <div className='flex gap-4 mb-6'>
                            {/* First Name */}
                            <div className='flex-1'>
                                <label htmlFor="firstName" className='text-sm font-medium mb-2 block'>FIRST NAME</label>
                                <input
                                    id="firstName"
                                    type="text"
                                    value={firstName}
                                    placeholder='Enter first name'
                                    className='w-full bg-input border border-border rounded-2xl px-4 py-3 focus:outline-none focus:border-primary transition'
                                    onChange={e => setFirstName(e.target.value)} />
                            </div>
                            {/*Last Name*/}
                            <div className="flex-1">
                                <label htmlFor="lastName" className='text-sm font-medium mb-2 block'>LAST NAME</label>
                                <input
                                    id="lastName"
                                    type="text"
                                    value={lastName}
                                    placeholder='Enter last name'
                                    className='w-full bg-input border border-border rounded-2xl px-4 py-3 focus:outline-none focus:border-primary transition'
                                    onChange={e => setLastName(e.target.value)} />
                            </div>
                        </div>
                        {/* Email */}
                        <div className='mb-6'>
                            <label htmlFor='email' className="text-sm font-medium mb-2 block">EMAIL</label>
                            <input
                                id="email"
                                type='email'
                                value={email}
                                placeholder='Enter your email'
                                className='w-full bg-input border border-border rounded-2xl px-4 py-3 focus:outline-none focus:border-primary transition'
                                onChange={e => setEmail(e.target.value)} />

                        </div>
                        {/* Password */}
                        <label htmlFor="password" className='text-sm font-medium mb-2 block'>PASSWORD</label>
                        <input
                            id='password'
                            type='password'
                            value={password}
                            placeholder='Enter your password'
                            className='w-full bg-input border border-border rounded-2xl px-4 py-3 focus:outline-none focus:border-primary transition'
                            onChange={e => setPassword(e.target.value)} />


                        {/* Password Requirments*/}
                        <div className="grid grid-cols-2 gap-2 mb-6 mt-2 text-sm">
                            {/** 8 Chars */}
                            <div className={`flex items-center gap-2 ${has8Chars ? 'text-primary' : 'text-muted-foreground'}`}>
                                <span>{has8Chars ? '✓' : '×'}</span>
                                <span>At least 8 characters</span>
                            </div>
                            {/**One Uppercase letter */}
                            <div className={`flex items-center gap-2 ${hasUppercase ? 'text-primary' : 'text-muted-foreground'}`}>
                                <span>{hasUppercase ? '✓' : '×'}</span>
                                <span>One uppercase letter</span>
                            </div>
                            {/**Has a Number */}
                            <div className={`flex items-center gap-2 ${hasNumber ? 'text-primary' : 'text-muted-foreground'}`}>
                                <span>{hasNumber ? '✓' : '×'}</span>
                                <span>One number</span>
                            </div>
                            {/**Has one Special Char */}
                            <div className={`flex items-center gap-2 ${hasSpecialChar ? 'text-primary' : 'text-muted-foreground'} `}>
                                <span>{hasSpecialChar ? '✓' : '×'}</span>
                                <span>One special character</span>
                            </div>
                        </div>

                        {/*Create acount button*/}
                        <button type="submit" className='w-full bg-gradient-to-r from-primary to-primary-light text-primary-foreground py-3 rounded-2xl font-medium hover:opacity-90 transition'>
                            Create account →
                        </button>

                        {/**Terms & Privacy paragraph */}
                        <p className="text-xs text-muted-foreground text-center mt-4">
                            By continuing you agree to our <Link to="/terms" className="text-primary hover:underline">Terms</Link> and <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
                        </p>
                    </form>
                </div>
                {/* Login link */}
                <p className="text-medium text-center mt-4">
                    Already have an account? <Link to="/login" className="text-primary hover:underline">Log in</Link>
                </p>
            </div>
            {/* Footer */}
            <footer className="text-sm text-muted-foreground">
                © 2026 EspañolAI · Aprende sin límites
            </footer>
        </div>
    );
}

export default RegisterPage;