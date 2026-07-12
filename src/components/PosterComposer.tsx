import { useEffect, useRef, useState } from 'react';
import { UploadCloud, X } from 'lucide-react';
import {
  drawPoster,
  ensureFonts,
  loadImage,
  PRESETS,
  ACCENTS,
  type PosterFields,
  type PresetKey,
  type AccentKey,
  type Ratio,
} from '../lib/posterComposer';

const PREVIEW_W = 600;
const MAX_LOGO_BYTES = 2 * 1024 * 1024;

interface Props {
  backgroundUrl: string;
  ratio: Ratio;
  fields: PosterFields;
  onFieldsChange: (f: PosterFields) => void;
  preset: PresetKey;
  onPresetChange: (p: PresetKey) => void;
  accent: AccentKey;
  onAccentChange: (a: AccentKey) => void;
}

export default function PosterComposer({
  backgroundUrl, ratio, fields, onFieldsChange, preset, onPresetChange, accent, onAccentChange,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [bgImg, setBgImg] = useState<HTMLImageElement | null>(null);
  const [logoImg, setLogoImg] = useState<HTMLImageElement | null>(null);
  const [logoError, setLogoError] = useState<string | null>(null);

  const set = (patch: Partial<PosterFields>) => onFieldsChange({ ...fields, ...patch });

  // Load the background whenever it changes.
  useEffect(() => {
    let cancelled = false;
    setBgImg(null);
    loadImage(backgroundUrl)
      .then((img) => { if (!cancelled) setBgImg(img); })
      .catch(() => { if (!cancelled) setBgImg(null); });
    return () => { cancelled = true; };
  }, [backgroundUrl]);

  // Load the logo whenever it changes.
  useEffect(() => {
    let cancelled = false;
    if (!fields.logo) { setLogoImg(null); return; }
    loadImage(fields.logo)
      .then((img) => { if (!cancelled) setLogoImg(img); })
      .catch(() => { if (!cancelled) setLogoImg(null); });
    return () => { cancelled = true; };
  }, [fields.logo]);

  // Redraw the live preview on any change.
  useEffect(() => {
    let cancelled = false;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const W = PREVIEW_W;
    const H = Math.round((PREVIEW_W * ratio.h) / ratio.w);
    canvas.width = W;
    canvas.height = H;
    (async () => {
      await ensureFonts();
      if (cancelled) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      drawPoster(ctx, { W, H, bg: bgImg, logo: logoImg, fields, preset, accent });
    })();
    return () => { cancelled = true; };
  }, [bgImg, logoImg, fields, preset, accent, ratio.w, ratio.h]);

  const onLogo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const ok = /(png|jpe?g|svg)/i.test(file.type) || /\.svg$/i.test(file.name);
    if (!ok) { setLogoError('Gebruik een PNG, JPG of SVG.'); return; }
    if (file.size > MAX_LOGO_BYTES) { setLogoError('Logo is te groot (max 2 MB).'); return; }
    setLogoError(null);
    const reader = new FileReader();
    reader.onload = () => set({ logo: String(reader.result) });
    reader.readAsDataURL(file);
  };

  const inputCls =
    'w-full bg-white border border-line rounded-card-sm px-3 py-2 text-ink text-xs placeholder-mist-2 focus:outline-none focus:border-cobalt focus:ring-1 focus:ring-cobalt shadow-soft';

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-mist">Zet je tekst &amp; logo op de achtergrond</span>
        <span className="text-[10px] font-mono font-bold text-cobalt bg-cobalt-soft border border-cobalt-soft rounded-full px-2 py-0.5">
          Formaat: {ratio.label}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-[minmax(0,190px)_1fr] gap-4 items-start">
        {/* Live preview */}
        <div className="rounded-card-sm overflow-hidden border border-line shadow-soft bg-paper-2">
          <canvas ref={canvasRef} className="w-full h-auto block" />
        </div>

        {/* Controls */}
        <div className="space-y-3">
          <div className="grid grid-cols-1 gap-2">
            <label className="space-y-1">
              <span className="text-[11px] font-bold text-mist">Bedrijfsnaam *</span>
              <input className={inputCls} value={fields.company} onChange={(e) => set({ company: e.target.value })} placeholder="Slagerij Jansen" />
            </label>
            <label className="space-y-1">
              <span className="text-[11px] font-bold text-mist">Slogan / aanbieding *</span>
              <input className={inputCls} value={fields.slogan} onChange={(e) => set({ slogan: e.target.value })} placeholder="5 worsten voor €10" />
            </label>
            <div className="grid grid-cols-2 gap-2">
              <label className="space-y-1">
                <span className="text-[11px] font-bold text-mist">Extra / prijs</span>
                <input className={inputCls} value={fields.price} onChange={(e) => set({ price: e.target.value })} placeholder="€10" />
              </label>
              <label className="space-y-1">
                <span className="text-[11px] font-bold text-mist">Website</span>
                <input className={inputCls} value={fields.url} onChange={(e) => set({ url: e.target.value })} placeholder="slagerijjansen.nl" />
              </label>
            </div>
          </div>

          {/* Logo */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-mist">Logo (optioneel)</span>
            <div className="flex items-center gap-2">
              {fields.logo ? (
                <div className="relative w-12 h-12 rounded-card-sm border border-line bg-paper-2 flex items-center justify-center overflow-hidden shrink-0">
                  <img src={fields.logo} alt="logo" className="max-w-full max-h-full object-contain" />
                  <button
                    type="button"
                    onClick={() => set({ logo: null })}
                    className="absolute -top-1.5 -right-1.5 bg-ink text-white rounded-full p-0.5 shadow cursor-pointer"
                    title="Logo verwijderen"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : null}
              <label className="inline-flex items-center gap-1.5 px-3 py-2 rounded-card-sm border border-line bg-white hover:bg-paper-2 text-mist text-[11px] font-bold cursor-pointer shadow-soft">
                <UploadCloud className="w-3.5 h-3.5" />
                {fields.logo ? 'Vervangen' : 'Logo uploaden'}
                <input type="file" accept="image/png,image/jpeg,image/svg+xml,.svg" className="hidden" onChange={onLogo} />
              </label>
            </div>
            {logoError && <p className="text-[10px] text-red-600 font-medium">{logoError}</p>}
            <p className="text-[10px] text-mist-2">PNG, JPG of SVG · max 2 MB</p>
          </div>

          {/* Layout preset */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-mist">Indeling</span>
            <div className="grid grid-cols-2 gap-1.5">
              {PRESETS.map((p) => (
                <button
                  key={p.key}
                  type="button"
                  onClick={() => onPresetChange(p.key)}
                  className={`px-2 py-1.5 rounded-card-sm text-[11px] font-bold border transition-all cursor-pointer ${
                    preset === p.key ? 'bg-cobalt-soft border-cobalt text-cobalt' : 'bg-white border-line text-mist hover:border-cobalt'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Colour accent */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-mist">Kleuraccent</span>
            <div className="flex gap-1.5">
              {ACCENTS.map((a) => (
                <button
                  key={a.key}
                  type="button"
                  onClick={() => onAccentChange(a.key)}
                  title={a.label}
                  className={`flex-1 py-1.5 rounded-card-sm text-[10px] font-bold border transition-all cursor-pointer ${
                    accent === a.key ? 'border-cobalt ring-2 ring-cobalt/20' : 'border-line hover:border-cobalt'
                  }`}
                  style={{ backgroundColor: a.plate === 'light' ? '#F4F1EA' : '#16213A', color: a.plate === 'light' ? '#16213A' : '#FFFFFF' }}
                >
                  {a.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
