import React from 'react';

interface AstrolabeLogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
}

export const AstrolabeLogo: React.FC<AstrolabeLogoProps> = ({
  className = '',
  size = 28,
  showText = false,
}) => {
  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Astrolabe Celestial Instrument Emblem */}
      <div
        className="relative flex items-center justify-center rounded-xl bg-gradient-to-br from-[#D95D39] via-[#C8522E] to-[#993416] text-[#FAF6EE] shadow-sm ring-1 ring-black/10 shrink-0"
        style={{ width: size, height: size }}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-[66%] h-[66%]"
        >
          {/* Top suspension ring (shackle) */}
          <circle cx="12" cy="3.5" r="1.5" />
          {/* Outer ring (mater) */}
          <circle cx="12" cy="13.5" r="8.5" />
          {/* Inner celestial horizon ring */}
          <ellipse cx="12" cy="13.5" rx="5.5" ry="3.5" strokeDasharray="1 1.5" />
          {/* Meridian axis crosshairs */}
          <line x1="12" y1="5" x2="12" y2="22" strokeWidth="1.4" />
          <line x1="3.5" y1="13.5" x2="20.5" y2="13.5" strokeWidth="1.4" />
          {/* Astrolabe solar pointer / alidade */}
          <line x1="6.5" y1="19" x2="17.5" y2="8" strokeWidth="2.2" stroke="#FFD166" />
          {/* Central pivot gem */}
          <circle cx="12" cy="13.5" r="1.5" fill="#FFD166" stroke="#993416" strokeWidth="0.8" />
        </svg>
      </div>

      {showText && (
        <div className="flex items-baseline gap-1.5">
          <span className="font-serif-castle text-2xl tracking-tight font-bold text-[#1F1D1A] dark:text-[#EDEAE4]">
            Astrolabe
          </span>
          <span className="text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded-full bg-[#D95D39]/10 text-[#D95D39] dark:bg-[#D95D39]/20 font-mono-castle">
            3.5
          </span>
        </div>
      )}
    </div>
  );
};

export const CastleLogo = AstrolabeLogo;
