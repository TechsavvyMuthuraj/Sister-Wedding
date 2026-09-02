// ==============================================================================
// Cloudinary Cloud Storage Service for Sister Wedding Gallery
// Cloud Name: sjfuvq1u
// API Key: 897732679899766
// ==============================================================================

export const CLOUDINARY_CLOUD_NAME =
  import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'sjfuvq1u';
export const CLOUDINARY_API_KEY =
  import.meta.env.VITE_CLOUDINARY_API_KEY || '897732679899766';
export const CLOUDINARY_API_SECRET =
  import.meta.env.VITE_CLOUDINARY_API_SECRET || 'nyOaiqaEFRkkC_ml1wa91d5MSgg';

/**
 * Native SHA-1 signature generator using Web Crypto API (Browser-safe & fast)
 */
async function generateSha1Hex(message) {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    const encoder = new TextEncoder();
    const data = encoder.encode(message);
    const hashBuffer = await window.crypto.subtle.digest('SHA-1', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
  return '';
}

/**
 * Converts data URL (base64) to Blob
 */
export function dataURLtoBlob(dataurl) {
  try {
    const arr = dataurl.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  } catch (e) {
    console.error('Error converting dataURL to Blob:', e);
    return null;
  }
}

/**
 * Uploads an image File or Blob directly to Cloudinary
 * Returns the high-speed, secure Cloudinary CDN URL
 */
export async function uploadToCloudinary(fileOrBlob, filename = 'wedding_photo.jpg') {
  if (!fileOrBlob) return null;

  try {
    const timestamp = Math.floor(Date.now() / 1000);
    const folder = 'wedding_memories';

    // Cloudinary signature rules: parameters sorted alphabetically + api_secret
    const strToSign = `folder=${folder}&timestamp=${timestamp}${CLOUDINARY_API_SECRET}`;
    const signature = await generateSha1Hex(strToSign);

    const formData = new FormData();
    formData.append('file', fileOrBlob, filename);
    formData.append('api_key', CLOUDINARY_API_KEY);
    formData.append('timestamp', timestamp);
    formData.append('folder', folder);
    formData.append('signature', signature);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error?.message || `Cloudinary upload failed: ${response.status}`);
    }

    const data = await response.json();
    if (data && data.secure_url) {
      return data.secure_url;
    }
  } catch (err) {
    console.error('Cloudinary upload error:', err);
  }

  return null;
}

/**
 * Auto-optimizes Cloudinary URL for fast delivery (WebP/AVIF auto-format & auto-quality)
 */
export function getOptimizedCloudinaryUrl(url, { width = null, height = null } = {}) {
  if (!url || !url.includes('cloudinary.com')) return url;
  
  // Insert f_auto,q_auto transformations
  const parts = url.split('/image/upload/');
  if (parts.length === 2) {
    let transform = 'f_auto,q_auto';
    if (width && height) {
      transform += `,c_fill,w_${width},h_${height}`;
    } else if (width) {
      transform += `,w_${width}`;
    }
    return `${parts[0]}/image/upload/${transform}/${parts[1]}`;
  }
  return url;
}

/**
 * 1-Click universal photo downloader for Cloudinary and other URLs
 */
export async function downloadPhoto(imageUrl, filename = 'wedding_memory.jpg') {
  if (!imageUrl) return;

  try {
    let downloadUrl = imageUrl;

    // In Cloudinary, inserting fl_attachment creates a direct download trigger
    if (imageUrl.includes('cloudinary.com/')) {
      const parts = imageUrl.split('/image/upload/');
      if (parts.length === 2) {
        downloadUrl = `${parts[0]}/image/upload/fl_attachment:${encodeURIComponent(filename.replace(/\.[^/.]+$/, ''))}/${parts[1]}`;
      }
    }

    const response = await fetch(downloadUrl);
    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(blobUrl);
  } catch {
    // Fallback standard download
    const a = document.createElement('a');
    a.href = imageUrl;
    a.download = filename;
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
}
