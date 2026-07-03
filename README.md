# kb0tll

## Public calendar backend

Calendar events are served by a FastAPI app in `backend/`. In production, set
`DATABASE_URL` to a Neon Postgres connection string. For local development
without `DATABASE_URL`, the backend falls back to a SQLite database in
`backend/data/`.

For local development, run the backend and frontend in separate terminals:

```sh
cd backend
poetry install --no-root
poetry run uvicorn app.main:app --reload
```

```sh
cd frontend
npm start
```

The Angular dev server proxies `/api` requests to `http://localhost:8000`.

For Render, create a Python web service with:

```sh
root directory: backend
build command: pip install poetry && poetry install --no-root
start command: poetry run uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

If Render logs show `gunicorn your_application.wsgi`, open the Render service
settings and replace the Start Command with the `poetry run uvicorn` command
above. That default command is for Django-style WSGI apps, not this FastAPI app.

Set `DATABASE_URL` from Neon, `ADMIN_TOKEN` to a long private value, and
`CORS_ALLOWED_ORIGINS` to your public frontend origin, for example
`https://your-site.vercel.app`.
