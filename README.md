# Portfolio

Personal portfolio site built with Astro.

## Local development

```bash
npm install
npm run dev
```

## Production (Docker)

```bash
docker compose up -d --build
```

Requires Caddy proxy on `proxy_net` for HTTPS. Frontend and backend are exposed internally only.

## Deploy

Push to `main` triggers GitHub Actions → SSH to server → `git pull` + `docker compose up -d --build`.

Secrets: `SERVER_HOST`, `SERVER_USER`, `SSH_PRIVATE_KEY`, `DEPLOY_PATH`


allright..
