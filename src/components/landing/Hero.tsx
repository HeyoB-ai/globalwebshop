import { useEffect, useState, type ReactNode } from 'react';

interface HeroProps {
  /** The planner card rendered in the right column of the hero grid. */
  children: ReactNode;
}

/**
 * Hero with a full-bleed video background + the reference's light gradient
 * overlay (.hero::before). Under prefers-reduced-motion only the poster still
 * frame is shown. Holds the h1, lede and trust line.
 */
export default function Hero({ children }: HeroProps) {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    setReduced(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false);
  }, []);

  return (
    <section className="hero" id="top">
      <img className="hero-bgposter" src="/assets/hero-poster.jpg" alt="" aria-hidden="true" />
      {!reduced && (
        <video className="hero-bgvideo" autoPlay muted loop playsInline poster="/assets/hero-poster.jpg">
          <source src="/assets/hero.mp4" type="video/mp4" />
          <source src="/assets/hero.webm" type="video/webm" />
        </video>
      )}
      <div className="wrap hero-inner">
        <div className="hero-copy">
          <span className="eyebrow"><span className="pulse" />Buitenreclame voor het MKB · heel Nederland</span>
          <h1>Zoveel mogelijk mensen.<br /><span className="accent">Voor jouw budget.</span></h1>
          <p className="lede">Nog nooit geadverteerd? Geen reclamebureau? Daar is dit voor gemaakt. Vertel wie je wilt bereiken en wat je kwijt wilt — je ziet meteen hoe ver je komt.</p>
          <div className="trust">
            <span><b>3.900</b> schermen &amp; abri's</span><span className="sep">·</span>
            <span>Vaak live vanaf <b>morgen</b></span><span className="sep">·</span>
            <span>Al vanaf <b>€250</b></span>
          </div>
        </div>
        {children}
      </div>
    </section>
  );
}
