import React, { useState } from 'react';
import { INVITATION_CARDS } from '../data/weddingData';
import { Sparkles, Maximize2, Download, Phone, MapPin, X, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import ElectricBorder from './ElectricBorder';

export default function InvitationCardViewer({ config }) {
  const [selectedCardIndex, setSelectedCardIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const currentCard = INVITATION_CARDS[selectedCardIndex];

  return (
    <section id="invitation" className="relative py-20 px-4 max-w-6xl mx-auto">
      {/* Section Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-gold-500/10 border border-gold-500/30 text-gold-400 text-xs uppercase tracking-widest font-semibold mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          Official Wedding Invitation
        </div>
        <h2 className="text-3xl sm:text-5xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-gold-100 via-white to-gold-300">
          திருமண அழைப்பிதழ்
        </h2>
        <p className="font-serif italic text-gold-200/90 text-sm sm:text-base mt-1">
          Dr. M. Muniraj weds M. Manju • 17th September 2026
        </p>
        <p className="text-slate-400 text-xs sm:text-sm max-w-xl mx-auto mt-2 font-sans">
          Click the tabs below to explore our official printed wedding card with family blessings, timings, and venue details.
        </p>
      </div>

      {/* Tabs for Invitation Card Sides */}
      <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap mb-8">
        {INVITATION_CARDS.map((card, idx) => {
          const isActive = selectedCardIndex === idx;
          return (
            <button
              key={card.id}
              onClick={() => setSelectedCardIndex(idx)}
              className={`px-4 py-2.5 rounded-full text-xs font-semibold transition-all duration-300 flex items-center gap-2 ${
                isActive
                  ? 'bg-gradient-to-r from-amber-500 to-gold-600 text-royal-950 shadow-gold-glow scale-105'
                  : 'bg-royal-900/80 text-slate-300 border border-slate-700/60 hover:border-gold-500/50 hover:text-white'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-royal-950' : 'bg-gold-400'}`} />
              <span>{card.badge}</span>
            </button>
          );
        })}
      </div>

      {/* Main Interactive Card Display */}
      <div className="max-w-4xl mx-auto">
        <ElectricBorder
          color="#f59e0b"
          speed={1.1}
          chaos={0.1}
          borderRadius={24}
          className="shadow-[0_20px_50px_rgba(0,0,0,0.8)]"
        >
          <div className="relative rounded-[24px] overflow-hidden bg-royal-950/95 border border-gold-500/40 p-2 sm:p-4 text-center">
            {/* Image Container */}
            <div
              className="relative group cursor-pointer rounded-2xl overflow-hidden shadow-2xl border border-gold-500/30 flex items-center justify-center bg-royal-900"
              onClick={() => setIsLightboxOpen(true)}
            >
              <img
                src={currentCard.image}
                alt={currentCard.title}
                className="w-full h-auto max-h-[720px] object-contain transition-transform duration-500 group-hover:scale-101"
              />

              {/* Hover overlay hint */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white font-medium text-xs sm:text-sm backdrop-blur-[2px]">
                <Eye className="w-5 h-5 text-gold-400" />
                <span>Click to Zoom Full Resolution</span>
              </div>

              {/* Quick action top button */}
              <div className="absolute top-3 right-3 flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsLightboxOpen(true);
                  }}
                  className="p-2 rounded-full bg-black/70 hover:bg-gold-500 hover:text-royal-950 text-white transition-colors backdrop-blur-md shadow-md"
                  title="Expand Card"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Card Information Bar */}
            <div className="mt-4 px-2 text-left flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-t border-slate-800/80 pt-3">
              <div>
                <h3 className="text-base sm:text-lg font-serif font-bold text-white">
                  {currentCard.title}
                </h3>
                <p className="text-xs text-gold-300 mt-0.5">
                  {currentCard.subtitle}
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  {currentCard.description}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={currentCard.image}
                  download={`Sister_Wedding_Invitation_${currentCard.id}.jpg`}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-royal-850 hover:bg-gold-500 hover:text-royal-950 text-gold-300 text-xs font-semibold border border-gold-500/40 transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Card</span>
                </a>
              </div>
            </div>
          </div>
        </ElectricBorder>
      </div>

      {/* Contact & Venue Information Box */}
      <div className="mt-12 max-w-4xl mx-auto rounded-3xl bg-royal-900/80 border border-slate-800 p-6 sm:p-8 backdrop-blur-xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-left flex-1">
            <h4 className="text-sm uppercase font-mono tracking-wider text-gold-400 font-bold mb-1">
              திருமண இடம் & தொடர்புக்கு / Venue & Inquiries:
            </h4>
            <p className="text-xs text-white font-medium">
              📍 {config.venue}, {config.location}
            </p>
            <p className="text-[11px] text-gold-300/90 font-serif italic mt-0.5">
              (பென்னாகரம் மெயின் ரோடு, ஜெயம் இன்ஜினியரிங் கல்லூரி எதிரில், தள்ளப்பள்ளம், தருமபுரி)
            </p>
            <p className="text-xs text-slate-300 mt-2">
              Feel free to call the family directly for venue directions and blessings:
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {config.contactNumbers?.map((num, i) => (
                <a
                  key={i}
                  href={`tel:${num}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-royal-950 border border-slate-700/80 hover:border-gold-500/60 text-slate-200 hover:text-gold-300 text-xs font-mono transition-colors"
                >
                  <Phone className="w-3 h-3 text-gold-400" />
                  <span>{num}</span>
                </a>
              ))}
            </div>
          </div>

          <div className="shrink-0 w-full md:w-auto">
            <a
              href={config.googleMapsUrl || 'https://maps.app.goo.gl/UiJxTzEtP1bfVhN59'}
              target="_blank"
              rel="noreferrer"
              className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-gradient-to-r from-amber-500 to-rose-500 text-royal-950 font-bold text-xs shadow-gold-glow hover:scale-105 transition-all"
            >
              <MapPin className="w-4 h-4 fill-royal-950" />
              <span>Open in Google Maps</span>
            </a>
          </div>
        </div>
      </div>

      {/* Lightbox Zoom Modal */}
      {isLightboxOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-2xl p-4"
          onClick={() => setIsLightboxOpen(false)}
        >
          <button
            onClick={() => setIsLightboxOpen(false)}
            className="absolute top-4 right-4 z-50 p-3 rounded-full bg-royal-900/90 text-white hover:bg-rose-600 transition-colors"
            aria-label="Close"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Prev button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedCardIndex((selectedCardIndex - 1 + INVITATION_CARDS.length) % INVITATION_CARDS.length);
            }}
            className="absolute left-4 p-3 rounded-full bg-royal-900/80 text-white hover:bg-gold-500 hover:text-royal-950 transition-colors z-50"
            aria-label="Previous"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          {/* Next button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedCardIndex((selectedCardIndex + 1) % INVITATION_CARDS.length);
            }}
            className="absolute right-4 p-3 rounded-full bg-royal-900/80 text-white hover:bg-gold-500 hover:text-royal-950 transition-colors z-50"
            aria-label="Next"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          <div
            className="relative max-w-5xl max-h-[90vh] flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={currentCard.image}
              alt={currentCard.title}
              className="max-h-[82vh] max-w-full rounded-2xl object-contain shadow-2xl border-2 border-gold-500/40"
            />
            <div className="mt-3 text-center">
              <h4 className="text-base font-serif font-bold text-white">
                {currentCard.title}
              </h4>
              <p className="text-xs text-gold-300">
                {currentCard.subtitle}
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
