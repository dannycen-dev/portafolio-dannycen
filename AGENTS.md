## Development

Local app URL (fixed — never change ports between runs):

```
http://127.0.0.1:4329
```

When starting the dev server, use background mode on that port only:

```
astro dev --background --host 127.0.0.1 --port 4329
```

Or: `npm run dev` (already pinned to `127.0.0.1:4329`).

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

If something else is already listening on 4329, stop that process and reuse 4329 — do **not** open 4330, 4331, 4322, etc.

Port **4321** is often used by other local projects (e.g. Ignia); this portfolio must stay on **4329**.

## Production domain

Canonical site: **https://dannydev.space**

Copy env templates before local Cloudflare work:

```
cp .env.example .env
cp .dev.vars.example .dev.vars
```

## Cloudflare (Pages / Workers + D1)

```
npm run db:create          # once — paste database_id into wrangler.jsonc
npm run db:migrate:local   # local D1 schema
npm run db:migrate         # remote D1 schema
npm run deploy             # astro build + wrangler deploy
```

Secrets (GCP OAuth for Calendar + Gmail):

```
npx wrangler secret put GOOGLE_CLIENT_ID
npx wrangler secret put GOOGLE_CLIENT_SECRET
npx wrangler secret put GOOGLE_REFRESH_TOKEN
```

API routes: `/api/health/`, `/api/messages/`, `/api/bookings/`

### Cloudflare Deploy (Worker + assets + D1)

Worker: **dannydev-portfolio** (Astro adapter + D1 `dannydev-contact`).

```bash
npm run build && npx wrangler deploy
```

Sitio + API same-origin: `https://dannydev-portfolio.dannycen-dev.workers.dev` (y luego dominio custom).

#### Panel — Workers Builds (push a `main`)

1. **Workers & Pages** → Worker **dannydev-portfolio** (tras el primer `wrangler deploy`).
2. **Settings → Builds** → Connect repository `portafolio-dannycen`:
   - Branch: `main`
   - Build command: `npm run build`
   - Deploy command: `npx wrangler deploy`
   - Node: **22**
3. En el proyecto Pages **portafolio-dannycen**: **Settings → Builds** → desactiva auto-deploy (evita doble publish estático sin SSR).
4. Dominio: **Workers → dannydev-portfolio → Custom Domains** → `dannydev.space` (cuando el DNS esté listo).
5. Secrets (cuando tengas OAuth): `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REFRESH_TOKEN`.

El adapter escribe HTML en `dist/client`. `prepare-pages` también copia a `dist/` por si el proyecto Pages estático sigue activo un rato.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)
