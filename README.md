# EspañolAI 🇪🇸
> An AI-powered Spanish learning platform for conversation practice, grammar correction, vocabulary building, and document-based comprehension.

---

## Features

- **AI Chat Tutor** — Natural Spanish conversations with built-in mistake correction. Responds in English by default for learning, switches to full Spanish when you ask to chat. Corrects mistakes with depth tailored to the word type (verbs, nouns, adjectives, pronouns, prepositions, etc.)
- **Vocabulary Tracker** — Save Spanish words and translations, track your performance over time
- **AI-Generated Quizzes** — Multiple-choice quizzes drawn from your weakest words, with smart distractor generation
- **Document Practice** — Upload a Spanish PDF, DOCX, or TXT and get AI-generated comprehension questions to test understanding
- **Conversation History** — Browse past chat sessions and review corrections to track improvement over time

---

## Tech Stack

**Frontend** *(in progress)*
- React (Vite)
- TypeScript
- Tailwind CSS

**Backend**
- Node.js + Express.js
- TypeScript
- PostgreSQL (via Supabase)
- AWS S3 (document storage)
- Multer (file upload handling)
- pdf-parse + mammoth (PDF/DOCX text extraction)
- Zod (input validation)
- JWT (authentication via httpOnly cookies)
- bcrypt (password hashing)
- Nodemailer (email verification + password reset)
- Winston + Morgan (logging)
- express-rate-limit (brute-force protection)

**AI**
- Google Gemini API (chat, quiz generation, document Q&A)

**Deployment** *(planned)*
- Vercel (frontend)
- Render (backend)

---

## Status

🟢 Backend complete  
🟡 Frontend in development  
⚪ Deployment pending
