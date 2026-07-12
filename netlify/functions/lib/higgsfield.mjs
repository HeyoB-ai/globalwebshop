// Shared Higgsfield helper for the creative functions.
//
// In a subdirectory → Netlify bundles it into the importing functions; it is not
// a standalone function.
//
// The real Higgsfield generation lives here, behind the HF_MODE switch. In mock
// mode nothing here runs, so the app is safe to run without keys.
//
// IMPORTANT — why we call the HTTP API directly instead of @higgsfield/client:
// the v2 SDK's `subscribe()` posts the input FLAT and expects a v2 response
// ({ request_id, status_url, images }). The live text-to-image endpoint
// `/v1/text2image/soul` instead REQUIRES the body wrapped in `{ params: {...} }`
// and returns a v1 JobSet ({ id, jobs:[{ status, results }] }). Verified against
// the live API (422 "Field required: body.params" when flat; 200 when wrapped).
// So we speak the documented HTTP endpoint directly, using the SDK's own auth
// scheme (Authorization: Key KEY:SECRET). Credentials come from HF_API_KEY /
// HF_API_SECRET (Netlify env vars) — never committed.
//
// Model: Higgsfield "Soul" text-to-image, endpoint /v1/text2image/soul
// (configurable via HF_IMAGE_MODEL).

const DEFAULT_MODEL = '/v1/text2image/soul';
const DEFAULT_BASE_URL = 'https://platform.higgsfield.ai';

/** Current mode: "mock" (default) or "live". */
export function hfMode() {
  return (process.env.HF_MODE || 'mock').toLowerCase();
}

/** Both halves of the Higgsfield key pair present? */
export function hasKeys() {
  return Boolean(process.env.HF_API_KEY && process.env.HF_API_SECRET);
}

/** Live generation only runs when explicitly switched on AND keys are present. */
export function isLive() {
  return hfMode() === 'live' && hasKeys();
}

function baseUrl() {
  return process.env.HF_BASE_URL || DEFAULT_BASE_URL;
}

function authHeaders(withJson = false) {
  const h = { Authorization: `Key ${process.env.HF_API_KEY}:${process.env.HF_API_SECRET}` };
  if (withJson) h['Content-Type'] = 'application/json';
  return h;
}

// Portrait sizes suited to an abri/poster — valid Higgsfield "Soul" presets
// (SoulSize in the SDK). Override with HF_IMAGE_SIZE.
function sizeForAspect(aspectRatio) {
  if (process.env.HF_IMAGE_SIZE) return process.env.HF_IMAGE_SIZE;
  const map = { '3:4': '1536x2048', '9:16': '1152x2048' };
  return map[aspectRatio] || '1536x2048';
}

// Map an HTTP failure to a short, safe message — never a stacktrace or a key.
function httpFriendly(status) {
  if (status === 401) return 'Higgsfield-authenticatie mislukt. Controleer de sleutels.';
  if (status === 403) return 'Onvoldoende Higgsfield-credits om te genereren.';
  if (status === 400 || status === 422) return 'De aanvraag werd geweigerd (ongeldige invoer).';
  return 'Kon de AI-generatie niet uitvoeren. Probeer het later opnieuw.';
}

/**
 * Start a real text-to-image generation (non-blocking).
 * Returns { requestId, status }. Throws a friendly Error on failure.
 */
export async function startLiveGeneration(prompt, aspectRatio) {
  const endpoint = process.env.HF_IMAGE_MODEL || DEFAULT_MODEL;
  const body = {
    params: {
      prompt,
      width_and_height: sizeForAspect(aspectRatio),
      quality: process.env.HF_IMAGE_QUALITY === '720p' ? '720p' : '1080p',
      batch_size: 1,
      enhance_prompt: true,
    },
  };

  let res;
  try {
    res = await fetch(`${baseUrl()}${endpoint}`, {
      method: 'POST',
      headers: authHeaders(true),
      body: JSON.stringify(body),
    });
  } catch (err) {
    console.error('[higgsfield] start network error:', err?.message);
    throw new Error('Kon de AI-ontwerpserver niet bereiken.');
  }

  const text = await res.text();
  if (!res.ok) {
    // TEMP server-side diagnostic — full status + body, never the keys.
    console.error(`[higgsfield] start failed: HTTP ${res.status} ${res.statusText} — body: ${text.slice(0, 800)}`);
    throw new Error(httpFriendly(res.status));
  }

  let data;
  try {
    data = JSON.parse(text);
  } catch {
    console.error('[higgsfield] start: non-JSON body:', text.slice(0, 300));
    throw new Error('Onverwacht antwoord van de ontwerpserver.');
  }
  if (!data.id) {
    console.error('[higgsfield] start: no job id in body:', text.slice(0, 300));
    throw new Error('Geen job-id ontvangen van de server.');
  }
  return { requestId: data.id, status: data.jobs?.[0]?.status || 'queued' };
}

/**
 * Poll a live job (JobSet) and return { status, imageUrl? , error? } in the
 * exact shape the mock returns, so the client layer needs no changes.
 */
export async function getLiveStatus(requestId) {
  const url = `${baseUrl()}/v1/job-sets/${requestId}`;

  let res;
  try {
    res = await fetch(url, { headers: authHeaders() });
  } catch {
    return { status: 'in_progress' }; // network hiccup → keep polling
  }

  if (!res.ok) {
    if (res.status >= 500) return { status: 'in_progress' };
    const t = await res.text().catch(() => '');
    console.error(`[higgsfield] status failed: HTTP ${res.status} — body: ${t.slice(0, 400)}`);
    return { status: 'failed', error: 'Kon de status van de generatie niet ophalen.' };
  }

  let data;
  try {
    data = await res.json();
  } catch {
    return { status: 'in_progress' };
  }

  const jobs = Array.isArray(data.jobs) ? data.jobs : [];
  const done = jobs.find((j) => j.status === 'completed');
  if (done) {
    const imageUrl = done.results?.raw?.url || done.results?.min?.url;
    if (!imageUrl) return { status: 'failed', error: 'Geen afbeelding ontvangen van de server.' };
    return { status: 'completed', imageUrl };
  }
  if (jobs.some((j) => j.status === 'nsfw')) {
    return { status: 'failed', error: 'De afbeelding is geweigerd (ongepaste inhoud).' };
  }
  if (jobs.some((j) => j.status === 'failed')) {
    return { status: 'failed', error: 'De generatie is mislukt.' };
  }
  if (jobs.some((j) => j.status === 'canceled')) {
    return { status: 'failed', error: 'De generatie is geannuleerd.' };
  }
  return { status: 'in_progress' };
}
