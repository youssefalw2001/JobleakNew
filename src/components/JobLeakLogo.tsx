/**
 * JobLeakLogo — shared brand component.
 * Used in Navbar, Footer, Login, and anywhere else the logo appears.
 *
 * Variants:
 *   full   — icon + wordmark + subtitle (default)
 *   mark   — icon only (small contexts)
 *   inline — icon + wordmark, no subtitle
 */

import React from 'react';

interface JobLeakLogoProps {
  variant?: 'full' | 'mark' | 'inline';
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  className?: string;
}

// Icon sizes per variant
const iconSizes = { sm: 'w-8 h-8', md: 'w-10 h-10', lg: 'w-13 h-13' };
const textSizes = { sm: 'text-lg',  md: 'text-2xl',  lg: 'text-3xl' };
const subSizes  = { sm: 'text-[8px]', md: 'text-[9px]', lg: 'text-[10px]' };

/**
 * The mark — a custom SVG signal/radar glyph:
 *   - Outer arc  (top-open radar sweep)
 *   - Middle arc
 *   - Inner dot  (origin pulse)
 *   - Diagonal strike line (the "leak" / signal beam)
 * Everything in white so the gradient container provides the colour.
 */
function JobLeakMark({ iconSize }: { iconSize: string }) {
  return (
    <div
      className={`${iconSize} rounded-xl bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-blue-600/40 border border-white/10 shrink-0 relative overflow-hidden`}
    >
      {/* Subtle inner shine */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />

      <svg
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-[58%] h-[58%] relative z-10"
        aria-hidden="true"
      >
        {/* Outer radar arc */}
        <path
          d="M5 20 A13 13 0 0 1 27 20"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.4"
        />
        {/* Middle arc */}
        <path
          d="M9 20 A9 9 0 0 1 23 20"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.7"
        />
        {/* Inner arc */}
        <path
          d="M13 20 A5 5 0 0 1 19 20"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
        />
        {/* Origin dot */}
        <circle cx="16" cy="20" r="2" fill="white" />
        {/* Signal beam — the "leak" strike, upper-right */}
        <line
          x1="16" y1="20"
          x2="26" y2="7"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.9"
        />
        {/* Beam tip dot */}
        <circle cx="26" cy="7" r="1.5" fill="white" />
      </svg>
    </div>
  );
}

export default function JobLeakLogo({
  variant = 'full',
  size = 'md',
  onClick,
  className = '',
}: JobLeakLogoProps) {
  const iconSize = iconSizes[size];
  const textSize = textSizes[size];
  const subSize  = subSizes[size];

  const content = (
    <div className={`flex items-center gap-3 ${className}`}>
      <JobLeakMark iconSize={iconSize} />

      {variant !== 'mark' && (
        <div className="flex flex-col items-start leading-none">
          {/* Wordmark */}
          <span className={`${textSize} font-display font-black tracking-tight text-white leading-none`}>
            Job
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
              Leak
            </span>
          </span>

          {/* Subtitle — only on 'full' */}
          {variant === 'full' && (
            <span className={`${subSize} font-mono font-bold text-slate-500 uppercase tracking-widest mt-1 leading-none`}>
              Intelligence Platform
            </span>
          )}
        </div>
      )}
    </div>
  );

  if (onClick) {
    return (
      <button
        onClick={onClick}
        className="focus:outline-none focus:ring-2 focus:ring-blue-500/50 rounded-xl p-0.5 transition-all group hover:opacity-90 cursor-pointer"
        aria-label="JobLeak — go home"
      >
        {content}
      </button>
    );
  }

  return content;
}
