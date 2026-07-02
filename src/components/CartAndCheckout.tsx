/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { CartItem, Location } from '../types';
import { ShoppingBag, Calendar, Euro, FileCheck, HelpCircle, ArrowLeft, Send, Sparkles, Building, Mail, Phone, User, CheckCircle, FileText, Download } from 'lucide-react';
import { motion } from 'motion/react';

interface CartAndCheckoutProps {
  cartItems: CartItem[];
  onRemoveItem: (locationId: string) => void;
  onConfigureCreative: (location: Location) => void;
  onBackToLocations: () => void;
  onClearCart: () => void;
}

export default function CartAndCheckout({
  cartItems,
  onRemoveItem,
  onConfigureCreative,
  onBackToLocations,
  onClearCart
}: CartAndCheckoutProps) {
  const [isOrdered, setIsOrdered] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [contactName, setContactName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [startDate, setStartDate] = useState('2026-08-03'); // Default to a realistic Monday in the future

  const [orderNumber] = useState(() => 'GBR-' + Math.floor(100000 + Math.random() * 900000));

  // Totals calculations
  const totalWeeks = cartItems.reduce((acc, item) => acc + item.weeks, 0);
  const totalSubtotal = cartItems.reduce((acc, item) => acc + (item.location.price * item.weeks), 0);
  const vatAmount = totalSubtotal * 0.21;
  const totalCost = totalSubtotal + vatAmount;

  // Check if all items have configured creatives
  const missingCreatives = cartItems.filter(item => !item.creative);

  const handleSubmitCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (cartItems.length === 0) return;
    setIsOrdered(true);
  };

  if (isOrdered) {
    return (
      <div className="max-w-2xl mx-auto bg-white border border-slate-200 rounded-3xl p-8 shadow-xl space-y-8 text-center animate-in fade-in zoom-in-95 duration-200">
        <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto border border-emerald-100">
          <CheckCircle className="w-10 h-10 text-emerald-700" />
        </div>

        <div className="space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 rounded-full border border-emerald-100 text-xs font-mono font-bold">
            <span>Boeking Bevestigd</span>
          </div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Gefeliciteerd, {contactName || 'ondernemer'}!</h2>
          <p className="text-slate-600 text-sm max-w-md mx-auto">
            Jouw campagne-aanvraag is met succes ontvangen en doorgestuurd naar onze planners. We nemen binnen 4 uur contact met je op.
          </p>
        </div>

        {/* Campaign summary card */}
        <div className="bg-slate-50 border border-slate-150 rounded-2xl p-6 text-left space-y-4 max-w-md mx-auto">
          <div className="flex justify-between items-center border-b border-slate-200 pb-3">
            <span className="text-xs font-mono text-slate-400 uppercase font-bold">Referentienummer</span>
            <span className="text-sm font-bold text-blue-750 font-mono">{orderNumber}</span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500 font-semibold">Bedrijf:</span>
              <span className="text-slate-800 font-bold">{companyName || 'Eigen onderneming'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-semibold">Verwachte startdatum:</span>
              <span className="text-slate-800 font-bold">{startDate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-semibold">Locaties geboekt:</span>
              <span className="text-slate-800 font-bold">{cartItems.length} formaten gecombineerd</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-semibold">Campagnetotaal:</span>
              <span className="text-emerald-700 font-black font-mono text-xs">€{totalCost.toFixed(2)} (incl. 21% BTW)</span>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-100 p-3 rounded-lg flex items-start gap-2 text-[11px] text-blue-700 leading-normal font-medium">
            <Sparkles className="w-4 h-4 shrink-0" />
            <span>Onze AI-modellen hebben je geüploade/ontworpen creaties voorbereid voor de specifieke resoluties van elke locatie.</span>
          </div>
        </div>

        {/* Download actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <button
            onClick={() => {
              // Simulated download
              alert('Simulatie: Downloaden van jouw Offerte & Mediaplan-PDF...');
            }}
            className="flex items-center justify-center gap-1.5 px-5 py-3 rounded-xl text-xs font-bold bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 transition-all cursor-pointer shadow-2xs"
          >
            <Download className="w-4 h-4" />
            <span>Download Mediaplan (PDF)</span>
          </button>

          <button
            onClick={() => {
              onClearCart();
              onBackToLocations();
            }}
            className="flex items-center justify-center gap-1.5 px-5 py-3 rounded-xl text-xs font-bold bg-blue-700 hover:bg-blue-600 text-white transition-all cursor-pointer shadow-xs"
          >
            <span>Nieuwe campagne opstarten</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back button */}
      <button
        onClick={onBackToLocations}
        className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 cursor-pointer font-bold"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Terug naar locaties</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Cart Item list */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex justify-between items-baseline">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-blue-700" />
              <span>Jouw Geselecteerde Campagne</span>
            </h2>
            <span className="text-xs text-slate-400 font-mono">{cartItems.length} locaties geselecteerd</span>
          </div>

          {cartItems.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 space-y-4 shadow-2xs">
              <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto" />
              <div className="space-y-1">
                <p className="text-sm font-semibold text-slate-800">Winkelmand is nog leeg</p>
                <p className="text-xs text-slate-500">Voeg een abri of digitaal scherm toe uit onze aanbevelingen om te starten.</p>
              </div>
              <button
                onClick={onBackToLocations}
                className="px-4 py-2 bg-blue-700 hover:bg-blue-600 text-white rounded-lg text-xs font-bold transition-all cursor-pointer"
              >
                Locaties bekijken
              </button>
            </div>
          ) : (
            <div className="space-y-3.5">
              {cartItems.map((item) => (
                <div
                  key={item.location.id}
                  className="bg-white border border-slate-200 p-4 sm:p-5 rounded-2xl shadow-2xs space-y-4 relative"
                >
                  {/* Top line street & city */}
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <span className={`text-[9px] font-bold font-mono uppercase tracking-wider px-1.5 py-0.5 rounded border ${
                        item.location.type === 'digital' ? 'bg-cyan-50 text-cyan-800 border-cyan-200' : 'bg-amber-50 text-amber-800 border-amber-200'
                      }`}>
                        {item.location.type === 'digital' ? 'Digitaal Scherm' : 'Klassieke Abri'}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 leading-tight mt-1.5">
                        {item.location.street}, {item.location.city}
                      </h4>
                      <p className="text-[11px] text-slate-500 font-bold italic mt-0.5">
                        {item.location.neighborhood}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] font-mono text-slate-400 block uppercase font-bold">Basisprijs p.w.</span>
                      <span className="text-sm font-bold text-emerald-700 font-mono">€{item.location.price}</span>
                    </div>
                  </div>

                  {/* Middle section: Creative status */}
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2">
                      <FileText className={`w-4 h-4 shrink-0 ${item.creative ? 'text-emerald-700' : 'text-amber-700'}`} />
                      <div>
                        <span className="font-bold text-slate-700 block">Campagnemateriaal (Creatie)</span>
                        {item.creative ? (
                          <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            <span>{item.creative.title} ({item.creative.subtitle})</span>
                          </span>
                        ) : (
                          <span className="text-[10px] text-amber-700 font-bold">Nog geen creatie gekoppeld</span>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => onConfigureCreative(item.location)}
                      className={`px-3 py-1.5 rounded-lg font-bold text-[11px] cursor-pointer transition-all ${
                        item.creative
                          ? 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-2xs'
                          : 'bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200/60 flex items-center gap-1 font-bold'
                      }`}
                    >
                      {!item.creative && <Sparkles className="w-3 h-3 text-blue-700 shrink-0" />}
                      <span>{item.creative ? 'Wijzigen' : 'Creatie toevoegen'}</span>
                    </button>
                  </div>

                  {/* Bottom: Weeks controller & total */}
                  <div className="flex justify-between items-center pt-3 border-t border-slate-100 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500 font-semibold">Looptijd:</span>
                      <span className="text-slate-800 font-bold">{item.weeks} week</span>
                    </div>

                    <button
                      onClick={() => onRemoveItem(item.location.id)}
                      className="text-slate-400 hover:text-red-600 transition-colors text-xs cursor-pointer font-medium"
                    >
                      Verwijderen uit campagne
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Checkout Billing Form (Only show if we have items) */}
        {cartItems.length > 0 && (
          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-3xl p-6 space-y-6 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-emerald-700" />
              <span>Samenvatting & Checkout</span>
            </h3>

            {/* Campaign Metrics */}
            <div className="space-y-2.5 text-xs bg-slate-50 p-4 rounded-xl border border-slate-150">
              <div className="flex justify-between">
                <span className="text-slate-500 font-semibold">Subtotaal media:</span>
                <span className="text-slate-800 font-mono font-bold">€{totalSubtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-semibold">BTW (21%):</span>
                <span className="text-slate-800 font-mono font-bold">€{vatAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-2.5 text-sm font-bold">
                <span className="text-slate-900">Totaal (incl. BTW):</span>
                <span className="text-emerald-700 font-black font-mono">€{totalCost.toFixed(2)}</span>
              </div>
            </div>

            {/* Creative Checklist Warning */}
            {missingCreatives.length > 0 && (
              <div className="bg-amber-50 border border-amber-100 p-3.5 rounded-xl space-y-1.5">
                <div className="flex items-center gap-1.5 text-amber-850 text-xs font-bold">
                  <HelpCircle className="w-4 h-4 shrink-0" />
                  <span>Creatie ontbreekt nog</span>
                </div>
                <p className="text-[10px] text-slate-600 leading-normal font-medium">
                  Je hebt voor {missingCreatives.length} locatie(s) nog geen advertentie-ontwerp toegevoegd. Je kunt alvast boeken; onze AI of adviseurs nemen naderhand contact op voor de creatieve invulling.
                </p>
              </div>
            )}

            {/* Checkout Form */}
            <form onSubmit={handleSubmitCheckout} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-750 block">Bedrijfsnaam</label>
                <div className="relative">
                  <Building className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="MKB BV / Winkelnaam"
                    className="w-full bg-white border border-slate-250 rounded-xl pl-9 pr-4 py-2.5 text-slate-800 text-xs placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-2xs"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-750 block">Contactpersoon</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="Voornaam en achternaam"
                    className="w-full bg-white border border-slate-250 rounded-xl pl-9 pr-4 py-2.5 text-slate-800 text-xs placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-2xs"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-750 block">E-mailadres</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="naam@bedrijf.nl"
                    className="w-full bg-white border border-slate-250 rounded-xl pl-9 pr-4 py-2.5 text-slate-800 text-xs placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-2xs"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-750 block">Telefoonnummer</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="06 - 12345678"
                    className="w-full bg-white border border-slate-250 rounded-xl pl-9 pr-4 py-2.5 text-slate-800 text-xs placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-2xs"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-750 block">Gewenste Startdatum</label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-white border border-slate-250 rounded-xl pl-9 pr-4 py-2.5 text-slate-800 text-xs placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-2xs"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl text-xs font-black bg-blue-700 hover:bg-blue-600 text-white shadow-xs flex items-center justify-center gap-1.5 cursor-pointer mt-4"
              >
                <Send className="w-4 h-4" />
                <span>Campagne Definitief Aanvragen</span>
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
