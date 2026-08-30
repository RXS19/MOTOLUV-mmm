import React from 'react';
import officialLogoImg from '../assets/images/motoluv_official_logo.jpeg';

/**
 * Motoluv Official Brand Logo
 * Strictly renders the official brand logo image without vector approximations or redesigns.
 */
export const MotoluvLogo = ({ className = 'h-8 md:h-9 w-auto', alt = 'Motoluv - Sube Conecta Rueda', ...props }) => {
  return (
    <img
      src={officialLogoImg}
      alt={alt}
      className={`object-contain select-none ${className}`}
      loading="eager"
      referrerPolicy="no-referrer"
      {...props}
    />
  );
};

export default MotoluvLogo;
