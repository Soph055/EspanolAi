import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

// Shape of the logged-in user, mirrors what GET /auth/me returns
interface User {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
}

// Everything the context hands to consumers via useAuth()
interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    checkAuth: () => Promise<void>;
    logout: () => Promise<void>;
}

// The context box. undefined default lets us detect "used without a Provider"
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    // Starts true so ProtectedRoute waits for the first check before deciding
    const [isLoading, setIsLoading] = useState(true);

    // Ask the backend who we are, based on the httpOnly cookie
    const checkAuth = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/me`, {
                credentials: 'include',
            });

            if (response.ok) {
                const data = await response.json();
                setUser(data);
            } else {
                setUser(null);
            }
        } catch (err) {
            console.error('[checkAuth]', err);
            setUser(null);
        } finally {
            // Whatever happened, we're done checking
            setIsLoading(false);
        }
    };

    // Clear the cookie on the backend, then forget the user locally
    const logout = async () => {
        try {
            await fetch(`${import.meta.env.VITE_API_URL}/auth/logout`, {
                method: 'POST',
                credentials: 'include',
            });
        } catch (err) {
            console.error('[logout]', err);
        } finally {
            // Log out locally even if the network call failed
            setUser(null);
        }
    };

    // Run the auth check once when the app first mounts
    useEffect(() => {
        checkAuth();
    }, []);

    return (
        <AuthContext.Provider value={{ user, isLoading, checkAuth, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

// Custom hook so components can read the context with one clean call
export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used inside AuthProvider');
    }
    return context;
}