import React, { useState } from 'react';
import { Heart, Sparkles, QrCode, Copy, Check, ExternalLink, ArrowRight, Smartphone, ShieldCheck, Gift } from 'lucide-react';
import confetti from 'canvas-confetti';
import { playCelebrationChime } from '../utils/audio';

export default function DeveloperSupport() {
  const [amount, setAmount] = useState('100');
  const [customAmount, setCustomAmount] = useState('');
  const [copied, setCopied] = useState(false);

  const UPI_ID = 'muthurajc@slc';
  const PAYEE_NAME = 'Muthuraj C B.E CSE';

  const PRESET_AMOUNTS = ['50', '100', '200', '500', '1001'];

  const currentAmount = customAmount ? customAmount : amount;

  // Construct UPI Intent URI
  const upiIntentUrl = `upi://pay?pa=${encodeURIComponent(UPI_ID)}&pn=${encodeURIComponent(PAYEE_NAME)}&am=${encodeURIComponent(currentAmount)}&cu=INR&tn=${encodeURIComponent('Sister Wedding Website Support')}`;
  const gpayUrl = `tez://upi/pay?pa=${encodeURIComponent(UPI_ID)}&pn=${encodeURIComponent(PAYEE_NAME)}&am=${encodeURIComponent(currentAmount)}&cu=INR`;
  const phonepeUrl = `phonepe://pay?pa=${encodeURIComponent(UPI_ID)}&pn=${encodeURIComponent(PAYEE_NAME)}&am=${encodeURIComponent(currentAmount)}&cu=INR`;

  // Dynamic QR code URL via QR Server API (fallback to local image)
  const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&margin=10&data=${encodeURIComponent(upiIntentUrl)}`;

  const handleCopyUPI = () => {
    navigator.clipboard.writeText(UPI_ID);
    setCopied(true);
    playCelebrationChime();
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePayViaApp = (url) => {
    playCelebrationChime();
    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.8 }
    });
    window.location.href = url;
  };

  return (
    <section id="developer-support" className="relative py-20 px-4 max-w-4xl mx-auto">
      {/* Ambient glowing background aura */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-gradient-to-r from-amber-500/15 via-rose-600/15 to-purple-600/15 blur-[130px] rounded-full pointer-events-none" />

      <div className="relative z-10 rounded-3xl bg-royal-900/80 border border-gold-500/40 p-6 sm:p-10 backdrop-blur-2xl shadow-[0_12px_45px_rgba(0,0,0,0.7),0_0_30px_rgba(245,158,11,0.2)] text-center">
        {/* Heart Sparkle Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs font-semibold uppercase tracking-wider mb-4 shadow-sm">
          <Heart className="w-3.5 h-3.5 fill-rose-400 text-rose-400 animate-pulse" />
          <span>Developer Support • அன்பின் ஆதரவு</span>
        </div>

        {/* Section Heading */}
        <h2 className="text-2xl sm:text-4xl font-serif font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gold-100 via-amber-200 to-rose-200">
          Developer-க்கு உங்கள் ஆதரவு ❤️
        </h2>

        {/* Message from Developer / Family */}
        <div className="mt-4 max-w-2xl mx-auto space-y-3">
          <p className="text-slate-200 text-sm sm:text-base leading-relaxed font-sans">
            உங்கள் இனிய திருமண தருணங்களை இன்னும் சிறப்பாகவும் நினைவாகவும் மாற்றும் வகையில், இந்த Wedding Website அன்புடன் வடிவமைத்து உருவாக்கப்பட்டது. இந்த Website உங்களுக்கு பிடித்திருந்தால், Developer-க்கு உங்கள் விருப்பப்படி எந்தத் தொகையையும் QR Code மூலம் Support செய்யலாம்.
          </p>

          <div className="p-3.5 rounded-2xl bg-royal-950/70 border border-gold-500/30 text-gold-300 text-xs sm:text-sm font-serif italic leading-relaxed shadow-inner">
            ✨ பணம் செலுத்துவது முற்றிலும் கட்டாயமில்லை — உங்கள் அன்பும், வாழ்த்துகளும், மகிழ்ச்சியும் எங்களுக்கு போதுமானது! ❤️✨
          </div>
        </div>

        {/* Amount Selector */}
        <div className="mt-8 pt-6 border-t border-slate-800/80">
          <label className="text-xs uppercase font-mono tracking-widest text-gold-400 font-semibold block mb-3">
            விருப்பமான தொகையை தேர்வு செய்யவும் (Select Amount):
          </label>

          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
            {PRESET_AMOUNTS.map((preset) => {
              const isSelected = amount === preset && !customAmount;
              return (
                <button
                  key={preset}
                  onClick={() => {
                    setAmount(preset);
                    setCustomAmount('');
                  }}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                    isSelected
                      ? 'bg-gradient-to-r from-amber-500 to-gold-500 text-royal-950 shadow-gold-glow scale-105 border-2 border-white'
                      : 'bg-royal-950/80 text-slate-300 border border-slate-800 hover:border-gold-500/50 hover:text-white'
                  }`}
                >
                  ₹{preset} {preset === '1001' && '✨ (மங்கல மொய்)'}
                </button>
              );
            })}
          </div>

          {/* Custom Amount Input */}
          <div className="mt-4 flex items-center justify-center gap-2 max-w-xs mx-auto">
            <span className="text-slate-400 text-xs font-mono">Other Amount:</span>
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gold-400 text-xs font-bold">₹</span>
              <input
                type="number"
                min="1"
                placeholder="Enter amount"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                className="w-full pl-7 pr-3 py-1.5 rounded-xl bg-royal-950 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-gold-400"
              />
            </div>
          </div>
        </div>

        {/* QR Code Showcase */}
        <div className="mt-8 flex flex-col items-center">
          <div className="relative p-4 rounded-3xl bg-white shadow-[0_10px_35px_rgba(0,0,0,0.8),0_0_30px_rgba(245,158,11,0.3)] border-4 border-amber-400/80 group">
            {/* Corner Decorative Dots */}
            <div className="absolute top-2 left-2 w-2 h-2 rounded-full bg-amber-500" />
            <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-amber-500" />
            <div className="absolute bottom-2 left-2 w-2 h-2 rounded-full bg-amber-500" />
            <div className="absolute bottom-2 right-2 w-2 h-2 rounded-full bg-amber-500" />

            <img
              src={qrApiUrl}
              alt="UPI QR Code for Developer Support"
              onError={(e) => {
                e.currentTarget.src = '/developer_qr.png';
              }}
              className="w-56 h-56 sm:w-64 sm:h-64 object-contain rounded-xl"
            />

            {/* Amount Badge below QR */}
            <div className="mt-2 text-center text-royal-950 font-bold text-sm flex items-center justify-center gap-1.5 font-mono">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Paying: ₹{currentAmount || '100'}</span>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 mt-2 font-mono">
            Scan using any UPI App (GPay, PhonePe, Paytm, BHIM, CRED)
          </p>
        </div>

        {/* Mobile Direct UPI Launch Buttons */}
        <div className="mt-6">
          <span className="text-xs uppercase font-mono tracking-wider text-slate-300 font-semibold block mb-3">
            Mobile Web Direct Payment (மொபைலில் நேரடியாக திறக்க):
          </span>

          <div className="flex flex-wrap items-center justify-center gap-3">
            {/* Any UPI App Direct */}
            <button
              onClick={() => handlePayViaApp(upiIntentUrl)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-amber-500 via-gold-400 to-amber-600 text-royal-950 font-bold text-xs sm:text-sm shadow-gold-glow hover:scale-105 active:scale-95 transition-all"
            >
              <Smartphone className="w-4 h-4" />
              <span>Pay with Any UPI App (₹{currentAmount || '100'})</span>
            </button>

            {/* Google Pay */}
            <button
              onClick={() => handlePayViaApp(gpayUrl)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-royal-950/90 border border-slate-700 hover:border-gold-500/50 text-slate-200 hover:text-white text-xs font-semibold hover:scale-105 transition-all shadow-md"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              <span>Google Pay</span>
            </button>

            {/* PhonePe */}
            <button
              onClick={() => handlePayViaApp(phonepeUrl)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-royal-950/90 border border-slate-700 hover:border-gold-500/50 text-slate-200 hover:text-white text-xs font-semibold hover:scale-105 transition-all shadow-md"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-purple-400" />
              <span>PhonePe</span>
            </button>
          </div>
        </div>

        {/* UPI ID Copy Card */}
        <div className="mt-6 pt-6 border-t border-slate-800/80 flex flex-wrap items-center justify-center gap-3 text-xs text-slate-300">
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-royal-950/90 border border-slate-800">
            <span className="text-slate-400">UPI ID:</span>
            <strong className="text-gold-300 font-mono text-sm">{UPI_ID}</strong>
            <button
              onClick={handleCopyUPI}
              className="ml-2 p-1.5 rounded-lg bg-royal-900 hover:bg-gold-500 hover:text-royal-950 text-slate-300 transition-colors"
              title="Copy UPI ID"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>

          <div className="text-slate-400 text-xs">
            Payee: <strong className="text-white font-serif">{PAYEE_NAME}</strong>
          </div>
        </div>

        {/* Heartfelt Note */}
        <div className="mt-6 text-center text-xs text-slate-400 flex items-center justify-center gap-1.5">
          <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
          <span>உங்கள் வருகைக்கும் ஆதரவிற்கும் எங்கள் மனமார்ந்த நன்றிகள்! • Thank You!</span>
        </div>
      </div>
    </section>
  );
}
