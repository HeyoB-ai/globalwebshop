// Netlify Function v2 — start a creative-generation job.
//
// MOCK mode (Higgsfield step 1): no external call, no API keys, no storage.
// The job is fully encoded in the returned jobId (stateless): status polling
// later decodes it and, after a short delay, returns a server-rendered SVG
// poster. The real Higgsfield call arrives in step 2 behind an HF_MODE=live
// switch — see netlify/functions/README.md.

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

  const payload = JSON.stringify({ t: Date.now(), prompt, ar: aspectRatio });
  const jobId = 'mock.' + Buffer.from(payload, 'utf8').toString('base64url');

  return Response.json({ jobId, status: 'queued' });
};
