import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Logo from '../Logo';
import { DashboardIcon, MessageIcon, BookIcon, SparklesIcon, FileIcon, LogoutIcon } from '../Icons';



function Sidebar() {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const linkClass = ({ isActive }: { isActive: boolean }) =>
        `flex items-center gap-3 px-4 py-2.5 rounded-lg transition ${
            isActive
                ? 'bg-primary/10 text-primary font-medium'
                : 'text-foreground hover:bg-muted'
        }`;

    return (
        <aside className="w-64 shrink-0 min-h-screen bg-card border-r border-border p-4 flex flex-col">
            <div className="mb-8 px-2">
                <Logo />
            </div>

            <nav className="flex flex-col gap-1">
                <NavLink to="/dashboard" className={linkClass}>
                    <DashboardIcon />
                    Dashboard
                </NavLink>

                <NavLink to="/chat" className={linkClass}>
                    <MessageIcon />
                    Chat Tutor
                </NavLink>

                <NavLink to="/vocabulary" className={linkClass}>
                    <BookIcon />
                    Vocabulary
                </NavLink>

                <NavLink to="/quiz" className={linkClass}>
                    <SparklesIcon />
                    Quizzes
                </NavLink>

                <NavLink to="/documents" className={linkClass}>
                    <FileIcon />
                    Documents
                </NavLink>
            </nav>

            <button
                type="button"
                onClick={handleLogout}
                className="mt-auto flex items-center gap-3 px-4 py-2.5 rounded-lg text-foreground hover:bg-muted transition"
            >
                <LogoutIcon />
                Log out
            </button>
        </aside>
    );
}

export default Sidebar;