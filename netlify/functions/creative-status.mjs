// Netlify Function v2 — poll a creative-generation job.
//
// "mock." jobs (default): decodes the stateless jobId produced by
// generate-creative. Within ~3.5s of the job start it reports "in_progress";
// after that it returns "completed" with a server-rendered SVG poster (portrait,
// cobalt/amber house style) carrying the prompt text — as a data:image/svg+xml
// data-URI.
//
// "live." jobs: polls the real Higgsfield job status and returns { status,
// imageUrl } in the exact same shape, so the client layer needs no changes.

import { getLiveStatus } from './lib/higgsfield.mjs';

function escapeXml(s) {
  return String(s).replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
}

// Greedy word-wrap into at most `maxLines` lines of ~`max` characters.
function wrapText(text, max, maxLines) {
  const words = text.split(/\s+/).filter(Boolean);
  const lines = [];
  let line = '';
  for (const w of words) {
    if (line && (line + ' ' + w).length > max) {
      lines.push(line);
      line = w;
    } else {
      line = line ? line + ' ' + w : w;
    }
    if (lines.length >= maxLines) break;
  }
  if (line && lines.length < maxLines) lines.push(line);
  if (lines.length === maxLines && words.length > lines.join(' ').split(' ').length) {
    lines[maxLines - 1] = lines[maxLines - 1].replace(/.{0,2}$/, '…');
  }
  return lines;
}

function buildPosterSVG(prompt) {
  const W = 600;
  const H = 800;
  const headline = (prompt.trim() || 'Jouw aanbieding hier').toUpperCase();
  const lines = wrapText(headline, 14, 6);
  // Size the headline down for longer lines so it never clips the 600px canvas.
  const longest = Math.max(1, ...lines.map((l) => l.length));
  const fontSize = Math.max(30, Math.min(52, Math.floor(520 / (longest * 0.66))));
  const lineHeight = Math.round(fontSize * 1.15);
  const startY = 300;

  const tspans = lines
    .map((ln, i) => `<tspan x="60" y="${startY + i * lineHeight}">${escapeXml(ln)}</tspan>`)
    .join('');

  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">` +
    `<defs>` +
    `<linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">` +
    `<stop offset="0" stop-color="#1D46C4"/>` +
    `<stop offset="0.55" stop-color="#2456E6"/>` +
    `<stop offset="1" stop-color="#0A0F1E"/>` +
    `</linearGradient>` +
    `</defs>` +
    `<rect width="${W}" height="${H}" fill="url(#bg)"/>` +
    `<rect x="60" y="80" width="72" height="10" rx="5" fill="#DE8A06"/>` +
    `<text x="60" y="128" font-family="Poppins, Arial, sans-serif" font-size="22" font-weight="700" letter-spacing="3" fill="#FFFFFF" opacity="0.85">GLOBAL · BUITENRECLAME</text>` +
    `<text font-family="Poppins, Arial, sans-serif" font-weight="800" font-size="${fontSize}" fill="#FFFFFF">${tspans}</text>` +
    `<rect x="60" y="${H - 150}" width="${W - 120}" height="2" fill="#FFFFFF" opacity="0.3"/>` +
    `<text x="60" y="${H - 104}" font-family="Poppins, Arial, sans-serif" font-size="24" font-weight="700" fill="#DE8A06">Nu te zien op straat</text>` +
    `<text x="60" y="${H - 68}" font-family="Inter, Arial, sans-serif" font-size="19" fill="#FFFFFF" opacity="0.8">Vaak live vanaf morgen · vanaf €250</text>` +
    `</svg>`;

  return svg;
}

export default async (req) => {
  let jobId;
  if (req.method === 'POST') {
    try {
      const body = await req.json();
      jobId = body?.jobId;
    } catch {
      // fall through to error below
    }
  } else {
    jobId = new URL(req.url).searchParams.get('jobId');
  }

  if (typeof jobId !== 'string') {
    return Response.json({ status: 'failed', error: 'invalid jobId' }, { status: 400 });
  }

  // LIVE job → poll the real Higgsfield status.
  if (jobId.startsWith('live.')) {
    let liveMeta;
    try {
      liveMeta = JSON.parse(Buffer.from(jobId.slice(5), 'base64url').toString('utf8'));
    } catch {
      return Response.json({ status: 'failed', error: 'malformed jobId' }, { status: 400 });
    }
    try {
      const result = await getLiveStatus(liveMeta.id);
      return Response.json(result);
    } catch {
      return Response.json({ status: 'failed', error: 'Kon de status niet ophalen.' }, { status: 502 });
    }
  }

  if (!jobId.startsWith('mock.')) {
    return Response.json({ status: 'failed', error: 'invalid jobId' }, { status: 400 });
  }

  let meta;
  try {
    meta = JSON.parse(Buffer.from(jobId.slice(5), 'base64url').toString('utf8'));
  } catch {
    return Response.json({ status: 'failed', error: 'malformed jobId' }, { status: 400 });
  }

  const elapsed = Date.now() - Number(meta.t || 0);
  if (elapsed < 3500) {
    return Response.json({ status: 'in_progress' });
  }

  const svg = buildPosterSVG(String(meta.prompt ?? ''));
  const imageUrl = 'data:image/svg+xml;base64,' + Buffer.from(svg, 'utf8').toString('base64');

  return Response.json({ status: 'completed', imageUrl });
};
