/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { IntakeAnswers } from '../types';
import { TARGET_AUDIENCES } from '../data/mockData';
import { Sparkles, Sliders, DollarSign, Target, ArrowRight, Lightbulb, Store, Dumbbell, Palette, Briefcase, MapPin, Globe, Map } from 'lucide-react';
import { motion } from 'motion/react';

interface IntakeScreenProps {
  onComplete: (answers: IntakeAnswers) => void;
}

const PRESETS = [
  { text: 'Een ambachtelijke biologische bakkerij', icon: Store, audience: 'Gezinnen' },
  { text: 'Een hippe boetiek sportschool met yoga & wellness', icon: Dumbbell, audience: 'Sportievelingen' },
  { text: 'Een online tech-festival voor jonge developers', icon: Palette, audience: 'Studenten' },
  { text: 'Een zakelijk fiscaal adviesbureau voor ZZP’ers', icon: Briefcase, audience: 'Zakelijk publiek' }
];

const PROVINCES = [
  'Drenthe',
  'Flevoland',
  'Friesland',
  'Gelderland',
  'Groningen',
  'Limburg',
  'Noord-Brabant',
  'Noord-Holland',
  'Overijssel',
  'Utrecht',
  'Zeeland',
  'Zuid-Holland'
];

export default function IntakeScreen({ onComplete }: IntakeScreenProps) {
  const [businessType, setBusinessType] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [regionType, setRegionType] = useState<'postcode' | 'provincie' | 'land'>('postcode');
  const [postcode, setPostcode] = useState('');
  const [radius, setRadius] = useState(10);
  const [province, setProvince] = useState('Noord-Holland');
  const [budget, setBudget] = useState(500);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);

  const handlePresetClick = (text: string, audience: string) => {
    setBusinessType(text);
    setTargetAudience(audience);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessType || !targetAudience) return;

    setIsSubmitting(true);

    const regionDesc =
      regionType === 'postcode'
        ? `postcodegebied ${postcode || '1012'} (+${radius}km)`
        : regionType === 'provincie'
        ? `provincie ${province}`
        : 'heel Nederland';

    // Simulate smart backend/AI recommendation engine mapping demographics
    const steps = [
      `Analyseren van passantenstromen in regio ${regionDesc}...`,
      `Filteren op locaties met hoog aandeel ${targetAudience.toLowerCase()}...`,
      'Optimaliseren van budgetverdeling over abri’s & digitale schermen...',
      'Genereren van gepersonaliseerd mediaplan...'
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < steps.length - 1) {
        currentStep++;
        setLoadingStep(currentStep);
      } else {
        clearInterval(interval);
        onComplete({
          businessType,
          targetAudience,
          region: {
            type: regionType,
            postcode: regionType === 'postcode' ? postcode : undefined,
            radius: regionType === 'postcode' ? radius : undefined,
            province: regionType === 'provincie' ? province : undefined,
          },
          budget
        });
      }
    }, 850);
  };

  const getBudgetLabel = (val: number) => {
    if (val < 250) return { label: 'Micro campagne', desc: 'Ideaal voor 1 gerichte, lokale abri of kortere inzet van een digitaal scherm.' };
    if (val < 600) return { label: 'MKB-starterscampagne', desc: 'Uitstekende mix! Combineer bijvoorbeeld 1 fysieke abri én 1 digitaal scherm voor hoog herhaalbereik.' };
    if (val < 1200) return { label: 'Groei & dominantie', desc: 'Meerdere hoog-volume schermen en abri’s op drukke knooppunten gedurende 1-2 weken.' };
    return { label: 'Premium impact', desc: 'Maximale merkzichtbaarheid op onze absolute A-locaties (o.a. Hoog Catharijne & Leidsestraat).' };
  };

  const budgetInfo = getBudgetLabel(budget);

  const stepsList = [
    'Analyseren van passantenstromen in geselecteerde steden...',
    'Filteren op locaties met hoog aandeel ' + targetAudience.toLowerCase() + '...',
    'Optimaliseren van budgetverdeling over abri’s & digitale schermen...',
    'Genereren van gepersonaliseerd mediaplan...'
  ];

  if (isSubmitting) {
    return (
      <div className="min-h-[500px] flex flex-col items-center justify-center text-center p-8 bg-white rounded-3xl border border-slate-200 shadow-sm">
        <div className="relative mb-8">
          <div className="w-24 h-24 rounded-full border-4 border-blue-100 border-t-blue-700 animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-blue-700 animate-pulse" />
          </div>
        </div>
        <motion.div
          key={loadingStep}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="space-y-3 max-w-md"
        >
          <h3 className="text-xl font-bold text-slate-800 tracking-tight">Onze AI berekent jouw optimale campagne...</h3>
          <p className="text-sm text-blue-700 font-mono font-bold">{stepsList[loadingStep]}</p>
          <div className="w-48 h-1.5 bg-slate-100 rounded-full mx-auto overflow-hidden">
            <div
              className="h-full bg-blue-700 transition-all duration-700 ease-out"
              style={{ width: `${((loadingStep + 1) / stepsList.length) * 100}%` }}
            />
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Intro pitch section */}
      <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 rounded-full border border-blue-100 text-xs font-bold shadow-xs">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Buitenreclame heruitgevonden</span>
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 leading-[1.1] font-sans">
          Wie wil je <span className="text-blue-700">bereiken</span> en wat mag het <span className="text-blue-700">kosten</span>?
        </h1>
        <p className="text-slate-650 leading-relaxed text-sm sm:text-base">
          Met onze slimme planner bereik je direct de juiste mensen in jouw buurt. Geef hiernaast aan wie je wilt bereiken en kies een budget dat bij jou past. Onze AI stelt meteen de beste locaties voor!
        </p>

        <div className="bg-white border border-slate-200 p-5 rounded-2xl space-y-3 shadow-xs">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-amber-500" />
            <span>Waarom dit redesign beter werkt:</span>
          </h3>
          <ul className="space-y-2 text-xs text-slate-500">
            <li className="flex items-start gap-2">
              <span className="text-emerald-600 font-bold">✓</span>
              <span><strong>Doelgroep-eerst:</strong> Geen handmatige straat-zoektocht. Ons algoritme stelt de beste locaties voor.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-600 font-bold">✓</span>
              <span><strong>Media-mix:</strong> Combineer papieren abri’s én digitale schermen naadloos in één boeking.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-600 font-bold">✓</span>
              <span><strong>AI-ondersteuning:</strong> Upload direct of laat de ingebouwde AI direct een poster ontwerpen of checken.</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Intake questionnaire container */}
      <form onSubmit={handleSubmit} className="lg:col-span-7 bg-white border border-slate-200 p-6 sm:p-8 rounded-3xl space-y-8 shadow-sm">
        {/* Question 1: Business Type */}
        <div className="space-y-3">
          <label className="block text-sm font-semibold text-slate-800 flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-50 text-blue-700 text-xs font-mono font-bold">1</span>
            Wat voor bedrijf heb je of wat wil je promoten?
          </label>
          <input
            type="text"
            required
            value={businessType}
            onChange={(e) => setBusinessType(e.target.value)}
            placeholder="Bijv. Een lokale bakkerij, een nieuw fitness abonnement, biologische frisdranken..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 text-sm transition-all"
          />

          {/* Presets */}
          <div className="space-y-2">
            <span className="text-[11px] font-mono text-slate-400 block font-bold">Snelkeuze voorbeelden (klik om te vullen):</span>
            <div className="flex flex-wrap gap-2">
              {PRESETS.map((preset, idx) => {
                const Icon = preset.icon;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handlePresetClick(preset.text, preset.audience)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs text-slate-600 hover:text-slate-850 transition-all text-left cursor-pointer shadow-2xs"
                  >
                    <Icon className="w-3.5 h-3.5 text-blue-600" />
                    <span>{preset.text}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Question 2: Target Audience */}
        <div className="space-y-3">
          <label className="block text-sm font-semibold text-slate-800 flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-50 text-blue-700 text-xs font-mono font-bold">2</span>
            Wie is jouw primaire doelgroep?
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {TARGET_AUDIENCES.map((audience) => {
              const isSelected = targetAudience === audience.id;
              return (
                <button
                  key={audience.id}
                  type="button"
                  onClick={() => setTargetAudience(audience.id)}
                  className={`p-4 rounded-xl text-left border transition-all relative flex flex-col justify-between h-28 cursor-pointer ${
                    isSelected
                      ? 'bg-blue-50/70 border-blue-500 text-blue-900 shadow-xs ring-2 ring-blue-700/10'
                      : 'bg-slate-50/50 border-slate-200 hover:border-slate-300 text-slate-600 hover:text-slate-800'
                  }`}
                >
                  <div className="flex justify-between items-start w-full">
                    <span className="font-semibold text-sm leading-tight">
                      {audience.name}
                    </span>
                    <Target className={`w-4 h-4 ${isSelected ? 'text-blue-700' : 'text-slate-400'}`} />
                  </div>
                  <p className="text-[11px] text-slate-500 leading-normal line-clamp-2 mt-2">
                    {audience.desc}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Question 3: Target Region */}
        <div className="space-y-3">
          <label className="block text-sm font-semibold text-slate-800 flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-50 text-blue-700 text-xs font-mono font-bold">3</span>
            In welke regio wil je je publiek bereiken?
          </label>
          
          {/* Segmented controls for region type selection */}
          <div className="grid grid-cols-3 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
            <button
              type="button"
              onClick={() => setRegionType('postcode')}
              className={`py-2 rounded-lg font-semibold text-center transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                regionType === 'postcode'
                  ? 'bg-white text-slate-800 border border-slate-200/60 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Postcode</span>
            </button>
            <button
              type="button"
              onClick={() => setRegionType('provincie')}
              className={`py-2 rounded-lg font-semibold text-center transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                regionType === 'provincie'
                  ? 'bg-white text-slate-800 border border-slate-200/60 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Map className="w-3.5 h-3.5" />
              <span>Provincie</span>
            </button>
            <button
              type="button"
              onClick={() => setRegionType('land')}
              className={`py-2 rounded-lg font-semibold text-center transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                regionType === 'land'
                  ? 'bg-white text-slate-800 border border-slate-200/60 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Hele land</span>
            </button>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 min-h-[90px] flex flex-col justify-center">
            {/* Postcode form fields */}
            {regionType === 'postcode' && (
              <div className="space-y-3 animate-in fade-in duration-150">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1 space-y-1">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block font-bold">Postcode (bijv. 1012 of 1012 JS)</span>
                    <input
                      type="text"
                      value={postcode}
                      onChange={(e) => setPostcode(e.target.value.toUpperCase())}
                      placeholder="Bijv. 1012"
                      maxLength={7}
                      className="w-full bg-white border border-slate-250 rounded-xl px-3 py-2 text-slate-800 text-xs placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-2xs uppercase font-mono"
                    />
                  </div>
                  <div className="sm:w-2/3 space-y-1">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block font-bold">Straal: {radius} km</span>
                    <div className="flex gap-1">
                      {[2, 5, 10, 25, 50].map((r) => (
                        <button
                          key={r}
                          type="button"
                          onClick={() => setRadius(r)}
                          className={`flex-1 py-1.5 rounded-lg font-bold font-mono text-[11px] transition-all cursor-pointer border ${
                            radius === r
                              ? 'bg-blue-700 text-white border-blue-700'
                              : 'bg-white text-slate-600 hover:bg-slate-50 border-slate-200 shadow-2xs'
                          }`}
                        >
                          {r} km
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Province selector */}
            {regionType === 'provincie' && (
              <div className="space-y-1.5 animate-in fade-in duration-150">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block font-bold">Kies een provincie</span>
                <select
                  value={province}
                  onChange={(e) => setProvince(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 text-xs focus:outline-none focus:border-blue-500 cursor-pointer shadow-xs font-semibold animate-in fade-in"
                >
                  {PROVINCES.map((prov) => (
                    <option key={prov} value={prov}>
                      {prov}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Land Info */}
            {regionType === 'land' && (
              <div className="text-slate-600 text-xs leading-relaxed flex items-center gap-2.5 animate-in fade-in duration-150 font-medium">
                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                  <Globe className="w-4 h-4 text-blue-700" />
                </div>
                <span>
                  <strong>Landelijke campagne:</strong> Je advertenties worden strategisch verdeeld over de drukst bezochte A-locaties door heel Nederland voor een maximaal bereik.
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Question 4: Budget */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <label className="text-sm font-semibold text-slate-800 flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-50 text-blue-700 text-xs font-mono font-bold">4</span>
              Wat is je indicatieve maandbudget?
            </label>
            <span className="text-lg font-bold font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-xl">
              €{budget}
            </span>
          </div>

          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
            <div className="relative">
              <input
                type="range"
                min="100"
                max="2000"
                step="50"
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600 focus:outline-none"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-400 pt-1">
                <span>€100</span>
                <span>€500</span>
                <span>€1000</span>
                <span>€1500</span>
                <span>€2000+</span>
              </div>
            </div>

            {/* Dynamic Meter */}
            <div className="pt-2 border-t border-slate-200 space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold">Campagneklasse:</span>
                <span className="text-xs font-bold text-blue-700">{budgetInfo.label}</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                {budgetInfo.desc}
              </p>
            </div>
          </div>
        </div>

        {/* Submit Action */}
        {(() => {
          const isFormValid = !!businessType.trim() && !!targetAudience && (regionType !== 'postcode' || postcode.trim().length >= 4);
          return (
            <button
              type="submit"
              disabled={!isFormValid}
              className={`w-full py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                isFormValid
                  ? 'bg-blue-700 hover:bg-blue-600 text-white shadow-md'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
              }`}
            >
              <span>Bereken mijn gepersonaliseerde campagne</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          );
        })()}
      </form>
    </div>
  );
}
