import React, { useState } from 'react';
import { Wand2, Droplets, Sparkles, Database, X, HelpCircle, Power } from 'lucide-react';
import { isSupabaseConfigured } from '../services/supabase';

export default function FxController({ activeFx, onSelectFx }) {
  const [isOpen, setIsOpen] = useState(false);
  const [showSupabaseInfo, setShowSupabaseInfo] = useState(false);

  return (
    <>
      {/* Floating Pill Widget */}
      <div className="fixed top-4 right-4 z-40 flex items-center gap-2">
        <div className="relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-royal-900/90 text-gold-300 border border-gold-500/40 text-xs font-medium shadow-gold-glow backdrop-blur-xl hover:scale-105 active:scale-95 transition-all"
            title="Interactive Visual FX & Supabase Config"
            aria-label="Visual FX Settings"
          >
            <Wand2 className="w-3.5 h-3.5 text-gold-400 animate-spin" style={{ animationDuration: '8s' }} />
            <span className="capitalize hidden sm:inline">{activeFx} FX</span>
          </button>

          {/* Dropdown Menu */}
          {isOpen && (
            <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-royal-900/95 border border-gold-500/40 p-3 shadow-2xl backdrop-blur-2xl text-left">
              <div className="flex items-center justify-between text-xs font-bold text-gold-300 pb-2 border-b border-slate-700/60 mb-2">
                <span>Interactive Cursor FX</span>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-1 text-xs">
                <button
                  onClick={() => {
                    onSelectFx('splash');
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-colors ${
                    activeFx === 'splash'
                      ? 'bg-amber-500/20 text-gold-300 font-semibold border border-amber-500/40'
                      : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Droplets className="w-3.5 h-3.5 text-cyan-400" />
                    Fluid Splash FX
                  </span>
                  {activeFx === 'splash' && <span className="text-[10px] text-gold-400">Active</span>}
                </button>


                <button
                  onClick={() => {
                    onSelectFx('off');
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-colors ${
                    activeFx === 'off'
                      ? 'bg-amber-500/20 text-gold-300 font-semibold border border-amber-500/40'
                      : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <span className="flex items-center gap-2 text-slate-400">
                    <Power className="w-3.5 h-3.5" />
                    Low Power (Clean)
                  </span>
                  {activeFx === 'off' && <span className="text-[10px] text-gold-400">Active</span>}
                </button>
              </div>

              {/* Supabase Status Link */}
              <div className="mt-3 pt-2 border-t border-slate-700/60">
                <button
                  onClick={() => {
                    setShowSupabaseInfo(true);
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center justify-between text-[11px] text-slate-400 hover:text-gold-300 p-1 rounded-lg"
                >
                  <span className="flex items-center gap-1.5">
                    <Database className="w-3 h-3 text-emerald-400" />
                    Supabase Cloud Sync
                  </span>
                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono ${
                    isSupabaseConfigured
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-slate-800 text-slate-400'
                  }`}>
                    {isSupabaseConfigured ? 'Connected' : 'Free Local'}
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Supabase Info Modal */}
      {showSupabaseInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="relative w-full max-w-md rounded-3xl bg-royal-900 border border-gold-500/40 p-6 shadow-2xl text-left">
            <button
              onClick={() => setShowSupabaseInfo(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-emerald-400 text-sm font-bold mb-2">
              <Database className="w-4 h-4" />
              <span>Supabase Cloud Integration Guide</span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              Your website works <strong>100% free with zero configuration</strong> using browser local storage! Family photos and blessings are saved immediately.
            </p>

            <div className="p-3 rounded-xl bg-royal-950 border border-slate-800 text-xs text-slate-300 space-y-2 mb-4 font-mono">
              <p className="text-gold-300 font-sans font-semibold">Optional Free Multi-Device Cloud Sync:</p>
              <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-400">
                <li>Create a free project at <span className="text-emerald-400">supabase.com</span></li>
                <li>Create bucket <code className="text-gold-400">wedding-photos</code> (Public)</li>
                <li>Add <code className="text-gold-400">VITE_SUPABASE_URL</code> and <code className="text-gold-400">VITE_SUPABASE_ANON_KEY</code> to your <code className="text-slate-300">.env</code></li>
              </ol>
            </div>

            <button
              onClick={() => setShowSupabaseInfo(false)}
              className="w-full py-2.5 rounded-xl bg-gold-500 text-royal-950 font-bold text-xs"
            >
              Got It, Continue Celebrating!
            </button>
          </div>
        </div>
      )}
    </>
  );
}
