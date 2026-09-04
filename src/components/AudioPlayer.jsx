import React from 'react';
import { Music, Play, Pause } from 'lucide-react';
import { useMusic } from '../context/MusicContext';

export default function AudioPlayer() {
  const { isPlaying, togglePlay, song } = useMusic();

  return (
    <button
      onClick={togglePlay}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-semibold transition-all duration-300 backdrop-blur-md border ${
        isPlaying
          ? 'bg-amber-500/20 text-gold-300 border-gold-500/60 shadow-[0_0_20px_rgba(245,158,11,0.35)]'
          : 'bg-royal-900/90 text-slate-300 border-slate-700/70 hover:border-gold-500/50 hover:text-white'
      }`}
      title={isPlaying ? `Pause "${song.title}"` : `Play "${song.title}"`}
      aria-label="Toggle Wedding Music"
    >
      {isPlaying ? (
        <>
          <Pause className="w-3.5 h-3.5 text-gold-400 fill-gold-400" />
          <span className="truncate max-w-[140px] sm:max-w-[180px]">Playing: {song.title}</span>
          <span className="flex items-end gap-0.5 ml-1 h-3.5">
            <span className="w-1 bg-gold-400 eq-bar-1" />
            <span className="w-1 bg-amber-400 eq-bar-2" />
            <span className="w-1 bg-rose-400 eq-bar-3" />
          </span>
        </>
      ) : (
        <>
          <Play className="w-3.5 h-3.5 text-gold-400 fill-gold-400" />
          <span className="truncate max-w-[140px] sm:max-w-[180px]">Play: {song.title}</span>
          <Music className="w-3.5 h-3.5 text-gold-400/80 ml-0.5" />
        </>
      )}
    </button>
  );
}
