import React, { useState, useMemo, useEffect } from 'react';
import {
  Heart, Maximize2, Share2, Upload, Sparkles, Filter,
  ChevronLeft, ChevronRight, X, Download, Trash2, Lock, Unlock, ShieldCheck, Edit3, ImagePlus
} from 'lucide-react';
import PixelTransition from './PixelTransition';
import FamilyPasscodeModal from './FamilyPasscodeModal';
import EditPhotoModal from './EditPhotoModal';
import { playCelebrationChime } from '../utils/audio';
import { downloadPhoto } from '../services/cloudinary';
import confetti from 'canvas-confetti';

const CATEGORIES = [
  { id: 'all', label: 'All Moments', icon: '🌟' },
  { id: 'siblings', label: 'Sibling Clan', icon: '📸' },
  { id: 'couple', label: 'Bride & Groom', icon: '💍' },
  { id: 'family', label: 'Parents & Relatives', icon: '👨‍👩‍👧‍👦' },
  { id: 'haldi', label: 'Haldi & Rituals', icon: '💛' },
  { id: 'sangeet', label: 'Celebration & Dance', icon: '💃' },
  { id: 'custom', label: 'Cloud Uploads', icon: '✨' },
];

export default function PhotoGallery({ photos, onOpenUpload, onToggleLike, onDeletePhoto, onUpdatePhoto, isFamilyUnlocked, setIsFamilyUnlocked }) {
  const [activeCategory, setActiveCategory] = useState('all');
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [selectedPhotoId, setSelectedPhotoId] = useState(null);
  const [touchStartX, setTouchStartX] = useState(0);

  // Passcode modal state
  const [isPasscodeOpen, setIsPasscodeOpen] = useState(false);
  const [passcodeAction, setPasscodeAction] = useState('upload'); // 'upload' | 'delete' | 'edit'
  const [targetPhotoToDelete, setTargetPhotoToDelete] = useState(null);
  const [editingPhoto, setEditingPhoto] = useState(null);

  // Notification message
  const [toastMessage, setToastMessage] = useState('');

  const [likedPhotos, setLikedPhotos] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('wedding_photo_likes') || '{}');
    } catch {
      return {};
    }
  });

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  // Strictly filter out any invitation cards or old mock photos
  const filteredPhotos = photos.filter(photo => {
    if (!photo) return false;
    const id = String(photo.id || '');
    const img = String(photo.frontImage || photo.image || photo.image_url || '');
    if (id.startsWith('inv_')) return false;
    if (img.includes('/invitation/')) return false;
    if (img.includes('unsplash.com')) return false;
    if (['p1', 'p2', 'p3', 'p4', 'p5', 'p6'].includes(id)) return false;
    if (photo.badge === 'Official Card' || photo.badge === 'Lagnapatrika' || photo.badge === 'Family List' || photo.badge === 'Blessing Cover') return false;

    if (activeCategory === 'all') return true;
    if (activeCategory === 'custom') return photo.isCustom;
    return photo.category === activeCategory;
  });

  // Handle Upload Click (Protected by Family Passcode)
  const handleUploadClick = () => {
    if (isFamilyUnlocked) {
      onOpenUpload();
    } else {
      setPasscodeAction('upload');
      setTargetPhotoToDelete(null);
      setIsPasscodeOpen(true);
    }
  };

  // Lightbox helpers
  const openLightbox = (photo, index) => {
    if (photo) {
      setSelectedPhotoId(photo.id);
      setLightboxIndex(index !== undefined ? index : 0);
    }
  };

  const closeLightbox = () => {
    setSelectedPhotoId(null);
    setLightboxIndex(null);
  };

  // Handle Delete Request
  const handleRequestDelete = (e, photo) => {
    if (e) e.stopPropagation();

    if (isFamilyUnlocked) {
      const confirmDelete = window.confirm(
        `Are you sure you want to remove "${photo.title}" from the family gallery?`
      );
      if (confirmDelete) {
        if (onDeletePhoto) onDeletePhoto(photo.id);
        closeLightbox();
        showToast('புகைப்படம் நீக்கப்பட்டது / Photo successfully removed');
      }
    } else {
      setPasscodeAction('delete');
      setTargetPhotoToDelete(photo);
      setIsPasscodeOpen(true);
    }
  };

  // Handle Edit Photo Request
  const handleRequestEdit = (e, photo) => {
    if (e) e.stopPropagation();

    if (isFamilyUnlocked) {
      setEditingPhoto(photo);
    } else {
      setPasscodeAction('edit');
      setTargetPhotoToDelete(photo);
      setIsPasscodeOpen(true);
    }
  };

  // Passcode Success Callback
  const handlePasscodeSuccess = () => {
    setIsFamilyUnlocked(true);

    if (passcodeAction === 'upload') {
      showToast('குடும்பத்தினர் சரிபார்ப்பு முடிந்தது! / Family Access Verified');
      setTimeout(() => {
        onOpenUpload();
      }, 400);
    } else if (passcodeAction === 'delete' && targetPhotoToDelete) {
      if (onDeletePhoto) onDeletePhoto(targetPhotoToDelete.id);
      closeLightbox();
      showToast('புகைப்படம் நீக்கப்பட்டது / Photo successfully removed');
      setTargetPhotoToDelete(null);
    } else if (passcodeAction === 'edit' && targetPhotoToDelete) {
      setEditingPhoto(targetPhotoToDelete);
      setTargetPhotoToDelete(null);
    }
  };

  const handleLike = (e, photoId) => {
    e.stopPropagation();
    playCelebrationChime();
    confetti({ particleCount: 35, spread: 50, origin: { y: 0.7 } });

    const newLikes = { ...likedPhotos, [photoId]: !likedPhotos[photoId] };
    setLikedPhotos(newLikes);
    localStorage.setItem('wedding_photo_likes', JSON.stringify(newLikes));
    onToggleLike(photoId);
  };

  const handleShare = (e, photo) => {
    e.stopPropagation();
    if (navigator.share) {
      navigator.share({
        title: photo.title,
        text: `Check out this wedding memory from my sister's marriage on 17/09/2026: ${photo.title}`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      showToast('Link copied to clipboard!');
    }
  };

  // Resolve active lightbox photo (prioritize ID match for instant reactive updates)
  const currentLightboxPhoto = useMemo(() => {
    if (selectedPhotoId) {
      const found = photos.find(p => p.id === selectedPhotoId);
      if (found) return found;
    }
    if (lightboxIndex !== null && filteredPhotos[lightboxIndex]) {
      return filteredPhotos[lightboxIndex];
    }
    return null;
  }, [photos, selectedPhotoId, lightboxIndex, filteredPhotos]);

  const currentPhotoIndex = useMemo(() => {
    if (!currentLightboxPhoto || !filteredPhotos.length) return 0;
    const idx = filteredPhotos.findIndex(p => p.id === currentLightboxPhoto.id);
    return idx >= 0 ? idx : 0;
  }, [currentLightboxPhoto, filteredPhotos]);

  const handlePrevPhoto = (e) => {
    if (e) e.stopPropagation();
    if (!filteredPhotos.length) return;
    const currentIdx = currentLightboxPhoto
      ? filteredPhotos.findIndex(p => p.id === currentLightboxPhoto.id)
      : 0;
    const prevIdx = (currentIdx - 1 + filteredPhotos.length) % filteredPhotos.length;
    const prevPhoto = filteredPhotos[prevIdx];
    if (prevPhoto) {
      setSelectedPhotoId(prevPhoto.id);
      setLightboxIndex(prevIdx);
    }
  };

  const handleNextPhoto = (e) => {
    if (e) e.stopPropagation();
    if (!filteredPhotos.length) return;
    const currentIdx = currentLightboxPhoto
      ? filteredPhotos.findIndex(p => p.id === currentLightboxPhoto.id)
      : 0;
    const nextIdx = (currentIdx + 1) % filteredPhotos.length;
    const nextPhoto = filteredPhotos[nextIdx];
    if (nextPhoto) {
      setSelectedPhotoId(nextPhoto.id);
      setLightboxIndex(nextIdx);
    }
  };

  const handleTouchStart = (e) => {
    if (e.touches && e.touches[0]) {
      setTouchStartX(e.touches[0].clientX);
    }
  };

  const handleTouchEnd = (e) => {
    if (e.changedTouches && e.changedTouches[0]) {
      const touchEndX = e.changedTouches[0].clientX;
      const diffX = touchStartX - touchEndX;
      if (diffX > 45) {
        handleNextPhoto();
      } else if (diffX < -45) {
        handlePrevPhoto();
      }
    }
  };

  // Keyboard navigation & body scroll lock while lightbox is open
  useEffect(() => {
    if (!currentLightboxPhoto) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        closeLightbox();
      } else if (e.key === 'ArrowLeft') {
        handlePrevPhoto();
      } else if (e.key === 'ArrowRight') {
        handleNextPhoto();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [currentLightboxPhoto, filteredPhotos]);

  return (
    <section id="gallery" data-section="photos" className="relative py-20 px-4 max-w-7xl mx-auto">
      {/* Fallback anchor for both #photos and #gallery deep links */}
      <div id="photos" className="absolute -top-24 pointer-events-none" aria-hidden="true" />
      {/* Radiant ambient glow behind the photos section */}
      <div className="absolute top-12 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-r from-amber-500/15 via-rose-500/10 to-purple-600/10 blur-[130px] rounded-full pointer-events-none" />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-full bg-royal-900/95 border border-gold-500/50 text-gold-300 text-xs font-semibold shadow-gold-glow backdrop-blur-xl animate-in fade-in slide-in-from-bottom-4 duration-200">
          {toastMessage}
        </div>
      )}

      {/* Header */}
      <div className="text-center mb-10 relative z-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-royal-900/90 border border-gold-500/40 text-gold-300 text-xs uppercase tracking-widest font-semibold mb-3 shadow-[0_0_20px_rgba(245,158,11,0.2)] backdrop-blur-md">
          <Sparkles className="w-3.5 h-3.5 text-gold-400 animate-spin" style={{ animationDuration: '6s' }} />
          <span>குடும்ப பொக்கிஷ நினைவுகள் • SISTER WEDDING GALLERY</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-serif font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gold-100 via-amber-200 to-rose-200 tracking-tight">
          Treasured Memories
        </h2>
        <p className="text-slate-300/90 text-sm sm:text-base max-w-2xl mx-auto mt-2.5 font-sans leading-relaxed">
          Sister Wedding Gallery • Capturing candid smiles, family blessings, and unforgettable moments. Uploading & deleting is protected by family passcode.
        </p>

        {/* Upload & Family Access Status Bar */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={handleUploadClick}
            className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-amber-500 via-gold-400 to-rose-500 text-royal-950 font-bold text-xs sm:text-sm shadow-gold-glow hover:scale-105 active:scale-95 transition-all"
          >
            <Upload className="w-4 h-4" />
            <span>Upload Photo (Family Code Required)</span>
          </button>

          {/* Family Mode Badge / Lock Button */}
          <button
            onClick={() => {
              if (isFamilyUnlocked) {
                setIsFamilyUnlocked(false);
                showToast('குடும்ப அனுமதி லாக் செய்யப்பட்டது / Family Mode Locked');
              } else {
                setPasscodeAction('upload');
                setIsPasscodeOpen(true);
              }
            }}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium border transition-all ${
              isFamilyUnlocked
                ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-300 hover:bg-emerald-500/25'
                : 'bg-royal-900/80 border-slate-700/80 text-slate-300 hover:border-gold-500/50 hover:text-white'
            }`}
            title={isFamilyUnlocked ? 'Click to lock family mode' : 'Click to enter family secret code'}
          >
            {isFamilyUnlocked ? (
              <>
                <Unlock className="w-3.5 h-3.5 text-emerald-400" />
                <span>Family Mode Unlocked</span>
              </>
            ) : (
              <>
                <Lock className="w-3.5 h-3.5 text-gold-400" />
                <span>Family Passcode Protected</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Flutter-style Curved Category Filter Pills */}
      <div className="flex items-center justify-start sm:justify-center gap-2 overflow-x-auto pb-4 mb-10 no-scrollbar relative z-10">
        <div className="bg-royal-950/60 p-1.5 rounded-full border border-gold-500/20 backdrop-blur-md inline-flex gap-1.5">
          {CATEGORIES.map(cat => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-1.5 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-300 ${
                  isActive
                    ? 'bg-gradient-to-r from-amber-500 via-gold-400 to-amber-600 text-royal-950 font-bold shadow-[0_0_18px_rgba(245,158,11,0.4)] scale-105'
                    : 'bg-royal-900/50 text-slate-300 border border-slate-800/80 hover:border-gold-500/40 hover:text-gold-200'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
                {cat.id === 'custom' && (
                  <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Photo Grid with PixelTransition */}
      {filteredPhotos.length === 0 ? (
        <div className="text-center py-16 rounded-3xl bg-royal-900/60 border border-gold-500/30 p-8 max-w-xl mx-auto backdrop-blur-xl shadow-xl">
          <div className="w-16 h-16 rounded-full bg-gold-500/10 border border-gold-500/40 flex items-center justify-center mx-auto mb-4">
            <ImagePlus className="w-8 h-8 text-gold-400" />
          </div>
          <h3 className="text-lg font-serif font-bold text-white mb-1">
            புகைப்படங்கள் சேர்க்கப்படவில்லை / No Photos in this Category
          </h3>
          <p className="text-slate-400 text-xs sm:text-sm mb-5 font-sans leading-relaxed">
            Be the first family member to upload a precious memory from Sister Manju's wedding!
          </p>
          <button
            onClick={handleUploadClick}
            className="px-6 py-2.5 rounded-full bg-gradient-to-r from-amber-500 to-gold-600 text-royal-950 font-bold text-xs shadow-gold-glow hover:scale-105 transition-all inline-flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            <span>Upload Photo with Family Passcode</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 relative z-10">
          {filteredPhotos.map((photo, index) => {
            const isLiked = Boolean(likedPhotos[photo.id]);
            const displayLikes = (photo.likes || 0) + (isLiked ? 1 : 0);

            // Front Content for PixelTransition
            const firstContent = (
              <div className="relative w-full h-full group cursor-pointer overflow-hidden">
                <img
                  src={photo.frontImage || photo.image || photo.image_url}
                  alt={photo.title}
                  loading="lazy"
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-royal-950 via-royal-950/20 to-transparent pointer-events-none" />

                {/* Top badges */}
                <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                  <span className="px-3 py-1 rounded-full bg-royal-950/85 backdrop-blur-md text-[11px] font-medium text-gold-300 border border-gold-500/40 shadow-sm capitalize">
                    {photo.badge || photo.category}
                  </span>
                  <div className="flex items-center gap-1.5 pointer-events-auto">
                    <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-gold-500/20 text-[10px] text-gold-300 font-mono border border-gold-500/30">
                      Flip
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        openLightbox(photo, index);
                      }}
                      className="p-1.5 rounded-full bg-royal-950/90 text-gold-300 hover:bg-gold-500 hover:text-royal-950 border border-gold-500/40 shadow-md transition-all hover:scale-110 active:scale-95"
                      title="Open Fullscreen Lightbox"
                      aria-label="Open Fullscreen Lightbox"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Bottom title info overlay with rich dark gradient scrim */}
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-royal-950 via-royal-950/85 to-transparent p-4 text-left pointer-events-none">
                  <h4 className="text-base sm:text-lg font-serif font-bold text-white line-clamp-1 group-hover:text-gold-300 transition-colors">
                    {photo.title}
                  </h4>
                  <p className="text-xs text-gold-200/80 font-sans mt-0.5">
                    {photo.date || '17/09/2026'} • by <strong className="text-slate-200">{photo.takenBy || 'Family'}</strong>
                  </p>
                </div>
              </div>
            );

            // Second Content (Revealed after GSAP pixel dissolve)
            const secondContent = (
              <div className="w-full h-full p-6 flex flex-col justify-between text-left bg-gradient-to-br from-royal-950 via-royal-900 to-royal-950 border border-gold-500/40">
                <div>
                  <div className="flex items-center justify-between text-gold-400 text-xs font-mono uppercase tracking-wider mb-2">
                    <span>✨ Secret Family Story</span>
                    <span>17.09.2026</span>
                  </div>
                  <h5 className="text-lg font-serif font-bold text-white mb-2">
                    {photo.backTitle || photo.title}
                  </h5>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans italic">
                    "{photo.backStory || photo.caption || 'A memorable family moment that will stay in our hearts forever.'}"
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-gold-300">
                  <span>Captured by: <strong className="text-white">{photo.takenBy || 'Family'}</strong></span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      openLightbox(photo, index);
                    }}
                    className="px-2.5 py-1 rounded-full bg-gold-500/25 hover:bg-gold-500 hover:text-royal-950 text-gold-300 border border-gold-500/50 text-[10px] font-mono transition-all pointer-events-auto flex items-center gap-1 active:scale-95"
                  >
                    <Maximize2 className="w-3 h-3" />
                    <span>Open Full View</span>
                  </button>
                </div>
              </div>
            );

            return (
              <div
                key={photo.id}
                className="relative rounded-2xl bg-royal-900/70 border border-gold-500/25 p-3 backdrop-blur-xl hover:border-gold-400/80 hover:shadow-[0_12px_40px_rgba(245,158,11,0.22)] transition-all duration-500 group flex flex-col"
              >
                {/* Pixel Transition Interactive Card */}
                <div className="rounded-xl overflow-hidden shadow-lg aspect-square w-full relative">
                  <PixelTransition
                    firstContent={firstContent}
                    secondContent={secondContent}
                    gridSize={8}
                    pixelColor="#f59e0b"
                    animationStepDuration={0.35}
                    aspectRatio="100%"
                    className="w-full h-full"
                  />
                </div>

                {/* Interactive Card Footer Controls */}
                <div className="flex items-center justify-between px-1 pt-3 text-xs text-slate-300">
                  <button
                    onClick={(e) => handleLike(e, photo.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all ${
                      isLiked
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 font-bold scale-105'
                        : 'bg-royal-950/80 border border-slate-800 text-slate-300 hover:text-white hover:border-gold-500/40'
                    }`}
                    aria-label="Like photo"
                  >
                    <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
                    <span>{displayLikes}</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    {/* Remove Photo Button (Family Code Protected) */}
                    <button
                      onClick={(e) => handleRequestDelete(e, photo)}
                      className="p-1.5 rounded-full bg-royal-950/80 border border-slate-800/80 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors"
                      title="Remove Photo (Family Code Required)"
                      aria-label="Remove photo"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    {/* Edit Photo Details (Family Code Protected) */}
                    <button
                      onClick={(e) => handleRequestEdit(e, photo)}
                      className="p-1.5 rounded-full bg-royal-950/80 border border-slate-800/80 hover:bg-amber-500/20 text-slate-400 hover:text-amber-300 transition-colors"
                      title="Edit Photo Details (Family Code Required)"
                      aria-label="Edit photo details"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>

                    {/* Download Photo Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        downloadPhoto(photo.frontImage || photo.image || photo.image_url, `${photo.title}.jpg`);
                        showToast('புகைப்படம் பதிவிறக்கம் செய்யப்படுகிறது / Downloading Photo...');
                      }}
                      className="p-1.5 rounded-full bg-royal-950/80 border border-slate-800/80 hover:bg-sky-500/20 text-slate-400 hover:text-sky-300 transition-colors"
                      title="Download Photo"
                      aria-label="Download photo"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={(e) => handleShare(e, photo)}
                      className="p-1.5 rounded-full bg-royal-950/80 border border-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                      title="Share memory"
                      aria-label="Share memory"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => openLightbox(photo, index)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-gold-500/15 hover:bg-gold-500 hover:text-royal-950 text-gold-300 border border-gold-500/40 transition-all font-medium text-[11px]"
                      title="Expand to Fullscreen Lightbox"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                      <span>Full View</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 🌟 LUXURY FULLSCREEN LIGHTBOX MODAL 🌟 */}
      {currentLightboxPhoto && (
        <div
          className="fixed inset-0 z-[100] flex flex-col justify-between bg-black/95 backdrop-blur-2xl select-none overflow-y-auto no-scrollbar p-3 sm:p-6"
          onClick={closeLightbox}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Top Bar: Counter & Close Button */}
          <div
            className="w-full flex items-center justify-between max-w-4xl mx-auto py-2 z-10 shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2">
              <span className="px-3.5 py-1.5 rounded-full bg-royal-900/90 border border-gold-500/40 text-gold-300 text-xs sm:text-sm font-serif font-semibold shadow-md">
                📸 {currentPhotoIndex + 1} / {filteredPhotos.length}
              </span>
              <span className="hidden sm:inline-flex px-3 py-1 rounded-full bg-gold-500/15 border border-gold-500/30 text-gold-400 text-[11px] font-mono uppercase tracking-wider">
                {currentLightboxPhoto.category || 'Wedding Memory'}
              </span>
            </div>

            <button
              onClick={closeLightbox}
              className="p-2.5 rounded-full bg-royal-900/90 border border-gold-500/40 text-gold-300 hover:bg-rose-600 hover:text-white hover:border-rose-500 transition-all shadow-lg active:scale-95 flex items-center gap-1"
              aria-label="Close Lightbox"
              title="மூடு / Close"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>

          {/* Main Visual Display (Center with Side Nav Chevrons) */}
          <div
            className="relative w-full max-w-4xl mx-auto my-auto flex items-center justify-center py-2 px-1 sm:px-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Prev Button */}
            <button
              onClick={handlePrevPhoto}
              className="absolute left-1 sm:left-2 z-20 p-2.5 sm:p-3.5 rounded-full bg-royal-900/90 border border-gold-500/50 text-gold-300 shadow-[0_4px_20px_rgba(0,0,0,0.8)] transition-all active:bg-gold-500 active:text-royal-950 hover:border-gold-300 active:scale-90"
              aria-label="Previous photo"
              title="முந்தைய புகைப்படம் / Previous"
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            {/* Photo */}
            <div className="relative flex items-center justify-center max-w-full">
              <img
                src={currentLightboxPhoto.frontImage || currentLightboxPhoto.image || currentLightboxPhoto.image_url}
                alt={currentLightboxPhoto.title}
                className="max-h-[48vh] sm:max-h-[62vh] max-w-full w-auto object-contain rounded-2xl shadow-[0_12px_45px_rgba(0,0,0,0.9),0_0_25px_rgba(245,158,11,0.25)] border border-gold-500/35 select-none"
              />
            </div>

            {/* Next Button */}
            <button
              onClick={handleNextPhoto}
              className="absolute right-1 sm:right-2 z-20 p-2.5 sm:p-3.5 rounded-full bg-royal-900/90 border border-gold-500/50 text-gold-300 shadow-[0_4px_20px_rgba(0,0,0,0.8)] transition-all active:bg-gold-500 active:text-royal-950 hover:border-gold-300 active:scale-90"
              aria-label="Next photo"
              title="அடுத்த புகைப்படம் / Next"
            >
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>

          {/* Bottom Details & Action Options Bar */}
          <div
            className="w-full max-w-xl mx-auto text-center shrink-0 z-10 pt-2 pb-3"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Title & Subtitle */}
            <h3 className="text-lg sm:text-2xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-gold-100 via-amber-200 to-rose-200">
              {currentLightboxPhoto.title}
            </h3>
            <p className="text-xs sm:text-sm text-gold-200/80 mt-0.5">
              {currentLightboxPhoto.date || '17/09/2026'} • 📸 Captured by <strong className="text-white">{currentLightboxPhoto.takenBy || currentLightboxPhoto.uploader || 'Family'}</strong>
            </p>

            {/* Backstory Quote */}
            {(currentLightboxPhoto.backStory || currentLightboxPhoto.caption) && (
              <p className="text-xs sm:text-sm text-slate-300 italic font-sans mt-2 max-w-md mx-auto line-clamp-2 px-3 py-1.5 rounded-xl bg-royal-950/60 border border-gold-500/20">
                "{currentLightboxPhoto.backStory || currentLightboxPhoto.caption}"
              </p>
            )}

            {/* Action Options Grid / Dock */}
            <div className="w-full max-w-md mx-auto mt-3 px-2">
              <div className="grid grid-cols-2 sm:flex sm:flex-wrap sm:justify-center items-center gap-2 sm:gap-3">
                {/* 1. Likes Button */}
                <button
                  onClick={(e) => handleLike(e, currentLightboxPhoto.id)}
                  className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs sm:text-sm font-semibold transition-all active:scale-95 ${
                    likedPhotos[currentLightboxPhoto.id]
                      ? 'bg-rose-500/90 text-white border-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.4)]'
                      : 'bg-royal-900/90 border-gold-500/40 text-gold-300 hover:bg-gold-500 hover:text-royal-950'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${likedPhotos[currentLightboxPhoto.id] ? 'fill-current text-white' : 'text-gold-400'}`} />
                  <span>{currentLightboxPhoto.likes || 0} Likes</span>
                </button>

                {/* 2. Edit Details Button */}
                <button
                  onClick={() => handleRequestEdit(null, currentLightboxPhoto)}
                  className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-royal-900/90 border border-gold-500/40 text-gold-300 hover:bg-gold-500 hover:text-royal-950 transition-all active:scale-95 text-xs sm:text-sm font-semibold shadow-md"
                >
                  <Edit3 className="w-4 h-4 text-amber-400" />
                  <span>Edit Details</span>
                </button>

                {/* 3. Download Button */}
                <button
                  onClick={() => {
                    downloadPhoto(
                      currentLightboxPhoto.frontImage || currentLightboxPhoto.image || currentLightboxPhoto.image_url,
                      `${currentLightboxPhoto.title || 'wedding-photo'}.jpg`
                    );
                    showToast('பதிவிறக்கம் செய்யப்படுகிறது / Downloading Photo...');
                  }}
                  className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-royal-900/90 border border-gold-500/40 text-gold-300 hover:bg-gold-500 hover:text-royal-950 transition-all active:scale-95 text-xs sm:text-sm font-semibold shadow-md"
                >
                  <Download className="w-4 h-4 text-amber-400" />
                  <span>Download</span>
                </button>

                {/* 4. Delete Button */}
                <button
                  onClick={() => handleRequestDelete(null, currentLightboxPhoto)}
                  className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-rose-950/85 border border-rose-500/50 text-rose-300 hover:bg-rose-600 hover:text-white transition-all active:scale-95 text-xs sm:text-sm font-semibold shadow-md"
                >
                  <Trash2 className="w-4 h-4 text-rose-400" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Passcode Authorization Modal */}
      <FamilyPasscodeModal
        isOpen={isPasscodeOpen}
        onClose={() => setIsPasscodeOpen(false)}
        onSuccess={handlePasscodeSuccess}
        actionName={
          passcodeAction === 'delete'
            ? 'Delete Photo'
            : passcodeAction === 'edit'
            ? 'Edit Photo Details'
            : 'Upload Photo'
        }
      />

      {/* Edit Photo Details Modal */}
      {editingPhoto && (
        <EditPhotoModal
          photo={editingPhoto}
          isOpen={Boolean(editingPhoto)}
          onClose={() => setEditingPhoto(null)}
          onSave={async (updatedData) => {
            if (onUpdatePhoto) {
              await onUpdatePhoto(updatedData);
            }
            if (selectedPhotoId === updatedData.id) {
              setSelectedPhotoId(updatedData.id);
            }
            setEditingPhoto(null);
            showToast('புகைப்பட விபரம் மாற்றப்பட்டது! / Photo Details Updated');
          }}
          onUpdate={async (updatedData) => {
            if (onUpdatePhoto) {
              await onUpdatePhoto(updatedData);
            }
            if (selectedPhotoId === updatedData.id) {
              setSelectedPhotoId(updatedData.id);
            }
            setEditingPhoto(null);
            showToast('புகைப்பட விபரம் மாற்றப்பட்டது! / Photo Details Updated');
          }}
        />
      )}
    </section>
  );
}
