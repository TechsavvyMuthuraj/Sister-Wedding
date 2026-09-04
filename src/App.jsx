import React, { useState, useEffect } from 'react';
import HeroSection from './components/HeroSection';
import CoupleSpotlight from './components/CoupleSpotlight';
import FamilyHeritage from './components/FamilyHeritage';
import InvitationCardViewer from './components/InvitationCardViewer';
import PhotoGallery from './components/PhotoGallery';
import EventSchedule from './components/EventSchedule';
import BlessingsWall from './components/BlessingsWall';
import UploadModal from './components/UploadModal';
import FlutterNavBar from './components/FlutterNavBar';

import WeddingMusicPlayer from './components/WeddingMusicPlayer';
import Lightfall from './components/Lightfall';
import DeveloperSupport from './components/DeveloperSupport';
import WeddingOpeningIntro from './components/WeddingOpeningIntro';
import GoldDustOverlay from './components/GoldDustOverlay';
import { MusicProvider, useMusic } from './context/MusicContext';
import { WEDDING_CONFIG, INITIAL_PHOTOS, INITIAL_WISHES } from './data/weddingData';
import {
  fetchFamilyPhotos, fetchWishes, saveWeddingSettings, fetchWeddingSettings,
  updateFamilyPhoto, deleteFamilyPhotoFromCloud, updateWish, deleteWishFromCloud
} from './services/supabase';
import { Heart, Sparkles, ArrowUp } from 'lucide-react';

