import React from 'react';

/**
 * Motoluv Official Vector Brand Logo Component
 * Matches the official identity: MOTO in crisp white + LUV in red rounded badge + "SUBE CONECTA RUEDA" slogan.
 */
export const MotoluvLogo = ({ className = 'h-8 md:h-9 w-auto', showSlogan = false }) => {
  return (
    <svg
      viewBox={showSlogan ? "0 0 680 200" : "0 0 540 130"}
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ overflow: 'visible', display: 'block' }}
      aria-label="Motoluv - Sube Conecta Rueda"
      role="img"
    >
      <defs>
        <style>
          {`
            .motoluv-font {
              font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif;
              font-weight: 900;
              font-style: italic;
            }
          `}
        </style>
      </defs>

      {/* Main Brand Row */}
      <g transform="translate(0, 10)">
        {/* MOTO Text in High-Contrast White */}
        <text
          x="10"
          y="88"
          fill="#FFFFFF"
          className="motoluv-font"
          fontSize="92"
          letterSpacing="4"
        >
          MOTO
        </text>

        {/* Red Pill / Container behind LUV */}
        <rect
          x="320"
          y="8"
          width="210"
          height="92"
          rx="18"
          ry="18"
          fill="#E10600"
        />

        {/* LUV Text in Crisp White */}
        <text
          x="425"
          y="88"
          fill="#FFFFFF"
          className="motoluv-font"
          fontSize="92"
          letterSpacing="3"
          textAnchor="middle"
        >
          LUV
        </text>
      </g>

      {/* Slogan row if requested */}
      {showSlogan && (
        <text
          x="340"
          y="170"
          fill="#E10600"
          className="motoluv-font"
          fontSize="26"
          letterSpacing="10"
          textAnchor="middle"
        >
          SUBE CONECTA RUEDA
        </text>
      )}
    </svg>
  );
};

export default MotoluvLogo;
