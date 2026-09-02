import React from 'react';
import { Calendar, Clock, MapPin, Sparkles, Music, Heart, Crown, ExternalLink } from 'lucide-react';
import { ITINERARY } from '../data/weddingData';

const ICONS = {
  Sparkles: Sparkles,
  Music: Music,
  Heart: Heart,
  Crown: Crown
};

export default function EventSchedule({ config }) {
  return (
    <section id="schedule" className="relative py-20 px-4 max-w-5xl mx-auto">
      {/* Header */}
      <div className="text-center mb-14">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs uppercase tracking-widest font-semibold mb-3">
          <Calendar className="w-3.5 h-3.5" />
          Wedding Timeline
        </div>
        <h2 className="text-3xl sm:text-5xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-gold-100 via-white to-gold-300">
          Celebration Itinerary
        </h2>
        <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto mt-2 font-sans">
          Four unforgettable celebrations culminating in the grand Muhurtham on 17th September 2026.
        </p>
      </div>

      {/* Timeline cards */}
      <div className="space-y-6">
        {ITINERARY.map((event, idx) => {
          const IconComponent = ICONS[event.icon] || Sparkles;
          return (
            <div
              key={event.id}
              className={`relative rounded-3xl p-6 sm:p-8 transition-all backdrop-blur-xl border ${
                event.isMain
                  ? 'bg-gradient-to-br from-royal-900 via-royal-850 to-royal-900 border-gold-500 shadow-gold-glow scale-[1.02]'
                  : 'bg-royal-900/70 border-slate-800/80 hover:border-slate-700'
              }`}
            >
              {event.isMain && (
                <div className="absolute -top-3.5 right-6 px-4 py-1 rounded-full bg-gradient-to-r from-amber-500 to-rose-500 text-royal-950 font-bold text-[11px] tracking-wider uppercase shadow-gold-glow flex items-center gap-1.5">
                  <Crown className="w-3 h-3 fill-royal-950" />
                  <span>The Auspicious Muhurtham (17/09/2026)</span>
                </div>
              )}

              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="flex items-start gap-4 sm:gap-6 text-left">
                  <div
                    className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${event.color} flex items-center justify-center shrink-0 shadow-lg`}
                  >
                    <IconComponent className="w-7 h-7 text-white" />
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="text-xs font-mono font-bold text-gold-400 uppercase tracking-wider">
                        {event.date}
                      </span>
                      <span className="text-slate-500">•</span>
                      <span className="text-xs text-slate-300 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-gold-400" />
                        {event.time}
                      </span>
                    </div>

                    <h3 className="text-xl sm:text-2xl font-serif font-bold text-white mb-2">
                      {event.title}
                    </h3>

                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans max-w-xl">
                      {event.description}
                    </p>

                    <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-slate-400">
                      <span className="flex items-center gap-1.5 text-gold-300">
                        <MapPin className="w-3.5 h-3.5 text-rose-400" />
                        {event.venue}
                      </span>
                      <span>•</span>
                      <span className="bg-royal-950 px-2.5 py-1 rounded-full border border-slate-700 text-slate-300">
                        👗 Dress Code: {event.dressCode}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="shrink-0 w-full md:w-auto flex justify-end">
                  <a
                    href={config.googleMapsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center gap-2 w-full md:w-auto px-5 py-2.5 rounded-full bg-royal-800/80 hover:bg-gold-500 hover:text-royal-950 text-gold-300 text-xs font-semibold border border-gold-500/30 transition-all"
                  >
                    <span>View Venue Map</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
