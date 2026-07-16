import { useState, type FormEvent } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';;

function ConfirmResetPage() {
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const {token} = useParams();
    const navigate = useNavigate();

    {/**Password Requirements */ }
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
            const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/reset-password/${token}`, {
                method: "POST",
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password }),
            });
            const data = await response.json();

            if (response.ok) {
                setSuccessMessage('Password reset. Redirecting to login...');
                // Give the user a moment to read the success message before navigating
                setTimeout(() => navigate('/login'), 1500);

            } else {
                setErrorMessage(data.message);

            }

        } catch (err) {
            console.error(err);
            setErrorMessage("Something went wrong. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };
    return (
        <div>
            
        </div>
    )

};

export default ConfirmResetPage();