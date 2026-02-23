# Running Decode

## 1. Add your Groq API key (required for explanations)

1. Get a free key: https://console.groq.com/
2. In the **Decode** folder, open the **server** folder.
3. Copy the file **.env.example** and rename the copy to **.env**.
4. Open **.env** in a text editor and replace `paste_your_groq_api_key_here` with your actual key. Save.

Your `.env` should look like (with your real key):

```
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxx
```

## 2. Start the app

In Cursor (or any terminal), from the **Decode** project folder, run:

```
npm run dev
```

Wait until you see:

- `Decode server running at http://localhost:3001`
- Either `GROQ_API_KEY is set – explanations should work.` or a message saying the key is missing

Then open in your browser: **http://localhost:5173**

## 3. If you see "Failed running 'index.js'"

That usually means the server crashed. After the change above, the server should **no longer crash** when the key is missing; it will start and print a message telling you to add the key.

If it still crashes, look at the **red error text** in the same terminal window just above "Failed running 'index.js'" – that line will say what went wrong.

## 4. If explanations still show "500 — No details"

- Make sure you added **.env** in the **server** folder (not just the project root) with a valid **GROQ_API_KEY**.
- Restart: stop the running app (Ctrl+C in the terminal) and run `npm run dev` again.
- Then try again: paste text → Decode → click a paragraph. The error message should now say something like "GROQ_API_KEY is missing" or the real Groq error.
