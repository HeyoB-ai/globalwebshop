/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Location, IntakeAnswers, CartItem, TargetRegion } from './types';
import { MOCK_LOCATIONS, TARGET_AUDIENCES } from './data/mockData';
import IntakeScreen from './components/IntakeScreen';
import LocationCard from './components/LocationCard';
import LocationDetailModal from './components/LocationDetailModal';
import AICreationModal from './components/AICreationModal';
import InteractiveMap from './components/InteractiveMap';
import CartAndCheckout from './components/CartAndCheckout';
import { Sparkles, ShoppingBag, Map, List, Settings, Filter, Trash2, ArrowLeft, RefreshCw, Layout, Layers, Info, Check, ShieldCheck, Mail } from 'lucide-react';

const isLocationInRegion = (loc: Location, region: TargetRegion): boolean => {
  if (region.type === 'land') {
    return true;
  }
  
  if (region.type === 'provincie') {
    const prov = region.province;
    if (prov === 'Noord-Holland') return loc.city === 'Amsterdam';
    if (prov === 'Zuid-Holland') return loc.city === 'Rotterdam' || loc.city === 'Den Haag';
    if (prov === 'Utrecht') return loc.city === 'Utrecht';
    if (prov === 'Noord-Brabant') return loc.city === 'Eindhoven';
    if (prov === 'Groningen') return loc.city === 'Groningen';
    if (prov === 'Limburg') return loc.city === 'Maastricht';
    
    // Fallbacks for other provinces to closest cities
    if (prov === 'Flevoland') return loc.city === 'Utrecht' || loc.city === 'Amsterdam';
    if (prov === 'Friesland' || prov === 'Drenthe') return loc.city === 'Groningen';
    if (prov === 'Overijssel' || prov === 'Gelderland') return loc.city === 'Utrecht';
    if (prov === 'Zeeland') return loc.city === 'Rotterdam';
    return true; // Default
  }
  
  if (region.type === 'postcode' && region.postcode) {
    const pc = region.postcode.trim().replace(/\s+/g, '');
    const digits = parseInt(pc.substring(0, 2), 10);
    
    if (isNaN(digits)) return true; // Default to all if invalid postcode entered
    
    // Check range
    if (digits >= 10 && digits <= 21) return loc.city === 'Amsterdam';
    if (digits >= 30 && digits <= 33) return loc.city === 'Rotterdam';
    if (digits >= 25 && digits <= 29) return loc.city === 'Den Haag';
    if (digits >= 35 && digits <= 39) return loc.city === 'Utrecht';
    if (digits >= 50 && digits <= 59) return loc.city === 'Eindhoven';
    if (digits >= 90 && digits <= 99) return loc.city === 'Groningen';
    if (digits >= 60 && digits <= 64) return loc.city === 'Maastricht';
    
    // General fallback based on first digit
    const firstDigit = pc.charAt(0);
    if (firstDigit === '1' || firstDigit === '2') return loc.city === 'Amsterdam' || loc.city === 'Den Haag';
    if (firstDigit === '3') return loc.city === 'Utrecht' || loc.city === 'Rotterdam';
    if (firstDigit === '4' || firstDigit === '5') return loc.city === 'Eindhoven';
    if (firstDigit === '6' || firstDigit === '7') return loc.city === 'Maastricht' || loc.city === 'Utrecht';
    if (firstDigit === '8' || firstDigit === '9') return loc.city === 'Groningen';
  }
  
  return true;
};

