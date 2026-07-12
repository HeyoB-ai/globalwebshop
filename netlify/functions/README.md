# Netlify Functions — creative generation

Two Netlify Functions (v2, web-standard `Request`/`Response`) back the
"laat AI ontwerpen" tab of the creative modal:

- **`generate-creative.mjs`** — `POST { prompt, aspectRatio }` → `{ jobId, status: "queued" }`.
- **`creative-status.mjs`** — `POST { jobId }` → `{ status: "in_progress" }` for the
  first ~3.5s, then `{ status: "completed", imageUrl }` where `imageUrl` is a
  server-rendered SVG poster as a `data:image/svg+xml;base64,…` data-URI.

## This is MOCK mode (Higgsfield step 1)

Right now there is **no external call, no API key, no credits, no storage**. The
whole job is encoded in the (stateless) `jobId`; the "result" is an SVG the
server draws from the prompt. This step only proves the flow works end-to-end:

> button → serverfunctie → resultaat → mand

## What comes in step 2 (the real Higgsfield call)

The real Higgsfield generation will live behind an **`HF_MODE=live`** switch:

- `HF_MODE` unset / `mock` (default) → today's mock behaviour above.
- `HF_MODE=live` → `generate-creative` calls Higgsfield to start a real job and
  `creative-status` polls the real job, returning the produced image URL.

Credentials will be provided **only** as Netlify **environment variables**:

- `HF_API_KEY`
- `HF_API_SECRET`

These are read at runtime via `process.env` inside the functions. They must
**never** be committed to the code or to git. `.env`, `.env.*` and `.netlify/`
are already in `.gitignore`; set the real values in the Netlify UI
(Site settings → Environment variables) or a local, untracked `.env`.

## Running locally

```bash
npm run dev:netlify   # Netlify Dev: serves the Vite app + the functions
```

Plain `npm run dev` (Vite only) does not run the functions; the modal then shows
a clear "start met npm run dev:netlify" message instead of failing silently.
