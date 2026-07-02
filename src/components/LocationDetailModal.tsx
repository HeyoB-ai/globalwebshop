/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Location } from '../types';
import { X, MapPin, Users, Euro, Maximize2, ShieldAlert, FileText, CalendarRange, Clock, HelpCircle, Eye, Compass, Plus, Check } from 'lucide-react';

interface LocationDetailModalProps {
  location: Location;
  onClose: () => void;
  onToggleCart: (location: Location) => void;
  isInCart: boolean;
}

export default function LocationDetailModal({
  location,
  onClose,
  onToggleCart,
  isInCart
}: LocationDetailModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Dark Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col md:flex-row animate-in fade-in zoom-in-95 duration-200">
        
        {/* Left Side: Visuals, Photo, Coordinates Map */}
        <div className="md:w-5/12 bg-slate-50 flex flex-col relative border-b md:border-b-0 md:border-r border-slate-200">
          <div className="relative h-48 md:h-64">
            <img
              src={location.image}
              alt={location.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-85" />
            
            <button
              onClick={onClose}
              className="absolute top-4 right-4 bg-white/85 backdrop-blur-xs text-slate-700 hover:text-slate-900 p-2 rounded-full border border-slate-200 transition-all cursor-pointer shadow-xs"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Media badge */}
            <span className={`absolute bottom-4 left-4 text-[10px] font-bold font-mono uppercase tracking-wider px-2.5 py-1 rounded shadow border ${
              location.type === 'digital' ? 'bg-cyan-50 text-cyan-800 border-cyan-200' : 'bg-amber-50 text-amber-800 border-amber-200'
            }`}>
              {location.type === 'digital' ? 'Digitaal Scherm' : 'Klassieke Abri (Gedrukt)'}
            </span>
          </div>

          {/* Mini-Radar Intersection Map */}
          <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
            <div className="space-y-1.5">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-blue-700" />
                <span>Exacte Locatie & Radar</span>
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed font-sans">
                Gepositioneerd aan <strong className="text-slate-800">{location.street}</strong> in de wijk <strong className="text-slate-800">{location.neighborhood}</strong>.
              </p>
            </div>

            {/* Interactive/Mock vector radar map */}
            <div className="relative h-28 bg-slate-100 rounded-xl overflow-hidden border border-slate-200 flex items-center justify-center">
              {/* Radar grids */}
              <div className="absolute inset-0 bg-[radial-gradient(rgba(59,130,246,0.15)_1px,transparent_1px)] bg-[size:12px_12px]" />
              <div className="w-20 h-20 rounded-full border border-blue-500/15 absolute flex items-center justify-center">
                <div className="w-10 h-10 rounded-full border border-blue-500/25 absolute flex items-center justify-center" />
                <div className="w-2 h-2 rounded-full bg-blue-600 animate-ping absolute" />
                <div className="w-2 h-2 rounded-full bg-blue-600 absolute" />
              </div>
              
              {/* Radar swept line */}
              <div className="absolute w-12 h-1 bg-gradient-to-r from-blue-600/40 to-transparent transform origin-left rotate-45 animate-[spin_5s_linear_infinite]" />

              <div className="absolute bottom-2 left-2 text-[9px] font-mono text-slate-500 bg-white/90 px-1.5 py-0.5 rounded border border-slate-250">
                GPS: 52.{Math.round(location.coordinates.y * 1000)}° N, 4.{Math.round(location.coordinates.x * 1000)}° O
              </div>
            </div>

            {/* Price block */}
            <div className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl shadow-2xs">
              <div>
                <span className="text-[10px] font-mono text-slate-400 block uppercase leading-none font-bold">Investeringsindicatie</span>
                <span className="text-xl font-black text-emerald-700 font-mono">€{location.price}</span>
                <span className="text-[10px] text-slate-500"> / week ex. BTW</span>
              </div>
              <button
                onClick={() => onToggleCart(location)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                  isInCart
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-blue-700 hover:bg-blue-600 text-white shadow-xs'
                }`}
              >
                {isInCart ? (
                  <>
                    <Check className="w-3.5 h-3.5 shrink-0" />
                    <span>In winkelmand</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-3.5 h-3.5 shrink-0" />
                    <span>Boeken</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: Full Descriptions, Technical Specifications & Guidelines */}
        <div className="md:w-7/12 p-6 md:p-8 flex flex-col justify-between overflow-y-auto max-h-[90vh]">
          <div className="space-y-6">
            {/* Header */}
            <div className="space-y-1">
              <div className="flex items-center gap-1 text-xs text-blue-700 font-mono uppercase tracking-widest font-bold">
                <span>{location.city}</span>
                <span>•</span>
                <span>{location.neighborhood}</span>
              </div>
              <h2 className="text-2xl font-black text-slate-900 leading-tight font-sans">
                {location.name}
              </h2>
              <p className="text-xs text-slate-400 font-mono">ID: {location.id.toUpperCase()}</p>
            </div>

            {/* Core Metrics Grid */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1">
                <div className="flex items-center gap-1 text-slate-400">
                  <Users className="w-3.5 h-3.5 text-blue-700" />
                  <span className="text-[10px] font-mono uppercase font-bold tracking-wider">Bereik</span>
                </div>
                <p className="text-sm font-bold text-slate-800">{location.reach.toLocaleString('nl-NL')} <span className="text-[10px] font-normal text-slate-400">p.w.</span></p>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1">
                <div className="flex items-center gap-1 text-slate-400">
                  <Maximize2 className="w-3.5 h-3.5 text-amber-500" />
                  <span className="text-[10px] font-mono uppercase font-bold tracking-wider">Formaat</span>
                </div>
                <p className="text-xs font-bold text-slate-800 line-clamp-1" title={location.dimensions}>
                  {location.dimensions}
                </p>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1">
                <div className="flex items-center gap-1 text-slate-400">
                  <Eye className="w-3.5 h-3.5 text-purple-600" />
                  <span className="text-[10px] font-mono uppercase font-bold tracking-wider">Zichtbaarheid</span>
                </div>
                <p className="text-[10px] font-semibold text-slate-800 line-clamp-1" title={location.visibility}>
                  {location.visibility}
                </p>
              </div>
            </div>

            {/* Description Section (Solves Point #4) */}
            <div className="space-y-2">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                Omgevingsomschrijving & Kenmerken
              </h3>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3">
                <p className="text-xs sm:text-sm text-slate-650 leading-relaxed font-sans">
                  {location.description}
                </p>
                <div className="text-xs text-slate-500 border-t border-slate-200/50 pt-3">
                  <strong>Typische omgeving:</strong> {location.environment}
                </div>
              </div>
            </div>

            {/* Technical specs & Guidelines Section (Solves Point #5) */}
            <div className="space-y-3">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-blue-700" />
                <span>Specificaties & Richtlijnen</span>
              </h3>

              <div className="space-y-2.5">
                {/* Formats */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-1.5 text-xs">
                  <span className="sm:col-span-4 font-semibold text-slate-500">Toegestane formaten:</span>
                  <div className="sm:col-span-8 flex flex-wrap gap-1.5">
                    {location.specs.formats.map((f, idx) => (
                      <span key={idx} className="bg-white border border-slate-200 px-2 py-0.5 rounded text-[10px] font-mono text-slate-600 shadow-2xs">
                        {f}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Text density */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-1.5 text-xs">
                  <span className="sm:col-span-4 font-semibold text-slate-500">Tekstdichtheid:</span>
                  <span className="sm:col-span-8 text-slate-750">
                    {location.specs.maxTextDensity}
                  </span>
                </div>

                {/* Delivery deadline */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-1.5 text-xs">
                  <span className="sm:col-span-4 font-semibold text-slate-500 flex items-center gap-1">
                    <CalendarRange className="w-3.5 h-3.5 text-amber-500" />
                    <span>Aanlevering:</span>
                  </span>
                  <span className="sm:col-span-8 text-slate-750 font-medium">
                    {location.specs.deadline}
                  </span>
                </div>

                {/* Restrictions - Red card section */}
                <div className="bg-red-50 border border-red-100 p-3.5 rounded-xl space-y-2 mt-2">
                  <div className="flex items-center gap-2 text-red-700 text-xs font-semibold">
                    <ShieldAlert className="w-4 h-4 shrink-0" />
                    <span>Restricties & verboden categorieën</span>
                  </div>
                  <ul className="list-disc pl-4 space-y-1 text-[11px] text-slate-650 leading-normal">
                    {location.specs.restrictions.map((r, idx) => (
                      <li key={idx}>
                        {r}
                      </li>
                    ))}
                    <li>Geen uitingen strijdig met de wet of goede zeden conform Nederlandse Reclame Code.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Action */}
          <div className="pt-6 border-t border-slate-100 mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 transition-all cursor-pointer shadow-xs"
            >
              Sluit specificaties
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
