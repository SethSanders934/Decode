# Decode server

## The ECANCELED error (fixed)

That error came from **Node’s watch mode** (`node --watch`). While the server was restarting, it tried to read files that were being updated, and the read was canceled. So the server kept crashing on startup.

**Fix:** The dev script no longer uses `--watch`. The server runs once when you start it. If you change server code, stop it (Ctrl+C) and run `npm run dev` again from the project root.

## Will this happen when I publish?

Usually no. On a real host you run `node index.js` (or `npm start`) without watch mode, so this race doesn’t happen. The problem was specific to local dev with `--watch`.

## .env file

The file **`.env`** in this folder (`server/.env`) **exists** and contains your Groq API key. Some systems hide files whose names start with a dot.

- **Mac:** In Finder, open the `server` folder, then press **Cmd + Shift + .** to show hidden files. You should see `.env`.
- **Cursor / VS Code:** In the file tree, the `server` folder should show `.env`; if not, use “Open File” and go to `Decode/server/.env`.

The server loads `server/.env` automatically when it starts. You don’t need to create or edit it unless you want to change the key.
