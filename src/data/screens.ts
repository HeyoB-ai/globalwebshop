/**
 * Synthetic screen inventory.
 *
 * Ported 1:1 from the <script> data block in design/reference.html (part 1).
 * The shape mirrors the real ~3.900-screen inventory that will replace this
 * later; the numbers are generated deterministically (mulberry32, seed
 * 20260710) so they are identical to the approved design demo.
 */

export type ScreenType = 'abri' | 'digital';

export type Audience =
  | 'Forensen'
  | 'Gezinnen'
  | 'Studenten'
  | 'Sportievelingen'
  | 'Zakelijk publiek';

export interface Screen {
  id: string;
  name: string;
  city: string;
  area: string;
  province: string;
  type: ScreenType;
  weeklyReach: number;
  weeklyPrice: number;
  audiences: Audience[];
  lat: number;
  lng: number;
}

export interface CityProfile {
  city: string;
  prov: string;
  n: number;
  lat: number;
  lng: number;
  w: Partial<Record<Audience, number>>;
  areas: string[];
}

export const AUDIENCES: Audience[] = [
  'Forensen',
  'Gezinnen',
  'Studenten',
  'Sportievelingen',
  'Zakelijk publiek',
];

export const CITY_PROFILES: CityProfile[] = [
  { city: 'Amsterdam', prov: 'Noord-Holland', n: 26, lat: 52.37, lng: 4.90, w: { Studenten: .9, 'Zakelijk publiek': .9, Forensen: .9, Gezinnen: .5, Sportievelingen: .5 }, areas: ['Centrum', 'Zuid', 'De Pijp', 'Oost', 'Zuidas', 'Station Sloterdijk', 'Nieuw-West'] },
  { city: 'Rotterdam', prov: 'Zuid-Holland', n: 22, lat: 51.92, lng: 4.48, w: { Forensen: .9, 'Zakelijk publiek': .8, Studenten: .7, Gezinnen: .6, Sportievelingen: .5 }, areas: ['Centrum', 'Blaak', 'Kop van Zuid', 'Alexander', 'Delfshaven', 'Noord'] },
  { city: 'Den Haag', prov: 'Zuid-Holland', n: 18, lat: 52.08, lng: 4.31, w: { 'Zakelijk publiek': .9, Forensen: .8, Gezinnen: .6, Studenten: .5, Sportievelingen: .5 }, areas: ['Centrum', 'Beatrixkwartier', 'Scheveningen', 'Ypenburg', 'Station HS'] },
  { city: 'Utrecht', prov: 'Utrecht', n: 20, lat: 52.09, lng: 5.12, w: { Studenten: .95, Forensen: .9, 'Zakelijk publiek': .7, Gezinnen: .6, Sportievelingen: .6 }, areas: ['Hoog Catharijne', 'Centrum', 'Uithof', 'Leidsche Rijn', 'Overvecht'] },
  { city: 'Eindhoven', prov: 'Noord-Brabant', n: 14, lat: 51.44, lng: 5.48, w: { Studenten: .8, 'Zakelijk publiek': .8, Forensen: .7, Gezinnen: .6, Sportievelingen: .6 }, areas: ['Centrum', 'Strijp-S', 'Station', 'High Tech Campus', 'Woensel'] },
  { city: 'Groningen', prov: 'Groningen', n: 12, lat: 53.22, lng: 6.57, w: { Studenten: .95, Gezinnen: .5, Forensen: .5, Sportievelingen: .6, 'Zakelijk publiek': .5 }, areas: ['Grote Markt', 'Centrum', 'Zernike', 'Station'] },
  { city: 'Tilburg', prov: 'Noord-Brabant', n: 10, lat: 51.56, lng: 5.09, w: { Studenten: .7, Gezinnen: .7, Forensen: .6, Sportievelingen: .6, 'Zakelijk publiek': .5 }, areas: ['Centrum', 'Spoorzone', 'Reeshof'] },
  { city: 'Nijmegen', prov: 'Gelderland', n: 10, lat: 51.84, lng: 5.86, w: { Studenten: .85, Gezinnen: .6, Sportievelingen: .6, Forensen: .5, 'Zakelijk publiek': .5 }, areas: ['Centrum', 'Heyendaal', 'Station', 'Lent'] },
  { city: 'Breda', prov: 'Noord-Brabant', n: 9, lat: 51.59, lng: 4.78, w: { Gezinnen: .7, Forensen: .6, Studenten: .6, 'Zakelijk publiek': .5, Sportievelingen: .6 }, areas: ['Centrum', 'Station', 'Ginneken'] },
  { city: 'Haarlem', prov: 'Noord-Holland', n: 8, lat: 52.38, lng: 4.64, w: { Gezinnen: .8, 'Zakelijk publiek': .6, Forensen: .6, Sportievelingen: .6, Studenten: .4 }, areas: ['Grote Markt', 'Centrum', 'Schalkwijk'] },
  { city: 'Amersfoort', prov: 'Utrecht', n: 8, lat: 52.16, lng: 5.39, w: { Forensen: .8, Gezinnen: .7, 'Zakelijk publiek': .6, Sportievelingen: .5, Studenten: .4 }, areas: ['Centrum', 'Station', 'Vathorst'] },
  { city: 'Arnhem', prov: 'Gelderland', n: 8, lat: 51.98, lng: 5.90, w: { Gezinnen: .7, Forensen: .6, Studenten: .6, Sportievelingen: .6, 'Zakelijk publiek': .5 }, areas: ['Centrum', 'Station', 'Presikhaaf'] },
  { city: 'Maastricht', prov: 'Limburg', n: 8, lat: 50.85, lng: 5.69, w: { Studenten: .8, Gezinnen: .6, 'Zakelijk publiek': .5, Forensen: .5, Sportievelingen: .5 }, areas: ['Vrijthof', 'Centrum', 'Wyck', 'Station'] },
  { city: 'Zwolle', prov: 'Overijssel', n: 7, lat: 52.51, lng: 6.09, w: { Forensen: .7, Gezinnen: .7, Studenten: .6, 'Zakelijk publiek': .5, Sportievelingen: .5 }, areas: ['Centrum', 'Station', 'Stadshagen'] },
  { city: 'Leiden', prov: 'Zuid-Holland', n: 8, lat: 52.16, lng: 4.49, w: { Studenten: .85, Gezinnen: .6, Forensen: .6, 'Zakelijk publiek': .5, Sportievelingen: .5 }, areas: ['Centrum', 'Station', 'Bio Science Park'] },
];

