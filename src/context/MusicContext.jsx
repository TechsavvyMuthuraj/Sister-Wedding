import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';

const MusicContext = createContext(null);

export const WEDDING_PLAYLIST = [
  {
    id: 'thangame-thangame',
    title: 'Thangame Thangame',
    movie: 'Idhayam Murali',
    artist: 'Thaman S • Atharvaa • Preity Mukhundhan',
    url: '/song/Thangame%20Thangame%20-%20RaagTune.mp3',
    thumbnail: '/invitation/card_english_peacock.png'
  }
];

export const SONG_DETAILS = WEDDING_PLAYLIST[0];

export function MusicProvider({ children }) {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const audioRef = useRef(null);
  const fadeIntervalRef = useRef(null);
  const isCrossfadingRef = useRef(false);
  const currentTrackIndexRef = useRef(currentTrackIndex);
  currentTrackIndexRef.current = currentTrackIndex;

  const currentSong = WEDDING_PLAYLIST[currentTrackIndex] || WEDDING_PLAYLIST[0];

  // Helper for smooth volume ramp
  const rampVolume = useCallback((fromVol, toVol, durationMs, onComplete) => {
    const audio = audioRef.current;
    if (!audio) {
      if (onComplete) onComplete();
      return;
    }

    if (fadeIntervalRef.current) {
      clearInterval(fadeIntervalRef.current);
      fadeIntervalRef.current = null;
    }

    const steps = 15;
    const stepTime = durationMs / steps;
    const volDiff = (toVol - fromVol) / steps;
    let currentStep = 0;
    audio.volume = Math.max(0, Math.min(1, fromVol));

    fadeIntervalRef.current = setInterval(() => {
      currentStep++;
      const nextVol = Math.max(0, Math.min(1, fromVol + volDiff * currentStep));
      if (audioRef.current) {
        audioRef.current.volume = nextVol;
      }

      if (currentStep >= steps) {
        clearInterval(fadeIntervalRef.current);
        fadeIntervalRef.current = null;
        if (onComplete) onComplete();
      }
    }, stepTime);
  }, []);

  // Smooth Crossfade to new track
  const crossfadeToTrack = useCallback((targetIndex) => {
    const audio = audioRef.current;
    if (!audio || isCrossfadingRef.current) return;
    isCrossfadingRef.current = true;

    const validIndex = (targetIndex + WEDDING_PLAYLIST.length) % WEDDING_PLAYLIST.length;
    const nextSongObj = WEDDING_PLAYLIST[validIndex];

    // 1. Ramp volume down over 1.2s
    rampVolume(audio.volume, 0, 1200, () => {
      // 2. Switch track
      setCurrentTrackIndex(validIndex);
      audio.src = nextSongObj.url;
      audio.currentTime = 0;

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
            // 3. Ramp volume up
            rampVolume(0, isMuted ? 0 : 1, 1200, () => {
              isCrossfadingRef.current = false;
            });
          })
          .catch((err) => {
            console.warn('Track switch playback error:', err);
            isCrossfadingRef.current = false;
          });
      } else {
        rampVolume(0, isMuted ? 0 : 1, 1200, () => {
          isCrossfadingRef.current = false;
        });
      }
    });
  }, [rampVolume, isMuted]);

  const nextSong = useCallback(() => {
    if (WEDDING_PLAYLIST.length > 1) {
      crossfadeToTrack(currentTrackIndexRef.current + 1);
    } else if (audioRef.current) {
      // Single song: smooth restart
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    }
  }, [crossfadeToTrack]);

  const prevSong = useCallback(() => {
    if (WEDDING_PLAYLIST.length > 1) {
      crossfadeToTrack(currentTrackIndexRef.current - 1);
    } else if (audioRef.current) {
      // Single song: rewind to start
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    }
  }, [crossfadeToTrack]);

  const playSong = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.muted = isMuted;
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
          })
          .catch((err) => {
            console.warn('Playback error (browser policy):', err);
          });
      }
    }
  }, [isMuted]);

  const pauseSong = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      setIsPlaying(false);
    }
  }, []);

  const togglePlay = useCallback(() => {
    if (isPlaying) {
      pauseSong();
    } else {
      playSong();
    }
  }, [isPlaying, pauseSong, playSong]);

  const toggleMute = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      if (isMuted) {
        audio.muted = false;
        setIsMuted(false);
      } else {
        audio.muted = true;
        setIsMuted(true);
      }
    }
  }, [isMuted]);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime || 0);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration || 0);
      setIsReady(true);
    }
  };

  const handleSongEnded = () => {
    if (WEDDING_PLAYLIST.length > 1) {
      nextSong();
    } else if (audioRef.current) {
      // Seamless loop for single local song
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    }
  };

  useEffect(() => {
    return () => {
      if (fadeIntervalRef.current) {
        clearInterval(fadeIntervalRef.current);
      }
    };
  }, []);

  return (
    <MusicContext.Provider
      value={{
        isPlaying,
        isMuted,
        isReady,
        song: currentSong,
        playlist: WEDDING_PLAYLIST,
        currentTrackIndex,
        currentTime,
        duration,
        playSong,
        pauseSong,
        togglePlay,
        toggleMute,
        nextSong,
        prevSong,
        crossfadeToTrack
      }}
    >
      {/* Native HTML5 Audio Element for zero-dependency local playback */}
      <audio
        ref={audioRef}
        src={currentSong.url}
        preload="metadata"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleSongEnded}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />

      {children}
    </MusicContext.Provider>
  );
}

export function useMusic() {
  const context = useContext(MusicContext);
  if (!context) {
    throw new Error('useMusic must be used within a MusicProvider');
  }
  return context;
}
