# Netlify Functions — creative generation

Two Netlify Functions (v2, web-standard `Request`/`Response`) back the
"laat AI ontwerpen" tab of the creative modal:

- **`generate-creative.mjs`** — `POST { prompt, aspectRatio }` → `{ jobId, status }`.
- **`creative-status.mjs`** — `POST { jobId }` → `{ status: "in_progress" }` while
  the job runs, then `{ status: "completed", imageUrl }` (or `{ status: "failed",
  error }`).

Both share `lib/higgsfield.mjs` (in a subdirectory → a bundled library, not a
standalone function).
The client layer (`src/lib/creativeClient.ts`) is identical for mock and live —
only the server decides which path runs, keyed off the `jobId` prefix
(`mock.` vs `live.`).

## The switch: `HF_MODE` (default MOCK)

- `HF_MODE` unset / `mock` **(default)** → MOCK: no external call, no API key, no
  credits, no storage. The job is encoded in the stateless `jobId`; after ~3.5s
  `creative-status` returns a **server-rendered SVG poster** (portrait,
  cobalt/amber house style, prompt text baked in) as a `data:image/svg+xml`
  data-URI.
- `HF_MODE=live` **AND both keys present** → LIVE: a real Higgsfield
  text-to-image generation. If the mode is `live` but a key is missing, the code
  falls back to MOCK — so the app is always safe to run without secrets, even on
  the live site.

## LIVE path (Higgsfield)

- SDK: **`@higgsfield/client`** (v2 entry `@higgsfield/client/v2`), imported
  dynamically **only** inside the live path.
- Model: **Higgsfield "Soul" text-to-image**, endpoint **`/v1/text2image/soul`**
  — chosen as a sensible, general text-to-image model. Override with
  **`HF_IMAGE_MODEL`**.
- `generate-creative` calls `subscribe(endpoint, { input, withPolling: false })`
  with a **portrait** size (`1536x2048` = 3:4 by default; `1152x2048` = 9:16),
  and returns a `live.`-prefixed jobId carrying the Higgsfield `request_id`.
- `creative-status` polls the platform's `/requests/{request_id}/status` endpoint
  (the same one the SDK uses internally), authenticated with the key pair, and
  maps the result to `{ status, imageUrl }` — the same shape as the mock.
- **Errors** (auth, credits, validation, NSFW, network) are turned into a short,
  friendly `{ status: "failed", error }` — never a stacktrace or a key.

Config knobs: `HF_IMAGE_MODEL` (endpoint), `HF_IMAGE_SIZE` (e.g. `1536x2048`),
`HF_IMAGE_QUALITY` (`720p`|`1080p`).

## Credentials — never in code or git

Higgsfield auth is a **key pair**: `HF_API_KEY` + `HF_API_SECRET`. They are read
at runtime via `process.env` and **must never** be committed. `.env`, `.env.*`
and `.netlify/` are in `.gitignore`.

- **Production:** set `HF_MODE`, `HF_API_KEY`, `HF_API_SECRET` (and optionally
  `HF_IMAGE_MODEL`) in the Netlify UI → Site settings → Environment variables.
- **Local:** copy `.env.example` → `.env` and fill in the values. `netlify dev`
  loads `.env` automatically.

## Running locally

```bash
npm run dev:netlify   # Netlify Dev: serves the Vite app + the functions
```

- Default (no `.env` / `HF_MODE=mock`) → the mock poster, no keys needed.
- To test LIVE: put `HF_MODE=live` + real `HF_API_KEY`/`HF_API_SECRET` in `.env`,
  then `npm run dev:netlify` and generate from the "laat AI ontwerpen" tab.

Plain `npm run dev` (Vite only) does not run the functions; the modal then shows
a clear "start met `npm run dev:netlify`" message instead of failing silently.
