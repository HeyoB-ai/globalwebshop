// Netlify Function v2 — start a creative-generation job.
//
// Default is MOCK mode: no external call, no API keys, no storage. The job is
// fully encoded in the returned jobId (stateless); status polling decodes it and
// returns a server-rendered SVG poster after a short delay.
//
// When HF_MODE=live AND both keys are present, the LIVE path starts a real
// Higgsfield text-to-image generation and returns a "live." jobId instead.
// See netlify/functions/README.md.

import { isLive, startLiveGeneration } from './lib/higgsfield.mjs';

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
  const aspectRatio = String(body.aspectRatio ?? '3:4');

  if (!prompt.trim()) {
    return Response.json({ error: 'prompt is required' }, { status: 400 });
  }

  // LIVE path — only when explicitly switched on and keys are present.
  if (isLive()) {
    try {
      const { requestId, status } = await startLiveGeneration(prompt, aspectRatio);
      const payload = JSON.stringify({ id: requestId });
      const jobId = 'live.' + Buffer.from(payload, 'utf8').toString('base64url');
      return Response.json({ jobId, status: status || 'queued' });
    } catch (err) {
      return Response.json(
        { status: 'failed', error: err instanceof Error ? err.message : 'Kon de AI-generatie niet starten.' },
        { status: 502 },
      );
    }
  }

  // MOCK path (default).
  const payload = JSON.stringify({ t: Date.now(), prompt, ar: aspectRatio });
  const jobId = 'mock.' + Buffer.from(payload, 'utf8').toString('base64url');

  return Response.json({ jobId, status: 'queued' });
};
