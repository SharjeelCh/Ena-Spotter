# Deployment Guide: Ena-Spotter

## Architecture
- **Backend**: Django 6.0 on Railway (Python)
- **Frontend**: React 19 + Vite on Vercel (Node.js)
- **Database**: SQLite (persisted on Railway)

## Backend Deployment (Render)

### 1. Create Render Account
- Go to [render.com](https://render.com)
- Sign up with GitHub
- Click "New" → "Web Service"

### 2. Connect Repository
- Select your GitHub repo: `SharjeelCh/Ena-Spotter`
- Set the root directory to `backend`
- Set the build command to:

```
pip install -r requirements.txt
```

- Set the start command to:

```
gunicorn config.wsgi
```

- Choose the **Free** plan

### 3. Configure Environment Variables
In Render dashboard, add the following variables:

```
DEBUG=False
SECRET_KEY=<generate-a-secure-random-string>
ALLOWED_HOSTS=localhost,127.0.0.1,your-app.onrender.com
CORS_ALLOWED_ORIGINS=http://localhost:5173,https://yourdomain.vercel.app
```

**Generate SECRET_KEY** (run once locally):
```bash
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

### 4. After Deployment
- Render provides a domain like `https://your-app.onrender.com`
- Update `CORS_ALLOWED_ORIGINS` with your actual Vercel domain
- Your backend API is now live at `https://your-app.onrender.com/api/plan-trip/`

---

## Frontend Deployment (Vercel)

### 1. Environment Configuration
Create `frontend/.env.production`:
```
VITE_API_BASE_URL=https://ena-spotter-backend.up.railway.app
```

Update `frontend/src/App.jsx` to use:
```javascript
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
// Then use: `${apiBaseUrl}/api/plan-trip/`
```

### 2. Deploy to Vercel
```bash
# Install Vercel CLI
npm install -g vercel

# From project root
vercel --prod
```

Or connect via GitHub:
- Go to [vercel.com](https://vercel.com)
- Import project from GitHub
- Vercel auto-detects frontend folder
- Set build settings: `npm run build`, output: `dist/`

### 3. Vercel automatically handles:
- Vite build optimization
- SPA routing (via `vercel.json` rewrites)
- Deployment to CDN

---

## Key Files

| File | Purpose |
|------|---------|
| `backend/Procfile` | Tells Railway how to run Django |
| `backend/railway.json` | Railway-specific config |
| `backend/requirements.txt` | Python dependencies (auto-generated) |
| `backend/.env.example` | Template for environment variables |
| `backend/config/settings.py` | Updated for production (reads env vars) |
| `frontend/vercel.json` | SPA routing config for Vercel |
| `frontend/.env.production` | Frontend API base URL |

---

## Local Testing

Before deploying, test the full stack locally:

```bash
# Terminal 1: Backend
cd backend
& venv/Scripts/python manage.py runserver

# Terminal 2: Frontend
cd frontend
npm run dev
```

Visit `http://localhost:5173` and verify trip planning works.

---

## Troubleshooting

### Backend deployment fails
- Check Railway **Deployments** tab for build logs
- Ensure all vars in `config/settings.py` use `os.getenv()`
- Verify `requirements.txt` includes `gunicorn`

### CORS errors in browser
- Frontend URL must be in backend's `CORS_ALLOWED_ORIGINS`
- Check Railway **Variables** and update with correct Vercel domain

### API returns 404
- Confirm backend URL is correct: `https://your-railway-domain.up.railway.app/api/plan-trip/`
- Check Django `config/urls.py` routes `/api/` correctly

### SQLite locks on Railway
- SQLite should work fine for this use case
- If issues arise, migrate to PostgreSQL (Railway offers free tier)

---

## Next Steps

1. **Deploy backend first** (Railway)
2. **Note the domain** (e.g., `ena-spotter-backend.up.railway.app`)
3. **Update frontend** `.env.production` with that domain
4. **Deploy frontend** (Vercel)
5. **Update backend** `CORS_ALLOWED_ORIGINS` with Vercel domain
6. **Test end-to-end**

---

## CI/CD

Both Railway and Vercel auto-deploy on `git push main`:
- Merges to `main` trigger automatic rebuilds
- No manual deployment needed after setup
