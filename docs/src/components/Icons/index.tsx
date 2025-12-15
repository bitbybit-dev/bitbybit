import React from "react";

interface IconProps {
  size?: number;
  color?: string;
  className?: string;
}

const defaultColor = "#f0cebb";
const defaultSize = 48;

export const RocketIcon: React.FC<IconProps> = ({ size = defaultSize, color = defaultColor, className }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className}>
    <path d="M32 8C32 8 22 18 22 32C22 38 24 43 27 47L22 52L27 57L32 52L37 57L42 52L37 47C40 43 42 38 42 32C42 18 32 8 32 8Z" 
          stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="32" cy="28" r="4" fill={color}/>
    <path d="M22 32L14 36L18 42L22 38" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M42 32L50 36L46 42L42 38" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M27 52L32 58L37 52" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
  </svg>
);

export const CodeIcon: React.FC<IconProps> = ({ size = defaultSize, color = defaultColor, className }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className}>
    {/* Code brackets </> */}
    <path d="M24 20L12 32L24 44" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M40 20L52 32L40 44" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M36 14L28 50" stroke={color} strokeWidth="2.5" strokeLinecap="round"/>
    {/* Decorative dots */}
    <circle cx="8" cy="32" r="2" fill={color} opacity="0.5"/>
    <circle cx="56" cy="32" r="2" fill={color} opacity="0.5"/>
  </svg>
);

export const RingIcon: React.FC<IconProps> = ({ size = defaultSize, color = defaultColor, className }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className}>
    {/* Ring band - ellipse for 3D effect */}
    <ellipse cx="32" cy="40" rx="16" ry="8" stroke={color} strokeWidth="2.5"/>
    <ellipse cx="32" cy="40" rx="10" ry="5" stroke={color} strokeWidth="1.5" opacity="0.5"/>
    {/* Ring thickness */}
    <path d="M16 40V36C16 32 23 28 32 28C41 28 48 32 48 36V40" stroke={color} strokeWidth="2.5"/>
    {/* Gem setting */}
    <path d="M26 28L32 16L38 28" stroke={color} strokeWidth="2" strokeLinejoin="round"/>
    <path d="M26 28H38" stroke={color} strokeWidth="2"/>
    {/* Gem facets */}
    <path d="M32 16L29 24" stroke={color} strokeWidth="1.5"/>
    <path d="M32 16L35 24" stroke={color} strokeWidth="1.5"/>
    <path d="M29 24L32 28L35 24" stroke={color} strokeWidth="1.5"/>
    {/* Gem top */}
    <circle cx="32" cy="16" r="3" fill={color}/>
    {/* Sparkles */}
    <path d="M22 18L24 20" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M40 20L42 18" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
    <circle cx="20" cy="16" r="1" fill={color}/>
    <circle cx="44" cy="16" r="1" fill={color}/>
  </svg>
);

export const CadIcon: React.FC<IconProps> = ({ size = defaultSize, color = defaultColor, className }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className}>
    <rect x="12" y="12" width="40" height="40" rx="4" stroke={color} strokeWidth="2.5"/>
    <path d="M20 32H44" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <path d="M32 20V44" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <circle cx="32" cy="32" r="8" stroke={color} strokeWidth="2"/>
    <circle cx="20" cy="20" r="3" fill={color}/>
    <circle cx="44" cy="20" r="3" fill={color}/>
    <circle cx="20" cy="44" r="3" fill={color}/>
    <circle cx="44" cy="44" r="3" fill={color}/>
  </svg>
);

export const ArtIcon: React.FC<IconProps> = ({ size = defaultSize, color = defaultColor, className }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className}>
    <circle cx="32" cy="32" r="20" stroke={color} strokeWidth="2.5"/>
    <path d="M32 12C32 12 44 24 44 32C44 40 38 48 32 48C26 48 20 40 20 32C20 24 32 12 32 12Z" 
          stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <path d="M22 22L42 42" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeDasharray="3 3"/>
    <path d="M42 22L22 42" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeDasharray="3 3"/>
    <circle cx="32" cy="32" r="4" fill={color}/>
  </svg>
);

