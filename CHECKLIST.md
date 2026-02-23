# Decode – step-by-step check

## Step 1: Start the app

1. In Cursor, open the **Decode** folder (the one that has `package.json` in it).
2. Open the terminal (Terminal → New Terminal, or the panel at the bottom).
3. Type: `npm run dev` and press Enter.
4. Wait until you see two lines:
   - Something like `VITE ready` and `Local: http://localhost:5173`
   - `Decode server running at http://localhost:3001`
5. If you see **"Failed running 'index.js'"** instead, look at the **red error line** just above it and tell me what it says.

## Step 2: Open the app in your browser

1. In your browser, go to: **http://localhost:5173** (or **http://localhost:5174** if Vite said 5173 was in use).
2. You should see the Decode page with a big text box.

**Why 5173 (or 5174) and not 3001?**  
`npm run dev` starts **two** things: the **API** on port 3001 and the **app** on port 5173. You only open the app in the browser (5173). The app then talks to the API behind the scenes. If 5173 is already taken (e.g. a previous run didn’t fully close), Vite will use 5174 instead—use whichever URL Vite prints (e.g. `Local: http://localhost:5174`).

## Step 3: Check the Status box

1. Look at the **bottom-right corner** of the page. There is a small **Status** box.
2. It should show:
   - **Server: OK** (green)
   - **Groq key: Set** (green)
   - **Groq test: OK** (green)
3. If anything is red or says "Failed" or "Error":
   - Click **"Check again"** in that box.
   - If **Server** is Failed: the backend is not running. Go back to Step 1 and make sure both lines (Vite and "Decode server running") appear.
   - If **Groq key** is Not set: the file `server/.env` should exist with one line: `GROQ_API_KEY=gsk_...` (the key is already in that file in your project).
   - If **Groq test** is Error: the Status box shows the error message. Copy that message if you need to fix it or share it.

## Step 4: Try an explanation

1. Paste a few paragraphs of text into the big box and click **Decode**.
2. Click any paragraph on the left.
3. An explanation should appear on the right. If it doesn’t, the **Last API error** line in the right-hand panel will show what went wrong.

---

**Files that exist in your project (for reference):**

- `package.json` (in the Decode folder) – run `npm run dev` from here.
- `server/.env` – contains your Groq API key; the server reads this automatically.
- The Status box is part of the app; it appears on every page at the bottom right.
