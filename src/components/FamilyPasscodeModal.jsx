import React, { useState } from 'react';
import { Lock, KeyRound, ShieldAlert, X, CheckCircle2, HeartHandshake } from 'lucide-react';
import confetti from 'canvas-confetti';
import { playCelebrationChime } from '../utils/audio';

// Accepted secret family codes for easy remembrance by family members
const ACCEPTED_CODES = ['1709', '17092026', '2026', 'MANJU', 'MUNIRAJ', '17/09/2026'];

export default function FamilyPasscodeModal({ isOpen, onClose, onSuccess, actionType = 'upload', photoTitle = '' }) {
  const [code, setCode] = useState('');
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const cleanCode = code.trim().toUpperCase();

    if (ACCEPTED_CODES.includes(cleanCode)) {
      setError(false);
      playCelebrationChime();
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.5 } });
      onSuccess();
      onClose();
    } else {
      setError(true);
      setErrorMessage('தவறான ரகசிய குறியீடு! / Invalid Family Code. Please enter the correct secret passcode.');
    }
  };

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 select-none"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-3xl bg-royal-900 border border-gold-500/40 p-6 sm:p-8 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow backdrop */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-gold-500/10 blur-[80px] pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon & Heading */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center mx-auto mb-3 shadow-gold-glow">
            <Lock className="w-8 h-8 text-royal-950 stroke-[2.5]" />
          </div>

          <span className="px-3 py-1 rounded-full bg-gold-500/10 border border-gold-500/30 text-gold-400 font-mono text-[11px] uppercase tracking-wider font-semibold">
            குடும்பத்தினர் மட்டும் • Family Members Only
          </span>

          <h3 className="text-xl font-serif font-bold text-white mt-2">
            {actionType === 'delete'
              ? 'புகைப்படத்தை நீக்க ரகசிய குறியீடு'
              : actionType === 'edit'
              ? 'விவரங்களை மாற்ற ரகசிய குறியீடு'
              : 'புகைப்படம் பதிவேற்ற ரகசிய குறியீடு'}
          </h3>

          <p className="text-xs text-slate-300 mt-1.5 font-sans">
            {actionType === 'delete'
              ? `"${photoTitle || 'This photo'}" புகைப்படத்தை கேலரியில் இருந்து நீக்க குடும்ப ரகசிய குறியீட்டை உள்ளிடவும்.`
              : actionType === 'edit'
              ? 'மணமக்கள் விவரங்கள் மற்றும் புகைப்படங்களை மாற்ற உங்கள் குடும்ப ரகசிய குறியீட்டை உள்ளிடவும்.'
              : 'திருமண புகைப்படங்களை கேலரியில் சேர்க்க அல்லது நிர்வகிக்க உங்கள் குடும்ப ரகசிய குறியீட்டை உள்ளிடவும்.'}
          </p>
        </div>

        {/* Passcode Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <div>
            <label className="block text-xs uppercase tracking-wider text-slate-300 mb-1.5 font-medium flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-gold-400" />
              Family Secret Passcode (ரகசிய குறியீடு)
            </label>
            <input
              type="password"
              autoFocus
              value={code}
              onChange={(e) => {
                setCode(e.target.value);
                if (error) setError(false);
              }}
              placeholder="Enter secret passcode"
              className={`w-full px-4 py-3 rounded-xl bg-royal-950 border text-white text-center tracking-widest text-lg font-mono focus:outline-none transition-all ${
                error
                  ? 'border-rose-500 ring-2 ring-rose-500/30'
                  : 'border-slate-700 focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20'
              }`}
              required
            />
            {error && (
              <p className="text-xs text-rose-400 mt-1.5 flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                <span>{errorMessage}</span>
              </p>
            )}
            <p className="text-[11px] text-slate-400 mt-2 text-center">
              🔒 குடும்பத்தினருக்கான ரகசிய குறியீட்டை உள்ளிடவும் / Enter family secret passcode
            </p>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`flex-1 py-3 rounded-xl font-bold text-xs shadow-gold-glow flex items-center justify-center gap-1.5 transition-all hover:scale-102 active:scale-98 ${
                actionType === 'delete'
                  ? 'bg-gradient-to-r from-rose-500 to-red-600 text-white shadow-rose-500/30'
                  : 'bg-gradient-to-r from-amber-500 to-gold-500 text-royal-950 shadow-gold-glow'
              }`}
            >
              <span>
                {actionType === 'delete'
                  ? 'Confirm & Remove'
                  : actionType === 'edit'
                  ? 'Verify & Open Editor'
                  : 'Verify & Open Upload'}
              </span>
            </button>
          </div>
        </form>

        <div className="mt-4 pt-3 border-t border-slate-800/80 text-center">
          <p className="text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
            <HeartHandshake className="w-3.5 h-3.5 text-gold-400" />
            Protected for Sister Wedding
          </p>
        </div>
      </div>
    </div>
  );
}