export const PrinterIcon: React.FC<IconProps> = ({ size = defaultSize, color = defaultColor, className }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className}>
    {/* 3D Printer frame */}
    <path d="M12 20V52H52V20" stroke={color} strokeWidth="2.5" strokeLinejoin="round"/>
    <path d="M12 20L20 12H44L52 20" stroke={color} strokeWidth="2.5" strokeLinejoin="round"/>
    <path d="M20 12V20H44" stroke={color} strokeWidth="2" strokeLinejoin="round"/>
    {/* Print bed */}
    <rect x="18" y="44" width="28" height="4" stroke={color} strokeWidth="2"/>
    {/* Extruder/nozzle */}
    <rect x="28" y="24" width="8" height="6" fill={color}/>
    <path d="M32 30V36" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    {/* Printed object (layer lines) */}
    <path d="M26 44V38H38V44" stroke={color} strokeWidth="1.5"/>
    <path d="M26 41H38" stroke={color} strokeWidth="1" opacity="0.5"/>
    <path d="M26 39H38" stroke={color} strokeWidth="1" opacity="0.5"/>
    {/* Vertical rails */}
    <path d="M16 20V48" stroke={color} strokeWidth="1.5"/>
    <path d="M48 20V48" stroke={color} strokeWidth="1.5"/>
  </svg>
);

export const GamepadIcon: React.FC<IconProps> = ({ size = defaultSize, color = defaultColor, className }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className}>
    <path d="M16 24C12 24 8 28 8 34V38C8 42 12 46 16 46H20L24 42H40L44 46H48C52 46 56 42 56 38V34C56 28 52 24 48 24H16Z" 
          stroke={color} strokeWidth="2.5" strokeLinejoin="round"/>
    <path d="M20 32V38" stroke={color} strokeWidth="2.5" strokeLinecap="round"/>
    <path d="M17 35H23" stroke={color} strokeWidth="2.5" strokeLinecap="round"/>
    <circle cx="42" cy="32" r="2.5" fill={color}/>
    <circle cx="48" cy="36" r="2.5" fill={color}/>
    <path d="M28 28H36" stroke={color} strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

export const SofaIcon: React.FC<IconProps> = ({ size = defaultSize, color = defaultColor, className }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className}>
    {/* Sofa back */}
    <path d="M12 24C12 20 15 18 18 18H46C49 18 52 20 52 24V32H12V24Z" stroke={color} strokeWidth="2.5" strokeLinejoin="round"/>
    {/* Armrests */}
    <path d="M8 28C8 26 10 24 12 24V40C10 40 8 38 8 36V28Z" stroke={color} strokeWidth="2" fill={color} opacity="0.3"/>
    <path d="M56 28C56 26 54 24 52 24V40C54 40 56 38 56 36V28Z" stroke={color} strokeWidth="2" fill={color} opacity="0.3"/>
    {/* Seat cushion */}
    <rect x="12" y="32" width="40" height="10" rx="2" stroke={color} strokeWidth="2.5"/>
    {/* Cushion detail */}
    <path d="M32 32V42" stroke={color} strokeWidth="1.5" strokeDasharray="2 2"/>
    {/* Legs */}
    <path d="M16 42V48" stroke={color} strokeWidth="3" strokeLinecap="round"/>
    <path d="M48 42V48" stroke={color} strokeWidth="3" strokeLinecap="round"/>
    {/* Back cushion details */}
    <path d="M22 22V28" stroke={color} strokeWidth="1.5" opacity="0.5"/>
    <path d="M32 22V28" stroke={color} strokeWidth="1.5" opacity="0.5"/>
    <path d="M42 22V28" stroke={color} strokeWidth="1.5" opacity="0.5"/>
  </svg>
);

export const BuildingIcon: React.FC<IconProps> = ({ size = defaultSize, color = defaultColor, className }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className}>
    <path d="M12 52H52" stroke={color} strokeWidth="2.5" strokeLinecap="round"/>
    <path d="M16 52V20L32 10L48 20V52" stroke={color} strokeWidth="2.5" strokeLinejoin="round"/>
    <rect x="24" y="24" width="6" height="6" stroke={color} strokeWidth="1.5"/>
    <rect x="34" y="24" width="6" height="6" stroke={color} strokeWidth="1.5"/>
    <rect x="24" y="34" width="6" height="6" stroke={color} strokeWidth="1.5"/>
    <rect x="34" y="34" width="6" height="6" stroke={color} strokeWidth="1.5"/>
    <path d="M28 52V44H36V52" stroke={color} strokeWidth="2" strokeLinejoin="round"/>
    <circle cx="32" cy="16" r="2" fill={color}/>
  </svg>
);

export const OcctIcon: React.FC<IconProps> = ({ size = defaultSize, color = defaultColor, className }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className}>
    <ellipse cx="32" cy="32" rx="20" ry="10" stroke={color} strokeWidth="2.5"/>
    <ellipse cx="32" cy="32" rx="20" ry="10" stroke={color} strokeWidth="2.5" transform="rotate(60 32 32)"/>
    <ellipse cx="32" cy="32" rx="20" ry="10" stroke={color} strokeWidth="2.5" transform="rotate(120 32 32)"/>
    <circle cx="32" cy="32" r="6" fill={color}/>
  </svg>
);

