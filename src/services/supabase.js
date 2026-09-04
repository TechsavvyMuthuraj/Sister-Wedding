import { createClient } from '@supabase/supabase-js';
import { uploadToCloudinary, dataURLtoBlob } from './cloudinary';

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Helper to save photo: Uploads to Cloudinary CDN -> saves metadata to Supabase -> caches in LocalStorage
export async function saveFamilyPhoto({ title, category, caption, uploader, imageBase64, imageFile }) {
  let photoId = `photo_${Date.now()}`;
  let finalUrl = imageBase64;

  // 1. Upload heavy image to Cloudinary Cloud Storage & CDN
  try {
    const fileToUpload = imageFile || (imageBase64 ? dataURLtoBlob(imageBase64) : null);
    if (fileToUpload) {
      const cleanName = title.replace(/[^a-zA-Z0-9]/g, '_') || 'wedding_photo';
      const cdnUrl = await uploadToCloudinary(fileToUpload, `${cleanName}.jpg`);
      if (cdnUrl) {
        finalUrl = cdnUrl;
      }
    }
  } catch (cErr) {
    console.warn('Cloudinary upload warning, using local fallback:', cErr);
  }

  // 2. Save metadata to Supabase Cloud Database
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from('photos').insert([
        {
          title,
          category,
          caption,
          uploader,
          image_url: finalUrl,
          likes: 0,
          created_at: new Date().toISOString()
        }
      ]).select();

      if (!error && data && data[0]) {
        photoId = data[0].id;
      }
    } catch (err) {
      console.warn('Supabase DB insert warning (saved to local cache):', err);
    }
  }

  // 3. Normalized photo format compatible with all gallery components
  const newPhoto = {
    id: photoId,
    title,
    category,
    caption,
    takenBy: uploader,
    frontImage: finalUrl,
    image: finalUrl,
    image_url: finalUrl,
    likes: 0,
    isCustom: true,
    date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  };

  // 4. Always cache locally so photos persist immediately across page reloads
  try {
    const localPhotos = JSON.parse(localStorage.getItem('wedding_custom_photos') || '[]');
    const filtered = localPhotos.filter(p => p.id !== newPhoto.id);
    filtered.unshift(newPhoto);
    localStorage.setItem('wedding_custom_photos', JSON.stringify(filtered));
  } catch (e) {
    console.error('Error caching photo to local storage:', e);
  }

  return { success: true, data: newPhoto };
}

// Fetch all family photos from Supabase cloud
export async function fetchFamilyPhotos() {
  if (!isSupabaseConfigured || !supabase) return [];
  try {
    const { data, error } = await supabase
      .from('photos')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data) return [];

    return data.map(p => ({
      id: p.id,
      title: p.title,
      category: p.category,
      caption: p.caption,
      takenBy: p.uploader,
      frontImage: p.image_url,
      image: p.image_url,
      image_url: p.image_url,
      likes: p.likes || 0,
      isCustom: true,
      date: new Date(p.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    }));
  } catch (err) {
    console.warn('Supabase fetch error:', err);
    return [];
  }
}

// Update photo details (Title, Category, Caption, Uploader, or Photo URL) in Supabase and cache
export async function updateFamilyPhoto(photo) {
  if (!photo || !photo.id) return { success: false };
  const { id, title, category, caption, uploader, takenBy, imageUrl, frontImage, image, image_url, backStory } = photo;
  const finalImage = imageUrl || frontImage || image || image_url;
  const finalUploader = uploader || takenBy || 'Family Member';
  const finalCaption = caption || backStory || '';

  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(id));

  if (isSupabaseConfigured && supabase) {
    try {
      const updateData = {
        title,
        category,
        caption: finalCaption,
        uploader: finalUploader
      };
      if (finalImage) {
        updateData.image_url = finalImage;
      }

      if (isUuid) {
        const { error } = await supabase
          .from('photos')
          .update(updateData)
          .eq('id', id);
        if (error) {
          console.warn('Supabase photo update notice:', error.message);
        }
      } else {
        try {
          const { error } = await supabase
            .from('photos')
            .update(updateData)
            .eq('id', String(id));
          if (error) {
            console.warn('Supabase photo update notice:', error.message);
          }
        } catch (e) {}
      }
    } catch (err) {
      console.warn('Supabase photo update warning:', err);
    }
  }

  // Always update in localStorage (upsert so changes persist across all refreshes)
  try {
    const localPhotos = JSON.parse(localStorage.getItem('wedding_custom_photos') || '[]');
    const existingIndex = localPhotos.findIndex(p => p.id === id);
    const updatedObj = {
      id,
      title,
      category,
      caption: finalCaption,
      uploader: finalUploader,
      takenBy: finalUploader,
      frontImage: finalImage,
      image: finalImage,
      image_url: finalImage,
      backStory: finalCaption,
      isCustom: true
    };
    if (existingIndex >= 0) {
      localPhotos[existingIndex] = { ...localPhotos[existingIndex], ...updatedObj };
    } else {
      localPhotos.push(updatedObj);
    }
    localStorage.setItem('wedding_custom_photos', JSON.stringify(localPhotos));
  } catch (e) {
    console.error('Error updating photo in local storage:', e);
  }

  return { success: true };
}

