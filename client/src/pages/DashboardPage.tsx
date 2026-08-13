import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

function DashboardPage() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    // Log out, then send them back to login
    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen p-8">
            <div className="max-w-2xl mx-auto">

                {/* user?. because TypeScript still types user as possibly-null here,
                    even though ProtectedRoute guarantees it exists */}
                <h1 className="text-4xl font-display text-foreground mb-2">
                    Hello, {user?.firstName}
                </h1>
                <p className="text-muted-foreground mb-8">
                    You're logged in as {user?.email}.
                </p>

                <button
                    onClick={handleLogout}
                    className="bg-primary text-primary-foreground px-6 py-3 rounded-xl font-medium hover:opacity-90 transition"
                >
                    Log out
                </button>

            </div>
        </div>
    );
}

export default DashboardPage;