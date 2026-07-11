import { MapPin, Plus, Check } from 'lucide-react';
import type { Screen, Audience } from '../../data/screens';
import type { PlanResult } from '../../lib/campaignEngine';
import { matchFactor } from '../../lib/campaignEngine';
import { fmt, euro } from './useCountUp';

interface PlanResultsProps {
  plan: PlanResult;
  aud: Audience;
  region: string;
  weeks: number;
  addedIds?: string[];
  onAddScreen: (screen: Screen) => void;
  onBookPlan: () => void;
  onOpenScreenDetail: (screen: Screen) => void;
}

export default function PlanResults({
  plan, aud, region, weeks, addedIds = [],
  onAddScreen, onBookPlan, onOpenScreenDetail,
}: PlanResultsProps) {
  const weekWord = weeks === 1 ? 'week' : 'weken';
  const regionLabel = region === 'NL' ? 'heel Nederland' : region.replace(/^(prov|city):/, '');
  const count = plan.selected.length;
  const added = new Set(addedIds);

  return (
    <section className="results" id="results">
      <div className="wrap">
        <div className="rhead">
          <h2>Zo ziet jouw plan eruit: <em>{count} {count === 1 ? 'scherm' : 'schermen'}</em></h2>
          <div className="sum">
            <b>{euro(plan.spend)}</b> voor {weeks} {weekWord}<br />
            <b>{fmt(plan.net)}</b> unieke mensen
          </div>
        </div>

        <p className="rnote">
          Dit is de goedkoopste bundel die je bereik maximaliseert onder <b>{regionLabel}</b> voor de doelgroep <b>{aud.toLowerCase()}</b>. Gerangschikt op relevant bereik per euro. Stad, wijk en doelgroep-match staan overal in beeld — je weet altijd wat je boekt en waar het hangt.
        </p>

        {count > 0 && (
          <div className="bookall">
            <button className="btn btn-primary" onClick={onBookPlan}>
              Boek dit hele plan ({count} {count === 1 ? 'scherm' : 'schermen'}) <span className="arr">→</span>
            </button>
          </div>
        )}

        <div className="grid">
          {plan.selected.slice(0, 12).map((s) => {
            const mf = matchFactor(s, aud);
            const matchPct = Math.round(mf * 100);
            const isAdded = added.has(s.id);
            return (
              <div
                key={s.id}
                className="card"
                onClick={() => onOpenScreenDetail(s)}
                role="button"
                tabIndex={0}
              >
                <div className="thumb">
                  <div className="grid-o" />
                  <div className="screen"><span>{s.type === 'digital' ? 'DIGITAAL' : 'ABRI'}</span></div>
                  <span className={`type ${s.type}`}>{s.type}</span>
                  {mf === 1 && <span className="match">{matchPct}% match</span>}
                </div>
                <div className="body">
                  <div className="loc"><MapPin size={12} strokeWidth={2.4} />{s.area} · {s.city}</div>
                  <h3>{s.name}</h3>
                  <div className="stats">
                    <div className="stat">
                      <div className="k">Bereik/week</div>
                      <div className="v">{fmt(s.weeklyReach)}</div>
                    </div>
                    <div className="stat" style={{ textAlign: 'right' }}>
                      <div className="k">Prijs/week</div>
                      <div className="v price">{euro(s.weeklyPrice)}</div>
                    </div>
                  </div>
                  <button
                    className={`addbtn${isAdded ? ' added' : ''}`}
                    onClick={(e) => { e.stopPropagation(); onAddScreen(s); }}
                  >
                    {isAdded
                      ? (<><Check size={15} strokeWidth={2.6} /> Toegevoegd</>)
                      : (<><Plus size={15} strokeWidth={2.6} /> Voeg toe aan campagne</>)}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="more">
          {count > 12 ? `+ nog ${count - 12} schermen in je plan` : ''}
        </div>
      </div>
    </section>
  );
}
