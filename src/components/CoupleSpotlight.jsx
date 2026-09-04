import React, { useState, useRef, useEffect } from 'react';
import { Heart, Sparkles, Edit3, Crown, ShieldCheck, UserCheck, Camera, ImagePlus, X, Check, Lock, Trash2, Loader2 } from 'lucide-react';
import ElectricBorder from './ElectricBorder';
import FamilyPasscodeModal from './FamilyPasscodeModal';
import { uploadToCloudinary } from '../services/cloudinary';

export default function CoupleSpotlight({ config, onUpdateConfig, isFamilyUnlocked, onUnlockFamily }) {
  const [isEditing, setIsEditing] = useState(false);
  const [isPasscodeOpen, setIsPasscodeOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState(null); // 'open_edit' | 'bride_photo' | 'groom_photo' | 'remove_bride' | 'remove_groom'

  const [isUploadingBride, setIsUploadingBride] = useState(false);
  const [isUploadingGroom, setIsUploadingGroom] = useState(false);

  const [editForm, setEditForm] = useState({
    brideName: config.brideName || 'M. Manju',
    groomName: config.groomName || 'Dr. M. Muniraj',
    bridePhoto: config.bridePhoto || null,
    groomPhoto: config.groomPhoto || null,
    brotherMessage: config.brotherMessage || '',
    hashtag: config.hashtag || '#MunirajWedsManju2026'
  });

  // Always keep editForm synchronized whenever config updates
  useEffect(() => {
    setEditForm({
      brideName: config.brideName || 'M. Manju',
      groomName: config.groomName || 'Dr. M. Muniraj',
      bridePhoto: config.bridePhoto || null,
      groomPhoto: config.groomPhoto || null,
      brotherMessage: config.brotherMessage || '',
      hashtag: config.hashtag || '#MunirajWedsManju2026'
    });
  }, [config.brideName, config.groomName, config.bridePhoto, config.groomPhoto, config.hashtag]);

  const brideFileRef = useRef(null);
  const groomFileRef = useRef(null);

  const checkAuthAndExecute = (action) => {
    if (isFamilyUnlocked) {
      if (action === 'open_edit') {
        setEditForm({
          brideName: config.brideName || 'M. Manju',
          groomName: config.groomName || 'Dr. M. Muniraj',
          bridePhoto: config.bridePhoto || null,
          groomPhoto: config.groomPhoto || null,
          brotherMessage: config.brotherMessage || '',
          hashtag: config.hashtag || '#MunirajWedsManju2026'
        });
        setIsEditing(true);
      }
      else if (action === 'bride_photo') brideFileRef.current?.click();
      else if (action === 'groom_photo') groomFileRef.current?.click();
      else if (action === 'remove_bride') handleRemoveBridePhoto();
      else if (action === 'remove_groom') handleRemoveGroomPhoto();
    } else {
      setPendingAction(action);
      setIsPasscodeOpen(true);
    }
  };

  const handlePasscodeSuccess = () => {
    if (onUnlockFamily) onUnlockFamily();
    if (pendingAction === 'open_edit') {
      setEditForm({
        brideName: config.brideName || 'M. Manju',
        groomName: config.groomName || 'Dr. M. Muniraj',
        bridePhoto: config.bridePhoto || null,
        groomPhoto: config.groomPhoto || null,
        brotherMessage: config.brotherMessage || '',
        hashtag: config.hashtag || '#MunirajWedsManju2026'
      });
      setIsEditing(true);
    } else if (pendingAction === 'bride_photo') {
      brideFileRef.current?.click();
    } else if (pendingAction === 'groom_photo') {
      groomFileRef.current?.click();
    } else if (pendingAction === 'remove_bride') {
      handleRemoveBridePhoto();
    } else if (pendingAction === 'remove_groom') {
      handleRemoveGroomPhoto();
    }
    setPendingAction(null);
  };

  const handleSave = (e) => {
    e.preventDefault();
    onUpdateConfig(editForm);
    setIsEditing(false);
  };

  // Direct fast upload for bride photo using Cloudinary CDN
  const handleBrideFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploadingBride(true);
    try {
      const cdnUrl = await uploadToCloudinary(file, 'bride_portrait.jpg');
      const finalUrl = cdnUrl || URL.createObjectURL(file);
      onUpdateConfig({ bridePhoto: finalUrl });
      setEditForm(prev => ({ ...prev, bridePhoto: finalUrl }));
    } catch (err) {
      console.error('Bride photo upload error:', err);
    } finally {
      setIsUploadingBride(false);
      if (e.target) e.target.value = '';
    }
  };

  // Direct fast upload for groom photo using Cloudinary CDN
  const handleGroomFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploadingGroom(true);
    try {
      const cdnUrl = await uploadToCloudinary(file, 'groom_portrait.jpg');
      const finalUrl = cdnUrl || URL.createObjectURL(file);
      onUpdateConfig({ groomPhoto: finalUrl });
      setEditForm(prev => ({ ...prev, groomPhoto: finalUrl }));
    } catch (err) {
      console.error('Groom photo upload error:', err);
    } finally {
      setIsUploadingGroom(false);
      if (e.target) e.target.value = '';
    }
  };

  // Instant photo removal
  const handleRemoveBridePhoto = (e) => {
    if (e) e.stopPropagation();
    onUpdateConfig({ bridePhoto: null });
    setEditForm(prev => ({ ...prev, bridePhoto: null }));
  };

  const handleRemoveGroomPhoto = (e) => {
    if (e) e.stopPropagation();
    onUpdateConfig({ groomPhoto: null });
    setEditForm(prev => ({ ...prev, groomPhoto: null }));
  };

  return (
    <section id="couple" className="relative py-20 px-4 max-w-6xl mx-auto">
      {/* Hidden file inputs for quick photo uploads */}
      <input
        type="file"
        ref={brideFileRef}
        accept="image/*"
        className="hidden"
        onChange={handleBrideFileChange}
      />
      <input
        type="file"
        ref={groomFileRef}
        accept="image/*"
        className="hidden"
        onChange={handleGroomFileChange}
      />

      {/* Section Header */}
      <div className="text-center mb-14">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-500/10 border border-gold-500/30 text-gold-400 text-xs uppercase tracking-widest font-semibold mb-3">
          <Crown className="w-3.5 h-3.5" />
          The Royal Couple • மணமக்கள்
        </div>
        <h2 className="text-3xl sm:text-5xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-gold-100 via-white to-gold-300">
          Dr. M. Muniraj & M. Manju
        </h2>
        <p className="text-gold-200/90 text-sm sm:text-base font-serif italic mt-1">
          Dr. M. முனிராஜ், (PT)., MIAP., D.ACU., CPT. • M. மஞ்சு, B.Sc., B.Ed.
        </p>
        <p className="text-slate-400 text-xs sm:text-sm max-w-2xl mx-auto mt-2 font-sans">
          Two beautiful hearts uniting on 17th September 2026 (பிரம்ம முகூர்த்தம்) at Jayam Mahal.
        </p>

        {/* Quick customize button */}
        <button
          onClick={() => checkAuthAndExecute('open_edit')}
          className="mt-4 inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-medium text-gold-400/90 bg-royal-900/60 border border-gold-500/30 hover:bg-gold-500/10 hover:text-gold-300 transition-all cursor-pointer"
        >
          <Lock className="w-3.5 h-3.5 text-gold-400" />
          <span>Edit Details & Photos</span>
        </button>
      </div>

      {/* ElectricBorder Animated Cards Container */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-stretch max-w-5xl mx-auto">
        {/* The Bride Card */}
        <div className="flex flex-col items-center">
          <ElectricBorder
            color="#f59e0b"
            speed={1.2}
            chaos={0.14}
            borderRadius={28}
            className="w-full max-w-md shadow-2xl"
          >
            <div className="relative rounded-[28px] overflow-hidden bg-royal-900 border border-gold-500/40 p-4">
              <div className="relative h-[480px] sm:h-[540px] rounded-2xl overflow-hidden group">
                {isUploadingBride ? (
                  <div className="w-full h-full bg-royal-950 flex flex-col items-center justify-center p-6 text-center">
                    <Loader2 className="w-10 h-10 text-gold-400 animate-spin mb-3" />
                    <p className="text-sm font-serif text-gold-300">Uploading Sister's Photo...</p>
                    <p className="text-[11px] text-slate-400 mt-1">Direct upload to Cloudinary Cloud CDN</p>
                  </div>
                ) : config.bridePhoto ? (
                  <>
                    <img
                      src={config.bridePhoto}
                      alt={`The Bride ${config.brideName}`}
                      className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-royal-950/90 via-transparent to-transparent pointer-events-none" />
                    <div className="absolute top-3 right-3 flex items-center gap-2">
                      <button
                        onClick={() => checkAuthAndExecute('bride_photo')}
                        className="p-2 rounded-full bg-black/75 hover:bg-gold-500 hover:text-royal-950 text-white transition-all text-xs flex items-center gap-1 backdrop-blur-md shadow-md"
                        title="Change Sister's Photo"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        <span>Change</span>
                      </button>
                      <button
                        onClick={() => checkAuthAndExecute('remove_bride')}
                        className="p-2 rounded-full bg-rose-600/80 hover:bg-rose-600 text-white transition-all text-xs flex items-center gap-1 backdrop-blur-md shadow-md"
                        title="Remove Photo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove</span>
                      </button>
                    </div>
                  </>
                ) : (
                  /* Royal "Photo Coming Soon" Frame for the Bride */
                  <div className="w-full h-full bg-gradient-to-b from-rose-950/70 via-royal-900 to-royal-950 flex flex-col items-center justify-center p-6 text-center border-2 border-dashed border-gold-500/40 rounded-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-rose-500/10 blur-[60px] pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-gold-500/10 blur-[60px] pointer-events-none" />

                    <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-500/20 via-rose-500/20 to-gold-500/20 border-2 border-gold-500/50 flex items-center justify-center mb-4 shadow-gold-glow animate-pulse">
                      <Heart className="w-10 h-10 text-gold-300 fill-gold-400/20" />
                    </div>

                    <span className="px-3 py-1 rounded-full bg-gold-500/20 border border-gold-500/40 text-gold-300 text-xs font-serif font-bold uppercase tracking-wider mb-2">
                      ✨ மணமகள் திருவுருவப்படம் விரைவில்
                    </span>

                    <p className="text-sm font-serif italic text-white/90">
                      Sister Manju's Photo Coming Soon
                    </p>

                    <p className="text-[11px] text-slate-400 mt-1 max-w-xs font-sans">
                      Our beautiful bride's official portrait will be updated soon.
                    </p>

                    <button
                      onClick={() => checkAuthAndExecute('bride_photo')}
                      className="mt-4 flex items-center gap-1.5 px-4 py-2 rounded-full bg-royal-800 hover:bg-gold-500 hover:text-royal-950 text-gold-300 text-xs font-semibold border border-gold-500/30 transition-all shadow-md"
                    >
                      <ImagePlus className="w-3.5 h-3.5" />
                      <span>Upload Sister's Photo</span>
                    </button>
                  </div>
                )}

                {/* Bride Information Overlay */}
                <div className="absolute bottom-2.5 left-2.5 right-2.5 sm:bottom-3 sm:left-3 sm:right-3 text-left bg-gradient-to-t from-royal-950 via-royal-950/95 to-royal-950/80 backdrop-blur-md p-2.5 sm:p-3.5 rounded-xl border border-gold-500/30 shadow-xl">
                  <span className="px-2 py-0.5 rounded-full bg-gold-500 text-royal-950 font-bold text-[9px] sm:text-[10px] uppercase tracking-wider shadow-md">
                    மணமகள் • The Bride
                  </span>
                  <h3 className="text-lg sm:text-2xl font-serif font-bold text-white mt-1 leading-tight">
                    {config.brideName}, <span className="text-gold-300 text-xs sm:text-sm font-sans font-normal">{config.brideQualification || 'B.Sc., B.Ed.'}</span>
                  </h3>
                  <p className="text-[11px] sm:text-xs text-gold-200/90 font-serif mt-0.5">
                    M. மஞ்சு • தருமபுரி மாவட்டம், சின்னபங்குநத்தம்
                  </p>
                  <p className="text-[10px] sm:text-[11px] text-slate-300 mt-0.5 font-sans">
                    பெற்றோர்: {config.brideParents}
                  </p>
                </div>
              </div>
            </div>
          </ElectricBorder>
        </div>

        {/* The Groom Card */}
        <div className="flex flex-col items-center">
          <ElectricBorder
            color="#f43f5e"
            speed={1.2}
            chaos={0.14}
            borderRadius={28}
            className="w-full max-w-md shadow-2xl"
          >
            <div className="relative rounded-[28px] overflow-hidden bg-royal-900 border border-rose-500/40 p-4">
              <div className="relative h-[480px] sm:h-[540px] rounded-2xl overflow-hidden group">
                {isUploadingGroom ? (
                  <div className="w-full h-full bg-royal-950 flex flex-col items-center justify-center p-6 text-center">
                    <Loader2 className="w-10 h-10 text-rose-400 animate-spin mb-3" />
                    <p className="text-sm font-serif text-rose-300">Uploading Groom's Photo...</p>
                    <p className="text-[11px] text-slate-400 mt-1">Direct upload to Cloudinary Cloud CDN</p>
                  </div>
                ) : config.groomPhoto ? (
                  <>
                    <img
                      src={config.groomPhoto}
                      alt={`The Groom ${config.groomName}`}
                      className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-royal-950/90 via-transparent to-transparent pointer-events-none" />
                    <div className="absolute top-3 right-3 flex items-center gap-2">
                      <button
                        onClick={() => checkAuthAndExecute('groom_photo')}
                        className="p-2 rounded-full bg-black/75 hover:bg-rose-500 hover:text-white text-white transition-all text-xs flex items-center gap-1 backdrop-blur-md shadow-md"
                        title="Change Groom's Photo"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        <span>Change</span>
                      </button>
                      <button
                        onClick={() => checkAuthAndExecute('remove_groom')}
                        className="p-2 rounded-full bg-rose-600/80 hover:bg-rose-600 text-white transition-all text-xs flex items-center gap-1 backdrop-blur-md shadow-md"
                        title="Remove Photo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove</span>
                      </button>
                    </div>
                  </>
                ) : (
                  /* Royal "Photo Coming Soon" Frame for the Groom */
                  <div className="w-full h-full bg-gradient-to-b from-indigo-950/70 via-royal-900 to-royal-950 flex flex-col items-center justify-center p-6 text-center border-2 border-dashed border-rose-500/40 rounded-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 blur-[60px] pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-rose-500/10 blur-[60px] pointer-events-none" />

                    <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-rose-500/20 via-amber-500/20 to-purple-500/20 border-2 border-rose-500/50 flex items-center justify-center mb-4 shadow-rose-500/20 animate-pulse">
                      <Crown className="w-10 h-10 text-rose-300" />
                    </div>

                    <span className="px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-serif font-bold uppercase tracking-wider mb-2">
                      ✨ மணமகன் திருவுருவப்படம் விரைவில்
                    </span>

                    <p className="text-sm font-serif italic text-white/90">
                      Dr. M. Muniraj's Photo Coming Soon
                    </p>

                    <p className="text-[11px] text-slate-400 mt-1 max-w-xs font-sans">
                      Our distinguished groom's official portrait will be updated soon.
                    </p>

                    <button
                      onClick={() => checkAuthAndExecute('groom_photo')}
                      className="mt-4 flex items-center gap-1.5 px-4 py-2 rounded-full bg-royal-800 hover:bg-rose-500 hover:text-white text-rose-300 text-xs font-semibold border border-rose-500/30 transition-all shadow-md"
                    >
                      <ImagePlus className="w-3.5 h-3.5" />
                      <span>Upload Groom's Photo</span>
                    </button>
                  </div>
                )}

                {/* Groom Information Overlay */}
                <div className="absolute bottom-2.5 left-2.5 right-2.5 sm:bottom-3 sm:left-3 sm:right-3 text-left bg-gradient-to-t from-royal-950 via-royal-950/95 to-royal-950/80 backdrop-blur-md p-2.5 sm:p-3.5 rounded-xl border border-rose-500/30 shadow-xl">
                  <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white font-bold text-[9px] sm:text-[10px] uppercase tracking-wider shadow-md">
                    மணமகன் • The Groom
                  </span>
                  <h3 className="text-lg sm:text-2xl font-serif font-bold text-white mt-1 leading-tight">
                    {config.groomName}, <span className="text-rose-300 text-xs sm:text-sm font-sans font-normal">(PT)., MIAP., D.ACU., CPT.</span>
                  </h3>
                  <p className="text-[11px] sm:text-xs text-rose-200/90 font-serif mt-0.5">
                    Dr. M. முனிராஜ் • தருமபுரி மாவட்டம், பிக்கம்பட்டி
                  </p>
                  <p className="text-[10px] sm:text-[11px] text-slate-300 mt-0.5 font-sans">
                    பெற்றோர்: {config.groomParents || 'Mr. M. Mariyappan & Mrs. Mano (திரு. M. மாரியப்பன் - மனோ)'}
                  </p>
                </div>
              </div>
            </div>
          </ElectricBorder>
        </div>
      </div>

      {/* Edit Details & Photos Modal */}
      {isEditing && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto"
          onClick={() => setIsEditing(false)}
        >
          <div
            className="relative w-full max-w-lg rounded-3xl bg-royal-900 border border-gold-500/40 p-6 sm:p-8 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsEditing(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-royal-950/60 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl sm:text-2xl font-serif font-bold text-white mb-1 text-left">
              Customize Wedding Names & Photos
            </h3>
            <p className="text-xs text-slate-400 mb-6 text-left">
              Changes sync instantly with Cloudinary Cloud CDN and Supabase.
            </p>

            <form onSubmit={handleSave} className="space-y-4 text-left">
              <div>
                <label className="block text-xs uppercase tracking-wider text-slate-300 mb-1">
                  Bride's Name
                </label>
                <input
                  type="text"
                  value={editForm.brideName}
                  onChange={(e) => setEditForm({ ...editForm, brideName: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-royal-950 border border-slate-700 text-white focus:border-gold-500 focus:outline-none text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-slate-300 mb-1">
                  Groom's Name
                </label>
                <input
                  type="text"
                  value={editForm.groomName}
                  onChange={(e) => setEditForm({ ...editForm, groomName: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-royal-950 border border-slate-700 text-white focus:border-gold-500 focus:outline-none text-sm"
                  required
                />
              </div>

              {/* Photo Pickers in Edit Form */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-gold-300 mb-1">
                    Bride Photo
                  </label>
                  {isUploadingBride ? (
                    <div className="flex flex-col items-center justify-center p-3 border border-gold-500 rounded-xl bg-royal-950 text-center h-28">
                      <Loader2 className="w-5 h-5 text-gold-400 animate-spin mb-1" />
                      <span className="text-[11px] text-gold-300">Uploading to Cloudinary...</span>
                    </div>
                  ) : editForm.bridePhoto ? (
                    <div className="relative rounded-xl overflow-hidden border border-gold-500/40 bg-royal-950 p-2 text-center">
                      <img
                        src={editForm.bridePhoto}
                        alt="Bride Preview"
                        className="w-full h-24 object-cover rounded-lg mb-2"
                      />
                      <div className="flex items-center justify-between gap-1">
                        <label className="flex-1 px-2 py-1 rounded-lg bg-gold-500/20 text-gold-300 hover:bg-gold-500/30 text-[10px] font-semibold cursor-pointer">
                          Change
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={async (e) => {
                              const file = e.target.files[0];
                              if (file) {
                                setIsUploadingBride(true);
                                try {
                                  const cdnUrl = await uploadToCloudinary(file, 'bride_portrait.jpg');
                                  if (cdnUrl) {
                                    setEditForm(prev => ({ ...prev, bridePhoto: cdnUrl }));
                                    onUpdateConfig({ bridePhoto: cdnUrl });
                                  }
                                } finally {
                                  setIsUploadingBride(false);
                                  if (e.target) e.target.value = '';
                                }
                              }
                            }}
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            setEditForm(prev => ({ ...prev, bridePhoto: null }));
                            onUpdateConfig({ bridePhoto: null });
                          }}
                          className="px-2 py-1 rounded-lg bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 text-[10px] font-semibold"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center p-3 border border-dashed border-slate-700 hover:border-gold-500 rounded-xl cursor-pointer bg-royal-950 text-center h-28">
                      <Camera className="w-5 h-5 text-gold-400 mb-1" />
                      <span className="text-[11px] text-slate-300">Select Photo</span>
                      <span className="text-[9px] text-slate-500">Cloudinary CDN</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files[0];
                          if (file) {
                            setIsUploadingBride(true);
                            try {
                              const cdnUrl = await uploadToCloudinary(file, 'bride_portrait.jpg');
                              if (cdnUrl) {
                                setEditForm(prev => ({ ...prev, bridePhoto: cdnUrl }));
                                onUpdateConfig({ bridePhoto: cdnUrl });
                              }
                            } finally {
                              setIsUploadingBride(false);
                              if (e.target) e.target.value = '';
                            }
                          }
                        }}
                      />
                    </label>
                  )}
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-rose-300 mb-1">
                    Groom Photo
                  </label>
                  {isUploadingGroom ? (
                    <div className="flex flex-col items-center justify-center p-3 border border-rose-500 rounded-xl bg-royal-950 text-center h-28">
                      <Loader2 className="w-5 h-5 text-rose-400 animate-spin mb-1" />
                      <span className="text-[11px] text-rose-300">Uploading to Cloudinary...</span>
                    </div>
                  ) : editForm.groomPhoto ? (
                    <div className="relative rounded-xl overflow-hidden border border-rose-500/40 bg-royal-950 p-2 text-center">
                      <img
                        src={editForm.groomPhoto}
                        alt="Groom Preview"
                        className="w-full h-24 object-cover rounded-lg mb-2"
                      />
                      <div className="flex items-center justify-between gap-1">
                        <label className="flex-1 px-2 py-1 rounded-lg bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 text-[10px] font-semibold cursor-pointer">
                          Change
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={async (e) => {
                              const file = e.target.files[0];
                              if (file) {
                                setIsUploadingGroom(true);
                                try {
                                  const cdnUrl = await uploadToCloudinary(file, 'groom_portrait.jpg');
                                  if (cdnUrl) {
                                    setEditForm(prev => ({ ...prev, groomPhoto: cdnUrl }));
                                    onUpdateConfig({ groomPhoto: cdnUrl });
                                  }
                                } finally {
                                  setIsUploadingGroom(false);
                                  if (e.target) e.target.value = '';
                                }
                              }
                            }}
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            setEditForm(prev => ({ ...prev, groomPhoto: null }));
                            onUpdateConfig({ groomPhoto: null });
                          }}
                          className="px-2 py-1 rounded-lg bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 text-[10px] font-semibold"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center p-3 border border-dashed border-slate-700 hover:border-rose-500 rounded-xl cursor-pointer bg-royal-950 text-center h-28">
                      <Camera className="w-5 h-5 text-rose-400 mb-1" />
                      <span className="text-[11px] text-slate-300">Select Photo</span>
                      <span className="text-[9px] text-slate-500">Cloudinary CDN</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files[0];
                          if (file) {
                            setIsUploadingGroom(true);
                            try {
                              const cdnUrl = await uploadToCloudinary(file, 'groom_portrait.jpg');
                              if (cdnUrl) {
                                setEditForm(prev => ({ ...prev, groomPhoto: cdnUrl }));
                                onUpdateConfig({ groomPhoto: cdnUrl });
                              }
                            } finally {
                              setIsUploadingGroom(false);
                              if (e.target) e.target.value = '';
                            }
                          }
                        }}
                      />
                    </label>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-slate-300 mb-1">
                  Wedding Hashtag
                </label>
                <input
                  type="text"
                  value={editForm.hashtag}
                  onChange={(e) => setEditForm({ ...editForm, hashtag: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-royal-950 border border-slate-700 text-white focus:border-gold-500 focus:outline-none text-sm"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-gold-500 to-amber-600 text-royal-950 font-bold text-xs shadow-gold-glow"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Family Passcode Modal for editing and photo updates */}
      <FamilyPasscodeModal
        isOpen={isPasscodeOpen}
        actionType="edit"
        onClose={() => {
          setIsPasscodeOpen(false);
          setPendingAction(null);
        }}
        onSuccess={handlePasscodeSuccess}
      />
    </section>
  );
}
