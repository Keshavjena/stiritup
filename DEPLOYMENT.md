# Deployment Guide: Stir It Up

Since Vercel hosts Next.js as serverless functions, it does not support long-running WebSocket connections. To solve this, this guide details how to deploy the **frontend (Vercel)** and **backend (Render or Railway)** separately, allowing the app to run completely free!

---

## 1. Deploy the Backend (WebSocket Server)

We recommend using **Render** or **Railway** to host the Socket.io WebSocket server, as they both offer free/trial tiers that support persistent Node.js servers.

### Using Render (Free Tier)
1. Sign up for a free account at [Render](https://render.com/).
2. Click **New +** and select **Web Service**.
3. Connect your GitHub repository containing the cloned codebase.
4. Configure the service settings:
   - **Name**: `stiritup-backend` (or any name you prefer)
   - **Language**: `Node`
   - **Build Command**: `npm install && npm run build` (or just `npm install` as it only needs to run `server.js`)
   - **Start Command**: `npm start` (which runs `NODE_ENV=production node server.js`)
   - **Instance Type**: `Free`
5. Go to **Environment** under your Render Web Service settings and add:
   - `PORT`: `10000` (Render binds automatically, but setting this is safe)
   - `ALLOWED_ORIGINS`: `https://your-frontend-app.vercel.app` (Replace with your actual Vercel frontend URL after deploying, or set to `*` to allow any domain)
6. Click **Deploy Web Service**.
7. Copy the URL of your deployed backend (e.g., `https://stiritup-backend.onrender.com`).

> [!NOTE]
> **Render Free Tier Caveat:** Free web services spin down (go to sleep) after 15 minutes of inactivity. When a new player first opens the game and tries to connect after a period of inactivity, it might take 30–50 seconds for the backend service to wake up and connect. Once awake, the game works seamlessly.

---

## 2. Deploy the Frontend (Vercel)

Vercel will build and host the user interface, serving static pages and short-lived API routes.

1. Sign up/log in at [Vercel](https://vercel.com/).
2. Click **Add New** > **Project** and import your repository.
3. In the project configuration, under **Environment Variables**, add:
   - **Key**: `NEXT_PUBLIC_SOCKET_SERVER_URL`
   - **Value**: `https://stiritup-backend.onrender.com` (Use the URL of your Render backend copied in Step 1)
   - **Key**: `GROQ_API_KEY`
   - **Value**: `your_groq_api_key_here` (Optional: only if you want to use Groq AI for custom prompt generation)
4. Click **Deploy**.
5. Once deployment is complete, note your Vercel URL (e.g., `https://stiritup.vercel.app`).
6. **Important**: If you set `ALLOWED_ORIGINS` in Step 1, go back to Render, update the environment variable to match this Vercel URL, and re-deploy/restart the Render service.

---

## 3. Local Development

You can still run the entire application locally on a single machine just like before.
1. Run `npm run dev`.
2. Open `http://localhost:3000`.
3. In local development (where `NEXT_PUBLIC_SOCKET_SERVER_URL` is not set in `.env`), the client will automatically default to the local host and port, routing Socket.io connections directly to the local dev server.
