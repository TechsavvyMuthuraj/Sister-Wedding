import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Heart } from 'lucide-react';
import GoldDustOverlay from './GoldDustOverlay';

export default function WeddingOpeningIntro({ onEnter, config }) {
  // Sequence timing steps calibrated to the 10-second wedding intro song:
  // 0.2s: Golden Kalash ornament appears
  // 1.8s: "With love and blessings..." fades in
  // 3.2s: "Our Family Invites You" appears
  // 4.5s: Couple names with educational qualifications reveal
  // 7.0s: Wedding date appears (17 September 2026 • Dharmapuri)
  // 8.6s: Grand "Enter Wedding" button appears
  // ~10.2s: Song concludes / transitions into main wedding song
  const [step, setStep] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [hasEntered, setHasEntered] = useState(false);
  const [audioStarted, setAudioStarted] = useState(false);

  const introAudioRef = useRef(null);

  // Initialize and play the 10-second intro song from /public/wedding song/
  useEffect(() => {
    const audio = new Audio('/wedding%20song/wedding%20song%2010sec.mp3');
    audio.preload = 'auto';
    introAudioRef.current = audio;

    audio.onerror = () => {
      if (audio.src.includes('wedding%20song') || audio.src.includes('10sec')) {
        audio.src = '/song/wedding_intro_10s.mp3';
        tryPlayAudio();
      }
    };

    const tryPlayAudio = () => {
      if (audio && audio.paused) {
        audio.play()
          .then(() => {
            setAudioStarted(true);
          })
          .catch((err) => {
            console.log('Intro audio autoplay waiting for user interaction:', err);
          });
      }
    };

    tryPlayAudio();

    // Auto-advance when the 10-second song finishes
    audio.onended = () => {
      handleEnter();
    };

    // User interaction fallback for browsers that block instant autoplay
    const handleFirstTap = () => {
      tryPlayAudio();
      window.removeEventListener('pointerdown', handleFirstTap);
      window.removeEventListener('keydown', handleFirstTap);
    };

    window.addEventListener('pointerdown', handleFirstTap, { once: true });
    window.addEventListener('keydown', handleFirstTap, { once: true });

    return () => {
      window.removeEventListener('pointerdown', handleFirstTap);
      window.removeEventListener('keydown', handleFirstTap);
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
    };
  }, []);

  // Choreographed step timers matching the 10-second intro track
  useEffect(() => {
    const timer1 = setTimeout(() => setStep(1), 200);
    const timer2 = setTimeout(() => setStep(2), 1800);
    const timer3 = setTimeout(() => setStep(3), 3200);
    const timer4 = setTimeout(() => setStep(4), 4500);
    const timer5 = setTimeout(() => setStep(5), 7000);
    const timer6 = setTimeout(() => setStep(6), 8600);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
      clearTimeout(timer5);
      clearTimeout(timer6);
    };
  }, []);

  // Lock body scroll ONLY while intro is visible; unlock as soon as entered or unmounted
  useEffect(() => {
    if (!hasEntered) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [hasEntered]);

  const handleEnter = () => {
    if (isTransitioning || hasEntered) return;

    // Unlock page scroll immediately so all pages can scroll smoothly
    document.body.style.overflow = '';
    document.documentElement.style.overflow = '';

    // Stop 10-second intro song smoothly
    if (introAudioRef.current) {
      try {
        introAudioRef.current.pause();
        introAudioRef.current.currentTime = 0;
      } catch (e) {}
    }

    setIsTransitioning(true);

    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }

    if (onEnter) {
      onEnter('both');
    }

    setTimeout(() => {
      setHasEntered(true);
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }, 1400);
  };

  if (hasEntered) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden select-none py-4 sm:py-6 px-4 transition-all duration-[1400ms] no-scrollbar [&::-webkit-scrollbar]:hidden ${
        isTransitioning
          ? 'opacity-0 scale-110 pointer-events-none filter blur-sm'
          : 'opacity-100 scale-100'
      }`}
      style={{
        backgroundColor: '#07030e',
        transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none'
      }}
      aria-modal="true"
      role="dialog"
      aria-label="Sister Wedding Digital Invitation Entrance"
    >
      {/* Dynamic Gold Dust Particles */}
      <GoldDustOverlay count={45} opacity={0.7} />

      {/* Deep Royal Luxury Background Layers */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] sm:w-[900px] h-[700px] sm:h-[900px] bg-gradient-to-tr from-purple-900/20 via-rose-950/25 to-amber-600/15 blur-[140px] rounded-full" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[350px] bg-amber-500/10 blur-[100px] rounded-full" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(7,3,14,0.4)_50%,rgba(7,3,14,0.95)_100%)]" />
      </div>

      {/* Expanding Golden Light Burst on Enter */}
      <div
        className={`fixed inset-0 pointer-events-none transition-all duration-[1400ms] ${
          isTransitioning
            ? 'opacity-85 scale-150 bg-[radial-gradient(circle_at_center,rgba(254,243,199,0.5)_0%,rgba(245,158,11,0.3)_40%,transparent_75%)]'
            : 'opacity-0 scale-75'
        }`}
        style={{ transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' }}
      />

      {/* Central Content Container */}
      <div className="relative z-20 max-w-2xl mx-auto text-center flex flex-col items-center justify-center my-auto">
        
        {/* STEP 1: Auspicious Golden Wedding Ornament */}
        <div
          className={`transition-all duration-700 transform ${
            step >= 1
              ? 'opacity-100 scale-100 translate-y-0 filter-none'
              : 'opacity-0 scale-75 translate-y-3 blur-sm'
          }`}
          style={{ transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' }}
        >
          <div className="relative mb-3 flex items-center justify-center">
            {/* Glowing Aura Ring */}
            <div className="absolute w-16 h-16 rounded-full bg-amber-500/25 blur-xl animate-pulse" />

            {/* Traditional Kalash with Deepam Icon */}
            <svg
              className="w-12 h-12 sm:w-14 sm:h-14 relative z-10 drop-shadow-[0_0_15px_rgba(245,158,11,0.8)]"
              viewBox="0 0 100 100"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="50" cy="50" r="42" stroke="url(#goldGradIntro)" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />
              <circle cx="50" cy="50" r="36" stroke="url(#goldGradIntro)" strokeWidth="0.8" opacity="0.4" />
              
              <path
                d="M50 16 C47 24 44 28 50 34 C56 28 53 24 50 16 Z"
                fill="url(#goldGradBrightIntro)"
                filter="drop-shadow(0 0 6px #fbbf24)"
              />
              <circle cx="50" cy="22" r="2.5" fill="#ffffff" />

              <path
                d="M50 34 C40 28 32 35 34 42 C41 40 46 37 50 34 Z"
                fill="url(#goldGradIntro)"
                opacity="0.85"
              />
              <path
                d="M50 34 C60 28 68 35 66 42 C59 40 54 37 50 34 Z"
                fill="url(#goldGradIntro)"
                opacity="0.85"
              />

              <path
                d="M37 42 C37 40 63 40 63 42 L60 48 C68 53 71 63 68 73 C65 80 57 82 50 82 C43 82 35 80 32 73 C29 63 32 53 40 48 Z"
                fill="url(#goldGradIntro)"
                stroke="#fef3c7"
                strokeWidth="1.2"
              />

              <circle cx="50" cy="62" r="5" fill="#f43f5e" opacity="0.9" />
              <circle cx="50" cy="62" r="2" fill="#fef3c7" />

              <path
                d="M40 82 L60 82 C58 87 42 87 40 82 Z"
                fill="url(#goldGradBrightIntro)"
              />

              <defs>
                <linearGradient id="goldGradIntro" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#fef3c7" />
                  <stop offset="50%" stopColor="#f59e0b" />
                  <stop offset="100%" stopColor="#b45309" />
                </linearGradient>
                <linearGradient id="goldGradBrightIntro" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ffffff" />
                  <stop offset="50%" stopColor="#fbbf24" />
                  <stop offset="100%" stopColor="#d97706" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>

        {/* STEP 2: "With love and blessings..." */}
        <div
          className={`transition-all duration-700 transform ${
            step >= 2
              ? 'opacity-100 translate-y-0 filter-none'
              : 'opacity-0 translate-y-3 blur-sm'
          }`}
          style={{ transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' }}
        >
          <p className="font-serif italic text-gold-200/90 text-sm sm:text-base tracking-widest mb-1 font-light">
            With love and blessings...
          </p>
        </div>

        {/* STEP 3: "Our Family Invites You" */}
        <div
          className={`transition-all duration-700 transform ${
            step >= 3
              ? 'opacity-100 translate-y-0 filter-none'
              : 'opacity-0 translate-y-3 blur-sm'
          }`}
          style={{ transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' }}
        >
          <h2 className="text-xs sm:text-sm uppercase tracking-[0.3em] font-sans font-semibold text-transparent bg-clip-text bg-gradient-to-r from-gold-300 via-white to-gold-300 mb-3 sm:mb-4">
            Our Family Invites You
          </h2>
        </div>

        {/* STEP 4: Couple Names + Educational Qualifications */}
        <div
          className={`transition-all duration-700 transform ${
            step >= 4
              ? 'opacity-100 scale-100 translate-y-0 filter-none'
              : 'opacity-0 scale-95 translate-y-4 blur-sm'
          }`}
          style={{ transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' }}
        >
          <div className="my-1 sm:my-2">
            {/* Groom Name & Educational Qualification */}
            <div className="flex flex-col items-center">
              <h1 className="couple-names-luxury text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-[#fdfbf7]">
                {config.groomName}
              </h1>
              <span className="text-gold-400 font-serif italic text-xs sm:text-sm tracking-wide font-medium mt-0.5">
                {config.groomQualification || '(PT)., MIAP., D.ACU., CPT.'}
              </span>
            </div>

            {/* Regal Script Ampersand */}
            <div className="ampersand-accent text-3xl sm:text-5xl my-0.5 sm:my-1">
              &amp;
            </div>

            {/* Bride Name & Educational Qualification */}
            <div className="flex flex-col items-center">
              <h1 className="couple-names-luxury text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-[#fdfbf7]">
                {config.brideName}
              </h1>
              <span className="text-gold-400 font-serif italic text-xs sm:text-sm tracking-wide font-medium mt-0.5">
                {config.brideQualification || 'B.Sc., B.Ed.'}
              </span>
            </div>
          </div>
        </div>

        {/* STEP 5: Wedding Date Reveal */}
        <div
          className={`transition-all duration-700 transform ${
            step >= 5
              ? 'opacity-100 translate-y-0 filter-none'
              : 'opacity-0 translate-y-3 blur-sm'
          }`}
          style={{ transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' }}
        >
          <div className="mt-3.5 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-royal-900/85 border border-gold-500/35 text-gold-300 text-xs sm:text-sm font-sans tracking-wide shadow-gold-glow backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-gold-400" />
            <span className="font-semibold text-white">17 September 2026</span>
            <span className="text-gold-500/60">•</span>
            <span className="text-gold-300/90">Dharmapuri</span>
          </div>
        </div>

        {/* STEP 6: Grand Enter Wedding Button (Suitably timed at ~8.6s matching the 10s intro track) */}
        <div
          className={`mt-6 sm:mt-8 w-full max-w-md transition-all duration-700 transform ${
            step >= 6
              ? 'opacity-100 scale-100 translate-y-0 filter-none'
              : 'opacity-0 scale-90 translate-y-4 blur-sm pointer-events-none'
          }`}
          style={{ transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' }}
        >
          <button
            onClick={handleEnter}
            className="group relative inline-flex items-center justify-center gap-3 px-8 py-3.5 rounded-full bg-gradient-to-r from-amber-500 via-gold-400 to-amber-600 text-royal-950 font-bold text-sm sm:text-base shadow-[0_0_30px_rgba(245,158,11,0.55)] hover:shadow-[0_0_45px_rgba(245,158,11,0.8)] hover:scale-105 active:scale-95 transition-all"
          >
            <Sparkles className="w-4 h-4 fill-royal-950 animate-pulse" />
            <span className="tracking-wide">திருமணத்திற்குள் நுழைய • Enter Wedding</span>
            <Heart className="w-4 h-4 fill-royal-950 group-hover:scale-125 transition-transform" />
          </button>
        </div>

      </div>
    </div>
  );
}
