/**
 * Poster composer — draws the sharp, correct text + logo overlay on top of the
 * AI-generated (textless) background, entirely client-side on a canvas. The same
 * draw routine powers the live preview and the final PNG export (WYSIWYG).
 *
 * The user only picks safe options (layout preset + colour accent) and edits the
 * text fields — no free dragging — so the result always stays on-brand and legible.
 */

export interface PosterFields {
  company: string;
  slogan: string;
  price: string;
  url: string;
  logo: string | null; // data-URL
}

export type PresetKey = 'onder' | 'boven' | 'centraal' | 'balk';
export type AccentKey = 'cobalt' | 'amber' | 'donker' | 'licht';

export const PRESETS: { key: PresetKey; label: string }[] = [
  { key: 'onder', label: 'Tekst onderaan' },
  { key: 'boven', label: 'Tekst bovenaan' },
  { key: 'centraal', label: 'Gecentreerd' },
  { key: 'balk', label: 'Balk links' },
];

interface Accent {
  key: AccentKey;
  label: string;
  plate: 'dark' | 'light';
  accent: string; // price pill / accent colour
  chipText: string; // text on the price pill
  text: string; // headline colour
  sub: string; // subtitle / url colour
}

export const ACCENTS: Accent[] = [
  { key: 'cobalt', label: 'Cobalt', plate: 'dark', accent: '#2456E6', chipText: '#FFFFFF', text: '#FFFFFF', sub: 'rgba(255,255,255,0.85)' },
  { key: 'amber', label: 'Amber', plate: 'dark', accent: '#DE8A06', chipText: '#0A0F1E', text: '#FFFFFF', sub: 'rgba(255,255,255,0.85)' },
  { key: 'donker', label: 'Donker', plate: 'dark', accent: '#FFFFFF', chipText: '#0A0F1E', text: '#FFFFFF', sub: 'rgba(255,255,255,0.8)' },
  { key: 'licht', label: 'Licht', plate: 'light', accent: '#2456E6', chipText: '#FFFFFF', text: '#16213A', sub: 'rgba(22,33,58,0.82)' },
];

export interface Ratio {
  key: 'digital' | 'abri';
  label: string;
  aspect: string; // sent to the image model
  w: number; // export canvas pixels
  h: number;
}

/** The poster ratio for the screen this creative hangs on. */
export function ratioForType(type: 'digital' | 'abri'): Ratio {
  return type === 'digital'
    ? { key: 'digital', label: 'digitaal 9:16', aspect: '9:16', w: 1080, h: 1920 }
    : { key: 'abri', label: 'abri 2:3', aspect: '2:3', w: 1200, h: 1800 };
}

// --- canvas helpers ---------------------------------------------------------

let fontsReady: Promise<void> | null = null;
function ensureFonts(): Promise<void> {
  if (!fontsReady) {
    const anyDoc = document as any;
    fontsReady = anyDoc.fonts
      ? Promise.all([
          anyDoc.fonts.load('800 80px Poppins'),
          anyDoc.fonts.load('600 80px Poppins'),
          anyDoc.fonts.load('500 40px Inter'),
        ]).then(() => undefined).catch(() => undefined)
      : Promise.resolve();
  }
  return fontsReady;
}

/** data: URLs load as-is; everything else goes through the same-origin proxy so
 *  the canvas never taints (enabling PNG export). */
function proxied(url: string): string {
  if (url.startsWith('data:')) return url;
  return `/.netlify/functions/image-proxy?url=${encodeURIComponent(url)}`;
}

export function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    if (!url.startsWith('data:')) img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Kon de afbeelding niet laden.'));
    img.src = proxied(url);
  });
}

