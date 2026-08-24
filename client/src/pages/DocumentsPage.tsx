import { useState, useEffect, type ChangeEvent } from 'react';
import type { Document, DocumentQuestion } from '../types';

function DocumentsPage() {
    // ----- List state -----
    const [documents, setDocuments] = useState<Document[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');

    // ----- Upload state -----
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    // ----- Detail view state -----
    // null = list view; a document = detail view (with its extracted_text)
    const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);


    // ----- Questions state -----
    const [questions, setQuestions] = useState<DocumentQuestion[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);

    // Load the document list once on mount (metadata only - no extracted text)
    useEffect(() => {
        const fetchDocuments = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/documents`, {
                    credentials: 'include',
                });
                const data = await response.json();
                if (response.ok) {
                    setDocuments(data);
                } else {
                    setErrorMessage(data.message);
                }
            } catch (err) {
                console.error('[fetchDocuments]', err);
                setErrorMessage('Could not load documents.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchDocuments();
    }, []);

    // Store the file the user picked (file inputs aren't controlled - read from onChange)
    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            setErrorMessage('');
        }
    };

    // Upload the picked file using multipart FormData (not JSON)
    const handleUpload = async () => {
        if (!selectedFile) return;

        setErrorMessage('');
        setIsUploading(true);

        // Files can't go in JSON - build a FormData container instead
        const formData = new FormData();
        formData.append('file', selectedFile);   // key MUST match multer's upload.single("file")

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/documents`, {
                method: 'POST',
                credentials: 'include',
                body: formData,          // pass FormData directly - no JSON.stringify
                // NO Content-Type header - the browser sets multipart + boundary automatically
            });
            const data = await response.json();

            if (response.ok) {
                setDocuments(prev => [data, ...prev]);   // prepend the new row
                setSelectedFile(null);                   // clear the picker
            } else {
                setErrorMessage(data.message);
            }
        } catch (err) {
            console.error('[handleUpload]', err);
            setErrorMessage('Could not upload file.');
        } finally {
            setIsUploading(false);
        }
    };

    // Open a document - fetches the full version (which includes extracted_text)
    const handleOpen = async (id: number) => {
        setErrorMessage('');
        setQuestions([]);         // clear questions from any previously-opened doc
    

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/documents/${id}`, {
                credentials: 'include',
            });
            const data = await response.json();

            if (response.ok) {
                setSelectedDoc(data);   // storing this flips us to the detail view
            } else {
                setErrorMessage(data.message);
            }
        } catch (err) {
            console.error('[handleOpen]', err);
            setErrorMessage('Could not open document.');
        } 
    };

    // Delete a document
    const handleDelete = async (id: number) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/documents/${id}`, {
                method: 'DELETE',
                credentials: 'include',
            });

            if (response.ok) {
                setDocuments(prev => prev.filter(doc => doc.id !== id));
                // If we deleted the doc we're currently viewing, return to the list
                if (selectedDoc?.id === id) {
                    setSelectedDoc(null);
                }
            } else {
                const data = await response.json();
                setErrorMessage(data.message);
            }
        } catch (err) {
            console.error('[handleDelete]', err);
            setErrorMessage('Could not delete document.');
        }
    };

    // Generate AI comprehension questions from the open document (JSON POST, not a file)
    const handleGenerateQuestions = async () => {
        if (!selectedDoc) return;

        setErrorMessage('');
        setIsGenerating(true);

        try {
            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/documents/${selectedDoc.id}/questions`,
                {
                    method: 'POST',
                    credentials: 'include',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ questionCount: 5 }),
                }
            );
            const data = await response.json();

            if (response.ok) {
                setQuestions(data.questions);
            } else {
                setErrorMessage(data.message);
            }
        } catch (err) {
            console.error('[handleGenerateQuestions]', err);
            setErrorMessage('Could not generate questions.');
        } finally {
            setIsGenerating(false);
        }
    };

    // Bytes -> human-readable ("1.2 MB", "845 KB"). File sizes are base-1024.
    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    return (
        <div className="p-8  mx-auto">

            {/* Header - shown in both views */}
            <div className="mb-8">
                <h1 className="text-3xl font-display text-foreground">Documents</h1>
                <p className="text-muted-foreground">Upload Spanish texts and practice reading</p>
            </div>

            {errorMessage && (
                <p className="text-destructive text-sm mb-4">{errorMessage}</p>
            )}

            {/* View switch: a selected doc = detail view, otherwise the list */}
            {selectedDoc ? (

                /* ---------- DETAIL VIEW ---------- */
                <div>
                    {/* Back button + filename + meta */}
                    <div className="flex items-start gap-4 mb-8">
                        <button
                            type="button"
                            onClick={() => setSelectedDoc(null)}   // null -> back to list
                            className="shrink-0 w-10 h-10 rounded-full border border-border flex items-center justify-center hover:bg-muted transition"
                            aria-label="Back to list"
                        >
                            ←
                        </button>
                        <div>
                            <h2 className="font-display text-2xl text-foreground">{selectedDoc.filename}</h2>
                            <p className="text-muted-foreground text-sm">
                                {selectedDoc.file_type.toUpperCase()} · {formatFileSize(selectedDoc.file_size)} · Uploaded {new Date(selectedDoc.created_at).toLocaleDateString()}
                            </p>
                        </div>
                    </div>

                    {/* Extracted text - scrolls internally so long docs don't stretch the page */}
                    <p className="text-xs font-semibold tracking-wider text-muted-foreground mb-2">EXTRACTED TEXT</p>
                    <div className="bg-card border border-border rounded-2xl p-6 mb-6 max-h-96 overflow-y-auto">
                        <p className="text-foreground whitespace-pre-wrap leading-relaxed">
                            {selectedDoc.extracted_text}
                        </p>
                    </div>

                    {/* Generate questions */}
                    <button
                        type="button"
                        onClick={handleGenerateQuestions}
                        disabled={isGenerating}
                        className="bg-gradient-to-r from-primary to-primary-light text-primary-foreground px-6 py-3 rounded-xl font-medium hover:opacity-90 transition disabled:opacity-60 disabled:cursor-not-allowed mb-8"
                    >
                        {isGenerating ? 'Generating...' : 'Generate comprehension questions'}
                    </button>

                    {/* Questions - only render once generated. Correct answer is highlighted
                        (these are a study aid, not an interactive quiz - so they're divs, not buttons) */}
                    {questions.length > 0 && (
                        <div className="flex flex-col gap-6">
                            {questions.map((q, index) => (
                                <div key={index} className="bg-card border border-border rounded-2xl p-6">
                                    <p className="font-medium text-foreground mb-4">
                                        {index + 1}. {q.question}
                                    </p>
                                    <div className="grid grid-cols-2 gap-3">
                                        {q.options.map(option => (
                                            <div
                                                key={option}
                                                className={`px-4 py-3 rounded-xl border ${
                                                    option === q.correctAnswer
                                                        ? 'border-primary bg-primary/10 text-primary font-medium'
                                                        : 'border-border text-foreground'
                                                }`}
                                            >
                                                {option}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            ) : (

                /* ---------- LIST VIEW ---------- */
                <div>
                    {/* Upload drop zone - a <label> wrapping a hidden file input.
                        Clicking anywhere on the label opens the file picker. */}
                    <label className="block bg-card border-2 border-dashed border-border rounded-2xl p-10 text-center cursor-pointer hover:border-primary transition mb-8">
                        <input
                            type="file"
                            accept=".pdf,.docx,.txt"
                            onChange={handleFileChange}
                            className="hidden"
                        />
                        <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
                            ↑
                        </div>
                        <p className="font-display text-xl text-foreground mb-1">
                            {/* Shows the picked filename, or the prompt if nothing's chosen yet */}
                            {selectedFile ? selectedFile.name : 'Choose a file or drag it here'}
                        </p>
                        <p className="text-muted-foreground text-sm">PDF, DOCX, or TXT up to 20 MB</p>
                    </label>

                    {/* Upload button - only appears once a file is picked */}
                    {selectedFile && (
                        <button
                            type="button"
                            onClick={handleUpload}
                            disabled={isUploading}
                            className="w-full bg-gradient-to-r from-primary to-primary-light text-primary-foreground py-3 rounded-xl font-medium hover:opacity-90 transition disabled:opacity-60 disabled:cursor-not-allowed mb-8"
                        >
                            {isUploading ? 'Uploading...' : `Upload ${selectedFile.name}`}
                        </button>
                    )}

                    {/* Document list - three states: loading / empty / list */}
                    {isLoading ? (
                        <div className="flex justify-center py-8">
                            <div className="w-8 h-8 border-4 border-border border-t-primary rounded-full animate-spin"></div>
                        </div>
                    ) : documents.length === 0 ? (
                        <p className="text-muted-foreground text-center py-8">
                            No documents yet. Upload your first one above.
                        </p>
                    ) : (
                        <div className="flex flex-col gap-3">
                            {documents.map(doc => (
                                // Whole card is clickable to open the document
                                <div
                                    key={doc.id}
                                    className="flex items-center justify-between bg-card border border-border rounded-xl p-4 hover:border-primary transition cursor-pointer"
                                    onClick={() => handleOpen(doc.id)}
                                >
                                    <div>
                                        <p className="font-display text-lg text-foreground">{doc.filename}</p>
                                        <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                                            <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs font-medium">
                                                {doc.file_type.toUpperCase()}
                                            </span>
                                            <span>{formatFileSize(doc.file_size)}</span>
                                            <span>{new Date(doc.created_at).toLocaleDateString()}</span>
                                        </div>
                                    </div>

                                    {/* stopPropagation stops this click from also triggering
                                        the card's open handler */}
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDelete(doc.id);
                                        }}
                                        className="text-muted-foreground hover:text-destructive transition px-2"
                                        aria-label="Delete document"
                                    >
                                        Delete
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

        </div>
    );
}

export default DocumentsPage;