import { useState } from 'react';
import type { QuizQuestion } from '../types';

// Trophy icon for the setup + results screens (inline SVG, same approach as the sidebar).
// stroke="currentColor" makes it inherit the parent's text color.
function TrophyIcon({ size = 32 }: { size?: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round"
            strokeLinejoin="round" aria-hidden="true">
            <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
            <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
            <path d="M4 22h16" />
            <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
            <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
            <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
        </svg>
    );
}

function QuizPage() {
    // The three-way switch that drives which screen shows
    const [phase, setPhase] = useState<'setup' | 'taking' | 'results'>('setup');

    // Setup: how many questions the user wants
    const [questionCount, setQuestionCount] = useState(5);
    // Taking: the generated questions
    const [questions, setQuestions] = useState<QuizQuestion[]>([]);
    // Taking: maps question index -> the option the user picked
    const [answers, setAnswers] = useState<Record<number, string>>({});
    // Results: the score summary from the backend (null until submitted)
    const [score, setScore] = useState<{
        totalQuestions: number;
        correctCount: number;
        incorrectCount: number;
        score: string;   // pre-formatted percentage string like "80%"
    } | null>(null);

    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    // Generate a quiz from the user's weak words, then move to the taking phase
    const handleStart = async () => {
        setErrorMessage('');
        setIsLoading(true);
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/quiz`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ questionCount }),
            });
            const data = await response.json();

            if (response.ok) {
                setQuestions(data.questions);
                setAnswers({});          // clear any answers from a previous attempt
                setPhase('taking');
            } else {
                // e.g. "You need at least 5 vocabulary words"
                setErrorMessage(data.message);
            }
        } catch (err) {
            console.error('[handleStart]', err);
            setErrorMessage('Could not start quiz.');
        } finally {
            setIsLoading(false);
        }
    };

    // Record (or overwrite) the answer for one question.
    // ...prev copies existing answers; [questionIndex] uses the variable's value as the key.
    const handleSelect = (questionIndex: number, option: string) => {
        setAnswers(prev => ({ ...prev, [questionIndex]: option }));
    };

    // Submit: send each question's picked answer + correct answer.
    // The backend compares them server-side (so the client can't fake a score).
    const handleSubmit = async () => {
        setErrorMessage('');
        setIsLoading(true);

        const results = questions.map((question, index) => ({
            vocabularyId: question.vocabularyId,
            userAnswer: answers[index],
            correctAnswer: question.correctAnswer,
        }));

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/quiz/result`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ answers: results }),
            });
            const data = await response.json();

            if (response.ok) {
                setScore(data);
                setPhase('results');
            } else {
                setErrorMessage(data.message);
            }
        } catch (err) {
            console.error('[handleSubmit]', err);
            setErrorMessage('Could not submit quiz.');
        } finally {
            setIsLoading(false);
        }
    };

    // Derived: how many questions are answered (for the progress pill + submit guard)
    const answeredCount = Object.keys(answers).length;

    return (
        <div className="p-8 max-w-4xl mx-auto">

            {/* Header - shown in every phase */}
            <div className="mb-8">
                <h1 className="text-3xl font-display text-foreground">Quiz</h1>
                <p className="text-muted-foreground">Practice your Spanish with quick challenges</p>
            </div>

            {/* ---------- SETUP PHASE ---------- */}
            {phase === 'setup' && (
                <div className="bg-card border border-border rounded-2xl p-10 text-center  mx-auto">

                    {/* Trophy badge */}
                    <div className="w-16 h-16 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-6">
                        <TrophyIcon />
                    </div>

                    <h2 className="text-2xl font-display text-foreground mb-2">Daily Spanish Quiz</h2>
                    <p className="text-muted-foreground mb-8">
                        Multiple-choice questions from your weakest words. Answer all of them, then submit to see your score.
                    </p>

                    {/* Question count picker */}
                    <p className="text-sm font-medium text-foreground mb-3">How many questions?</p>
                    <div className="flex justify-center gap-3 mb-8">
                        {[5, 10, 15, 20].map(count => (
                            <button
                                key={count}
                                type="button"
                                onClick={() => setQuestionCount(count)}
                                className={`px-6 py-3 rounded-xl border transition ${
                                    questionCount === count
                                        ? 'border-primary bg-primary/10 text-primary font-medium'
                                        : 'border-border text-foreground hover:bg-muted'
                                }`}
                            >
                                {count}
                            </button>
                        ))}
                    </div>

                    {errorMessage && (
                        <p className="text-destructive text-sm mb-4">{errorMessage}</p>
                    )}

                    <button
                        type="button"
                        onClick={handleStart}
                        disabled={isLoading}
                        className="bg-gradient-to-r from-primary to-primary-light text-primary-foreground px-8 py-3 rounded-xl font-medium hover:opacity-90 transition disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {isLoading ? 'Generating...' : 'Start quiz →'}
                    </button>
                </div>
            )}

            {/* ---------- TAKING PHASE ---------- */}
            {phase === 'taking' && (
                <>
                    {/* Progress pill + submit button */}
                    <div className="flex items-center justify-between mb-6">
                        <span className="bg-primary/10 text-primary text-sm font-medium px-4 py-2 rounded-full">
                            {answeredCount}/{questions.length} answered
                        </span>

                        <button
                            type="button"
                            onClick={handleSubmit}
                            // Enabled only once every question has an answer
                            disabled={isLoading || answeredCount !== questions.length}
                            className="bg-gradient-to-r from-primary to-primary-light text-primary-foreground px-6 py-2.5 rounded-full font-medium hover:opacity-90 transition disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Submitting...' : 'Submit answers ✓'}
                        </button>
                    </div>

                    {errorMessage && (
                        <p className="text-destructive text-sm mb-4">{errorMessage}</p>
                    )}

                    {/* Question cards */}
                    <div className="flex flex-col gap-6">
                        {questions.map((question, index) => (
                            <div key={question.vocabularyId} className="bg-card border border-border rounded-2xl p-6">

                                {/* Number badge + the word being tested */}
                                <div className="flex items-start gap-4 mb-5">
                                    <span className="shrink-0 w-9 h-9 rounded-full bg-primary/10 text-primary font-medium flex items-center justify-center">
                                        {index + 1}
                                    </span>
                                    <div>
                                        <p className="text-muted-foreground text-sm mb-1">Choose the correct translation for</p>
                                        <p className="font-display text-2xl text-foreground">{question.word}</p>
                                    </div>
                                </div>

                                {/* 2x2 options grid */}
                                <div className="grid grid-cols-2 gap-3">
                                    {question.options.map(option => (
                                        <button
                                            key={option}
                                            type="button"
                                            onClick={() => handleSelect(index, option)}
                                            className={`text-left px-4 py-3 rounded-xl border transition ${
                                                answers[index] === option
                                                    ? 'border-primary bg-primary/10 text-primary font-medium'
                                                    : 'border-border text-foreground hover:bg-muted'
                                            }`}
                                        >
                                            {option}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {/* ---------- RESULTS PHASE ---------- */}
            {/* Double guard: results phase AND score is loaded (score is typed | null) */}
            {phase === 'results' && score && (
                <div className="bg-card border border-border rounded-2xl p-10 text-center  mx-auto">

                    <div className="w-16 h-16 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-6">
                        <TrophyIcon />
                    </div>

                    <h2 className="text-2xl font-display text-foreground mb-2">Quiz complete</h2>

                    {/* Big percentage string from the backend */}
                    <p className="text-6xl font-display text-primary my-4">{score.score}</p>

                    {/* Raw count underneath */}
                    <p className="text-muted-foreground mb-8">
                        {score.correctCount} of {score.totalQuestions} correct
                    </p>

                    <button
                        type="button"
                        onClick={() => setPhase('setup')}
                        className="bg-gradient-to-r from-primary to-primary-light text-primary-foreground px-8 py-3 rounded-xl font-medium hover:opacity-90 transition"
                    >
                        Take another quiz
                    </button>
                </div>
            )}

        </div>
    );
}

export default QuizPage;