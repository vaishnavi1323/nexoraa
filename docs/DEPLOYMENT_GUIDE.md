# 🌐 Nexora Deployment Guide: Vercel & Render

Nexora is designed for clean, decoupled deployment:
- **Frontend:** Edge-deployed SPA on **Vercel**
- **Backend:** Node.js Web Service on **Render** (or Docker container)

---

## 1. Deploying the Backend on Render

### Option A: Using the Render Blueprint (`render.yaml`)
1. Push this repository to GitHub (`https://github.com/shiivuuu/hachk`).
2. Log in to [Render Dashboard](https://dashboard.render.com).
3. Click **New +** -> **Blueprint**.
4. Connect the repository `shiivuuu/hachk`. Render will automatically detect `render.yaml` and configure the web service:
   - **Service Name:** `nexora-backend`
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Environment Variables:**
     - `NODE_ENV=production`
     - `PORT=10000`
     - `JWT_SECRET=(auto-generated)`
5. Click **Apply**. The backend will build, auto-seed the SQLite database via `postinstall`, and launch.
6. Note your Render service URL: e.g., `https://nexora-backend.onrender.com`.

### Option B: Manual Web Service Setup on Render
1. In Render, select **New Web Service**.
2. Connect repo `shiivuuu/hachk`.
3. Set **Root Directory** to `backend`.
4. Set **Runtime** to `Node`.
5. Set **Build Command** to:
   ```bash
   npm install && npm run seed
   ```
6. Set **Start Command** to:
   ```bash
   npm start
   ```
7. Under **Advanced** -> **Health Check Path**, enter `/api/health`.
8. Click **Create Web Service**.

---

## 2. Deploying the Frontend on Vercel

### Step-by-Step Vercel Deployment:
1. Log in to [Vercel Dashboard](https://vercel.com).
2. Click **Add New...** -> **Project**.
3. Import your GitHub repository `shiivuuu/hachk`.
4. Configure Project Settings:
   - **Framework Preset:** `Vite`
   - **Root Directory:** `frontend` (Click edit and select `frontend`)
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
5. **Environment Variables:**
   Add one environment variable:
   - `VITE_API_URL` = `https://<your-render-backend-url>/api`  
     *(e.g., `https://nexora-backend.onrender.com/api`)*
6. Click **Deploy**. Vercel will build and deploy the frontend in ~20 seconds.

### Single-Repository Vercel Deployment (Alternative):
If you deploy from the root directory without changing Root Directory in Vercel settings, the included root `vercel.json` will automatically route the build:
```json
{
  "buildCommand": "cd frontend && npm install && npm run build",
  "outputDirectory": "frontend/dist",
  "framework": "vite"
}
```

---

## 3. Local Development & Testing

To run both services locally on your development machine:

### Terminal 1: Backend
```bash
cd backend
npm install
npm run seed     # Seeds realistic demo users, resources, and bookings
npm start        # Launches backend on http://localhost:5000
```

### Terminal 2: Frontend
```bash
cd frontend
npm install
npm run dev      # Launches frontend on http://localhost:5173
```

Open `http://localhost:5173` in your browser. All API requests will automatically route to `http://localhost:5000/api`.