// Delete photo from Supabase and cache
export async function deleteFamilyPhotoFromCloud(photoId) {
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('photos').delete().eq('id', photoId);
    } catch (err) {
      console.warn('Supabase delete photo warning:', err);
    }
  }
}

// Helper to save wishes
export async function saveWish({ name, relation, message, blessingEmoji }) {
  let wishId = `wish_${Date.now()}`;

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from('wishes').insert([
        {
          name,
          relation,
          message,
          blessing_emoji: blessingEmoji || '💐',
          created_at: new Date().toISOString()
        }
      ]).select();
      if (!error && data && data[0]) {
        wishId = data[0].id;
      }
    } catch (err) {
      console.warn('Supabase wish insert warning (saved locally):', err);
    }
  }

  const newWish = {
    id: wishId,
    name,
    relation,
    message,
    blessingEmoji: blessingEmoji || '💐',
    time: 'Just now'
  };

  try {
    const localWishes = JSON.parse(localStorage.getItem('wedding_custom_wishes') || '[]');
    localWishes.unshift(newWish);
    localStorage.setItem('wedding_custom_wishes', JSON.stringify(localWishes));
  } catch (e) {
    console.error('Error caching wish to local storage:', e);
  }

  return { success: true, data: newWish };
}

// Fetch all wishes from Supabase cloud
export async function fetchWishes() {
  if (!isSupabaseConfigured || !supabase) return [];
  try {
    const { data, error } = await supabase
      .from('wishes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data) return [];

    return data.map(w => ({
      id: w.id,
      name: w.name,
      relation: w.relation,
      message: w.message,
      blessingEmoji: w.blessing_emoji || '💐',
      time: new Date(w.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    }));
  } catch (err) {
    console.warn('Supabase fetch wishes error:', err);
    return [];
  }
}

// Update an existing wish in Supabase and local cache
export async function updateWish({ id, name, relation, message, blessingEmoji }) {
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase
        .from('wishes')
        .update({
          name,
          relation,
          message,
          blessing_emoji: blessingEmoji
        })
        .eq('id', id);
    } catch (err) {
      console.warn('Supabase wish update warning:', err);
    }
  }

  // Update in localStorage
  try {
    const localWishes = JSON.parse(localStorage.getItem('wedding_custom_wishes') || '[]');
    const updated = localWishes.map(w => {
      if (w.id === id) {
        return {
          ...w,
          name,
          relation,
          message,
          blessingEmoji: blessingEmoji || w.blessingEmoji
        };
      }
      return w;
    });
    localStorage.setItem('wedding_custom_wishes', JSON.stringify(updated));
  } catch (e) {
    console.error('Error updating wish in local storage:', e);
  }

  return { success: true };
}

// Delete a wish from Supabase and local cache
export async function deleteWishFromCloud(wishId) {
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('wishes').delete().eq('id', wishId);
    } catch (err) {
      console.warn('Supabase delete wish warning:', err);
    }
  }

  // Remove from localStorage
  try {
    const localWishes = JSON.parse(localStorage.getItem('wedding_custom_wishes') || '[]');
    const updated = localWishes.filter(w => w.id !== wishId);
    localStorage.setItem('wedding_custom_wishes', JSON.stringify(updated));

    // Also persist deleted IDs so default/initial wishes stay deleted too
    const deletedIds = JSON.parse(localStorage.getItem('wedding_deleted_wish_ids') || '[]');
    if (!deletedIds.includes(wishId)) {
      deletedIds.push(wishId);
      localStorage.setItem('wedding_deleted_wish_ids', JSON.stringify(deletedIds));
    }
  } catch (e) {
    console.error('Error removing wish from local storage:', e);
  }
}

// Sync couple details & photos to Supabase safely without wiping existing fields
export async function saveWeddingSettings(settings) {
  if (!isSupabaseConfigured || !supabase) return;
  try {
    const payload = {
      id: 'current',
      updated_at: new Date().toISOString()
    };
    if (settings.brideName !== undefined) payload.bride_name = settings.brideName;
    if (settings.brideQualification !== undefined) payload.bride_qualification = settings.brideQualification;
    if (settings.bridePhoto !== undefined) payload.bride_photo = settings.bridePhoto;
    if (settings.groomName !== undefined) payload.groom_name = settings.groomName;
    if (settings.groomQualification !== undefined) payload.groom_qualification = settings.groomQualification;
    if (settings.groomPhoto !== undefined) payload.groom_photo = settings.groomPhoto;
    if (settings.hashtag !== undefined) payload.hashtag = settings.hashtag;

    await supabase.from('wedding_settings').upsert(payload);
  } catch (e) {
    console.warn('Failed to save settings to Supabase:', e);
  }
}

// Fetch couple details & photos from Supabase
export async function fetchWeddingSettings() {
  if (!isSupabaseConfigured || !supabase) return null;
  try {
    const { data, error } = await supabase.from('wedding_settings').select('*').eq('id', 'current').maybeSingle();
    if (!error && data) {
      return {
        brideName: data.bride_name,
        brideQualification: data.bride_qualification,
        bridePhoto: data.bride_photo,
        groomName: data.groom_name,
        groomQualification: data.groom_qualification,
        groomPhoto: data.groom_photo,
        hashtag: data.hashtag,
      };
    }
  } catch (e) {
    console.warn('Failed to fetch settings from Supabase:', e);
  }
  return null;
}
