import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, Sparkles, Camera, Loader2, Save } from 'lucide-react';
import { uploadToCloudinary } from '../services/cloudinary';
import { playCelebrationChime } from '../utils/audio';
import confetti from 'canvas-confetti';

export default function EditPhotoModal({ isOpen, photo, onClose, onSave }) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('siblings');
  const [caption, setCaption] = useState('');
  const [uploader, setUploader] = useState('');
  const [currentImage, setCurrentImage] = useState('');
  const [isUploadingNewImage, setIsUploadingNewImage] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (photo) {
      setTitle(photo.title || '');
      setCategory(photo.category || 'siblings');
      setCaption(photo.caption || photo.backStory || '');
      setUploader(photo.takenBy || photo.uploader || '');
      setCurrentImage(photo.frontImage || photo.image || photo.image_url || '');
    }
  }, [photo]);

  if (!isOpen || !photo) return null;

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploadingNewImage(true);
    try {
      const cdnUrl = await uploadToCloudinary(file, `${title.replace(/\s+/g, '_') || 'updated_photo'}.jpg`);
      if (cdnUrl) {
        setCurrentImage(cdnUrl);
      }
    } catch (err) {
      console.error('Image replacement error:', err);
    } finally {
      setIsUploadingNewImage(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Please provide a title for the photo.');
      return;
    }

    setIsSaving(true);
    try {
      const updatedData = {
        id: photo.id,
        title: title.trim(),
        category,
        caption: caption.trim(),
        uploader: uploader.trim() || 'Family Member',
        imageUrl: currentImage,
        frontImage: currentImage,
        image: currentImage,
        image_url: currentImage,
        takenBy: uploader.trim() || 'Family Member',
        backStory: caption.trim()
      };

      await onSave(updatedData);
      playCelebrationChime();
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
      onClose();
    } catch (err) {
      console.error('Error saving edited photo details:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-3xl bg-royal-900 border border-gold-500/40 p-5 sm:p-7 shadow-2xl overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200 text-left">
        {/* Decorative blur glow */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-gold-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-rose-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-royal-950/70 text-slate-400 hover:text-white transition-colors"
          title="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-4">
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gold-500/15 border border-gold-500/30 text-gold-300 text-[11px] font-semibold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5 text-gold-400" />
            Edit Photo Details • விவரங்களை திருத்து
          </span>
          <h3 className="text-xl sm:text-2xl font-serif font-bold text-white">
            Update Memory Details
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Modify title, story, ceremony category, or update the photo.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Photo Preview & Replace */}
          <div className="flex items-center gap-4 p-3 rounded-2xl bg-royal-950 border border-slate-800">
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden shrink-0 border border-gold-500/30">
              {isUploadingNewImage ? (
                <div className="w-full h-full bg-royal-900 flex flex-col items-center justify-center">
                  <Loader2 className="w-6 h-6 text-gold-400 animate-spin" />
                </div>
              ) : (
                <img
                  src={currentImage}
                  alt={title}
                  className="w-full h-full object-cover"
                />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <label className="block text-xs uppercase tracking-wider text-slate-400 mb-1 font-medium">
                Photo Picture
              </label>
              <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gold-500/20 hover:bg-gold-500/30 text-gold-300 text-xs font-semibold border border-gold-500/40 cursor-pointer transition-all">
                <Camera className="w-3.5 h-3.5 text-gold-400" />
                <span>Replace Photo</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  disabled={isUploadingNewImage}
                />
              </label>
              <p className="text-[10px] text-slate-500 mt-1">
                Uploads directly to Cloudinary CDN
              </p>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs uppercase tracking-wider text-slate-300 mb-1 font-medium">
              Memory Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-royal-950 border border-slate-700 text-white focus:border-gold-500 focus:outline-none text-xs sm:text-sm"
              placeholder="e.g. Sangeet Squad Celebration"
              required
            />
          </div>

          {/* Category & Uploader */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs uppercase tracking-wider text-slate-300 mb-1 font-medium">
                Ceremony Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-royal-950 border border-slate-700 text-white focus:border-gold-500 focus:outline-none text-xs"
              >
                <option value="couple">Bride & Groom</option>
                <option value="family">Parents & Elders</option>
                <option value="siblings">Sibling Clan</option>
                <option value="haldi">Haldi & Mehendi</option>
                <option value="sangeet">Sangeet & Dance</option>
                <option value="custom">Special Moments</option>
              </select>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-slate-300 mb-1 font-medium">
                Your Name / Uploader
              </label>
              <input
                type="text"
                value={uploader}
                onChange={(e) => setUploader(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-royal-950 border border-slate-700 text-white focus:border-gold-500 focus:outline-none text-xs sm:text-sm"
                placeholder="e.g. Muthuraj C"
              />
            </div>
          </div>

          {/* Caption / Story */}
          <div>
            <label className="block text-xs uppercase tracking-wider text-slate-300 mb-1 font-medium">
              Story or Blessing Note
            </label>
            <textarea
              rows="3"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-royal-950 border border-slate-700 text-white focus:border-gold-500 focus:outline-none text-xs sm:text-sm"
              placeholder="Share the story or memory behind this auspicious picture..."
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs text-slate-300 hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving || isUploadingNewImage}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-gold-500 to-amber-600 text-royal-950 font-bold text-xs sm:text-sm shadow-gold-glow hover:opacity-95 active:scale-95 transition-all disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Updating...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
