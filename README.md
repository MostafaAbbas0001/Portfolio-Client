# Portfolio client

The public site and admin for mostafaabbas.dev: TanStack Start (React, server-side rendered), Tailwind CSS, with content from the .NET API in `../server`.

## Configuration

Copy `.env.example` to `.env` and set values for your environment. Local `.env` files, credentials, caches, and build output are excluded from Git and Docker build contexts.

`client/.env` (not committed):

| Variable              | Used for                                                                                          |
| --------------------- | ------------------------------------------------------------------------------------------------- |
| `VITE_API_BASE_URL`   | API address the browser calls. Baked in at build time.                                            |
| `PUBLIC_API_BASE_URL` | Same value; Docker Compose passes it to the build as `VITE_API_BASE_URL`.                         |
| `SERVER_API_BASE_URL` | API address the site's own server calls (page rendering, project status checks). Read at runtime. |
| `CLIENT_PORT`         | Host port Docker Compose publishes the site on (nginx proxies to it).                             |

Use the scheme the API actually serves: locally the API listens on `http://127.0.0.1:5205`, so `https://` there makes every server-side request fail. Restart `npm run dev` after editing `.env`; a running dev server keeps the old values.

## Development

```sh
npm install
npm run dev      # http://localhost:8080
npm run lint
```

## Production

```sh
npm run build    # writes .output/
npm start        # node .output/server/index.mjs, port 3000
```

On the server, `docker compose up -d --build` builds and runs the same thing from the `Dockerfile`. The nginx site config is in `deploy/nginx/`. Seed setup, admin content controls, and deployment order are documented in `../server/Seed/README.md`.
