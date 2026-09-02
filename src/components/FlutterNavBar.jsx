import React from 'react';
import { Home, Heart, Mail, Users, Image as ImageIcon, Calendar, MessageCircleHeart, Plus } from 'lucide-react';
import AudioPlayer from './AudioPlayer';

const NAV_ITEMS = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'couple', label: 'Couple', icon: Heart },
  { id: 'family', label: 'Family', icon: Users },
  { id: 'invitation', label: 'Invitation', icon: Mail },
  { id: 'gallery', label: 'Photos', icon: ImageIcon },
  { id: 'schedule', label: 'Events', icon: Calendar },
  { id: 'blessings', label: 'Wishes', icon: MessageCircleHeart },
];

export default function FlutterNavBar({ activeTab, onSelectTab, onOpenUpload }) {
  const handleTabClick = (id) => {
    // Haptic feedback for Flutter-like tactile feel
    if (typeof window !== 'undefined' && window.navigator?.vibrate) {
      window.navigator.vibrate(15);
    }
    onSelectTab(id);
  };

  return (
    <>
      {/* Flutter-style Floating Curved Glass Bottom Navigation Bar for Mobile */}
      <nav
        className="md:hidden fixed bottom-2.5 left-2 right-2 sm:left-4 sm:right-4 z-40 bg-royal-900/95 backdrop-blur-2xl border border-gold-500/35 rounded-[28px] py-1.5 px-1 shadow-[0_10px_35px_rgba(0,0,0,0.8),0_0_20px_rgba(245,158,11,0.2)]"
        aria-label="Mobile Navigation"
      >
        <div className="flex items-center justify-around relative">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className={`relative flex flex-col items-center justify-center py-1 px-1.5 sm:px-2.5 rounded-xl transition-all duration-300 ${
                  isActive
                    ? 'text-gold-300 scale-105'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {/* Active Indicator Glow */}
                {isActive && (
                  <span className="absolute inset-0 bg-gold-500/20 rounded-xl border border-gold-500/40 shadow-gold-glow animate-pulse-slow" />
                )}
                <Icon className={`w-4 h-4 sm:w-5 sm:h-5 relative z-10 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
                <span className="text-[9px] sm:text-[10px] font-medium tracking-tight mt-0.5 relative z-10 truncate">
                  {item.label}
                </span>
              </button>
            );
          })}

          {/* Quick Floating Action Button in Bottom Nav */}
          <button
            onClick={() => {
              if (window.navigator?.vibrate) window.navigator.vibrate(25);
              onOpenUpload();
            }}
            className="w-10 h-10 -mt-5 rounded-full bg-gradient-to-tr from-amber-500 to-rose-500 text-royal-950 flex items-center justify-center shadow-gold-glow border-2 border-royal-950 active:scale-90 transition-transform"
            title="Add Family Photo"
            aria-label="Upload Photo"
          >
            <Plus className="w-6 h-6 stroke-[3] text-white" />
          </button>
        </div>
      </nav>

      {/* Desktop Top Glassmorphic Navigation Bar */}
      <header className="hidden md:flex fixed top-0 left-0 right-0 z-40 bg-royal-950/80 backdrop-blur-xl border-b border-gold-500/20 px-8 py-3.5 items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-500 to-rose-500 flex items-center justify-center shadow-gold-glow">
            <Heart className="w-5 h-5 text-royal-950 fill-royal-950" />
          </div>
          <div>
            <span className="font-serif font-bold text-white text-base tracking-wide">
              Sister Wedding
            </span>
            <span className="text-[11px] text-gold-400 font-mono block -mt-0.5">
              17th September 2026
            </span>
          </div>
        </div>

        {/* Center Nav Links */}
        <div className="flex items-center gap-1.5 p-1 rounded-full bg-royal-900/80 border border-slate-700/60">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-amber-500 to-gold-600 text-royal-950 font-bold shadow-gold-glow'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right Action Button */}
        <div className="flex items-center gap-3">
          <AudioPlayer />
          <button
            onClick={onOpenUpload}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-amber-500 to-rose-500 text-royal-950 font-bold text-xs shadow-gold-glow hover:scale-105 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4 text-royal-950 stroke-[3]" />
            <span>Add Photo</span>
          </button>
        </div>
      </header>
    </>
  );
}
