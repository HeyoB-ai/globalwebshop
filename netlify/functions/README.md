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

- Model: **Higgsfield "Soul" text-to-image**, endpoint **`/v1/text2image/soul`**
  — a sensible, general text-to-image model. Override with **`HF_IMAGE_MODEL`**.
- **Why direct HTTP (no SDK):** the `@higgsfield/client` v2 `subscribe()` posts
  the input *flat* and expects a v2 response (`{ request_id, status_url, images }`).
  This endpoint instead **requires `{ params: {...} }`** and returns a v1 JobSet
  (`{ id, jobs:[{ status, results }] }`). Verified live: flat → `422 "Field
  required: body.params"`; wrapped → `200`. The SDK was therefore evaluated and
  removed; we call the documented HTTP endpoint directly with the
  `Authorization: Key KEY:SECRET` scheme.
- Auth header: `Authorization: Key ${HF_API_KEY}:${HF_API_SECRET}`.
- `generate-creative` → `POST /v1/text2image/soul` with
  `{ params: { prompt, width_and_height, quality, batch_size, enhance_prompt } }`
  (portrait `1536x2048` = 3:4 default; `1152x2048` = 9:16), and returns a
  `live.`-prefixed jobId carrying the JobSet `id`.
- `creative-status` → `GET /v1/job-sets/{id}`; when a job is `completed` it
  returns `{ status:"completed", imageUrl }` (from `jobs[0].results.raw.url`) —
  the same shape as the mock, so `creativeClient.ts` is unchanged.
- **Errors** (auth, credits, validation, NSFW, network) become a short, friendly
  `{ status: "failed", error }` — never a stacktrace or a key. Set **`HF_DEBUG=1`**
  to log the full HTTP status + body **server-side** (terminal only) for
  diagnosis; it is off by default.

Config knobs: `HF_IMAGE_MODEL` (endpoint), `HF_IMAGE_SIZE` (e.g. `1536x2048`),
`HF_IMAGE_QUALITY` (`720p`|`1080p`), `HF_DEBUG` (`1` to log failures server-side).

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