export const BabylonIcon: React.FC<IconProps> = ({ size = defaultSize, color = defaultColor, className }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className}>
    <polygon points="32,10 52,24 52,44 32,54 12,44 12,24" stroke={color} strokeWidth="2.5" strokeLinejoin="round"/>
    <polygon points="32,18 44,26 44,38 32,46 20,38 20,26" fill={color} opacity="0.3"/>
    <polygon points="32,24 38,28 38,36 32,40 26,36 26,28" fill={color}/>
    <line x1="32" y1="10" x2="32" y2="24" stroke={color} strokeWidth="1.5"/>
    <line x1="52" y1="24" x2="38" y2="28" stroke={color} strokeWidth="1.5"/>
    <line x1="12" y1="24" x2="26" y2="28" stroke={color} strokeWidth="1.5"/>
  </svg>
);

export const JscadIcon: React.FC<IconProps> = ({ size = defaultSize, color = defaultColor, className }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className}>
    <rect x="16" y="20" width="20" height="20" stroke={color} strokeWidth="2.5" transform="rotate(-10 16 20)"/>
    <circle cx="42" cy="36" r="10" stroke={color} strokeWidth="2.5"/>
    <path d="M20 48L32 56L44 48" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="24" cy="28" r="3" fill={color}/>
    <circle cx="42" cy="36" r="4" fill={color}/>
  </svg>
);

export const NurbsIcon: React.FC<IconProps> = ({ size = defaultSize, color = defaultColor, className }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className}>
    <path d="M12 44C12 44 22 20 32 32C42 44 52 20 52 20" stroke={color} strokeWidth="2.5" strokeLinecap="round"/>
    <circle cx="12" cy="44" r="4" fill={color}/>
    <circle cx="32" cy="32" r="4" fill={color}/>
    <circle cx="52" cy="20" r="4" fill={color}/>
    <path d="M12 44L22 24" stroke={color} strokeWidth="1.5" strokeDasharray="3 3" opacity="0.5"/>
    <path d="M42 40L52 20" stroke={color} strokeWidth="1.5" strokeDasharray="3 3" opacity="0.5"/>
    <circle cx="22" cy="24" r="2" stroke={color} strokeWidth="1.5"/>
    <circle cx="42" cy="40" r="2" stroke={color} strokeWidth="1.5"/>
  </svg>
);

export const OpenSourceIcon: React.FC<IconProps> = ({ size = defaultSize, color = defaultColor, className }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className}>
    {/* Open hands / sharing symbol */}
    <circle cx="32" cy="32" r="20" stroke={color} strokeWidth="2.5"/>
    {/* Branch/fork symbol */}
    <circle cx="32" cy="20" r="4" stroke={color} strokeWidth="2"/>
    <circle cx="22" cy="44" r="4" stroke={color} strokeWidth="2"/>
    <circle cx="42" cy="44" r="4" stroke={color} strokeWidth="2"/>
    {/* Connecting lines */}
    <path d="M32 24V32" stroke={color} strokeWidth="2"/>
    <path d="M32 32L22 40" stroke={color} strokeWidth="2"/>
    <path d="M32 32L42 40" stroke={color} strokeWidth="2"/>
    {/* Center node */}
    <circle cx="32" cy="32" r="3" fill={color}/>
  </svg>
);

export const PlaygroundIcon: React.FC<IconProps> = ({ size = defaultSize, color = defaultColor, className }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className}>
    <rect x="12" y="12" width="40" height="40" rx="4" stroke={color} strokeWidth="2.5"/>
    <path d="M12 24H52" stroke={color} strokeWidth="2"/>
    <circle cx="20" cy="18" r="2" fill={color}/>
    <circle cx="28" cy="18" r="2" fill={color}/>
    <path d="M20 32L28 38L20 44" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M34 44H44" stroke={color} strokeWidth="2.5" strokeLinecap="round"/>
  </svg>
);

export const BookIcon: React.FC<IconProps> = ({ size = defaultSize, color = defaultColor, className }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className}>
    {/* Book cover */}
    <path d="M12 12H48C50 12 52 14 52 16V52H16C14 52 12 50 12 48V12Z" stroke={color} strokeWidth="2.5" strokeLinejoin="round"/>
    {/* Book spine */}
    <path d="M12 12V48C12 50 14 52 16 52" stroke={color} strokeWidth="2.5"/>
    <path d="M16 12V48" stroke={color} strokeWidth="1.5"/>
    {/* Pages */}
    <path d="M20 16H44" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
    <path d="M20 22H40" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
    <path d="M20 28H42" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
    <path d="M20 34H38" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
    {/* Bookmark */}
    <path d="M40 12V24L44 20L48 24V12" fill={color} opacity="0.7"/>
    {/* Bottom page edge */}
    <path d="M16 52H52" stroke={color} strokeWidth="2"/>
  </svg>
);