export default function App() {
  const [view, setView] = useState<'intake' | 'browse' | 'cart'>('intake');
  const [answers, setAnswers] = useState<IntakeAnswers | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  
  // Filtering & View states
  const [mediaFilter, setMediaFilter] = useState<'all' | 'abri' | 'digital'>('all');
  const [cityFilter, setCityFilter] = useState<string>('all');
  const [showOnlyRecommended, setShowOnlyRecommended] = useState<boolean>(true);
  const [layoutMode, setLayoutMode] = useState<'grid' | 'map'>('grid');

  // Modal tracking states
  const [selectedLocationForDetail, setSelectedLocationForDetail] = useState<Location | null>(null);
  const [selectedLocationForCreative, setSelectedLocationForCreative] = useState<Location | null>(null);

  // Completed Intake Trigger
  const handleIntakeComplete = (intakeAnswers: IntakeAnswers) => {
    setAnswers(intakeAnswers);
    setShowOnlyRecommended(true); // Default to showing recommended first
    setView('browse');
  };

  // Reset campaign & answers
  const handleResetCampaign = () => {
    if (window.confirm('Weet u zeker dat u uw antwoorden wilt resetten en een nieuwe campagne wilt starten?')) {
      setAnswers(null);
      setCart([]);
      setView('intake');
    }
  };

  // Cart actions
  const handleToggleCart = (location: Location) => {
    const existingIndex = cart.findIndex((item) => item.location.id === location.id);
    if (existingIndex > -1) {
      setCart((prev) => prev.filter((item) => item.location.id !== location.id));
    } else {
      setCart((prev) => [...prev, { location, weeks: 1 }]);
    }
  };

  const handleRemoveCartItem = (locationId: string) => {
    setCart((prev) => prev.filter((item) => item.location.id !== locationId));
  };

  const handleUpdateWeeks = (locationId: string, weeks: number) => {
    setCart((prev) =>
      prev.map((item) => (item.location.id === locationId ? { ...item, weeks } : item))
    );
  };

  // Configure creative for an item
  const handleConfigureCreative = (location: Location) => {
    setSelectedLocationForCreative(location);
  };

  // Save creative from modal
  const handleSaveCreative = (creative: any) => {
    if (!selectedLocationForCreative) return;
    setCart((prev) =>
      prev.map((item) =>
        item.location.id === selectedLocationForCreative.id
          ? { ...item, creative }
          : item
      )
    );
    setSelectedLocationForCreative(null);
  };

  // Update an existing creative in place (e.g. edits from the fullscreen editor in the cart)
  const handleUpdateCreative = (locationId: string, creative: CartItem['creative']) => {
    setCart((prev) =>
      prev.map((item) => (item.location.id === locationId ? { ...item, creative } : item))
    );
  };

  // Recommendation matcher engine (Problem #1)
  const recommendedLocations = useMemo(() => {
    if (!answers) return [];
    
    // 1. Filter by target audience matching tags
    let matched = MOCK_LOCATIONS.filter((loc) =>
      loc.recommendedFor.includes(answers.targetAudience)
    );
    
    // 2. Filter by target region
    if (answers.region) {
      matched = matched.filter((loc) => isLocationInRegion(loc, answers.region));
    }
    
    return matched;
  }, [answers]);

  const recommendedIds = useMemo(() => {
    return recommendedLocations.map((l) => l.id);
  }, [recommendedLocations]);

  // Compute final filtered locations list
  const filteredLocations = useMemo(() => {
    return MOCK_LOCATIONS.filter((loc) => {
      // 1. Media format type filter (Problem #3)
      if (mediaFilter !== 'all' && loc.type !== mediaFilter) {
        return false;
      }
      // 2. City filter
      if (cityFilter !== 'all' && loc.city !== cityFilter) {
        return false;
      }
      // 3. Recommended filter (Problem #1)
      if (answers && showOnlyRecommended && !recommendedIds.includes(loc.id)) {
        return false;
      }
      return true;
    });
  }, [mediaFilter, cityFilter, showOnlyRecommended, recommendedIds, answers]);

  // Unique list of cities for the filter menu
  const availableCities = useMemo(() => {
    const cities = MOCK_LOCATIONS.map((loc) => loc.city);
    return ['all', ...Array.from(new Set(cities))];
  }, []);

  const currentAudienceName = useMemo(() => {
    if (!answers) return '';
    return TARGET_AUDIENCES.find((ta) => ta.id === answers.targetAudience)?.name || answers.targetAudience;
  }, [answers]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-850 flex flex-col font-sans">
      
      {/* Header Bar */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200 px-4 py-4 sm:px-6 shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          
          {/* Logo & Subtitle */}
          <button
            onClick={() => {
              if (answers) setView('browse');
              else setView('intake');
            }}
            className="flex items-center gap-3 text-left focus:outline-none focus:ring-0 cursor-pointer"
          >
            <div className="w-10 h-10 rounded-lg bg-blue-700 flex items-center justify-center text-white font-bold text-xl shadow-xs">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg tracking-tight text-slate-850 font-sans uppercase">GLOBAL <span className="text-blue-700">OUTDOOR</span></span>
                <span className="text-xs bg-blue-50 text-blue-700 font-bold px-2 py-0.5 rounded-full border border-blue-200 font-mono">PITCH DEMO</span>
              </div>
              <p className="text-[10px] text-slate-500 font-mono tracking-wider">OUT-OF-HOME REDESIGN PLATFORM</p>
            </div>
          </button>

          {/* Current Campaign Quick Indicator */}
          {answers && (
            <div className="hidden md:flex items-center gap-4 bg-slate-100/50 border border-slate-200 px-4 py-2 rounded-2xl text-xs">
              <div className="space-y-0.5">
                <span className="text-[10px] font-mono text-slate-500 block uppercase font-bold">Jouw Campagneprofiel</span>
                <div className="flex items-center gap-1.5 text-slate-750">
                  <span className="font-bold text-slate-800 max-w-[150px] truncate" title={answers.businessType}>
                    {answers.businessType}
                  </span>
                  <span className="text-slate-300">|</span>
                  <span className="text-blue-700 font-medium">{currentAudienceName}</span>
                </div>
              </div>
              
              <div className="border-l border-slate-200 pl-4 space-y-0.5">
                <span className="text-[10px] font-mono text-slate-500 block uppercase font-bold">Target Regio</span>
                <span className="font-bold text-blue-700">
                  {answers.region.type === 'land' && 'Hele land'}
                  {answers.region.type === 'provincie' && `${answers.region.province}`}
                  {answers.region.type === 'postcode' && `${answers.region.postcode || '1012'} (+${answers.region.radius}km)`}
                </span>
              </div>

              <div className="border-l border-slate-200 pl-4 space-y-0.5">
                <span className="text-[10px] font-mono text-slate-500 block uppercase font-bold">Maandbudget</span>
                <span className="font-bold text-emerald-600 font-mono">€{answers.budget}</span>
              </div>

              <button
                onClick={handleResetCampaign}
                className="ml-2 text-[10px] bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-800 border border-slate-200 px-2 py-1.5 rounded-lg flex items-center gap-1 transition-all cursor-pointer shadow-xs"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            </div>
          )}

          {/* Cart & View Actions */}
          <div className="flex items-center gap-3">
            {answers && view !== 'intake' && (
              <button
                onClick={() => setView(view === 'browse' ? 'cart' : 'browse')}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  view === 'cart'
                    ? 'bg-blue-700 text-white shadow-md'
                    : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-xs'
                }`}
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Campagne</span>
                {cart.length > 0 && (
                  <span className="bg-emerald-600 text-white font-black text-[10px] w-5 h-5 rounded-full flex items-center justify-center animate-pulse">
                    {cart.length}
                  </span>
                )}
              </button>
            )}
          </div>

        </div>
      </header>

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        
        {/* INTAKE VIEW */}
        {view === 'intake' && (
          <IntakeScreen onComplete={handleIntakeComplete} />
        )}

        {/* BROWSE/LOCATIONS VIEW */}
        {view === 'browse' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            
            {/* Context Profile Banner (Visible on Mobile/Tablet if answers configured) */}
            {answers && (
              <div className="md:hidden bg-white border border-slate-200 p-4 rounded-2xl space-y-2 flex justify-between items-center text-xs shadow-xs">
                <div className="space-y-1">
                  <span className="text-[9px] font-mono text-slate-500 uppercase block leading-none font-bold">Doelgroep, Regio & Budget</span>
                  <p className="text-slate-800 font-bold leading-tight">{currentAudienceName}</p>
                  <p className="text-slate-500 text-[11px] leading-tight font-medium">
                    Regio:{' '}
                    {answers.region.type === 'land' && 'Hele land'}
                    {answers.region.type === 'provincie' && `${answers.region.province}`}
                    {answers.region.type === 'postcode' && `${answers.region.postcode || '1012'} (+${answers.region.radius}km)`}
                  </p>
                  <p className="text-emerald-600 font-mono font-bold leading-none">€{answers.budget} / mnd</p>
                </div>
                <button
                  onClick={handleResetCampaign}
                  className="bg-slate-100 border border-slate-200 px-2.5 py-1.5 rounded-xl text-[10px] text-slate-600 font-semibold cursor-pointer hover:bg-slate-200"
                >
                  Wijzig
                </button>
              </div>
            )}

            {/* Title block & Filters bar */}
            <div className="bg-white p-4 sm:p-6 rounded-3xl border border-slate-200 flex flex-col gap-6 shadow-xs">
              
              {/* Header Title with Smart recommendations count */}
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <div className="space-y-1">
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
                    {showOnlyRecommended ? 'Geadviseerde campagnelocaties' : 'Bladeren door alle locaties'}
                  </h2>
                  <p className="text-xs text-slate-500">
                    {answers ? (
                      <span>
                        Op basis van jouw antwoorden hebben we <strong className="text-blue-700 font-semibold">{recommendedLocations.length} locaties</strong> geselecteerd met het hoogste bereik onder <strong className="text-slate-800">{currentAudienceName}</strong> in{' '}
                        <strong className="text-slate-850">
                          {answers.region.type === 'land' && 'heel Nederland'}
                          {answers.region.type === 'provincie' && `de provincie ${answers.region.province}`}
                          {answers.region.type === 'postcode' && `regio ${answers.region.postcode || '1012'} (+${answers.region.radius}km)`}
                        </strong>.
                      </span>
                    ) : (
                      <span>Maak een mix van abri's en digitale schermen voor jouw campagne.</span>
                    )}
                  </p>
                </div>

                {/* Grid / Map layout toggle */}
                <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200/80 self-start sm:self-auto text-xs">
                  <button
                    onClick={() => setLayoutMode('grid')}
                    className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                      layoutMode === 'grid'
                        ? 'bg-blue-700 text-white shadow-xs'
                        : 'text-slate-500 hover:text-slate-850'
                    }`}
                  >
                    <List className="w-3.5 h-3.5" />
                    <span>Lijst & mockups</span>
                  </button>
                  <button
                    onClick={() => setLayoutMode('map')}
                    className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                      layoutMode === 'map'
                        ? 'bg-blue-700 text-white shadow-xs'
                        : 'text-slate-500 hover:text-slate-850'
                    }`}
                  >
                    <Map className="w-3.5 h-3.5" />
                    <span>Kaartweergave</span>
                  </button>
                </div>
              </div>

              {/* Filtering Controls */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 border-t border-slate-100 pt-4">
                
                {/* 1. Media formats filter (Solves Problem #3, showcases combining them) */}
                <div className="md:col-span-4 space-y-1.5">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block font-bold">Media Type</span>
                  <div className="grid grid-cols-3 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
                    <button
                      onClick={() => setMediaFilter('all')}
                      className={`py-1.5 rounded-lg font-medium text-center transition-all cursor-pointer ${
                        mediaFilter === 'all' ? 'bg-white text-slate-800 border border-slate-200/60 font-semibold shadow-xs' : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      Beide
                    </button>
                    <button
                      onClick={() => setMediaFilter('abri')}
                      className={`py-1.5 rounded-lg font-medium text-center transition-all cursor-pointer ${
                        mediaFilter === 'abri' ? 'bg-amber-500 text-slate-950 font-black shadow-xs' : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      Abri's
                    </button>
                    <button
                      onClick={() => setMediaFilter('digital')}
                      className={`py-1.5 rounded-lg font-medium text-center transition-all cursor-pointer ${
                        mediaFilter === 'digital' ? 'bg-cyan-500 text-slate-950 font-black shadow-xs' : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      Digitaal
                    </button>
                  </div>
                </div>

                {/* 2. City Filter */}
                <div className="md:col-span-3 space-y-1.5">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block font-bold">Stad / Regio</span>
                  <select
                    value={cityFilter}
                    onChange={(e) => setCityFilter(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 text-xs focus:outline-none focus:border-blue-500 cursor-pointer shadow-xs"
                  >
                    <option value="all">Alle steden (Nederland)</option>
                    {availableCities.filter(c => c !== 'all').map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 3. Personalized vs. All locations Toggle */}
                {answers && (
                  <div className="md:col-span-5 space-y-1.5 flex flex-col justify-end">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block font-bold">Aanbevelingen filter</span>
                    <div className="flex items-center justify-between p-2.5 bg-slate-100 rounded-xl border border-slate-200 text-xs">
                      <span className="text-slate-700 font-medium">Toon alleen gepersonaliseerde match</span>
                      <button
                        type="button"
                        onClick={() => setShowOnlyRecommended(!showOnlyRecommended)}
                        className={`w-11 h-6 rounded-full transition-colors relative flex items-center p-1 cursor-pointer ${
                          showOnlyRecommended ? 'bg-blue-700' : 'bg-slate-300'
                        }`}
                      >
                        <div
                          className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                            showOnlyRecommended ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                )}

              </div>
            </div>

            {/* Layout Display: Map vs Grid */}
            {layoutMode === 'map' ? (
              <InteractiveMap
                locations={filteredLocations}
                selectedLocation={selectedLocationForDetail}
                onSelectLocation={(loc) => setSelectedLocationForDetail(loc)}
                recommendedIds={recommendedIds}
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredLocations.map((loc) => (
                  <LocationCard
                    key={loc.id}
                    location={loc}
                    isRecommended={recommendedIds.includes(loc.id)}
                    isInCart={cart.some((item) => item.location.id === loc.id)}
                    onViewDetails={(l) => setSelectedLocationForDetail(l)}
                    onToggleCart={(l) => handleToggleCart(l)}
                    targetAudienceName={answers ? currentAudienceName : undefined}
                  />
                ))}

                {filteredLocations.length === 0 && (
                  <div className="col-span-full bg-white border border-slate-200 p-16 text-center rounded-3xl space-y-4 shadow-xs">
                    <Filter className="w-12 h-12 text-slate-400 mx-auto" />
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-slate-800">Geen locaties gevonden</p>
                      <p className="text-xs text-slate-500">Pas de filters hierboven aan of zet "Toon alleen gepersonaliseerde match" uit.</p>
                    </div>
                    <button
                      onClick={() => {
                        setMediaFilter('all');
                        setCityFilter('all');
                        setShowOnlyRecommended(false);
                      }}
                      className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl text-xs text-slate-700 transition-all font-medium cursor-pointer shadow-xs"
                    >
                      Herstel alle filters
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* CART & CHECKOUT VIEW */}
        {view === 'cart' && (
          <CartAndCheckout
            cartItems={cart}
            onRemoveItem={handleRemoveCartItem}
            onConfigureCreative={handleConfigureCreative}
            onUpdateCreative={handleUpdateCreative}
            onBackToLocations={() => setView('browse')}
            onClearCart={() => setCart([])}
          />
        )}

      </main>

      {/* FOOTER */}
      <footer className="bg-white border-t border-slate-200 px-4 py-12 text-xs text-slate-500 mt-16 shadow-xs">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-5 space-y-2.5">
            <div className="flex items-center gap-1">
              <span className="font-extrabold text-sm text-slate-800 tracking-tight">GLOBAL REDESIGN HUB</span>
              <span className="text-[9px] bg-blue-50 text-blue-700 font-mono font-bold border border-blue-200 px-1 rounded">PROTOTYPE</span>
            </div>
            <p className="leading-relaxed text-slate-650">
              Dit is een interactieve visualisatie/pitchdemo ontworpen om aan te tonen hoe het buitenreclame-aankoopplatform voor ondernemers geoptimaliseerd kan worden.
            </p>
            <p className="text-[10px] text-slate-400">
              © 2026 Global Buitenreclame Redesign Pitch. Alle rechten voorbehouden.
            </p>
          </div>

          <div className="md:col-span-7 flex flex-wrap gap-8 justify-start md:justify-end text-[11px]">
            <div>
              <span className="font-bold text-slate-700 block mb-2 uppercase tracking-wider font-mono text-[10px]">Opgeloste Problemen</span>
              <ul className="space-y-1 text-slate-500">
                <li>1. Intakevragen i.p.v. lege kaart</li>
                <li>2. Altijd stad & plaats zichtbaar</li>
                <li>3. Abri + digitaal in 1 boeking</li>
                <li>4. Uitgebreide vlakomschrijving</li>
                <li>5. Duidelijke contentrestricties per vlak</li>
                <li>6. Upload & AI-creatie / checklist</li>
              </ul>
            </div>
            
            <div>
              <span className="font-bold text-slate-700 block mb-2 uppercase tracking-wider font-mono text-[10px]">Overig</span>
              <ul className="space-y-1 text-slate-500">
                <li>Vite + React 19 SPA</li>
                <li>Tailwind CSS v4 styling</li>
                <li>Draagbare mock-kaart</li>
                <li>AI Poster Preview Generator</li>
              </ul>
            </div>
          </div>
        </div>
      </footer>

      {/* DETAIL MODAL OVERLAYS (Problem #2, #4, #5) */}
      {selectedLocationForDetail && (
        <LocationDetailModal
          location={selectedLocationForDetail}
          onClose={() => setSelectedLocationForDetail(null)}
          onToggleCart={(loc) => handleToggleCart(loc)}
          isInCart={cart.some((item) => item.location.id === selectedLocationForDetail.id)}
        />
      )}

      {/* AI CREATION MODAL OVERLAYS (Problem #6) */}
      {selectedLocationForCreative && (
        <AICreationModal
          location={selectedLocationForCreative}
          onClose={() => setSelectedLocationForCreative(null)}
          onSaveCreative={handleSaveCreative}
          currentCreative={cart.find((item) => item.location.id === selectedLocationForCreative.id)?.creative}
        />
      )}

    </div>
  );
}
