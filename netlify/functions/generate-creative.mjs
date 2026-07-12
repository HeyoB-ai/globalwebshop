// Netlify Function v2 — start a creative-generation job (3 textless variants).
//
// Default is MOCK mode: no external call, no API keys, no storage. The job is
// encoded in the stateless jobId; status polling returns 3 textless SVG
// background variants after a short delay.
//
// When HF_MODE=live AND both keys are present, the LIVE path starts THREE real
// Higgsfield jobs (in parallel), each a mood-rich, on-theme, TEXTLESS advertising
// background, and returns a "live." jobId carrying the 3 request_ids.
// See netlify/functions/README.md.

import { isLive, startLiveGeneration } from './lib/higgsfield.mjs';

const VARIANTS = 3;
const ASPECT_RATIO = '9:16'; // portrait, for an abri/poster background

// Per-variant hints so the 3 results genuinely differ (angle / light / framing).
const VARIATION_HINTS = [
  'Soft, near-frontal composition with gentle diffused daylight from the left and quiet empty space in the upper-left.',
  'Slight three-quarter angle with warm golden-hour backlight, pronounced shallow depth of field, and quiet empty space along the top-left.',
  'Intimate, close overhead-ish detail with moody warm side lighting, deep bokeh, and quiet empty space across the top.',
];

// Concepts to actively keep OUT of the image. Soul is very text-prone; the
// negative prompt is the strongest lever against fake letters/signage.
const NEGATIVE_PROMPT =
  'text, letters, words, numbers, typography, captions, writing, characters, fonts, handwriting, ' +
  'signage, sign, signboard, chalkboard, blackboard, menu board, menu, poster, banner, label, ' +
  'jar label, product label, price tag, sticker, packaging text, logo, watermark, brand name, ' +
  'shop name, storefront, shop facade, subtitles';

// AI models can't render legible text, and shop/counter scenes make Soul paint
// signs and chalkboards. So we ask for the subject's signature PRODUCTS as the
// hero of an atmospheric, TEXTLESS still-life (no shop/counter/board/label) with
// calm negative space, and overlay our own headline later (step B).
function buildBackgroundPrompt(userPrompt, variant) {
  const subject = String(userPrompt || '').trim();
  const hint = VARIATION_HINTS[variant % VARIATION_HINTS.length];
  return (
    `A warm, atmospheric, photorealistic advertising background that puts the signature products of ${subject} ` +
    `in the spotlight as the clear hero of the image, beautifully and abundantly styled on a rustic natural surface ` +
    `with soft fabric and props. Moody artisanal lighting, deep creamy bokeh, shallow depth of field, premium and ` +
    `inviting, calm and uncluttered. ${hint} ` +
    `Keep generous soft negative space where a headline will be placed later. ` +
    `No shop, no storefront, no counter, no menu board, no chalkboard, no signs, and no jars or packaging with labels. ` +
    `A completely wordless photograph — no text, letters, numbers, writing, signage, labels, price tags, logos or ` +
    `watermark anywhere; every surface is blank.`
  );
}

export default async (req) => {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method Not Allowed' }, { status: 405 });
  }

  let body = {};
  try {
    body = await req.json();
  } catch {
    // ignore — treated as empty body below
  }

  const prompt = String(body.prompt ?? '').slice(0, 400);
  if (!prompt.trim()) {
    return Response.json({ error: 'prompt is required' }, { status: 400 });
  }

  // LIVE path — 3 parallel jobs, each with its own variation of the prompt.
  if (isLive()) {
    const results = await Promise.allSettled(
      Array.from({ length: VARIANTS }, (_, i) =>
        startLiveGeneration(buildBackgroundPrompt(prompt, i), ASPECT_RATIO, NEGATIVE_PROMPT),
      ),
    );
    const ids = results.filter((r) => r.status === 'fulfilled').map((r) => r.value.requestId);
    if (ids.length === 0) {
      const rejected = results.find((r) => r.status === 'rejected');
      const message = rejected?.reason instanceof Error ? rejected.reason.message : 'Kon de AI-generatie niet starten.';
      return Response.json({ status: 'failed', error: message }, { status: 502 });
    }
    const jobId = 'live.' + Buffer.from(JSON.stringify({ ids }), 'utf8').toString('base64url');
    return Response.json({ jobId, status: 'queued' });
  }

  // MOCK path (default) — encode enough to render VARIANTS placeholder backgrounds.
  const payload = JSON.stringify({ t: Date.now(), n: VARIANTS });
  const jobId = 'mock.' + Buffer.from(payload, 'utf8').toString('base64url');

  return Response.json({ jobId, status: 'queued' });
};
