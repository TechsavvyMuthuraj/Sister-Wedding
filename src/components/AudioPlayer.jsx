import React from 'react';
import { Music, Play, Pause } from 'lucide-react';
import { useMusic } from '../context/MusicContext';

export default function AudioPlayer() {
  const { isPlaying, togglePlay, song } = useMusic();

  return (
    <button
      onClick={togglePlay}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-semibold transition-all backdrop-blur-md border ${
        isPlaying
          ? 'bg-amber-500/20 text-gold-300 border-gold-500/50 shadow-gold-glow animate-pulse-slow'
          : 'bg-royal-900/90 text-slate-300 border-slate-700/70 hover:border-gold-500/50 hover:text-white'
      }`}
      title={isPlaying ? `Pause "${song.title}"` : `Play "${song.title}"`}
      aria-label="Toggle Wedding Music"
    >
      {isPlaying ? (
        <>
          <Pause className="w-3.5 h-3.5 text-gold-400 fill-gold-400" />
          <span>Playing: {song.title}</span>
          <span className="flex items-center gap-0.5 ml-1">
            <span className="w-1 h-2.5 bg-gold-400 animate-pulse" />
            <span className="w-1 h-3.5 bg-amber-400 animate-pulse" style={{ animationDelay: '0.2s' }} />
            <span className="w-1 h-2 bg-rose-400 animate-pulse" style={{ animationDelay: '0.4s' }} />
          </span>
        </>
      ) : (
        <>
          <Play className="w-3.5 h-3.5 text-gold-400 fill-gold-400" />
          <span>Play Wedding Song: {song.title}</span>
          <Music className="w-3.5 h-3.5 text-gold-400/80 ml-0.5" />
        </>
      )}
    </button>
  );
}