/** Deterministic PRNG — identical stream to the demo. */
function mulberry32(a: number): () => number {
  return function () {
    a |= 0;
    a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Regenerate the synthetic inventory. Self-contained: it seeds its own RNG,
 * so every call reproduces the exact same list as the design demo.
 */
export function genScreens(): Screen[] {
  const rng = mulberry32(20260710);
  const pick = <T>(a: T[]): T => a[Math.floor(rng() * a.length)];
  const round = (v: number, s: number): number => Math.round(v / s) * s;

  const out: Screen[] = [];
  let id = 0;
  for (const c of CITY_PROFILES) {
    for (let i = 0; i < c.n; i++) {
      const digital = rng() < 0.58;
      const area = pick(c.areas);
      let auds = AUDIENCES.filter((a) => rng() < (c.w[a] || .4) * 0.85);
      if (auds.length === 0) auds = [pick(AUDIENCES)];
      const weeklyReach = digital ? round(70000 + rng() * 250000, 1000) : round(35000 + rng() * 115000, 1000);
      const weeklyPrice = digital ? round(210 + rng() * 430, 5) : round(110 + rng() * 200, 5);
      out.push({
        id: 's' + (id++),
        name: `${area} ${digital ? 'Digitaal Scherm' : 'Abri'}`,
        city: c.city,
        area,
        province: c.prov,
        type: digital ? 'digital' : 'abri',
        weeklyReach,
        weeklyPrice,
        audiences: auds,
        lat: c.lat + (rng() - .5) * .05,
        lng: c.lng + (rng() - .5) * .05,
      });
    }
  }
  return out;
}

export const SCREENS: Screen[] = genScreens();
