import React, { useState } from 'react';
import { Send, Heart, Sparkles, MessageCircleHeart, Pencil, Trash2, X, Check } from 'lucide-react';
import { saveWish } from '../services/supabase';
import { playCelebrationChime } from '../utils/audio';
import confetti from 'canvas-confetti';

const EMOJIS = ['🌸', '🪔', '💖', '🎉', '🕉️', '💐', '✨'];

export default function BlessingsWall({ wishes, onAddWish, onUpdateWish, onDeleteWish, brideName, groomName }) {
  const [name, setName] = useState('');
  const [relation, setRelation] = useState('');
  const [message, setMessage] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('🌸');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edit wish state
  const [editingWish, setEditingWish] = useState(null);
  const [editName, setEditName] = useState('');
  const [editRelation, setEditRelation] = useState('');
  const [editMessage, setEditMessage] = useState('');
  const [editEmoji, setEditEmoji] = useState('🌸');
  const [isUpdating, setIsUpdating] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !message) {
      alert('Please fill in your name and a blessing message.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await saveWish({
        name,
        relation: relation || 'Well-wisher & Family',
        message,
        blessingEmoji: selectedEmoji
      });

      if (res.success) {
        playCelebrationChime();
        confetti({
          particleCount: 75,
          spread: 80,
          origin: { y: 0.6 }
        });
        onAddWish(res.data);
        setName('');
        setRelation('');
        setMessage('');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartEdit = (wish) => {
    setEditingWish(wish);
    setEditName(wish.name || '');
    setEditRelation(wish.relation || '');
    setEditMessage(wish.message || '');
    setEditEmoji(wish.blessingEmoji || '🌸');
  };

  const handleCancelEdit = () => {
    setEditingWish(null);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editName || !editMessage || !editingWish) return;

    setIsUpdating(true);
    try {
      const updatedData = {
        id: editingWish.id,
        name: editName,
        relation: editRelation,
        message: editMessage,
        blessingEmoji: editEmoji
      };

      if (onUpdateWish) {
        await onUpdateWish(updatedData);
      }

      playCelebrationChime();
      setEditingWish(null);
    } catch (err) {
      console.error('Error updating wish:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async (wishId) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this blessing wish? / இந்த வாழ்த்தை நீக்க விரும்புகிறீர்களா?');
    if (!confirmDelete) return;

    if (onDeleteWish) {
      await onDeleteWish(wishId);
    }
  };

  return (
    <section id="blessings" className="relative py-20 px-4 max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs uppercase tracking-widest font-semibold mb-3">
          <MessageCircleHeart className="w-3.5 h-3.5" />
          The Family Guestbook
        </div>
        <h2 className="text-3xl sm:text-5xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-gold-100 via-white to-gold-300">
          Wishes & Divine Blessings
        </h2>
        <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto mt-2 font-sans">
          Send your love, prayers, and heartfelt wishes to {brideName} &amp; {groomName} for their marriage on 17/09/2026.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form Card */}
        <div className="lg:col-span-5 rounded-3xl bg-royal-900/90 border border-gold-500/30 p-6 sm:p-8 backdrop-blur-xl shadow-2xl text-left">
          <div className="flex items-center gap-2 text-gold-400 text-sm font-semibold mb-4">
            <Sparkles className="w-4 h-4" />
            <span>Leave Your Blessing</span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-slate-300 mb-1 font-medium">
                Your Name
              </label>
              <input
                type="text"
                placeholder="e.g. Anand Mama & Family"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-royal-950 border border-slate-700 text-white focus:border-gold-500 focus:outline-none text-xs sm:text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-slate-300 mb-1 font-medium">
                Relationship to Bride / Family
              </label>
              <input
                type="text"
                placeholder="e.g. Maternal Uncle / School Friend / Cousin"
                value={relation}
                onChange={(e) => setRelation(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-royal-950 border border-slate-700 text-white focus:border-gold-500 focus:outline-none text-xs sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-slate-300 mb-1 font-medium">
                Pick Blessing Symbol
              </label>
              <div className="flex items-center gap-2 flex-wrap">
                {EMOJIS.map(em => (
                  <button
                    key={em}
                    type="button"
                    onClick={() => setSelectedEmoji(em)}
                    className={`w-9 h-9 rounded-xl flex items-center justify-center text-base transition-all ${
                      selectedEmoji === em
                        ? 'bg-gold-500/20 border-2 border-gold-500 scale-110'
                        : 'bg-royal-950 border border-slate-800 hover:border-slate-600'
                    }`}
                  >
                    {em}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-slate-300 mb-1 font-medium">
                Your Heartfelt Message
              </label>
              <textarea
                rows={4}
                placeholder="Write your loving blessings and wishes for their lifelong happiness..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-royal-950 border border-slate-700 text-white focus:border-gold-500 focus:outline-none text-xs sm:text-sm"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-amber-500 via-gold-500 to-amber-600 text-royal-950 font-bold text-sm shadow-gold-glow hover:scale-102 active:scale-98 transition-all disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? 'Sending...' : 'Post Blessing with Confetti'}</span>
            </button>
          </form>
        </div>

        {/* Wishes Feed */}
        <div className="lg:col-span-7 space-y-4 max-h-[580px] overflow-y-auto pr-1">
          {wishes.map((wish) => (
            <div
              key={wish.id}
              className="p-5 rounded-2xl bg-royal-900/70 border border-slate-800/80 hover:border-gold-500/40 transition-all text-left group backdrop-blur-sm relative"
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gold-500/15 border border-gold-500/30 flex items-center justify-center text-lg shrink-0">
                    {wish.blessingEmoji || '🌸'}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white group-hover:text-gold-300 transition-colors">
                      {wish.name}
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      {wish.relation || 'Family Member'} • {wish.time || 'Auspicious Wish'}
                    </p>
                  </div>
                </div>

                {/* Actions: Edit & Delete & Heart */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => handleStartEdit(wish)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-gold-300 hover:bg-royal-950/80 transition-colors"
                    title="Edit Blessing / திருத்தவும்"
                    aria-label="Edit Wish"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleDelete(wish.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-royal-950/80 transition-colors"
                    title="Delete Blessing / நீக்கவும்"
                    aria-label="Delete Wish"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  <Heart className="w-4 h-4 text-rose-400 fill-rose-400/20 group-hover:scale-110 transition-transform ml-1" />
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-sans mt-2 pl-13 italic">
                "{wish.message}"
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Edit Wish Modal */}
      {editingWish && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-[fadeIn_0.2s_ease-out] overflow-y-auto"
          onClick={handleCancelEdit}
        >
          <div
            className="relative w-full max-w-lg rounded-3xl bg-royal-900 border border-gold-500/40 p-6 sm:p-8 text-left shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2 text-gold-400 font-serif font-bold text-base sm:text-lg">
                <Pencil className="w-4 h-4" />
                <span>Edit Blessing / வாழ்த்தை திருத்தவும்</span>
              </div>
              <button
                onClick={handleCancelEdit}
                className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-slate-300 mb-1 font-medium">
                  Name
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl bg-royal-950 border border-slate-700 text-white text-xs sm:text-sm focus:border-gold-400 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-slate-300 mb-1 font-medium">
                  Relationship / உறவுமுறை
                </label>
                <input
                  type="text"
                  value={editRelation}
                  onChange={(e) => setEditRelation(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl bg-royal-950 border border-slate-700 text-white text-xs sm:text-sm focus:border-gold-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-slate-300 mb-1 font-medium">
                  Blessing Symbol
                </label>
                <div className="flex items-center gap-2 flex-wrap">
                  {EMOJIS.map(em => (
                    <button
                      key={em}
                      type="button"
                      onClick={() => setEditEmoji(em)}
                      className={`w-9 h-9 rounded-xl flex items-center justify-center text-base transition-all ${
                        editEmoji === em
                          ? 'bg-gold-500/20 border-2 border-gold-500 scale-110'
                          : 'bg-royal-950 border border-slate-800 hover:border-slate-600'
                      }`}
                    >
                      {em}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-slate-300 mb-1 font-medium">
                  Blessing Message / வாழ்த்துச் செய்தி
                </label>
                <textarea
                  rows={4}
                  value={editMessage}
                  onChange={(e) => setEditMessage(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl bg-royal-950 border border-slate-700 text-white text-xs sm:text-sm focus:border-gold-400 focus:outline-none"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="px-4 py-2 rounded-xl bg-royal-950 border border-slate-700 text-slate-300 text-xs font-semibold hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-gold-500 text-royal-950 text-xs font-bold shadow-gold-glow hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{isUpdating ? 'Saving...' : 'Update Blessing'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}

