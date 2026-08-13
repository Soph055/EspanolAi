import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { type ReactNode } from 'react';

function ProtectedRoute({ children }: { children: ReactNode }) {
    const { user, isLoading } = useAuth();

    // Still checking auth - don't decide anything yet, just show a spinner
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-16 h-16 border-4 border-border border-t-primary rounded-full animate-spin"></div>
            </div>
        );
    }

    // Done checking, no user - kick them to login
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // Done checking, user exists - render the protected page
    return <>{children}</>;
}

export default ProtectedRoute;