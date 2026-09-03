import React, { useState, useEffect } from 'react';
import { Calendar, Heart, MapPin, Sparkles, Download, Clock } from 'lucide-react';
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
      <div className="relative z-10 max-w-4xl mx-auto text-center">
        {/* Auspicious Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-royal-900/90 border border-gold-500/40 text-gold-300 text-xs sm:text-sm font-medium backdrop-blur-md shadow-gold-glow mb-6">
          <Sparkles className="w-4 h-4 text-gold-400 animate-spin" style={{ animationDuration: '6s' }} />
          <span>The Auspicious Marriage Function • 17th September 2026</span>
          <Sparkles className="w-4 h-4 text-gold-400" />
        </div>

        {/* Wedding Tagline */}
        <p className="font-serif italic text-gold-200/90 text-sm sm:text-base tracking-wider mb-2">
          Together with our families, we invite you to celebrate our sister
        </p>

        {/* Couple Names in Regal Script */}
        <h1 className="text-3xl sm:text-6xl md:text-7xl font-serif font-bold tracking-tight sm:tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-gold-100 via-white to-gold-300 drop-shadow-[0_4px_20px_rgba(245,158,11,0.3)] my-2 leading-snug sm:leading-tight">
          <span className="inline-block whitespace-nowrap">{config.groomName}</span>{' '}
          <span className="text-rose-400 font-script text-4xl sm:text-7xl mx-1 align-middle">&</span>{' '}
          <span className="inline-block whitespace-nowrap">{config.brideName}</span>
        </h1>

        <p className="text-gold-300 font-serif italic text-xs sm:text-sm mb-3 max-w-xl mx-auto px-2">
          Dr. M. முனிராஜ், (PT)., MIAP., D.ACU., CPT. & M. மஞ்சு, B.Sc., B.Ed.
        </p>

        {/* Hashtag & Date Banner */}
        <div className="flex flex-wrap items-center justify-center gap-3 text-slate-300 text-xs sm:text-sm font-sans my-4">
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-royal-800/60 border border-slate-700/50">
            <Calendar className="w-4 h-4 text-gold-400" />
            <strong className="text-white font-semibold">17 / 09 / 2026</strong>
          </span>
          <span className="hidden sm:inline text-gold-500/50">•</span>
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-royal-800/60 border border-slate-700/50">
            <Clock className="w-4 h-4 text-gold-400" />
            <span>சுபமுகூர்த்தம்: 04:30 AM - 05:30 AM</span>
          </span>
          <span className="hidden sm:inline text-gold-500/50">•</span>
          <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-gold-300 font-medium text-xs">
            {config.hashtag}
          </span>
        </div>

        {/* Countdown Timer */}
        <div className="my-8 max-w-xl mx-auto">
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
                className="relative group p-3 sm:p-4 rounded-2xl bg-royal-900/80 border border-gold-500/25 backdrop-blur-xl shadow-royal-card hover:border-gold-500/60 transition-all hover:scale-105"
              >
                <div className="text-2xl sm:text-4xl md:text-5xl font-bold font-serif text-transparent bg-clip-text bg-gradient-to-b from-white via-gold-100 to-gold-400">
                  {String(unit.value).padStart(2, '0')}
                </div>
                <div className="text-[10px] sm:text-xs tracking-wider text-slate-400 uppercase mt-1">
                  {unit.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Venue & Location */}
        <div className="flex items-center justify-center gap-2 text-xs sm:text-sm text-slate-300 mb-8">
          <MapPin className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{config.venue}, {config.location}</span>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
          <button
            onClick={() => onScrollTo('invitation')}
            className="flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-amber-500 via-gold-500 to-amber-600 text-royal-950 font-bold text-sm shadow-gold-glow hover:shadow-[0_0_35px_rgba(245,158,11,0.6)] hover:scale-105 active:scale-95 transition-all"
          >
            <Sparkles className="w-4 h-4 fill-royal-950" />
            <span>திருமண அழைப்பிதழ் (Invitation Card)</span>
          </button>

          <button
            onClick={() => onScrollTo('gallery')}
            className="flex items-center gap-2 px-5 py-3 rounded-full bg-royal-900/90 text-gold-300 font-semibold text-sm border border-gold-500/40 hover:bg-gold-500/15 hover:border-gold-400 transition-all backdrop-blur-md hover:scale-105 active:scale-95"
          >
            <Heart className="w-4 h-4 text-gold-400 fill-gold-400/20" />
            <span>Wedding Photos</span>
          </button>

          <button
            onClick={handleGoogleCalendar}
            className="flex items-center gap-2 px-4 py-3 rounded-full bg-royal-900/80 text-slate-300 font-medium text-xs border border-slate-700/60 hover:text-white hover:border-slate-500 transition-all"
          >
            <Calendar className="w-3.5 h-3.5 text-gold-400" />
            <span>Save The Date</span>
          </button>

          <AudioPlayer />
        </div>
      </div>
    </section>
  );
}
