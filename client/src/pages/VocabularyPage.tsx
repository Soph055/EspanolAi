import { useState, useEffect, type FormEvent } from 'react';
import type { Word } from '../types';

function VocabularyPage() {
    // The user's saved words
    const [words, setWords] = useState<Word[]>([]);
    // The two add-form inputs
    const [newWord, setNewWord] = useState('');
    const [newTranslation, setNewTranslation] = useState('');
    // Live search text - filters the list client-side
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');

    // Fetch the full vocabulary list once on mount
    useEffect(() => {
        const fetchWords = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/vocabulary`, {
                    credentials: 'include',
                });
                const data = await response.json();
                if (response.ok) {
                    setWords(data);
                } else {
                    setErrorMessage(data.message);
                }
            } catch (err) {
                console.error('[fetchWords]', err);
                setErrorMessage('Could not load vocabulary.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchWords();
    }, []);

    // Derived: the visible list after applying the search filter.
    // Recomputed every render - no separate state needed.
    const filteredWords = words.filter(w =>
        w.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.translation.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Add a new word
    const handleAdd = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (newWord.trim() === '' || newTranslation.trim() === '') return;

        setErrorMessage('');
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/vocabulary`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    word: newWord.trim(),
                    translation: newTranslation.trim(),
                }),
            });
            const data = await response.json();

            if (response.ok) {
                // Append the returned row and clear the inputs
                setWords(prev => [...prev, data]);
                setNewWord('');
                setNewTranslation('');
            } else {
                setErrorMessage(data.message);
            }
        } catch (err) {
            console.error('[handleAdd]', err);
            setErrorMessage('Could not add word.');
        }
    };

    // Delete a word by id
    const handleDelete = async (id: number) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/vocabulary/${id}`, {
                method: 'DELETE',
                credentials: 'include',
            });

            if (response.ok) {
                // Keep every word except the deleted one
                setWords(prev => prev.filter(w => w.id !== id));
            } else {
                const data = await response.json();
                setErrorMessage(data.message);
            }
        } catch (err) {
            console.error('[handleDelete]', err);
            setErrorMessage('Could not delete word.');
        }
    };

    return (
        // Centered column, now wider (max-w-4xl) for more breathing room
        <div className="p-8 mx-auto">

            {/* Header with live total count */}
            <div className="mb-6">
                <h1 className="text-3xl font-display text-foreground">Vocabulary</h1>
                <p className="text-muted-foreground">{words.length} words</p>
            </div>

            {/* Search + add form */}
            <form onSubmit={handleAdd} className="flex flex-col gap-3 mb-8">
                <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search word or translation..."
                    className="w-full bg-input border border-border rounded-lg px-4 py-3 focus:outline-none focus:border-primary transition"
                />
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={newWord}
                        onChange={e => setNewWord(e.target.value)}
                        placeholder="Spanish word"
                        className="flex-1 bg-input border border-border rounded-lg px-4 py-3 focus:outline-none focus:border-primary transition"
                    />
                    <input
                        type="text"
                        value={newTranslation}
                        onChange={e => setNewTranslation(e.target.value)}
                        placeholder="Translation"
                        className="flex-1 bg-input border border-border rounded-lg px-4 py-3 focus:outline-none focus:border-primary transition"
                    />
                    <button
                        type="submit"
                        disabled={newWord.trim() === '' || newTranslation.trim() === ''}
                        className="bg-primary text-primary-foreground px-5 py-3 rounded-lg font-medium hover:opacity-90 transition disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        Add word
                    </button>
                </div>
            </form>

            {errorMessage && (
                <p className="text-destructive text-sm mb-4">{errorMessage}</p>
            )}

            {/* Four list states: loading / empty / no-search-match / list */}
            {isLoading ? (
                <div className="flex justify-center py-8">
                    <div className="w-8 h-8 border-4 border-border border-t-primary rounded-full animate-spin"></div>
                </div>
            ) : words.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                    No words yet. Add your first one above.
                </p>
            ) : filteredWords.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                    No words match your search.
                </p>
            ) : (
                <div className="flex flex-col gap-3">
                    {filteredWords.map(word => (
                        <div
                            key={word.id}
                            className="flex items-center justify-between bg-card border border-border rounded-xl p-4"
                        >
                            {/* Word + translation */}
                            <div>
                                <span className="font-display text-lg text-foreground">{word.word}</span>
                                <span className="text-muted-foreground ml-3">{word.translation}</span>
                            </div>

                            {/* Practice stats (from quizzes) + delete */}
                            <div className="flex items-center gap-4">
                                <span className="text-sm text-muted-foreground">
                                    ✓ {word.times_correct} · ✗ {word.times_incorrect}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => handleDelete(word.id)}
                                    className="text-muted-foreground hover:text-destructive transition"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

        </div>
    );
}

export default VocabularyPage;