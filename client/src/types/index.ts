export interface Conversation {
    id: number;
    title: string | null;
    created_at: string;
    updated_at: string;
}

export interface message {
    id: number;
    conversation_id: number;
    role: 'user' | 'assistant';
    content: string;
    created_at: string;
}