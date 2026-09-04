import React, { useState, useEffect } from 'react';
import { Calendar, Heart, MapPin, Sparkles, Download, Clock, ChevronDown } from 'lucide-react';
import AudioPlayer from './AudioPlayer';
import { playCelebrationChime } from '../utils/audio';
import confetti from 'canvas-confetti';

export default function HeroSection({ config, onOpenUpload, onScrollTo }) {
  // Real-time Countdown timer to 17th September 2026
  const targetDate = new Date(config.weddingDate).getTime();
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000)
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  // Save to Google Calendar
  const handleGoogleCalendar = () => {
    playCelebrationChime();
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
    const startTime = "20260917T040000Z"; // 09:30 AM IST is 04:00 AM UTC
    const endTime = "20260917T063000Z";
    const title = encodeURIComponent(`${config.brideName} & ${config.groomName}'s Royal Wedding`);
    const details = encodeURIComponent(`You are cordially invited to celebrate the auspicious marriage of ${config.brideName} and ${config.groomName} on 17/09/2026. Venue: ${config.venue}, ${config.location}`);
    const location = encodeURIComponent(config.location);
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startTime}/${endTime}&details=${details}&location=${location}`;
    window.open(url, '_blank');
  };

  // Download .ics file
  const handleDownloadIcs = () => {
    playCelebrationChime();
    confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
    const icsData = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Sister Royal Wedding//17-09-2026//EN
CALSCALE:GREGORIAN
BEGIN:VEVENT
SUMMARY:${config.brideName} & ${config.groomName} Royal Wedding
DESCRIPTION:Auspicious Marriage Function of our sister ${config.brideName} and ${config.groomName}.
LOCATION:${config.venue}, ${config.location}
DTSTART:20260917T040000Z
DTEND:20260917T063000Z
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `Wedding_${config.brideName}_and_${config.groomName}_17Sep2026.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <section id="home" className="relative min-h-[92vh] flex items-center justify-center overflow-hidden pt-20 pb-16 px-4">
      {/* Radiant radial gradient overlays */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-gradient-to-br from-amber-500/15 via-rose-600/10 to-transparent blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-72 h-72 bg-purple-600/15 blur-[90px] rounded-full pointer-events-none" />

      {/* Main Content Card */}
      <div className="relative z-10 max-w-5xl mx-auto text-center">
        {/* 1. Auspicious Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-royal-900/90 border border-gold-500/40 text-gold-300 text-xs sm:text-sm font-medium backdrop-blur-md shadow-gold-glow mb-6 animate-[fadeIn_0.8s_ease-out]">
          <Sparkles className="w-4 h-4 text-gold-400 animate-spin" style={{ animationDuration: '6s' }} />
          <span className="tracking-wide">The Auspicious Marriage Function • 17th September 2026</span>
          <Sparkles className="w-4 h-4 text-gold-400" />
        </div>

        {/* 2. Wedding Tagline (Small invitation text: elegant italic serif) */}
        <p className="font-serif italic text-gold-200/90 text-sm sm:text-base md:text-lg tracking-wider mb-2 font-light animate-[fadeIn_1s_ease-out_0.2s_both]">
          Together with our families, we invite you to celebrate our sister
        </p>

        {/* 3. Main Couple Names: Luxury high-contrast serif, warm ivory / soft white, largest text, white-gold glow */}
        <div className="my-2 sm:my-3">
          <h1 className="couple-names-luxury hero-names-entrance text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[1.18] sm:leading-tight">
            <span className="inline-block whitespace-nowrap">{config.groomName}</span>{' '}
            <span className="ampersand-accent text-4xl sm:text-6xl md:text-7xl mx-1.5 sm:mx-2 align-middle font-normal">
              &amp;
            </span>{' '}
            <span className="inline-block whitespace-nowrap">{config.brideName}</span>
          </h1>
        </div>

        {/* 4. Professional Titles: Smaller elegant serif/italic */}
        <p className="text-gold-300/85 font-serif italic text-xs sm:text-sm md:text-base mb-4 max-w-xl mx-auto px-2 tracking-wide animate-[fadeIn_1s_ease-out_0.5s_both]">
          Dr. M. முனிராஜ், (PT)., MIAP., D.ACU., CPT. &amp; M. மஞ்சு, B.Sc., B.Ed.
        </p>

        {/* 5. Date and Muhurtham: Clean modern sans-serif with subtle gold accents */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 text-slate-300 text-xs sm:text-sm font-sans my-4 animate-[fadeIn_1s_ease-out_0.6s_both]">
          <span className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-royal-800/80 border border-gold-500/30 shadow-sm backdrop-blur-md">
            <Calendar className="w-4 h-4 text-gold-400" />
            <strong className="text-white font-semibold tracking-wide">17 / 09 / 2026</strong>
          </span>
          <span className="hidden sm:inline text-gold-500/50">•</span>
          <span className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-royal-800/80 border border-gold-500/30 shadow-sm backdrop-blur-md">
            <Clock className="w-4 h-4 text-gold-400" />
            <span className="text-gold-100 font-medium">சுபமுகூர்த்தம்: 04:30 AM - 05:30 AM</span>
          </span>
          <span className="hidden sm:inline text-gold-500/50">•</span>
          <span className="px-3 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/35 text-gold-300 font-medium text-xs">
            {config.hashtag}
          </span>
        </div>

        {/* 6. Countdown Timer */}
        <div className="my-8 max-w-xl mx-auto animate-[fadeIn_1s_ease-out_0.7s_both]">
          <p className="text-xs uppercase tracking-[0.25em] text-gold-400/80 mb-3 font-medium">
            Countdown to Brahma Muhurtham (பிரம்ம முகூர்த்தம்)
          </p>
          <div className="grid grid-cols-4 gap-2.5 sm:gap-4">
            {[
              { label: 'Days', value: timeLeft.days },
              { label: 'Hours', value: timeLeft.hours },
              { label: 'Minutes', value: timeLeft.minutes },
              { label: 'Seconds', value: timeLeft.seconds },
            ].map((unit, i) => (
              <div
                key={i}
                className="relative group p-3 sm:p-4 rounded-2xl bg-royal-900/85 border border-gold-500/25 backdrop-blur-xl shadow-royal-card hover:border-gold-500/60 transition-all duration-300 hover:scale-105"
              >
                <div className="text-2xl sm:text-4xl md:text-5xl font-bold font-serif text-transparent bg-clip-text bg-gradient-to-b from-white via-gold-100 to-gold-400 drop-shadow-sm">
                  {String(unit.value).padStart(2, '0')}
                </div>
                <div className="text-[10px] sm:text-xs tracking-wider text-slate-400 uppercase mt-1 font-sans font-medium">
                  {unit.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 7. Venue & Location */}
        <div className="flex items-center justify-center gap-2 text-xs sm:text-sm text-slate-300 mb-8 animate-[fadeIn_1s_ease-out_0.8s_both]">
          <MapPin className="w-4 h-4 text-rose-400 shrink-0" />
          <span className="text-slate-200">{config.venue}, {config.location}</span>
        </div>

        {/* 8. Action Buttons with improved hover physics */}
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 animate-[fadeIn_1s_ease-out_0.9s_both]">
          <button
            onClick={() => onScrollTo('invitation')}
            className="btn-royal-primary flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-amber-500 via-gold-500 to-amber-600 text-royal-950 font-bold text-sm shadow-gold-glow active:scale-95"
          >
            <Sparkles className="w-4 h-4 fill-royal-950" />
            <span>திருமண அழைப்பிதழ் (Invitation Card)</span>
          </button>

          <button
            onClick={() => onScrollTo('gallery')}
            className="btn-royal-secondary flex items-center gap-2 px-5 py-3 rounded-full bg-royal-900/90 text-gold-300 font-semibold text-sm border border-gold-500/40 hover:bg-gold-500/15 backdrop-blur-md active:scale-95"
          >
            <Heart className="w-4 h-4 text-gold-400 fill-gold-400/20" />
            <span>Wedding Photos</span>
          </button>

          <button
            onClick={handleGoogleCalendar}
            className="btn-royal-secondary flex items-center gap-2 px-4 py-3 rounded-full bg-royal-900/80 text-slate-300 font-medium text-xs border border-slate-700/60 hover:text-white active:scale-95"
          >
            <Calendar className="w-3.5 h-3.5 text-gold-400" />
            <span>Save The Date</span>
          </button>

          <AudioPlayer />
        </div>

        {/* 9. Scroll Down Exploration Cue */}
        <div className="mt-8 flex flex-col items-center justify-center animate-[fadeIn_1s_ease-out_1.2s_both]">
          <button
            onClick={() => onScrollTo('couple')}
            className="flex flex-col items-center gap-1.5 text-gold-400/80 hover:text-gold-300 transition-all hover:scale-105 active:scale-95 group"
            title="Scroll to next section"
            aria-label="Scroll to next section"
          >
            <span className="text-[10px] tracking-widest uppercase font-mono text-gold-300/80 group-hover:text-gold-200">
              கீழே ஸ்க்ரோல் செய்யவும் • Scroll Down
            </span>
            <span className="p-1.5 rounded-full bg-royal-900/80 border border-gold-500/30 group-hover:border-gold-400 shadow-md">
              <ChevronDown className="w-4 h-4 text-gold-400 animate-bounce" />
            </span>
          </button>
        </div>
      </div>
    </section>
  );
}
