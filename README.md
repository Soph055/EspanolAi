# EspañolAI 🇪🇸

An AI-powered Spanish learning platform that adapts to how you speak, what you read, and where you get stuck. Practice conversation with an AI tutor, track your vocabulary, test yourself with auto-generated quizzes, and turn any Spanish document into a reading exercise.

**Live demo:** https://espanolai-frontend.vercel.app

> ⏳ The backend runs on Render's free tier, which sleeps after inactivity — the first request may take 30–60 seconds to wake up. Subsequent requests are fast.

---

## Screenshots

> Replace these with your own images. Put files in a `screenshots/` folder at the repo root and the links below will resolve.

### Landing page
![Landing page](screenshots/landing.png)

### Dashboard
![Dashboard](screenshots/dashboard.png)

### AI Chat Tutor
![Chat tutor](screenshots/chat.png)

### Vocabulary
![Vocabulary](screenshots/vocabulary.png)

### Quiz
![Quiz](screenshots/quiz.png)

### Documents
![Documents](screenshots/documents.png)

---

## Features

- **AI Chat Tutor** — Real-time conversational practice powered by Google Gemini. Create multiple conversations, each with full message history.
- **Vocabulary Tracker** — Save words and translations, search your collection instantly, and see per-word practice stats.
- **AI-Generated Quizzes** — Multiple-choice quizzes built from your own vocabulary. The server scores answers so results can't be faked client-side.
- **Document Practice** — Upload a PDF, DOCX, or TXT, read the extracted text, and generate AI comprehension questions from it.
- **Dashboard** — At-a-glance view of your word count, documents, and recent conversations.
- **Full authentication** — Registration with email verification, login, and password reset, all secured with JWTs in httpOnly cookies.

---

## Tech Stack

**Frontend**
- React + TypeScript
- Vite
- Tailwind CSS
- React Router

**Backend**
- Node.js + Express (TypeScript)
- PostgreSQL (hosted on Supabase)
- JWT authentication via httpOnly cookies
- Zod for request validation

**External services**
- Google Gemini — AI chat, quiz, and question generation
- AWS S3 — document storage
- Nodemailer — email verification and password reset

**Deployment**
- Frontend on Vercel
- Backend on Render
- A Vercel reverse proxy routes `/api/*` to the backend, keeping requests same-origin (so auth cookies work across browsers, including Safari's stricter cookie policies)

---

## Architecture
Browser
│
▼
Vercel (React frontend + /api/* reverse proxy)
│
▼
Render (Express API)
│
├──▶ Supabase (PostgreSQL)
├──▶ AWS S3 (document files)
└──▶ Google Gemini (AI)


Auth uses a JWT stored in an httpOnly cookie, so the token is never exposed to JavaScript. Protected routes on the frontend check auth status via a `/auth/me` endpoint before rendering.

---

## Running locally

### Prerequisites
- Node.js 18+
- A PostgreSQL database
- Google Gemini API key, AWS S3 bucket, and an email account for Nodemailer

### Backend

```bash
cd server
npm install
```

Create a `server/.env` file:
DB_URL=your_postgres_connection_string
DB_PASSWORD=your_db_password
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=your_gemini_key
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
AWS_REGION=your_region
S3_BUCKET=your_bucket_name
EMAIL_USER=your_email
EMAIL_PASS=your_email_app_password
FRONTEND_URL=http://localhost:5173
NODE_ENV=development


Then:

```bash
npm run dev
```

The API runs on `http://localhost:3000`.

### Frontend

```bash
cd client
npm install
```

Create a `client/.env` file:
VITE_API_URL=http://localhost:3000

Then:

```bash
npm run dev
```

The app runs on `http://localhost:5173`.

---

## Project Structure
EspanolAi/
├── client/ # React + Vite frontend
│ ├── src/
│ │ ├── components/ # Shared UI (layout, icons, ProtectedRoute)
│ │ ├── context/ # AuthContext
│ │ ├── pages/ # Login, Chat, Vocabulary, Quiz, Documents, Dashboard, etc.
│ │ ├── types/ # Shared TypeScript interfaces
│ │ └── App.tsx # Routes
│ └── vercel.json # /api/* reverse proxy config
│
└── server/ # Express + TypeScript backend
├── controllers/ # Route handlers
├── routes/ # Auth, chat, vocabulary, quiz, documents
├── middleware/ # Auth + file upload
└── index.ts # App entry

---

## Notes

This project was built as a full-stack learning exercise, covering everything from JWT auth and cross-origin cookie handling to AI integration and production deployment. The backend was built first, followed by the React frontend from the ground up.
