import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { Conversation } from '../types';
import { MessageIcon, BookIcon, SparklesIcon, FileIcon, ArrowRightIcon } from '../components/icons';

function DashboardPage() {
    const { user } = useAuth();

    const [vocabCount, setVocabCount] = useState(0);
    const [docCount, setDocCount] = useState(0);
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');

    // Fetch all three lists at once (parallel, not one-after-another)
    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const [vocabRes, convosRes, docsRes] = await Promise.all([
                    fetch(`${import.meta.env.VITE_API_URL}/vocabulary`, { credentials: 'include' }),
                    fetch(`${import.meta.env.VITE_API_URL}/chat/conversations`, { credentials: 'include' }),
                    fetch(`${import.meta.env.VITE_API_URL}/documents`, { credentials: 'include' }),
                ]);

                const [vocab, convos, docs] = await Promise.all([
                    vocabRes.json(),
                    convosRes.json(),
                    docsRes.json(),
                ]);

                if (vocabRes.ok) setVocabCount(vocab.length);
                if (convosRes.ok) setConversations(convos);
                if (docsRes.ok) setDocCount(docs.length);
            } catch (err) {
                console.error('[fetchDashboard]', err);
                setErrorMessage('Could not load dashboard.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchDashboard();
    }, []);

    // The four "jump back in" cards, as data so we can map over them
    const actions = [
        { to: '/chat', label: 'Chat Tutor', desc: 'Practice conversation with your AI tutor', Icon: MessageIcon },
        { to: '/vocabulary', label: 'Vocabulary', desc: 'Review and add new words', Icon: BookIcon },
        { to: '/quiz', label: 'Quizzes', desc: 'Test yourself on weak words', Icon: SparklesIcon },
        { to: '/documents', label: 'Documents', desc: 'Upload and read Spanish texts', Icon: FileIcon },
    ];

    return (
        <div className="p-8 mx-auto">

            {/* Greeting */}
            <div className="mb-8">
                <h1 className="text-4xl font-display text-foreground">
                    Hola, {user?.firstName && user.firstName.charAt(0).toUpperCase()}
                </h1>
                <p className="text-muted-foreground">Here's your Spanish at a glance</p>
            </div>

            {errorMessage && (
                <p className="text-destructive text-sm mb-4">{errorMessage}</p>
            )}

            {/* Stat cards - number on the left, icon badge top-right */}
            <div className="grid grid-cols-2 gap-4 mb-10">
                <div className="bg-card border border-border rounded-2xl p-6 flex items-start justify-between">
                    <div>
                        <p className="text-xs font-semibold tracking-wider text-muted-foreground mb-2">WORDS LEARNED</p>
                        <p className="text-5xl font-display text-foreground">{vocabCount}</p>
                    </div>
                    <div className="w-11 h-11 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                        <BookIcon size={20} />
                    </div>
                </div>

                <div className="bg-card border border-border rounded-2xl p-6 flex items-start justify-between">
                    <div>
                        <p className="text-xs font-semibold tracking-wider text-muted-foreground mb-2">DOCUMENTS</p>
                        <p className="text-5xl font-display text-foreground">{docCount}</p>
                    </div>
                    <div className="w-11 h-11 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                        <FileIcon size={20} />
                    </div>
                </div>
            </div>

            {/* Quick actions */}
            <h2 className="font-display text-xl text-foreground mb-4">Jump back in</h2>
            <div className="grid grid-cols-2 gap-4 mb-10">
                {actions.map(({ to, label, desc, Icon }) => (
                    <Link
                        key={to}
                        to={to}
                        className="bg-card border border-border rounded-2xl p-6 flex items-center gap-4 hover:border-primary transition group"
                    >
                        {/* Icon badge - soft scarlet tint */}
                        <div className="shrink-0 w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                            <Icon size={22} />
                        </div>

                        {/* Text */}
                        <div className="flex-1">
                            <p className="font-display text-lg text-foreground">{label}</p>
                            <p className="text-sm text-muted-foreground">{desc}</p>
                        </div>

                        {/* Arrow, greyed until hover */}
                        <span className="text-muted-foreground group-hover:text-primary transition">
                            <ArrowRightIcon size={20} />
                        </span>
                    </Link>
                ))}
            </div>

            {/* Recent conversations */}
            <h2 className="font-display text-xl text-foreground mb-4">Recent conversations</h2>

            {isLoading ? (
                <div className="flex justify-center py-8">
                    <div className="w-8 h-8 border-4 border-border border-t-primary rounded-full animate-spin"></div>
                </div>
            ) : conversations.length === 0 ? (
                <p className="text-muted-foreground py-4">
                    No conversations yet.{' '}
                    <Link to="/chat" className="text-primary hover:underline">Start one →</Link>
                </p>
            ) : (
                <div className="flex flex-col gap-2">
                    {conversations.slice(0, 5).map(convo => (
                        <Link
                            key={convo.id}
                            to="/chat"
                            className="flex items-center gap-4 bg-card border border-border rounded-xl p-4 hover:border-primary transition"
                        >
                            {/* Icon badge */}
                            <div className="shrink-0 w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                                <MessageIcon size={18} />
                            </div>
                            <span className="flex-1 text-foreground truncate">
                                {convo.title || 'New conversation'}
                            </span>
                            <span className="text-sm text-muted-foreground shrink-0">
                                {new Date(convo.updated_at).toLocaleDateString()}
                            </span>
                        </Link>
                    ))}
                </div>
            )}

        </div>
    );
}

export default DashboardPage;