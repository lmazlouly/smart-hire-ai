# Docker Deployment

This stack runs:

- Angular frontend served by Nginx on `FRONTEND_PORT`
- Spring Boot backend on `BACKEND_PORT`
- FastAPI AI service on `AI_SERVICE_PORT`
- PostgreSQL with pgvector

## 1. Create the environment file

```bash
cp .env.docker.example .env
```

Edit `.env` and set real values for:

- `POSTGRES_PASSWORD`
- `SECURITY_JWT_SECRET`
- `OPENAI_API_KEY`
- Cloudflare R2 variables if CV/profile upload is needed

## 2. Build and run

```bash
docker compose up -d --build
```

Open:

```text
http://YOUR_SERVER_IP
```

The frontend proxies:

- `/api/*` to the Spring backend
- `/ai/*` to the FastAPI AI service

## 3. Logs

```bash
docker compose logs -f frontend
docker compose logs -f backend
docker compose logs -f ai-service
docker compose logs -f db
```

## 4. Automatic deploy from GitHub

The workflow `.github/workflows/deploy-vps.yml` deploys automatically when `main`
is updated. It connects to the VPS, pulls `origin/main`, rebuilds the Docker
stack, restarts the containers, and prunes unused Docker images.

Required GitHub Actions secrets:

- `VPS_HOST`
- `VPS_USER`
- `VPS_PASSWORD`

The VPS must already contain `/opt/smart-hire-ai/.env` with the real production
values because secrets such as database, R2, and OpenAI keys are not committed to
Git.

## 5. Stop

```bash
docker compose down
```

To also delete the database volume:

```bash
docker compose down -v
```

## Notes

- The database image is `pgvector/pgvector:pg16`.
- The backend creates the `vector` extension and embedding columns on startup.
- For a real domain, put Nginx/Caddy/Traefik in front of `frontend:80` and add TLS.
