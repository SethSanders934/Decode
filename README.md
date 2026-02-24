# Decode

**Try it at [decode.sethtsanders.me](https://decode.sethtsanders.me)** — there’s a **Demo** button that walks you through the service so you can see how it works without pasting your own article.

---

Decode helps you understand complex articles. Paste any article text, read it in a side-by-side reader, select paragraphs or highlight passages, and get AI-powered explanations at different depths (ELI5, Standard, Technical). Create an account to save articles and explanations to your history.

## Features

- **Paste & decode** — Paste article text and open the side-by-side reader.
- **Paragraph selection** — Select one or more paragraphs and request an explanation.
- **Highlight “Explain this”** — Select a short passage to get a quick clarification.
- **Explanation depth** — Choose ELI5 (simpler), Standard, or Technical.
- **Accounts & history** — Register or log in to save articles and explanations and access them from any device.
- **Themes & settings** — Multiple themes (Terminal, Typeset, Blueprint, Minimalist Ink, Midnight, Depths, Nebula), font size, line spacing, and more in the Settings panel (gear icon).

## Tech stack

- **Frontend:** React 18, Vite, Tailwind CSS
- **Backend:** Node.js, Express
- **Database:** SQLite (better-sqlite3)
- **AI:** Groq API (Llama 3.3 70B) for streaming explanations and title suggestions
- **Auth:** JWT, bcrypt

## Project structure

```
Decode/
├── client/          # Vite + React frontend
├── server/          # Express API, SQLite, Groq
├── DEPLOY.md        # Deployment notes (Railway, Vercel)
└── README.md
```

## Running locally

### Prerequisites

- Node.js 18+
- npm

### Setup

1. **Clone the repo**

   ```bash
   git clone https://github.com/SethSanders934/Decode.git
   cd Decode
   ```

2. **Install dependencies**

   ```bash
   npm install
   cd client && npm install && cd ..
   cd server && npm install && cd ..
   ```

3. **Backend environment**

   Create `server/.env` with:

   ```
   GROQ_API_KEY=your_groq_api_key
   JWT_SECRET=your_long_random_secret
   ```

   Get a Groq API key at [console.groq.com](https://console.groq.com). For `JWT_SECRET`, use a long random string (e.g. `openssl rand -hex 32`).

4. **Run the app**

   ```bash
   npm run dev
   ```

   This starts the API server (default port 3001) and the Vite dev server (default port 5173). Open [http://localhost:5173](http://localhost:5173).

### Other scripts

- `npm run build` — Build the client for production.
- `npm start` — Run only the server (after building the client if needed).

## Deployment

The app is set up for:

- **Frontend:** Vercel (root directory `client`), with optional custom domain (e.g. decode.sethtsanders.me).
- **Backend:** Railway (root directory `server`, port from `process.env.PORT`).

See **DEPLOY.md** for step-by-step deployment and environment variables.

## License

Private / unlicensed.
