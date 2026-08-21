import officialLuAvatar from '../assets/images/official_lu_avatar_1786325584369.jpg';
import officialMotoluvLogo from '../assets/images/official_motoluv_logo_1786325572393.jpg';

export const OFFICIAL_LU_AVATAR = officialLuAvatar;
export const OFFICIAL_MOTOLUV_LOGO = officialMotoluvLogo;

export const FALLBACK_MOTO_IMAGE = 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=800';
export const FALLBACK_GEAR_IMAGE = 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800';
export const FALLBACK_AVATAR_IMAGE = officialLuAvatar;

export const handleImageError = (e, fallbackType = 'moto') => {
  if (!e || !e.currentTarget) return;
  e.currentTarget.onerror = null; // Prevent recursion
  if (fallbackType === 'gear') {
    e.currentTarget.src = FALLBACK_GEAR_IMAGE;
  } else if (fallbackType === 'avatar' || fallbackType === 'lu') {
    e.currentTarget.src = OFFICIAL_LU_AVATAR;
  } else if (fallbackType === 'logo' || fallbackType === 'motoluv') {
    e.currentTarget.src = OFFICIAL_MOTOLUV_LOGO;
  } else {
    e.currentTarget.src = FALLBACK_MOTO_IMAGE;
  }
};

export const resolveSafeImageUrl = (url, fallbackType = 'moto') => {
  if (!url || typeof url !== 'string' || url.trim() === '') {
    if (fallbackType === 'gear') return FALLBACK_GEAR_IMAGE;
    if (fallbackType === 'avatar' || fallbackType === 'lu') return OFFICIAL_LU_AVATAR;
    if (fallbackType === 'logo' || fallbackType === 'motoluv') return OFFICIAL_MOTOLUV_LOGO;
    return FALLBACK_MOTO_IMAGE;
  }
  const cleanUrl = url.trim();
  if (cleanUrl.startsWith('http://') || cleanUrl.startsWith('https://') || cleanUrl.startsWith('data:')) {
    return cleanUrl;
  }
  if (cleanUrl.startsWith('/')) {
    const BACKEND_URL = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_BACKEND_URL) || '';
    return `${BACKEND_URL}${cleanUrl}`;
  }
  return cleanUrl;
};
