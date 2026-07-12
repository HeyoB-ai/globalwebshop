// Shared Higgsfield helper for the creative functions.
//
// Underscore-prefixed → Netlify does NOT treat this as a standalone function;
// it is bundled into the functions that import it.
//
// The real Higgsfield generation lives here, behind the HF_MODE switch. In mock
// mode nothing in this file's live paths runs, and the SDK is only imported
// dynamically inside the live paths — so the app runs safely without keys.
//
// Model: Higgsfield "Soul" text-to-image, endpoint /v1/text2image/soul
// (configurable via HF_IMAGE_MODEL). Auth is the KEY:SECRET pair from
// HF_API_KEY + HF_API_SECRET (Netlify env vars — never committed).

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

// Portrait sizes suited to an abri/poster. Values are valid Higgsfield "Soul"
// presets (see SoulSize in the SDK). Override with HF_IMAGE_SIZE if needed.
function sizeForAspect(aspectRatio) {
  if (process.env.HF_IMAGE_SIZE) return process.env.HF_IMAGE_SIZE;
  const map = { '3:4': '1536x2048', '9:16': '1152x2048' };
  return map[aspectRatio] || '1536x2048';
}

// Map SDK/API errors to a short, safe message — never a stacktrace or a key.
function friendlyError(err) {
  const name = err?.name || err?.constructor?.name || '';
  if (name === 'NotEnoughCreditsError') return 'Onvoldoende Higgsfield-credits om te genereren.';
  if (name === 'AuthenticationError' || name === 'CredentialsMissedError') {
    return 'Higgsfield-authenticatie mislukt. Controleer de sleutels.';
  }
  if (name === 'ValidationError' || name === 'BadInputError') {
    return 'De aanvraag werd geweigerd (ongeldige invoer).';
  }
  return 'Kon de AI-generatie niet uitvoeren. Probeer het later opnieuw.';
}

/**
 * Start a real text-to-image generation (non-blocking).
 * Returns { requestId, statusUrl, status }.
 * Throws a friendly Error on failure.
 */
export async function startLiveGeneration(prompt, aspectRatio) {
  let createHiggsfieldClient;
  try {
    ({ createHiggsfieldClient } = await import('@higgsfield/client/v2'));
  } catch {
    throw new Error('De AI-ontwerpmodule is niet beschikbaar.');
  }

  try {
    const client = createHiggsfieldClient({
      credentials: `${process.env.HF_API_KEY}:${process.env.HF_API_SECRET}`,
      ...(process.env.HF_BASE_URL ? { baseURL: process.env.HF_BASE_URL } : {}),
    });
    const endpoint = process.env.HF_IMAGE_MODEL || DEFAULT_MODEL;
    const input = {
      prompt,
      width_and_height: sizeForAspect(aspectRatio),
      quality: process.env.HF_IMAGE_QUALITY === '720p' ? '720p' : '1080p',
      batch_size: 1,
      enhance_prompt: true,
    };
    const res = await client.subscribe(endpoint, { input, withPolling: false });
    return { requestId: res.request_id, statusUrl: res.status_url, status: res.status };
  } catch (err) {
    throw new Error(friendlyError(err));
  }
}

/**
 * Poll a live job's status via the platform's request-status endpoint (the same
 * one the SDK polls internally), authenticated with the key pair.
 * Returns { status, imageUrl? , error? } in the exact shape the mock returns,
 * so the client layer needs no changes.
 */
export async function getLiveStatus(requestId, statusUrl) {
  const baseUrl = process.env.HF_BASE_URL || DEFAULT_BASE_URL;
  const url = statusUrl && /^https?:/i.test(statusUrl)
    ? statusUrl
    : `${baseUrl}/requests/${requestId}/status`;

  let res;
  try {
    res = await fetch(url, {
      headers: { Authorization: `Key ${process.env.HF_API_KEY}:${process.env.HF_API_SECRET}` },
    });
  } catch {
    // Network hiccup → let the client keep polling.
    return { status: 'in_progress' };
  }

  if (!res.ok) {
    if (res.status >= 500) return { status: 'in_progress' }; // transient → keep polling
    return { status: 'failed', error: 'Kon de status van de generatie niet ophalen.' };
  }

  let data;
  try {
    data = await res.json();
  } catch {
    return { status: 'in_progress' };
  }

  switch (data.status) {
    case 'completed': {
      const imageUrl = data.images?.[0]?.url;
      if (!imageUrl) return { status: 'failed', error: 'Geen afbeelding ontvangen van de server.' };
      return { status: 'completed', imageUrl };
    }
    case 'failed':
      return { status: 'failed', error: 'De generatie is mislukt.' };
    case 'nsfw':
      return { status: 'failed', error: 'De afbeelding is geweigerd (ongepaste inhoud).' };
    default:
      return { status: 'in_progress' };
  }
}
