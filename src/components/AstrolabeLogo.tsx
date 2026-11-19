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
      {/* Pure Monochrome White-on-Black Astrolabe Emblem */}
      <div
        className="relative flex items-center justify-center rounded-xl bg-black text-white shadow-sm ring-1 ring-black/20 dark:ring-white/20 shrink-0"
        style={{ width: size, height: size }}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-[68%] h-[68%]"
        >
          {/* Top suspension ring (shackle) */}
          <circle cx="12" cy="3.5" r="1.5" />
          {/* Outer ring (mater) */}
          <circle cx="12" cy="13.5" r="8.5" />
          {/* Inner celestial horizon ring */}
          <ellipse cx="12" cy="13.5" rx="5.5" ry="3.5" strokeDasharray="1 1.5" />
          {/* Meridian axis crosshairs */}
          <line x1="12" y1="5" x2="12" y2="22" strokeWidth="1.35" />
          <line x1="3.5" y1="13.5" x2="20.5" y2="13.5" strokeWidth="1.35" />
          {/* Astrolabe solar pointer / alidade (pure white) */}
          <line x1="6.5" y1="19" x2="17.5" y2="8" strokeWidth="2.1" stroke="currentColor" />
          {/* Central pivot (white on black) */}
          <circle cx="12" cy="13.5" r="1.5" fill="currentColor" stroke="black" strokeWidth="0.8" />
        </svg>
      </div>

      {showText && (
        <div className="flex items-center gap-2">
          <span className="font-serif-astrolabe text-2xl tracking-tight font-bold text-zinc-950 dark:text-white leading-none">
            Astrolabe
          </span>
          <span className="inline-flex items-center justify-center text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded-md bg-black text-white border border-black dark:border-white/25 font-mono-astrolabe leading-none">
            3.5
          </span>
        </div>
      )}
    </div>
  );
};
