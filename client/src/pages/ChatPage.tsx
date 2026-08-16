import { useState, useEffect, useRef, type FormEvent } from 'react';
import type { Conversation, Message } from '../types';

// Inline SVG icon - same approach as the Sidebar icons.
function PlusIcon({ size = 18 }: { size?: number }) {
    return (
        <svg
            width={size} height={size} viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round"
            strokeLinejoin="round" aria-hidden="true"
        >
            <path d="M12 5v14" />
            <path d="M5 12h14" />
        </svg>
    );
}

function ChatPage() {
    // ----- Conversation list state -----
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');

    // ----- Message state -----
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoadingMessages, setIsLoadingMessages] = useState(false);

    // ----- Send state -----
    const [input, setInput] = useState('');
    const [isSending, setIsSending] = useState(false);

    // near your other hooks
    const tempIdRef = useRef(-1);

    // Points to an invisible div at the bottom of the thread, so we can
    // scroll it into view whenever new content appears.
    const bottomRef = useRef<HTMLDivElement>(null);

    // Load the conversation list once on mount.
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

    // Re-fetch messages every time the selected conversation changes.
    useEffect(() => {
        if (selectedId === null) {
            setMessages([]);
            return;
        }

        const fetchMessages = async () => {
            // Clear immediately so the old conversation's messages don't linger
            setMessages([]);
            setIsLoadingMessages(true);
            try {
                const response = await fetch(
                    `${import.meta.env.VITE_API_URL}/chat/conversations/${selectedId}/messages`,
                    { credentials: 'include' }
                );
                const data = await response.json();
                if (response.ok) {
                    setMessages(data);
                } else {
                    setErrorMessage(data.message);
                }
            } catch (err) {
                console.error('[fetchMessages]', err);
                setErrorMessage('Could not load messages.');
            } finally {
                setIsLoadingMessages(false);
            }
        };
        fetchMessages();
    }, [selectedId]);

    // Scroll to the bottom whenever the thread grows or the tutor starts "thinking".
    // Runs after render, so the new node is already on the page.
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isSending]);

    // Create a fresh conversation and select it
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
                setConversations(prev => [data, ...prev]);
                setSelectedId(data.id);
            } else {
                setErrorMessage(data.message);
            }
        } catch (err) {
            console.error('[handleNewConversation]', err);
            setErrorMessage('Could not create conversation.');
        }
    };

    // Send a message: show it optimistically, then append the tutor's reply
    const handleSend = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (selectedId === null || input.trim() === '') return;

        const content = input.trim();
        setInput('');
        setErrorMessage('');

        // Optimistic user message - appears instantly with a throwaway id.
        // The real row lives in the DB; this is just for immediate display.
        const optimisticUserMessage: Message = {
            id: tempIdRef.current,
            conversation_id: selectedId,
            role: 'user',
            content,
            created_at: new Date().toISOString(),
        };
        tempIdRef.current -= 1;   // next temp id is -2, -3, ...
        // Functional form: build on whatever messages currently exist
        setMessages(prev => [...prev, optimisticUserMessage]);

        setIsSending(true);
        try {
            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/chat/conversations/${selectedId}/messages`,
                {
                    method: 'POST',
                    credentials: 'include',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ content }),
                }
            );
            const data = await response.json();

            if (response.ok) {
                // Backend returns { message, aiResponse } - aiResponse is the reply text,
                // not a full message row. Build a Message object from it for display.
                const assistantMessage: Message = {
                    id: tempIdRef.current,
                    conversation_id: selectedId,
                    role: 'assistant',
                    content: data.aiResponse,
                    created_at: new Date().toISOString(),
                };
                tempIdRef.current -= 1;
                setMessages(prev => [...prev, assistantMessage]);
            } else {
                setErrorMessage(data.message);
            }
        } catch (err) {
            console.error('[handleSend]', err);
            setErrorMessage('Could not send message.');
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="flex h-screen">

            {/* Center: message thread + input */}
            <div className="flex-1 flex flex-col">

                {/* Thread - flex-1 fills the height, overflow-y-auto scrolls internally */}
                <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">

                    {selectedId === null ? (
                        <div className="flex-1 flex items-center justify-center text-muted-foreground">
                            Select a conversation to get started
                        </div>
                    ) : isLoadingMessages ? (
                        <div className="flex-1 flex items-center justify-center">
                            <div className="w-8 h-8 border-4 border-border border-t-primary rounded-full animate-spin"></div>
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="flex-1 flex items-center justify-center text-muted-foreground">
                            No messages yet. Say something in Spanish!
                        </div>
                    ) : (
                        messages.map(message => (
                            <div
                                key={message.id}
                                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'
                                    }`}
                            >
                                <div
                                    className={`max-w-[75%] px-4 py-3 rounded-2xl whitespace-pre-wrap ${message.role === 'user'
                                            ? 'bg-primary/10 text-foreground'
                                            : 'bg-card border border-border text-foreground'
                                        }`}
                                >
                                    {message.content}
                                </div>
                            </div>
                        ))
                    )}

                    {/* Tutor "thinking" indicator while awaiting Gemini */}
                    {isSending && (
                        <div className="flex justify-start">
                            <div className="bg-card border border-border rounded-2xl px-4 py-3 text-muted-foreground">
                                <span className="animate-pulse">···</span>
                            </div>
                        </div>
                    )}

                    {/* Invisible scroll anchor - always the last child of the thread */}
                    <div ref={bottomRef} />

                </div>

                {/* Input bar */}
                <div className="border-t border-border p-4">
                    <form onSubmit={handleSend} className="flex gap-2">
                        <input
                            type="text"
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            placeholder="Escribe en español..."
                            disabled={selectedId === null || isSending}
                            className="flex-1 bg-input border border-border rounded-lg px-4 py-3 focus:outline-none focus:border-primary transition disabled:opacity-60"
                        />
                        <button
                            type="submit"
                            disabled={selectedId === null || input.trim() === '' || isSending}
                            className="bg-primary text-primary-foreground px-5 py-3 rounded-lg font-medium hover:opacity-90 transition disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            Send
                        </button>
                    </form>
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
                                className={`w-full text-left px-3 py-2 rounded-lg transition ${selectedId === conversation.id
                                        ? 'bg-primary/10 text-primary font-medium'
                                        : 'text-foreground hover:bg-muted'
                                    }`}
                            >
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