# Deploying Decode: GitHub, Vercel (frontend), Railway (backend)

Using **decode.sethtsanders.me** is the same difficulty as using the root domain. You’ll add one CNAME record for the subdomain. Steps below use the subdomain.

---

## Part 1: Push to GitHub

1. **Create a new repo on GitHub**
   - Go to [github.com/new](https://github.com/new).
   - Name it (e.g. `decode`).
   - Don’t add a README, .gitignore, or license (you already have files).
   - Create the repo.

2. **Initialize git and push (from your Decode project folder)**

   ```bash
   cd /Users/sethsanders/Desktop/Decode
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/decode.git
   git push -u origin main
   ```

   Replace `YOUR_USERNAME` with your GitHub username. If you use SSH: `git@github.com:YOUR_USERNAME/decode.git`.

3. **Confirm**
   - `.env` and `server/.env` are in `.gitignore`, so secrets are not pushed.
   - You’ll set the same secrets in Railway and (if needed) in Vercel.

---

## Part 2: Deploy backend to Railway

1. **Sign up / log in**  
   [railway.app](https://railway.app) (GitHub login is fine).

2. **New project from repo**
   - **New Project** → **Deploy from GitHub repo**.
   - Choose your `decode` repo.
   - Railway will detect the repo and may deploy the root. We’ll point it at the server folder next.

3. **Use the `server` folder**
   - In the new service, open **Settings** (or **Variables**).
   - Set **Root Directory** to: `server`  
     (so Railway runs from the `server` directory).
   - Set **Build Command** to: `npm install`  
     (or leave default if it already runs install).
   - Set **Start Command** to: `node index.js`  
     (or leave default if it’s already `node index.js` / `npm start`).
   - Save.

4. **Environment variables (Railway)**
   - In the same service: **Variables** (or **Environment**).
   - Add:
     - `GROQ_API_KEY` = your Groq API key (same as in local `server/.env`).
     - `JWT_SECRET` = a long random string (e.g. 32+ characters).  
       Example: `openssl rand -hex 32` in a terminal.
   - Save. Railway will redeploy if it’s already deployed.

5. **Public URL**
   - In the service: **Settings** → **Networking** (or **Generate domain**).
   - Create a **Public network** / **Generate domain** so the app gets a URL like:
     - `https://decode-production-xxxx.up.railway.app`
   - Copy this URL (no path), e.g. `https://decode-production-xxxx.up.railway.app`.

6. **Wire the frontend to this URL**
   - Open your project on your machine.
   - Edit **client/vercel.json**.
   - Replace the placeholder URL in `"destination"` with your full Railway URL, e.g.:
     - `"destination": "https://decode-production-xxxx.up.railway.app/api/:path*"`
     - Use the exact URL Railway gives you (with `https://`, no trailing slash).
   - Commit and push:
     ```bash
     git add client/vercel.json
     git commit -m "Point API proxy to Railway URL"
     git push
     ```

---

## Part 3: Deploy frontend to Vercel

1. **Sign up / log in**  
   [vercel.com](https://vercel.com) (GitHub login is fine).

2. **Import project**
   - **Add New** → **Project**.
   - Import the same GitHub repo (`decode`).

3. **Configure build (important)**
   - **Root Directory**: click **Edit** and set to `client`.
   - **Framework Preset**: Vite (should be detected).
   - **Build Command**: `npm run build` (default is fine).
   - **Output Directory**: `dist` (default for Vite).
   - **Install Command**: `npm install` (default).
   - Do **not** add any env vars for the API URL; the proxy in `vercel.json` handles that.
   - Click **Deploy**.

4. **Custom domain (subdomain)**
   - After the first deploy, open the project in Vercel.
   - Go to **Settings** → **Domains**.
   - Add: `decode.sethtsanders.me`.
   - Vercel will show instructions: usually add a **CNAME** record:
     - **Name / host**: `decode` (or `decode.sethtsanders.me` depending on your DNS provider).
     - **Value / target**: `cname.vercel-dns.com` (or the exact value Vercel shows).
   - Save the DNS record at your domain registrar (where you manage sethtsanders.me).

5. **Wait for DNS**
   - It can take a few minutes up to 48 hours. Vercel will show when the domain is verified.
   - After that, **https://decode.sethtsanders.me** will serve your app, and `/api/*` will be proxied to Railway.

---

## Part 4: Quick checklist

| Step | Where | What |
|------|--------|------|
| 1 | GitHub | Create repo, push code (no `.env` committed). |
| 2 | Railway | New project from GitHub, Root Directory = `server`, add `GROQ_API_KEY` and `JWT_SECRET`, generate public URL. |
| 3 | Local | Edit `client/vercel.json`: put your Railway URL in `destination`, then commit and push. |
| 4 | Vercel | Import repo, Root Directory = `client`, deploy. |
| 5 | Vercel | Domains → add `decode.sethtsanders.me`, then add CNAME at your DNS. |

---

## Subdomain vs root domain

- **decode.sethtsanders.me (subdomain)**  
  Add one CNAME: `decode` → `cname.vercel-dns.com`. Same steps as above.

- **sethtsanders.me (root)**  
  You’d point the root domain to Vercel (often an A record to Vercel’s IP or a CNAME/flattening depending on the registrar). Slightly different DNS, but still straightforward. Using a subdomain keeps the root free for something else (e.g. a main site).

---

## If something breaks

- **API 404 / “can’t reach server”**  
  Check that `client/vercel.json` uses your **actual** Railway URL (with `https://`, no trailing slash) and that you pushed the change.

- **CORS errors**  
  With the Vercel proxy, the browser only talks to `decode.sethtsanders.me`; the proxy talks to Railway, so CORS on Railway is not required. If you later change to calling Railway directly from the client, you’d need to allow your frontend origin in the backend.

- **Auth / “Not authenticated”**  
  Users must use the same origin (decode.sethtsanders.me) so cookies/Authorization and the proxy all line up. Don’t mix `localhost` and production in the same flow.

- **Railway “Application failed”**  
  Confirm Root Directory is `server`, Start Command is `node index.js`, and `GROQ_API_KEY` and `JWT_SECRET` are set in Variables.
