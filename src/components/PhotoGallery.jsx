import React, { useState } from 'react';
import {
  Heart, Maximize2, Share2, Upload, Sparkles, Filter,
  ChevronLeft, ChevronRight, X, Download, Trash2, Lock, Unlock, ShieldCheck, Edit3
} from 'lucide-react';
import PixelTransition from './PixelTransition';
import FamilyPasscodeModal from './FamilyPasscodeModal';
import EditPhotoModal from './EditPhotoModal';
import { playCelebrationChime } from '../utils/audio';
import { downloadPhoto } from '../services/cloudinary';
import confetti from 'canvas-confetti';

const CATEGORIES = [
  { id: 'all', label: 'All Memories', icon: '🌟' },
  { id: 'couple', label: 'Bride & Groom', icon: '💍' },
  { id: 'family', label: 'Parents & Elders', icon: '👨‍👩‍👧‍👦' },
  { id: 'haldi', label: 'Haldi & Mehendi', icon: '💛' },
  { id: 'sangeet', label: 'Sangeet & Dance', icon: '💃' },
  { id: 'siblings', label: 'Sibling Clan', icon: '📸' },
  { id: 'custom', label: 'Family Uploads', icon: '✨' },
];

export default function PhotoGallery({ photos, onOpenUpload, onToggleLike, onDeletePhoto, onUpdatePhoto, isFamilyUnlocked, setIsFamilyUnlocked }) {
  const [activeCategory, setActiveCategory] = useState('all');
  const [lightboxIndex, setLightboxIndex] = useState(null);

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

  const filteredPhotos = photos.filter(photo => {
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

  // Handle Delete Request
  const handleRequestDelete = (e, photo) => {
    if (e) e.stopPropagation();

    if (isFamilyUnlocked) {
      const confirmDelete = window.confirm(
        `Are you sure you want to remove "${photo.title}" from the family gallery?`
      );
      if (confirmDelete) {
        if (onDeletePhoto) onDeletePhoto(photo.id);
        if (lightboxIndex !== null) setLightboxIndex(null);
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
      if (lightboxIndex !== null) setLightboxIndex(null);
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

  const currentLightboxPhoto = lightboxIndex !== null ? filteredPhotos[lightboxIndex] : null;

  return (
    <section id="gallery" className="relative py-20 px-4 max-w-7xl mx-auto">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-full bg-royal-900/95 border border-gold-500/50 text-gold-300 text-xs font-semibold shadow-gold-glow backdrop-blur-xl animate-in fade-in slide-in-from-bottom-4 duration-200">
          {toastMessage}
        </div>
      )}

      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-gold-500/10 border border-gold-500/30 text-gold-400 text-xs uppercase tracking-widest font-semibold mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          Sister Wedding Gallery
        </div>
        <h2 className="text-3xl sm:text-5xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-gold-100 via-white to-gold-300">
          Treasured Memories
        </h2>
        <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto mt-2 font-sans">
          Sister Wedding Gallery • Uploading and removing memories is exclusively reserved for family members via secret code.
        </p>

        {/* Upload & Family Access Status Bar */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={handleUploadClick}
            className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-amber-500 to-rose-500 text-white font-semibold text-xs sm:text-sm shadow-gold-glow hover:scale-105 active:scale-95 transition-all"
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
      <div className="flex items-center justify-start sm:justify-center gap-2 overflow-x-auto pb-4 mb-10 no-scrollbar">
        {CATEGORIES.map(cat => {
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-300 ${
                isActive
                  ? 'bg-gradient-to-r from-amber-500 to-gold-600 text-royal-950 font-bold shadow-gold-glow scale-105'
                  : 'bg-royal-900/80 text-slate-300 border border-slate-700/60 hover:border-gold-500/40 hover:text-white'
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

      {/* Photo Grid with PixelTransition */}
      {filteredPhotos.length === 0 ? (
        <div className="text-center py-16 rounded-3xl bg-royal-900/50 border border-slate-800 p-8">
          <p className="text-slate-400 text-base mb-4">No photos in this category yet.</p>
          <button
            onClick={handleUploadClick}
            className="px-5 py-2 rounded-full bg-gold-500 text-royal-950 font-bold text-xs"
          >
            Enter family code to upload one!
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
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
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-royal-950 via-royal-950/25 to-transparent pointer-events-none" />

                {/* Top badges */}
                <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                  <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-[11px] font-medium text-gold-300 border border-gold-500/30">
                    {photo.badge || photo.category}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-gold-500/20 text-[10px] text-gold-300 font-mono">
                    Touch / Hover
                  </span>
                </div>

                {/* Bottom title info */}
                <div className="absolute bottom-3 left-3 right-3 pointer-events-none text-left">
                  <h4 className="text-base font-serif font-bold text-white line-clamp-1">
                    {photo.title}
                  </h4>
                  <p className="text-xs text-slate-300">
                    {photo.date || '17/09/2026'} • by {photo.takenBy || 'Family'}
                  </p>
                </div>
              </div>
            );

            // Second Content (Revealed after GSAP pixel dissolve)
            const secondContent = (
              <div className="w-full h-full p-6 flex flex-col justify-between text-left bg-gradient-to-br from-royal-900 via-royal-850 to-royal-950 border border-gold-500/40">
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

                <div className="pt-4 border-t border-slate-700/60 flex items-center justify-between text-xs text-gold-300">
                  <span>Captured by: <strong>{photo.takenBy || 'Family'}</strong></span>
                  <span className="text-[10px] text-slate-400">Click to view full</span>
                </div>
              </div>
            );

            return (
              <div
                key={photo.id}
                className="relative rounded-2xl bg-royal-900/60 border border-slate-800/80 p-2.5 backdrop-blur-md hover:border-gold-500/50 transition-all group flex flex-col"
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
                <div className="flex items-center justify-between px-2 pt-3 text-xs text-slate-300">
                  <button
                    onClick={(e) => handleLike(e, photo.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all ${
                      isLiked
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 font-bold scale-105'
                        : 'hover:bg-slate-800 text-slate-300'
                    }`}
                    aria-label="Like photo"
                  >
                    <Heart className={`w-4 h-4 ${isLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
                    <span>{displayLikes}</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    {/* Remove Photo Button (Family Code Protected) */}
                    <button
                      onClick={(e) => handleRequestDelete(e, photo)}
                      className="p-1.5 rounded-full hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors"
                      title="Remove Photo (Family Code Required)"
                      aria-label="Remove photo"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    {/* Edit Photo Details (Family Code Protected) */}
                    <button
                      onClick={(e) => handleRequestEdit(e, photo)}
                      className="p-1.5 rounded-full hover:bg-gold-500/20 text-slate-400 hover:text-gold-300 transition-colors"
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
                      className="p-1.5 rounded-full hover:bg-gold-500/20 text-slate-400 hover:text-gold-300 transition-colors"
                      title="Download Photo"
                      aria-label="Download photo"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={(e) => handleShare(e, photo)}
                      className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                      title="Share memory"
                      aria-label="Share memory"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => setLightboxIndex(index)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-gold-500/10 hover:bg-gold-500/20 text-gold-300 border border-gold-500/30 transition-all font-medium"
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

      {/* Lightbox Modal */}
      {currentLightboxPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-xl p-4"
          onClick={() => setLightboxIndex(null)}
        >
          <button
            onClick={() => setLightboxIndex(null)}
            className="absolute top-4 right-4 z-50 p-3 rounded-full bg-royal-900/80 text-white hover:bg-rose-600 transition-colors"
            aria-label="Close Lightbox"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Prev button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setLightboxIndex((lightboxIndex - 1 + filteredPhotos.length) % filteredPhotos.length);
            }}
            className="absolute left-4 p-3 rounded-full bg-royal-900/80 text-white hover:bg-gold-500 hover:text-royal-950 transition-colors z-50"
            aria-label="Previous photo"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          {/* Next button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setLightboxIndex((lightboxIndex + 1) % filteredPhotos.length);
            }}
            className="absolute right-4 p-3 rounded-full bg-royal-900/80 text-white hover:bg-gold-500 hover:text-royal-950 transition-colors z-50"
            aria-label="Next photo"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Photo display container */}
          <div
            className="relative max-w-4xl max-h-[85vh] flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={currentLightboxPhoto.frontImage || currentLightboxPhoto.image || currentLightboxPhoto.image_url}
              alt={currentLightboxPhoto.title}
              className="max-h-[68vh] max-w-full rounded-2xl object-contain shadow-2xl border border-gold-500/30"
            />

            {/* Lightbox details */}
            <div className="w-full mt-4 p-4 rounded-2xl bg-royal-900/90 border border-slate-700/80 backdrop-blur-md text-left flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-lg font-serif font-bold text-white">
                  {currentLightboxPhoto.title}
                </h4>
                <p className="text-xs text-slate-300 mt-0.5">
                  {currentLightboxPhoto.backStory || currentLightboxPhoto.caption || 'Auspicious Sister Wedding Memory 17.09.2026'}
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                {/* Edit Photo in Lightbox */}
                <button
                  onClick={(e) => handleRequestEdit(e, currentLightboxPhoto)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gold-500/10 text-gold-300 border border-gold-500/30 hover:bg-gold-500 hover:text-royal-950 text-xs font-semibold transition-all"
                  title="Edit Photo Details (Family Code Required)"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Details</span>
                </button>

                {/* Remove Photo in Lightbox */}
                <button
                  onClick={(e) => handleRequestDelete(e, currentLightboxPhoto)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-500/10 text-rose-300 border border-rose-500/30 hover:bg-rose-500 hover:text-white text-xs font-semibold transition-all"
                  title="Remove Photo (Family Code Required)"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove Photo</span>
                </button>

                <button
                  onClick={() => {
                    downloadPhoto(
                      currentLightboxPhoto.frontImage || currentLightboxPhoto.image || currentLightboxPhoto.image_url,
                      `Sister_Wedding_Photo_${currentLightboxPhoto.id}.jpg`
                    );
                    showToast('புகைப்படம் பதிவிறக்கம் செய்யப்படுகிறது / Downloading Photo...');
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-royal-800 text-gold-300 border border-gold-500/30 hover:bg-gold-500 hover:text-royal-950 text-xs font-semibold transition-all shadow-sm"
                  title="Download Photo"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Photo Details Modal */}
      <EditPhotoModal
        isOpen={Boolean(editingPhoto)}
        photo={editingPhoto}
        onClose={() => setEditingPhoto(null)}
        onSave={async (updatedData) => {
          if (onUpdatePhoto) {
            await onUpdatePhoto(updatedData);
          }
          showToast('புகைப்பட விவரங்கள் புதுப்பிக்கப்பட்டன / Photo details updated!');
        }}
      />

      {/* Family Passcode Verification Modal */}
      <FamilyPasscodeModal
        isOpen={isPasscodeOpen}
        actionType={passcodeAction}
        photoTitle={targetPhotoToDelete?.title}
        onClose={() => setIsPasscodeOpen(false)}
        onSuccess={handlePasscodeSuccess}
      />
    </section>
  );
}
