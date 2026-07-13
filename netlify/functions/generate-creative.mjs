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
// Portrait ratios per screen type: 9:16 (digital 1080x1920) or 2:3 (abri
// 118.5x175cm). The client sends the ratio that matches the chosen screen.
const ALLOWED_RATIOS = new Set(['9:16', '2:3', '3:4']);
const DEFAULT_RATIO = '9:16';

// Per-variant hints so the 3 results genuinely differ — each is a distinct
// real-photography setup (light / angle / composition), and each keeps the
// negative space in a different corner so at least one nearly always lands.
const VARIATION_HINTS = [
  'Soft directional studio softbox light from the left, near-frontal eye-level composition, ' +
    '85mm lens; keep the lower-left third as calm empty space.',
  'Warm natural golden-hour backlight with a gentle glow, slight three-quarter angle, ' +
    'very shallow depth of field; keep the left side as calm empty space.',
  'Moody low-key side light with soft shadows, intimate overhead flat-lay perspective, ' +
    'deep background blur; keep the bottom third as calm empty space.',
];

// Concepts to actively keep OUT of the image. Two jobs: (1) suppress Soul's
// text-proneness as hard as possible (fake letters/signage), and (2) steer away
// from the plasticky, over-polished "generic AI" look toward real photography.
const NEGATIVE_PROMPT =
  // — no text / signage of any kind (the strongest lever against fake letters) —
  'text, letters, words, numbers, typography, captions, writing, characters, fonts, handwriting, ' +
  'signage, sign, signboard, billboard, chalkboard, blackboard, menu board, menu, poster, banner, ' +
  'label, printed label, jar label, product label, price tag, sticker, packaging text, logo, ' +
  'watermark, brand name, shop name, storefront, shop facade, subtitles, ' +
  // — not a generic AI render; believable commercial photography only —
  'digital art, illustration, 3d render, cgi, render, painting, drawing, cartoon, anime, ' +
  'overly polished, plastic, waxy, glossy fake surfaces, oversaturated, harsh HDR, oversharpened, ' +
  'over-processed, busy, cluttered, low-resolution, blurry subject, distorted, deformed, ugly';

// AI models can't render legible text, and shop/counter scenes make Soul paint
// signs and chalkboards. So we brief it like a real photo shoot: the subject's
// signature PRODUCTS as the single clear hero of a TEXTLESS commercial still
// life (no shop/counter/board/label), lit and framed like editorial advertising
// photography, with a calm rest zone for our own headline overlay (step B).
function buildBackgroundPrompt(userPrompt, variant) {
  const subject = String(userPrompt || '').trim();
  const hint = VARIATION_HINTS[variant % VARIATION_HINTS.length];
  return (
    // 1) Lead with the language of commercial photography so the model reaches
    //    for a real shoot rather than a generic AI illustration.
    `Professional advertising photograph of ${subject}, commercial product photography, editorial campaign style, ` +
    `shot on a medium-format camera, 85mm lens, shallow depth of field, soft directional studio lighting and ` +
    `natural golden-hour light, clean minimal composition with generous negative space, premium high-end brand ` +
    `aesthetic, photorealistic, true-to-life colours, subtle natural imperfections, sharp focus on the subject ` +
    `with a softly blurred background. ` +
    // 2) Keep it calm: one clear subject, lots of empty room for the later headline.
    `A single clear hero subject, calm and uncluttered, with plenty of quiet empty negative space where a headline ` +
    `will be placed later. ${hint} ` +
    // 3) Push away the AI look explicitly.
    `Not digital art, not an illustration, not a 3D render or CGI; not overly polished, plastic, oversaturated or ` +
    `HDR; a real, believable photograph with authentic materials and lifelike texture. ` +
    // 4) Keep every trace of text/signage out of frame.
    `No shop, no storefront, no counter, no menu board, no chalkboard, no billboards, no signs, and no jars or ` +
    `packaging with labels. A completely wordless photograph — no text, letters, numbers, writing, signage, labels, ` +
    `price tags, logos or watermark anywhere; every surface is blank.`
  );
}

export default async (req) => {
  // Safe diagnostics (GET or ?debug=1). Returns ONLY booleans + non-secret
  // values so you can see what the function really sees — never the keys.
  const wantsDebug = req.method === 'GET' || new URL(req.url).searchParams.get('debug') === '1';
  if (wantsDebug) {
    return Response.json({
      mode: isLive() ? 'live' : 'mock',
      HF_MODE_present: process.env.HF_MODE !== undefined,
      HF_API_KEY_present: Boolean((process.env.HF_API_KEY || '').trim()),
      HF_API_SECRET_present: Boolean((process.env.HF_API_SECRET || '').trim()),
      HF_MODE_value_normalized: (process.env.HF_MODE || '').trim().toLowerCase(),
      HF_IMAGE_MODEL: process.env.HF_IMAGE_MODEL || null,
    });
  }

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
  const rawRatio = String(body.aspectRatio ?? DEFAULT_RATIO);
  const aspectRatio = ALLOWED_RATIOS.has(rawRatio) ? rawRatio : DEFAULT_RATIO;

  // LIVE path — 3 parallel jobs, each with its own variation of the prompt.
  if (isLive()) {
    const results = await Promise.allSettled(
      Array.from({ length: VARIANTS }, (_, i) =>
        startLiveGeneration(buildBackgroundPrompt(prompt, i), aspectRatio, NEGATIVE_PROMPT),
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
