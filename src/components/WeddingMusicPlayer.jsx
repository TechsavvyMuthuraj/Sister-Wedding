import React, { useState } from 'react';
import { Play, Pause, Volume2, VolumeX, Music, Sparkles, ChevronDown, SkipForward, SkipBack } from 'lucide-react';
import { useMusic } from '../context/MusicContext';

export default function WeddingMusicPlayer() {
  const { isPlaying, isMuted, song, togglePlay, toggleMute, nextSong, prevSong, currentTrackIndex, playlist } = useMusic();
  const [isMinimized, setIsMinimized] = useState(false);

  return (
    <>
      {/* MOBILE VIEW: Sleek floating Play / Pause button with subtle glow and equalizer */}
      <div className="md:hidden fixed bottom-20 right-3 z-40">
        <button
          onClick={togglePlay}
          className={`relative flex items-center justify-center w-12 h-12 rounded-full border-2 border-gold-400/80 bg-gradient-to-tr from-amber-500 via-gold-400 to-amber-600 text-royal-950 shadow-[0_4px_20px_rgba(245,158,11,0.5)] active:scale-90 transition-all ${
            isPlaying ? 'ring-4 ring-gold-400/35 shadow-[0_0_25px_rgba(245,158,11,0.7)]' : ''
          }`}
          title={isPlaying ? "Pause Wedding Music" : "Play Wedding Music"}
          aria-label={isPlaying ? "Pause Wedding Music" : "Play Wedding Music"}
        >
          {/* Spinning vinyl ring inside when active */}
          {isPlaying && (
            <span className="absolute inset-0 rounded-full border-2 border-dashed border-royal-950/40 animate-spin" style={{ animationDuration: '4s' }} />
          )}
          {isPlaying ? (
            <Pause className="w-5 h-5 fill-royal-950 relative z-10" />
          ) : (
            <Play className="w-5 h-5 fill-royal-950 ml-0.5 relative z-10" />
          )}

          {/* Equalizer audio indicator badge */}
          {isPlaying && (
            <span className="absolute -top-1 -left-1 flex items-end gap-0.5 px-1 py-0.5 rounded-full bg-royal-950 border border-gold-400/80 shadow-md">
              <span className="w-0.5 bg-gold-400 eq-bar-1" />
              <span className="w-0.5 bg-amber-400 eq-bar-2" />
              <span className="w-0.5 bg-rose-400 eq-bar-3" />
            </span>
          )}
        </button>
      </div>

      {/* DESKTOP VIEW: Luxury Floating Music Player Card */}
      <div className="hidden md:block fixed bottom-6 right-4 z-40 transition-all duration-300">
        {isMinimized ? (
          /* Minimized floating disc button */
          <button
            onClick={() => setIsMinimized(false)}
            className={`relative flex items-center gap-2 p-2.5 rounded-full bg-royal-900/95 border border-gold-500/40 text-gold-300 shadow-gold-glow backdrop-blur-xl hover:scale-105 transition-all group ${
              isPlaying ? 'ring-2 ring-gold-400/30' : ''
            }`}
            title="Expand Wedding Music Player"
            aria-label="Expand Wedding Music Player"
          >
            <div className={`w-8 h-8 rounded-full overflow-hidden border border-gold-400/60 ${isPlaying ? 'animate-spin' : ''}`} style={{ animationDuration: '5s' }}>
              <img
                src={song.thumbnail}
                alt={song.title}
                onError={(e) => {
                  const s = e.currentTarget.src;
                  if (s.endsWith('.jpg')) e.currentTarget.src = s.replace(/\.jpg$/, '.png');
                  else if (s.endsWith('.png')) e.currentTarget.src = s.replace(/\.png$/, '.jpg');
                }}
                className="w-full h-full object-cover"
              />
            </div>
            {isPlaying && (
              <span className="flex items-end gap-0.5 px-1.5 h-4">
                <span className="w-1 bg-gold-400 eq-bar-1" />
                <span className="w-1 bg-amber-400 eq-bar-2" />
                <span className="w-1 bg-rose-400 eq-bar-3" />
              </span>
            )}
            <Music className={`w-4 h-4 ${isPlaying ? 'text-gold-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.8)]' : 'text-slate-400'}`} />
          </button>
        ) : (
          /* Full Luxury Floating Player Card */
          <div className={`w-88 rounded-2xl bg-royal-900/95 border border-gold-500/40 p-3.5 shadow-[0_10px_35px_rgba(0,0,0,0.85),0_0_25px_rgba(245,158,11,0.2)] backdrop-blur-2xl text-left transition-all ${
            isPlaying ? 'shadow-[0_10px_35px_rgba(0,0,0,0.85),0_0_30px_rgba(245,158,11,0.3)]' : ''
          }`}>
            <div className="flex items-center justify-between pb-2 border-b border-slate-800/80 mb-2.5">
              <div className="flex items-center gap-1.5 text-[10px] uppercase font-mono tracking-wider text-gold-400 font-semibold">
                <Sparkles className="w-3 h-3 text-gold-400" />
                <span>Wedding Music • Track {(currentTrackIndex || 0) + 1} of {playlist?.length || 4}</span>
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
                    isPlaying ? 'animate-spin shadow-[0_0_12px_rgba(245,158,11,0.4)]' : ''
                  }`}
                  style={{ animationDuration: '5s' }}
                >
                  <img
                    src={song.thumbnail}
                    alt={song.title}
                    onError={(e) => {
                      const s = e.currentTarget.src;
                      if (s.endsWith('.jpg')) e.currentTarget.src = s.replace(/\.jpg$/, '.png');
                      else if (s.endsWith('.png')) e.currentTarget.src = s.replace(/\.png$/, '.jpg');
                    }}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute inset-0 m-auto w-3 h-3 rounded-full bg-royal-950 border border-gold-400" />
              </div>

              {/* Song Meta Info with smooth transition */}
              <div className="flex-1 min-w-0">
                <div key={song.id} className="song-title-transition">
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
              </div>

              {/* Controls with Prev / Play / Next */}
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={prevSong}
                  className="p-1.5 rounded-full bg-royal-950/80 border border-slate-800 text-slate-300 hover:text-gold-300 hover:border-gold-500/40 transition-colors active:scale-90"
                  title="Previous Song"
                  aria-label="Previous Song"
                >
                  <SkipBack className="w-3 h-3" />
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

                <button
                  onClick={nextSong}
                  className="p-1.5 rounded-full bg-royal-950/80 border border-slate-800 text-slate-300 hover:text-gold-300 hover:border-gold-500/40 transition-colors active:scale-90"
                  title="Next Song"
                  aria-label="Next Song"
                >
                  <SkipForward className="w-3 h-3" />
                </button>

                <button
                  onClick={toggleMute}
                  className="p-1.5 rounded-full bg-royal-950/80 border border-slate-800 text-slate-300 hover:text-white hover:border-gold-500/40 transition-colors"
                  title={isMuted ? "Unmute" : "Mute"}
                  aria-label="Toggle Mute"
                >
                  {isMuted ? <VolumeX className="w-3 h-3 text-rose-400" /> : <Volume2 className="w-3 h-3 text-gold-400" />}
                </button>
              </div>
            </div>

            {/* Micro Equalizer Wave when playing */}
            {isPlaying && (
              <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-400">
                <span className="text-gold-400 font-mono flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  Now Playing for Sister's Wedding
                </span>
                <div className="flex items-end gap-1 h-3.5 px-1">
                  <span className="w-0.5 bg-gold-400 eq-bar-1" />
                  <span className="w-0.5 bg-amber-400 eq-bar-2" />
                  <span className="w-0.5 bg-rose-400 eq-bar-3" />
                  <span className="w-0.5 bg-gold-400 eq-bar-4" />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}

