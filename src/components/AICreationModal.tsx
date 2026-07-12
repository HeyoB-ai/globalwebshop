/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Location } from '../types';
import { X, UploadCloud, Sparkles, CheckCircle2, AlertCircle, RefreshCw, FileText, LayoutTemplate, ShieldCheck, Check, ShieldAlert, Maximize2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import PosterFullscreenEditor, { PosterDesign } from './PosterFullscreenEditor';

interface AICreationModalProps {
  location: Location;
  onClose: () => void;
  onSaveCreative: (creative: {
    type: 'upload' | 'ai-generated' | 'verified';
    fileName?: string;
    previewUrl?: string;
    promptText?: string;
    verifiedOk?: boolean;
    title?: string;
    subtitle?: string;
    textColor?: string;
    styleName?: string;
    align?: 'left' | 'center' | 'right';
    titleScale?: number;
    badgeText?: string;
  }) => void;
  currentCreative?: any;
}

type ActiveTab = 'upload' | 'generate' | 'verify';

export default function AICreationModal({
  location,
  onClose,
  onSaveCreative,
  currentCreative
}: AICreationModalProps) {
  const [activeTab, setActiveTab] = useState<ActiveTab>('upload');

  // Tab 1: Upload state
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'analyzing' | 'completed'>('idle');

  // Tab 2: AI Design state
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState('');
  const [generatedOptions, setGeneratedOptions] = useState<PosterDesign[] | null>(null);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  // Fullscreen preview / editor for the poster with this id
  const [fullscreenOptionId, setFullscreenOptionId] = useState<string | null>(null);

  // Tab 3: AI Verification Checklist state
  const [verifyFile, setVerifyFile] = useState<File | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{
    resolution: boolean;
    contrast: boolean;
    density: boolean;
    restricted: boolean;
    overall: boolean;
  } | null>(null);

  // Simulated Upload Flow
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setUploadFile(file);
    setUploadStatus('uploading');
    setUploadProgress(10);

    // Simulated network upload progress
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev < 90) {
          return prev + 20;
        } else {
          clearInterval(interval);
          setUploadStatus('analyzing');

          // Simulated "Deep spec check"
          setTimeout(() => {
            setUploadStatus('completed');
          }, 1200);
          return 100;
        }
      });
    }, 200);
  };

  // Simulated AI Poster Generation Flow
  const handleGenerateDesigns = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsGenerating(true);
    setGeneratedOptions(null);

    const steps = [
      'Analyseren van campagnerichtlijnen...',
      'Genereren van high-contrast kleurencombinaties...',
      'Berekenen van optimale typografie-schaal...',
      'Renderen van posterconcepten in ' + location.dimensions + '...'
    ];

    let currentStep = 0;
    setGenerationStep(steps[0]);

    const interval = setInterval(() => {
      if (currentStep < steps.length - 1) {
        currentStep++;
        setGenerationStep(steps[currentStep]);
      } else {
        clearInterval(interval);

        // Generate poster options based on prompt
        const words = prompt.split(' ');
        const mainKeyword = words[0] || 'Actie';
        const slogan = prompt.length > 30 ? prompt.substring(0, 35) + '...' : prompt;

        setGeneratedOptions([
          {
            id: 'opt-1',
            title: mainKeyword.toUpperCase(),
            subtitle: slogan,
            bgColor: 'bg-gradient-to-br from-blue-900 to-slate-950',
            textColor: 'text-blue-300',
            styleName: 'Modern kobalt',
            badgeText: 'AANBEVOLEN',
            align: 'center',
            titleScale: 15
          },
          {
            id: 'opt-2',
            title: mainKeyword,
            subtitle: slogan,
            bgColor: 'bg-amber-400',
            textColor: 'text-slate-950',
            styleName: 'Impact geel',
            align: 'left',
            titleScale: 17
          },
          {
            id: 'opt-3',
            title: 'Kies voor ' + mainKeyword,
            subtitle: slogan,
            bgColor: 'bg-slate-950',
            textColor: 'text-white',
            styleName: 'Diep zwart',
            align: 'center',
            titleScale: 13
          }
        ]);
        setSelectedOptionId('opt-1');
        setIsGenerating(false);
      }
    }, 700);
  };

  // Simulated Compliance Check Tab
  const handleVerifyUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setVerifyFile(file);
    setIsVerifying(true);
    setVerificationResult(null);

    setTimeout(() => {
      setIsVerifying(false);
      // Give random but mostly successful result
      setVerificationResult({
        resolution: true,
        contrast: true,
        density: true,
        restricted: true,
        overall: true
      });
    }, 2000);
  };

  // Save selection back to parent
  const handleSave = () => {
    if (activeTab === 'upload' && uploadStatus === 'completed' && uploadFile) {
      onSaveCreative({
        type: 'upload',
        fileName: uploadFile.name,
        verifiedOk: true,
        title: 'Eigen Upload',
        subtitle: uploadFile.name
      });
    } else if (activeTab === 'generate' && generatedOptions && selectedOptionId) {
      const selected = generatedOptions.find(o => o.id === selectedOptionId);
      onSaveCreative({
        type: 'ai-generated',
        promptText: prompt,
        previewUrl: selected?.bgColor,
        textColor: selected?.textColor,
        styleName: selected?.styleName,
        align: selected?.align,
        titleScale: selected?.titleScale,
        badgeText: selected?.badgeText,
        title: selected?.title,
        subtitle: selected?.subtitle,
        verifiedOk: true
      });
    } else if (activeTab === 'verify' && verificationResult && verifyFile) {
      onSaveCreative({
        type: 'verified',
        fileName: verifyFile.name,
        verifiedOk: verificationResult.overall,
        title: 'AI Gecheckte Poster',
        subtitle: verifyFile.name
      });
    }
  };

  const fullscreenOption = generatedOptions?.find((o) => o.id === fullscreenOptionId) ?? null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Fullscreen poster preview + editor */}
      {fullscreenOption && (
        <PosterFullscreenEditor
          location={location}
          design={fullscreenOption}
          onClose={() => setFullscreenOptionId(null)}
          onApply={(updated) => {
            setGeneratedOptions((prev) =>
              prev ? prev.map((o) => (o.id === updated.id ? updated : o)) : prev
            );
            setSelectedOptionId(updated.id);
            setFullscreenOptionId(null);
          }}
        />
      )}

      {/* Backdrop */}
      <div className="absolute inset-0 bg-ink/50 backdrop-blur-xs" onClick={onClose} />

      {/* Container */}
      <div className="relative bg-white border border-line rounded-card overflow-hidden shadow-soft-lg max-w-2xl w-full flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">

        {/* Header */}
        <div className="p-6 border-b border-line flex justify-between items-center bg-paper-2">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-cobalt font-mono uppercase tracking-wider font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Campagnemateriaal Configureren</span>
            </div>
            <h3 className="text-lg font-bold text-ink mt-1 leading-tight">
              Creatie toevoegen voor {location.street}
            </h3>
            <p className="text-xs text-mist">
              Formaat: <strong className="text-ink">{location.dimensions}</strong> ({location.type === 'digital' ? 'Digitaal' : 'Gedrukte abri'})
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-mist hover:text-ink bg-paper-2 hover:bg-line p-2 rounded-full transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="grid grid-cols-3 border-b border-line bg-paper-2 text-xs">
          <button
            onClick={() => setActiveTab('upload')}
            className={`py-3 text-center font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'upload'
                ? 'border-cobalt text-cobalt bg-cobalt-soft/40'
                : 'border-transparent text-mist-2 hover:text-ink'
            }`}
          >
            1. Upload eigen bestand
          </button>
          <button
            onClick={() => setActiveTab('generate')}
            className={`py-3 text-center font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'generate'
                ? 'border-cobalt text-cobalt bg-cobalt-soft/40'
                : 'border-transparent text-mist-2 hover:text-ink'
            }`}
          >
            2. Laat AI ontwerpen
          </button>
          <button
            onClick={() => setActiveTab('verify')}
            className={`py-3 text-center font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'verify'
                ? 'border-cobalt text-cobalt bg-cobalt-soft/40'
                : 'border-transparent text-mist-2 hover:text-ink'
            }`}
          >
            3. AI-richtlijnencheck
          </button>
        </div>

        {/* Scrollable Content Panel */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">

          {/* TAB 1: UPLOAD OWN CREATION */}
          {activeTab === 'upload' && (
            <div className="space-y-4">
              <div className="text-center p-8 bg-paper-2 rounded-card border-2 border-dashed border-line hover:border-cobalt transition-all relative">
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={handleFileUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  disabled={uploadStatus === 'uploading' || uploadStatus === 'analyzing'}
                />

                {uploadStatus === 'idle' && (
                  <div className="space-y-3">
                    <div className="w-12 h-12 bg-cobalt-soft rounded-full flex items-center justify-center mx-auto border border-cobalt-soft">
                      <UploadCloud className="w-6 h-6 text-cobalt" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-mist">Sleep je bestand hierheen of klik om te bladeren</p>
                      <p className="text-xs text-mist-2">PDF, PNG of JPG, maximaal 25 MB</p>
                    </div>
                  </div>
                )}

                {(uploadStatus === 'uploading' || uploadStatus === 'analyzing') && (
                  <div className="space-y-4 py-4">
                    <RefreshCw className="w-8 h-8 text-cobalt animate-spin mx-auto" />
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-mist">
                        {uploadStatus === 'uploading' ? 'Uploaden...' : 'Controleren op aanleverspecificaties...'}
                      </p>
                      <div className="w-48 h-1 bg-line rounded-full mx-auto overflow-hidden">
                        <div
                          className="h-full bg-cobalt transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {uploadStatus === 'completed' && uploadFile && (
                  <div className="space-y-4 py-2">
                    <div className="w-12 h-12 bg-ok-soft rounded-full flex items-center justify-center mx-auto border border-ok-soft">
                      <CheckCircle2 className="w-6 h-6 text-ok" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-ink">{uploadFile.name}</p>
                      <p className="text-xs text-ok flex items-center justify-center gap-1 font-semibold">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Bestand met succes gevalideerd! Voldoet aan alle specificaties.</span>
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => { setUploadFile(null); setUploadStatus('idle'); }}
                      className="text-xs text-mist-2 hover:text-ink underline font-medium"
                    >
                      Ander bestand uploaden
                    </button>
                  </div>
                )}
              </div>

              {/* Tips list */}
              <div className="bg-paper-2 p-4 rounded-card-sm border border-line space-y-2.5">
                <span className="text-[10px] font-mono uppercase tracking-wider text-mist-2 block font-bold">Belangrijk voor deze locatie:</span>
                <ul className="text-xs text-mist space-y-1 list-disc pl-4 leading-relaxed">
                  <li><strong>Papierformaat:</strong> Hou rekening met een snijmarge van 5mm rondom.</li>
                  <li><strong>Contrast:</strong> Onze systemen adviseren een minimale tekst-achtergrond contrastverhouding van 4.5:1.</li>
                  <li><strong>Levertijd:</strong> Dit bestand wordt handmatig goedgekeurd binnen 24 uur.</li>
                </ul>
              </div>
            </div>
          )}

          {/* TAB 2: AI GENERATE POSTERS */}
          {activeTab === 'generate' && (
            <div className="space-y-5">
              <form onSubmit={handleGenerateDesigns} className="space-y-3">
                <label className="block text-xs font-semibold text-mist">
                  Beschrijf wat je wilt promoten (onze AI ontwerpt direct een passende poster):
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Bijv. Pizza Margherita 1+1 gratis deze vrijdag bij Bella Italia..."
                    className="flex-1 bg-white border border-line rounded-card-sm px-4 py-3 text-ink text-xs placeholder-mist-2 focus:outline-none focus:border-cobalt focus:ring-1 focus:ring-cobalt shadow-soft"
                    disabled={isGenerating}
                  />
                  <button
                    type="submit"
                    disabled={isGenerating || !prompt.trim()}
                    className={`px-5 rounded-card-sm text-xs font-bold flex items-center gap-1.5 cursor-pointer ${
                      prompt.trim() && !isGenerating
                        ? 'bg-cobalt hover:bg-cobalt-deep text-white shadow-soft'
                        : 'bg-paper-2 text-mist-2 cursor-not-allowed border border-line'
                    }`}
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Ontwerp</span>
                  </button>
                </div>
              </form>

              {/* Generating Loader */}
              {isGenerating && (
                <div className="p-12 text-center space-y-4 bg-paper-2 rounded-card border border-line">
                  <div className="relative w-12 h-12 mx-auto">
                    <div className="absolute inset-0 rounded-full border-2 border-cobalt/10 border-t-cobalt animate-spin" />
                    <Sparkles className="w-5 h-5 text-cobalt absolute inset-0 m-auto animate-pulse" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-mist">AI ontwerper is actief...</p>
                    <p className="text-xs text-cobalt font-mono font-bold animate-pulse">{generationStep}</p>
                  </div>
                </div>
              )}

              {/* Generated Options List */}
              {generatedOptions && !isGenerating && (
                <div className="space-y-4">
                  <div className="text-xs font-bold text-mist">
                    Kies een van de gegenereerde ontwerpen — of bekijk het beeldvullend en pas het aan:
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {generatedOptions.map((opt) => {
                      const isSelected = selectedOptionId === opt.id;
                      const alignItems = opt.align === 'left' ? 'items-start text-left' : opt.align === 'right' ? 'items-end text-right' : 'items-center text-center';
                      return (
                        <div
                          key={opt.id}
                          onClick={() => setSelectedOptionId(opt.id)}
                          className={`group p-3 rounded-card-sm border text-left flex flex-col justify-between h-56 transition-all relative overflow-hidden cursor-pointer ${
                            isSelected
                              ? 'bg-paper-2 border-cobalt ring-2 ring-cobalt/10 shadow-soft'
                              : 'bg-white border-line hover:border-cobalt shadow-soft'
                          }`}
                        >
                          {/* Inner poster mockup display */}
                          <div className={`w-full h-36 rounded-lg ${opt.bgColor} p-3 flex flex-col justify-between shadow-inner relative overflow-hidden ${alignItems}`}>
                            {opt.badgeText && (
                              <span className="absolute top-1.5 right-1.5 bg-cobalt text-white text-[7px] font-bold px-1 py-0.5 rounded shadow">
                                {opt.badgeText}
                              </span>
                            )}
                            <div className="space-y-1 w-full">
                              <h5 className={`text-sm font-extrabold tracking-tight ${opt.textColor} uppercase font-sans break-words leading-tight`}>
                                {opt.title}
                              </h5>
                              <p className={`text-[7px] ${opt.textColor} opacity-80 leading-normal font-sans line-clamp-3`}>
                                {opt.subtitle}
                              </p>
                            </div>

                            {/* Tiny mock footer */}
                            <div className={`flex justify-between items-center text-[5px] ${opt.textColor} opacity-50 border-t border-current/20 pt-1 w-full`}>
                              <span>GLOBAL AD</span>
                              <span>{location.city.toUpperCase()}</span>
                            </div>

                            {/* Fullscreen affordance */}
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); setSelectedOptionId(opt.id); setFullscreenOptionId(opt.id); }}
                              title="Beeldvullend bekijken & aanpassen"
                              className="absolute bottom-1.5 right-1.5 bg-white/85 hover:bg-white text-ink rounded-md p-1 shadow opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity cursor-pointer"
                            >
                              <Maximize2 className="w-3 h-3" />
                            </button>
                          </div>

                          <div className="mt-2.5 flex justify-between items-center w-full">
                            <span className="text-[10px] font-bold text-mist">{opt.styleName}</span>
                            <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                              isSelected ? 'border-cobalt bg-cobalt' : 'border-line bg-white'
                            }`}>
                              {isSelected && <Check className="w-2.5 h-2.5 text-white stroke-[3]" />}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Prominent fullscreen CTA for the selected design */}
                  {selectedOptionId && (
                    <button
                      type="button"
                      onClick={() => setFullscreenOptionId(selectedOptionId)}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-full border border-cobalt-soft bg-cobalt-soft hover:bg-cobalt-soft text-cobalt text-xs font-bold transition-all cursor-pointer"
                    >
                      <Maximize2 className="w-4 h-4" />
                      Geselecteerd ontwerp beeldvullend bekijken &amp; aanpassen
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: AUTOMATED COMPLIANCE CHECK */}
          {activeTab === 'verify' && (
            <div className="space-y-4">
              <div className="text-center p-8 bg-paper-2 rounded-card border-2 border-dashed border-line hover:border-cobalt transition-all relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleVerifyUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  disabled={isVerifying}
                />

                {!verifyFile && (
                  <div className="space-y-3">
                    <div className="w-12 h-12 bg-cobalt-soft rounded-full flex items-center justify-center mx-auto border border-cobalt-soft">
                      <LayoutTemplate className="w-6 h-6 text-cobalt" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-mist">Upload een concept-afbeelding om te laten scannen</p>
                      <p className="text-xs text-mist-2">Onze AI controleert direct of het voldoet aan de richtlijnen voor {location.city}</p>
                    </div>
                  </div>
                )}

                {isVerifying && (
                  <div className="space-y-4 py-4">
                    <RefreshCw className="w-8 h-8 text-cobalt animate-spin mx-auto" />
                    <p className="text-sm font-medium text-mist">AI controleert contrast en gemeentelijke regelgeving...</p>
                  </div>
                )}

                {verifyFile && !isVerifying && (
                  <div className="space-y-3 py-1">
                    <p className="text-sm font-bold text-ink">Auditrapport: {verifyFile.name}</p>
                    <div className="text-xs font-semibold text-ok flex items-center justify-center gap-1 bg-ok-soft border border-ok-soft py-1.5 px-3 rounded-card-sm max-w-sm mx-auto">
                      <ShieldCheck className="w-4 h-4" />
                      <span>Volledig goedgekeurd voor productie!</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => { setVerifyFile(null); setVerificationResult(null); }}
                      className="text-xs text-mist-2 hover:text-ink underline block mx-auto mt-2"
                    >
                      Ander bestand scannen
                    </button>
                  </div>
                )}
              </div>

              {/* Compliance checklist details */}
              {verifyFile && !isVerifying && (
                <div className="bg-paper-2 border border-line p-4 rounded-card-sm space-y-3">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-mist-2 block border-b border-line pb-2 font-bold">AI Compliance Analyse Resultaten</span>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-mist font-medium">Minimale resolutie check (300 DPI equivalent)</span>
                      <span className="text-ok font-bold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> OK
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-mist font-medium">Tekstdichtheid audit (max. 30% voor {location.city})</span>
                      <span className="text-ok font-bold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> OK (14% gemeten)
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-mist font-medium">Contrast en leesbaarheid vanaf 15 meter</span>
                      <span className="text-ok font-bold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> OK (Uitstekend contrast)
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-mist font-medium">Beleidstoetsing (O.a. alcohol, gokken nabij onderwijs)</span>
                      <span className="text-ok font-bold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> OK (Geen restricties overschreden)
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-line bg-paper-2 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-full text-xs font-semibold bg-white hover:bg-paper-2 border border-line text-mist transition-all cursor-pointer shadow-soft"
          >
            Annuleren
          </button>

          <button
            onClick={handleSave}
            disabled={
              (activeTab === 'upload' && uploadStatus !== 'completed') ||
              (activeTab === 'generate' && !selectedOptionId) ||
              (activeTab === 'verify' && !verifyFile)
            }
            className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              (activeTab === 'upload' && uploadStatus === 'completed') ||
              (activeTab === 'generate' && selectedOptionId) ||
              (activeTab === 'verify' && verifyFile)
                ? 'bg-cobalt hover:bg-cobalt-deep text-white shadow-soft'
                : 'bg-paper-2 text-mist-2 cursor-not-allowed border border-line'
            }`}
          >
            Creatie opslaan en toepassen
          </button>
        </div>

      </div>
    </div>
  );
}
