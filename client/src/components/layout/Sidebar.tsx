import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, MessageCircle, BookOpen, Sparkles, FileText, LogOut } from 'lucide-react';
import Logo from '../Logo';

export function Sidebar() {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    // Shared className function for all nav links - highlights the active route
    const linkClass = ({ isActive }: { isActive: boolean }) =>
        `flex items-center gap-3 px-4 py-2.5 rounded-lg transition ${
            isActive
                ? 'bg-primary/10 text-primary font-medium'
                : 'text-foreground hover:bg-muted'
        }`;

    return (
        <aside className="w-64 min-h-screen bg-card border-r border-border p-4 flex flex-col">

            {/* Logo */}
            <div className="mb-8 px-2">
                <Logo />
            </div>

            {/* Nav links */}
            <nav className="flex flex-col gap-1">
                <NavLink to="/dashboard" className={linkClass}>
                    <LayoutDashboard size={20} />
                    Dashboard
                </NavLink>
                <NavLink to="/chat" className={linkClass}>
                    <MessageCircle size={20} />
                    Chat Tutor
                </NavLink>
                <NavLink to="/vocabulary" className={linkClass}>
                    <BookOpen size={20} />
                    Vocabulary
                </NavLink>
                <NavLink to="/quiz" className={linkClass}>
                    <Sparkles size={20} />
                    Quizzes
                </NavLink>
                <NavLink to="/documents" className={linkClass}>
                    <FileText size={20} />
                    Documents
                </NavLink>
            </nav>

            {/* Logout pinned to bottom */}
            <button
                onClick={handleLogout}
                className="mt-auto flex items-center gap-3 px-4 py-2.5 rounded-lg text-foreground hover:bg-muted transition"
            >
                <LogOut size={20} />
                Log out
            </button>

        </aside>
    );
}