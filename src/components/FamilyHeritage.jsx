import React from 'react';
import { FAMILY_HIERARCHY } from '../data/weddingData';
import { Sparkles, Heart } from 'lucide-react';
import ElectricBorder from './ElectricBorder';

export default function FamilyHeritage({ config }) {
  const { brideSide, groomSide } = FAMILY_HIERARCHY;

  return (
    <section id="family" className="relative py-16 px-4 max-w-5xl mx-auto">
      {/* Section Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-gold-500/10 border border-gold-500/30 text-gold-400 text-xs font-semibold uppercase tracking-wider mb-3">
          <Sparkles className="w-3.5 h-3.5 text-gold-400" />
          இரு குடும்பங்களின் மங்கல சங்கமம்
        </div>
        <h2 className="text-3xl sm:text-5xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-gold-100 via-white to-gold-300">
          சின்னபங்குநத்தம் & பிக்கம்பட்டி
        </h2>
        <p className="text-gold-200/90 text-sm sm:text-base font-serif italic mt-2">
          அன்பாலும் பண்பாலும் இணையும் இரு பெருங்குடும்பங்களின் தெய்வீகத் திருமண வைபவம்
        </p>
      </div>

      {/* Unified Both Families Showcase */}
      <ElectricBorder
        color="#f59e0b"
        speed={1.0}
        chaos={0.1}
        borderRadius={28}
        className="shadow-2xl"
      >
        <div className="p-6 sm:p-10 rounded-[28px] bg-royal-900/90 border border-gold-500/40 backdrop-blur-xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 text-left">
            {/* 1. Bride Side (மணமகள் குடும்பம் • சின்னபங்குநத்தம்) */}
            <div className="p-6 rounded-2xl bg-royal-950/80 border border-gold-500/30 hover:border-gold-500/50 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-gold-500/20 pb-3 mb-4">
                  <div>
                    <span className="text-[11px] font-bold text-gold-400 uppercase tracking-wider block">
                      மணமகள் குடும்பம் • சின்னபங்குநத்தம்
                    </span>
                    <h3 className="text-xl sm:text-2xl font-serif font-bold text-white mt-1">
                      {brideSide.parents.father.name} - {brideSide.parents.mother.name}
                    </h3>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-gold-500/20 flex items-center justify-center text-lg">
                    🌸
                  </div>
                </div>

                <div className="mb-4">
                  <span className="text-[10px] text-slate-400 block uppercase tracking-wider font-semibold">மணமகள்</span>
                  <p className="text-base font-serif font-bold text-gold-300 mt-0.5">
                    {brideSide.bride.name}, <span className="text-xs font-sans text-slate-300">{brideSide.bride.qualification}</span>
                  </p>
                </div>
              </div>

              {/* Blessing message */}
              <div className="p-3.5 rounded-xl bg-royal-900/60 border border-gold-500/30 mt-4 text-xs text-slate-200 leading-relaxed">
                ❤️ <strong className="text-gold-300">இருவீட்டார் நல்வாழ்த்துகள்:</strong> அனைவரும் வருகை தந்து மணமக்களை மனதார வாழ்த்தி அருள வேண்டுகிறோம்.
              </div>
            </div>

            {/* 2. Groom Side (மணமகன் குடும்பம் • பிக்கம்பட்டி) */}
            <div className="p-6 rounded-2xl bg-royal-950/80 border border-rose-500/30 hover:border-rose-500/50 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-rose-500/20 pb-3 mb-4">
                  <div>
                    <span className="text-[11px] font-bold text-rose-400 uppercase tracking-wider block">
                      மணமகன் குடும்பம் • பிக்கம்பட்டி
                    </span>
                    <h3 className="text-xl sm:text-2xl font-serif font-bold text-white mt-1">
                      {groomSide.parents.father.name} - {groomSide.parents.mother.name}
                    </h3>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-rose-500/20 flex items-center justify-center text-lg">
                    👑
                  </div>
                </div>

                <div className="mb-4">
                  <span className="text-[10px] text-slate-400 block uppercase tracking-wider font-semibold">மணமகன்</span>
                  <p className="text-base font-serif font-bold text-rose-300 mt-0.5">
                    {groomSide.groom.name}, <span className="text-xs font-sans text-slate-300">(PT)., MIAP., D.ACU., CPT.</span>
                  </p>
                </div>
              </div>

              {/* Blessing message */}
              <div className="p-3.5 rounded-xl bg-royal-900/60 border border-rose-500/30 mt-4 text-xs text-slate-200 leading-relaxed">
                ❤️ <strong className="text-rose-300">இருவீட்டார் நல்வாழ்த்துகள்:</strong> அனைவரும் வருகை தந்து மணமக்களை மனதார வாழ்த்தி அருள வேண்டுகிறோம்.
              </div>
            </div>
          </div>
        </div>
      </ElectricBorder>
    </section>
  );
}
