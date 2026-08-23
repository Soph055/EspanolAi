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

export interface QuizQuestion {
    vocabularyId: number;
    word: string;
    options: string[];
    correctAnswer: string;
}

export interface Document {
    id: number;
    filename: string;
    file_type: 'pdf' | 'docx' | 'txt';
    file_size: number;
    created_at: string;
    extracted_text?: string;
}

export interface DocumentQuestion {
    question: string;
    options: string[];
    correctAnswer: string;
}