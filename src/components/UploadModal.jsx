import React, { useState } from 'react';
import { X, Upload, Image as ImageIcon, Sparkles, CheckCircle2, Lock, KeyRound, Cloud } from 'lucide-react';
import { saveFamilyPhoto, isSupabaseConfigured } from '../services/supabase';
import { playCelebrationChime } from '../utils/audio';
import confetti from 'canvas-confetti';

const ACCEPTED_CODES = ['1709', '17092026', '2026', 'MANJU', 'MUNIRAJ', '17/09/2026'];

export default function UploadModal({ isOpen, onClose, onPhotoUploaded, isFamilyUnlocked, onUnlockFamily }) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('siblings');
  const [caption, setCaption] = useState('');
  const [uploader, setUploader] = useState('');
  const [passcode, setPasscode] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [passcodeError, setPasscodeError] = useState('');

  if (!isOpen) return null;

  const isAlreadyAuthed = Boolean(isFamilyUnlocked);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!imagePreview || !title || !uploader) {
      alert('Please fill out the photo title, your name, and choose an image.');
      return;
    }

    if (!isAlreadyAuthed) {
      const clean = passcode.trim().toUpperCase();
      if (!ACCEPTED_CODES.includes(clean)) {
        setPasscodeError('தவறான ரகசிய குறியீடு! / Invalid Family Passcode.');
        return;
      }
      if (onUnlockFamily) onUnlockFamily();
    }

    setIsSubmitting(true);
    try {
      const result = await saveFamilyPhoto({
        title,
        category,
        caption,
        uploader,
        imageBase64: imagePreview,
        imageFile
      });

      if (result.success) {
        playCelebrationChime();
        confetti({ particleCount: 70, spread: 80, origin: { y: 0.5 } });
        setIsSuccess(true);
        setTimeout(() => {
          onPhotoUploaded(result.data);
          onClose();
          setIsSuccess(false);
          setTitle('');
          setCaption('');
          setUploader('');
          setImagePreview(null);
          setImageFile(null);
          setPasscode('');
          setPasscodeError('');
        }, 1200);
      }
    } catch (err) {
      console.error(err);
      alert('Upload failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg rounded-3xl bg-royal-900 border border-gold-500/40 p-6 sm:p-8 shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow backdrop */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-gold-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-rose-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-royal-950/60 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {isSuccess ? (
          <div className="py-12 text-center flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-10 h-10 animate-bounce" />
            </div>
            <h3 className="text-2xl font-serif font-bold text-white mb-2">
              புகைப்படம் பதிவேற்றப்பட்டது!
            </h3>
            <p className="text-sm text-gold-200">
              Memory safely preserved in Sister Wedding Gallery & Cloud Storage.
            </p>
          </div>
        ) : (
          <>
            <div className="text-left mb-6">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold-500/10 border border-gold-500/30 text-gold-400 text-xs font-semibold uppercase tracking-wider mb-2">
                <Cloud className="w-3.5 h-3.5" />
                Cloudinary & Supabase Cloud Storage
              </div>
              <h3 className="text-2xl font-serif font-bold text-white">
                Add Precious Memory
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Share beautiful wedding pictures with family and loved ones.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-left">
              {/* Image Picker */}
              <div>
                <label className="block text-xs uppercase tracking-wider text-slate-300 mb-1 font-medium">
                  Select Photo (Camera or Gallery)
                </label>
                {imagePreview ? (
                  <div className="relative rounded-2xl overflow-hidden border border-gold-500/40 max-h-56 group">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-48 object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImagePreview(null);
                        setImageFile(null);
                      }}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 text-rose-400 hover:bg-rose-600 hover:text-white transition-colors text-xs"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-slate-700 hover:border-gold-500/60 rounded-2xl cursor-pointer bg-royal-950/60 hover:bg-royal-950 transition-all">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <ImageIcon className="w-8 h-8 text-gold-400 mb-2 animate-pulse" />
                      <p className="text-xs text-slate-300">
                        <span className="font-semibold text-gold-300">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-[10px] text-slate-500">High-res PNG, JPG or WebP (Cloudinary Cloud CDN)</p>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs uppercase tracking-wider text-slate-300 mb-1 font-medium">
                  Memory Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Sister Manju & Muniraj Reception"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-royal-950 border border-slate-700 text-white focus:border-gold-500 focus:outline-none text-xs sm:text-sm"
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
                    Your Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Muthuraj / Mohan Sakthi"
                    value={uploader}
                    onChange={(e) => setUploader(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-royal-950 border border-slate-700 text-white focus:border-gold-500 focus:outline-none text-xs sm:text-sm"
                    required
                  />
                </div>
              </div>

              {/* Caption */}
              <div>
                <label className="block text-xs uppercase tracking-wider text-slate-300 mb-1 font-medium">
                  Story or Blessing Note
                </label>
                <textarea
                  rows="2"
                  placeholder="Share the beautiful story behind this photo..."
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl bg-royal-950 border border-slate-700 text-white focus:border-gold-500 focus:outline-none text-xs sm:text-sm"
                />
              </div>

              {/* Family Secret Passcode (If not yet verified) */}
              {!isAlreadyAuthed && (
                <div className="p-3.5 rounded-2xl bg-royal-950/90 border border-gold-500/30">
                  <div className="flex items-center gap-2 mb-2 text-gold-400">
                    <KeyRound className="w-4 h-4" />
                    <span className="text-xs font-semibold">குடும்ப ரகசிய குறியீடு / Family Secret Passcode</span>
                  </div>
                  <input
                    type="password"
                    placeholder="Enter Secret Passcode"
                    value={passcode}
                    onChange={(e) => {
                      setPasscode(e.target.value);
                      setPasscodeError('');
                    }}
                    className="w-full px-4 py-2 rounded-xl bg-royal-900 border border-slate-700 text-white focus:border-gold-500 focus:outline-none text-xs"
                    required
                  />
                  {passcodeError && (
                    <p className="text-[11px] text-rose-400 mt-1">{passcodeError}</p>
                  )}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-gold-500 to-amber-600 text-royal-950 font-bold text-sm tracking-wide shadow-gold-glow hover:opacity-95 active:scale-98 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-royal-950 border-t-transparent rounded-full animate-spin" />
                    <span>Uploading to Cloudinary & Supabase...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    <span>Publish to Wedding Gallery</span>
                  </>
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
