// Netlify Function v2 — start a creative-generation job (3 textless variants).
//
// Default is MOCK mode: no external call, no API keys, no storage. The job is
// encoded in the stateless jobId; status polling returns 3 textless SVG
// background variants after a short delay.
//
// When HF_MODE=live AND both keys are present, the LIVE path starts THREE real
// Higgsfield text-to-image jobs (in parallel) for a photorealistic, textless
// advertising background and returns a "live." jobId carrying the 3 request_ids.
// See netlify/functions/README.md.

import { isLive, startLiveGenerationBatch } from './lib/higgsfield.mjs';

const VARIANTS = 3;
const ASPECT_RATIO = '9:16'; // portrait, for an abri/poster background

// AI models can't render legible text, so we ask for a photorealistic BACKGROUND
// of what the user describes, explicitly WITHOUT any text. Our own headline is
// overlaid later (step B).
function buildBackgroundPrompt(userPrompt) {
  const subject = String(userPrompt || '').trim();
  return (
    `${subject}. Photorealistic advertising background photography, cinematic natural lighting, ` +
    `rich detail, professional out-of-home poster background, vertical composition with generous ` +
    `open negative space for a headline. no text, no letters, no words, no typography, no watermark, ` +
    `no logo, no signage text.`
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

  // LIVE path — 3 parallel jobs for a textless background.
  if (isLive()) {
    try {
      const ids = await startLiveGenerationBatch(buildBackgroundPrompt(prompt), ASPECT_RATIO, VARIANTS);
      const jobId = 'live.' + Buffer.from(JSON.stringify({ ids }), 'utf8').toString('base64url');
      return Response.json({ jobId, status: 'queued' });
    } catch (err) {
      return Response.json(
        { status: 'failed', error: err instanceof Error ? err.message : 'Kon de AI-generatie niet starten.' },
        { status: 502 },
      );
    }
  }

  // MOCK path (default) — encode enough to render VARIANTS placeholder backgrounds.
  const payload = JSON.stringify({ t: Date.now(), n: VARIANTS });
  const jobId = 'mock.' + Buffer.from(payload, 'utf8').toString('base64url');

  return Response.json({ jobId, status: 'queued' });
};