function AppContent() {
  const { playSong } = useMusic();
  const [hasEntered, setHasEntered] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Wedding details config (customizable)
  const [config, setConfig] = useState(() => {
    try {
      const saved = localStorage.getItem('wedding_custom_config');
      if (!saved) return WEDDING_CONFIG;
      const parsed = JSON.parse(saved);
      if (
        parsed.brideName === "Ananya" ||
        parsed.brotherMessage?.includes("அஜய்") ||
        parsed.location?.includes("Nallanoor") ||
        parsed.brideNative?.includes("Chinnanguppam") ||
        parsed.groomNative?.includes("பிக்கம்பட்டி") ||
        !parsed.brotherMessage?.includes("குத்துவிளக்காய்") ||
        !parsed.googleMapsUrl?.includes("UiJxTzEtP1bfVhN59")
      ) {
        localStorage.removeItem('wedding_custom_config');
        return WEDDING_CONFIG;
      }
      return { ...WEDDING_CONFIG, ...parsed };
    } catch {
      return WEDDING_CONFIG;
    }
  });

  // Helper to strictly ensure ONLY genuine uploaded photos appear in Photos section (never invitation cards or old mock photos)
  const isRealPhoto = (p) => {
    if (!p) return false;
    const id = String(p.id || '');
    const img = String(p.frontImage || p.image || p.image_url || '');
    if (id.startsWith('inv_')) return false;
    if (img.includes('/invitation/')) return false;
    if (img.includes('unsplash.com')) return false;
    if (['p1', 'p2', 'p3', 'p4', 'p5', 'p6'].includes(id)) return false;
    if (p.badge === 'Official Card' || p.badge === 'Lagnapatrika' || p.badge === 'Family List' || p.badge === 'Blessing Cover') return false;
    return true;
  };

  // Photos state (initial + custom from local storage, minus deleted photos, excluding invitation cards)
  const [photos, setPhotos] = useState(() => {
    try {
      const deletedIds = JSON.parse(localStorage.getItem('wedding_deleted_photo_ids') || '[]');
      const custom = JSON.parse(localStorage.getItem('wedding_custom_photos') || '[]');
      const photoMap = new Map();
      INITIAL_PHOTOS.forEach(p => photoMap.set(p.id, p));
      custom.forEach(p => {
        if (!['p1', 'p2', 'p3', 'p4', 'p5', 'p6'].includes(p.id) && !String(p.frontImage || p.image || '').includes('unsplash')) {
          photoMap.set(p.id, { ...(photoMap.get(p.id) || {}), ...p });
        }
      });
      return Array.from(photoMap.values()).filter(isRealPhoto).filter(p => !deletedIds.includes(p.id));
    } catch {
      return INITIAL_PHOTOS.filter(isRealPhoto);
    }
  });

  // Wishes state
  const [wishes, setWishes] = useState(() => {
    try {
      const deletedWishIds = JSON.parse(localStorage.getItem('wedding_deleted_wish_ids') || '[]');
      const custom = JSON.parse(localStorage.getItem('wedding_custom_wishes') || '[]');
      const realCustom = custom.filter(w => !['w1', 'w2', 'w3', 'w4'].includes(w.id));
      const combined = [...realCustom, ...INITIAL_WISHES];
      return combined.filter(w => !deletedWishIds.includes(w.id));
    } catch {
      return INITIAL_WISHES;
    }
  });

  const [activeTab, setActiveTab] = useState('home');
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  // Strict In-Memory Family Passcode Authorization
  // Never persisted: Resets to locked (false) on every page refresh or window close
  const [isFamilyUnlocked, setIsFamilyUnlocked] = useState(false);

  useEffect(() => {
    try {
      sessionStorage.removeItem('wedding_family_auth');
      localStorage.removeItem('wedding_family_auth');

      // Purge any stored invitation cards and old mock photos from local storage
      const cached = JSON.parse(localStorage.getItem('wedding_custom_photos') || '[]');
      const cleaned = cached.filter(isRealPhoto);
      if (cleaned.length !== cached.length) {
        localStorage.setItem('wedding_custom_photos', JSON.stringify(cleaned));
      }

      // Purge any stored mock wishes from local storage
      const cachedWishes = JSON.parse(localStorage.getItem('wedding_custom_wishes') || '[]');
      const cleanedWishes = cachedWishes.filter(w => !['w1', 'w2', 'w3', 'w4'].includes(w.id));
      if (cleanedWishes.length !== cachedWishes.length) {
        localStorage.setItem('wedding_custom_wishes', JSON.stringify(cleanedWishes));
      }
    } catch { }

    // Fetch and merge cloud photos from Supabase
    async function loadCloudData() {
      try {
        const cloudPhotos = await fetchFamilyPhotos();
        if (cloudPhotos && cloudPhotos.length > 0) {
          setPhotos(prev => {
            const deletedIds = JSON.parse(localStorage.getItem('wedding_deleted_photo_ids') || '[]');
            const existingIds = new Set(prev.map(p => p.id));
            const newCloud = cloudPhotos.filter(isRealPhoto).filter(p => !existingIds.has(p.id) && !deletedIds.includes(p.id));
            if (newCloud.length > 0) {
              // Cache to localStorage
              try {
                const custom = JSON.parse(localStorage.getItem('wedding_custom_photos') || '[]');
                const customIds = new Set(custom.map(c => c.id));
                const merged = [...newCloud.filter(p => !customIds.has(p.id)), ...custom].filter(isRealPhoto);
                localStorage.setItem('wedding_custom_photos', JSON.stringify(merged));
              } catch { }
              return [...newCloud, ...prev];
            }
            return prev.filter(isRealPhoto);
          });
        }

        const cloudWishes = await fetchWishes();
        if (cloudWishes && cloudWishes.length > 0) {
          setWishes(prev => {
            const deletedWishIds = JSON.parse(localStorage.getItem('wedding_deleted_wish_ids') || '[]');
            const existingIds = new Set(prev.map(w => w.id));
            const newWishes = cloudWishes.filter(w => !existingIds.has(w.id) && !deletedWishIds.includes(w.id));
            return newWishes.length > 0 ? [...newWishes, ...prev] : prev;
          });
        }

        // Fetch cloud couple portraits and settings
        const cloudSettings = await fetchWeddingSettings();
        if (cloudSettings) {
          setConfig(prev => {
            const updated = {
              ...prev,
              ...cloudSettings,
              bridePhoto: cloudSettings.bridePhoto || prev.bridePhoto,
              groomPhoto: cloudSettings.groomPhoto || prev.groomPhoto
            };
            try {
              localStorage.setItem('wedding_custom_config', JSON.stringify(updated));
            } catch { }
            return updated;
          });
        }
      } catch (err) {
        console.warn('Error syncing with Supabase cloud:', err);
      }
    }
    loadCloudData();
  }, []);

  const handleUpdateConfig = (newDetails) => {
    setConfig(prev => {
      const updated = { ...prev, ...newDetails };
      try {
        localStorage.setItem('wedding_custom_config', JSON.stringify(updated));
      } catch (e) {
        console.warn('Error storing wedding config locally:', e);
      }
      saveWeddingSettings(updated);
      return updated;
    });
  };

  const handlePhotoUploaded = (newPhoto) => {
    setPhotos(prev => [newPhoto, ...prev.filter(p => p.id !== newPhoto.id)]);
    try {
      const custom = JSON.parse(localStorage.getItem('wedding_custom_photos') || '[]');
      const filtered = custom.filter(p => p.id !== newPhoto.id);
      filtered.unshift(newPhoto);
      localStorage.setItem('wedding_custom_photos', JSON.stringify(filtered));
    } catch (e) {
      console.error('Error saving uploaded photo locally:', e);
    }
  };

  const handleDeletePhoto = (photoId) => {
    setPhotos(prev => prev.filter(p => p.id !== photoId));
    deleteFamilyPhotoFromCloud(photoId);
    try {
      // Remove from custom photos in storage if present
      const custom = JSON.parse(localStorage.getItem('wedding_custom_photos') || '[]');
      const updatedCustom = custom.filter(p => p.id !== photoId);
      localStorage.setItem('wedding_custom_photos', JSON.stringify(updatedCustom));

      // Persist to deleted photo ids list so initial photos stay deleted too
      const deletedIds = JSON.parse(localStorage.getItem('wedding_deleted_photo_ids') || '[]');
      if (!deletedIds.includes(photoId)) {
        deletedIds.push(photoId);
        localStorage.setItem('wedding_deleted_photo_ids', JSON.stringify(deletedIds));
      }
    } catch (e) {
      console.error('Error deleting photo:', e);
    }
  };

  const handleUpdatePhoto = async (photoOrId, maybeData) => {
    const updatedPhoto = typeof photoOrId === 'object' ? photoOrId : { ...(maybeData || {}), id: photoOrId };
    if (!updatedPhoto || !updatedPhoto.id) return;

    setPhotos(prev => prev.map(p => (p.id === updatedPhoto.id ? { ...p, ...updatedPhoto } : p)));
    await updateFamilyPhoto(updatedPhoto);
  };

  const handleAddWish = (newWish) => {
    setWishes([newWish, ...wishes]);
  };

  const handleUpdateWish = async (updatedWish) => {
    setWishes(prev => prev.map(w => (w.id === updatedWish.id ? { ...w, ...updatedWish } : w)));
    await updateWish(updatedWish);
  };

  const handleDeleteWish = async (wishId) => {
    setWishes(prev => prev.filter(w => w.id !== wishId));
    await deleteWishFromCloud(wishId);
  };

  const handleToggleLike = (photoId) => {
    setPhotos(prev =>
      prev.map(p => (p.id === photoId ? { ...p, likes: (p.likes || 0) + 1 } : p))
    );
  };

  const scrollToSection = (id) => {
    setActiveTab(id);
    if (id === 'home') {
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      return;
    }

    // Support both 'gallery' and 'photos' seamlessly
    let el = document.getElementById(id);
    if (!el) {
      if (id === 'gallery') el = document.getElementById('photos');
      else if (id === 'photos') el = document.getElementById('gallery');
    }
    if (el) {
      // Precision positioning: account for fixed top navigation on desktop vs mobile
      const isDesktop = typeof window !== 'undefined' && window.innerWidth >= 768;
      const headerOffset = isDesktop ? 75 : 20;
      const elementPosition = el.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      window.scrollTo({
        top: Math.max(0, offsetPosition),
        behavior: 'smooth'
      });
    }
  };

  // Observe active section when scrolling & update scroll-to-top button
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 350);

      const isDesktop = window.innerWidth >= 768;
      const sections = ['home', 'couple', 'family', 'invitation', 'gallery', 'schedule', 'blessings'];
      const scrollY = window.scrollY + (isDesktop ? 120 : 60);

      for (const sec of sections) {
        let el = document.getElementById(sec);
        if (!el && sec === 'gallery') el = document.getElementById('photos');
        if (el) {
          const top = el.offsetTop - (isDesktop ? 85 : 30);
          const height = el.offsetHeight;
          if (scrollY >= top && scrollY < top + height) {
            setActiveTab(sec);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const pageBody = (
    <div className="relative min-h-screen bg-[#07030e] text-slate-100 flex flex-col pb-24 md:pb-12 selection:bg-rose-500/30 selection:text-gold-200">
      {/* 🌟 GLOBAL LUXURY ROYAL BACKGROUND LAYER ACROSS ALL PAGES 🌟 */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Dynamic Lightfall Stream Background */}
        <Lightfall
          colors={['#fbbf24', '#f59e0b', '#f43f5e', '#fb7185', '#a855f7', '#ec4899']}
          backgroundColor="#07030e"
          speed={0.5}
          streakCount={3}
          streakWidth={1.2}
          streakLength={1.4}
          glow={1.15}
          density={0.4}
          twinkle={0.8}
          zoom={2.2}
          backgroundGlow={0.55}
          opacity={0.85}
          mouseInteraction={true}
          mouseStrength={0.6}
          mouseRadius={0.7}
        />

        {/* Ambient Royal Palace Glow Auras across sections */}
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[850px] h-[650px] bg-gradient-to-b from-amber-500/15 via-rose-600/10 to-transparent blur-[140px] rounded-full pointer-events-none" />
        <div className="absolute top-1/4 -left-40 w-[550px] h-[550px] bg-purple-600/10 blur-[130px] rounded-full pointer-events-none" />
        <div className="absolute top-1/2 -right-40 w-[600px] h-[600px] bg-rose-600/10 blur-[140px] rounded-full pointer-events-none" />
        <div className="absolute top-3/4 -left-32 w-[550px] h-[550px] bg-amber-500/10 blur-[130px] rounded-full pointer-events-none" />
        <div className="absolute -bottom-20 right-1/4 w-[700px] h-[500px] bg-purple-600/10 blur-[150px] rounded-full pointer-events-none" />

        {/* Subtle Palace Radial Vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(7,3,14,0.3)_60%,rgba(7,3,14,0.8)_100%)] pointer-events-none" />

        {/* Ethereal Floating Golden Dust Particles */}
        <GoldDustOverlay count={45} opacity={0.65} />
      </div>

      {/* 🌟 FULL-SCREEN CINEMATIC WEDDING OPENING / INVITATION ENTRANCE 🌟 */}
      {!hasEntered && (
        <WeddingOpeningIntro
          config={config}
          onEnter={(side) => {
            setHasEntered(true);
            document.body.style.overflow = '';
            document.documentElement.style.overflow = '';
            setActiveTab('home');
            if (typeof window !== 'undefined') {
              window.scrollTo({ top: 0, behavior: 'instant' });
            }
            playSong();
          }}
        />
      )}

      {/* Flutter-style Navigation */}
      <FlutterNavBar
        activeTab={activeTab}
        onSelectTab={scrollToSection}
        onOpenUpload={() => setIsUploadOpen(true)}
      />

      {/* Main Sections */}
      <main className="flex-grow">
        {/* 1. Hero Section with 3D Antigravity Particles & 17/09/2026 Countdown */}
        <HeroSection
          config={config}
          onOpenUpload={() => setIsUploadOpen(true)}
          onScrollTo={scrollToSection}
        />

        {/* 2. Couple Spotlight with ElectricBorder */}
        <CoupleSpotlight
          config={config}
          onUpdateConfig={handleUpdateConfig}
          isFamilyUnlocked={isFamilyUnlocked}
          onUnlockFamily={() => setIsFamilyUnlocked(true)}
        />

        {/* 2.5 Family Heritage & Relations Showcase (பெற்றோர் & உற்றார் உறவினர்கள்) */}
        <FamilyHeritage config={config} />

        {/* 3. Official Wedding Invitation & Digital Lagnapatrika Cards */}
        <InvitationCardViewer config={config} />

        {/* 4. Sister Wedding Photo Gallery with PixelTransition */}
        <PhotoGallery
          photos={photos}
          onOpenUpload={() => setIsUploadOpen(true)}
          onToggleLike={handleToggleLike}
          onDeletePhoto={handleDeletePhoto}
          onUpdatePhoto={handleUpdatePhoto}
          isFamilyUnlocked={isFamilyUnlocked}
          setIsFamilyUnlocked={setIsFamilyUnlocked}
        />

        {/* 4. Wedding Schedule Timeline */}
        <EventSchedule config={config} />

        {/* 5. Blessings & Wishes Guestbook */}
        <BlessingsWall
          wishes={wishes}
          onAddWish={handleAddWish}
          onUpdateWish={handleUpdateWish}
          onDeleteWish={handleDeleteWish}
          brideName={config.brideName}
          groomName={config.groomName}
        />

        {/* 6. Developer Support & Contribution (QR Code & Mobile UPI Auto Open) */}
        <DeveloperSupport />
      </main>

      {/* Floating Luxury Wedding Song Player (Local Audio) */}
      <WeddingMusicPlayer />

      {/* Floating Quick Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-20 md:bottom-6 left-4 z-40 p-2.5 sm:p-3 rounded-full bg-royal-900/95 border border-gold-500/50 text-gold-300 shadow-[0_4px_25px_rgba(245,158,11,0.4)] backdrop-blur-xl hover:bg-gold-500 hover:text-royal-950 hover:scale-110 active:scale-95 transition-all group flex items-center gap-1.5"
          title="மேலே செல்ல / Scroll to Top"
          aria-label="Scroll to Top"
        >
          <ArrowUp className="w-4 h-4 sm:w-5 sm:h-5 group-hover:-translate-y-0.5 transition-transform" />
          <span className="hidden sm:inline text-xs font-semibold pr-1">Top</span>
        </button>
      )}

      {/* Upload Modal */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onPhotoUploaded={handlePhotoUploaded}
        isFamilyUnlocked={isFamilyUnlocked}
        onUnlockFamily={() => setIsFamilyUnlocked(true)}
      />

      {/* Royal Footer */}
      <footer className="relative mt-20 border-t border-gold-500/20 bg-royal-900/40 py-10 px-4 text-center">
        <div className="max-w-4xl mx-auto flex flex-col items-center">
          <div className="w-10 h-10 rounded-full bg-gold-500/20 flex items-center justify-center text-gold-400 mb-3">
            <Heart className="w-5 h-5 fill-gold-400" />
          </div>

          <h3 className="text-2xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-gold-200 to-rose-300">
            {config.brideName} & {config.groomName}
          </h3>

          <p className="text-xs text-gold-400/80 font-mono mt-1">
            {config.formattedDate} • {config.hashtag}
          </p>

          <p className="text-xs text-slate-400 max-w-md mt-3 leading-relaxed">
            With boundless love, prayers, and heartfelt gratitude from the entire family. Built with pride for our dearest sister's auspicious wedding celebration.
          </p>

          <div className="mt-6 text-[11px] text-slate-500 flex flex-wrap items-center justify-center gap-3">
            <span>Sister Wedding</span>
            <span>•</span>
            <span className="text-gold-400 font-medium flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-gold-400" /> Developer: Muthuraj C B.E CSE
            </span>
            <button
              onClick={() => {
                const el = document.getElementById('moi-payment') || document.getElementById('developer-support');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-3 py-1 rounded-full bg-amber-500/20 border border-gold-500/40 text-gold-300 hover:bg-gold-500 hover:text-royal-950 transition-all text-[11px] font-semibold flex items-center gap-1 shadow-sm active:scale-95"
            >
              <Heart className="w-3 h-3 fill-gold-400 text-gold-400" />
              <span>மணமகள் மொய் பணம் / Online Moi 🎁</span>
            </button>
            <span>•</span>
            <span>17/09/2026</span>
          </div>
        </div>
      </footer>
    </div>
  );

  return pageBody;
}

export default function App() {
  return (
    <MusicProvider>
      <AppContent />
    </MusicProvider>
  );
}
