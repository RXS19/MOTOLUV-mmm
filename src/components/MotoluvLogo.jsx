import React, { useState } from 'react';
import officialLogoImg from '../assets/images/official_motoluv_logo_black.jpeg';

/**
 * Motoluv Official Brand Logo
 * Strictly renders the official brand logo image without vector approximations or redesigns.
 * Built with dual-layer resolution: Bundled asset + direct public fallback for 100% reliability in Vite/Vercel.
 */
export const MotoluvLogo = ({
  className = 'h-8 md:h-9 w-auto',
  alt = 'Motoluv - Sube Conecta Rueda',
  ...props
}) => {
  const [imgSrc, setImgSrc] = useState(officialLogoImg || '/motoluv-logo.jpg');

  return (
    <img
      src={imgSrc}
      alt={alt}
      className={`object-contain select-none ${className}`}
      loading="eager"
      decoding="async"
      referrerPolicy="no-referrer"
      onError={() => {
        // Fallback to static public root asset if bundler path fails on CDN
        if (imgSrc !== '/motoluv-logo.jpg') {
          setImgSrc('/motoluv-logo.jpg');
        }
      }}
      {...props}
    />
  );
};

export default MotoluvLogo;
