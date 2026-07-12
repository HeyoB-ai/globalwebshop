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

Uses the **official** Higgsfield API (docs.higgsfield.ai/docs/how-to/introduction):

- **Model:** configurable via **`HF_IMAGE_MODEL`** — a `model_id` of the form
  `merk/model/variant`. Default **`higgsfield-ai/soul/standard`** (verified live:
  `200` + a real image URL).
- Auth header: `Authorization: Key ${HF_API_KEY}:${HF_API_SECRET}`.
- `generate-creative` → `POST /{model_id}` with a **flat** body
  `{ prompt, aspect_ratio, resolution }` (`aspect_ratio` from the planner,
  `resolution` via `HF_IMAGE_RESOLUTION`, default `1080p`). Returns a `live.`
  jobId carrying the `request_id`.
- `creative-status` → `GET /requests/{request_id}/status`; when `completed` it
  returns `{ status:"completed", imageUrl }` (from `images[0].url`) — the same
  shape as the mock, so `creativeClient.ts` is unchanged. Statuses:
  `queued | in_progress | completed | failed | nsfw` (failed/nsfw refund credits).
- **Errors** (auth, credits, validation, NSFW, network) become a short, friendly
  `{ status: "failed", error }` — never a stacktrace or a key. Set **`HF_DEBUG=1`**
  to log the full HTTP status + body **server-side** (terminal only); off by default.

### Nano Banana Pro — not yet on the public REST API

Nano Banana Pro (Gemini 3 Pro Image) was requested. Its REST `model_id` is **not**
published in the docs, and ~25 plausible `merk/model/variant` slugs
(`higgsfield-ai/nano-banana-pro/standard`, `google/nano-banana-pro/standard`,
`nano-banana-pro/standard`, …) **all returned `404 "Model not found"`**. The
catalog names from the CLI (`nano_banana_2`) and the Higgsfield MCP
(`nano_banana_pro`) are not valid REST model_ids either. It appears Nano Banana is
only reachable via the app / CLI / MCP for now, not the public REST API. When the
real `model_id` is known, just set `HF_IMAGE_MODEL` to it — the request/response
format is identical, no code change needed.

Config knobs: `HF_IMAGE_MODEL` (model_id), `HF_IMAGE_RESOLUTION` (model-dependent,
e.g. `720p`/`1080p` for Soul), `HF_DEBUG` (`1` to log failures server-side).

### Cost — 3 variants per request

Each "genereren" click makes **3 textless background variants = 3 parallel jobs
= 3× credits** (the user gets 3 options to choose from). `generate-creative`
starts the 3 jobs with `Promise.allSettled`; `creative-status` aggregates them
and returns `{ status, imageUrls: [...] }`. This 3× multiplier is the key input
for the later cost-guarding step (e.g. per-user rate limits or a variant count
knob).

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
