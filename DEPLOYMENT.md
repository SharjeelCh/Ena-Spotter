# Deployment Guide: Ena-Spotter

## Architecture
- **Backend**: Django 6.0 on PythonAnywhere (free tier)
- **Frontend**: React 19 + Vite on Vercel (Node.js)
- **Database**: SQLite

## Backend Hosting on PythonAnywhere

PythonAnywhere is a practical free option for Django apps that are not too heavy. It supports a free tier and is much simpler than trying to force a container platform to work without billing.

### 1. Create a PythonAnywhere account
- Go to [pythonanywhere.com](https://www.pythonanywhere.com/)
- Sign up for a free account
- Open the Web tab after login

### 2. Get the backend project onto PythonAnywhere
In PythonAnywhere, create a new web app and choose:
- Python 3.11
- Manual configuration

Then open the Bash console and clone your repository directly:

```bash
git clone https://github.com/SharjeelCh/Ena-Spotter.git
```

If you already have the repo, change into the backend folder:

```bash
cd Ena-Spotter/backend
```

### 3. Configure the web app
Set the WSGI file to your Django project and point it to:

```python
import os
import sys

path = '/home/your-username/Ena-Spotter/backend'
if path not in sys.path:
    sys.path.insert(0, path)

os.environ['DJANGO_SETTINGS_MODULE'] = 'config.settings'

from django.core.wsgi import get_wsgi_application
application = get_wsgi_application()
```

### 4. Install dependencies
In the PythonAnywhere Bash console, run:

```bash
cd /home/your-username/Ena-Spotter/backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

If you still see a warning about `dj-rest-auth`, ignore it unless your app imports that package. Your project does not need it.

### 5. Set environment variables
In the PythonAnywhere Web tab, add:

```env
DEBUG=False
SECRET_KEY=replace-with-a-secret
ALLOWED_HOSTS=localhost,127.0.0.1,your-username.pythonanywhere.com
CORS_ALLOWED_ORIGINS=http://localhost:5173,https://ena-spotter-git-main-sharjeel-fida-chs-projects.vercel.app
```

### 6. Reload the web app
After saving the config, click **Reload** in PythonAnywhere.

Your API will be available at:

```text
https://your-username.pythonanywhere.com/api/plan-trip/
```

---

## Frontend Deployment (Vercel)

### 1. Environment Configuration
Create `frontend/.env.production`:
```
VITE_API_URL=https://your-username.pythonanywhere.com/api
```

The frontend already uses this env var name in `frontend/src/App.jsx`:
```javascript
const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';
// Then use: `${API_URL}/plan-trip/`
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
| `backend/Dockerfile` | Docker config for Fly.io deployment |
| `backend/fly.toml` | Fly.io app configuration |
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

### Backend is not reachable
- Confirm the PythonAnywhere web app is reloaded
- Verify the domain is correct: `https://your-username.pythonanywhere.com/api/plan-trip/`
- Check the web app error logs in PythonAnywhere

### CORS errors in browser
- Frontend URL must be in backend's `CORS_ALLOWED_ORIGINS`
- Use `https://ena-spotter-git-main-sharjeel-fida-chs-projects.vercel.app`

### API returns 404
- Confirm the URL ends with `/api/plan-trip/`
- Check Django `config/urls.py` routes `/api/` correctly

### SQLite issues
- SQLite should work fine for this use case
- If issues arise, migrate to PostgreSQL later

---

## Next Steps

1. **Create the PythonAnywhere web app**
2. **Upload the backend project**
3. **Set the Django environment variables**
4. **Update frontend** `.env.production` with the PythonAnywhere URL
5. **Deploy frontend** (Vercel)
6. **Test end-to-end**

---

## CI/CD

Vercel auto-deploys the frontend on `git push main`.
The Django backend is hosted on PythonAnywhere.
