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

### Cloudflare Pages (Git → main)

El adapter escribe assets en `dist/client` (no en `dist/`). En el proyecto **portafolio-dannycen**:

1. **Settings → Builds** → Output directory: `dist/client`  
   **o** deja que Wrangler use `pages_build_output_dir` del `wrangler.jsonc`.
2. Build command: `npm run build`
3. Node: **22**
4. Para que `/api/*` + D1 funcionen de verdad, el proyecto debe desplegar con Worker (`npx wrangler deploy` como Deploy command / Workers Builds), no solo uploads estáticos.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)
