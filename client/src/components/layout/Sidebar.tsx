import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Logo from '../Logo';

type IconProps = {
    size?: number;
};

function DashboardIcon({ size = 20 }: IconProps) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <rect x="3" y="3" width="7" height="9" rx="1" />
            <rect x="14" y="3" width="7" height="5" rx="1" />
            <rect x="14" y="12" width="7" height="9" rx="1" />
            <rect x="3" y="16" width="7" height="5" rx="1" />
        </svg>
    );
}

function MessageIcon({ size = 20 }: IconProps) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" />
        </svg>
    );
}

function BookIcon({ size = 20 }: IconProps) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        </svg>
    );
}

function SparklesIcon({ size = 20 }: IconProps) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <path d="m12 3-1.5 4.5L6 9l4.5 1.5L12 15l1.5-4.5L18 9l-4.5-1.5z" />
            <path d="m19 15-.75 2.25L16 18l2.25.75L19 21l.75-2.25L22 18l-2.25-.75z" />
            <path d="m5 2-.75 2.25L2 5l2.25.75L5 8l.75-2.25L8 5l-2.25-.75z" />
        </svg>
    );
}

function FileIcon({ size = 20 }: IconProps) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <path d="M14 2v6h6" />
            <path d="M8 13h8" />
            <path d="M8 17h8" />
        </svg>
    );
}

function LogoutIcon({ size = 20 }: IconProps) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <path d="M10 17l5-5-5-5" />
            <path d="M15 12H3" />
            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
        </svg>
    );
}

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