import { useState, useEffect } from 'react';
import type { Conversation } from '../types';

// Inline SVG icon - same approach as the Sidebar icons.
// stroke="currentColor" makes it inherit the button's text color automatically.
function PlusIcon({ size = 18 }: { size?: number }) {
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
            <path d="M12 5v14" />
            <path d="M5 12h14" />
        </svg>
    );
}

function ChatPage() {
    // The user's conversations, newest first (backend sorts by updated_at DESC)
    const [conversations, setConversations] = useState<Conversation[]>([]);
    // Which conversation is open. We store the id, not the object, so there's
    // only ever one source of truth for the conversation data.
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');

    // Load the conversation list once when the page mounts.
    // No useRef guard needed - this is a read, so StrictMode's double-fire is harmless.
    useEffect(() => {
        const fetchConversations = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/chat/conversations`, {
                    credentials: 'include',
                });
                const data = await response.json();

                if (response.ok) {
                    setConversations(data);
                } else {
                    setErrorMessage(data.message);
                }
            } catch (err) {
                console.error('[fetchConversations]', err);
                setErrorMessage('Could not load conversations.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchConversations();
    }, []);

    // Create a fresh conversation and immediately select it
    const handleNewConversation = async () => {
        setErrorMessage('');

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/chat/conversations`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: null }),
            });
            const data = await response.json();

            if (response.ok) {
                // New array, not .push() - React only re-renders when the reference changes.
                // Newest first keeps us consistent with the backend's ordering.
                setConversations([data, ...conversations]);
                setSelectedId(data.id);
            } else {
                setErrorMessage(data.message);
            }
        } catch (err) {
            console.error('[handleNewConversation]', err);
            setErrorMessage('Could not create conversation.');
        }
    };

    return (
        // h-screen locks the layout to the viewport so panels scroll internally
        // instead of the whole page growing forever
        <div className="flex h-screen">

            {/* Center: message thread + input (Part 2) */}
            <div className="flex-1 flex flex-col">
                <div className="flex-1 flex items-center justify-center text-muted-foreground">
                    {selectedId
                        ? 'Messages will go here'
                        : 'Select a conversation to get started'}
                </div>
            </div>

            {/* Right: conversations list */}
            <aside className="w-72 shrink-0 border-l border-border p-4 flex flex-col overflow-y-auto">

                <h2 className="font-display text-lg text-foreground mb-4">Conversations</h2>

                <button
                    type="button"
                    onClick={handleNewConversation}
                    className="flex items-center justify-center gap-2 w-full bg-primary text-primary-foreground px-4 py-2.5 rounded-lg font-medium hover:opacity-90 transition mb-4"
                >
                    <PlusIcon />
                    New conversation
                </button>

                {errorMessage && (
                    <p className="text-destructive text-sm mb-4">{errorMessage}</p>
                )}

                {/* Three list states: loading, empty, populated.
                    The empty state matters - a blank panel reads as a bug. */}
                {isLoading ? (
                    <div className="flex justify-center py-8">
                        <div className="w-8 h-8 border-4 border-border border-t-primary rounded-full animate-spin"></div>
                    </div>
                ) : conversations.length === 0 ? (
                    <p className="text-muted-foreground text-sm text-center py-8">
                        No conversations yet. Start one above.
                    </p>
                ) : (
                    <div className="flex flex-col gap-1">
                        {conversations.map(conversation => (
                            <button
                                type="button"
                                key={conversation.id}
                                onClick={() => setSelectedId(conversation.id)}
                                className={`w-full text-left px-3 py-2 rounded-lg transition ${
                                    selectedId === conversation.id
                                        ? 'bg-primary/10 text-primary font-medium'
                                        : 'text-foreground hover:bg-muted'
                                }`}
                            >
                                {/* title is nullable in the DB, so fall back to a placeholder */}
                                <span className="block truncate">
                                    {conversation.title || 'New conversation'}
                                </span>
                                <span className="block text-xs text-muted-foreground">
                                    {new Date(conversation.updated_at).toLocaleDateString()}
                                </span>
                            </button>
                        ))}
                    </div>
                )}

            </aside>
        </div>
    );
}

export default ChatPage;