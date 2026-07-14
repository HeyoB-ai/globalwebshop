/**
 * Global — Buitenreclame logo.
 *
 * A self-contained inline SVG in the house style (cobalt tile, white out-of-home
 * screen on a post, amber "live" accent) plus the wordmark. No external asset, so
 * it scales crisply everywhere; swap the SVG here to drop in a supplied logo file.
 */

interface LogoProps {
  /** Mark height in px. */
  size?: number;
  /** 'full' = mark + wordmark, 'mark' = just the tile. */
  variant?: 'full' | 'mark';
  className?: string;
}

export function LogoMark({ size = 34 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true" className="shrink-0">
      <rect width="32" height="32" rx="8" fill="#2456E6" />
      {/* out-of-home screen */}
      <rect x="5" y="6" width="22" height="14" rx="3" fill="#FFFFFF" />
      <rect x="8.5" y="9.4" width="15" height="2.3" rx="1.15" fill="#2456E6" opacity="0.30" />
      <rect x="8.5" y="13.4" width="9.5" height="2.3" rx="1.15" fill="#2456E6" opacity="0.18" />
      {/* amber "live" accent */}
      <circle cx="23" cy="16" r="1.9" fill="#DE8A06" />
      {/* post */}
      <rect x="15" y="20" width="2" height="6" rx="1" fill="#FFFFFF" opacity="0.9" />
    </svg>
  );
}

export default function Logo({ size = 34, variant = 'full', className = '' }: LogoProps) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <LogoMark size={size} />
      {variant === 'full' && (
        <span className="flex items-baseline gap-2 leading-none">
          <span className="font-display font-extrabold text-lg tracking-tight text-ink">Global</span>
          <span className="text-xs font-medium text-mist">Buitenreclame</span>
        </span>
      )}
    </span>
  );
}
