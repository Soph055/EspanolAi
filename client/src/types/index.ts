export interface Conversation {
    id: number;
    title: string | null;
    created_at: string;
    updated_at: string;
}

export interface Message {
    id: number;
    conversation_id: number;
    role: 'user' | 'assistant';
    content: string;
    created_at: string;
}

export interface Word {
    id: number;
    word: string;
    translation: string;
    times_correct: number;
    times_incorrect: number;
    created_at: string;
}