export const TargetIcon: React.FC<IconProps> = ({ size = defaultSize, color = defaultColor, className }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className}>
    <circle cx="32" cy="32" r="20" stroke={color} strokeWidth="2.5"/>
    <circle cx="32" cy="32" r="12" stroke={color} strokeWidth="2"/>
    <circle cx="32" cy="32" r="4" fill={color}/>
    <path d="M32 8V16" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <path d="M32 48V56" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <path d="M8 32H16" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <path d="M48 32H56" stroke={color} strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

export const BlocksIcon: React.FC<IconProps> = ({ size = defaultSize, color = defaultColor, className }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className}>
    {/* Puzzle-like blocks for Blockly */}
    <rect x="10" y="12" width="20" height="16" rx="2" stroke={color} strokeWidth="2.5"/>
    <rect x="34" y="12" width="20" height="16" rx="2" stroke={color} strokeWidth="2.5"/>
    <rect x="10" y="36" width="20" height="16" rx="2" stroke={color} strokeWidth="2.5"/>
    <rect x="34" y="36" width="20" height="16" rx="2" stroke={color} strokeWidth="2.5"/>
    {/* Connection notches */}
    <path d="M26 28V36" stroke={color} strokeWidth="2"/>
    <path d="M38 28V36" stroke={color} strokeWidth="2"/>
    <circle cx="20" cy="20" r="3" fill={color}/>
    <circle cx="44" cy="20" r="3" fill={color}/>
    <circle cx="20" cy="44" r="3" fill={color}/>
    <circle cx="44" cy="44" r="3" fill={color}/>
  </svg>
);

export const CubeIcon: React.FC<IconProps> = ({ size = defaultSize, color = defaultColor, className }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className}>
    <path d="M32 10L52 22V42L32 54L12 42V22L32 10Z" stroke={color} strokeWidth="2.5" strokeLinejoin="round"/>
    <path d="M32 10V32" stroke={color} strokeWidth="2"/>
    <path d="M32 32L52 22" stroke={color} strokeWidth="2"/>
    <path d="M32 32L12 22" stroke={color} strokeWidth="2"/>
    <path d="M32 32V54" stroke={color} strokeWidth="2" strokeDasharray="4 2"/>
  </svg>
);

export const UserPlusIcon: React.FC<IconProps> = ({ size = defaultSize, color = defaultColor, className }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className}>
    {/* User silhouette */}
    <circle cx="28" cy="20" r="10" stroke={color} strokeWidth="2.5"/>
    <path d="M10 52C10 42 18 34 28 34C32 34 36 35 39 37" stroke={color} strokeWidth="2.5" strokeLinecap="round"/>
    {/* Plus sign */}
    <circle cx="48" cy="44" r="12" stroke={color} strokeWidth="2.5"/>
    <path d="M48 38V50" stroke={color} strokeWidth="2.5" strokeLinecap="round"/>
    <path d="M42 44H54" stroke={color} strokeWidth="2.5" strokeLinecap="round"/>
  </svg>
);

export const MonacoIcon: React.FC<IconProps> = ({ size = defaultSize, color = defaultColor, className }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className}>
    {/* Editor window */}
    <rect x="8" y="10" width="48" height="44" rx="4" stroke={color} strokeWidth="2.5"/>
    <path d="M8 20H56" stroke={color} strokeWidth="2"/>
    {/* Window controls */}
    <circle cx="16" cy="15" r="2" fill={color}/>
    <circle cx="24" cy="15" r="2" fill={color}/>
    {/* Code lines */}
    <path d="M16 28H28" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <path d="M16 36H36" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <path d="M16 44H24" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    {/* Cursor */}
    <path d="M40 28V44" stroke={color} strokeWidth="2.5" strokeLinecap="round"/>
    {/* Line numbers */}
    <path d="M12 28V28.1" stroke={color} strokeWidth="2" strokeLinecap="round" opacity="0.5"/>
    <path d="M12 36V36.1" stroke={color} strokeWidth="2" strokeLinecap="round" opacity="0.5"/>
    <path d="M12 44V44.1" stroke={color} strokeWidth="2" strokeLinecap="round" opacity="0.5"/>
  </svg>
);