function drawCover(ctx: CanvasRenderingContext2D, img: HTMLImageElement, W: number, H: number) {
  const ir = img.width / img.height;
  const r = W / H;
  let dw: number, dh: number, dx: number, dy: number;
  if (ir > r) {
    dh = H; dw = H * ir; dx = (W - dw) / 2; dy = 0;
  } else {
    dw = W; dh = W / ir; dx = 0; dy = (H - dh) / 2;
  }
  ctx.drawImage(img, dx, dy, dw, dh);
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

function wrapLines(ctx: CanvasRenderingContext2D, text: string, maxW: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = '';
  for (const w of words) {
    const t = line ? line + ' ' + w : w;
    if (ctx.measureText(t).width > maxW && line) {
      lines.push(line);
      line = w;
    } else {
      line = t;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function accentFor(key: AccentKey): Accent {
  return ACCENTS.find((a) => a.key === key) ?? ACCENTS[0];
}

function drawScrim(ctx: CanvasRenderingContext2D, W: number, H: number, preset: PresetKey, A: Accent, boxW: number, pad: number) {
  const dark = A.plate === 'dark';
  const c0 = dark ? '10,15,30' : '251,250,247';
  const strong = `rgba(${c0},${dark ? 0.86 : 0.9})`;
  const mid = `rgba(${c0},${dark ? 0.5 : 0.55})`;
  const none = `rgba(${c0},0)`;

  if (preset === 'balk') {
    const g = ctx.createLinearGradient(0, 0, boxW + pad * 1.5, 0);
    g.addColorStop(0, strong);
    g.addColorStop(0.7, mid);
    g.addColorStop(1, none);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, boxW + pad * 1.5, H);
    return;
  }
  if (preset === 'centraal') {
    ctx.fillStyle = `rgba(${c0},${dark ? 0.42 : 0.5})`;
    ctx.fillRect(0, 0, W, H);
    return;
  }
  // onder / boven — vertical gradient covering ~60%
  const top = preset === 'boven';
  const g = ctx.createLinearGradient(0, top ? 0 : H, 0, top ? H * 0.62 : H * 0.38);
  g.addColorStop(0, strong);
  g.addColorStop(0.5, mid);
  g.addColorStop(1, none);
  ctx.fillStyle = g;
  if (top) ctx.fillRect(0, 0, W, H * 0.62);
  else ctx.fillRect(0, H * 0.38, W, H * 0.62);
}

interface DrawArgs {
  W: number;
  H: number;
  bg: HTMLImageElement | null;
  logo: HTMLImageElement | null;
  fields: PosterFields;
  preset: PresetKey;
  accent: AccentKey;
}

export function drawPoster(ctx: CanvasRenderingContext2D, o: DrawArgs) {
  const { W, H, bg, logo, fields, preset } = o;
  const A = accentFor(o.accent);
  ctx.clearRect(0, 0, W, H);

  if (bg) drawCover(ctx, bg, W, H);
  else {
    ctx.fillStyle = '#0A0F1E';
    ctx.fillRect(0, 0, W, H);
  }

  const pad = W * 0.07;
  const boxX = pad;
  const boxW = (preset === 'balk' ? W * 0.62 : W - pad * 2) - (preset === 'balk' ? pad : 0);

  drawScrim(ctx, W, H, preset, A, boxW, pad);

  // Build the vertical text stack as measured items.
  type Item = { h: number; gap: number; draw: (x: number, y: number) => void };
  const items: Item[] = [];

  if (logo) {
    const lh = Math.min(W * 0.14, H * 0.11);
    const lw = lh * (logo.width / logo.height);
    items.push({ h: lh, gap: W * 0.035, draw: (x, y) => ctx.drawImage(logo, x, y, lw, lh) });
  }
  if (fields.company.trim()) {
    const fs = W * 0.088;
    const lh = fs * 1.04;
    ctx.font = `800 ${fs}px Poppins, sans-serif`;
    const lines = wrapLines(ctx, fields.company.trim().toUpperCase(), boxW);
    items.push({
      h: lines.length * lh,
      gap: W * 0.022,
      draw: (x, y) => {
        ctx.fillStyle = A.text;
        ctx.textBaseline = 'top';
        ctx.font = `800 ${fs}px Poppins, sans-serif`;
        lines.forEach((ln, i) => ctx.fillText(ln, x, y + i * lh));
      },
    });
  }
  if (fields.slogan.trim()) {
    const fs = W * 0.052;
    const lh = fs * 1.22;
    ctx.font = `600 ${fs}px Poppins, sans-serif`;
    const lines = wrapLines(ctx, fields.slogan.trim(), boxW);
    items.push({
      h: lines.length * lh,
      gap: W * 0.03,
      draw: (x, y) => {
        ctx.fillStyle = A.text;
        ctx.textBaseline = 'top';
        ctx.font = `600 ${fs}px Poppins, sans-serif`;
        lines.forEach((ln, i) => ctx.fillText(ln, x, y + i * lh));
      },
    });
  }
  if (fields.price.trim()) {
    const fs = W * 0.062;
    ctx.font = `800 ${fs}px Poppins, sans-serif`;
    const tw = ctx.measureText(fields.price.trim()).width;
    const px = W * 0.035;
    const py = W * 0.022;
    const ph = fs + py * 2;
    const pw = tw + px * 2;
    items.push({
      h: ph,
      gap: W * 0.03,
      draw: (x, y) => {
        ctx.fillStyle = A.accent;
        roundRect(ctx, x, y, pw, ph, ph * 0.28);
        ctx.fill();
        ctx.fillStyle = A.chipText;
        ctx.textBaseline = 'top';
        ctx.font = `800 ${fs}px Poppins, sans-serif`;
        ctx.fillText(fields.price.trim(), x + px, y + py);
      },
    });
  }
  if (fields.url.trim()) {
    const fs = W * 0.033;
    items.push({
      h: fs * 1.2,
      gap: 0,
      draw: (x, y) => {
        ctx.fillStyle = A.sub;
        ctx.textBaseline = 'top';
        ctx.font = `500 ${fs}px Inter, sans-serif`;
        ctx.fillText(fields.url.trim(), x, y);
      },
    });
  }

  const totalH = items.reduce((s, it, i) => s + it.h + (i < items.length - 1 ? it.gap : 0), 0);

  let startY: number;
  if (preset === 'boven') startY = pad;
  else if (preset === 'centraal' || preset === 'balk') startY = (H - totalH) / 2;
  else startY = H - pad - totalH;

  let y = startY;
  for (const it of items) {
    it.draw(boxX, y);
    y += it.h + it.gap;
  }
}

/** Compose the final poster (background + overlay) and return a PNG data-URL. */
export async function composeToDataUrl(opts: {
  backgroundUrl: string;
  ratio: Ratio;
  fields: PosterFields;
  preset: PresetKey;
  accent: AccentKey;
}): Promise<string> {
  await ensureFonts();
  const { backgroundUrl, ratio, fields, preset, accent } = opts;
  const bg = await loadImage(backgroundUrl).catch(() => null);
  const logo = fields.logo ? await loadImage(fields.logo).catch(() => null) : null;

  const canvas = document.createElement('canvas');
  canvas.width = ratio.w;
  canvas.height = ratio.h;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas niet beschikbaar.');
  drawPoster(ctx, { W: ratio.w, H: ratio.h, bg, logo, fields, preset, accent });
  return canvas.toDataURL('image/png');
}

export { ensureFonts };
