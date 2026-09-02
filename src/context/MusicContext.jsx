import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

const MusicContext = createContext(null);

export const SONG_DETAILS = {
  id: 'd88V78UDUlo',
  title: 'Thangame Thangame',
  movie: 'Idhayam Murali',
  artist: 'Thaman S • Atharvaa • Preity Mukhundhan',
  thumbnail: 'https://i.ytimg.com/vi/d88V78UDUlo/hqdefault.jpg',
  youtubeUrl: 'https://youtu.be/d88V78UDUlo'
};

export function MusicProvider({ children }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const playerRef = useRef(null);
  const [isReady, setIsReady] = useState(false);

  // Initialize YouTube IFrame API
  useEffect(() => {
    // 1. Load YouTube Iframe API if not already present
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }

    const initPlayer = () => {
      if (window.YT && window.YT.Player && !playerRef.current) {
        playerRef.current = new window.YT.Player('youtube-hidden-audio-player', {
          height: '1',
          width: '1',
          videoId: SONG_DETAILS.id,
          playerVars: {
            autoplay: 0,
            controls: 0,
            disablekb: 1,
            fs: 0,
            loop: 1,
            playlist: SONG_DETAILS.id,
            modestbranding: 1,
            rel: 0,
            playsinline: 1
          },
          events: {
            onReady: () => {
              setIsReady(true);
            },
            onStateChange: (event) => {
              // 1 = playing, 2 = paused, 0 = ended
              if (event.data === 1) {
                setIsPlaying(true);
              } else if (event.data === 2 || event.data === 0) {
                setIsPlaying(false);
              }
            }
          }
        });
      }
    };

    if (window.YT && window.YT.Player) {
      initPlayer();
    } else {
      window.onYouTubeIframeAPIReady = initPlayer;
    }

    // Auto-start playback on first user gesture anywhere on the document
    const handleFirstClick = () => {
      setHasInteracted(true);
      window.removeEventListener('click', handleFirstClick);
      window.removeEventListener('touchstart', handleFirstClick);
    };

    window.addEventListener('click', handleFirstClick, { once: true });
    window.addEventListener('touchstart', handleFirstClick, { once: true });

    return () => {
      window.removeEventListener('click', handleFirstClick);
      window.removeEventListener('touchstart', handleFirstClick);
    };
  }, []);

  const playSong = () => {
    if (playerRef.current && typeof playerRef.current.playVideo === 'function') {
      try {
        playerRef.current.unMute();
        playerRef.current.playVideo();
        setIsPlaying(true);
      } catch (err) {
        console.warn('Playback error:', err);
      }
    }
  };

  const pauseSong = () => {
    if (playerRef.current && typeof playerRef.current.pauseVideo === 'function') {
      try {
        playerRef.current.pauseVideo();
        setIsPlaying(false);
      } catch (err) {
        console.warn('Pause error:', err);
      }
    }
  };

  const togglePlay = () => {
    if (isPlaying) {
      pauseSong();
    } else {
      playSong();
    }
  };

  const toggleMute = () => {
    if (playerRef.current) {
      if (isMuted) {
        playerRef.current.unMute();
        setIsMuted(false);
      } else {
        playerRef.current.mute();
        setIsMuted(true);
      }
    }
  };

  return (
    <MusicContext.Provider
      value={{
        isPlaying,
        isMuted,
        isReady,
        song: SONG_DETAILS,
        playSong,
        pauseSong,
        togglePlay,
        toggleMute
      }}
    >
      {/* Hidden YouTube Iframe for audio-only playback */}
      <div
        style={{
          position: 'fixed',
          top: '-100px',
          left: '-100px',
          width: '1px',
          height: '1px',
          opacity: 0.01,
          pointerEvents: 'none'
        }}
        aria-hidden="true"
      >
        <div id="youtube-hidden-audio-player" />
      </div>

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
