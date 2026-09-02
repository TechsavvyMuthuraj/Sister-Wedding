import React, { useState } from 'react';
import { Play, Pause, Volume2, VolumeX, Music, Disc3, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { useMusic } from '../context/MusicContext';

export default function WeddingMusicPlayer() {
  const { isPlaying, isMuted, song, togglePlay, toggleMute } = useMusic();
  const [isMinimized, setIsMinimized] = useState(() => typeof window !== 'undefined' && window.innerWidth < 768);

  return (
    <div className="fixed bottom-24 md:bottom-6 right-3 sm:right-4 z-40 transition-all duration-300">
      {isMinimized ? (
        /* Minimized floating disc button */
        <button
          onClick={() => setIsMinimized(false)}
          className="relative flex items-center gap-2 p-2.5 rounded-full bg-royal-900/95 border border-gold-500/40 text-gold-300 shadow-gold-glow backdrop-blur-xl hover:scale-105 transition-all group"
          title="Expand Wedding Music Player"
          aria-label="Expand Wedding Music Player"
        >
          <div className={`w-8 h-8 rounded-full overflow-hidden border border-gold-400/60 ${isPlaying ? 'animate-spin' : ''}`} style={{ animationDuration: '4s' }}>
            <img src={song.thumbnail} alt={song.title} className="w-full h-full object-cover" />
          </div>
          {isPlaying && (
            <span className="flex items-center gap-0.5 px-1.5">
              <span className="w-1 h-3 bg-gold-400 animate-pulse" />
              <span className="w-1 h-4 bg-amber-400 animate-pulse" style={{ animationDelay: '0.2s' }} />
              <span className="w-1 h-2 bg-rose-400 animate-pulse" style={{ animationDelay: '0.4s' }} />
            </span>
          )}
          <Music className="w-4 h-4 text-gold-400" />
        </button>
      ) : (
        /* Full Luxury Floating Player Card */
        <div className="w-[calc(100vw-28px)] max-w-xs sm:w-80 rounded-2xl bg-royal-900/95 border border-gold-500/40 p-3 shadow-[0_10px_35px_rgba(0,0,0,0.8),0_0_25px_rgba(245,158,11,0.25)] backdrop-blur-2xl text-left transition-all">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800/80 mb-2">
            <div className="flex items-center gap-1.5 text-[10px] uppercase font-mono tracking-wider text-gold-400 font-semibold">
              <Sparkles className="w-3 h-3 text-gold-400" />
              <span>Wedding Background Music</span>
            </div>
            <button
              onClick={() => setIsMinimized(true)}
              className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Minimize"
              aria-label="Minimize Player"
            >
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-3">
            {/* Spinning Vinyl Album Art */}
            <div className="relative shrink-0">
              <div
                className={`w-12 h-12 rounded-full overflow-hidden border-2 border-gold-400/60 shadow-md ${
                  isPlaying ? 'animate-spin' : ''
                }`}
                style={{ animationDuration: '4s' }}
              >
                <img
                  src={song.thumbnail}
                  alt={song.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute inset-0 m-auto w-3 h-3 rounded-full bg-royal-950 border border-gold-400" />
            </div>

            {/* Song Meta Info */}
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-bold text-white truncate font-serif">
                {song.title}
              </h4>
              <p className="text-[11px] text-gold-300/80 truncate">
                {song.movie}
              </p>
              <p className="text-[9px] text-slate-400 truncate">
                {song.artist}
              </p>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={toggleMute}
                className="p-1.5 rounded-full bg-royal-950 border border-slate-800 text-slate-300 hover:text-white hover:border-gold-500/40 transition-colors"
                title={isMuted ? "Unmute" : "Mute"}
                aria-label="Toggle Mute"
              >
                {isMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5 text-gold-400" />}
              </button>

              <button
                onClick={togglePlay}
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                  isPlaying
                    ? 'bg-amber-500 text-royal-950 shadow-gold-glow scale-105'
                    : 'bg-gradient-to-r from-amber-500 to-gold-600 text-royal-950 hover:scale-105'
                }`}
                title={isPlaying ? "Pause Song" : "Play Song"}
                aria-label={isPlaying ? "Pause Song" : "Play Song"}
              >
                {isPlaying ? (
                  <Pause className="w-4 h-4 fill-royal-950" />
                ) : (
                  <Play className="w-4 h-4 fill-royal-950 ml-0.5" />
                )}
              </button>
            </div>
          </div>

          {/* Animated Equalizer Wave when playing */}
          {isPlaying && (
            <div className="mt-2 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-400">
              <span className="text-gold-400 font-mono flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                Now Playing for Sister's Wedding
              </span>
              <div className="flex items-end gap-1 h-3">
                <span className="w-0.5 h-2.5 bg-gold-400 animate-pulse" />
                <span className="w-0.5 h-3.5 bg-amber-400 animate-pulse" style={{ animationDelay: '0.15s' }} />
                <span className="w-0.5 h-1.5 bg-rose-400 animate-pulse" style={{ animationDelay: '0.3s' }} />
                <span className="w-0.5 h-3 bg-gold-400 animate-pulse" style={{ animationDelay: '0.45s' }} />
                <span className="w-0.5 h-2 bg-amber-400 animate-pulse" style={{ animationDelay: '0.6s' }} />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
