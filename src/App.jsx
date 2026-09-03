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
import FxController from './components/FxController';
import SplashCursor from './components/SplashCursor';
import WeddingMusicPlayer from './components/WeddingMusicPlayer';
import { MusicProvider } from './context/MusicContext';
import { WEDDING_CONFIG, INITIAL_PHOTOS, INITIAL_WISHES } from './data/weddingData';
import {
  fetchFamilyPhotos, fetchWishes, saveWeddingSettings, fetchWeddingSettings,
  updateFamilyPhoto, deleteFamilyPhotoFromCloud
} from './services/supabase';
import { Heart, Sparkles } from 'lucide-react';

function AppContent() {
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
        parsed.groomNative?.includes("பிக்காம்பட்டி") ||
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

  // Helper to strictly ensure ONLY genuine uploaded photos appear in Photos section (never invitation cards)
  const isRealPhoto = (p) => {
    if (!p) return false;
    const id = String(p.id || '');
    const img = String(p.frontImage || p.image || p.image_url || '');
    if (id.startsWith('inv_')) return false;
    if (img.includes('/invitation/')) return false;
    if (p.badge === 'Official Card' || p.badge === 'Lagnapatrika' || p.badge === 'Family List' || p.badge === 'Blessing Cover') return false;
    return true;
  };

  // Photos state (initial + custom from local storage, minus deleted photos, excluding invitation cards)
  const [photos, setPhotos] = useState(() => {
    try {
      const deletedIds = JSON.parse(localStorage.getItem('wedding_deleted_photo_ids') || '[]');
      const custom = JSON.parse(localStorage.getItem('wedding_custom_photos') || '[]');
      const combined = [...custom, ...INITIAL_PHOTOS];
      return combined.filter(isRealPhoto).filter(p => !deletedIds.includes(p.id));
    } catch {
      return INITIAL_PHOTOS.filter(isRealPhoto);
    }
  });

  // Wishes state
  const [wishes, setWishes] = useState(() => {
    try {
      const custom = JSON.parse(localStorage.getItem('wedding_custom_wishes') || '[]');
      return [...custom, ...INITIAL_WISHES];
    } catch {
      return INITIAL_WISHES;
    }
  });

  const [activeTab, setActiveTab] = useState('home');
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [activeFx, setActiveFx] = useState('splash'); // 'splash' | 'glow' | 'off'

  // Strict In-Memory Family Passcode Authorization
  // Never persisted: Resets to locked (false) on every page refresh or window close
  const [isFamilyUnlocked, setIsFamilyUnlocked] = useState(false);

  useEffect(() => {
    try {
      sessionStorage.removeItem('wedding_family_auth');
      localStorage.removeItem('wedding_family_auth');

      // Purge any stored invitation cards from local storage
      const cached = JSON.parse(localStorage.getItem('wedding_custom_photos') || '[]');
      const cleaned = cached.filter(isRealPhoto);
      if (cleaned.length !== cached.length) {
        localStorage.setItem('wedding_custom_photos', JSON.stringify(cleaned));
      }
    } catch {}

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
              } catch {}
              return [...newCloud, ...prev];
            }
            return prev.filter(isRealPhoto);
          });
        }

        const cloudWishes = await fetchWishes();
        if (cloudWishes && cloudWishes.length > 0) {
          setWishes(prev => {
            const existingIds = new Set(prev.map(w => w.id));
            const newWishes = cloudWishes.filter(w => !existingIds.has(w.id));
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
            } catch {}
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

  const handleUpdatePhoto = async (updatedPhoto) => {
    setPhotos(prev => prev.map(p => (p.id === updatedPhoto.id ? { ...p, ...updatedPhoto } : p)));
    await updateFamilyPhoto(updatedPhoto);
  };

  const handleAddWish = (newWish) => {
    setWishes([newWish, ...wishes]);
  };

  const handleToggleLike = (photoId) => {
    setPhotos(prev =>
      prev.map(p => (p.id === photoId ? { ...p, likes: (p.likes || 0) + 1 } : p))
    );
  };

  const scrollToSection = (id) => {
    setActiveTab(id);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Observe active section when scrolling
  useEffect(() => {
    const handleScroll = () => {
      const sections = ['home', 'couple', 'family', 'invitation', 'gallery', 'schedule', 'blessings'];
      const scrollY = window.scrollY + 200;

      for (const sec of sections) {
        const el = document.getElementById(sec);
        if (el) {
          const top = el.offsetTop;
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
    <div className="relative min-h-screen bg-royal-950 text-slate-100 flex flex-col pb-24 md:pb-12">
      {/* Visual FX Selector Widget */}
      <FxController activeFx={activeFx} onSelectFx={setActiveFx} />

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
          brideName={config.brideName}
          groomName={config.groomName}
        />
      </main>

      {/* Floating YouTube Wedding Song Player */}
      <WeddingMusicPlayer />

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

          <div className="mt-6 text-[11px] text-slate-500 flex flex-wrap items-center justify-center gap-2">
            <span>Sister Wedding</span>
            <span>•</span>
            <span className="text-gold-400 font-medium flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-gold-400" /> Developer : Muthuraj C B.E CSE
            </span>
            <span>•</span>
            <span>17/09/2026</span>
          </div>
        </div>
      </footer>
    </div>
  );

  return (
    <>
      {/* Interactive WebGL Fluid Simulation if splash is active */}
      {activeFx === 'splash' && (
        <SplashCursor
          COLOR="#f59e0b"
          RAINBOW_MODE={true}
          SPLAT_RADIUS={0.25}
          SPLAT_FORCE={5500}
        />
      )}
      {pageBody}
    </>
  );
}

export default function App() {
  return (
    <MusicProvider>
      <AppContent />
    </MusicProvider>
  );
}
